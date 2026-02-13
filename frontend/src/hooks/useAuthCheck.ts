// src/hooks/useAuthCheck.ts
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';
import { api } from '../api/client';

export function useAuthCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, address } = useAccount();

  useEffect(() => {
    const checkUserProfile = async () => {
      // Avoid redirect loops by checking current path
      const currentPath = location.pathname;
      const isPublicPath = ['/', '/reset'].includes(currentPath);
      const isProfileSetup = currentPath === '/profile/setup';
      
      try {
        // Step 1: Check existing session via Cookie
        console.log('[useAuthCheck] Checking existing session...');
        let userData;
        try {
          const meResponse = await api.get('/auth/me');
          userData = meResponse.data.data;
          console.log('[useAuthCheck] Session valid:', userData);
        } catch (error) {
          console.log('[useAuthCheck] No valid session found.');
        }

        // Step 2: If no session but wallet connected, try to login
        if (!userData && isConnected && address) {
          console.log(`[useAuthCheck] Logging in with wallet ${address}...`);
          try {
            const loginResponse = await api.post('/auth/wallet', { walletAddress: address });
            userData = loginResponse.data.data;
            console.log('[useAuthCheck] Login successful:', userData);
          } catch (error) {
            console.error('[useAuthCheck] Login failed:', error);
            return; // Stop if login fails
          }
        }

        if (!userData) {
          // No session and no wallet connected.
          // If on a protected route, redirect to home.
          // For now, only /profile/* and /dashboard are protected?
          if (!isPublicPath) {
             // navigate('/'); // Optional: Redirect to home if not auth
          }
          return;
        }

        // Step 3: Check Role and Redirect
        const hasRole = !!userData?.role;
        console.log(`[useAuthCheck] Has role? ${hasRole}`);

        if (!hasRole) {
          // User needs to set up profile
          if (!isProfileSetup && currentPath !== '/reset') {
            console.log('[useAuthCheck] Profile incomplete. Redirecting to /profile/setup');
            navigate('/profile/setup');
          }
        } else {
          // User has profile
          if (isProfileSetup || currentPath === '/') {
            console.log('[useAuthCheck] Profile complete. Redirecting to /dashboard');
            navigate('/dashboard');
          }
        }

      } catch (error) {
        console.error('[useAuthCheck] Error checking user profile:', error);
      }
    };

    checkUserProfile();
  }, [isConnected, address, navigate, location.pathname]);

  return { isConnected, address };
}
