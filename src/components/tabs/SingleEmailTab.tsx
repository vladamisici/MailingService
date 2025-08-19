'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles, Mail } from 'lucide-react';

export default function SingleEmailTab() {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    emailType: 'text',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
        setFormData({ to: '', subject: '', emailType: 'text', message: '' });
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
    <div className="max-w-3xl mx-auto">
      {/* Alert with Apple Design */}
      {alert && (
        <div className={`mb-10 apple-animate-scale ${
          alert.type === 'success' ? 'apple-alert-success' : 'apple-alert-error'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm ${
            alert.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {alert.type === 'success' ? '✓' : '✕'}
          </div>
          <span className="text-body font-semibold">{alert.message}</span>
        </div>
      )}

      {/* Form with Apple Design */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Recipient Field */}
        <div className="space-y-3 apple-animate-in" style={{ animationDelay: '100ms' }}>
          <label htmlFor="to" className="block text-headline text-gray-900 dark:text-white">
            Recipient
          </label>
          <div className="relative">
            <input
              type="email"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              placeholder="recipient@example.com"
              className="apple-input"
              required
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Subject Field */}
        <div className="space-y-3 apple-animate-in" style={{ animationDelay: '200ms' }}>
          <label htmlFor="subject" className="block text-headline text-gray-900 dark:text-white">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Enter a compelling subject line"
            className="apple-input"
            required
          />
        </div>

        {/* Email Type Selector */}
        <div className="space-y-3 apple-animate-in" style={{ animationDelay: '300ms' }}>
          <label htmlFor="emailType" className="block text-headline text-gray-900 dark:text-white">
            Email Format
          </label>
          <div className="relative">
            <select
              id="emailType"
              name="emailType"
              value={formData.emailType}
              onChange={handleInputChange}
              className="apple-select"
            >
              <option value="text">Plain Text</option>
              <option value="html">Rich HTML</option>
            </select>
          </div>
        </div>

        {/* Message Field */}
        <div className="space-y-3 apple-animate-in" style={{ animationDelay: '400ms' }}>
          <label htmlFor="message" className="block text-headline text-gray-900 dark:text-white">
            Message
          </label>
          <div className="relative">
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={
                formData.emailType === 'html' 
                  ? 'Create beautiful HTML content...\n\nExample:\n<h1>Hello!</h1>\n<p>Your message here...</p>' 
                  : 'Write your message here...\n\nTip: Keep it clear and engaging for better results.'
              }
              rows={12}
              className="apple-textarea"
              style={{
                fontFamily: formData.emailType === 'html' 
                  ? "'SF Mono', Monaco, 'Cascadia Code', monospace" 
                  : 'inherit'
              }}
              required
            />
            <div className="absolute bottom-5 right-5 text-gray-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-caption-1 text-gray-500 dark:text-gray-400">
              {formData.emailType === 'html' ? 'HTML formatting enabled' : 'Plain text format'}
            </p>
            <p className="text-caption-1 text-gray-500 dark:text-gray-400">
              {formData.message.length} characters
            </p>
          </div>
        </div>

        {/* Submit Button with Apple Design */}
        <div className="apple-animate-in" style={{ animationDelay: '500ms' }}>
          <button
            type="submit"
            disabled={loading}
            className={`apple-button w-full group relative overflow-hidden ${
              loading ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            style={{
              background: loading 
                ? 'var(--apple-gray-2)' 
                : 'linear-gradient(135deg, var(--apple-blue) 0%, var(--apple-blue-dark) 100%)',
              boxShadow: loading 
                ? 'none' 
                : '0 8px 32px rgba(0, 122, 255, 0.3), 0 4px 16px rgba(0, 122, 255, 0.2)',
              transform: loading ? 'none' : undefined
            }}
          >
            {/* Button Content */}
            <div className="flex items-center justify-center space-x-3 relative z-10">
              {loading ? (
                <>
                  <div className="apple-loading" />
                  <span className="text-body font-semibold">Sending Email...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 group-hover:scale-110 apple-transition" />
                  <span className="text-body font-semibold">Send Email</span>
                </>
              )}
            </div>

            {/* Animated background effect */}
            {!loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/20 to-blue-600/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            )}
          </button>
        </div>
      </form>

      {/* Apple-style Tips Section */}
      <div className="mt-12 p-8 apple-glass rounded-2xl apple-animate-in" style={{ animationDelay: '600ms' }}>
        <h4 className="text-headline text-gray-900 dark:text-white mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-blue-500" />
          Pro Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-subheadline text-gray-600 dark:text-gray-400">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <p>Use HTML format for rich content with images and styling</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
            <p>Keep subject lines under 50 characters for better delivery</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
            <p>Test with your own email first before sending to others</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
            <p>Configure SMTP settings in the Configuration tab</p>
          </div>
        </div>
      </div>
    </div>
  );
}