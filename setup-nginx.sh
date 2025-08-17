#!/usr/bin/env bash

# Game Hub NestJS - Reusable / Idempotent Nginx Setup Script
# Re-run safe: cleans old conflicting configs, (re)deploys HTTP->HTTPS & proxy blocks.

set -euo pipefail
IFS=$'\n\t'

SCRIPT_NAME=$(basename "$0")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Defaults
DOMAIN_DEFAULT="api.snowmuffingame.com"
EMAIL_DEFAULT="admin@snowmuffingame.com"
BACKEND_HOST_DEFAULT="127.0.0.1"
BACKEND_PORT_DEFAULT="4000"
CONFIG_BASENAME="game-hub-nest"
FORCE=0
NO_SSL=0
REISSUE_SSL=0
RESET=0
DOMAIN="${DOMAIN:-}" # allow pre-set via env
EMAIL=""
BACKEND_HOST="${BACKEND_HOST:-$BACKEND_HOST_DEFAULT}"
BACKEND_PORT="${BACKEND_PORT:-$BACKEND_PORT_DEFAULT}"

usage() {
    cat <<USAGE
$SCRIPT_NAME [options]
    --domain=DOMAIN         FQDN (default: $DOMAIN_DEFAULT)
    --email=EMAIL           Certbot email (default: $EMAIL_DEFAULT)
    --backend-host=HOST     Upstream host (default: $BACKEND_HOST_DEFAULT)
    --backend-port=PORT     Upstream port (default: $BACKEND_PORT_DEFAULT)
    --force                 Skip confirmations (non-interactive)
    --no-ssl                Do not configure / request SSL
    --reissue-ssl           Force reissue certificate (delete existing)
    --reset                 Remove old configs for the domain first
    -h|--help               Show this help
USAGE
}

for arg in "$@"; do
    case $arg in
        --domain=*) DOMAIN="${arg#*=}" ;;
        --email=*) EMAIL="${arg#*=}" ;;
        --backend-host=*) BACKEND_HOST="${arg#*=}" ;;
        --backend-port=*) BACKEND_PORT="${arg#*=}" ;;
        --force) FORCE=1 ;;
        --no-ssl) NO_SSL=0; NO_SSL=1 ;;
        --reissue-ssl) REISSUE_SSL=1 ;;
        --reset) RESET=1 ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Unknown option: $arg"; usage; exit 1 ;;
    esac
done

# Load .env last (does not override explicit flags)
if [ -f .env ]; then
    set -a; source .env; set +a || true
fi

DOMAIN=${DOMAIN:-$DOMAIN_DEFAULT}
EMAIL=${EMAIL:-$EMAIL_DEFAULT}

echo "========================================="
echo "🌐 Nginx setup start"
echo "Domain        : $DOMAIN"
echo "Backend       : $BACKEND_HOST:$BACKEND_PORT"
echo "Email         : $EMAIL"
echo "SSL disabled? : $NO_SSL"
echo "Force mode    : $FORCE"
echo "Reset configs : $RESET"
echo "Reissue SSL   : $REISSUE_SSL"
echo "Timestamp     : $TIMESTAMP"
echo "========================================="

confirm() {
    local msg="$1"
    if [ $FORCE -eq 1 ]; then
        return 0
    fi
    read -r -p "$msg (y/N): " ans
    [[ $ans =~ ^[Yy]$ ]]
}

pkg_install() {
    local pkg=$1
    if command -v dnf >/dev/null 2>&1; then sudo dnf install -y "$pkg"; 
    elif command -v yum >/dev/null 2>&1; then sudo yum install -y "$pkg"; 
    elif command -v apt >/dev/null 2>&1; then sudo apt update && sudo apt install -y "$pkg"; 
    elif command -v pacman >/dev/null 2>&1; then sudo pacman -Sy --noconfirm "$pkg"; 
    else echo "❌ Unsupported package manager"; exit 1; fi
}

ensure_nginx() {
    if ! command -v nginx >/dev/null 2>&1; then
        echo "📦 Installing nginx..."
        pkg_install nginx
    else
        echo "✅ nginx present"
    fi
}

ensure_certbot() {
    if [ $NO_SSL -eq 1 ]; then return 0; fi
    if ! command -v certbot >/dev/null 2>&1; then
        echo "📦 Installing certbot + nginx plugin"
        if command -v dnf >/dev/null 2>&1; then
            pkg_install certbot
            pkg_install python3-certbot-nginx || true
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y epel-release
            pkg_install certbot
            pkg_install python3-certbot-nginx || true
        else
            pkg_install certbot
            pkg_install python3-certbot-nginx || true
        fi
    else
        echo "✅ certbot present"
    fi
}

detect_layout() {
    if [ -d /etc/nginx/sites-available ]; then
        LAYOUT="debian"
        CONF_DIR="/etc/nginx/sites-available"
        ENABLED_DIR="/etc/nginx/sites-enabled"
    else
        LAYOUT="rhel"
        CONF_DIR="/etc/nginx/conf.d"
        ENABLED_DIR="/etc/nginx/conf.d"
    fi
    echo "🔍 Layout: $LAYOUT (conf dir: $CONF_DIR)"
}

