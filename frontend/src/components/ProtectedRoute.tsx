// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isConnected, address } = useAccount();
  const location = useLocation();

  if (!isConnected) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they log in, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
