'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, Shield, Globe, Server, Database, Mail, Key, Book, Github, Zap, Settings } from 'lucide-react';

interface SetupStatus {
  database: boolean;
  redis: boolean;
  smtp: boolean;
  apiKeys: boolean;
  security: boolean;
  publicAccess: boolean;
  ipAddress?: string;
  isPublic?: boolean;
}

export default function LandingPage() {
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    database: false,
    redis: false,
    smtp: false,
    apiKeys: false,
    security: false,
    publicAccess: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      // Check database connection
      const dbRes = await fetch('/api/health/detailed');
      const dbData = await dbRes.json();
      
      // Check public IP and exposure
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      
      // Check if API is publicly accessible
      const publicCheckRes = await fetch('/api/health', {
        headers: {
          'X-Forwarded-For': ipData.ip
        }
      });
      
      setSetupStatus({
        database: dbData.checks?.database?.healthy || false,
        redis: dbData.checks?.redis?.healthy || false,
        smtp: dbData.checks?.smtp?.healthy || false,
        apiKeys: dbData.checks?.apiKeys?.count > 0 || false,
        security: process.env.NEXT_PUBLIC_JWT_SECRET !== undefined,
        publicAccess: process.env.NEXT_PUBLIC_ALLOW_PUBLIC_ACCESS === 'true',
        ipAddress: ipData.ip,
        isPublic: publicCheckRes.ok && !publicCheckRes.headers.get('authorization'),
      });
    } catch (error) {
      console.error('Setup check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Mail,
      title: 'Email Sending',
      description: 'Send single or bulk emails with templates, scheduling, and attachments',
    },
    {
      icon: Shield,
      title: 'Security First',
      description: 'API key authentication, rate limiting, and comprehensive input validation',
    },
    {
      icon: Zap,
      title: 'Real-time Analytics',
      description: 'Track opens, clicks, bounces, and engagement metrics in real-time',
    },
    {
      icon: Server,
      title: 'Enterprise Grade',
      description: 'Redis queue, PostgreSQL storage, Docker support, and CI/CD pipelines',
    },
  ];

  const setupSteps = [
    {
      title: 'Database Connection',
      key: 'database',
      description: 'PostgreSQL or SQLite database configured and migrations run',
      command: 'npx prisma migrate dev && npx prisma db seed',
    },
    {
      title: 'Redis Queue',
      key: 'redis',
      description: 'Redis server running for email queue management',
      command: 'docker run -p 6379:6379 redis:alpine',
    },
    {
      title: 'SMTP Configuration',
      key: 'smtp',
      description: 'Valid SMTP credentials configured in environment',
      command: 'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env',
    },
    {
      title: 'API Keys',
      key: 'apiKeys',
      description: 'At least one API key created for authentication',
      command: 'Create via web UI or POST /api/keys',
    },
    {
      title: 'Security Settings',
      key: 'security',
      description: 'JWT secret and security headers configured',
      command: 'Set JWT_SECRET (32+ chars) in .env',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl">
              Self-Hosted
              <span className="text-blue-600"> Mailing Service</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Your own email service API with enterprise features. Alternative to SendGrid, Resend, or Mailgun
              with complete control over your email infrastructure.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <a
                href="/setup"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Setup Wizard
              </a>
              <a
                href="#documentation"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300"
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </div>

      {/* Public Access Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-lg p-6 ${setupStatus.isPublic ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-green-50 border-2 border-green-300'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className={`h-8 w-8 ${setupStatus.isPublic ? 'text-yellow-600' : 'text-green-600'} mr-4`} />
              <div>
                <h3 className={`text-lg font-semibold ${setupStatus.isPublic ? 'text-yellow-900' : 'text-green-900'}`}>
                  API Access Status
                </h3>
                <p className={`text-sm ${setupStatus.isPublic ? 'text-yellow-700' : 'text-green-700'}`}>
                  {setupStatus.isPublic 
                    ? 'Your API is publicly accessible from the internet' 
                    : 'Your API is secured and requires authentication'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Your IP Address</p>
              <p className="font-mono text-lg">{setupStatus.ipAddress || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need for Production Email
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Setup Progress
        </h2>
        
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              {setupSteps.map((step) => {
                const isComplete = setupStatus[step.key as keyof SetupStatus] as boolean;
                return (
                  <div key={step.key} className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {isComplete ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {!isComplete && (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                          {step.command}
                        </code>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.values(setupStatus).filter(Boolean).length} / {setupSteps.length} Complete
              </div>
              <div className="mt-2 text-gray-600">
                {Object.values(setupStatus).every(Boolean) 
                  ? 'Your mailing service is ready to use!' 
                  : 'Complete the remaining steps to start sending emails'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Start */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="documentation">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Quick Start Guide
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Install & Setup</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`# Clone the repository
git clone https://github.com/yourusername/mailing-service.git
cd mailing-service

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev`}
            </pre>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Send Your First Email</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`curl -X POST http://localhost:3000/api/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello World",
    "html": "<h1>Welcome!</h1>",
    "text": "Welcome to our service!"
  }'`}
            </pre>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Resources & Documentation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="/api-docs" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <Book className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
              <p className="text-gray-400 text-sm">Complete API reference with examples and response schemas</p>
            </a>
            
            <a href="https://github.com/yourusername/mailing-service" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <Github className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">GitHub Repository</h3>
              <p className="text-gray-400 text-sm">Source code, issues, and contribution guidelines</p>
            </a>
            
            <a href="/admin" className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <Settings className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Admin Dashboard</h3>
              <p className="text-gray-400 text-sm">Manage API keys, templates, and monitor email delivery</p>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm mb-2">
            Built with Next.js, TypeScript, Prisma, and Redis.
            Licensed under MIT.
          </p>
          <p className="text-sm">
            Created by <a href="https://github.com/vladamisici" className="text-blue-400 hover:text-blue-300 transition-colors" target="_blank" rel="noopener noreferrer">@vladamisici</a>
          </p>
        </div>
      </footer>
    </div>
  );
}