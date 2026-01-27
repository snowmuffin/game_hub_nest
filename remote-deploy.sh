#!/bin/bash

# 🚀 Game Hub NestJS - Remote Deployment Script
# EC2 인스턴스에 자동으로 배포하는 스크립트

set -e  # 오류 발생시 스크립트 중단

echo "🚀 Starting Remote Deployment to EC2..."
echo "================================================"

# 🔍 환경 변수 파일 확인
ENV_FILE=".env"
if [ ! -f $ENV_FILE ]; then
    echo "❌ $ENV_FILE file not found!"
    echo "💡 Please create .env file with EC2 deployment settings"
    exit 1
fi

# 환경 변수 로드
echo "📋 Loading environment variables..."
source $ENV_FILE

# 🔍 필수 환경변수 확인
echo "🔍 Verifying deployment environment variables..."
echo "================================================"

# EC2_KEY_PATH 확인
if [ -z "$EC2_KEY_PATH" ]; then
    echo "⚠️  EC2_KEY_PATH not set, using default: ~/Documents/AWS/snowmuffin.pem"
    EC2_KEY_PATH="~/Documents/AWS/snowmuffin.pem"
fi

# 키 파일 경로 확장 (~ 처리)
EC2_KEY_PATH="${EC2_KEY_PATH/#\~/$HOME}"

if [ ! -f "$EC2_KEY_PATH" ]; then
    echo "❌ SSH key file not found: $EC2_KEY_PATH"
    exit 1
fi
echo "✅ SSH key found: $EC2_KEY_PATH"

# EC2_HOST 확인
if [ -z "$EC2_HOST" ]; then
    echo "⚠️  EC2_HOST not set, using default: ec2-13-125-32-159.ap-northeast-2.compute.amazonaws.com"
    EC2_HOST="ec2-13-125-32-159.ap-northeast-2.compute.amazonaws.com"
fi
echo "✅ EC2 Host: $EC2_HOST"

# EC2_USER 확인
if [ -z "$EC2_USER" ]; then
    echo "⚠️  EC2_USER not set, using default: ec2-user"
    EC2_USER="ec2-user"
fi
echo "✅ EC2 User: $EC2_USER"

# EC2_APP_PATH 확인 (원격 서버의 앱 경로)
if [ -z "$EC2_APP_PATH" ]; then
    echo "⚠️  EC2_APP_PATH not set, using default: /home/ec2-user/game_hub_nest"
    EC2_APP_PATH="/home/ec2-user/game_hub_nest"
fi
echo "✅ EC2 App Path: $EC2_APP_PATH"

# SSH 접속 정보
SSH_CONNECTION="$EC2_USER@$EC2_HOST"
SSH_COMMAND="ssh -i $EC2_KEY_PATH $SSH_CONNECTION"

echo ""
echo "📦 Preparing deployment package..."
echo "================================================"

# 로컬에서 빌드
echo "🔨 Building application locally..."
npm run build

# 임시 배포 디렉토리 생성
DEPLOY_DIR="./deploy_temp"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# 필요한 파일들 복사
echo "📋 Copying files to deployment directory..."
cp -r dist $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp nest-cli.json $DEPLOY_DIR/
cp tsconfig.json $DEPLOY_DIR/
cp tsconfig.build.json $DEPLOY_DIR/

# ecosystem.config.js가 있다면 복사 (PM2 사용시)
if [ -f "ecosystem.config.js" ]; then
    cp ecosystem.config.js $DEPLOY_DIR/
    echo "✅ PM2 config included"
fi

# ⚠️  .env 파일은 복사하지 않음 - 원격 서버의 기존 .env 사용
echo "⚠️  .env file will NOT be copied - using existing .env on remote server"
echo "💡 Make sure your EC2 instance has the correct .env file configured"

echo ""
echo "🚀 Deploying to EC2..."
echo "================================================"

# SSH 연결 테스트
echo "🔗 Testing SSH connection..."
if ! $SSH_COMMAND "echo 'SSH connection successful'"; then
    echo "❌ SSH connection failed!"
    echo "💡 Please check your SSH key and host settings"
    rm -rf $DEPLOY_DIR
    exit 1
fi
echo "✅ SSH connection successful"

# 원격 서버에 앱 디렉토리 생성
echo "📁 Creating/verifying app directory on remote server..."
$SSH_COMMAND "mkdir -p $EC2_APP_PATH"

# 원격 서버에 파일 전송
echo "📤 Uploading files to EC2..."
rsync -avz --delete \
    --exclude='.env' \
    --exclude='.env.*' \
    -e "ssh -i $EC2_KEY_PATH" \
    $DEPLOY_DIR/ \
    $SSH_CONNECTION:$EC2_APP_PATH/

echo "✅ Files uploaded successfully (excluding .env files)"

# 원격 서버에서 배포 실행
echo ""
echo "🔧 Running deployment on remote server..."
echo "================================================"

$SSH_COMMAND "cd $EC2_APP_PATH && bash -s" << 'ENDSSH'
    echo "📦 Installing dependencies..."
    npm ci --production
    
    # PM2가 설치되어 있는지 확인
    if command -v pm2 &> /dev/null; then
        echo "🔄 Restarting application with PM2..."
        
        # .env 파일 존재 확인
        if [ ! -f ".env" ]; then
            echo "❌ .env file not found on remote server!"
            echo "💡 Please create .env file before deploying"
            exit 1
        fi
        
        # PM2에서 기존 프로세스 중지 및 삭제
        pm2 stop game-hub-nest 2>/dev/null || true
        pm2 delete game-hub-nest 2>/dev/null || true
        
        # ecosystem.config.js로 시작 (.env는 PM2가 자동으로 로드하지 않으므로 수동 처리)
        if [ -f "ecosystem.config.js" ]; then
            # .env를 export하여 환경 변수로 로드
            set -a
            source .env
            set +a
            pm2 start ecosystem.config.js --update-env
        else
            # 없으면 기본 실행
            pm2 start dist/main.js --name game-hub-nest
        fi
        
        pm2 save
        echo "✅ Application restarted with PM2"
    else
        echo "⚠️  PM2 not found. Please install PM2:"
        echo "   npm install -g pm2"
        echo "   pm2 startup"
        echo ""
        echo "💡 You can manually start the app with:"
        echo "   cd $EC2_APP_PATH && npm run start:prod"
    fi
ENDSSH

# 임시 디렉토리 정리
echo ""
echo "🧹 Cleaning up..."
rm -rf $DEPLOY_DIR

echo ""
echo "================================================"
echo "✅ Deployment completed successfully!"
echo "================================================"
echo ""
echo "📊 Deployment summary:"
echo "   🖥️  Remote: $SSH_CONNECTION"
echo "   📁 Path: $EC2_APP_PATH"
echo "   🔑 Key: $EC2_KEY_PATH"
echo ""
echo "🔍 Useful commands:"
echo "   View logs:     $SSH_COMMAND 'pm2 logs game-hub'"
echo "   Check status:  $SSH_COMMAND 'pm2 status'"
echo "   Restart app:   $SSH_COMMAND 'pm2 restart game-hub'"
echo "   SSH into EC2:  $SSH_COMMAND"
echo ""
