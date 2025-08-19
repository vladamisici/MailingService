'use client';

import { useState } from 'react';
import { 
  Mail, 
  Users, 
  FileText, 
  Settings, 
  Edit, 
  Book, 
  Server 
} from 'lucide-react';
import SingleEmailTab from './tabs/SingleEmailTab';
import BulkEmailTab from './tabs/BulkEmailTab';
import TemplateEmailTab from './tabs/TemplateEmailTab';
import ConfigurationTab from './tabs/ConfigurationTab';
import TemplatesTab from './tabs/TemplatesTab';
import ReadmeTab from './tabs/ReadmeTab';
import ServerTab from './tabs/ServerTab';

const tabs = [
  { id: 'single', name: 'Single Email', icon: Mail, color: 'var(--apple-blue)' },
  { id: 'bulk', name: 'Bulk Email', icon: Users, color: 'var(--apple-purple)' },
  { id: 'template', name: 'Template', icon: FileText, color: 'var(--apple-orange)' },
  { id: 'config', name: 'Configuration', icon: Settings, color: 'var(--apple-gray-1)' },
  { id: 'templates', name: 'Templates', icon: Edit, color: 'var(--apple-pink)' },
  { id: 'readme', name: 'README', icon: Book, color: 'var(--apple-green)' },
  { id: 'server', name: 'Server', icon: Server, color: 'var(--apple-red)' },
];

export default function EmailTabs() {
  const [activeTab, setActiveTab] = useState('single');

  const renderTabContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'single': return <SingleEmailTab />;
        case 'bulk': return <BulkEmailTab />;
        case 'template': return <TemplateEmailTab />;
        case 'config': return <ConfigurationTab />;
        case 'templates': return <TemplatesTab />;
        case 'readme': return <ReadmeTab />;
        case 'server': return <ServerTab />;
        default: return <SingleEmailTab />;
      }
    })();

    return (
      <div className="apple-animate-in">
        {content}
      </div>
    );
  };

  return (
    <div>
      {/* Tab Navigation with Apple Design */}
      <div 
        className="border-b apple-vibrancy"
        style={{ 
          borderColor: 'var(--apple-separator)',
          background: 'rgba(248, 248, 248, 0.6)'
        }}
      >
        <nav className="flex px-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`apple-tab group flex items-center space-x-3 apple-transition ${
                  isActive ? 'active' : ''
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Icon with Apple-style design */}
                <div 
                  className={`w-8 h-8 rounded-xl flex items-center justify-center apple-transition ${
                    isActive 
                      ? 'apple-shadow-md scale-110' 
                      : 'group-hover:scale-105 opacity-70 group-hover:opacity-100'
                  }`}
                  style={{
                    background: isActive 
                      ? `linear-gradient(135deg, ${tab.color} 0%, ${tab.color}CC 100%)`
                      : 'var(--apple-quaternary-system-fill)',
                    boxShadow: isActive 
                      ? `0 4px 12px ${tab.color}40, 0 2px 6px ${tab.color}30`
                      : 'none'
                  }}
                >
                  <Icon className={`h-4 w-4 apple-transition ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`} />
                </div>

                {/* Tab Label */}
                <span className={`text-subheadline font-semibold tracking-wide apple-transition ${
                  isActive 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                }`}>
                  {tab.name}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full apple-transition"
                    style={{ 
                      background: `linear-gradient(90deg, ${tab.color} 0%, ${tab.color}CC 100%)`,
                      boxShadow: `0 2px 8px ${tab.color}40`
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content with Apple Animations */}
      <div className="relative overflow-hidden">
        <div className="p-12">
          {renderTabContent()}
        </div>
        
        {/* Subtle background pattern */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, var(--apple-blue) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, var(--apple-purple) 0%, transparent 50%)
            `
          }}
        />
      </div>
    </div>
  );
}