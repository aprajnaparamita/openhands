// src/pages/profile/setup.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from '@particle-network/connectkit';
import ProfileSetup from '../../components/ProfileSetup';

export default function ProfileSetupPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [isConnected, router]);

  const handleProfileComplete = () => {
    // Redirect to dashboard or home after profile setup
    router.push('/dashboard');
  };

  if (isLoading || !isConnected) {
    return <div>Loading...</div>;
  }

  return <ProfileSetup onComplete={handleProfileComplete} />;
}
