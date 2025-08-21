'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import EmailTabs from '@/components/EmailTabs';
import DatabaseManager from '@/components/DatabaseManager';
import SetupWizard from '@/components/SetupWizard';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('single');

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const res = await fetch('/api/setup');
      const data = await res.json();
      setNeedsSetup(data.needsSetup);
      
      // Check if user has already completed setup or is returning user
      const hasCompletedSetup = localStorage.getItem('setup_completed') === 'true';
      const isReturningUser = localStorage.getItem('returning_user') === 'true';
      
      setShowLanding(!hasCompletedSetup && !isReturningUser);
    } catch (error) {
      console.error('Failed to check setup status:', error);
      setNeedsSetup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    localStorage.setItem('setup_completed', 'true');
    setNeedsSetup(false);
    setShowLanding(false);
    window.location.reload(); // Reload to apply new configuration
  };

  const handleStartApp = () => {
    localStorage.setItem('returning_user', 'true');
    setShowLanding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for new users
  if (showLanding) {
    return (
      <div>
        <LandingPage />
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleStartApp}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // Show setup wizard if needed
  if (needsSetup) {
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  // Show main application
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'database' ? (
          <DatabaseManager />
        ) : (
          <EmailTabs activeTab={activeTab} />
        )}
      </main>

      {/* Public API Notice */}
      {process.env.NEXT_PUBLIC_ALLOW_PUBLIC_ACCESS === 'true' && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-sm shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Public API Enabled
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your API is accessible without authentication. Use with caution.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}