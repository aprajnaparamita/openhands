// src/hooks/useAuthCheck.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';

export function useAuthCheck() {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const apiEndpoint = process.env.REACT_APP_API_SERVER_URL as string;
  const apiPrefix = process.env.REACT_APP_API_PREFIX as string;

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isConnected || !address) return;

      try {
        const response = await fetch(`${apiEndpoint}${apiPrefix}/users/${address}`);
        if (response.status === 404) {
          // User doesn't exist, redirect to profile setup
          if (window.location.pathname !== '/profile/setup') {
            navigate('/profile/setup');
          }
        } else if (response.ok) {
          // User exists, redirect to dashboard if on landing page or setup page
          if (window.location.pathname === '/' || window.location.pathname === '/profile/setup') {
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
