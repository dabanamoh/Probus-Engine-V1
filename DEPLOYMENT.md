# Probi AI Auditor - Deployment Guide

This comprehensive guide will help you deploy the Probi AI Auditor application to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Traditional Server Deployment](#traditional-server-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Domain name and SSL certificate
- Database (PostgreSQL recommended for production)
- Cloud provider account (AWS, GCP, Azure, etc.)
- Basic knowledge of Linux command line

## Deployment Options

### Option 1: Traditional VPS/Server
- **Best for**: Full control, cost-effective for small teams
- **Providers**: DigitalOcean, Linode, Vultr, AWS EC2
- **Complexity**: Medium
- **Cost**: $5-50/month

### Option 2: Docker Container
- **Best for**: Consistency across environments, easy scaling
- **Providers**: Any cloud provider with Docker support
- **Complexity**: Medium
- **Cost**: $10-100/month

### Option 3: Serverless Platform
- **Best for**: Automatic scaling, minimal maintenance
- **Providers**: Vercel, Netlify, AWS Lambda
- **Complexity**: Low
- **Cost**: Variable (pay-per-use)

### Option 4: Managed Kubernetes
- **Best for**: Large-scale, high-availability applications
- **Providers**: AWS EKS, Google GKE, Azure AKS
- **Complexity**: High
- **Cost**: $100+/month

## Traditional Server Deployment

### 1. Server Setup

#### Connect to Your Server

```bash
ssh root@your-server-ip
```

#### Update System Packages

```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS/RHEL
yum update -y
```

#### Install Node.js and NPM

```bash
# Using NVM (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Using package manager
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
yum install -y nodejs
```

#### Install PM2 (Process Manager)

```bash
npm install -g pm2
```

#### Install Nginx (Reverse Proxy)

```bash
# Ubuntu/Debian
apt install nginx -y

# CentOS/RHEL
yum install nginx -y
```

#### Install PostgreSQL

```bash
# Ubuntu/Debian
apt install postgresql postgresql-contrib -y

# CentOS/RHEL
yum install postgresql-server postgresql-contrib -y
postgresql-setup --initdb
systemctl enable postgresql
systemctl start postgresql
```

### 2. Application Setup

#### Create Application User

```bash
# Create user
adduser --system --group --home /opt/probi-ai probi

# Switch to application user
su - probi
```

#### Clone Repository

```bash
git clone https://github.com/your-username/probi-ai-auditor.git
cd probi-ai-auditor
```

#### Install Dependencies

```bash
npm install --production
```

#### Configure Environment

```bash
cp .env.example .env
nano .env
```

Example production configuration:

```env
NODE_ENV="production"
PORT="3000"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Database
DATABASE_URL="postgresql://probi:your-password@localhost:5432/probi_ai_auditor"

# Security
JWT_SECRET="your-super-secure-jwt-secret"
CORS_ORIGIN="https://yourdomain.com"
COOKIE_SECURE="true"
COOKIE_SAME_SITE="strict"

# AI Services
ZAI_API_KEY="your-production-ai-key"

# External Services
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"
```

#### Setup Database

```bash
# Create database and user
sudo -u postgres createdb probi_ai_auditor
sudo -u postgres psql -c "CREATE USER probi WITH PASSWORD 'your-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE probi_ai_auditor TO probi;"

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate deploy

# (Optional) Seed database
npm run db:seed
```

#### Build Application

```bash
npm run build
```

### 3. Configure PM2

#### Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'probi-ai-auditor',
    script: 'npm',
    args: 'start',
    cwd: '/opt/probi-ai/probi-ai-auditor',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://probi:your-password@localhost:5432/probi_ai_auditor',
      JWT_SECRET: 'your-super-secure-jwt-secret',
      ZAI_API_KEY: 'your-production-ai-key'
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/opt/probi-ai/logs/error.log',
    out_file: '/opt/probi-ai/logs/out.log',
    log_file: '/opt/probi-ai/logs/combined.log',
    time: true
  }]
}
```

#### Start Application

```bash
# Create logs directory
mkdir -p /opt/probi-ai/logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### 4. Configure Nginx

#### Create Nginx Configuration

