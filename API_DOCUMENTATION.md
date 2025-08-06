# Probus Engine API Documentation

## Overview

Probus Engine is a comprehensive AI-powered threat detection and analysis platform that helps organizations monitor communications, employee behavior, and custom applications for potential security threats and operational risks.

This documentation provides developers with the information needed to integrate Probus Engine into their applications and extend its functionality.

## Base URL

```
https://your-probus-engine-domain.com/api
```

## Authentication

Probus Engine uses JWT (JSON Web Token) for authentication. All API requests must include a valid JWT token in the Authorization header.

### Authentication Flow

1. **Login**: Obtain a JWT token by providing valid credentials
2. **Use Token**: Include the token in all subsequent API requests
3. **Refresh**: Refresh tokens before they expire

### Example Authentication

```javascript
// Login to get JWT token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await response.json();

// Use token in subsequent requests
const apiResponse = await fetch('/api/threats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
```

## API Endpoints

### 1. Authentication

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin"
  }
}
```

#### POST /api/auth/logout
Invalidate the current JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### 2. Threat Management

#### GET /api/threats
Retrieve all threats with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `severity` (optional): Filter by severity (critical, high, medium, low)
- `type` (optional): Filter by threat type
- `status` (optional): Filter by status
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "threats": [
    {
      "id": "threat_id",
      "type": "HARASSMENT",
      "severity": "HIGH",
      "title": "Threat title",
      "description": "Threat description",
      "source": "Gmail",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "OPEN",
      "language": "en",
      "metadata": {
        "sender": "sender@example.com",
        "recipients": ["recipient@example.com"]
      }
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### GET /api/threats/[id]
Retrieve a specific threat by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "threat": {
    "id": "threat_id",
    "type": "HARASSMENT",
    "severity": "HIGH",
    "title": "Threat title",
    "description": "Threat description",
    "source": "Gmail",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "OPEN",
    "language": "en",
    "metadata": {
      "sender": "sender@example.com",
      "recipients": ["recipient@example.com"],
      "content": "Email content...",
      "analysis": {
        "confidence": 0.85,
        "factors": ["inappropriate_language", "threatening_tone"]
      }
    }
  }
}
```

#### PUT /api/threats/[id]/status
Update threat status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "RESOLVED",
  "resolution": "Issue addressed with employee training"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Threat status updated successfully",
  "threat": {
    "id": "threat_id",
    "status": "RESOLVED",
    "resolution": "Issue addressed with employee training"
  }
}
```

### 3. Integrations

#### GET /api/integrations
Retrieve all configured integrations.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "integrations": [
    {
      "id": "integration_id",
      "name": "Gmail",
      "type": "EMAIL",
      "status": "ACTIVE",
      "config": {
        "email": "user@gmail.com",
        "scopes": ["readonly"]
      },
      "lastSync": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/integrations
Create a new integration.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Gmail",
  "type": "EMAIL",
  "config": {
    "email": "user@gmail.com",
    "clientId": "client_id",
    "clientSecret": "client_secret"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Integration created successfully",
  "integration": {
    "id": "integration_id",
    "name": "Gmail",
    "type": "EMAIL",
    "status": "PENDING",
    "config": {
      "email": "user@gmail.com"
    }
  }
}
```

#### POST /api/integrations/[id]/sync
Manually trigger synchronization for an integration.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Integration sync started",
  "syncId": "sync_id"
}
```

### 4. Reports

#### GET /api/reports
Generate reports with various filters.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` (optional): Report type (threats, communications, custom_apps)
- `startDate` (optional): Start date for report (ISO 8601 format)
- `endDate` (optional): End date for report (ISO 8601 format)
- `format` (optional): Output format (json, csv, pdf) - default: json

**Response:**
```json
{
  "report": {
    "id": "report_id",
    "type": "threats",
    "period": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "data": {
      "totalThreats": 45,
      "bySeverity": {
        "critical": 3,
        "high": 12,
        "medium": 20,
        "low": 10
      },
      "byType": {
        "HARASSMENT": 15,
        "INFORMATION_LEAKAGE": 10,
        "BURNOUT": 12,
        "FRAUD": 8
      },
      "trends": [
        {
          "date": "2024-01-01",
          "count": 5
        },
        {
          "date": "2024-01-02",
          "count": 8
        }
      ]
    },
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Communications Analysis

#### GET /api/communications
Retrieve communication analysis data.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `source` (optional): Filter by source (gmail, slack, teams)
- `type` (optional): Filter by type (email, chat)
- `language` (optional): Filter by language
- `limit` (optional): Number of results (default: 100)

**Response:**
```json
{
  "communications": [
    {
      "id": "comm_id",
      "source": "Gmail",
      "type": "email",
      "language": "en",
      "timestamp": "2024-01-15T10:30:00Z",
      "analysis": {
        "sentiment": "negative",
        "riskLevel": "medium",
        "threats": ["harassment"],
        "confidence": 0.75
      },
      "metadata": {
        "sender": "sender@example.com",
        "subject": "Email subject",
        "wordCount": 150
      }
    }
  ]
}
```

### 6. Health Check

#### GET /api/health
Check system health and status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "aiModels": "healthy",
    "integrations": "healthy",
    "storage": "healthy"
  },
  "version": "1.0.0"
}
```

### 7. Security Audit

#### GET /api/security/audit
Retrieve security audit logs.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `action` (optional): Filter by action type
- `user` (optional): Filter by user ID
- `startDate` (optional): Start date for audit
- `endDate` (optional): End date for audit

