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
        
        // Handle 404 (User Not Found)
        if (response.status === 404) {
          // If we are NOT on setup/reset, go to setup
          if (window.location.pathname !== '/profile/setup' && window.location.pathname !== '/reset') {
            navigate('/profile/setup');
          }
          return;
        }

        // Handle Success
        if (response.ok) {
          const userData = await response.json();
          const hasRole = !!userData.data?.role;
          
          // Case 1: Incomplete Profile (No Role)
          if (!hasRole) {
            // Redirect to setup if not already there
            if (window.location.pathname !== '/profile/setup' && window.location.pathname !== '/reset') {
              navigate('/profile/setup');
            }
          } 
          // Case 2: Complete Profile (Has Role)
          else {
            // Redirect to dashboard if currently on landing or setup
            if (window.location.pathname === '/' || window.location.pathname === '/profile/setup') {
              navigate('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        // Do NOT redirect on network error to avoid loops
      }
    };

    checkUserProfile();
  }, [isConnected, address, navigate]);

  return { isConnected, address };
}
