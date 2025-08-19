'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
}

export default function TemplateEmailTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [formData, setFormData] = useState({
    to: '',
    template: 'welcome',
    variables: '{"name": "John Doe", "company": "Apple Inc."}'
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      let variables = {};
      if (formData.variables.trim()) {
        try {
          variables = JSON.parse(formData.variables);
        } catch {
          setAlert({ type: 'error', message: 'Invalid JSON format for variables' });
          setLoading(false);
          return;
        }
      }

      const emailData = {
        to: formData.to,
        template: formData.template,
        variables
      };

      const response = await fetch('/api/send/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Template email sent successfully!' });
        setFormData(prev => ({ ...prev, to: '' }));
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to send template email' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
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
        <div>
          <label htmlFor="to" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Recipient
          </label>
          <input
            type="email"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            placeholder="recipient@example.com"
            className="input-apple"
            required
          />
        </div>

        <div>
          <label htmlFor="template" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Template
          </label>
          <select
            id="template"
            name="template"
            value={formData.template}
            onChange={handleInputChange}
            className="input-apple"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="variables" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Variables (JSON)
          </label>
          <textarea
            id="variables"
            name="variables"
            value={formData.variables}
            onChange={handleInputChange}
            placeholder='{"name": "John Doe", "company": "Apple Inc."}'
            rows={4}
            className="textarea-apple font-mono text-sm"
          />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Available variables: name, company, email, date, year
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-apple w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending Template...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Send Template
            </>
          )}
        </button>
      </form>
    </div>
  );
}
