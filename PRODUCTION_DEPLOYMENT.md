# 🚀 Production Deployment Guide - Mail Service

## Overview

This mail service has been upgraded to production-grade with the following features:

### ✅ Implemented Features

1. **Database Persistence** - PostgreSQL/SQLite with Prisma ORM
2. **Authentication** - JWT tokens and API key authentication
3. **Rate Limiting** - Per-endpoint and per-user rate limiting
4. **Background Jobs** - Bull queue for email processing with Redis
5. **Webhook System** - Event delivery with retry logic
6. **Analytics Tracking** - Email opens, clicks, and delivery tracking
7. **Domain Verification** - SPF, DKIM, DMARC support
8. **Health Monitoring** - Comprehensive health check endpoints
9. **Input Validation** - Zod schemas for all API endpoints
10. **Security** - CORS, CSP, and security headers
11. **CI/CD Pipeline** - GitHub Actions for automated testing and deployment
12. **Error Handling** - Centralized error handling with Winston logging
13. **Database Seeding** - Sample data for development and testing

## Prerequisites

- Node.js 18+
- PostgreSQL 15+ (production) or SQLite (development)
- Redis 7+ (for Bull queue)
- SMTP server access (Gmail, SendGrid, etc.)

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local` for local development or `.env.production` for production:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mailservice?schema=public"

# Redis (for Bull queue)
REDIS_URL="redis://localhost:6379"
# Or separate config:
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=your-password

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email Settings
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Company Name

# Security
API_SECRET_KEY=generate-a-32-character-secret-key-here
JWT_SECRET=generate-another-32-character-secret-here
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Public Access (NOT RECOMMENDED for production)
ALLOW_PUBLIC_ACCESS=false

# Rate Limiting
REQUESTS_PER_MINUTE=60
REQUESTS_PER_HOUR=1000
EMAILS_PER_DAY=10000

# Queue Settings
QUEUE_CONCURRENCY=5
RETRY_ATTEMPTS=3
RETRY_DELAY=5000

# Monitoring
LOG_LEVEL=info
LOG_FILE=logs/mail-service.log
ENABLE_ANALYTICS=true

# Webhooks
WEBHOOK_SECRET=your-webhook-secret

# Application
BASE_URL=https://yourdomain.com
PORT=3000
NODE_ENV=production
```

### 3. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed database with sample data (optional)
npm run db:seed
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f mail-api-server

# Stop services
docker-compose down
```

## API Authentication

### 1. Generate API Keys

API keys are created during database seeding. You can also create them programmatically:

```javascript
// The seed script creates these keys:
// - Production: sk_live_xxxxx (all permissions)
// - Development: sk_test_xxxxx (limited permissions)
// - Admin: sk_live_xxxxx (admin permissions)
```

### 2. Using API Keys

Include the API key in the Authorization header:

```bash
curl -X POST https://yourdomain.com/api/send \
  -H "Authorization: Bearer sk_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Hello World",
    "html": "<p>This is a test email</p>"
  }'
