// src/components/ProfileSetup.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';

export default function ProfileSetup() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [role, setRole] = useState<'artist' | 'requester' | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiEndpoint = process.env.REACT_APP_API_SERVER_URL as string;
  const apiPrefix = process.env.REACT_APP_API_PREFIX as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !address) {
      console.error('Missing required fields:', { role, address });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Sending profile data:', { role, name, bio, address });
      console.log('PUTing to', apiEndpoint+apiPrefix+`/users/${address}`);
      console.log('apiEndpoint', apiEndpoint);
      console.log('apiPrefix', apiPrefix);
      const response = await fetch(apiEndpoint+apiPrefix+`/users/${address}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          role, 
          name: name.trim(), 
          bio: bio.trim(),
          walletAddress: address 
        }),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Server responded with error:', {
          status: response.status,
          statusText: response.statusText,
          responseData
        });
        throw new Error(responseData.message || 'Failed to save profile');
      }

      console.log('Profile saved successfully:', responseData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // You might want to show this error to the user
      alert(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
