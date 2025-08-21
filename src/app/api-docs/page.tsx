'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: boolean;
  params?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  body?: any;
  response?: any;
}

const apiEndpoints: Record<string, ApiEndpoint[]> = {
  'Email Sending': [
    {
      method: 'POST',
      path: '/api/send',
      description: 'Send a single email',
      auth: true,
      body: {
        to: 'recipient@example.com',
        subject: 'Hello World',
        html: '<h1>Hello World</h1>',
        text: 'Hello World',
        from: 'sender@example.com',
        replyTo: 'reply@example.com',
        cc: 'cc@example.com',
        bcc: 'bcc@example.com',
        attachments: [
          {
            filename: 'file.pdf',
            content: 'base64_encoded_content',
            contentType: 'application/pdf'
          }
        ],
        scheduledFor: '2024-12-25T00:00:00Z'
      },
      response: {
        success: true,
        id: 'job-123',
        message: 'Email queued for sending',
        status: 'queued'
      }
    },
    {
      method: 'POST',
      path: '/api/send/bulk',
      description: 'Send emails in bulk (up to 1000 per request)',
      auth: true,
      body: {
        emails: [
          {
            to: 'user1@example.com',
            subject: 'Welcome',
            html: '<h1>Welcome User 1</h1>',
            text: 'Welcome User 1'
          },
          {
            to: 'user2@example.com',
            subject: 'Welcome',
            html: '<h1>Welcome User 2</h1>',
            text: 'Welcome User 2'
          }
        ]
      },
      response: {
        success: 250,
        failed: 0,
        total: 250,
        jobIds: ['job-1', 'job-2', '...'],
        errors: []
      }
    },
    {
      method: 'GET',
      path: '/api/send',
      description: 'Get email status or recent emails',
      auth: true,
      params: [
        {
          name: 'id',
          type: 'string',
          required: false,
          description: 'Email ID to get status for. If not provided, returns recent emails.'
        }
      ],
      response: {
        id: 'email-123',
        recipient: 'user@example.com',
        subject: 'Test Email',
        status: 'sent',
        createdAt: '2024-01-01T00:00:00Z',
        sentAt: '2024-01-01T00:01:00Z',
        events: [
          {
            type: 'opened',
            timestamp: '2024-01-01T00:05:00Z'
          }
        ]
      }
    }
  ],
  'Analytics & Tracking': [
    {
      method: 'GET',
      path: '/api/analytics',
      description: 'Get email analytics data',
      auth: true,
      params: [
        {
          name: 'timeRange',
          type: 'string',
          required: false,
          description: 'Time range: 7d, 30d, or 90d (default: 30d)'
        }
      ],
      response: {
        metrics: {
          sent: 1000,
          delivered: 950,
          opened: 450,
          clicked: 230,
          bounced: 50,
          complained: 2
        },
        geoData: {
          'United States': 450,
          'United Kingdom': 200,
          'Canada': 150
        },
        deviceData: {
          'Desktop': 500,
          'Mobile': 300,
          'Tablet': 200
        }
      }
    },
    {
      method: 'POST',
      path: '/api/analytics/track',
      description: 'Track email events (automatically called by tracking pixels)',
      auth: false,
      params: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'Tracking ID'
        },
        {
          name: 'event',
          type: 'string',
          required: true,
          description: 'Event type: opened, clicked'
        }
      ],
      response: {
        success: true
      }
    }
  ],
  'API Keys': [
    {
      method: 'GET',
      path: '/api/keys',
      description: 'List all API keys',
      auth: true,
      response: {
        keys: [
          {
            id: 'key-123',
            name: 'Production Key',
            key: 'sk_live_************',
            createdAt: '2024-01-01T00:00:00Z',
            lastUsed: '2024-01-15T00:00:00Z',
            permissions: ['send', 'bulk'],
            active: true
          }
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/keys',
      description: 'Create a new API key',
      auth: true,
      body: {
        name: 'My API Key',
        permissions: ['send', 'bulk', 'templates']
      },
      response: {
        id: 'key-456',
        name: 'My API Key',
        key: 'sk_live_abcdef123456789',
        createdAt: '2024-01-01T00:00:00Z',
        permissions: ['send', 'bulk', 'templates']
      }
    },
    {
      method: 'DELETE',
      path: '/api/keys/:id',
      description: 'Delete an API key',
      auth: true,
      response: {
        success: true
      }
    }
  ],
  'Templates': [
    {
      method: 'GET',
      path: '/api/templates',
      description: 'List all email templates',
      auth: true,
      response: {
        templates: [
          {
            id: 'tpl-123',
            name: 'welcome-email',
            subject: 'Welcome to {{company}}',
            createdAt: '2024-01-01T00:00:00Z',
            lastModified: '2024-01-01T00:00:00Z'
          }
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/templates',
      description: 'Create a new email template',
      auth: true,
      body: {
        name: 'welcome-email',
        subject: 'Welcome to {{company}}',
        content: '<h1>Welcome {{name}}!</h1><p>Thanks for joining {{company}}.</p>',
        type: 'html'
      },
      response: {
        id: 'tpl-456',
        name: 'welcome-email',
        subject: 'Welcome to {{company}}',
        content: '<h1>Welcome {{name}}!</h1>',
        type: 'html',
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  ],
  'Webhooks': [
    {
      method: 'GET',
      path: '/api/webhooks',
      description: 'List all webhooks',
      auth: true,
      response: {
        webhooks: [
          {
            id: 'wh-123',
            url: 'https://example.com/webhook',
            events: ['sent', 'delivered', 'opened'],
            active: true,
            createdAt: '2024-01-01T00:00:00Z',
            failureCount: 0
          }
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/webhooks',
      description: 'Create a new webhook',
      auth: true,
      body: {
        url: 'https://example.com/webhook',
        events: ['sent', 'delivered', 'opened', 'clicked', 'bounced']
      },
      response: {
        id: 'wh-456',
        url: 'https://example.com/webhook',
        secret: 'whsec_abcdef123456',
        events: ['sent', 'delivered', 'opened', 'clicked', 'bounced'],
        active: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  ],
  'Domain Management': [
    {
      method: 'GET',
      path: '/api/domains',
      description: 'List all verified domains',
      auth: true,
      response: {
        domains: [
          {
            id: 'dom-123',
            name: 'example.com',
            verified: true,
            spf: true,
            dkim: true,
            dmarc: true,
            createdAt: '2024-01-01T00:00:00Z'
          }
        ]
      }
    },
    {
      method: 'POST',
      path: '/api/domains',
      description: 'Add a domain for verification',
      auth: true,
      body: {
        name: 'example.com'
      },
      response: {
        id: 'dom-456',
        name: 'example.com',
        verified: false,
        spf: false,
        dkim: false,
        dmarc: false,
        dnsRecords: {
          spf: {
            type: 'TXT',
            name: '@',
            value: 'v=spf1 include:mail.example.com ~all'
          },
          dkim: {
            type: 'TXT',
            name: 'mail._domainkey',
            value: 'v=DKIM1; k=rsa; p=MIGfMA0...'
          },
          dmarc: {
            type: 'TXT',
            name: '_dmarc',
            value: 'v=DMARC1; p=none; rua=mailto:dmarc@example.com'
          }
        }
      }
    }
  ],
  'Health & Status': [
    {
      method: 'GET',
      path: '/api/health',
      description: 'Basic health check',
      auth: false,
      response: {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z'
      }
    },
    {
      method: 'GET',
      path: '/api/health/detailed',
      description: 'Detailed health check with component status',
      auth: false,
      response: {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        checks: {
          database: {
            healthy: true,
            latency: 5
          },
          redis: {
            healthy: true,
            queueSize: 42
          },
          smtp: {
            healthy: true,
            verified: true
          }
        }
      }
    }
  ]
};

export default function ApiDocsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Email Sending']);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatJson = (obj: any) => JSON.stringify(obj, null, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="mt-2 text-gray-600">Complete reference for the Mailing Service API</p>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
          <p className="text-gray-600 mb-4">
            All API requests (except health checks and tracking endpoints) require authentication using an API key.
            Include your API key in the Authorization header:
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
            <pre className="text-sm">Authorization: Bearer sk_live_your_api_key_here</pre>
            <button
              onClick={() => copyToClipboard('Authorization: Bearer sk_live_your_api_key_here', 'auth')}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              {copiedCode === 'auth' ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Base URL */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Base URL</h2>
          <div className="bg-gray-100 px-4 py-2 rounded font-mono text-sm">
            https://your-domain.com
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rate Limits</h2>
          <div className="space-y-2 text-gray-600">
            <p>• Default: 60 requests per minute</p>
            <p>• Bulk operations: 1000 requests per hour</p>
            <p>• Rate limit headers are included in all responses</p>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-6">
          {Object.entries(apiEndpoints).map(([section, endpoints]) => (
            <div key={section} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <button
                onClick={() => toggleSection(section)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-xl font-semibold text-gray-900">{section}</h2>
                {expandedSections.includes(section) ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {expandedSections.includes(section) && (
                <div className="border-t">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="border-b last:border-0 p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                        </div>
                        {endpoint.auth && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Requires Auth
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4">{endpoint.description}</p>

                      {/* Parameters */}
                      {endpoint.params && endpoint.params.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Query Parameters</h4>
                          <div className="bg-gray-50 rounded p-3 space-y-2">
                            {endpoint.params.map((param, i) => (
                              <div key={i} className="text-sm">
                                <span className="font-mono text-gray-700">{param.name}</span>
                                <span className="text-gray-500"> ({param.type})</span>
                                {param.required && <span className="text-red-500 text-xs ml-1">required</span>}
                                <p className="text-gray-600 text-xs mt-1">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {endpoint.body && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Body</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                            <pre className="text-xs overflow-x-auto">{formatJson(endpoint.body)}</pre>
                            <button
                              onClick={() => copyToClipboard(formatJson(endpoint.body), `body-${section}-${index}`)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                              {copiedCode === `body-${section}-${index}` ? 
                                <Check className="h-4 w-4" /> : 
                                <Copy className="h-4 w-4" />
                              }
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Response */}
                      {endpoint.response && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Response</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                            <pre className="text-xs overflow-x-auto">{formatJson(endpoint.response)}</pre>
                            <button
                              onClick={() => copyToClipboard(formatJson(endpoint.response), `response-${section}-${index}`)}
                              className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                              {copiedCode === `response-${section}-${index}` ? 
                                <Check className="h-4 w-4" /> : 
                                <Copy className="h-4 w-4" />
                              }
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Error Responses */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Responses</h2>
          <p className="text-gray-600 mb-4">
            All errors follow a consistent format:
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
            <pre className="text-sm">{formatJson({
              error: 'Error message',
              errors: [
                {
                  field: 'email',
                  message: 'Invalid email format'
                }
              ]
            })}</pre>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>• <strong>400</strong> - Bad Request (validation errors)</p>
            <p>• <strong>401</strong> - Unauthorized (missing or invalid API key)</p>
            <p>• <strong>403</strong> - Forbidden (insufficient permissions)</p>
            <p>• <strong>404</strong> - Not Found</p>
            <p>• <strong>429</strong> - Too Many Requests (rate limit exceeded)</p>
            <p>• <strong>500</strong> - Internal Server Error</p>
          </div>
        </div>

        {/* Webhook Events */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Webhook Events</h2>
          <p className="text-gray-600 mb-4">
            Webhooks are sent as POST requests with the following payload:
          </p>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4">
            <pre className="text-sm">{formatJson({
              event: 'email.sent',
              data: {
                id: 'email-123',
                to: 'recipient@example.com',
                subject: 'Test Email',
                messageId: 'message-id',
                timestamp: '2024-01-01T00:00:00Z'
              },
              timestamp: '2024-01-01T00:00:00Z',
              id: 'evt-123'
            })}</pre>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• <strong>sent</strong> - Email successfully sent to SMTP server</p>
            <p>• <strong>delivered</strong> - Email delivered to recipient's inbox</p>
            <p>• <strong>opened</strong> - Email opened by recipient</p>
            <p>• <strong>clicked</strong> - Link clicked in email</p>
            <p>• <strong>bounced</strong> - Email bounced</p>
            <p>• <strong>complained</strong> - Marked as spam</p>
            <p>• <strong>unsubscribed</strong> - Recipient unsubscribed</p>
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Examples</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Node.js</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                <pre className="text-sm overflow-x-auto">{`const response = await fetch('https://your-api.com/api/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello World',
    html: '<h1>Hello World</h1>'
  })
});

const data = await response.json();
console.log(data);`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Python</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                <pre className="text-sm overflow-x-auto">{`import requests

response = requests.post(
    'https://your-api.com/api/send',
    headers={
        'Authorization': 'Bearer sk_live_your_api_key',
        'Content-Type': 'application/json'
    },
    json={
        'to': 'recipient@example.com',
        'subject': 'Hello World',
        'html': '<h1>Hello World</h1>'
    }
)

print(response.json())`}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">cURL</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                <pre className="text-sm overflow-x-auto">{`curl -X POST https://your-api.com/api/send \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "recipient@example.com",
    "subject": "Hello World",
    "html": "<h1>Hello World</h1>"
  }'`}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}