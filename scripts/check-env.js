#!/usr/bin/env node
/*
 Simple .env validator for game_hub_nest
 - Loads .env then config/space-engineers/.env (override)
 - Validates required keys, types, and common pitfalls
 - Exits with non-zero when errors are found
*/

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const jwtLib = require('jsonwebtoken');
const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');

// Pretty printing helpers (no deps)
const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const args = new Set(process.argv.slice(2));
const STRICT = args.has('--strict');
const ONLINE = args.has('--online');

function loadEnvFiles() {
  const root = process.cwd();
  const baseEnv = path.join(root, '.env');
  const seEnv = path.join(root, 'config/space-engineers/.env');

  if (fs.existsSync(baseEnv)) {
    dotenv.config({ path: baseEnv, override: false });
  }
  if (fs.existsSync(seEnv)) {
    dotenv.config({ path: seEnv, override: true }); // match app's override order
  }
}

// Type guards
const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isInt = (v) => Number.isInteger(Number(v)) && String(Number(v)) === String(parseInt(v, 10));
const isBoolStr = (v) => typeof v === 'string' && ['true', 'false'].includes(v.toLowerCase());
const isUrl = (v) => {
  try { new URL(v); return true; } catch { return false; }
};

// Known formats
const isAwsRegion = (v) => /^[a-z]{2}-[a-z]+-\d$/.test(String(v || ''));
const isS3Bucket = (v) =>
  typeof v === 'string' &&
  v.length >= 3 &&
  v.length <= 63 &&
  /^[a-z0-9.-]+$/.test(v) &&
  !/^\d+$/.test(v) &&
  !/[.]{2,}/.test(v) &&
  !/^-|-$/.test(v) &&
  !/^\.|\.$/.test(v);
const isJwtExpiresIn = (v) => /^(\d+)(ms|s|m|h|d|w|y)?$/.test(String(v || ''));
const isLogLevel = (v) => ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'].includes(String(v || '').toLowerCase());
const isSteamApiKey = (v) => /^[0-9A-F]{32}$/i.test(String(v || ''));

