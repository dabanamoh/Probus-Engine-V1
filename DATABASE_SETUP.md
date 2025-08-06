# Probi AI Auditor - Database Setup Guide

This guide will help you set up and configure the database for the Probi AI Auditor application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Basic knowledge of databases and SQL

## Database Overview

Probi AI Auditor uses **SQLite** as the default database for development and testing. The application is built with Prisma ORM, which makes it easy to switch to other databases like PostgreSQL, MySQL, or SQL Server for production.

### Database Schema

The application includes the following main entities:

1. **Users** - User authentication and management
2. **Companies** - Multi-tenant organization support
3. **Sessions** - User session management
4. **Integrations** - Email and chat platform connections
5. **Communications** - Analyzed communication data
6. **Threats** - Detected security threats
7. **Recommendations** - Actionable security recommendations
8. **Alerts** - User notifications
9. **Reports** - Generated compliance and analytics reports

## Setup Instructions

### 1. Install Dependencies

First, ensure all dependencies are installed:

```bash
npm install
```

### 2. Configure Database

The application uses SQLite by default. The database configuration is in `.env` file:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"
```

### 3. Generate Prisma Client

Generate the Prisma client for database operations:

```bash
npm run db:generate
```

### 4. Push Database Schema

Push the schema to create the database:

```bash
npm run db:push
```

This will create the database file and all tables according to the schema defined in `prisma/schema.prisma`.

### 5. Verify Database Setup

You can verify the database was created successfully by checking for the `dev.db` file in the project root or by running:

```bash
npm run db:studio
```

This will open Prisma Studio, a visual database browser.

## Production Database Setup

For production, we recommend using a more robust database like PostgreSQL. Here's how to set it up:

### 1. Choose Your Database

Supported databases for production:
- PostgreSQL (Recommended)
- MySQL
- SQL Server
- MongoDB (with Prisma MongoDB preview)

### 2. Install Database Driver

Install the appropriate database driver:

```bash
# For PostgreSQL
npm install pg

# For MySQL
npm install mysql2

# For SQL Server
npm install @prisma/client sqlserver
```

### 3. Update Database URL

Update your `.env` file with the production database connection string:

```env
# PostgreSQL Example
DATABASE_URL="postgresql://username:password@localhost:5432/probi_ai_auditor"

# MySQL Example
DATABASE_URL="mysql://username:password@localhost:3306/probi_ai_auditor"

# SQL Server Example
DATABASE_URL="sqlserver://username:password@localhost:1433;database=probi_ai_auditor"
```

### 4. Update Prisma Schema

Update the `datasource` block in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  # or "mysql", "sqlserver"
  url      = env("DATABASE_URL")
}
```

### 5. Run Migrations

For production databases, use migrations instead of `db:push`:

```bash
# Create initial migration
npm run db:migrate dev --name init

# Apply migrations to production
npm run db:migrate deploy
```

## Database Seeding

To populate the database with initial data, create a seed script:

### 1. Create Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a demo company
  const company = await prisma.company.create({
    data: {
      name: 'Demo Company',
      domain: 'demo-company.com',
      subscription: 'ENTERPRISE',
    },
  })

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo-password', 12)
  const user = await prisma.user.create({
    data: {
      email: 'admin@demo-company.com',
      name: 'Demo Admin',
      password: hashedPassword,
      role: 'ADMIN',
      language: 'en',
      companyId: company.id,
    },
  })

  // Create sample integrations
  await prisma.integration.createMany({
    data: [
      {
        companyId: company.id,
        type: 'EMAIL_GMAIL',
        name: 'Company Gmail',
        config: {
          clientId: 'your-client-id',
          clientSecret: 'your-client-secret',
        },
        status: 'ACTIVE',
      },
      {
        companyId: company.id,
        type: 'CHAT_SLACK',
        name: 'Team Slack',
        config: {
          botToken: 'your-bot-token',
        },
        status: 'ACTIVE',
      },
    ],
  })

  // Create sample threats
  await prisma.threat.createMany({
    data: [
      {
        companyId: company.id,
        type: 'HARASSMENT',
        severity: 'HIGH',
        title: 'Inappropriate language detected',
        description: 'Detected harassment pattern in team communication',
        confidence: 0.85,
        status: 'OPEN',
      },
      {
        companyId: company.id,
        type: 'INFORMATION_LEAKAGE',
        severity: 'CRITICAL',
        title: 'Sensitive data shared externally',
        description: 'Customer data shared in external communication',
        confidence: 0.92,
        status: 'OPEN',
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 2. Add Seed Script to Package.json

Update `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 3. Run Seed Script

```bash
npm run db:seed
```

## Database Backup and Recovery

### SQLite Backup

```bash
# Create backup
sqlite3 dev.db ".backup backup.db"

# Restore from backup
sqlite3 dev.db ".restore backup.db"
```

### PostgreSQL Backup

```bash
# Create backup
pg_dump probi_ai_auditor > backup.sql

# Restore from backup
psql probi_ai_auditor < backup.sql
```

## Database Monitoring

### 1. Enable Query Logging

Add to your `.env` file:

```env
LOG_LEVEL=debug
```

### 2. Monitor Database Performance

Use Prisma's built-in metrics:

```typescript
// Add to your application
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

### 3. Database Health Checks

Create a health check endpoint:

```typescript
// src/app/api/health/db/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    )
  }
}
```

## Security Best Practices

### 1. Environment Variables

Never commit database credentials to version control. Use environment variables:

```env
# .env
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
```

### 2. Database User Permissions

Create a dedicated database user with minimum required permissions:

```sql
-- PostgreSQL example
CREATE USER probi_user WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE probi_ai_auditor TO probi_user;
GRANT USAGE ON SCHEMA public TO probi_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO probi_user;
```

### 3. Connection Pooling

Configure connection pooling for production:

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query'],
  connectionLimit: 10, // Adjust based on your needs
})

export { prisma as db }
```

### 4. Regular Backups

Set up automated database backups:

```bash
# Add to crontab for daily backups
0 2 * * * /usr/bin/pg_dump probi_ai_auditor > /backups/probi_$(date +\%Y\%m\%d).sql
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if database server is running
   - Verify connection string in `.env`
   - Ensure database user has proper permissions

2. **Migration Failures**
   - Drop database and recreate: `npm run db:reset`
   - Check for syntax errors in schema
   - Ensure all dependencies are installed

3. **Performance Issues**
   - Add database indexes for frequently queried fields
   - Optimize complex queries
   - Consider connection pooling

### Getting Help

- Check Prisma documentation: https://www.prisma.io/docs/
- Review database-specific documentation
- Check application logs for detailed error messages

## Next Steps

After setting up the database:

1. Test all database operations
2. Set up automated backups
3. Configure monitoring and alerting
4. Document your database setup for your team
5. Plan for database scaling as your application grows

For production deployment, consider using managed database services like:
- Amazon RDS
- Google Cloud SQL
- Microsoft Azure Database
- Heroku Postgres
- DigitalOcean Managed Databases