```

### 3. JWT Authentication

For user-based authentication:

```javascript
// Generate JWT token
const token = jwt.sign(
  { userId: '123', email: 'user@example.com', permissions: ['send'] },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Use in requests
fetch('/api/send', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Health Monitoring

### Health Check Endpoints

```bash
# Simple health check
GET /api/health

# Detailed health check with metrics
GET /api/health?detailed=true

# Liveness probe (for Kubernetes)
HEAD /api/health
```

### Response Example

```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T12:00:00Z",
  "version": "2.0.0",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "up",
      "latency": 5
    },
    "smtp": {
      "status": "up",
      "latency": 120
    },
    "queue": {
      "status": "up",
      "details": {
        "waiting": 10,
        "active": 2,
        "completed": 1000
      }
    }
  }
}
```

## Email Analytics

### Tracking Setup

Emails automatically include:
- Open tracking pixel
- Click tracking for links
- Delivery confirmation

### Analytics Endpoints

```bash
# Get analytics data
GET /api/analytics?timeRange=30d

# Track email events (webhook endpoint)
POST /api/analytics/track
```

## Domain Verification

### 1. Add Domain

```bash
POST /api/domains
{
  "name": "yourdomain.com"
}
```

### 2. Configure DNS Records

Add the following DNS records:

```
# SPF Record
TXT @ "v=spf1 include:_spf.yourdomain.com ~all"

# DKIM Record
TXT mail._domainkey "v=DKIM1; k=rsa; p=MIGfMA0GCSq..."

# DMARC Record
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"

# Domain Verification
TXT _mail-verification "mail-verify=xxxxx"
```

### 3. Verify Domain

```bash
PATCH /api/domains
{
  "id": "domain-id",
  "action": "verify"
}
```

## Monitoring & Alerts

### Recommended Monitoring Setup

1. **Application Monitoring**
   - Use PM2 for process management
   - Configure alerts for crashes/restarts
   - Monitor memory and CPU usage

2. **Queue Monitoring**
   - Monitor Bull queue metrics
   - Alert on failed jobs > threshold
   - Track queue processing time

3. **Email Metrics**
   - Track delivery rates
   - Monitor bounce rates
   - Alert on unusual patterns

### PM2 Configuration

```json
{
  "apps": [{
    "name": "mail-service",
    "script": "npm",
    "args": "start",
    "instances": 2,
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production"
    },
    "error_file": "logs/pm2-error.log",
    "out_file": "logs/pm2-out.log",
    "merge_logs": true,
    "max_memory_restart": "1G"
  }]
}
```

## Security Best Practices

1. **API Keys**
   - Rotate keys regularly
   - Use different keys for different environments
   - Implement key expiration

2. **Rate Limiting**
   - Configure appropriate limits per endpoint
   - Implement IP-based rate limiting
   - Monitor for abuse patterns

3. **Input Validation**
   - All inputs are validated with Zod
   - HTML content is sanitized
   - File uploads are restricted

4. **Network Security**
   - Use HTTPS in production
   - Configure firewall rules
   - Implement DDoS protection

## Backup & Recovery

### Database Backups

```bash
# PostgreSQL backup
pg_dump mailservice > backup.sql

# Restore
psql mailservice < backup.sql
```

### Redis Backups

```bash
# Save Redis data
redis-cli BGSAVE

# Backup location: /var/lib/redis/dump.rdb
```

## Troubleshooting

### Common Issues

1. **SMTP Connection Fails**
   - Check firewall rules for SMTP ports
   - Verify credentials
   - Enable "Less secure app access" for Gmail

2. **Queue Processing Stops**
   - Check Redis connection
   - Monitor Bull dashboard
   - Check for stuck jobs

3. **High Memory Usage**
   - Implement queue cleanup
   - Monitor for memory leaks
   - Adjust concurrency settings

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

## Performance Optimization

1. **Database**
   - Add indexes for frequently queried fields
   - Implement connection pooling
   - Use read replicas for analytics

2. **Queue**
   - Adjust concurrency based on load
   - Implement priority queues
   - Use separate queues for different job types

3. **Caching**
   - Cache template compilations
   - Implement Redis caching for analytics
   - Use CDN for static assets

## Scaling

### Horizontal Scaling

1. **Application Servers**
   - Deploy multiple instances
   - Use load balancer (Nginx, HAProxy)
   - Implement session persistence

2. **Queue Workers**
   - Run separate worker processes
   - Scale workers based on queue size
   - Implement job distribution

3. **Database**
   - Use connection pooling
   - Implement read/write splitting
   - Consider sharding for large datasets

## Support

For production support:
1. Check health endpoints
2. Review application logs
3. Monitor queue status
4. Check database connectivity
5. Verify SMTP configuration

---

**🎉 Your mail service is now production-ready!**

For additional features or customization, refer to the codebase documentation or create an issue in the repository.