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
      if (!isConnected || !address) {
        console.log('[useAuthCheck] Not connected or no address. Skipping check.');
        return;
      }

      const url = `${apiEndpoint}${apiPrefix}/users/${address}`;
      console.log(`[useAuthCheck] Checking profile for ${address} at ${url}`);

      try {
        const response = await fetch(url);
        console.log(`[useAuthCheck] Response status: ${response.status}`);
        
        // Handle 404 (User Not Found)
        if (response.status === 404) {
          console.log('[useAuthCheck] User not found (404). Checking if redirect needed...');
          // If we are NOT on setup/reset, go to setup
          if (window.location.pathname !== '/profile/setup' && window.location.pathname !== '/reset') {
            console.log('[useAuthCheck] Redirecting to /profile/setup');
            navigate('/profile/setup');
          }
          return;
        }

        // Handle Success
        if (response.ok) {
          const userData = await response.json();
          console.log('[useAuthCheck] User data received:', userData);
          const hasRole = !!userData.data?.role;
          console.log(`[useAuthCheck] Has role? ${hasRole}`);
          
          // Case 1: Incomplete Profile (No Role)
          if (!hasRole) {
            console.log('[useAuthCheck] Profile incomplete. Redirecting to setup if needed.');
            // Redirect to setup if not already there
            if (window.location.pathname !== '/profile/setup' && window.location.pathname !== '/reset') {
              navigate('/profile/setup');
            }
          } 
          // Case 2: Complete Profile (Has Role)
          else {
            console.log('[useAuthCheck] Profile complete.');
            // Redirect to dashboard if currently on landing or setup
            if (window.location.pathname === '/' || window.location.pathname === '/profile/setup') {
              console.log('[useAuthCheck] Redirecting to /dashboard');
              navigate('/dashboard');
            }
          }
        } else {
          console.warn(`[useAuthCheck] Unexpected status: ${response.status}`);
        }
      } catch (error) {
        console.error('[useAuthCheck] Error checking user profile:', error);
        // Do NOT redirect on network error to avoid loops
      }
    };

    checkUserProfile();
  }, [isConnected, address, navigate]);

  return { isConnected, address };
}
