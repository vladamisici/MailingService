'use client';

import { useState, useEffect } from 'react';
import { Send, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface Stats {
  sent: number;
  failed: number;
  queued: number;
  queueLength: number;
  processing: boolean;
}

export default function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    sent: 0,
    failed: 0,
    queued: 0,
    queueLength: 0,
    processing: false
  });

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

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const successRate = stats.sent + stats.failed > 0 
    ? Math.round((stats.sent / (stats.sent + stats.failed)) * 100) 
    : 100;

  const cards = [
    {
      title: 'Emails Sent',
      value: stats.sent,
      icon: Send,
      gradient: 'apple-gradient-green',
      change: 'Ready to send',
      changeIcon: '↗',
      shadowColor: 'rgba(52, 199, 89, 0.25)'
    },
    {
      title: 'In Queue',
      value: stats.queued,
      icon: Clock,
      gradient: 'apple-gradient-orange',
      change: stats.processing ? 'Processing' : 'Waiting',
      changeIcon: '⏳',
      shadowColor: 'rgba(255, 149, 0, 0.25)'
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: AlertTriangle,
      gradient: 'apple-gradient-red',
      change: 'Error rate',
      changeIcon: '⚠',
      shadowColor: 'rgba(255, 59, 48, 0.25)'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      gradient: 'apple-gradient-blue',
      change: 'Excellent',
      changeIcon: '✨',
      shadowColor: 'rgba(0, 122, 255, 0.25)'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="apple-card-metric animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
              <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
            </div>
            <div className="w-20 h-16 bg-gray-300 dark:bg-gray-600 rounded-2xl mb-4"></div>
            <div className="w-28 h-4 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="apple-card-metric group apple-animate-scale"
            style={{ 
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Card Content */}
            <div className="relative z-10">
              {/* Header with Icon and Label */}
              <div className="flex items-center justify-between mb-8">
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.gradient} apple-shadow-md group-hover:scale-110 apple-transition`}
                  style={{
                    boxShadow: `0 4px 20px ${card.shadowColor}, 0 2px 8px ${card.shadowColor}`
                  }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-caption-1 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {card.title}
                </div>
              </div>
              
              {/* Main Value */}
              <div 
                className="text-6xl font-bold mb-4 tracking-tight group-hover:scale-105 apple-transition"
                style={{
                  background: 'linear-gradient(135deg, var(--apple-label) 0%, var(--apple-secondary-label) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </div>
              
              {/* Change Indicator */}
              <div className="flex items-center space-x-2 text-footnote font-semibold">
                <span 
                  className="text-lg"
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                  }}
                >
                  {card.changeIcon}
                </span>
                <span className="text-gray-600 dark:text-gray-400 tracking-wide">
                  {card.change}
                </span>
              </div>
            </div>

            {/* Subtle animated background */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-5 apple-transition-slow rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${card.shadowColor} 0%, transparent 100%)` }}
            />

            {/* Border highlight on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 apple-transition pointer-events-none">
              <div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${card.shadowColor} 0%, transparent 100%)`,
                  padding: '1px'
                }}
              >
                <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-800"></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}