**Response:**
```json
{
  "audits": [
    {
      "id": "audit_id",
      "action": "LOGIN",
      "userId": "user_id",
      "timestamp": "2024-01-15T10:30:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "status": "SUCCESS",
      "details": {
        "method": "password",
        "mfa": false
      }
    }
  ]
}
```

### 8. Compliance

#### GET /api/compliance
Retrieve compliance status and reports.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `framework` (optional): Compliance framework (gdpr, hipaa, soc2)
- `period` (optional): Time period for compliance check

**Response:**
```json
{
  "compliance": {
    "framework": "GDPR",
    "overallScore": 85,
    "categories": [
      {
        "name": "Data Protection",
        "score": 90,
        "status": "COMPLIANT",
        "issues": []
      },
      {
        "name": "Access Control",
        "score": 75,
        "status": "NEEDS_ATTENTION",
        "issues": [
          "Some users have excessive permissions"
        ]
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## Webhooks

Probus Engine supports webhooks for real-time notifications about threats and system events.

### Setting Up Webhooks

1. **Configure Webhook URL**: Set your webhook endpoint in the Probus Engine settings
2. **Verify Webhook**: Probus Engine will send a verification request to your endpoint
3. **Handle Events**: Process incoming webhook events

### Webhook Event Types

#### threat.detected
Sent when a new threat is detected.

**Payload:**
```json
{
  "event": "threat.detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "threat": {
      "id": "threat_id",
      "type": "HARASSMENT",
      "severity": "HIGH",
      "title": "Threat title",
      "description": "Threat description",
      "source": "Gmail"
    }
  }
}
```

#### threat.resolved
Sent when a threat is resolved.

**Payload:**
```json
{
  "event": "threat.resolved",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "threat": {
      "id": "threat_id",
      "resolution": "Issue addressed with employee training"
    }
  }
}
```

#### integration.status_changed
Sent when an integration status changes.

**Payload:**
```json
{
  "event": "integration.status_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "integration": {
      "id": "integration_id",
      "name": "Gmail",
      "oldStatus": "ACTIVE",
      "newStatus": "ERROR"
    }
  }
}
```

### Webhook Verification

Probus Engine includes a signature in the `X-Probus-Signature` header to verify webhook authenticity.

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return signature === `sha256=${digest}`;
}
```

## SDK Integration

### JavaScript/TypeScript SDK

```javascript
import ProbusEngine from 'probus-engine-sdk';

// Initialize the SDK
const probus = new ProbusEngine({
  baseUrl: 'https://your-probus-engine-domain.com/api',
  token: 'your_jwt_token'
});

// Get threats
const threats = await probus.threats.list({
  severity: 'high',
  limit: 10
});

// Create integration
const integration = await probus.integrations.create({
  name: 'Gmail',
  type: 'EMAIL',
  config: {
    email: 'user@gmail.com',
    clientId: 'client_id',
    clientSecret: 'client_secret'
  }
});

// Generate report
const report = await probus.reports.generate({
  type: 'threats',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### Python SDK

```python
from probus_engine import ProbusEngine

# Initialize the SDK
probus = ProbusEngine(
    base_url='https://your-probus-engine-domain.com/api',
    token='your_jwt_token'
)

# Get threats
threats = probus.threats.list(
    severity='high',
    limit=10
)

# Create integration
integration = probus.integrations.create(
    name='Gmail',
    type='EMAIL',
    config={
        'email': 'user@gmail.com',
        'client_id': 'client_id',
        'client_secret': 'client_secret'
    }
)

# Generate report
report = probus.reports.generate(
    type='threats',
    start_date='2024-01-01',
    end_date='2024-01-31'
)
```

## Error Handling

Probus Engine uses standard HTTP status codes and provides detailed error information.

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Common Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request parameters |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

## Rate Limiting

Probus Engine implements rate limiting to ensure fair usage and system stability.

### Rate Limits

- **Authentication endpoints**: 5 requests per minute
- **Read operations**: 100 requests per minute
- **Write operations**: 50 requests per minute
- **Webhook endpoints**: 1000 requests per minute

### Rate Limit Headers

Probus Engine includes rate limit information in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1642254400
```

## Best Practices

### 1. Security
- Always use HTTPS for API calls
- Store JWT tokens securely
- Implement proper token refresh logic
- Validate all input data
- Use webhook signature verification

### 2. Performance
- Implement caching for frequently accessed data
- Use pagination for large datasets
- Batch operations when possible
- Implement retry logic with exponential backoff

### 3. Error Handling
- Implement comprehensive error handling
- Log errors for debugging
- Provide user-friendly error messages
- Monitor API usage and errors

### 4. Integration
- Use webhooks for real-time updates
- Implement proper error recovery
- Monitor integration health
- Keep integrations up to date

## Troubleshooting

### Common Issues

#### Authentication Failures
- Verify JWT token is valid and not expired
- Check token is included in Authorization header
- Ensure user has proper permissions

#### Rate Limiting
- Implement proper retry logic
- Monitor usage patterns
- Consider increasing limits for enterprise accounts

#### Integration Issues
- Verify integration configuration
- Check API credentials are valid
- Monitor integration sync status

#### Webhook Issues
- Verify webhook URL is accessible
- Check webhook signature verification
- Monitor webhook delivery logs

### Support

For API support and issues:
- **Documentation**: Check this documentation first
- **Status Page**: Monitor system status at status.probusengine.com
- **Support Email**: api-support@probusengine.com
- **Community**: Join our developer community at community.probusengine.com

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Core threat detection functionality
- Integration management
- Reporting and analytics
- Webhook support
- SDK availability

---

For the most up-to-date information, visit our developer portal at [developers.probusengine.com](https://developers.probusengine.com)