backup_dir="/tmp/nginx-backups-$TIMESTAMP"
mkdir -p "$backup_dir"

remove_conflicts() {
    echo "🧹 Scanning for existing config referencing $DOMAIN..."
    local hits
    hits=$(grep -R "server_name[[:space:]]\+$DOMAIN" "$CONF_DIR" 2>/dev/null || true)
    if [ -n "$hits" ]; then
        echo "⚠️  Found existing config(s). Backing up to $backup_dir"
        echo "$hits" | awk -F: '{print $1}' | sort -u | while read -r f; do
            [ -f "$f" ] || continue
            cp "$f" "$backup_dir/"$(basename "$f")
            if confirm "Remove old config $f?"; then sudo rm -f "$f"; fi
        done
    else
        echo "✅ No conflicting configs"
    fi
}

disable_default() {
    # Common default files
    for df in /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf; do
        if [ -f "$df" ]; then
            cp "$df" "$backup_dir/" 2>/dev/null || true
            sudo rm -f "$df"
            echo "🚫 Disabled default: $df"
        fi
    done
}

write_config() {
    local target="$CONF_DIR/$CONFIG_BASENAME-$DOMAIN.conf"
    echo "� Writing config -> $target"
    local acme_root="/var/www/certbot"
    sudo mkdir -p "$acme_root"

    cat > /tmp/nginx-domain.conf <<CFG
# Generated by $SCRIPT_NAME at $TIMESTAMP

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    # ACME challenge
    location /.well-known/acme-challenge/ { root $acme_root; }
    location = /health { proxy_pass http://$BACKEND_HOST:$BACKEND_PORT/health; }
    # Redirect to HTTPS if SSL enabled
    $( [ $NO_SSL -eq 1 ] && echo "# SSL disabled: no redirect" || echo "return 301 https://\$host\$request_uri;" )
}

$( if [ $NO_SSL -eq 0 ]; then cat <<SSL
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN/chain.pem;

    # Security headers (basic)
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # Gzip (light)
    gzip on; gzip_types text/plain application/json application/javascript text/css;

    set $upstream "$BACKEND_HOST:$BACKEND_PORT";
    location / {
        proxy_pass http://$BACKEND_HOST:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \${connection_upgrade:-upgrade};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_read_timeout 60s;
    }

    location = /health { proxy_pass http://$BACKEND_HOST:$BACKEND_PORT/health; }
}
SSL
fi )
CFG

    sudo mv /tmp/nginx-domain.conf "$target"
    if [ "$LAYOUT" = "debian" ]; then
        sudo ln -sf "$target" "$ENABLED_DIR/"
    fi
}

test_and_reload() {
    echo "🔍 Testing nginx syntax"; sudo nginx -t
    echo "� Reloading nginx"; sudo systemctl reload nginx || sudo systemctl restart nginx
    sudo systemctl enable nginx >/dev/null 2>&1 || true
    echo "✅ Nginx active: $(systemctl is-active nginx)"
}

issue_cert() {
    [ $NO_SSL -eq 1 ] && return 0
    local live_dir="/etc/letsencrypt/live/$DOMAIN"
    if [ $REISSUE_SSL -eq 1 ] && [ -d "$live_dir" ]; then
        echo "♻️  Reissue requested: backing up & removing existing cert"
        sudo tar -czf "/tmp/cert-$DOMAIN-$TIMESTAMP.tgz" "$live_dir" 2>/dev/null || true
        sudo rm -rf "/etc/letsencrypt/live/$DOMAIN" "/etc/letsencrypt/archive/$DOMAIN" "/etc/letsencrypt/renewal/$DOMAIN.conf" || true
    fi
    if [ ! -d "$live_dir" ]; then
        echo "🔐 Obtaining certificate for $DOMAIN"
        sudo certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" --agree-tos -m "$EMAIL" --non-interactive --quiet || {
            echo "❌ Cert issuance failed"; exit 1; }
    else
        echo "✅ Certificate already exists"
    fi
}

summary() {
    cat <<SUM
=========================================
✅ Completed Nginx Setup
Domain     : $DOMAIN
Backend    : $BACKEND_HOST:$BACKEND_PORT
SSL        : $( [ $NO_SSL -eq 1 ] && echo disabled || echo enabled )
Config Dir : $CONF_DIR
Backups    : $backup_dir
curl test  : curl -I http://${DOMAIN}/health
$( [ $NO_SSL -eq 1 ] || echo "HTTPS test : curl -I https://${DOMAIN}/health" )
=========================================
SUM
}

main() {
    ensure_nginx
    detect_layout
    disable_default
    if [ $RESET -eq 1 ]; then remove_conflicts; fi
    write_config
    test_and_reload
    ensure_certbot
    issue_cert || true
    if [ $NO_SSL -eq 0 ]; then write_config; test_and_reload; fi
    summary
}

main "$@"
