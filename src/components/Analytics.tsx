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
  Calendar,
  Download,
  Filter,
  Globe,
  Users,
  MousePointer,
  Eye
} from 'lucide-react';

interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
}

interface TimeSeriesData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

interface GeographicData {
  country: string;
  count: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        } else {
          console.error('Failed to fetch analytics:', response.statusText);
          // Fallback to empty data
          setAnalyticsData({
            totalSent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            complained: 0,
            unsubscribed: 0,
            deliveryRate: 0,
            openRate: 0,
            clickRate: 0,
            bounceRate: 0,
            timeSeriesData: [],
            geographicData: [],
            deviceData: [],
            recentEvents: []
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        // Fallback to empty data
        setAnalyticsData({
          totalSent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          complained: 0,
          unsubscribed: 0,
          deliveryRate: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          timeSeriesData: [],
          geographicData: [],
          deviceData: [],
          recentEvents: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const calculateRate = (numerator: number, denominator: number) => {
    return denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : '0.0';
  };

  const metrics = analyticsData ? [
    {
      title: 'Total Sent',
      value: analyticsData.totalSent || 0,
      icon: Mail,
      color: 'rgb(var(--apple-blue))',
      bg: 'rgb(var(--apple-blue) / 0.1)',
      change: analyticsData.totalSent > 0 ? `${analyticsData.totalSent} sent` : 'No emails sent yet',
      trend: 'up'
    },
    {
      title: 'Delivery Rate',
      value: `${analyticsData.deliveryRate || 0}%`,
      icon: CheckCircle,
      color: 'rgb(var(--apple-green))',
      bg: 'rgb(var(--apple-green) / 0.1)',
      change: `${analyticsData.delivered || 0} delivered`,
      trend: analyticsData.deliveryRate > 95 ? 'up' : analyticsData.deliveryRate > 90 ? 'neutral' : 'down'
    },
    {
      title: 'Open Rate',
      value: `${analyticsData.openRate || 0}%`,
      icon: Eye,
      color: 'rgb(var(--apple-purple))',
      bg: 'rgb(var(--apple-purple) / 0.1)',
      change: `${analyticsData.opened || 0} opens`,
      trend: analyticsData.openRate > 20 ? 'up' : analyticsData.openRate > 10 ? 'neutral' : 'down'
    },
    {
      title: 'Click Rate',
      value: `${analyticsData.clickRate || 0}%`,
      icon: MousePointer,
      color: 'rgb(var(--apple-orange))',
      bg: 'rgb(var(--apple-orange) / 0.1)',
      change: `${analyticsData.clicked || 0} clicks`,
      trend: analyticsData.clickRate > 5 ? 'up' : analyticsData.clickRate > 2 ? 'neutral' : 'down'
    },
    {
      title: 'Bounce Rate',
      value: `${analyticsData.bounceRate || 0}%`,
      icon: XCircle,
      color: 'rgb(var(--apple-red))',
      bg: 'rgb(var(--apple-red) / 0.1)',
      change: `${analyticsData.bounced || 0} bounces`,
      trend: analyticsData.bounceRate < 5 ? 'up' : analyticsData.bounceRate < 10 ? 'neutral' : 'down'
    },
    {
      title: 'Unsubscribe Rate',
      value: `${calculateRate(analyticsData.unsubscribed || 0, analyticsData.delivered || 1)}%`,
      icon: Users,
      color: 'rgb(var(--apple-gray-1))',
      bg: 'rgb(var(--apple-gray-4) / 0.1)',
      change: `${analyticsData.unsubscribed || 0} unsubscribed`,
      trend: 'neutral'
    }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-apple-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
            Email Analytics
          </h1>
          <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            Detailed insights into your email campaign performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" style={{ color: 'rgb(var(--apple-gray-1))' }} />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="apple-input py-2 px-3"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <button className="apple-button-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div 
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'rgb(var(--apple-blue))' }}
          ></div>
          <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            Loading real analytics data...
          </p>
        </div>
      )}

      {/* No Data State */}
      {!loading && analyticsData && analyticsData.totalSent === 0 && (
        <div className="text-center py-16">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgb(var(--apple-gray-6))' }}
          >
            <BarChart3 className="h-8 w-8" style={{ color: 'rgb(var(--apple-gray-1))' }} />
          </div>
          <h3 className="text-lg apple-font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
            No analytics data yet
          </h3>
          <p className="apple-font-regular mb-6" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            Send some emails to see analytics data appear here
          </p>
          <button 
            onClick={() => window.location.hash = '#api-docs'}
            className="apple-button-primary"
          >
            View API Documentation
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      {!loading && analyticsData && analyticsData.totalSent > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              
              return (
                <div
                  key={metric.title}
                  className="apple-card apple-interactive p-6 animate-apple-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center apple-shadow-sm"
                      style={{ background: metric.bg }}
                    >
                      <Icon className="h-6 w-6" style={{ color: metric.color }} />
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
                    style={{ color: metric.color }}
                  >
                    <span>{metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}</span>
                    <span>{metric.change}</span>
                  </div>
                </div>
              );
            })}
          </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Time Series Chart */}
        <div className="apple-card">
          <div className="p-6 apple-divider">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5" style={{ color: 'rgb(var(--apple-blue))' }} />
                <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  Email Performance Over Time
                </h3>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Real time series chart */}
            <div className="space-y-4">
              {analyticsData.timeSeriesData && analyticsData.timeSeriesData.length > 0 ? (
                analyticsData.timeSeriesData.slice(-7).map((data: any, index: number) => (
                  <div key={data.date} className="flex items-center space-x-4">
                    <div className="w-16 text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                      {new Date(data.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                        {data.sent > 0 && (
                          <>
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${Math.min((data.delivered / data.sent) * 100, 100)}%`,
                                background: 'rgb(var(--apple-green))'
                              }}
                            />
                            <div 
                              className="absolute top-0 h-2 rounded-full"
                              style={{ 
                                width: `${Math.min((data.opened / data.sent) * 100, 100)}%`,
                                background: 'rgb(var(--apple-blue))',
                                opacity: 0.7
                              }}
                            />
                          </>
                        )}
                      </div>
                      <div className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                        {data.sent || 0}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    No time series data available yet. Send some emails to see trends.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-6 pt-4 apple-divider">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgb(var(--apple-green))' }}></div>
                <span className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>Delivered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgb(var(--apple-blue))' }}></div>
                <span className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>Opened</span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="apple-card">
          <div className="p-6 apple-divider">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5" style={{ color: 'rgb(var(--apple-purple))' }} />
              <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                Geographic Distribution
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.geographicData && analyticsData.geographicData.length > 0 ? (
                analyticsData.geographicData.map((country: any, index: number) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="apple-font-medium text-sm" style={{ color: 'rgb(var(--foreground))' }}>
                        {country.country}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(country.percentage, 100)}%`,
                            background: `hsl(${index * 60}, 70%, 50%)`
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="apple-font-semibold text-sm" style={{ color: 'rgb(var(--foreground))' }}>
                        {country.count.toLocaleString()}
                      </div>
                      <div className="apple-font-regular text-xs" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                        {country.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    No geographic data available yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="apple-card">
          <div className="p-6 apple-divider">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5" style={{ color: 'rgb(var(--apple-orange))' }} />
              <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                Device Breakdown
              </h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.deviceData && analyticsData.deviceData.length > 0 ? (
                analyticsData.deviceData.map((device: any, index: number) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ background: `hsl(${index * 120}, 70%, 50%)` }}
                      />
                      <span className="apple-font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                        {device.device}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                        {device.count.toLocaleString()}
                      </div>
                      <div className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                        {device.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    No device data available yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="apple-card">
          <div className="p-6 apple-divider">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5" style={{ color: 'rgb(var(--apple-gray-1))' }} />
                <h3 className="text-lg apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                  Recent Events
                </h3>
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
            <div className="space-y-4">
              {analyticsData.recentEvents && analyticsData.recentEvents.length > 0 ? (
                analyticsData.recentEvents.slice(0, 5).map((event: any, index: number) => (
                  <div key={event.id} className="flex items-center space-x-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: event.event === 'opened' ? 'rgb(var(--apple-purple))' :
                                   event.event === 'clicked' ? 'rgb(var(--apple-orange))' :
                                   event.event === 'delivered' ? 'rgb(var(--apple-green))' :
                                   event.event === 'bounced' ? 'rgb(var(--apple-red))' :
                                   'rgb(var(--apple-blue))'
                      }}
                    />
                    <div className="flex-1">
                      <div className="apple-font-medium text-sm" style={{ color: 'rgb(var(--foreground))' }}>
                        Email {event.event}
                      </div>
                      <div className="apple-font-regular text-xs" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                        {event.recipient} • {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="apple-font-regular text-sm" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    No recent events. Events will appear here after sending emails.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}