// src/hooks/useAuthCheck.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';

export function useAuthCheck() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isConnected || !address) return;

      try {
        const response = await fetch(`/api/v1/users/${address}`);
        if (response.status === 404) {
          // User doesn't exist, redirect to profile setup
          navigate('/profile/setup');
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      }
    };

    checkUserProfile();
  }, [isConnected, address, navigate]);

  return { isConnected, address };
}