function validateDomainLike(v) {
  // DOMAIN should be host or host:port (no scheme)
  if (!isNonEmpty(v)) return false;
  if (/^https?:\/\//i.test(v)) return false;
  // Very loose: allow letters, digits, dots, dashes and optional :port
  return /^[A-Za-z0-9.-]+(:\d{2,5})?$/.test(v);
}

// Collector
const errors = [];
const warnings = [];
function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function requireNonEmpty(key, friendlyName = key) {
  const val = process.env[key];
  if (!isNonEmpty(val)) err(`${friendlyName} (${key}) is required but missing or empty`);
  return val;
}

function requireAtLeastOne(keys, label) {
  const found = keys.find((k) => isNonEmpty(process.env[k]));
  if (!found) err(`${label} requires at least one of: ${keys.join(', ')}`);
  return found;
}

function requireInt(key, friendlyName = key) {
  const val = requireNonEmpty(key, friendlyName);
  if (isNonEmpty(val) && !isInt(val)) err(`${friendlyName} (${key}) must be an integer, got: ${val}`);
}

function requireBool(key, friendlyName = key) {
  const val = requireNonEmpty(key, friendlyName);
  if (isNonEmpty(val) && !isBoolStr(val)) err(`${friendlyName} (${key}) must be 'true' or 'false', got: ${val}`);
}

function optionalUrl(key, friendlyName = key) {
  const val = process.env[key];
  if (isNonEmpty(val) && !isUrl(val)) warn(`${friendlyName} (${key}) looks invalid URL: ${val}`);
}

function optionalCsvUrls(key, friendlyName = key) {
  const val = process.env[key];
  if (!isNonEmpty(val)) return;
  const parts = val.split(',').map((s) => s.trim()).filter(Boolean);
  const invalid = parts.filter((p) => !isUrl(p));
  if (invalid.length) warn(`${friendlyName} (${key}) contains invalid URL(s): ${invalid.join(', ')}`);
}

async function main() {
  console.log(colors.cyan(colors.bold('Checking environment configuration...')));
  loadEnvFiles();

  const NODE_ENV = process.env.NODE_ENV || 'development';

  // Database
  requireNonEmpty('DB_HOST', 'Database host');
  requireInt('DB_PORT', 'Database port');
  requireNonEmpty('DB_USER', 'Database user');
  requireNonEmpty('DB_PASSWORD', 'Database password');
  requireNonEmpty('DB_NAME', 'Database name');
  if (isNonEmpty(process.env.DB_SSL) && !isBoolStr(process.env.DB_SSL)) {
    err(`DB_SSL must be 'true' or 'false' when set, got: ${process.env.DB_SSL}`);
  }

  // Auth / JWT
  const jwt = requireNonEmpty('JWT_SECRET', 'JWT secret');
  if (isNonEmpty(jwt) && jwt.length < 16) warn('JWT_SECRET is short; consider 32+ chars for production.');
  if (isNonEmpty(process.env.JWT_EXPIRES_IN) && !isJwtExpiresIn(process.env.JWT_EXPIRES_IN)) {
    err(`JWT_EXPIRES_IN has invalid format (e.g., 3600s, 7d). Got: ${process.env.JWT_EXPIRES_IN}`);
  }
  // Offline usability test: sign and verify
  if (isNonEmpty(jwt)) {
    try {
      const token = jwtLib.sign({ sub: 'env-check', iat: Math.floor(Date.now() / 1000) }, jwt, {
        expiresIn: '60s',
        algorithm: 'HS256',
      });
      const decoded = jwtLib.verify(token, jwt, { algorithms: ['HS256'] });
      if (!decoded) throw new Error('verify returned empty');
    } catch (e) {
      err(`JWT_SECRET failed sign/verify: ${e && e.message ? e.message : String(e)}`);
    }
  }

  // Steam
  const steamKey = requireNonEmpty('STEAM_API_KEY', 'Steam API key');
  if (isNonEmpty(steamKey) && !isSteamApiKey(steamKey)) {
    warn('STEAM_API_KEY format looks unusual. Expected a 32-hex key from Steam Web API.');
  }
  optionalUrl('RETURN_URL', 'Steam return URL');
  optionalUrl('REALM', 'Steam realm');

  // Server
  requireInt('PORT', 'App port');
  if (!isNonEmpty(process.env.HOST)) warn('HOST is not set; default may be used.');
  optionalUrl('BASE_URL', 'Base URL');
  const domain = process.env.DOMAIN;
  if (isNonEmpty(domain) && !validateDomainLike(domain)) warn(`DOMAIN should be host or host:port (no scheme). Got: ${domain}`);
  if (isNonEmpty(process.env.LOG_LEVEL) && !isLogLevel(process.env.LOG_LEVEL)) {
    warn(`LOG_LEVEL is not a known level (error,warn,info,http,verbose,debug,silly). Got: ${process.env.LOG_LEVEL}`);
  }

  // CORS
  optionalCsvUrls('CORS_ORIGINS', 'CORS allowed origins');

  // Space Engineers ingest
  if (isNonEmpty(process.env.SE_AUTO_REGISTER_SERVERS) && !isBoolStr(process.env.SE_AUTO_REGISTER_SERVERS)) {
    err(`SE_AUTO_REGISTER_SERVERS must be 'true' or 'false' when set, got: ${process.env.SE_AUTO_REGISTER_SERVERS}`);
  }
  if (!isNonEmpty(process.env.SE_INGEST_API_KEY)) {
    warn('SE_INGEST_API_KEY not set; ingest is unauthenticated unless handled elsewhere.');
  }

  // Hangar / S3 (Space Engineers)
  const bucketKey = requireAtLeastOne(['SE_HANGAR_S3_BUCKET', 'S3_BUCKET'], 'S3 bucket for Hangar');
  if (!bucketKey) {
    warn('Space Engineers hangar features may fail without an S3 bucket configured.');
  }
  if (bucketKey) {
    const bucketVal = process.env[bucketKey];
    if (isNonEmpty(bucketVal) && !isS3Bucket(bucketVal)) {
      err(`S3 bucket name (${bucketKey}) is invalid per S3 naming rules: ${bucketVal}`);
    }
    if (!isNonEmpty(process.env.AWS_REGION) && !isNonEmpty(process.env.SE_HANGAR_S3_REGION)) {
      warn('AWS region not set (AWS_REGION or SE_HANGAR_S3_REGION). Default may not match your bucket.');
    }
    const region = process.env.AWS_REGION || process.env.SE_HANGAR_S3_REGION;
    if (isNonEmpty(region) && !isAwsRegion(region)) {
      warn(`AWS region format looks wrong (e.g., ap-northeast-2). Got: ${region}`);
    }
    // Credentials may be provided via IAM; warn only if completely absent
    if (!isNonEmpty(process.env.AWS_ACCESS_KEY_ID) || !isNonEmpty(process.env.AWS_SECRET_ACCESS_KEY)) {
      warn('AWS credentials not set in env; ensure IAM role/instance profile or another credential provider is available.');
    }
  }

  // Valheim (optional)
  if (isNonEmpty(process.env.VALHEIM_SERVER_PORT) && !isInt(process.env.VALHEIM_SERVER_PORT)) {
    warn(`VALHEIM_SERVER_PORT should be an integer, got: ${process.env.VALHEIM_SERVER_PORT}`);
  }

  // Production sanity checks
  if (NODE_ENV === 'production') {
    // Avoid localhost values
    const prodUrlKeys = [
      ['BASE_URL', process.env.BASE_URL],
      ['RETURN_URL', process.env.RETURN_URL],
      ['REALM', process.env.REALM],
    ];
    for (const [k, v] of prodUrlKeys) {
      if (isNonEmpty(v) && /localhost|127\.0\.0\.1/i.test(v)) {
        err(`${k} points to localhost in production: ${v}`);
      }
    }
    if (!isNonEmpty(process.env.DOMAIN)) {
      warn('DOMAIN is not set in production; some features may rely on a proper host name.');
    }
    if (process.env.DB_SSL !== 'true') {
      warn('DB_SSL is not true in production; set DB_SSL=true unless you are certain SSL is unnecessary.');
    }
  }

  // Optional online checks
  if (ONLINE) {
    console.log(colors.cyan('\nRunning online usability checks...'));
    const pending = [];
    // Steam API key validation via a harmless request
    const steamKey = process.env.STEAM_API_KEY;
    if (isNonEmpty(steamKey)) {
      const testSteamId = '76561197960434622'; // Valve test account
      pending.push(
        axios
          .get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/', {
            params: { key: steamKey, steamids: testSteamId },
            timeout: 5000,
            validateStatus: () => true,
          })
          .then((resp) => {
            if (resp.status === 200) {
              // Some invalid keys may still return 200 but with an error payload; check common shape
              if (resp.data && resp.data.response) {
                // Consider it usable if API responds with structured payload
                console.log(colors.green('✓ STEAM_API_KEY accepted by Steam Web API'));
              } else {
                warn('STEAM_API_KEY response shape unexpected; key may be limited or invalid.');
              }
            } else if (resp.status === 401 || resp.status === 403) {
              err(`STEAM_API_KEY appears invalid (HTTP ${resp.status}).`);
            } else {
              warn(`Steam API check returned HTTP ${resp.status}; could not confirm key usability.`);
            }
          })
          .catch((e) => {
            warn(`Steam API online check failed: ${e && e.message ? e.message : String(e)}`);
          })
      );
    }

    // AWS S3: HeadBucket to confirm access
    const bucket = process.env.SE_HANGAR_S3_BUCKET || process.env.S3_BUCKET;
    const region = process.env.SE_HANGAR_S3_REGION || process.env.AWS_REGION || 'ap-northeast-2';
    if (isNonEmpty(bucket)) {
      try {
        const cfg = { region };
        if (isNonEmpty(process.env.AWS_ACCESS_KEY_ID) && isNonEmpty(process.env.AWS_SECRET_ACCESS_KEY)) {
          cfg.credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          };
        }
        const s3 = new S3Client(cfg);
        pending.push(
          s3
            .send(new HeadBucketCommand({ Bucket: bucket }))
            .then(() => {
              console.log(colors.green(`✓ AWS S3 access confirmed for bucket "${bucket}"`));
            })
            .catch((e) => {
              const msg = e && e.name ? `${e.name}: ${e.message}` : String(e);
              if (/NotFound|NoSuchBucket|404/.test(msg)) {
                err(`AWS S3 bucket not found or inaccessible: ${bucket} (${msg})`);
              } else if (/AccessDenied|Forbidden|403/.test(msg)) {
                err(`AWS credentials lack access to bucket: ${bucket} (${msg})`);
              } else {
                warn(`AWS S3 online check failed: ${msg}`);
              }
            })
        );
      } catch (e) {
        warn(`Could not initialize AWS S3 client: ${e && e.message ? e.message : String(e)}`);
      }
    }

    // Await all online probes before summary
    try {
      await Promise.allSettled(pending);
    } catch {
      // ignore, handled above
    }
  }

  // Summary
  const header = `${errors.length ? colors.red('✖') : colors.green('✔')} Env check finished`;
  console.log(`\n${colors.bold(header)}`);
  if (errors.length) {
    console.log(colors.red(`Errors (${errors.length}):`));
    for (const e of errors) console.log(`  - ${e}`);
  }
  if (warnings.length) {
    console.log(colors.yellow(`Warnings (${warnings.length}):`));
    for (const w of warnings) console.log(`  - ${w}`);
  }

  if (errors.length || (STRICT && warnings.length)) {
    process.exit(1);
  }
}

main();
