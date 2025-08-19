'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Server,
  AlertTriangle
} from 'lucide-react';

interface QueueItem {
  id: string;
  to: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: string;
}

interface ServerHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export default function Monitoring() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [serverHealth, setServerHealth] = useState<ServerHealth>({
    status: 'healthy',
    uptime: '2d 14h 32m',
    memoryUsage: 45,
    cpuUsage: 12,
    diskUsage: 68
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch('/api/queue');
        if (response.ok) {
          const data = await response.json();
          setQueue(data);
        }
      } catch (error) {
        console.error('Failed to fetch queue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-5 w-5" style={{ color: 'rgb(var(--apple-green))' }} />;
      case 'failed':
        return <XCircle className="h-5 w-5" style={{ color: 'rgb(var(--apple-red))' }} />;
      case 'pending':
        return <Clock className="h-5 w-5" style={{ color: 'rgb(var(--apple-orange))' }} />;
      default:
        return <Mail className="h-5 w-5" style={{ color: 'rgb(var(--apple-gray-1))' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'rgb(var(--apple-green))';
      case 'failed':
        return 'rgb(var(--apple-red))';
      case 'pending':
        return 'rgb(var(--apple-orange))';
      default:
        return 'rgb(var(--apple-gray-1))';
    }
  };

  const getHealthStatus = (value: number, type: 'memory' | 'cpu' | 'disk') => {
    const thresholds = {
      memory: { warning: 70, error: 90 },
      cpu: { warning: 80, error: 95 },
      disk: { warning: 80, error: 95 }
    };
    
    const threshold = thresholds[type];
    if (value >= threshold.error) return 'error';
    if (value >= threshold.warning) return 'warning';
    return 'healthy';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'rgb(var(--apple-green))';
      case 'warning':
        return 'rgb(var(--apple-orange))';
      case 'error':
        return 'rgb(var(--apple-red))';
      default:
        return 'rgb(var(--apple-gray-1))';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-apple-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
          Server Monitoring
        </h1>
        <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
          Monitor your email API server health and email queue status
        </p>
      </div>

      {/* Server Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Server Status */}
        <div className="apple-card apple-interactive p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
              style={{ background: `${getHealthColor(serverHealth.status)} / 0.1` }}
            >
              <Server className="h-5 w-5" style={{ color: getHealthColor(serverHealth.status) }} />
            </div>
            <div>
              <h3 className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                Server Status
              </h3>
              <p 
                className="text-sm apple-font-regular capitalize"
                style={{ color: getHealthColor(serverHealth.status) }}
              >
                {serverHealth.status}
              </p>
            </div>
          </div>
          <div className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            Uptime: {serverHealth.uptime}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="apple-card apple-interactive p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
                style={{ background: `${getHealthColor(getHealthStatus(serverHealth.memoryUsage, 'memory'))} / 0.1` }}
              >
                <Activity className="h-5 w-5" style={{ color: getHealthColor(getHealthStatus(serverHealth.memoryUsage, 'memory')) }} />
              </div>
              <div>
                <h3 className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                  Memory
                </h3>
                <p className="text-sm apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                  {serverHealth.memoryUsage}% used
                </p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${serverHealth.memoryUsage}%`,
                background: getHealthColor(getHealthStatus(serverHealth.memoryUsage, 'memory'))
              }}
            ></div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="apple-card apple-interactive p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
                style={{ background: `${getHealthColor(getHealthStatus(serverHealth.cpuUsage, 'cpu'))} / 0.1` }}
              >
                <TrendingUp className="h-5 w-5" style={{ color: getHealthColor(getHealthStatus(serverHealth.cpuUsage, 'cpu')) }} />
              </div>
              <div>
                <h3 className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                  CPU
                </h3>
                <p className="text-sm apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                  {serverHealth.cpuUsage}% used
                </p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${serverHealth.cpuUsage}%`,
                background: getHealthColor(getHealthStatus(serverHealth.cpuUsage, 'cpu'))
              }}
            ></div>
          </div>
        </div>

        {/* Disk Usage */}
        <div className="apple-card apple-interactive p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center apple-shadow-sm"
                style={{ background: `${getHealthColor(getHealthStatus(serverHealth.diskUsage, 'disk'))} / 0.1` }}
              >
                <BarChart3 className="h-5 w-5" style={{ color: getHealthColor(getHealthStatus(serverHealth.diskUsage, 'disk')) }} />
              </div>
              <div>
                <h3 className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                  Disk
                </h3>
                <p className="text-sm apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                  {serverHealth.diskUsage}% used
                </p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${serverHealth.diskUsage}%`,
                background: getHealthColor(getHealthStatus(serverHealth.diskUsage, 'disk'))
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Email Queue */}
      <div className="apple-card">
        <div className="p-6 apple-divider">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5" style={{ color: 'rgb(var(--apple-gray-1))' }} />
              <h2 className="text-xl apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                Email Queue
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'rgb(var(--apple-green))' }}
              ></div>
              <span className="text-sm apple-font-medium" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                Live
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div 
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: 'rgb(var(--apple-blue))' }}
              ></div>
              <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                Loading queue...
              </p>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgb(var(--apple-gray-6))' }}
              >
                <Mail className="h-8 w-8" style={{ color: 'rgb(var(--apple-gray-1))' }} />
              </div>
              <h3 className="text-lg apple-font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                Queue is empty
              </h3>
              <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                No emails in queue. All processed successfully!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg apple-border"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                        {item.subject}
                      </div>
                      <div className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                        To: {item.to}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div 
                      className="text-sm apple-font-medium capitalize"
                      style={{ color: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </div>
                    <div className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                      {item.attempts > 1 && `${item.attempts} attempts • `}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
