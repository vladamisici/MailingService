'use client';

import { useState } from 'react';
import SingleEmailForm from './SingleEmailForm';
import BulkUpload from './BulkUpload';
import TemplateManager from './TemplateManager';
import Analytics from './Analytics';
import ApiKeys from './ApiKeys';

interface EmailTabsProps {
  activeTab: string;
}

export default function EmailTabs({ activeTab }: EmailTabsProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'single':
        return <SingleEmailForm />;
      case 'bulk':
        return <BulkUpload />;
      case 'templates':
        return <TemplateManager />;
      case 'analytics':
        return <Analytics />;
      case 'api':
        return <ApiKeys />;
      default:
        return <SingleEmailForm />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      {renderTabContent()}
    </div>
  );
}