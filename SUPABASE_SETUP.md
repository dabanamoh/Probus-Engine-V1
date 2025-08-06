# Probus Engine - Supabase Database Setup Guide

This comprehensive guide will help you set up and configure Supabase for the Probus Engine application. Supabase provides a powerful PostgreSQL database with real-time capabilities, authentication, and storage services.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier available)
- Basic knowledge of databases and SQL

## Overview

Probus Engine uses **Supabase** as the recommended database solution for production. Supabase is built on PostgreSQL and provides:

- **PostgreSQL Database**: Robust, scalable relational database
- **Real-time Subscriptions**: Real-time data synchronization
- **Authentication**: Built-in user authentication and management
- **Storage**: File storage for documents and media
- **Edge Functions**: Serverless functions for business logic
- **Row Level Security**: Fine-grained access control

## Step 1: Create Supabase Project

### 1.1 Sign Up for Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Sign up with your GitHub account or email

### 1.2 Create New Project

1. After signing in, click "New Project"
2. Fill in the project details:
   - **Organization**: Your organization name
   - **Project Name**: `probus-engine` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose the region closest to your users
   - **Plan**: Select Free tier or Pro tier based on your needs

3. Click "Create new project"

### 1.3 Wait for Project Creation

Supabase will take 2-3 minutes to create your project. Once ready, you'll see your project dashboard.

## Step 2: Configure Database Connection

### 2.1 Get Connection Details

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Find the **Connection string** section
3. Copy the **URI** connection string

Your connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 2.2 Update Environment Variables

Create or update your `.env` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (for Prisma)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### 2.3 Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy both keys:
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **anon public**: Public API key
   - **service_role**: Service role key (keep this secret!)

## Step 3: Install Required Packages

Install the necessary packages for Supabase integration:

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Install Supabase auth helpers for Next.js
npm install @supabase/auth-helpers-nextjs

# Install PostgreSQL driver for Prisma
npm install pg
```

## Step 4: Configure Prisma for Supabase

### 4.1 Update Prisma Schema

Update `prisma/schema.prisma` to use PostgreSQL:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Optional: Add connection pooling
  directUrl = env("DATABASE_URL")?connection_limit=10
}

// Your existing models will go here
```

### 4.2 Update Database Models

Here's the complete schema for Probus Engine:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Management
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  language  String   @default("en")
  companyId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company    Company?        @relation(fields: [companyId], references: [id])
  sessions   Session[]
  threats    Threat[]
  alerts     Alert[]
  reports    Report[]
  audits     Audit[]

  @@map("users")
}

// Company/Organization Management
model Company {
  id           String      @id @default(cuid())
  name         String
  domain       String?     @unique
  subscription Subscription @default(FREE)
  settings     Json?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  users         User[]
  integrations  Integration[]
  threats       Threat[]
  communications Communication[]
  reports       Report[]
  customApps    CustomApplication[]

  @@map("companies")
}

// Session Management
model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// Integration Management
model Integration {
  id        String           @id @default(cuid())
  companyId String
  type      IntegrationType
  name      String
  config    Json
  status    IntegrationStatus @default(PENDING)
  lastSync  DateTime?
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt

  company       Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)
  communications Communication[]

  @@map("integrations")
}

// Communication Data
model Communication {
  id            String      @id @default(cuid())
  companyId     String
  integrationId String
  type          CommunicationType
  source        String
  language      String      @default("en")
  content       String
  metadata      Json
  analysis      Json
  timestamp     DateTime
  createdAt     DateTime    @default(now())

  company     Company      @relation(fields: [companyId], references: [id], onDelete: Cascade)
  integration Integration  @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  threats     Threat[]

  @@map("communications")
}

// Threat Detection
model Threat {
  id          String     @id @default(cuid())
  companyId   String
  userId      String?
  type        ThreatType
  severity    Severity
  title       String
  description String
  confidence  Float      @default(0.0)
  status      ThreatStatus @default(OPEN)
  metadata    Json?
  resolution  String?
  resolvedAt  DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  company       Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  user          User?          @relation(fields: [userId], references: [id])
  communication Communication? @relation(fields: [id], references: [id])
  alerts        Alert[]
  recommendations Recommendation[]

  @@map("threats")
}

// Recommendations
model Recommendation {
  id          String   @id @default(cuid())
  threatId    String
  type        RecommendationType
  title       String
  description String
  priority    Priority @default(MEDIUM)
  status      String   @default("PENDING")
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  threat Threat @relation(fields: [threatId], references: [id], onDelete: Cascade)

  @@map("recommendations")
}

