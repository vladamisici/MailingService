'use client';

import { useState, useEffect } from 'react';
import { 
  Send, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Mail,
  Users,
  Zap,
  Activity,
  Globe,
  Copy,
  X
} from 'lucide-react';

interface Stats {
  sent: number;
  failed: number;
  queued: number;
  queueLength: number;
  processing: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    sent: 0,
    failed: 0,
    queued: 0,
    queueLength: 0,
    processing: false
  });
  const [publicAccess, setPublicAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check if public access is enabled
    const checkPublicAccess = () => {
      // This would normally check server configuration
      // For demo purposes, we'll simulate this
      setPublicAccess(localStorage.getItem('publicAccess') === 'true');
    };

    fetchStats();
    checkPublicAccess();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const successRate = stats.sent + stats.failed > 0 
    ? Math.round((stats.sent / (stats.sent + stats.failed)) * 100) 
    : 100;

  const metrics = [
    {
      title: 'API Requests',
      value: stats.sent,
      icon: Send,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Queue Size',
      value: stats.queued,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      change: stats.processing ? 'Processing' : 'Idle',
      trend: 'neutral'
    },
    {
      title: 'Failed Requests',
      value: stats.failed,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      change: '-5%',
      trend: 'down'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      change: 'Excellent',
      trend: 'up'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-apple-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
          API Server Dashboard
        </h1>
        <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
          Monitor your self-hosted email API server performance and usage
        </p>
      </div>

      {/* Public Access Banner */}
      {publicAccess && (
        <div 
          className="mb-8 p-4 rounded-xl apple-border animate-apple-slide-down"
          style={{ background: 'rgb(var(--apple-blue) / 0.1)' }}
        >
          <div className="flex items-start space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm mt-0.5"
              style={{ background: 'rgb(var(--apple-blue) / 0.2)' }}
            >
              <Globe className="h-5 w-5" style={{ color: 'rgb(var(--apple-blue))' }} />
            </div>
            <div className="flex-1">
              <h3 className="apple-font-semibold mb-2" style={{ color: 'rgb(var(--apple-blue))' }}>
                🌐 Public API Access Enabled
              </h3>
              <p className="apple-font-regular text-sm mb-3" style={{ color: 'rgb(var(--apple-blue))' }}>
                Your email API is now accessible from anywhere. External applications can send emails through your server.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs apple-font-medium" style={{ color: 'rgb(var(--apple-blue))' }}>
                    API Base URL:
                  </span>
                  <code 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      background: 'rgb(var(--apple-gray-6))',
                      color: 'rgb(var(--foreground))',
                      fontFamily: 'monospace'
                    }}
                  >
                    {typeof window !== 'undefined' ? window.location.origin : 'http://your-server.com'}
                  </code>
                  <button
                    onClick={() => {
                      const url = typeof window !== 'undefined' ? window.location.origin : 'http://your-server.com';
                      navigator.clipboard.writeText(url);
                    }}
                    className="p-1 rounded hover:apple-shadow-sm transition-all duration-200"
                    style={{ backgroundColor: 'rgb(var(--apple-gray-6))' }}
                  >
                    <Copy className="h-3 w-3" style={{ color: 'rgb(var(--apple-gray-1))' }} />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs apple-font-medium" style={{ color: 'rgb(var(--apple-blue))' }}>
                    Test endpoint:
                  </span>
                  <a 
                    href="/api/server/status"
                    target="_blank"
                    className="text-xs apple-font-regular underline"
                    style={{ color: 'rgb(var(--apple-blue))' }}
                  >
                    /api/server/status
                  </a>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setPublicAccess(false);
                localStorage.setItem('publicAccess', 'false');
              }}
              className="p-2 rounded-lg hover:bg-red-100 transition-all duration-200"
            >
              <X className="h-4 w-4" style={{ color: 'rgb(var(--apple-red))' }} />
            </button>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          if (loading) {
            return (
              <div key={metric.title} className="apple-card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl" style={{ background: 'rgb(var(--apple-gray-5))' }}></div>
                  <div className="w-16 h-4 rounded" style={{ background: 'rgb(var(--apple-gray-5))' }}></div>
                </div>
                <div className="w-20 h-8 rounded mb-2" style={{ background: 'rgb(var(--apple-gray-5))' }}></div>
                <div className="w-24 h-3 rounded" style={{ background: 'rgb(var(--apple-gray-5))' }}></div>
              </div>
            );
          }

          return (
            <div
              key={metric.title}
              className="apple-card apple-interactive p-6 animate-apple-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center apple-shadow-sm"
                  style={{
                    background: metric.trend === 'up' 
                      ? 'rgb(var(--apple-green) / 0.1)' 
                      : metric.trend === 'down' 
                      ? 'rgb(var(--apple-red) / 0.1)'
                      : 'rgb(var(--apple-blue) / 0.1)'
                  }}
                >
                  <Icon 
                    className="h-6 w-6" 
                    style={{
                      color: metric.trend === 'up' 
                        ? 'rgb(var(--apple-green))' 
                        : metric.trend === 'down' 
                        ? 'rgb(var(--apple-red))'
                        : 'rgb(var(--apple-blue))'
                    }}
                  />
                </div>
                <div className="text-sm apple-font-medium" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                  {metric.title}
                </div>
              </div>
              
              <div className="text-2xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              </div>
              
              <div 
                className="flex items-center space-x-1 text-sm apple-font-medium"
                style={{
                  color: metric.trend === 'up' 
                    ? 'rgb(var(--apple-green))' 
                    : metric.trend === 'down' 
                    ? 'rgb(var(--apple-red))'
                    : 'rgb(var(--apple-gray-1))'
                }}
              >
                <span>{metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}</span>
                <span>{metric.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* API Documentation */}
        <div className="apple-card apple-interactive p-6 animate-apple-spring" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
              style={{ background: 'rgb(var(--apple-blue) / 0.1)' }}
            >
              <Zap className="h-5 w-5" style={{ color: 'rgb(var(--apple-blue))' }} />
            </div>
            <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>API Docs</h3>
          </div>
          <p className="apple-font-regular mb-4" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            View endpoints, examples, and integration guides
          </p>
          <button 
            className="apple-button-primary w-full"
            onClick={() => window.location.hash = '#api-docs'}
          >
            View Documentation
          </button>
        </div>

        {/* Server Management */}
        <div className="apple-card apple-interactive p-6 animate-apple-spring" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
              style={{ background: 'rgb(var(--apple-purple) / 0.1)' }}
            >
              <Mail className="h-5 w-5" style={{ color: 'rgb(var(--apple-purple))' }} />
            </div>
            <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>Server Control</h3>
          </div>
          <p className="apple-font-regular mb-4" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            Start, stop, and restart your email server
          </p>
          <button 
            className="apple-button-secondary w-full"
            style={{ 
              background: 'rgb(var(--apple-purple) / 0.1)',
              color: 'rgb(var(--apple-purple))'
            }}
          >
            Manage Server
          </button>
        </div>

        {/* Public Exposure */}
        <div className="apple-card apple-interactive p-6 animate-apple-spring" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
              style={{ background: 'rgb(var(--apple-orange) / 0.1)' }}
            >
              <Users className="h-5 w-5" style={{ color: 'rgb(var(--apple-orange))' }} />
            </div>
            <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>Expose to Public</h3>
          </div>
          <p className="apple-font-regular mb-4" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            ⚠️ Allow external API access (security risk)
          </p>
          <button 
            className="apple-button-secondary w-full"
            style={{ 
              background: 'rgb(var(--apple-orange) / 0.1)',
              color: 'rgb(var(--apple-orange))'
            }}
          >
            Configure Access
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="apple-card animate-apple-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="p-6 apple-divider">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5" style={{ color: 'rgb(var(--apple-gray-1))' }} />
              <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>API Activity</h3>
            </div>
            <button 
              className="text-sm apple-font-medium transition-colors duration-200"
              style={{ color: 'rgb(var(--apple-blue))' }}
            >
              View All
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgb(var(--apple-gray-6))' }}
            >
              <Activity className="h-8 w-8" style={{ color: 'rgb(var(--apple-gray-1))' }} />
            </div>
            <h4 className="text-lg apple-font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
              No API requests yet
            </h4>
            <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
              API requests will appear here once your server starts receiving calls
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
