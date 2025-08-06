# Probi AI Auditor - Environment Configuration Guide

This guide will help you configure the environment for the Probi AI Auditor application, including environment variables, AI services, and external integrations.

## Environment Variables

Create a `.env` file in the root of your project. Copy the template from `.env.example`:

```bash
cp .env.example .env
```

### Required Environment Variables

#### Application Configuration

```env
# Application
NODE_ENV="development"
PORT="3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# AI Services
ZAI_API_KEY="your-z-ai-api-key"
ZAI_API_BASE_URL="https://api.z-ai.com/v1"

# Email Service (Optional - for notifications)
EMAIL_SERVICE_HOST="smtp.gmail.com"
EMAIL_SERVICE_PORT="587"
EMAIL_SERVICE_USER="your-email@gmail.com"
EMAIL_SERVICE_PASSWORD="your-app-password"
EMAIL_SERVICE_FROM="noreply@yourcompany.com"

# File Upload (Optional)
UPLOAD_MAX_SIZE="10485760"  # 10MB in bytes
UPLOAD_ALLOWED_TYPES="pdf,doc,docx,txt,jpg,jpeg,png"
```

### Optional Environment Variables

#### Development Configuration

```env
# Development
NEXT_PUBLIC_DEBUG="true"
NEXT_PUBLIC_DEV_MODE="true"

# Logging
LOG_LEVEL="debug"
LOG_FILE_PATH="./logs/app.log"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"
```

#### Production Configuration

```env
# Production
NEXT_PUBLIC_DEBUG="false"
NEXT_PUBLIC_DEV_MODE="false"

# Security
CORS_ORIGIN="https://yourdomain.com"
COOKIE_DOMAIN="yourdomain.com"
COOKIE_SECURE="true"
COOKIE_SAME_SITE="strict"

# Performance
CACHE_TTL="3600"  # 1 hour in seconds
ENABLE_COMPRESSION="true"
```

#### External Service Configuration

```env
# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Microsoft OAuth (for Outlook/Teams integration)
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_TENANT_ID="your-microsoft-tenant-id"

# Slack API (for Slack integration)
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"
SLACK_SIGNING_SECRET="your-slack-signing-secret"

# Monitoring and Analytics
SENTRY_DSN="your-sentry-dsn"
GOOGLE_ANALYTICS_ID="your-ga-id"
```

## AI Services Configuration

### Z-AI Web Dev SDK Setup

The application uses Z-AI Web Dev SDK for threat detection and analysis. Follow these steps to configure it:

#### 1. Get API Credentials

1. Sign up for a Z-AI account at https://z.ai
2. Navigate to the API section
3. Generate your API key
4. Add the API key to your `.env` file:

```env
ZAI_API_KEY="your-z-ai-api-key"
```

#### 2. Configure AI Models

The application supports multiple AI models. You can configure them in the AI service:

```typescript
// src/lib/services/ai-config.ts
export const AI_CONFIG = {
  models: {
    threatDetection: {
      model: "gpt-4",
      temperature: 0.3,
      maxTokens: 1000,
    },
    languageDetection: {
      model: "gpt-3.5-turbo",
      temperature: 0.1,
      maxTokens: 100,
    },
    recommendationGeneration: {
      model: "gpt-4",
      temperature: 0.4,
      maxTokens: 2000,
    },
  },
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
  },
}
```

#### 3. Test AI Integration

Verify the AI integration is working:

```bash
# Run the development server
npm run dev

# Test AI endpoint
curl -X POST http://localhost:3000/api/test/ai \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message for AI analysis"}'
```

## External Integrations Configuration

### Email Integration

#### Gmail Integration

