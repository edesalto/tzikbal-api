#!/bin/bash

# Plesk ZIP Deployment Script for Tzikbal API
# This script builds and creates a deployment package that can be uploaded to Plesk

set -e

# Load configuration from .deploy.env if it exists
if [ -f ".deploy.env" ]; then
    echo "📋 Loading configuration from .deploy.env..."
    source .deploy.env
fi

echo "🚀 Starting Tzikbal API build for Plesk deployment..."

# Build the project
echo "🔨 Building the project..."
pnpm install

# Build with increased memory allocation to prevent segmentation fault
echo "🏗️ Compiling TypeScript with increased memory..."
NODE_OPTIONS="--max-old-space-size=4096" pnpm run build

# Create deployment package
echo "📦 Creating deployment package..."
rm -rf deploy-package
mkdir -p deploy-package

# Copy necessary files to deployment package
echo "📁 Copying files to deployment package..."
cp -r dist/ deploy-package/
cp package.json deploy-package/
cp pnpm-lock.yaml deploy-package/
cp ecosystem.config.js deploy-package/
cp .env deploy-package/.env

# Create simple Node.js startup file for Plesk
cat > deploy-package/app.js << 'EOL'
// Simple startup script for Plesk Node.js hosting
const path = require('path');

// Load environment variables
require('dotenv').config();

// Set the working directory
process.chdir(__dirname);

// Start the application
require('./dist/main');
EOL

# Create a README for manual deployment
cat > deploy-package/PLESK_DEPLOYMENT.md << 'EOL'
# Manual Plesk Deployment Instructions

## Step 1: Upload Files
1. Create a ZIP file from this folder
2. In Plesk, go to your domain (tzikbal-api-qa.genbri.com)
3. Go to File Manager
4. Upload and extract the ZIP file to the document root

## Step 2: Enable Node.js
1. In Plesk, go to your domain settings
2. Click on "Node.js"
3. Enable Node.js
4. Set the startup file to: app.js
5. Set Node.js version to 18 or later

## Step 3: Install Dependencies
1. In the Node.js settings, click "NPM Install"
2. Or use the terminal: npm install --production

## Step 4: Configure Environment
1. In Node.js settings, add environment variables from .env file
2. Or edit the .env file directly through File Manager

## Step 5: Start Application
1. Click "Start" in the Node.js settings
2. Your API should be available at https://tzikbal-api-qa.genbri.com

## Important Notes:
- Make sure Node.js version 18+ is selected
- Ensure the startup file is set to 'app.js'
- The MongoDB Atlas database is already configured
- Update Google OAuth and AWS S3 credentials as needed
EOL

# Create a simple package.json for Plesk
cat > deploy-package/package-plesk.json << EOL
{
  "name": "tzikbal-api",
  "version": "0.0.1",
  "description": "Tzikbal API - QA Environment",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "dotenv": "^16.5.0"
  }
}
EOL

# Create deployment ZIP file
echo "📦 Creating deployment ZIP file..."
cd deploy-package
mkdir -p ../versions
# Generate date-based filename (yymmdd format)
DATE_SUFFIX=$(date +%y%m%d)
ZIP_NAME="genbri-api-${DATE_SUFFIX}.zip"
zip -r "../versions/${ZIP_NAME}" . -x "*.DS_Store" "node_modules/*"
cd ..

echo "✅ Deployment package created successfully!"
echo ""
echo "📁 Files created:"
echo "   📦 tzikbal-api-deployment.zip - Upload this to Plesk"
echo "   📂 deploy-package/ - Source files for the deployment"
echo ""
echo "📝 Manual Deployment Steps:"
echo "1. Go to Plesk File Manager for tzikbal-api-qa.genbri.com"
echo "2. Upload tzikbal-api-deployment.zip"
echo "3. Extract the ZIP file"
echo "4. Go to Node.js settings for the domain"
echo "5. Enable Node.js and set startup file to 'app.js'"
echo "6. Run 'npm install --production'"
echo "7. Add environment variables from .env file"
echo "8. Start the application"
echo ""
echo "📖 See deploy-package/PLESK_DEPLOYMENT.md for detailed instructions"
echo "🌐 Your application will be accessible at: https://api-qa.genbri.com"

# Cleanup old deployment files
if [ -d "deploy-temp" ]; then
    rm -rf deploy-temp
fi
