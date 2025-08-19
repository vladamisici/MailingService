'use client';

import { useState, useEffect } from 'react';
import { 
  Globe, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Code,
  Server,
  Shield
} from 'lucide-react';

export default function PublicApiInfo() {
  const [baseUrl, setBaseUrl] = useState('http://localhost:3000');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/send',
      description: 'Send a single email',
      example: {
        to: 'user@example.com',
        subject: 'Hello from your API',
        text: 'This is a test email!'
      }
    },
    {
      method: 'POST',
      path: '/api/send/bulk',
      description: 'Send emails to multiple recipients',
      example: {
        emails: [
          {
            to: 'user1@example.com',
            subject: 'Bulk Email 1',
            text: 'First email'
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/server/status',
      description: 'Check server health and status',
      example: null
    },
    {
      method: 'GET',
      path: '/api/stats',
      description: 'Get email sending statistics',
      example: null
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-apple-slide-up">
      {/* Header */}
      <div className="mb-8 text-center">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 apple-shadow-lg"
          style={{ background: 'rgb(var(--apple-blue))' }}
        >
          <Globe className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
          Public API Access
        </h1>
        <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
          Your email API is now publicly accessible. Use these endpoints to integrate with external applications.
        </p>
      </div>

      {/* Security Warning */}
      <div 
        className="mb-8 p-4 rounded-xl apple-border"
        style={{ background: 'rgb(var(--apple-red) / 0.1)' }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <AlertTriangle className="h-5 w-5" style={{ color: 'rgb(var(--apple-red))' }} />
          <h3 className="apple-font-semibold" style={{ color: 'rgb(var(--apple-red))' }}>
            Security Notice
          </h3>
        </div>
        <p className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-red))' }}>
          Your server is exposed to the internet. Anyone can send emails through your API. 
          Consider using API keys for additional security.
        </p>
      </div>

      {/* Base URL Section */}
      <div className="apple-card p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Server className="h-5 w-5" style={{ color: 'rgb(var(--apple-blue))' }} />
          <h2 className="text-xl apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
            API Base URL
          </h2>
        </div>
        
        <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ background: 'rgb(var(--apple-gray-6))' }}>
          <code 
            className="flex-1 apple-font-regular"
            style={{ color: 'rgb(var(--foreground))', fontFamily: 'monospace' }}
          >
            {baseUrl}
          </code>
          <button
            onClick={() => copyToClipboard(baseUrl, 'baseUrl')}
            className="apple-button-secondary flex items-center space-x-2 px-3 py-2"
          >
            {copied === 'baseUrl' ? (
              <CheckCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copied === 'baseUrl' ? 'Copied!' : 'Copy'}</span>
          </button>
          <a
            href={`${baseUrl}/api/server/status`}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-button-secondary flex items-center space-x-2 px-3 py-2 no-underline"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Test</span>
          </a>
        </div>
      </div>

      {/* Quick Test Section */}
      <div className="apple-card p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Code className="h-5 w-5" style={{ color: 'rgb(var(--apple-green))' }} />
          <h2 className="text-xl apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
            Quick Test
          </h2>
        </div>
        
        <p className="apple-font-regular text-sm mb-4" style={{ color: 'rgb(var(--apple-gray-1))' }}>
          Test your API immediately with this cURL command:
        </p>
        
        <div className="space-y-4">
          <pre 
            className="p-4 rounded-lg text-sm overflow-x-auto"
            style={{ 
              background: 'rgb(var(--apple-gray-6))',
              color: 'rgb(var(--foreground))',
              fontFamily: 'monospace'
            }}
          >
{`curl -X POST ${baseUrl}/api/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "test@example.com",
    "subject": "Test Email from Public API",
    "text": "Hello! This email was sent via your public API."
  }'`}
          </pre>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => copyToClipboard(`curl -X POST ${baseUrl}/api/send -H "Content-Type: application/json" -d '{"to":"test@example.com","subject":"Test Email","text":"Hello from your public API!"}'`, 'curl')}
              className="apple-button-primary flex items-center space-x-2"
            >
              {copied === 'curl' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>{copied === 'curl' ? 'Copied!' : 'Copy cURL Command'}</span>
            </button>
            
            <a
              href={`${baseUrl}/api/server/status`}
              target="_blank"
              rel="noopener noreferrer"
              className="apple-button-secondary flex items-center space-x-2 no-underline"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Test Server Status</span>
            </a>
          </div>
        </div>
      </div>

      {/* Available Endpoints */}
      <div className="apple-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Server className="h-5 w-5" style={{ color: 'rgb(var(--apple-purple))' }} />
          <h2 className="text-xl apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
            Available Endpoints
          </h2>
        </div>
        
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg apple-border"
            >
              <div className="flex items-center space-x-3 mb-2">
                <span 
                  className="px-2 py-1 rounded text-xs apple-font-semibold"
                  style={{ 
                    background: endpoint.method === 'GET' 
                      ? 'rgb(var(--apple-green) / 0.1)' 
                      : 'rgb(var(--apple-blue) / 0.1)',
                    color: endpoint.method === 'GET' 
                      ? 'rgb(var(--apple-green))' 
                      : 'rgb(var(--apple-blue))'
                  }}
                >
                  {endpoint.method}
                </span>
                <code 
                  className="apple-font-regular"
                  style={{ color: 'rgb(var(--foreground))', fontFamily: 'monospace' }}
                >
                  {endpoint.path}
                </code>
              </div>
              <p className="apple-font-regular text-sm mb-3" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                {endpoint.description}
              </p>
              
              {endpoint.example && (
                <div>
                  <p className="text-xs apple-font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                    Example Request Body:
                  </p>
                  <pre 
                    className="p-3 rounded text-xs overflow-x-auto"
                    style={{ 
                      background: 'rgb(var(--apple-gray-6))',
                      color: 'rgb(var(--foreground))',
                      fontFamily: 'monospace'
                    }}
                  >
                    {JSON.stringify(endpoint.example, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex items-center space-x-2 mt-3">
                <a
                  href={endpoint.method === 'GET' ? `${baseUrl}${endpoint.path}` : '#'}
                  target={endpoint.method === 'GET' ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className={`apple-button-secondary text-xs px-3 py-1 no-underline ${
                    endpoint.method !== 'GET' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={endpoint.method !== 'GET' ? (e) => e.preventDefault() : undefined}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {endpoint.method === 'GET' ? 'Test Endpoint' : 'POST Required'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Examples */}
      <div className="mt-8 text-center">
        <p className="apple-font-regular mb-4" style={{ color: 'rgb(var(--apple-gray-1))' }}>
          Need more detailed examples and documentation?
        </p>
        <button 
          onClick={() => window.location.hash = '#api-docs'}
          className="apple-button-primary"
        >
          View Complete API Documentation
        </button>
      </div>
    </div>
  );
}
