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

function main() {
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

  // Steam
  requireNonEmpty('STEAM_API_KEY', 'Steam API key');
  optionalUrl('RETURN_URL', 'Steam return URL');
  optionalUrl('REALM', 'Steam realm');

  // Server
  requireInt('PORT', 'App port');
  if (!isNonEmpty(process.env.HOST)) warn('HOST is not set; default may be used.');
  optionalUrl('BASE_URL', 'Base URL');
  const domain = process.env.DOMAIN;
  if (isNonEmpty(domain) && !validateDomainLike(domain)) warn(`DOMAIN should be host or host:port (no scheme). Got: ${domain}`);

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
    if (!isNonEmpty(process.env.AWS_REGION) && !isNonEmpty(process.env.SE_HANGAR_S3_REGION)) {
      warn('AWS region not set (AWS_REGION or SE_HANGAR_S3_REGION). Default may not match your bucket.');
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
