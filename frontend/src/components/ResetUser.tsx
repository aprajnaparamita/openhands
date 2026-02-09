import { useEffect, useState } from 'react';
import { useAccount } from '@particle-network/connectkit';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/users';

export const ResetUser = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const reset = async () => {
      if (!address) {
        setStatus('No wallet connected. Please connect wallet first.');
        return;
      }

      try {
        setStatus('Resetting profile...');
        await userApi.resetProfile(address);
        setStatus('Profile reset! Redirecting...');
        setTimeout(() => {
          window.location.href = '/profile/setup';
        }, 1000);
      } catch (err: any) {
        // If 404, it means user already doesn't exist, which is fine
        if (err.response?.status === 404) {
          setStatus('User not found (already reset). Redirecting...');
          setTimeout(() => {
            window.location.href = '/profile/setup';
          }, 1000);
          return;
        }
        console.error(err);
        setStatus(`Error: ${err.response?.data?.message || err.message}`);
      }
    };

    reset();
  }, [address, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md">
        <h1 className="text-xl font-bold mb-4">Reset User</h1>
        <p>{status}</p>
        {!address && (
            <p className="text-sm text-gray-500 mt-2">Connect your wallet to reset the associated profile.</p>
        )}
      </div>
    </div>
  );
};