// Alerts and Notifications
model Alert {
  id        String      @id @default(cuid())
  userId    String
  type      AlertType
  title     String
  message   String
  severity  Severity    @default(MEDIUM)
  status    AlertStatus @default(UNREAD)
  metadata  Json?
  createdAt DateTime    @default(now())
  readAt    DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("alerts")
}

// Reports
model Report {
  id        String      @id @default(cuid())
  companyId String
  type      ReportType
  title     String
  data      Json
  format    String      @default("json")
  status    ReportStatus @default(GENERATING)
  metadata  Json?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("reports")
}

// Security Audit
model Audit {
  id        String   @id @default(cuid())
  userId    String
  action    String
  ipAddress String?
  userAgent String?
  status    String   @default("SUCCESS")
  metadata  Json?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("audits")
}

// Custom Applications
model CustomApplication {
  id          String   @id @default(cuid())
  companyId   String
  name        String
  type        String
  description String
  config      Json
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("custom_applications")
}

// Enums
enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}

enum Subscription {
  FREE
  PRO
  ENTERPRISE
}

enum IntegrationType {
  EMAIL_GMAIL
  EMAIL_OUTLOOK
  CHAT_SLACK
  CHAT_TEAMS
  CHAT_DISCORD
  CUSTOM
}

enum IntegrationStatus {
  PENDING
  ACTIVE
  ERROR
  DISABLED
}

enum CommunicationType {
  EMAIL
  CHAT
  DOCUMENT
  CUSTOM
}

enum ThreatType {
  HARASSMENT
  INFORMATION_LEAKAGE
  BURNOUT
  FRAUD
  DISSATISFACTION
  CUSTOM
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ThreatStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  FALSE_POSITIVE
}

enum RecommendationType {
  TRAINING
  POLICY_UPDATE
  SECURITY_MEASURE
  INVESTIGATION
  CUSTOM
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum AlertType {
  THREAT_DETECTED
  THREAT_RESOLVED
  SYSTEM_ERROR
  INTEGRATION_ISSUE
  CUSTOM
}

enum AlertStatus {
  UNREAD
  READ
  ARCHIVED
}

enum ReportType {
  THREATS
  COMMUNICATIONS
  COMPLIANCE
  CUSTOM_APPS
  CUSTOM
}

enum ReportStatus {
  GENERATING
  COMPLETED
  FAILED
}
```

### 4.3 Generate Prisma Client

Generate the Prisma client for the updated schema:

```bash
npm run db:generate
```

## Step 5: Set Up Database

### 5.1 Push Schema to Supabase

Push the schema to your Supabase database:

```bash
npm run db:push
```

### 5.2 Verify Database Setup

You can verify the database was set up correctly by:

1. Going to your Supabase project dashboard
2. Click on **Table Editor** in the left sidebar
3. You should see all the tables created from your schema

### 5.3 Set Up Row Level Security (RLS)

Supabase recommends enabling Row Level Security for production. Here's how to set up basic RLS:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Create policies for companies
CREATE POLICY "Users can view company data" ON companies
  FOR SELECT USING (id IN (SELECT company_id FROM users WHERE id = auth.uid()::text));

-- Create policies for threats
CREATE POLICY "Users can view company threats" ON threats
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()::text));

-- Create policies for communications
CREATE POLICY "Users can view company communications" ON communications
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()::text));
```

## Step 6: Configure Supabase Client

### 6.1 Create Supabase Client Utility

Create `src/lib/supabase.ts`:

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/client components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server components
export const createSupabaseServerClient = (context: any) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return context.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options)
        })
      },
    },
  })
}

// Service client with admin privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

### 6.2 Update Database Client

Update `src/lib/db.ts` to work with Supabase:

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

export { prisma as db }
```

## Step 7: Set Up Authentication

### 7.1 Configure Supabase Auth

1. In your Supabase project dashboard, go to **Authentication** → **Settings**
2. Configure the following settings:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Email confirmation**: Disable for development (enable for production)

### 7.2 Create Auth API Routes

Create `src/app/api/auth/login/route.ts`:

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Check if user exists in our database
    const user = await db.user.findUnique({
      where: { email },
      include: { company: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create Supabase session
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Log the login
    await db.audit.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      token: data.session?.access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Step 8: Set Up Real-time Subscriptions

### 8.1 Enable Real-time on Tables

```sql
-- Enable real-time on specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE threats;
ALTER PUBLICATION supabase_realtime ADD TABLE communications;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
```

### 8.2 Create Real-time Client

Create `src/lib/realtime.ts`:

```typescript
// src/lib/realtime.ts
import { supabase } from '@/lib/supabase'

export interface RealtimeEvent {
  table: string
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  schema: string
  old_record?: any
  new_record?: any
}

export class RealtimeClient {
  private subscriptions: Map<string, any> = new Map()

