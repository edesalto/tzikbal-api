# Plesk Deployment Guide

This guide explains how to deploy the Tzikbal API to a Plesk hosting server.

## Prerequisites

1. A Plesk hosting account with SSH access
2. Node.js support enabled in your Plesk hosting plan
3. SSH key pair (recommended) or SSH password access

## Setup Instructions

### 1. Configure Deployment Settings

Copy the example configuration file and update it with your server details:

```bash
cp .deploy.env.example .deploy.env
```

Edit `.deploy.env` and update the following variables:

```bash
# Your Plesk server details
PLESK_HOST=your-plesk-server.com
PLESK_USER=your-username
PLESK_DOMAIN=your-domain.com
PLESK_PATH=/httpdocs

# Use SSH key authentication (recommended)
USE_SSH_KEY=true
SSH_KEY_PATH=~/.ssh/id_rsa

# Or use password authentication (less secure)
# USE_SSH_KEY=false
# PLESK_PASSWORD=your-password
```

### 2. Set Up SSH Key Authentication (Recommended)

If you don't have an SSH key pair, generate one:

```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

Add your public key to your Plesk server:

1. Copy your public key: `cat ~/.ssh/id_rsa.pub`
2. Log into your Plesk control panel
3. Go to "SSH Keys" section
4. Add a new SSH key and paste your public key

Alternatively, you can add it via command line:

```bash
ssh-copy-id your-username@your-plesk-server.com
```

### 3. Deploy the Application

Run the deployment script:

```bash
./deploy.sh
```

The script will:
- Build your NestJS application
- Create a deployment package
- Upload files to your Plesk server via SFTP
- Install dependencies on the server
- Start the application

### 4. Configure Environment Variables

After deployment, you need to set up your production environment variables:

1. SSH into your server:
   ```bash
   ssh your-username@your-plesk-server.com
   ```

2. Navigate to your application directory:
   ```bash
   cd /httpdocs/api  # or your configured path
   ```

3. Copy and edit the environment file:
   ```bash
   cp .env.example .env
   nano .env  # or use your preferred editor
   ```

4. Update the `.env` file with your production values:
   ```bash
   # Database - MongoDB Atlas Serverless (already configured)
   DATABASE_URL=mongodb+srv://edo:680c935Eff@maingenbricluster.k8vaowu.mongodb.net/genbri-back
   MONGODB_URI=mongodb+srv://edo:680c935Eff@maingenbricluster.k8vaowu.mongodb.net/genbri-back
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your-actual-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-actual-aws-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-actual-s3-bucket
   
   # Application
   PORT=3000
   NODE_ENV=production
   ```

5. Restart the application:
   ```bash
   ./stop.sh && ./start.sh
   ```

## Plesk Configuration

### Domain/Subdomain Setup

1. In Plesk, go to your domain settings
2. If you want the API at a subdomain (e.g., `api.yourdomain.com`):
   - Create a subdomain
   - Point its document root to `/httpdocs/api`
3. If you want the API at a path (e.g., `yourdomain.com/api`):
   - Configure URL rewriting or reverse proxy in Plesk

### Node.js Configuration

1. In Plesk, go to your domain's Node.js settings
2. Enable Node.js if not already enabled
3. Set the startup file to `dist/main.js`
4. Set the application root to your API directory
5. Configure environment variables if needed

## Management Commands

### Check Application Status
```bash
ssh your-username@your-plesk-server.com 'cd /httpdocs/api && pm2 status'
```

### View Logs
```bash
ssh your-username@your-plesk-server.com 'cd /httpdocs/api && pm2 logs'
```

### Restart Application
```bash
ssh your-username@your-plesk-server.com 'cd /httpdocs/api && ./stop.sh && ./start.sh'
```

### Redeploy
Simply run the deployment script again:
```bash
./deploy.sh
```

## Troubleshooting

### Common Issues

1. **Permission denied during deployment**
   - Check SSH key permissions: `chmod 600 ~/.ssh/id_rsa`
   - Verify SSH key is added to server

2. **Application not starting**
   - Check Node.js is installed and available
   - Verify environment variables are set correctly
   - Check application logs: `pm2 logs`

3. **Database connection issues**
   - The MongoDB Atlas serverless database is already configured
   - Ensure your Plesk server has internet access to connect to MongoDB Atlas
   - Check firewall rules allow outbound connections to MongoDB Atlas
   - Verify the connection string is correct in `.env`

4. **Port conflicts**
   - Change the PORT in your `.env` file
   - Ensure the port is available on your server

### Support

For deployment issues, check:
1. SSH connection: `ssh your-username@your-plesk-server.com`
2. File permissions on server
3. Node.js availability: `node --version`
4. Application logs: `pm2 logs genbri-api`
