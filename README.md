# 📧 Mail Service - Your Own Email API (No Coding Required!)

> **Created by [@vladamisici](https://github.com/vladamisici)**

A self-hosted email service API that's as easy to set up as installing an app. Send emails from your websites, apps, or automation tools - just like SendGrid or Mailgun, but you own it forever!

## 🌟 Why Mail Service?

- **💰 Free Forever** - No monthly fees, no limits, no surprises
- **🚀 5-Minute Setup** - Our wizard guides you through everything
- **🔒 Your Data, Your Control** - Everything runs on your servers
- **📊 Professional Features** - Templates, analytics, scheduling, and more
- **👶 Beginner-Friendly** - No programming knowledge required!

## 🎯 Perfect For

- **Small Businesses** - Send invoices, newsletters, and notifications
- **Developers** - Integrate email into your apps without third-party services
- **Automation Enthusiasts** - Connect to Zapier, Make.com, or n8n
- **Anyone** - Who wants to send emails programmatically!

## 🚀 Quick Start (The Super Easy Way)

### Option 1: One-Click Deploy (Recommended for Beginners)

Choose your favorite platform and click to deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vladamisici/mailing-service&env=DATABASE_URL,SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS,EMAIL_FROM,EMAIL_FROM_NAME,JWT_SECRET&envDescription=Email%20Service%20Configuration&envLink=https://github.com/vladamisici/mailing-service/blob/main/.env.example)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/mailing-service)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/vladamisici/mailing-service)

### Option 2: Run on Your Computer (For Testing)

1. **Install Node.js** (if you don't have it)
   - Go to [nodejs.org](https://nodejs.org/)
   - Download and install the LTS version

2. **Download This Project**
   - Click the green "Code" button above
   - Click "Download ZIP"
   - Extract the ZIP file

3. **Open Terminal/Command Prompt**
   - Windows: Press `Win+R`, type `cmd`, press Enter
   - Mac: Press `Cmd+Space`, type `terminal`, press Enter

4. **Navigate to the Project**
   ```bash
   cd path/to/mailing-service
   ```

5. **Run the Setup**
   ```bash
   npm install
   npm run setup
   ```

6. **Start the Service**
   ```bash
   npm run dev
   ```

7. **Open Your Browser**
   - Go to [http://localhost:3000](http://localhost:3000)
   - Click "Start Setup Wizard"

## 📱 Setting Up Your Email Provider

The setup wizard will guide you, but here's what you'll need:

### Gmail (Personal Account)
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" → "2-Step Verification" (turn it on)
3. Click "App passwords"
4. Select "Mail" and your device
5. Copy the generated password

### SendGrid (Free Professional Service)
1. Sign up at [sendgrid.com](https://signup.sendgrid.com/) (free)
2. Go to Settings → API Keys
3. Create a new API key
4. Use `apikey` as username and your API key as password

### Brevo/Sendinblue (300 free emails/day)
1. Sign up at [brevo.com](https://www.brevo.com/free-smtp-server/)
2. Go to SMTP & API section
3. Create SMTP credentials
4. Use the provided login and password

## 🎮 How to Use Your Email Service

### Send an Email (Using Our Web Interface)

1. Go to your service URL (e.g., `https://your-app.vercel.app`)
2. Click on "Dashboard" or "Send Email"
3. Fill in:
   - To: recipient@example.com
   - Subject: Your subject
   - Message: Your email content
4. Click "Send"!

### Send an Email (From Your Code)

**JavaScript/Node.js:**
```javascript
fetch('https://your-service.com/api/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello!',
    text: 'This is my email content'
  })
});
```

**Python:**
```python
import requests

requests.post('https://your-service.com/api/send',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={
    'to': 'recipient@example.com',
    'subject': 'Hello!',
    'text': 'This is my email content'
  }
)
```

**No-Code (Zapier/Make.com):**
1. Add a "Webhook" action
2. Set URL: `https://your-service.com/api/send`
3. Method: POST
4. Headers: `Authorization: Bearer YOUR_API_KEY`
5. Body: Your email data

## 📊 Features

### What You Can Do
- ✅ Send single emails
- ✅ Send bulk emails (up to 1000 at once)
- ✅ Use HTML templates
- ✅ Schedule emails for later
- ✅ Track opens and clicks
- ✅ Manage multiple API keys
- ✅ View email history
- ✅ Download analytics reports

### Email Options
```json
{
  "to": "recipient@example.com",
  "cc": "cc@example.com",
  "bcc": "bcc@example.com",
  "subject": "Your Subject",
  "text": "Plain text version",
  "html": "<h1>HTML version</h1>",
  "from": "custom@yourdomain.com",
  "replyTo": "replies@yourdomain.com",
  "attachments": [...],
  "scheduledFor": "2024-12-25T00:00:00Z"
}
```

## 🛠️ Configuration

### Environment Variables (Set During Setup)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection | `postgresql://user:pass@host:5432/db` |
| `SMTP_HOST` | Email server | `smtp.gmail.com` |
| `SMTP_PORT` | Email port | `587` |
| `SMTP_USER` | Email username | `your-email@gmail.com` |
| `SMTP_PASS` | Email password | `your-app-password` |
| `JWT_SECRET` | Security key | `random-32-character-string` |

## 🔒 Security Best Practices

1. **Keep Your API Keys Secret** - Never share them publicly
2. **Use HTTPS** - All cloud platforms provide this automatically
3. **Set Rate Limits** - Prevents abuse (already configured)
4. **Regular Updates** - Update dependencies monthly

## 🆘 Troubleshooting

### "Cannot connect to SMTP server"
- Double-check your email provider settings
- For Gmail, make sure you're using an App Password
- Try port 465 if 587 doesn't work

### "Database connection failed"
- Make sure your database URL is correct
- For cloud deployments, the database is usually automatic

### "API returns 401 Unauthorized"
- Check that you're using the correct API key
- Make sure you include "Bearer " before the key

## 📚 Advanced Usage

### Using Templates

Create reusable email templates:

```javascript
// Create a template
POST /api/templates
{
  "name": "welcome",
  "subject": "Welcome, {{name}}!",
  "html": "<h1>Hello {{name}}</h1><p>Thanks for joining!</p>"
}

// Send using template
POST /api/send
{
  "to": "user@example.com",
  "template": "welcome",
  "variables": {
    "name": "John"
  }
}
```

### Webhooks

Get notified when emails are opened or links clicked:

```javascript
POST /api/webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["email.opened", "email.clicked", "email.bounced"]
}
```

## 🌟 Pro Tips

1. **Start Small** - Test with your own email first
2. **Monitor Your Limits** - Most email providers have daily limits
3. **Use Templates** - Save time with reusable designs
4. **Enable Analytics** - Track what works
5. **Backup API Keys** - Store them securely

## 🤝 Getting Help

- **Documentation**: Check `/docs` on your deployed service
- **Issues**: [GitHub Issues](https://github.com/vladamisici/mailing-service/issues)
- **Community**: Join our [Discord](https://discord.gg/mailservice)

## 📄 License

This project is licensed under the MIT License - you're free to use it however you want!

## 🙏 Credits

Created with ❤️ by [@vladamisici](https://github.com/vladamisici)

If you find this useful, please give it a ⭐️ on GitHub!

---

**Remember**: This is YOUR email service now. No limits, no monthly fees, just emails! 🚀