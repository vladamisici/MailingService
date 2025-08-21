'use client';

import { useState } from 'react';
import { Menu, X, Mail, Send, Database, Settings, BarChart3, Shield, Home } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'single', name: 'Single Email', icon: Mail },
    { id: 'bulk', name: 'Bulk Send', icon: Send },
    { id: 'templates', name: 'Templates', icon: Settings },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'api', name: 'API Keys', icon: Shield },
  ];

  const handleGoHome = () => {
    localStorage.removeItem('returning_user');
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Mail className="h-10 w-10 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mailing Service</h1>
                <p className="text-sm text-gray-500">Self-Hosted Email API</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            <button
              onClick={handleGoHome}
              className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
              title="Back to Home"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </button>
            <div className="w-px h-8 bg-gray-200 mx-2" />
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                handleGoHome();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Home className="h-5 w-5 mr-3" />
              Home
            </button>
            <div className="my-2 border-t border-gray-200" />
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-all
                    ${activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}