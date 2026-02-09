// src/hooks/useAuthCheck.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';

export function useAuthCheck() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const apiEndpoint = process.env.API_SERVER_URL as string;

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isConnected || !address) return;

      try {
        const response = await fetch(apiEndpoint+`/api/v1/users/${address}`);
        if (response.status === 404) {
          // User doesn't exist, redirect to profile setup
          navigate('/profile/setup');
        } else if (response.ok) {
          // User exists, redirect to profile page if on landing page
          if (window.location.pathname === '/') {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      }
    };

    checkUserProfile();
  }, [isConnected, address, navigate]);

  return { isConnected, address };
}
