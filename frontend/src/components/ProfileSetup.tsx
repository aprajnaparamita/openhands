// src/components/ProfileSetup.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';

export default function ProfileSetup() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [role, setRole] = useState<'artist' | 'requester' | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const apiEndpoint = process.env.REACT_APP_API_SERVER_URL as string;
  const apiPrefix = process.env.REACT_APP_API_PREFIX as string;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!address) return;

      try {
        const response = await fetch(`${apiEndpoint}${apiPrefix}/users/${address}`);
        if (response.ok) {
          const userData = await response.json();
          if (userData.data) {
            setRole(userData.data.role || null);
            setName(userData.data.name || '');
            setBio(userData.data.bio || '');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [address, apiEndpoint, apiPrefix]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !address) {
      console.error('Missing required fields:', { role, address });
      return;
    }

    setIsSubmitting(true);
    const url = `${apiEndpoint}${apiPrefix}/users/${address}`;
    console.log(`[ProfileSetup] Starting profile update...`);
    console.log(`[ProfileSetup] PUT URL: ${url}`);
    console.log(`[ProfileSetup] Payload:`, { role, name, bio, address });

    try {
      // Use axios or standard fetch but we must handle credentials if we rely on cookies
      // The current fetch implementation does not include credentials
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // IMPORTANT: This allows the backend to set the HttpOnly cookie
        credentials: 'include',
        body: JSON.stringify({ 
          role, 
          name: name.trim(), 
          bio: bio.trim(),
          walletAddress: address 
        }),
      });

      console.log(`[ProfileSetup] Response Status: ${response.status} ${response.statusText}`);
      const responseData = await response.json().catch(() => ({}));
      console.log(`[ProfileSetup] Response Data:`, responseData);
      
      if (!response.ok) {
        console.error(`[ProfileSetup] Request failed with status ${response.status}`);
        throw new Error(responseData.message || 'Failed to save profile');
      }

      console.log('[ProfileSetup] Profile saved successfully. Initiating navigation to /dashboard...');
      
      // Force a short delay or state update before navigation to ensure cookie is set
      // and useAuthCheck has time to re-run if needed
      setTimeout(() => {
        console.log('[ProfileSetup] Navigating now.');
        navigate('/dashboard');
      }, 500);
      
    } catch (error) {
      console.error('[ProfileSetup] Error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            I am a...
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="artist"
                name="role"
                type="radio"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                checked={role === 'artist'}
                onChange={() => setRole('artist')}
              />
              <label htmlFor="artist" className="ml-2 block text-sm text-gray-700">
                Artist (I want to create art for patrons)
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="requester"
                name="role"
                type="radio"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                checked={role === 'requester'}
                onChange={() => setRole('requester')}
              />
              <label htmlFor="requester" className="ml-2 block text-sm text-gray-700">
                Patron (I want to request art from artists)
              </label>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={!role || isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
