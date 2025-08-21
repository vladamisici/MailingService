'use client';

import { useRouter } from 'next/navigation';
import SetupWizard from '@/components/SetupWizard';

export default function SetupPage() {
  const router = useRouter();

  const handleSetupComplete = () => {
    // Save setup completion status
    localStorage.setItem('setupComplete', 'true');
    // Redirect to main page
    router.push('/');
  };

  return <SetupWizard onComplete={handleSetupComplete} />;
}