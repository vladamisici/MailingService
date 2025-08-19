'use client';

import { useState, useEffect } from 'react';
import { Server, Activity, HardDrive, Cpu, Loader2 } from 'lucide-react';

interface ServerStatus {
  status: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  version: string;
  pid: number;
  env: string;
  timestamp: string;
}

export default function ServerTab() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadServerStatus = async () => {
    try {
      const response = await fetch('/api/server/status');
      if (response.ok) {
        const data = await response.json();
        setServerStatus(data);
      }
    } catch (error) {
      console.error('Failed to load server status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServerStatus();
    const interval = setInterval(loadServerStatus, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading server status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Server Management
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor server status and manage server operations.
        </p>
      </div>

      {serverStatus && (
        <>
          {/* Server Status Grid */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Status
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {serverStatus.status}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Uptime
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatUptime(serverStatus.uptime)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Memory Usage
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatBytes(serverStatus.memory.heapUsed)}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Node Version
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {serverStatus.version}
                </div>
              </div>
            </div>
          </div>

          {/* Server Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg mr-3">
                  <Server className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Restart Server
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                In Next.js development, the server restarts automatically when you make changes to the code.
              </p>
              <button className="btn-danger w-full" disabled>
                <Server className="h-4 w-4 mr-2" />
                Auto-restart Enabled
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Server Logs
                </h4>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                View server logs in your terminal where you started the Next.js development server.
              </p>
              <button 
                className="btn-secondary w-full"
                onClick={() => window.open('/_logs', '_blank')}
              >
                <Activity className="h-4 w-4 mr-2" />
                View Terminal Logs
              </button>
            </div>
          </div>

          {/* Additional Server Info */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Server Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Environment:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{serverStatus.env}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Process ID:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{serverStatus.pid}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {new Date(serverStatus.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