  subscribeToThreats(callback: (event: RealtimeEvent) => void) {
    const subscription = supabase
      .channel('threats')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'threats' },
        (payload) => callback(payload)
      )
      .subscribe()

    this.subscriptions.set('threats', subscription)
    return subscription
  }

  subscribeToAlerts(callback: (event: RealtimeEvent) => void) {
    const subscription = supabase
      .channel('alerts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'alerts' },
        (payload) => callback(payload)
      )
      .subscribe()

    this.subscriptions.set('alerts', subscription)
    return subscription
  }

  unsubscribe(channel: string) {
    const subscription = this.subscriptions.get(channel)
    if (subscription) {
      supabase.removeChannel(subscription)
      this.subscriptions.delete(channel)
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription)
    })
    this.subscriptions.clear()
  }
}

export const realtime = new RealtimeClient()
```

## Step 9: Set Up Storage (Optional)

### 9.1 Create Storage Buckets

1. In your Supabase project dashboard, go to **Storage**
2. Create buckets for:
   - `documents`: For uploaded documents
   - `reports`: For generated reports
   - `logs`: For application logs

### 9.2 Configure Storage Policies

```sql
-- Create storage policies
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (bucket_id IN (
    SELECT id FROM storage.buckets WHERE name IN ('documents', 'reports')
  ) AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN (
      SELECT id FROM storage.buckets WHERE name IN ('documents', 'reports')
    ) AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Step 10: Database Seeding

### 10.1 Create Seed Script

Create `prisma/seed.ts`:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a demo company
  const company = await prisma.company.create({
    data: {
      name: 'Demo Company',
      domain: 'demo-company.com',
      subscription: 'ENTERPRISE',
      settings: {
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true
        }
      }
    }
  })

  // Create a demo admin user
  const hashedPassword = await bcrypt.hash('demo-password', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo-company.com',
      name: 'Demo Admin',
      password: hashedPassword,
      role: 'ADMIN',
      language: 'en',
      companyId: company.id
    }
  })

  // Create demo integrations
  await prisma.integration.createMany({
    data: [
      {
        companyId: company.id,
        type: 'EMAIL_GMAIL',
        name: 'Company Gmail',
        config: {
          email: 'company@demo-company.com',
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET
        },
        status: 'ACTIVE'
      },
      {
        companyId: company.id,
        type: 'CHAT_SLACK',
        name: 'Team Slack',
        config: {
          teamId: 'T123456789',
          botToken: process.env.SLACK_BOT_TOKEN
        },
        status: 'ACTIVE'
      }
    ]
  })

  // Create sample communications
  const sampleComm = await prisma.communication.create({
    data: {
      companyId: company.id,
      integrationId: (await prisma.integration.findFirst({
        where: { companyId: company.id, type: 'EMAIL_GMAIL' }
      }))!.id,
      type: 'EMAIL',
      source: 'Gmail',
      language: 'en',
      content: 'Sample email content for analysis...',
      metadata: {
        sender: 'employee@demo-company.com',
        recipients: ['manager@demo-company.com'],
        subject: 'Project Update'
      },
      analysis: {
        sentiment: 'neutral',
        riskLevel: 'low',
        threats: [],
        confidence: 0.95
      },
      timestamp: new Date()
    }
  })

  // Create sample threats
  await prisma.threat.createMany({
    data: [
      {
        companyId: company.id,
        userId: adminUser.id,
        type: 'HARASSMENT',
        severity: 'HIGH',
        title: 'Inappropriate language detected',
        description: 'Detected harassment pattern in team communication',
        confidence: 0.85,
        status: 'OPEN',
        metadata: {
          communicationId: sampleComm.id,
          factors: ['inappropriate_language', 'aggressive_tone']
        }
      },
      {
        companyId: company.id,
        type: 'INFORMATION_LEAKAGE',
        severity: 'CRITICAL',
        title: 'Sensitive data shared externally',
        description: 'Customer data shared in external communication',
        confidence: 0.92,
        status: 'OPEN',
        metadata: {
          dataType: 'customer_information',
          externalRecipient: true
        }
      }
    ]
  })

  // Create sample custom applications
  await prisma.customApplication.createMany({
    data: [
      {
        companyId: company.id,
        name: 'Employee Attendance Tracker',
        type: 'attendance',
        description: 'Tracks employee clock in/out patterns',
        config: {
          dataSources: [
            {
              name: 'HR Database',
              type: 'database',
              endpoint: 'hr_system.attendance_records'
            }
          ],
          analysisRules: [
            {
              name: 'Irregular Hours',
              enabled: true,
              conditions: {
                minHours: 8,
                maxHours: 12,
                irregularThreshold: 3
              }
            }
          ]
        },
        enabled: true
      },
      {
        companyId: company.id,
        name: 'Leave Management System',
        type: 'leave',
        description: 'Monitors employee leave patterns',
        config: {
          dataSources: [
            {
              name: 'Leave Database',
              type: 'database',
              endpoint: 'hr_system.leave_requests'
            }
          ],
          analysisRules: [
            {
              name: 'Excessive Sick Leave',
              enabled: true,
              conditions: {
                maxSickDays: 10,
                consecutiveDays: 5,
                threshold: 3
              }
            }
          ]
        },
        enabled: true
      }
    ]
  })

  console.log('✅ Database seeded successfully!')
  console.log('📧 Demo admin user: admin@demo-company.com')
  console.log('🔑 Demo password: demo-password')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 10.2 Add Seed Script to Package.json

