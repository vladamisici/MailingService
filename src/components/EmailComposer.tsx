'use client';

import { useState } from 'react';
import { 
  Send, 
  Users, 
  FileText, 
  Loader2,
  Mail,
  Type,
  Code,
  Eye,
  Save
} from 'lucide-react';

export default function EmailComposer() {
  const [activeTab, setActiveTab] = useState('single');
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: '',
    emailType: 'text'
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const tabs = [
    { id: 'single', name: 'Single Email', icon: Mail },
    { id: 'bulk', name: 'Bulk Email', icon: Users },
    { id: 'template', name: 'Template', icon: FileText },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const emailData = {
        to: formData.to,
        subject: formData.subject,
        text: formData.emailType === 'text' ? formData.message : undefined,
        html: formData.emailType === 'html' ? formData.message : undefined
      };

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Email sent successfully!' });
        setFormData({ to: '', subject: '', message: '', emailType: 'text' });
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to send email' });
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
    <div className="max-w-5xl mx-auto px-6 py-8 animate-apple-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
          Compose Email
        </h1>
        <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
          Create and send beautiful emails with our advanced composer
        </p>
      </div>

      {/* Main Composer */}
      <div className="apple-card overflow-hidden">
        {/* Tab Navigation */}
        <div className="apple-divider" style={{ background: 'rgb(var(--apple-gray-6))' }}>
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 apple-font-medium text-sm transition-all duration-200`}
                  style={{
                    borderColor: isActive 
                      ? 'rgb(var(--apple-blue))' 
                      : 'transparent',
                    color: isActive 
                      ? 'rgb(var(--apple-blue))' 
                      : 'rgb(var(--apple-gray-1))',
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`mx-6 mt-6 p-4 rounded-xl flex items-center space-x-3 ${
            alert.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
              alert.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {alert.type === 'success' ? '✓' : '✕'}
            </div>
            <span className="font-medium">{alert.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipient */}
          <div className="space-y-2">
            <label htmlFor="to" className="block text-sm font-semibold text-slate-900 dark:text-white">
              To
            </label>
            <div className="relative">
              <input
                type="email"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="recipient@example.com"
                className="w-full px-4 py-3 pr-12 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter a compelling subject line"
              className="w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          {/* Email Type */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Format:</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, emailType: 'text' }))}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  formData.emailType === 'text'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Type className="h-4 w-4" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, emailType: 'html' }))}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  formData.emailType === 'html'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Code className="h-4 w-4" />
                <span>HTML</span>
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-white">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={
                formData.emailType === 'html' 
                  ? 'Enter HTML content...\n\n<h1>Hello!</h1>\n<p>Your message here...</p>' 
                  : 'Write your message here...'
              }
              rows={12}
              className={`w-full px-4 py-3 text-base border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                formData.emailType === 'html' ? 'font-mono' : ''
              }`}
              required
            />
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>{formData.emailType === 'html' ? 'HTML formatting enabled' : 'Plain text format'}</span>
              <span>{formData.message.length} characters</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex space-x-3">
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
