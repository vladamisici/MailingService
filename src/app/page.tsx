'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import ApiDocs from '@/components/ApiDocs';
import Monitoring from '@/components/Monitoring';
import Analytics from '@/components/Analytics';
import TemplateManager from '@/components/TemplateManager';
import Settings from '@/components/Settings';

const pages = [
  { id: 'dashboard', name: 'Dashboard', component: Dashboard },
  { id: 'api-docs', name: 'API Docs', component: ApiDocs },
  { id: 'templates', name: 'Templates', component: TemplateManager },
  { id: 'analytics', name: 'Analytics', component: Analytics },
  { id: 'monitoring', name: 'Monitoring', component: Monitoring },
  { id: 'settings', name: 'Settings', component: Settings },
];

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    const page = pages.find(p => p.id === activePage);
    if (!page) return <Dashboard />;
    
    const Component = page.component;
    return <Component />;
  };

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(135deg, 
        rgb(var(--background)) 0%, 
        rgb(var(--apple-gray-6)) 50%, 
        rgb(var(--background)) 100%)`
    }}>
      <Navigation activePage={activePage} setActivePage={setActivePage} />
      
      <main className="transition-all duration-300 ease-out animate-apple-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}