'use client';

import { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';

export default function BulkEmailTab() {
  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const recipients = formData.recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      const emailData = {
        recipients,
        subject: formData.subject,
        text: formData.message
      };

      const response = await fetch('/api/send/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ 
          type: 'success', 
          message: `Bulk email queued for ${recipients.length} recipients!` 
        });
        setFormData({ recipients: '', subject: '', message: '' });
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to queue bulk email' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const recipientCount = formData.recipients
    .split(',')
    .map(email => email.trim())
    .filter(email => email).length;

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
          <label htmlFor="recipients" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Recipients (comma-separated)
          </label>
          <textarea
            id="recipients"
            name="recipients"
            value={formData.recipients}
            onChange={handleInputChange}
            placeholder="email1@example.com, email2@example.com, email3@example.com"
            rows={4}
            className="textarea-apple"
            required
          />
          {recipientCount > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} detected
            </p>
          )}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Enter subject"
            className="input-apple"
            required
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            rows={8}
            className="textarea-apple"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || recipientCount === 0}
          className="btn-apple w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending to {recipientCount} recipients...
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Send to {recipientCount} Recipients
            </>
          )}
        </button>
      </form>
    </div>
  );
}
