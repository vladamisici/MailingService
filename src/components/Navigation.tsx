'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  BarChart3, 
  Edit, 
  Settings, 
  Search,
  Bell,
  Sun,
  Moon,
  FileText,
  Activity
} from 'lucide-react';

interface NavigationProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'api-docs', name: 'API Docs', icon: Edit },
  { id: 'templates', name: 'Templates', icon: FileText },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'monitoring', name: 'Monitoring', icon: Activity },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export default function Navigation({ activePage, setActivePage }: NavigationProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/server/status');
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="sticky top-0 z-50 apple-nav-glass">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 apple-gradient-blue rounded-xl flex items-center justify-center apple-shadow-sm">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                Mail API Server
              </h1>
              <p className="text-xs apple-font-medium" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                Self-Hosted Email Service
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg apple-font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'apple-shadow-sm'
                      : 'hover:apple-shadow-sm'
                  }`}
                  style={{
                    backgroundColor: isActive 
                      ? 'rgb(var(--apple-blue) / 0.1)' 
                      : 'transparent',
                    color: isActive 
                      ? 'rgb(var(--apple-blue))' 
                      : 'rgb(var(--apple-gray-1))',
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="hidden lg:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--apple-gray-1))' }} />
              <input
                type="text"
                placeholder="Search..."
                className="apple-input pl-10 pr-4 py-2 w-64 text-sm apple-focus"
                style={{
                  background: 'rgb(var(--apple-gray-6))',
                  color: 'rgb(var(--foreground))'
                }}
              />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200 hover:apple-shadow-sm"
              style={{
                backgroundColor: 'rgb(var(--apple-gray-6) / 0.5)',
              }}
            >
              {isDark ? (
                <Sun className="h-5 w-5" style={{ color: 'rgb(var(--apple-gray-1))' }} />
              ) : (
                <Moon className="h-5 w-5" style={{ color: 'rgb(var(--apple-gray-1))' }} />
              )}
            </button>

            {/* Notifications */}
            <button 
              className="p-2 rounded-lg transition-all duration-200 hover:apple-shadow-sm relative"
              style={{
                backgroundColor: 'rgb(var(--apple-gray-6) / 0.5)',
              }}
            >
              <Bell className="h-5 w-5" style={{ color: 'rgb(var(--apple-gray-1))' }} />
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                style={{ background: 'rgb(var(--apple-red))' }}
              ></div>
            </button>

            {/* Status */}
            <div 
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs apple-font-semibold"
              style={{
                backgroundColor: isOnline 
                  ? 'rgb(var(--apple-green) / 0.1)' 
                  : 'rgb(var(--apple-red) / 0.1)',
                color: isOnline 
                  ? 'rgb(var(--apple-green))' 
                  : 'rgb(var(--apple-red))'
              }}
            >
              <div 
                className={`w-2 h-2 rounded-full ${isOnline ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: isOnline 
                    ? 'rgb(var(--apple-green))' 
                    : 'rgb(var(--apple-red))'
                }}
              />
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}