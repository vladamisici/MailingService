# 📧 Modern Mail Service - Next.js Edition

A professional email service built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**. Features a beautiful Apple-inspired design with proper routing, component architecture, and advanced email management capabilities.

## ✨ Features

- 🎨 **Modern Apple-inspired UI** with dark mode support
- 📧 **Multiple Email Types**: Single, Bulk, and Template emails
- ⚙️ **Live Configuration**: Edit environment variables from the web interface
- 📊 **Real-time Analytics**: Live statistics and queue monitoring
- 🔄 **Queue Management**: Automatic retry with exponential backoff
- 📝 **Template System**: Customizable email templates with variables
- 🛡️ **Security**: Built-in rate limiting and validation
- 📱 **Responsive**: Works perfectly on all devices
- 🌙 **Dark Mode**: Automatic dark/light theme support
- 🚀 **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS

## 🚀 Quick Start

### 1. Installation

```bash
cd mail-service-nextjs
npm install
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your SMTP settings
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Navigation & Features

The application features a modern tabbed interface with proper routing:

### 📧 **Single Email Tab**
- Send individual emails with HTML or plain text
- Real-time form validation
- Instant feedback and status updates

### 👥 **Bulk Email Tab**
- Send the same email to multiple recipients
- Automatic recipient count detection
- Batch processing with queue management

### 📝 **Template Tab**
- Use predefined email templates
- Variable substitution (name, company, date, etc.)
- JSON-based variable configuration

### ⚙️ **Configuration Tab** *(New!)*
- Edit SMTP settings directly from the web interface
- Real-time environment variable management
- Automatic .env.local file updates
- No more manual file editing!

### 🎨 **Templates Tab** *(New!)*
- Customize email templates
- Live preview functionality
- Variable management system

### 📚 **README Tab** *(New!)*
- View and edit documentation
- Markdown support with toolbar
- Live editing capabilities

### 🖥️ **Server Tab** *(New!)*
- Real-time server monitoring
- Memory usage and uptime tracking
- Development server management

## 🔧 API Endpoints

All API endpoints are built with Next.js App Router:

- `GET /api/stats` - Email statistics
- `GET /api/queue` - Current queue status
- `POST /api/send` - Send single email
- `POST /api/send/bulk` - Send bulk emails
- `POST /api/send/template` - Send template email
- `GET /api/templates` - List available templates
- `GET /api/config` - Get configuration
- `POST /api/config` - Update configuration
- `GET /api/server/status` - Server status

## 🎨 Design System

Built with Apple's Human Interface Guidelines:

- **Typography**: Inter font with proper weights and spacing
- **Colors**: Apple's color palette with dark mode support
- **Shadows**: Subtle, layered shadows for depth
- **Animations**: Smooth, purposeful transitions
- **Icons**: Lucide React icons for consistency
- **Layout**: Responsive grid system with proper spacing

## 🔧 Environment Variables

Configure these in your `.env.local` file or through the Configuration tab:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sender Configuration
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your Company Name
```

## 📱 Mobile Support

- Fully responsive design
- Touch-optimized interface
- Progressive Web App ready
- Apple mobile web app support

## 🛠️ Development

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Email**: Nodemailer
- **Logging**: Winston

### Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/
│   ├── tabs/         # Tab components
│   ├── Navigation.tsx
│   ├── StatsCards.tsx
│   ├── EmailTabs.tsx
│   └── QueueDisplay.tsx
└── lib/
    └── email.ts      # Email logic and queue
```

### Key Improvements over Express Version

1. **Better Routing**: Automatic routing with Next.js App Router
2. **Component Architecture**: Reusable React components
3. **Type Safety**: Full TypeScript support
4. **Modern UI**: Apple-inspired design system
5. **Better Performance**: Next.js optimizations
6. **Developer Experience**: Hot reloading, better debugging

## 🚀 Production Deployment

### Vercel (Recommended)

```bash
npm run build
npx vercel --prod
```

### Docker

```bash
docker build -t mail-service-nextjs .
docker run -p 3000:3000 mail-service-nextjs
```

### Traditional Server

```bash
npm run build
npm start
```

## 🔒 Security Features

- **CSRF Protection**: Built-in Next.js protection
- **Rate Limiting**: Configurable request limits
- **Input Validation**: TypeScript and runtime validation
- **Environment Security**: .env.local not committed
- **Headers**: Security headers via Next.js

## 📊 Monitoring

- **Real-time Stats**: Live email statistics
- **Queue Monitoring**: Visual queue status
- **Server Health**: Memory and uptime tracking
- **Error Handling**: Comprehensive error logging

## 🎯 Differences from Express Version

| Feature | Express Version | Next.js Version |
|---------|----------------|-----------------|
| Routing | Manual setup | Automatic App Router |
| UI Framework | Vanilla HTML/CSS/JS | React + TypeScript |
| Styling | Custom CSS | Tailwind CSS |
| Components | None | Reusable React components |
| Type Safety | None | Full TypeScript |
| Development | Manual refresh | Hot reloading |
| Production | Manual optimization | Automatic optimization |
| Configuration UI | Basic forms | Advanced configuration management |

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Kill existing processes
npx kill-port 3000
# Or use a different port
PORT=3001 npm run dev
```

**SMTP Configuration:**
- Use the Configuration tab to set up SMTP
- For Gmail: Enable 2FA and use app-specific password
- Changes are saved to `.env.local` automatically

**Build Issues:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📄 License

MIT License - Built with ❤️ for modern email management

---

**🎉 Enjoy your modern, Apple-inspired email service!**

Access the dashboard at: **http://localhost:3000**