Create `/etc/nginx/sites-available/probi-ai-auditor`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Application Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static Files
    location /_next/static/ {
        alias /opt/probi-ai/probi-ai-auditor/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

#### Enable Site

```bash
# Enable site
ln -s /etc/nginx/sites-available/probi-ai-auditor /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### 5. SSL Certificate

#### Using Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/probi_ai_auditor
      - JWT_SECRET=your-jwt-secret
      - ZAI_API_KEY=your-ai-key
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=probi_ai_auditor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Update deployment
docker-compose pull
docker-compose up --build -d
```

## Cloud Platform Deployment

### Vercel Deployment

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Configure Vercel

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@probi_db_url",
    "JWT_SECRET": "@probi_jwt_secret",
    "ZAI_API_KEY": "@probi_ai_key"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@probi_db_url",
      "JWT_SECRET": "@probi_jwt_secret",
      "ZAI_API_KEY": "@probi_ai_key"
    }
  }
}
```

#### 3. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### AWS Deployment

#### Using AWS Elastic Beanstalk

1. **Install EB CLI**

```bash
pip install awsebcli
```

2. **Initialize EB Application**

```bash
eb init
```

3. **Create Environment**

```bash
eb create production
```

4. **Deploy**

```bash
eb deploy
```

#### Using AWS ECS

1. **Create Task Definition**

```json
{
  "family": "probi-ai-auditor",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "probi-ai-auditor",
      "image": "your-account.dkr.ecr.region.amazonaws.com/probi-ai-auditor:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "your-database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/probi-ai-auditor",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Platform

#### Using Google Cloud Run

1. **Build and Push Docker Image**

```bash
# Build Docker image
gcloud builds submit --tag gcr.io/PROJECT-ID/probi-ai-auditor

# Deploy to Cloud Run
gcloud run deploy --image gcr.io/PROJECT-ID/probi-ai-auditor --platform managed
```

## CI/CD Pipeline Setup

### GitHub Actions

#### Create `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        # Add your deployment commands here
        # Example: SSH to server and pull changes
        ssh -i ${{ secrets.SSH_KEY }} user@server "cd /opt/probi-ai/probi-ai-auditor && git pull && npm install && npm run build && pm2 restart probi-ai-auditor"
```

### GitLab CI/CD

#### Create `.gitlab-ci.yml`

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_ENV: production

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
  only:
    - main
    - develop

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - 'which ssh-agent || ( apk update && apk add openssh-client )'
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" >> ~/.ssh/known_hosts
    - chmod 644 ~/.ssh/known_hosts
  script:
    - ssh user@server "cd /opt/probi-ai/probi-ai-auditor && git pull origin main && npm install --production && npm run build && pm2 restart probi-ai-auditor"
  only:
    - main
```

## Post-Deployment Checklist

### 1. Application Health Check

- [ ] Application starts successfully
- [ ] All environment variables are loaded
- [ ] Database connection is working
- [ ] AI services are accessible
- [ ] External integrations are configured
- [ ] SSL certificate is valid
- [ ] All pages load without errors
- [ ] User authentication works
- [ ] File uploads function correctly
- [ ] Email notifications work

### 2. Security Verification

- [ ] Environment variables are not exposed
- [ ] Security headers are set correctly
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Database connections are encrypted
- [ ] API endpoints are protected
- [ ] File permissions are correct
- [ ] Error messages don't leak sensitive information

### 3. Performance Testing

- [ ] Application loads within 3 seconds
- [ ] Database queries are optimized
- [ ] Static assets are cached
- [ ] Gzip compression is enabled
- [ ] Images are optimized
- [ ] CDN is configured (if applicable)
- [ ] Memory usage is within limits
- [ ] CPU usage is normal

### 4. Monitoring Setup

- [ ] Application logging is configured
- [ ] Error tracking is set up (Sentry, etc.)
- [ ] Health check endpoints are accessible
- [ ] Uptime monitoring is configured
- [ ] Performance monitoring is active
- [ ] Database monitoring is set up
- [ ] Alert notifications are configured
- [ ] Backup processes are scheduled

## Monitoring and Maintenance

### 1. Application Monitoring

#### PM2 Monitoring

```bash
# Monitor application status
pm2 monit

# View logs
pm2 logs probi-ai-auditor

# Restart application
pm2 restart probi-ai-auditor

# Update application
pm2 reload probi-ai-auditor
```

#### Health Checks

Create automated health checks:

```bash
# Health check script
#!/bin/bash
HEALTH_URL="https://yourdomain.com/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Application is healthy"
    exit 0
else
    echo "Application is unhealthy (HTTP $RESPONSE)"
    exit 1
fi
```

### 2. Database Maintenance

#### Regular Backups

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="probi_ai_auditor"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/probi_ai_auditor_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/probi_ai_auditor_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

#### Database Optimization

```sql
-- Reindex database
REINDEX DATABASE probi_ai_auditor;

-- Update statistics
ANALYZE;

-- Clean up old data
DELETE FROM communications WHERE created_at < NOW() - INTERVAL '90 days';
```

### 3. Security Updates

#### Regular Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Node.js dependencies
npm audit fix
npm update

# Update Docker images
docker-compose pull
docker-compose up --build -d
```

#### Security Scans

```bash
# Run security audit
npm audit

# Check for vulnerabilities
npm audit --audit-level moderate

# Update packages with vulnerabilities
npm audit fix
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

**Symptoms**: 502 Bad Gateway, application not responding

**Solutions**:
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs probi-ai-auditor

# Restart application
pm2 restart probi-ai-auditor

# Check system resources
htop
df -h
free -m
```

#### 2. Database Connection Issues

**Symptoms**: Database connection errors, slow queries

**Solutions**:
```bash
# Check database status
systemctl status postgresql

# Test database connection
psql -h localhost -U probi -d probi_ai_auditor

# Check database logs
tail -f /var/log/postgresql/postgresql-15-main.log

# Restart database
systemctl restart postgresql
```

#### 3. Memory Issues

**Symptoms**: Application crashes, out-of-memory errors

**Solutions**:
```bash
# Check memory usage
free -h
pm2 monit

# Increase memory limit in PM2
pm2 reset probi-ai-auditor
pm2 start ecosystem.config.js --max-memory-restart 2G

# Add swap space if needed
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

#### 4. SSL Certificate Issues

**Symptoms**: Browser security warnings, mixed content errors

**Solutions**:
```bash
# Check certificate expiration
openssl x509 -in /path/to/certificate.crt -text -noout | grep "Not After"

# Renew Let's Encrypt certificate
certbot renew --dry-run

# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Log Analysis

#### Application Logs

```bash
# View real-time logs
pm2 logs probi-ai-auditor --lines 100

# Filter logs by level
pm2 logs probi-ai-auditor --err

# Export logs
pm2 logs probi-ai-auditor > app_logs_$(date +%Y%m%d).log
```

#### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log

# Analyze access patterns
grep "POST /api/" /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c
```

#### System Logs

```bash
# System logs
journalctl -u nginx -f

# Kernel messages
dmesg | tail -f

# Authentication logs
tail -f /var/log/auth.log
```

### Performance Issues

#### Identify Bottlenecks

```bash
# Check CPU usage
top -i

# Check memory usage
free -h

# Check disk I/O
iostat -x 1

# Check network connections
netstat -tulpn

# Check database queries
psql -U probi -d probi_ai_auditor -c "SELECT query, calls, total_time, rows, 100.0 * total_time / calls as mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

#### Optimize Performance

```bash
# Clear application cache
pm2 restart probi-ai-auditor

# Clear Nginx cache
rm -rf /var/cache/nginx/*

# Optimize database
VACUUM ANALYZE;
REINDEX DATABASE probi_ai_auditor;
```

## Support and Maintenance

### Documentation

- Keep deployment documentation up to date
- Document all configuration changes
- Maintain runbooks for common procedures
- Create disaster recovery procedures

### Backup Strategy

1. **Database Backups**: Daily automated backups
2. **File Backups**: Weekly application file backups
3. **Configuration Backups**: Version control for all configuration files
4. **Off-site Backups**: Store backups in multiple locations

### Disaster Recovery

1. **Backup Restoration**: Test backup restoration regularly
2. **Failover Procedures**: Document and test failover procedures
3. **Communication Plan**: Have a communication plan for outages
4. **Recovery Time Objective**: Define and meet RTO targets

### Scaling Considerations

- **Vertical Scaling**: Increase server resources as needed
- **Horizontal Scaling**: Add more application instances
- **Database Scaling**: Implement read replicas, sharding
- **CDN**: Use Content Delivery Network for static assets
- **Load Balancing**: Implement load balancer for high traffic

## Conclusion

This deployment guide provides comprehensive instructions for deploying the Probi AI Auditor application in various environments. Choose the deployment option that best fits your needs and resources.

Remember to:
- Always test deployments in a staging environment first
- Monitor application performance and health
- Keep software and dependencies up to date
- Have a solid backup and disaster recovery plan
- Document all procedures and configurations

For additional support, refer to the project documentation, GitHub issues, or contact the development team.