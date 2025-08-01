#!/bin/bash

# Plesk FTP/SFTP Deployment Script for Tzikbal API
# This script builds and deploys the Tzikbal NestJS API to a Plesk server via FTP or SFTP

set -e

# Load configuration from .deploy.env if it exists
if [ -f ".deploy.env" ]; then
    echo "📋 Loading configuration from .deploy.env..."
    source .deploy.env
fi

# Configuration - Update these variables for your Plesk server
PLESK_HOST="${PLESK_HOST:-54.146.192.97}"
PLESK_USER="${PLESK_USER:-deploy-qa-user}"
PLESK_PASSWORD="${PLESK_PASSWORD:-go77V30r%}"
PLESK_DOMAIN="${PLESK_DOMAIN:-genbri.com}"
PLESK_PATH="${PLESK_PATH:-/tzikbal-api-qa.genbri.com}"
DEPLOY_METHOD="${DEPLOY_METHOD:-ftp}"

echo "🚀 Starting Tzikbal API deployment to Plesk server..."

# Check if required tools are installed
if [ "$DEPLOY_METHOD" = "ftp" ]; then
    if ! command -v lftp &> /dev/null; then
        echo "📦 Installing lftp for FTP deployment..."
        sudo apt-get update
        sudo apt-get install -y lftp
    fi
elif [ "$DEPLOY_METHOD" = "sftp" ]; then
    if ! command -v sshpass &> /dev/null; then
        echo "📦 Installing sshpass for SFTP deployment..."
        sudo apt-get update
        sudo apt-get install -y sshpass
    fi
    if ! command -v rsync &> /dev/null; then
        echo "📦 Installing rsync for SFTP deployment..."
        sudo apt-get update
        sudo apt-get install -y rsync
    fi
fi

# Build the project
echo "🔨 Building the project..."
pnpm install

# Build with increased memory allocation to prevent segmentation fault
echo "🏗️ Compiling TypeScript with increased memory..."
NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deploy-temp

# Copy necessary files to deployment temp directory
echo "📁 Copying files to deployment directory..."
cp -r dist/ deploy-temp/
cp package.json deploy-temp/
cp pnpm-lock.yaml deploy-temp/
cp ecosystem.config.js deploy-temp/

# Copy production environment file if it exists, otherwise create template
if [ -f ".env.production" ]; then
    echo "📋 Using production environment file..."
    cp .env.production deploy-temp/.env
else
    echo "⚠️  No .env.production found, creating template..."
    # Create production environment file template
    cat > deploy-temp/.env << EOL
# Database - MongoDB Atlas Serverless
DATABASE_URL=mongodb+srv://edo:680c935Eff@maingenbricluster.k8vaowu.mongodb.net/genbri-back
MONGODB_URI=mongodb+srv://edo:680c935Eff@maingenbricluster.k8vaowu.mongodb.net/genbri-back

# JWT
JWT_SECRET=genbri-super-secret-jwt-key-production-2025
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3 (for media uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# Application
PORT=3000
NODE_ENV=production
EOL
fi

# Create backup environment file template for reference
cat > deploy-temp/.env.example << EOL
# Database - MongoDB Atlas Serverless
DATABASE_URL=mongodb+srv://edo:680c935Eff@maingenbricluster.k8vaowu.mongodb.net/genbri-back
MONGODB_URI=mongodb+srv://edo:680c935Eff@maingenbricluster.k8vaowu.mongodb.net/genbri-back

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3 (for media uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# Application
PORT=3000
NODE_ENV=production
EOL

# Create start script for Plesk (Node.js application)
cat > deploy-temp/app.js << 'EOL'
// Simple startup script for Plesk Node.js hosting
require('./dist/main');
EOL

# Create package.json with start script for Plesk
cat > deploy-temp/package-plesk.json << EOL
{
  "name": "genbri-api",
  "version": "0.0.1",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOL

# Function to deploy via FTP
deploy_via_ftp() {
    echo "📤 Uploading files via FTP..."
    
    # Create lftp script
    cat > deploy-temp/ftp-deploy.lftp << EOL
set ssl:verify-certificate no
set ftp:ssl-allow no
open ftp://$PLESK_USER:$PLESK_PASSWORD@$PLESK_HOST
cd $PLESK_PATH
mirror -R --delete --verbose deploy-temp/ ./
bye
EOL

    # Execute FTP upload
    lftp -f deploy-temp/ftp-deploy.lftp
    
    echo "✅ FTP upload completed successfully!"
}

# Function to deploy via SFTP
deploy_via_sftp() {
    echo "📤 Uploading files via SFTP..."
    
    # Upload files using rsync over SSH
    sshpass -p "$PLESK_PASSWORD" rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" deploy-temp/ "$PLESK_USER@$PLESK_HOST:$PLESK_PATH/"
    
    echo "✅ SFTP upload completed successfully!"
}

# Validate configuration
if [ "$PLESK_HOST" = "your-plesk-server.com" ] || [ "$PLESK_USER" = "your-username" ]; then
    echo "❌ Error: Please configure your Plesk server settings in the script or environment variables"
    exit 1
fi

# Deploy based on method
if [ "$DEPLOY_METHOD" = "ftp" ]; then
    echo "🔗 Using FTP deployment method..."
    deploy_via_ftp
elif [ "$DEPLOY_METHOD" = "sftp" ]; then
    echo "🔗 Using SFTP deployment method..."
    deploy_via_sftp
else
    echo "❌ Error: Invalid deployment method. Use 'ftp' or 'sftp'"
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up temporary files..."
rm -rf deploy-temp

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should now be accessible at: https://api-qa.genbri.com"
echo ""
echo "📝 Next steps for Plesk Node.js hosting:"
echo "1. In Plesk, go to your domain (api-qa.genbri.com)"
echo "2. Enable Node.js hosting"
echo "3. Set the startup file to 'app.js'"
echo "4. Set the application root to the domain's document root"
echo "5. Install dependencies by running 'npm install --production' in Plesk"
echo "6. Configure environment variables in Plesk Node.js settings"
echo "7. Start the application"
echo ""
echo "🔄 To redeploy, simply run this script again!"
echo "📊 Monitor your application through Plesk's Node.js interface"
