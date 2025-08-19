'use client';

import { useState } from 'react';
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Key,
  Server,
  Mail,
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

export default function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('send');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showPublicExamples, setShowPublicExamples] = useState(false);

  const endpoints = [
    {
      id: 'send',
      name: 'Send Email',
      method: 'POST',
      path: '/api/send',
      description: 'Send a single email',
      icon: Mail
    },
    {
      id: 'bulk',
      name: 'Bulk Send',
      method: 'POST', 
      path: '/api/send/bulk',
      description: 'Send emails to multiple recipients',
      icon: Mail
    },
    {
      id: 'template',
      name: 'Template Send',
      method: 'POST',
      path: '/api/send/template',
      description: 'Send email using a template',
      icon: Mail
    },
    {
      id: 'queue',
      name: 'Queue Status',
      method: 'GET',
      path: '/api/queue',
      description: 'Get email queue status',
      icon: Server
    }
  ];

  const codeExamples = {
    send: {
      curl: `curl -X POST http://localhost:3000/api/send \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "to": "user@example.com",
    "subject": "Hello from your API",
    "text": "This is a test email from your self-hosted mail server!"
  }'`,
      curlPublic: `curl -X POST http://localhost:3000/api/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "user@example.com",
    "subject": "Hello from your API",
    "text": "This is a test email from your self-hosted mail server!"
  }'`,
      javascript: `const response = await fetch('http://localhost:3000/api/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello from your API',
    text: 'This is a test email from your self-hosted mail server!'
  })
});

const result = await response.json();`,
      javascriptPublic: `const response = await fetch('http://localhost:3000/api/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Hello from your API',
    text: 'This is a test email from your self-hosted mail server!'
  })
});

const result = await response.json();`,
      python: `import requests

url = "http://localhost:3000/api/send"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
data = {
    "to": "user@example.com",
    "subject": "Hello from your API",
    "text": "This is a test email from your self-hosted mail server!"
}

response = requests.post(url, headers=headers, json=data)`,
      pythonPublic: `import requests

url = "http://localhost:3000/api/send"
headers = {
    "Content-Type": "application/json"
}
data = {
    "to": "user@example.com",
    "subject": "Hello from your API",
    "text": "This is a test email from your self-hosted mail server!"
}

response = requests.post(url, headers=headers, json=data)`
    },
    bulk: {
      curl: `curl -X POST http://localhost:3000/api/send/bulk \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "emails": [
      {
        "to": "user1@example.com",
        "subject": "Bulk Email 1",
        "text": "First email"
      },
      {
        "to": "user2@example.com", 
        "subject": "Bulk Email 2",
        "text": "Second email"
      }
    ]
  }'`,
      javascript: `const response = await fetch('http://localhost:3000/api/send/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    emails: [
      {
        to: 'user1@example.com',
        subject: 'Bulk Email 1',
        text: 'First email'
      },
      {
        to: 'user2@example.com',
        subject: 'Bulk Email 2', 
        text: 'Second email'
      }
    ]
  })
});`,
      python: `import requests

url = "http://localhost:3000/api/send/bulk"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
data = {
    "emails": [
        {
            "to": "user1@example.com",
            "subject": "Bulk Email 1",
            "text": "First email"
        },
        {
            "to": "user2@example.com",
            "subject": "Bulk Email 2",
            "text": "Second email"
        }
    ]
}

response = requests.post(url, headers=headers, json=data)`
    }
  };

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedEndpointData = endpoints.find(e => e.id === selectedEndpoint);
  const examples = codeExamples[selectedEndpoint as keyof typeof codeExamples];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-apple-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
          API Documentation
        </h1>
        <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
          Complete guide to integrating with your self-hosted email API
        </p>
      </div>

      {/* Quick Start */}
      <div className="apple-card p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
            style={{ background: 'rgb(var(--apple-blue) / 0.1)' }}
          >
            <Key className="h-5 w-5" style={{ color: 'rgb(var(--apple-blue))' }} />
          </div>
          <h2 className="text-xl apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
            Quick Start
          </h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs apple-font-semibold mt-0.5"
              style={{ background: 'rgb(var(--apple-blue))', color: 'white' }}
            >
              1
            </div>
            <div>
              <h3 className="apple-font-medium mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                Configure SMTP settings
              </h3>
              <p className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                Set up your SMTP server details in the Settings tab
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs apple-font-semibold mt-0.5"
              style={{ background: 'rgb(var(--apple-blue))', color: 'white' }}
            >
              2
            </div>
            <div>
              <h3 className="apple-font-medium mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                Choose authentication method
              </h3>
              <div className="apple-font-regular text-sm space-y-1" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                <p><strong>Option A:</strong> Generate API key (recommended for security)</p>
                <p><strong>Option B:</strong> Enable "Open to Public" in Settings (no auth required)</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs apple-font-semibold mt-0.5"
              style={{ background: 'rgb(var(--apple-blue))', color: 'white' }}
            >
              3
            </div>
            <div>
              <h3 className="apple-font-medium mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                Start making requests
              </h3>
              <p className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                Use the endpoints below to send emails via your API
              </p>
            </div>
          </div>
        </div>

        {/* Public Access Notice */}
        <div 
          className="mt-6 p-4 rounded-lg"
          style={{ background: 'rgb(var(--apple-orange) / 0.1)' }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4" style={{ color: 'rgb(var(--apple-orange))' }} />
            <h4 className="apple-font-semibold text-sm" style={{ color: 'rgb(var(--apple-orange))' }}>
              Public Access Mode
            </h4>
          </div>
          <p className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-orange))' }}>
            If "Open to Public" is enabled in Settings, you can make API calls without authentication. 
            This is convenient for testing but poses security risks in production.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Endpoints Sidebar */}
        <div className="lg:col-span-1">
          <div className="apple-card p-4">
            <h3 className="apple-font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
              Endpoints
            </h3>
            <div className="space-y-2">
              {endpoints.map((endpoint) => {
                const Icon = endpoint.icon;
                const isActive = selectedEndpoint === endpoint.id;
                
                return (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'apple-shadow-sm' : ''
                    }`}
                    style={{
                      backgroundColor: isActive 
                        ? 'rgb(var(--apple-blue) / 0.1)' 
                        : 'transparent',
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon 
                        className="h-4 w-4" 
                        style={{ 
                          color: isActive 
                            ? 'rgb(var(--apple-blue))' 
                            : 'rgb(var(--apple-gray-1))' 
                        }} 
                      />
                      <div>
                        <div 
                          className="apple-font-medium text-sm"
                          style={{ 
                            color: isActive 
                              ? 'rgb(var(--apple-blue))' 
                              : 'rgb(var(--foreground))' 
                          }}
                        >
                          {endpoint.name}
                        </div>
                        <div 
                          className="apple-font-regular text-xs"
                          style={{ color: 'rgb(var(--apple-gray-1))' }}
                        >
                          {endpoint.method}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="apple-card p-6">
            {selectedEndpointData && (
              <>
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <span 
                      className="px-2 py-1 rounded text-xs apple-font-semibold"
                      style={{ 
                        background: 'rgb(var(--apple-green) / 0.1)',
                        color: 'rgb(var(--apple-green))'
                      }}
                    >
                      {selectedEndpointData.method}
                    </span>
                    <code 
                      className="apple-font-regular"
                      style={{ color: 'rgb(var(--foreground))' }}
                    >
                      {selectedEndpointData.path}
                    </code>
                  </div>
                  <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    {selectedEndpointData.description}
                  </p>
                </div>

                {examples && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                        Code Examples
                      </h3>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={showPublicExamples}
                            onChange={(e) => setShowPublicExamples(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                            Show Public Access Examples
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    {showPublicExamples && (
                      <div 
                        className="p-3 rounded-lg flex items-center space-x-2"
                        style={{ background: 'rgb(var(--apple-orange) / 0.1)' }}
                      >
                        <AlertTriangle className="h-4 w-4" style={{ color: 'rgb(var(--apple-orange))' }} />
                        <p className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-orange))' }}>
                          These examples work only when "Open to Public" is enabled in Settings
                        </p>
                      </div>
                    )}
                    
                    {/* cURL */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                          cURL
                        </h4>
                        <button
                          onClick={() => copyToClipboard(examples.curl, 'curl')}
                          className="flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors duration-200"
                          style={{ 
                            background: 'rgb(var(--apple-gray-6))',
                            color: 'rgb(var(--apple-gray-1))'
                          }}
                        >
                          {copiedCode === 'curl' ? (
                            <CheckCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="text-xs apple-font-medium">
                            {copiedCode === 'curl' ? 'Copied!' : 'Copy'}
                          </span>
                        </button>
                      </div>
                      <pre 
                        className="p-4 rounded-lg text-sm overflow-x-auto"
                        style={{ 
                          background: 'rgb(var(--apple-gray-6))',
                          color: 'rgb(var(--foreground))'
                        }}
                      >
                        <code>{showPublicExamples && examples.curlPublic ? examples.curlPublic : examples.curl}</code>
                      </pre>
                    </div>

                    {/* JavaScript */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                          JavaScript
                        </h4>
                        <button
                          onClick={() => copyToClipboard(examples.javascript, 'js')}
                          className="flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors duration-200"
                          style={{ 
                            background: 'rgb(var(--apple-gray-6))',
                            color: 'rgb(var(--apple-gray-1))'
                          }}
                        >
                          {copiedCode === 'js' ? (
                            <CheckCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="text-xs apple-font-medium">
                            {copiedCode === 'js' ? 'Copied!' : 'Copy'}
                          </span>
                        </button>
                      </div>
                      <pre 
                        className="p-4 rounded-lg text-sm overflow-x-auto"
                        style={{ 
                          background: 'rgb(var(--apple-gray-6))',
                          color: 'rgb(var(--foreground))'
                        }}
                      >
                        <code>{showPublicExamples && examples.javascriptPublic ? examples.javascriptPublic : examples.javascript}</code>
                      </pre>
                    </div>

                    {/* Python */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                          Python
                        </h4>
                        <button
                          onClick={() => copyToClipboard(examples.python, 'python')}
                          className="flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors duration-200"
                          style={{ 
                            background: 'rgb(var(--apple-gray-6))',
                            color: 'rgb(var(--apple-gray-1))'
                          }}
                        >
                          {copiedCode === 'python' ? (
                            <CheckCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span className="text-xs apple-font-medium">
                            {copiedCode === 'python' ? 'Copied!' : 'Copy'}
                          </span>
                        </button>
                      </div>
                      <pre 
                        className="p-4 rounded-lg text-sm overflow-x-auto"
                        style={{ 
                          background: 'rgb(var(--apple-gray-6))',
                          color: 'rgb(var(--foreground))'
                        }}
                      >
                        <code>{showPublicExamples && examples.pythonPublic ? examples.pythonPublic : examples.python}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
