'use client';

import { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, XCircle, Zap, Users } from 'lucide-react';

interface QueueItem {
  id: string;
  to: string;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  createdAt: string;
}

export default function QueueDisplay() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sent':
        return {
          icon: CheckCircle,
          color: 'var(--apple-green)',
          bgColor: 'rgba(52, 199, 89, 0.1)',
          borderColor: 'rgba(52, 199, 89, 0.25)',
          shadowColor: 'rgba(52, 199, 89, 0.2)'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'var(--apple-red)',
          bgColor: 'rgba(255, 59, 48, 0.1)',
          borderColor: 'rgba(255, 59, 48, 0.25)',
          shadowColor: 'rgba(255, 59, 48, 0.2)'
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          color: 'var(--apple-orange)',
          bgColor: 'rgba(255, 149, 0, 0.1)',
          borderColor: 'rgba(255, 149, 0, 0.25)',
          shadowColor: 'rgba(255, 149, 0, 0.2)'
        };
    }
  };

  if (loading) {
    return (
      <div className="p-12">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="apple-animate-scale"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="apple-card p-8 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
                    <div className="space-y-3">
                      <div className="w-48 h-6 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                      <div className="w-64 h-5 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                      <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="w-24 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="p-16 text-center apple-animate-in">
        {/* Empty State with Apple Design */}
        <div className="max-w-md mx-auto">
          <div 
            className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center apple-gradient-blue apple-shadow-xl"
            style={{
              boxShadow: '0 8px 32px rgba(0, 122, 255, 0.25), 0 4px 16px rgba(0, 122, 255, 0.15)'
            }}
          >
            <Zap className="h-12 w-12 text-white" />
          </div>
          
          <h3 className="text-title-2 text-gray-900 dark:text-white mb-4">
            All Clear!
          </h3>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Your email queue is empty. All messages have been processed successfully and delivered to their destinations.
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-caption-1 text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Ready to Send</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Queue Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12">
      {/* Queue Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-blue-500" />
          <h3 className="text-title-3 text-gray-900 dark:text-white">
            {queue.length} Email{queue.length !== 1 ? 's' : ''} in Queue
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-caption-1 text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 rounded-full bg-orange-500 apple-pulse"></div>
          <span>Auto-updating</span>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-4">
        {queue.map((item, index) => {
          const statusConfig = getStatusConfig(item.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div
              key={item.id}
              className="apple-card group p-8 apple-animate-in hover:scale-[1.02] apple-transition"
              style={{ 
                animationDelay: `${index * 100}ms`,
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.95) 0%, 
                    rgba(248, 248, 248, 0.95) 100%
                  )
                `
              }}
            >
              <div className="flex items-center justify-between">
                {/* Email Info */}
                <div className="flex items-center space-x-6 flex-1">
                  {/* Status Icon with Apple Design */}
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center apple-shadow-md group-hover:scale-110 apple-transition"
                    style={{
                      background: `linear-gradient(135deg, ${statusConfig.color} 0%, ${statusConfig.color}CC 100%)`,
                      boxShadow: `0 4px 16px ${statusConfig.shadowColor}, 0 2px 8px ${statusConfig.shadowColor}`
                    }}
                  >
                    <StatusIcon className="h-7 w-7 text-white" />
                  </div>
                  
                  {/* Email Details */}
                  <div className="flex-1 space-y-2">
                    <div className="text-headline text-gray-900 dark:text-white font-semibold">
                      {item.to}
                    </div>
                    <div className="text-subheadline text-gray-600 dark:text-gray-400 font-medium">
                      {item.subject}
                    </div>
                    <div className="flex items-center space-x-6 text-caption-1 text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </span>
                      {item.attempts > 1 && (
                        <span 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: 'rgba(255, 204, 0, 0.15)',
                            color: 'var(--apple-yellow)',
                            border: '1px solid rgba(255, 204, 0, 0.3)'
                          }}
                        >
                          Retry {item.attempts}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center space-x-4">
                  <div 
                    className="inline-flex items-center px-4 py-2 rounded-full text-footnote font-semibold apple-shadow-sm apple-transition group-hover:scale-105"
                    style={{
                      background: statusConfig.bgColor,
                      color: statusConfig.color,
                      border: `1px solid ${statusConfig.borderColor}`
                    }}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Subtle hover effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 apple-transition-slow rounded-2xl pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${statusConfig.shadowColor} 0%, transparent 100%)`
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}