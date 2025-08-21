'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Mail, Users, AlertCircle, CheckCircle, Clock, TrendingUp, Server, Database, Key } from 'lucide-react';

interface Stats {
  emails: {
    sent: number;
    queued: number;
    failed: number;
  };
  analytics: {
    opens: number;
    clicks: number;
    bounces: number;
  };
  system: {
    queueSize: number;
    apiKeys: number;
    webhooks: number;
    domains: number;
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      const [emailStats, analyticsData, healthData] = await Promise.all([
        fetch('/api/send').then(res => res.json()),
        fetch(`/api/analytics?timeRange=${timeRange}`).then(res => res.json()),
        fetch('/api/health/detailed').then(res => res.json())
      ]);

      setStats({
        emails: {
          sent: analyticsData.metrics?.sent || 0,
          queued: healthData.checks?.redis?.queueSize || 0,
          failed: analyticsData.metrics?.bounced || 0,
        },
        analytics: {
          opens: analyticsData.metrics?.opened || 0,
          clicks: analyticsData.metrics?.clicked || 0,
          bounces: analyticsData.metrics?.bounced || 0,
        },
        system: {
          queueSize: healthData.checks?.redis?.queueSize || 0,
          apiKeys: healthData.checks?.apiKeys?.count || 0,
          webhooks: healthData.checks?.webhooks?.count || 0,
          domains: healthData.checks?.domains?.verified || 0,
        }
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Emails Sent',
      value: stats?.emails.sent || 0,
      icon: Mail,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Open Rate',
      value: stats?.emails.sent ? `${Math.round((stats.analytics.opens / stats.emails.sent) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: '+3%',
    },
    {
      title: 'Click Rate',
      value: stats?.emails.sent ? `${Math.round((stats.analytics.clicks / stats.emails.sent) * 100)}%` : '0%',
      icon: BarChart3,
      color: 'bg-purple-500',
      trend: '+5%',
    },
    {
      title: 'Queue Size',
      value: stats?.system.queueSize || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: '0',
    },
  ];

  const systemStatus = [
    {
      name: 'Database',
      status: 'healthy',
      icon: Database,
    },
    {
      name: 'Redis Queue',
      status: 'healthy',
      icon: Server,
    },
    {
      name: 'SMTP',
      status: 'healthy',
      icon: Mail,
    },
    {
      name: 'API Keys',
      status: stats?.system.apiKeys ? 'active' : 'warning',
      icon: Key,
      count: stats?.system.apiKeys || 0,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={fetchStats}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">{stat.trend}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email Performance */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Delivery Rate</span>
                  <span className="text-sm font-medium text-gray-900">98%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Open Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.emails.sent ? `${Math.round((stats.analytics.opens / stats.emails.sent) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: stats?.emails.sent ? `${Math.round((stats.analytics.opens / stats.emails.sent) * 100)}%` : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Click Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.emails.sent ? `${Math.round((stats.analytics.clicks / stats.emails.sent) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: stats?.emails.sent ? `${Math.round((stats.analytics.clicks / stats.emails.sent) * 100)}%` : '0%' }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.emails.sent ? `${Math.round((stats.analytics.bounces / stats.emails.sent) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: stats?.emails.sent ? `${Math.round((stats.analytics.bounces / stats.emails.sent) * 100)}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              {systemStatus.map((item, index) => {
                const Icon = item.icon;
                const isHealthy = item.status === 'healthy' || item.status === 'active';
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Icon className="h-5 w-5 text-gray-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      {item.count !== undefined && (
                        <span className="text-sm text-gray-600 mr-2">({item.count})</span>
                      )}
                      {isHealthy ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Email Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Welcome Email</p>
                      <p className="text-xs text-gray-500">user{i}@example.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Delivered</p>
                    <p className="text-xs text-gray-500">{i} minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <Mail className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Send Email</h3>
            <p className="text-sm text-gray-600">Send single or bulk emails</p>
          </a>
          
          <a href="/api-docs" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <BarChart3 className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">View Analytics</h3>
            <p className="text-sm text-gray-600">Detailed email performance metrics</p>
          </a>
          
          <a href="/" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <Key className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage API Keys</h3>
            <p className="text-sm text-gray-600">Create and manage API access</p>
          </a>
        </div>
      </div>
    </div>
  );
}