1. Go to Google Cloud Console
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add credentials to `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

#### Outlook Integration

1. Go to Azure Portal
2. Register a new application
3. Add API permissions for Mail.Read, Mail.ReadWrite
4. Create client secret
5. Add credentials to `.env`:

```env
MICROSOFT_CLIENT_ID="your-client-id"
MICROSOFT_CLIENT_SECRET="your-client-secret"
MICROSOFT_TENANT_ID="your-tenant-id"
```

### Chat Integration

#### Slack Integration

1. Create a Slack app at https://api.slack.com/apps
2. Add OAuth scopes: channels:history, groups:history, im:history, users:read
3. Install the app to your workspace
4. Add credentials to `.env`:

```env
SLACK_CLIENT_ID="your-client-id"
SLACK_CLIENT_SECRET="your-client-secret"
SLACK_SIGNING_SECRET="your-signing-secret"
SLACK_BOT_TOKEN="xoxb-your-bot-token"
```

#### Microsoft Teams Integration

1. Go to Azure Portal
2. Register a new bot
3. Add Teams permissions
4. Configure bot endpoint
5. Add credentials to `.env`:

```env
TEAMS_BOT_ID="your-bot-id"
TEAMS_BOT_PASSWORD="your-bot-password"
MICROSOFT_APP_ID="your-app-id"
```

## Security Configuration

### JWT Configuration

Generate a secure JWT secret:

```bash
# Generate a secure random string
openssl rand -base64 32
```

Add to `.env`:

```env
JWT_SECRET="your-generated-secret"
JWT_EXPIRES_IN="7d"
```

### CORS Configuration

Configure CORS for your domain:

```env
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"
```

### Rate Limiting

Configure rate limiting:

```env
RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"
```

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd probi-ai-auditor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Seed database
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Production Environment Setup

### 1. Server Requirements

- Node.js 18+
- NPM 8+
- Database (PostgreSQL recommended)
- SSL certificate
- Domain name

### 2. Environment Configuration

Create production environment file:

```bash
# .env.production
NODE_ENV="production"
PORT="3000"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/probi_ai_auditor"

# Security
JWT_SECRET="your-production-jwt-secret"
CORS_ORIGIN="https://yourdomain.com"
COOKIE_SECURE="true"
COOKIE_SAME_SITE="strict"

# AI Services
ZAI_API_KEY="your-production-ai-key"

# External Services
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
# ... other service credentials
```

### 3. Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm start
```

### 4. Process Management

Use PM2 for process management in production:

```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'probi-ai-auditor',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

## Docker Configuration

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
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
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=probi_ai_auditor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 3. Run with Docker

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

## Testing Configuration

### 1. Environment Testing

Create test environment file:

```bash
# .env.test
NODE_ENV="test"
PORT="3001"
DATABASE_URL="file:./test.db"
JWT_SECRET="test-jwt-secret"
ZAI_API_KEY="test-ai-key"
```

### 2. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- threats.test.ts

# Run tests with coverage
npm run test:coverage
```

## Monitoring and Logging

### 1. Application Logging

Configure logging in `src/lib/logger.ts`:

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

export { logger }
```

### 2. Health Checks

Create health check endpoints:

```typescript
// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Check database
    await db.$queryRaw`SELECT 1`
    
    // Check AI service
    // Add AI service health check here
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        ai: 'healthy'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
}
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Check if `.env` file exists in root directory
   - Verify variable names are correct
   - Restart the application after making changes

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check if database server is running
   - Ensure database user has proper permissions

3. **AI Service Not Working**
   - Verify `ZAI_API_KEY` is correct
   - Check if API key has proper permissions
   - Verify network connectivity to AI service

4. **External Integration Failures**
   - Verify OAuth credentials are correct
   - Check if redirect URIs match
   - Ensure API permissions are properly configured

### Debug Mode

Enable debug mode for troubleshooting:

```env
NEXT_PUBLIC_DEBUG="true"
LOG_LEVEL="debug"
```

### Getting Help

- Check application logs: `tail -f logs/combined.log`
- Review error logs: `tail -f logs/error.log`
- Check browser developer tools for client-side errors
- Verify network requests in browser dev tools

## Best Practices

1. **Environment Security**
   - Never commit `.env` files to version control
   - Use different environments for development, staging, and production
   - Rotate secrets regularly
   - Use environment-specific configurations

2. **Performance Optimization**
   - Use appropriate database connection pooling
   - Implement caching where possible
   - Monitor resource usage
   - Optimize database queries

3. **Monitoring**
   - Set up application monitoring
   - Configure error tracking
   - Monitor database performance
   - Set up alerts for critical issues

4. **Backup and Recovery**
   - Regular database backups
   - Backup environment configurations
   - Document recovery procedures
   - Test backup restoration regularly

## Support

For additional support:

1. Check the documentation in the `/docs` directory
2. Review GitHub issues for similar problems
3. Contact the development team
4. Check community forums and resources