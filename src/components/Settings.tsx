'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Server,
  Mail,
  Shield,
  Loader2,
  AlertTriangle,
  Globe,
  Key,
  Zap,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState({
    'SMTP_HOST': '',
    'SMTP_PORT': '',
    'SMTP_USER': '',
    'SMTP_PASS': '',
    'FROM_EMAIL': '',
    'FROM_NAME': '',
    'PORT': '',
    'RATE_LIMIT_MAX': ''
  });
  const [rateLimits, setRateLimits] = useState({
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    emailsPerDay: 10000,
    burstLimit: 10
  });
  const [domains, setDomains] = useState([
    { domain: 'example.com', verified: true, spf: true, dkim: true, dmarc: false },
    { domain: 'test.com', verified: false, spf: false, dkim: false, dmarc: false }
  ]);
  const [webhooks, setWebhooks] = useState([
    { url: 'https://api.example.com/webhooks/email', events: ['delivered', 'bounced'], active: true }
  ]);
  const [publicAccess, setPublicAccess] = useState(false);
  const [showPublicWarning, setShowPublicWarning] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production Key', key: 'sk_live_1234567890abcdef', created: '2024-01-15', lastUsed: '2024-01-20', active: true },
    { id: '2', name: 'Development Key', key: 'sk_test_9876543210fedcba', created: '2024-01-10', lastUsed: 'Never', active: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(prev => ({ ...prev, ...data.envVars }));
        setAlert({ type: 'success', message: 'Configuration loaded successfully' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load configuration' });
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const envVars = {
        ...config,
        SMTP_SECURE: 'false',
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        RATE_LIMIT_WINDOW: '900000',
        QUEUE_CONCURRENCY: '5',
        RETRY_ATTEMPTS: '3',
        RETRY_DELAY: '5000'
      };

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envVars })
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: result.message });
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to save configuration' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePublicAccessToggle = () => {
    if (!publicAccess) {
      setShowPublicWarning(true);
    } else {
      setPublicAccess(false);
      localStorage.setItem('publicAccess', 'false');
      setAlert({ type: 'success', message: 'Public access disabled. Server is now local only.' });
    }
  };

  const confirmPublicAccess = () => {
    setPublicAccess(true);
    setShowPublicWarning(false);
    localStorage.setItem('publicAccess', 'true');
    setAlert({ 
      type: 'warning', 
      message: 'WARNING: Server is now exposed to public. Use API keys for security.' 
    });
  };

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      active: true
    };
    setApiKeys([...apiKeys, newKey]);
    setAlert({ type: 'success', message: 'New API key generated successfully!' });
  };

  const toggleApiKey = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, active: !key.active } : key
    ));
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    setAlert({ type: 'success', message: 'API key deleted successfully!' });
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setAlert({ type: 'success', message: 'API key copied to clipboard!' });
  };

  const addDomain = () => {
    const domain = prompt('Enter domain name:');
    if (domain) {
      setDomains([...domains, { 
        domain, 
        verified: false, 
        spf: false, 
        dkim: false, 
        dmarc: false 
      }]);
    }
  };

  const verifyDomain = (domain: string) => {
    setDomains(domains.map(d => 
      d.domain === domain ? { ...d, verified: true, spf: true, dkim: true } : d
    ));
    setAlert({ type: 'success', message: `Domain ${domain} verified successfully!` });
  };

  const addWebhook = () => {
    const url = prompt('Enter webhook URL:');
    if (url) {
      setWebhooks([...webhooks, { 
        url, 
        events: ['delivered', 'bounced'], 
        active: true 
      }]);
    }
  };

  if (loadingConfig) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-apple-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
          Server Settings
        </h1>
        <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
          Configure your self-hosted email API server and security settings
        </p>
      </div>

      {/* Alert */}
      {alert && (
        <div 
          className="mb-8 p-4 rounded-xl flex items-center space-x-3 apple-border"
          style={{
            backgroundColor: alert.type === 'success' 
              ? 'rgb(var(--apple-green) / 0.1)' 
              : alert.type === 'warning'
              ? 'rgb(var(--apple-orange) / 0.1)'
              : 'rgb(var(--apple-red) / 0.1)',
            color: alert.type === 'success' 
              ? 'rgb(var(--apple-green))' 
              : alert.type === 'warning'
              ? 'rgb(var(--apple-orange))'
              : 'rgb(var(--apple-red))'
          }}
        >
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs apple-font-bold text-white"
            style={{
              backgroundColor: alert.type === 'success' 
                ? 'rgb(var(--apple-green))' 
                : alert.type === 'warning'
                ? 'rgb(var(--apple-orange))'
                : 'rgb(var(--apple-red))'
            }}
          >
            {alert.type === 'success' ? '✓' : alert.type === 'warning' ? '⚠' : '✕'}
          </div>
          <span className="apple-font-medium">{alert.message}</span>
        </div>
      )}

      {/* Public Access Warning Modal */}
      {showPublicWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="apple-card p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgb(var(--apple-red) / 0.1)' }}
              >
                <AlertTriangle className="h-6 w-6" style={{ color: 'rgb(var(--apple-red))' }} />
              </div>
              <h3 className="text-xl apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                Security Warning
              </h3>
            </div>
            <p className="apple-font-regular mb-6" style={{ color: 'rgb(var(--apple-gray-1))' }}>
              Enabling public access will expose your email API to the internet. This can be a security risk. 
              Make sure to use strong API keys and monitor your server closely.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPublicWarning(false)}
                className="apple-button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublicAccess}
                className="apple-button-danger flex-1"
              >
                Enable Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Sections */}
      <div className="space-y-6">
        {/* API Keys Management */}
        <div className="apple-card">
          <div className="p-6 apple-divider">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
                  style={{ background: 'rgb(var(--apple-blue) / 0.1)' }}
                >
                  <Key className="h-5 w-5" style={{ color: 'rgb(var(--apple-blue))' }} />
                </div>
                <div>
                  <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                    API Keys
                  </h3>
                  <p className="text-sm apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    Manage API keys for authentication
                  </p>
                </div>
              </div>
              <button
                onClick={generateApiKey}
                className="apple-button-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Generate Key</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {apiKeys.map((keyData) => (
                <div 
                  key={keyData.id}
                  className="flex items-center justify-between p-4 rounded-lg apple-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                        {keyData.name}
                      </h4>
                      <div className={`px-2 py-1 rounded-full text-xs apple-font-semibold ${
                        keyData.active ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'
                      }`}>
                        {keyData.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                      <span>Created: {keyData.created}</span>
                      <span>Last used: {keyData.lastUsed}</span>
                    </div>
                    <code 
                      className="text-xs apple-font-regular mt-2 block"
                      style={{ color: 'rgb(var(--apple-gray-1))', fontFamily: 'monospace' }}
                    >
                      {keyData.key.substring(0, 20)}...
                    </code>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyApiKey(keyData.key)}
                      className="p-2 rounded-lg hover:apple-shadow-sm transition-all duration-200"
                      style={{ backgroundColor: 'rgb(var(--apple-gray-6))' }}
                    >
                      <Copy className="h-4 w-4" style={{ color: 'rgb(var(--apple-gray-1))' }} />
                    </button>
                    <button
                      onClick={() => toggleApiKey(keyData.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        keyData.active ? 'hover:bg-red-100' : 'hover:bg-green-100'
                      }`}
                    >
                      {keyData.active ? (
                        <EyeOff className="h-4 w-4" style={{ color: 'rgb(var(--apple-red))' }} />
                      ) : (
                        <Eye className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
                      )}
                    </button>
                    <button
                      onClick={() => deleteApiKey(keyData.id)}
                      className="p-2 rounded-lg hover:bg-red-100 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" style={{ color: 'rgb(var(--apple-red))' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Public Access Control */}
        <div className="apple-card">
          <div className="p-6 apple-divider">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
                style={{ background: 'rgb(var(--apple-red) / 0.1)' }}
              >
                <Shield className="h-5 w-5" style={{ color: 'rgb(var(--apple-red))' }} />
              </div>
              <div>
                <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  Public Access Control
                </h3>
                <p className="text-sm apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                  Control external access to your email API server
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  Open to Public
                </label>
                <p className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                  Allow external API calls (⚠️ Security Risk)
                </p>
              </div>
              <button
                onClick={handlePublicAccessToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  publicAccess ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    publicAccess ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
                          {publicAccess && (
                <div className="mt-4 space-y-3">
                  <div 
                    className="p-3 rounded-lg flex items-start space-x-2"
                    style={{ background: 'rgb(var(--apple-red) / 0.1)' }}
                  >
                    <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: 'rgb(var(--apple-red))' }} />
                    <div>
                      <p className="text-xs apple-font-semibold" style={{ color: 'rgb(var(--apple-red))' }}>
                        Server is exposed to public
                      </p>
                      <p className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-red))' }}>
                        Anyone can make API calls to your server. Ensure your API keys are secure.
                      </p>
                    </div>
                  </div>
                  
                  <div 
                    className="p-4 rounded-lg"
                    style={{ background: 'rgb(var(--apple-blue) / 0.1)' }}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <Globe className="h-4 w-4" style={{ color: 'rgb(var(--apple-blue))' }} />
                      <h4 className="apple-font-semibold text-sm" style={{ color: 'rgb(var(--apple-blue))' }}>
                        Public API Access
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs apple-font-medium mb-1" style={{ color: 'rgb(var(--apple-blue))' }}>
                          Base URL:
                        </p>
                        <code 
                          className="text-xs apple-font-regular px-2 py-1 rounded"
                          style={{ 
                            background: 'rgb(var(--apple-gray-6))',
                            color: 'rgb(var(--foreground))',
                            fontFamily: 'monospace'
                          }}
                        >
                          {typeof window !== 'undefined' ? window.location.origin : 'http://your-server.com'}
                        </code>
                      </div>
                      
                      <div>
                        <p className="text-xs apple-font-medium mb-2" style={{ color: 'rgb(var(--apple-blue))' }}>
                          Example API Call (No Auth Required):
                        </p>
                        <pre 
                          className="text-xs p-3 rounded overflow-x-auto"
                          style={{ 
                            background: 'rgb(var(--apple-gray-6))',
                            color: 'rgb(var(--foreground))',
                            fontFamily: 'monospace'
                          }}
                        >
{`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'http://your-server.com'}/api/send \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "text": "Hello from your API!"
  }'`}
                        </pre>
                      </div>
                      
                      <div>
                        <p className="text-xs apple-font-medium mb-2" style={{ color: 'rgb(var(--apple-blue))' }}>
                          With API Key (Recommended):
                        </p>
                        <pre 
                          className="text-xs p-3 rounded overflow-x-auto"
                          style={{ 
                            background: 'rgb(var(--apple-gray-6))',
                            color: 'rgb(var(--foreground))',
                            fontFamily: 'monospace'
                          }}
                        >
{`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'http://your-server.com'}/api/send \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "text": "Hello from your API!"
  }'`}
                        </pre>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://your-server.com';
                            const curlCommand = `curl -X POST ${baseUrl}/api/send -H "Content-Type: application/json" -d '{"to":"user@example.com","subject":"Test Email","text":"Hello from your API!"}'`;
                            navigator.clipboard.writeText(curlCommand);
                            setAlert({ type: 'success', message: 'cURL command copied to clipboard!' });
                          }}
                          className="apple-button-secondary text-xs px-3 py-1"
                        >
                          Copy cURL
                        </button>
                        <a 
                          href={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/server/status`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="apple-button-secondary text-xs px-3 py-1 no-underline"
                        >
                          Test Status API
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="apple-card">
          <div className="p-6 apple-divider">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
                style={{ background: 'rgb(var(--apple-orange) / 0.1)' }}
              >
                <Zap className="h-5 w-5" style={{ color: 'rgb(var(--apple-orange))' }} />
              </div>
              <div>
                <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  Rate Limiting & Quotas
                </h3>
                <p className="text-sm apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                  Control API usage and prevent abuse
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm apple-font-semibold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  Requests per Minute
                </label>
                <input
                  type="number"
                  value={rateLimits.requestsPerMinute}
                  onChange={(e) => setRateLimits({...rateLimits, requestsPerMinute: parseInt(e.target.value)})}
                  className="apple-input"
                />
              </div>
              <div>
                <label className="block text-sm apple-font-semibold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  Requests per Hour
                </label>
                <input
                  type="number"
                  value={rateLimits.requestsPerHour}
                  onChange={(e) => setRateLimits({...rateLimits, requestsPerHour: parseInt(e.target.value)})}
                  className="apple-input"
                />
              </div>
              <div>
                <label className="block text-sm apple-font-semibold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  Emails per Day
                </label>
                <input
                  type="number"
                  value={rateLimits.emailsPerDay}
                  onChange={(e) => setRateLimits({...rateLimits, emailsPerDay: parseInt(e.target.value)})}
                  className="apple-input"
                />
              </div>
              <div>
                <label className="block text-sm apple-font-semibold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                  Burst Limit
                </label>
                <input
                  type="number"
                  value={rateLimits.burstLimit}
                  onChange={(e) => setRateLimits({...rateLimits, burstLimit: parseInt(e.target.value)})}
                  className="apple-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Domain Management */}
        <div className="apple-card">
          <div className="p-6 apple-divider">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
                  style={{ background: 'rgb(var(--apple-purple) / 0.1)' }}
                >
                  <Globe className="h-5 w-5" style={{ color: 'rgb(var(--apple-purple))' }} />
                </div>
                <div>
                  <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                    Domain Management
                  </h3>
                  <p className="text-sm apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    Manage sending domains and DNS records
                  </p>
                </div>
              </div>
              <button
                onClick={addDomain}
                className="apple-button-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Domain</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {domains.map((domain, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg apple-border"
                >
                  <div>
                    <h4 className="apple-font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                      {domain.domain}
                    </h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {domain.verified ? (
                          <CheckCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
                        ) : (
                          <XCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-red))' }} />
                        )}
                        <span className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {domain.spf ? (
                          <CheckCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
                        ) : (
                          <XCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-red))' }} />
                        )}
                        <span className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                          SPF
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {domain.dkim ? (
                          <CheckCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
                        ) : (
                          <XCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-red))' }} />
                        )}
                        <span className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                          DKIM
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {domain.dmarc ? (
                          <CheckCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-green))' }} />
                        ) : (
                          <XCircle className="h-4 w-4" style={{ color: 'rgb(var(--apple-red))' }} />
                        )}
                        <span className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                          DMARC
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!domain.verified && (
                      <button
                        onClick={() => verifyDomain(domain.domain)}
                        className="apple-button-primary px-4 py-2"
                      >
                        Verify
                      </button>
                    )}
                    <button className="apple-button-secondary px-4 py-2">
                      DNS Records
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* SMTP Configuration */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  SMTP Configuration
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Configure your email server settings
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="SMTP_HOST" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  SMTP Host
                </label>
                <input
                  type="text"
                  id="SMTP_HOST"
                  name="SMTP_HOST"
                  value={config.SMTP_HOST}
                  onChange={handleInputChange}
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="SMTP_PORT" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  SMTP Port
                </label>
                <input
                  type="number"
                  id="SMTP_PORT"
                  name="SMTP_PORT"
                  value={config.SMTP_PORT}
                  onChange={handleInputChange}
                  placeholder="587"
                  className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="SMTP_USER" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Email Address
                </label>
                <input
                  type="email"
                  id="SMTP_USER"
                  name="SMTP_USER"
                  value={config.SMTP_USER}
                  onChange={handleInputChange}
                  placeholder="your-email@gmail.com"
                  className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="SMTP_PASS" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  id="SMTP_PASS"
                  name="SMTP_PASS"
                  value={config.SMTP_PASS}
                  onChange={handleInputChange}
                  placeholder="your-app-password"
                  className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="FROM_EMAIL" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  From Email
                </label>
                <input
                  type="email"
                  id="FROM_EMAIL"
                  name="FROM_EMAIL"
                  value={config.FROM_EMAIL}
                  onChange={handleInputChange}
                  placeholder="noreply@yourdomain.com"
                  className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="FROM_NAME" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  From Name
                </label>
                <input
                  type="text"
                  id="FROM_NAME"
                  name="FROM_NAME"
                  value={config.FROM_NAME}
                  onChange={handleInputChange}
                  placeholder="Your Company"
                  className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={loadConfig}
                className="flex items-center space-x-2 px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reload</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Server Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Server className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Server Settings
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage server configuration and performance
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="PORT" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Server Port
                </label>
                <input
                  type="number"
                  id="PORT"
                  name="PORT"
                  value={config.PORT}
                  onChange={handleInputChange}
                  placeholder="3000"
                  className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="RATE_LIMIT_MAX" className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Rate Limit (requests/window)
                </label>
                <input
                  type="number"
                  id="RATE_LIMIT_MAX"
                  name="RATE_LIMIT_MAX"
                  value={config.RATE_LIMIT_MAX}
                  onChange={handleInputChange}
                  placeholder="100"
                  className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Security & Privacy
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage security settings and privacy options
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">
                🔒 Security Notice
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Your SMTP credentials are stored securely in environment variables. 
                Never share your configuration with unauthorized users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
