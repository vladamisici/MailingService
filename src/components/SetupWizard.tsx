'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Mail, Shield, Database, Rocket, Server, Key, Info, RefreshCw, HelpCircle, Copy, ExternalLink, Terminal, Globe, ChevronRight, Play, AlertTriangle } from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export default function SetupWizard({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState<string | null>(null);
  const [smtpTestResult, setSmtpTestResult] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [isChecking, setIsChecking] = useState(false);
  const [setupData, setSetupData] = useState({
    deployment: {
      method: '', // local, vercel, railway, render
      readyToDeploy: false
    },
    database: {
      type: 'sqlite',
      url: 'file:./mailservice.db',
      host: 'localhost',
      port: 5432,
      name: 'mailservice',
      user: '',
      password: ''
    },
    smtp: {
      provider: '', // gmail, outlook, sendgrid, brevo, custom
      host: '',
      port: 587,
      secure: false,
      user: '',
      pass: ''
    },
    email: {
      fromEmail: '',
      fromName: ''
    },
    security: {
      jwtSecret: '',
      autoGenerate: true
    },
    admin: {
      email: '',
      password: ''
    }
  });
  const [apiKeys, setApiKeys] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const steps: SetupStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Get started with your email service',
      icon: <Rocket className="h-6 w-6" />,
      completed: false
    },
    {
      id: 'deployment',
      title: 'Where to Host',
      description: 'Choose where your service will run',
      icon: <Globe className="h-6 w-6" />,
      completed: false
    },
    {
      id: 'email',
      title: 'Email Setup',
      description: 'Connect your email provider',
      icon: <Mail className="h-6 w-6" />,
      completed: false
    },
    {
      id: 'admin',
      title: 'Your Account',
      description: 'Create your admin account',
      icon: <Shield className="h-6 w-6" />,
      completed: false
    },
    {
      id: 'finish',
      title: 'All Done!',
      description: 'Get your API keys',
      icon: <CheckCircle className="h-6 w-6" />,
      completed: false
    }
  ];

  const emailProviders = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Personal Gmail account',
      icon: '📧',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false
      },
      help: {
        title: 'Gmail Setup Guide',
        steps: [
          'Go to your Google Account settings',
          'Click on "Security" in the left menu',
          'Turn on "2-Step Verification" if not already enabled',
          'Scroll down and click "App passwords"',
          'Select "Mail" and your device',
          'Copy the generated password and paste it below'
        ],
        link: 'https://myaccount.google.com/apppasswords',
        linkText: 'Open Google App Passwords'
      }
    },
    {
      id: 'outlook',
      name: 'Outlook/Hotmail',
      description: 'Microsoft email account',
      icon: '📮',
      config: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false
      },
      help: {
        title: 'Outlook Setup Guide',
        steps: [
          'Use your full email address as username',
          'Use your regular Outlook password',
          'If using 2FA, create an app password instead'
        ]
      }
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Professional email service (Free tier available)',
      icon: '🚀',
      config: {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false
      },
      help: {
        title: 'SendGrid Setup Guide',
        steps: [
          'Sign up for a free SendGrid account',
          'Go to Settings → API Keys',
          'Create a new API key with "Mail Send" permission',
          'Username: Enter "apikey" (exactly as shown)',
          'Password: Paste your API key'
        ],
        link: 'https://signup.sendgrid.com/',
        linkText: 'Sign up for SendGrid (Free)'
      }
    },
    {
      id: 'brevo',
      name: 'Brevo (Sendinblue)',
      description: 'Free plan with 300 emails/day',
      icon: '📨',
      config: {
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false
      },
      help: {
        title: 'Brevo Setup Guide',
        steps: [
          'Sign up for a free Brevo account',
          'Go to SMTP & API section',
          'Create SMTP credentials',
          'Use the provided login and password'
        ],
        link: 'https://www.brevo.com/free-smtp-server/',
        linkText: 'Sign up for Brevo (Free)'
      }
    }
  ];

  const deploymentOptions = [
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Free hosting, automatic HTTPS, great for beginners',
      difficulty: 'Easiest',
      icon: '▲',
      color: 'bg-black text-white',
      steps: [
        'Click the deploy button below',
        'Connect your GitHub account',
        'Follow the prompts',
        'Your service will be live in 2 minutes!'
      ]
    },
    {
      id: 'railway',
      name: 'Railway',
      description: 'Simple deployment with database included',
      difficulty: 'Easy',
      icon: '🚂',
      color: 'bg-purple-600 text-white',
      steps: [
        'Click the deploy button below',
        'Sign in with GitHub',
        'Railway will set everything up',
        'Get your live URL instantly!'
      ]
    },
    {
      id: 'render',
      name: 'Render',
      description: 'Free tier available, reliable hosting',
      difficulty: 'Easy',
      icon: '🎯',
      color: 'bg-blue-600 text-white',
      steps: [
        'Click the deploy button below',
        'Create a Render account',
        'Follow the setup wizard',
        'Your API will be ready in minutes!'
      ]
    },
    {
      id: 'local',
      name: 'My Computer',
      description: 'Run on your own computer (testing only)',
      difficulty: 'Technical',
      icon: '💻',
      color: 'bg-gray-600 text-white',
      steps: [
        'Make sure Node.js is installed',
        'Download and extract the code',
        'Run the setup commands',
        'Access at http://localhost:3000'
      ]
    }
  ];

  const generateSecureKey = (length: number = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (setupData.security.autoGenerate && !setupData.security.jwtSecret) {
      setSetupData({
        ...setupData,
        security: {
          ...setupData.security,
          jwtSecret: generateSecureKey(32)
        }
      });
    }
  }, []);

  const handleNext = () => {
    setError('');
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const testSmtpConnection = async () => {
    setSmtpTestResult('testing');
    try {
      const response = await fetch('/api/setup/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupData.smtp)
      });

      if (response.ok) {
        setSmtpTestResult('success');
      } else {
        setSmtpTestResult('failed');
        const data = await response.json();
        setError(data.error || 'Connection failed. Check your settings.');
      }
    } catch (error) {
      setSmtpTestResult('failed');
      setError('Failed to test connection. Please check your settings.');
    }
  };

  const handleSetupComplete = async () => {
    setLoading(true);
    setError('');

    try {
      // For cloud deployments, we just prepare the configuration
      if (['vercel', 'railway', 'render'].includes(setupData.deployment.method)) {
        setApiKeys({
          admin: generateSecureKey(32),
          public: generateSecureKey(32),
          deploymentConfig: setupData
        });
        setCurrentStep(currentStep + 1);
        return;
      }

      // For local deployment, actually run the setup
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      setApiKeys(data.apiKeys);
      setCurrentStep(currentStep + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Mail className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Mail Service! 🎉
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Let's set up your own email API service in just 5 minutes. No technical knowledge required!
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">What you'll get:</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Your Own Email API</p>
                    <p className="text-sm text-gray-600">Send emails from your apps, websites, or services</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Free Forever</p>
                    <p className="text-sm text-gray-600">No monthly fees, you own everything</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Professional Features</p>
                    <p className="text-sm text-gray-600">Templates, analytics, and more - just like SendGrid or Mailgun</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">What you'll need:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>An email account (Gmail, Outlook, etc.)</li>
                    <li>5 minutes of your time</li>
                    <li>That's it! We'll handle everything else</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center group"
              >
                Let's Get Started
                <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      case 1: // Deployment Choice
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Where should we host your email service?
              </h3>
              <p className="text-gray-600">
                Choose the option that works best for you
              </p>
            </div>

            <div className="space-y-4">
              {deploymentOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSetupData({
                    ...setupData,
                    deployment: { method: option.id, readyToDeploy: true }
                  })}
                  className={`w-full p-6 rounded-xl border-2 transition-all ${
                    setupData.deployment.method === option.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`text-3xl mr-4 ${option.color} w-16 h-16 rounded-lg flex items-center justify-center`}>
                      {option.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{option.name}</h4>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          option.difficulty === 'Easiest' ? 'bg-green-100 text-green-800' :
                          option.difficulty === 'Easy' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {option.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{option.description}</p>
                      {setupData.deployment.method === option.id && (
                        <div className="mt-4 space-y-2 border-t pt-4">
                          <p className="font-medium text-gray-700">How it works:</p>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                            {option.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Recommendation for beginners:</p>
                  <p>Choose <strong>Vercel</strong> or <strong>Railway</strong> - they're free and set up everything automatically!</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Email Provider Setup
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Connect your email provider
              </h3>
              <p className="text-gray-600">
                This is how your service will send emails
              </p>
            </div>

            {!setupData.smtp.provider && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Choose your email provider:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emailProviders.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => setSetupData({
                        ...setupData,
                        smtp: {
                          ...setupData.smtp,
                          provider: provider.id,
                          ...provider.config
                        }
                      })}
                      className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">{provider.icon}</span>
                        <h4 className="text-lg font-semibold text-gray-900">{provider.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setSetupData({
                    ...setupData,
                    smtp: { ...setupData.smtp, provider: 'custom' }
                  })}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all text-center text-gray-600"
                >
                  <span className="text-sm">Use a different email provider</span>
                </button>
              </div>
            )}

            {setupData.smtp.provider && (
              <div className="space-y-6">
                {setupData.smtp.provider !== 'custom' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <HelpCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        {(() => {
                          const provider = emailProviders.find(p => p.id === setupData.smtp.provider);
                          if (!provider?.help) return null;
                          return (
                            <>
                              <h4 className="font-semibold text-blue-900 mb-3">{provider.help.title}</h4>
                              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                {provider.help.steps.map((step, idx) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ol>
                              {provider.help.link && (
                                <a
                                  href={provider.help.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                >
                                  {provider.help.linkText}
                                  <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {setupData.smtp.provider === 'custom' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SMTP Server
                        </label>
                        <input
                          type="text"
                          value={setupData.smtp.host}
                          onChange={(e) => setSetupData({
                            ...setupData,
                            smtp: { ...setupData.smtp, host: e.target.value }
                          })}
                          placeholder="smtp.example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Port
                          </label>
                          <select
                            value={setupData.smtp.port}
                            onChange={(e) => setSetupData({
                              ...setupData,
                              smtp: { ...setupData.smtp, port: parseInt(e.target.value) }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="587">587 (Recommended)</option>
                            <option value="465">465</option>
                            <option value="25">25</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Security
                          </label>
                          <select
                            value={setupData.smtp.secure ? 'true' : 'false'}
                            onChange={(e) => setSetupData({
                              ...setupData,
                              smtp: { ...setupData.smtp, secure: e.target.value === 'true' }
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="false">TLS</option>
                            <option value="true">SSL</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setupData.smtp.provider === 'sendgrid' ? 'Username (enter "apikey")' : 'Email Address'}
                    </label>
                    <input
                      type="text"
                      value={setupData.smtp.user}
                      onChange={(e) => setSetupData({
                        ...setupData,
                        smtp: { ...setupData.smtp, user: e.target.value }
                      })}
                      placeholder={setupData.smtp.provider === 'sendgrid' ? 'apikey' : 'your-email@example.com'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setupData.smtp.provider === 'gmail' ? 'App Password' :
                       setupData.smtp.provider === 'sendgrid' ? 'API Key' : 'Password'}
                    </label>
                    {setupData.smtp.provider === 'gmail' && (
                      <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            <p className="font-semibold">⚠️ Gmail requires an App Password</p>
                            <p className="mt-1">You <strong>cannot</strong> use your regular Gmail password here. You must generate an App Password.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      type="password"
                      value={setupData.smtp.pass}
                      onChange={(e) => setSetupData({
                        ...setupData,
                        smtp: { ...setupData.smtp, pass: e.target.value }
                      })}
                      placeholder={setupData.smtp.provider === 'gmail' ? '16-character App Password' : "••••••••••••"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {setupData.smtp.provider === 'gmail' && (
                      <p className="mt-1 text-xs text-gray-500">
                        This is NOT your Gmail password. Click the button above to generate an App Password.
                      </p>
                    )}
                  </div>

                  <div className="pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Email Address
                      </label>
                      <input
                        type="email"
                        value={setupData.email.fromEmail}
                        onChange={(e) => setSetupData({
                          ...setupData,
                          email: { ...setupData.email, fromEmail: e.target.value }
                        })}
                        placeholder="noreply@yourdomain.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        This is the email address that will appear as the sender
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={setupData.email.fromName}
                        onChange={(e) => setSetupData({
                          ...setupData,
                          email: { ...setupData.email, fromName: e.target.value }
                        })}
                        placeholder="Your Company Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={testSmtpConnection}
                    disabled={!setupData.smtp.host || !setupData.smtp.user || !setupData.smtp.pass || smtpTestResult === 'testing'}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                  >
                    {smtpTestResult === 'testing' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing connection...
                      </>
                    ) : smtpTestResult === 'success' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Connection successful!
                      </>
                    ) : smtpTestResult === 'failed' ? (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                        Connection failed - check settings
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setSetupData({
                    ...setupData,
                    smtp: { ...setupData.smtp, provider: '' }
                  })}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Choose a different provider
                </button>
              </div>
            )}
          </div>
        );

      case 3: // Admin Account
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Create your admin account
              </h3>
              <p className="text-gray-600">
                You'll use this to manage your email service
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={setupData.admin.email}
                  onChange={(e) => setSetupData({
                    ...setupData,
                    admin: { ...setupData.admin, email: e.target.value }
                  })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You'll use this to log into your dashboard
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose a Password
                </label>
                <input
                  type="password"
                  value={setupData.admin.password}
                  onChange={(e) => setSetupData({
                    ...setupData,
                    admin: { ...setupData.admin, password: e.target.value }
                  })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  At least 8 characters recommended
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Important:</p>
                    <p>Remember these credentials! You'll need them to access your email service dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Complete
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-lg text-gray-600">
                Your email service is ready to deploy
              </p>
            </div>

            {setupData.deployment.method !== 'local' ? (
              // Cloud deployment instructions
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-3">
                    Deploy to {deploymentOptions.find(d => d.id === setupData.deployment.method)?.name}
                  </h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Click the button below to deploy your email service. The deployment will use the configuration you just created.
                  </p>
                  
                  <div className="space-y-3">
                    {setupData.deployment.method === 'vercel' && (
                      <a
                        href={`https://vercel.com/new/clone?repository-url=https://github.com/vladamisici/mailing-service&env=DATABASE_URL,SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS,EMAIL_FROM,EMAIL_FROM_NAME,JWT_SECRET&envDescription=Email%20Service%20Configuration&envLink=https://github.com/vladamisici/mailing-service/blob/main/.env.example`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
                      >
                        Deploy to Vercel
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    )}
                    
                    {setupData.deployment.method === 'railway' && (
                      <a
                        href="https://railway.app/new/template/mailing-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                      >
                        Deploy to Railway
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    )}
                    
                    {setupData.deployment.method === 'render' && (
                      <a
                        href="https://render.com/deploy?repo=https://github.com/vladamisici/mailing-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Deploy to Render
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Configuration</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Copy these values when asked during deployment:
                  </p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">SMTP_HOST</span>
                      <div className="flex items-center">
                        <code className="mr-2">{setupData.smtp.host}</code>
                        <button
                          onClick={() => copyToClipboard(setupData.smtp.host, 'smtp_host')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">SMTP_USER</span>
                      <div className="flex items-center">
                        <code className="mr-2">{setupData.smtp.user}</code>
                        <button
                          onClick={() => copyToClipboard(setupData.smtp.user, 'smtp_user')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">SMTP_PASS</span>
                      <div className="flex items-center">
                        <code className="mr-2">••••••••</code>
                        <button
                          onClick={() => copyToClipboard(setupData.smtp.pass, 'smtp_pass')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">JWT_SECRET</span>
                      <div className="flex items-center">
                        <code className="mr-2 text-xs">{setupData.security.jwtSecret.substring(0, 10)}...</code>
                        <button
                          onClick={() => copyToClipboard(setupData.security.jwtSecret, 'jwt_secret')}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Local deployment instructions
              <div className="space-y-6">
                {apiKeys && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-3">Your API Keys</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Admin API Key:</p>
                        <div className="flex items-center mt-1">
                          <code className="text-xs bg-white px-3 py-2 rounded border border-gray-200 flex-1 font-mono">
                            {apiKeys.admin}
                          </code>
                          <button
                            onClick={() => copyToClipboard(apiKeys.admin, 'admin')}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Public API Key:</p>
                        <div className="flex items-center mt-1">
                          <code className="text-xs bg-white px-3 py-2 rounded border border-gray-200 flex-1 font-mono">
                            {apiKeys.public}
                          </code>
                          <button
                            onClick={() => copyToClipboard(apiKeys.public, 'public')}
                            className="ml-2 text-blue-600 hover:text-blue-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        Setup Complete! Your Mail Service is Ready
                      </p>
                      <p className="text-sm text-green-700 mb-4">
                        The web interface is now ready to use. You can start sending emails through the dashboard.
                      </p>
                      <p className="text-sm text-green-700 font-medium">
                        Note: The API keys above are only needed for external applications to access your API endpoints.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">What's Next?</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Save your API keys in a secure place</li>
                <li>Test sending an email using the API</li>
                <li>Check out the dashboard to manage your service</li>
                <li>Read the documentation for advanced features</li>
              </ol>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  // First call onComplete to set localStorage
                  onComplete();
                  // Then force a full page reload to pick up new environment variables
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 100);
                }}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Deployment
        return setupData.deployment.method !== '';
      case 2: // Email
        return setupData.smtp.host && setupData.smtp.user && setupData.smtp.pass &&
               setupData.email.fromEmail && setupData.email.fromName &&
               (smtpTestResult === 'success' || setupData.deployment.method !== 'local');
      case 3: // Admin
        return setupData.admin.email && setupData.admin.password && setupData.admin.password.length >= 8;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mail Service Setup
          </h1>
          <p className="text-gray-600">
            The easiest way to get your own email API
          </p>
        </div>

        {/* Progress */}
        {currentStep < steps.length - 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.slice(0, -1).map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                    ${index < currentStep ? 'bg-green-600 text-white' : 
                      index === currentStep ? 'bg-blue-600 text-white scale-110 shadow-lg' : 
                      'bg-gray-200 text-gray-400'}
                  `}>
                    {index < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="font-semibold text-sm">{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 2 && (
                    <div className={`
                      h-1 flex-1 mx-2 transition-all
                      ${index < currentStep ? 'bg-green-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {steps.slice(0, -1).map((step, index) => (
                <p key={step.id} className={`
                  text-xs font-medium text-center flex-1 transition-all
                  ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {step.title}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {currentStep < steps.length - 1 && (
            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Back
              </button>

              {currentStep < steps.length - 2 && (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center group"
                >
                  Continue
                  <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {currentStep === steps.length - 2 && (
                <button
                  onClick={handleSetupComplete}
                  disabled={!isStepValid() || loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help? Check out our{' '}
            <a href="/docs" className="text-blue-600 hover:underline">documentation</a>
            {' '}or{' '}
            <a href="https://github.com/vladamisici/mailing-service/issues" className="text-blue-600 hover:underline">get support</a>
          </p>
        </div>
      </div>
    </div>
  );
}