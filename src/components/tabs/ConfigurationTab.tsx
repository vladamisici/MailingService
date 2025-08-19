'use client';

import { useState, useEffect } from 'react';
import { Settings, Loader2, RefreshCw } from 'lucide-react';

export default function ConfigurationTab() {
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
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  if (loadingConfig) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Environment Configuration
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Configure SMTP settings and other environment variables. Changes require server restart.
        </p>
      </div>

      {alert && (
        <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 ${
          alert.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          <span>{alert.type === 'success' ? '✓' : '✕'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="SMTP_HOST" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              SMTP Host
            </label>
            <input
              type="text"
              id="SMTP_HOST"
              name="SMTP_HOST"
              value={config.SMTP_HOST}
              onChange={handleInputChange}
              placeholder="smtp.gmail.com"
              className="input-apple"
            />
          </div>

          <div>
            <label htmlFor="SMTP_PORT" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              SMTP Port
            </label>
            <input
              type="number"
              id="SMTP_PORT"
              name="SMTP_PORT"
              value={config.SMTP_PORT}
              onChange={handleInputChange}
              placeholder="587"
              className="input-apple"
            />
          </div>

          <div>
            <label htmlFor="SMTP_USER" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              SMTP User
            </label>
            <input
              type="email"
              id="SMTP_USER"
              name="SMTP_USER"
              value={config.SMTP_USER}
              onChange={handleInputChange}
              placeholder="your-email@gmail.com"
              className="input-apple"
            />
          </div>

          <div>
            <label htmlFor="SMTP_PASS" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              SMTP Password
            </label>
            <input
              type="password"
              id="SMTP_PASS"
              name="SMTP_PASS"
              value={config.SMTP_PASS}
              onChange={handleInputChange}
              placeholder="your-app-password"
              className="input-apple"
            />
          </div>

          <div>
            <label htmlFor="FROM_EMAIL" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              From Email
            </label>
            <input
              type="email"
              id="FROM_EMAIL"
              name="FROM_EMAIL"
              value={config.FROM_EMAIL}
              onChange={handleInputChange}
              placeholder="noreply@yourdomain.com"
              className="input-apple"
            />
          </div>

          <div>
            <label htmlFor="FROM_NAME" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              From Name
            </label>
            <input
              type="text"
              id="FROM_NAME"
              name="FROM_NAME"
              value={config.FROM_NAME}
              onChange={handleInputChange}
              placeholder="Your Company"
              className="input-apple"
            />
          </div>

          <div>
            <label htmlFor="PORT" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Server Port
            </label>
            <input
              type="number"
              id="PORT"
              name="PORT"
              value={config.PORT}
              onChange={handleInputChange}
              placeholder="3000"
              className="input-apple"
            />
          </div>

          <div>
            <label htmlFor="RATE_LIMIT_MAX" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Rate Limit (requests per window)
            </label>
            <input
              type="number"
              id="RATE_LIMIT_MAX"
              name="RATE_LIMIT_MAX"
              value={config.RATE_LIMIT_MAX}
              onChange={handleInputChange}
              placeholder="100"
              className="input-apple"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={loadConfig}
            className="btn-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-apple"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