Update `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 10.3 Run Seed Script

```bash
npm run db:seed
```

## Step 11: Set Up Backups and Monitoring

### 11.1 Configure Automated Backups

Supabase automatically handles database backups, but you can configure additional backups:

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Under **Backups**, you can:
   - View scheduled backups
   - Create on-demand backups
   - Configure point-in-time recovery

### 11.2 Set Up Monitoring

Create `src/app/api/health/route.ts`:

```typescript
// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`
    
    // Check Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      throw error
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        supabase: 'healthy',
        prisma: 'healthy'
      },
      version: '1.0.0'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
```

## Step 12: Security Best Practices

### 12.1 Environment Variables

Ensure your `.env` file is properly secured:

```env
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
JWT_SECRET=your-jwt-secret
```

### 12.2 Security Headers

Add security headers to `next.config.ts`:

```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

### 12.3 Rate Limiting

Implement rate limiting for API endpoints:

```typescript
// src/lib/rate-limit.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export class RateLimiter {
  private static instance: RateLimiter
  private requests: Map<string, { count: number; resetTime: number }> = new Map()

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  async checkLimit(identifier: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now()
    const windowStart = now - windowMs
    const key = `${identifier}:${Math.floor(windowStart / windowMs)}`

    const record = this.requests.get(key)
    
    if (!record || record.resetTime < now) {
      this.requests.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= limit) {
      return false
    }

    record.count++
    return true
  }
}

export const rateLimiter = RateLimiter.getInstance()
```

## Step 13: Testing the Setup

### 13.1 Test Database Connection

```bash
# Test Prisma connection
npm run db:studio

# Test API endpoints
curl http://localhost:3000/api/health
```

### 13.2 Test Authentication

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@demo-company.com", "password": "demo-password"}'
```

### 13.3 Test Real-time Features

Create a simple test to verify real-time subscriptions:

```typescript
// src/lib/test-realtime.ts
import { realtime } from '@/lib/realtime'

async function testRealtime() {
  console.log('Testing real-time subscriptions...')
  
  realtime.subscribeToThreats((event) => {
    console.log('Real-time threat event:', event)
  })

  // Simulate a threat creation (you can do this manually in the dashboard)
  console.log('Create a new threat in the Supabase dashboard to test')
}

testRealtime()
```

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify your Supabase URL and keys are correct
   - Check your network connection
   - Ensure your database is online in the Supabase dashboard

2. **Authentication Issues**
   - Verify your email/password combination
   - Check if the user exists in the database
   - Ensure RLS policies are correctly configured

3. **Real-time Not Working**
   - Ensure real-time is enabled on the tables
   - Check your network connection
   - Verify your Supabase project is on a supported plan

4. **Performance Issues**
   - Check your database indexes
   - Monitor your Supabase project usage
   - Consider upgrading your Supabase plan

### Getting Help

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Discord**: https://discord.gg/supabase
- **GitHub Issues**: Report bugs in the project repository
- **Community Forum**: Ask questions in the Supabase community

## Next Steps

After setting up Supabase:

1. **Deploy to Production**: Deploy your application to Vercel, Netlify, or your preferred platform
2. **Set Up Monitoring**: Configure application monitoring and alerting
3. **Configure CI/CD**: Set up automated testing and deployment
4. **Scale Your Database**: Monitor usage and upgrade your Supabase plan as needed
5. **Implement Advanced Features**: Add more sophisticated threat detection and analysis

## Production Checklist

Before going to production:

- [ ] Enable RLS on all tables
- [ ] Set up proper authentication
- [ ] Configure environment variables
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting
- [ ] Configure backups
- [ ] Test all API endpoints
- [ ] Verify real-time functionality
- [ ] Review security settings
- [ ] Update documentation

---

Your Probus Engine application is now ready to use with Supabase! The combination of Next.js, Prisma, and Supabase provides a powerful, scalable, and secure foundation for your AI-powered threat detection platform.