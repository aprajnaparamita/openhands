import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../api/users';

interface Artist {
  walletAddress: string;
  name: string;
  bio: string;
  profileImage?: string;
  skills?: string[];
  portfolio?: string[];
  cachedAverageRating?: number;
  cachedTotalRatings?: number;
}

export const BrowseArtists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await userApi.getArtists();
        // data could be { data: [...] } or [...] depending on API response structure
        // Controller returns { data: [...], message: ... }
        // API client returns response.data.data
        // So data should be the array
        setArtists(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch artists', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading artists...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Browse Artists</h1>
      
      {artists.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <p className="text-xl">No artists found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <Link 
              key={artist.walletAddress} 
              to={`/profile/${artist.walletAddress}`}
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    {artist.profileImage ? (
                      <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold text-xl">
                        {artist.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{artist.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-mono">{artist.walletAddress}</p>
                    {artist.cachedAverageRating !== undefined && (
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-400 mr-1" aria-hidden="true">★</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {artist.cachedAverageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          ({artist.cachedTotalRatings || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 h-15">
                  {artist.bio || 'No bio provided.'}
                </p>

                {artist.skills && artist.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artist.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                    {artist.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 text-xs rounded-full">
                        +{artist.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                {artist.portfolio && artist.portfolio.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {artist.portfolio.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 h-20">
                         <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
