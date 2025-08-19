# 🚀 Production Deployment Guide

## Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit with your settings
nano .env.local
```

### 2. Required Environment Variables
```bash
# SMTP Configuration (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Company Name

# Security (Required)
API_SECRET_KEY=your-super-secret-key-change-this
JWT_SECRET=your-jwt-secret-key

# Public Access (Optional - Security Risk)
ALLOW_PUBLIC_ACCESS=false
```

### 3. Docker Deployment (Recommended)

#### Quick Start
```bash
# Build and run
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f mail-api-server
```

#### Production Setup
```bash
# Create production environment file
cp env.example .env.production

# Edit production settings
nano .env.production

# Deploy with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Manual Deployment

#### Install Dependencies
```bash
npm install --production
```

#### Build Application
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

## 🔐 Security Configuration

### API Authentication
The server supports multiple authentication modes:

1. **API Key Authentication** (Recommended)
   - Generate API keys in the Settings tab
   - Use `Authorization: Bearer sk_live_...` header
   - Keys can be scoped with permissions

2. **Public Access** (Not Recommended)
   - Set `ALLOW_PUBLIC_ACCESS=true`
   - ⚠️ **Security Risk**: Anyone can send emails
   - Only use for internal networks

### Rate Limiting
Configure in environment:
```bash
REQUESTS_PER_MINUTE=60
REQUESTS_PER_HOUR=1000
EMAILS_PER_DAY=10000
```

### CORS Configuration
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```bash
curl http://localhost:3000/api/server/status
```

### Metrics Endpoints
- `/api/stats` - Email statistics
- `/api/queue` - Queue status
- `/api/analytics` - Detailed analytics

### Docker Health Checks
Built-in health checks monitor:
- Server responsiveness
- SMTP connectivity
- Queue processing

## 🔧 Configuration Options

### SMTP Settings
```bash
SMTP_HOST=smtp.gmail.com          # SMTP server
SMTP_PORT=587                     # Port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                 # Use SSL (true/false)
SMTP_USER=your-email@gmail.com    # SMTP username
SMTP_PASS=your-app-password       # SMTP password/app password
```

### Queue Configuration
```bash
QUEUE_CONCURRENCY=5               # Concurrent email processing
RETRY_ATTEMPTS=3                  # Max retry attempts
RETRY_DELAY=5000                  # Delay between retries (ms)
```

### Logging
```bash
LOG_LEVEL=info                    # debug, info, warn, error
LOG_FILE=logs/mail-service.log    # Log file path
```

## 🌐 Domain Setup

### DNS Records
For production email sending, configure:

1. **SPF Record**
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **DKIM Record**
   ```
   Generated in Settings > Domain Management
   ```

3. **DMARC Record**
   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

### Domain Verification
1. Go to Settings > Domain Management
2. Add your sending domain
3. Copy the provided DNS records
4. Add records to your DNS provider
5. Click "Verify" to confirm setup

## 📈 Scaling & Performance

### Horizontal Scaling
- Deploy multiple instances behind a load balancer
- Use shared Redis for rate limiting
- Use shared database for persistence

### Database Integration
Replace in-memory storage with PostgreSQL:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/mailservice
```

### Redis Caching
Enable Redis for better performance:
```bash
REDIS_URL=redis://localhost:6379
```

## 🔍 Troubleshooting

### Common Issues

#### SMTP Authentication Fails
- Use app-specific passwords for Gmail
- Check firewall settings for SMTP ports
- Verify SMTP credentials

#### API Key Issues
- Ensure proper `Bearer` token format
- Check API key permissions
- Verify key is active

#### Rate Limiting
- Check `X-RateLimit-Remaining` header
- Adjust rate limits in environment
- Consider upgrading API key limits

### Debug Mode
```bash
LOG_LEVEL=debug
NODE_ENV=development
```

### Logs Location
- Docker: `docker-compose logs mail-api-server`
- Manual: `./logs/mail-service.log`
- Console: Set `LOG_LEVEL=debug`

## 🚨 Production Checklist

### Before Deployment
- [ ] Set strong `API_SECRET_KEY`
- [ ] Configure proper SMTP settings
- [ ] Set up domain DNS records
- [ ] Configure rate limits
- [ ] Set `ALLOW_PUBLIC_ACCESS=false`
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring
- [ ] Configure backups

### After Deployment
- [ ] Test email sending
- [ ] Verify API authentication
- [ ] Check health endpoints
- [ ] Monitor logs for errors
- [ ] Test rate limiting
- [ ] Verify webhook delivery
- [ ] Check analytics data

## 📞 Support

### API Documentation
- Interactive docs: `http://localhost:3000/` (API Docs tab)
- Swagger/OpenAPI: Available in web interface

### Monitoring
- Server status: `/api/server/status`
- Queue monitoring: Web interface > Monitoring tab
- Analytics: Web interface > Analytics tab

### Backup
- Export templates: API or web interface
- Database backups: If using PostgreSQL
- Configuration: Backup `.env` files

## 🔄 Updates

### Update Process
```bash
# Pull latest code
git pull origin main

# Update dependencies
npm install

# Rebuild application
npm run build

# Restart service
docker-compose restart mail-api-server
```

### Version Management
- Check current version: `/api/server/status`
- Release notes: GitHub releases
- Breaking changes: Check CHANGELOG.md
