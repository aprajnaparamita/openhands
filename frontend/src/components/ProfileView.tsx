import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../api/users';
import { useAccount } from '@particle-network/connectkit';

interface SocialLinks {
  website?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
}

interface UserProfile {
  walletAddress: string;
  name?: string;
  bio?: string;
  role?: string;
  profileImage?: string;
  headerImage?: string;
  portfolio?: string[];
  skills?: string[];
  socialLinks?: SocialLinks;
  workDescription?: string;
  isAvailable?: boolean;
  cachedAverageRating?: number;
  cachedTotalRatings?: number;
  cachedCompletionRate?: number;
}

export const ProfileView: React.FC = () => {
  const { walletAddress } = useParams<{ walletAddress: string }>();
  const { address: currentAddress } = useAccount();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwner = currentAddress && walletAddress && currentAddress.toLowerCase() === walletAddress.toLowerCase();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!walletAddress) return;
      try {
        const data = await userApi.getProfile(walletAddress);
        setProfile(data.data || data);
      } catch (err) {
        console.error('Failed to load profile', err);
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [walletAddress]);

  if (loading) return <div className="p-8 text-center text-gray-900 dark:text-white">Loading profile...</div>;
  if (error || !profile) return <div className="p-8 text-center text-red-500">{error || 'User not found'}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-dark-bg min-h-screen pb-12 transition-colors duration-200">
      {/* Header Image */}
      <div className="relative h-64 bg-gray-200 dark:bg-gray-800">
        {profile.headerImage ? (
          <img 
            src={profile.headerImage} 
            alt="Header" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
        )}
        
        {/* Profile Image */}
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-bg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-lg">
            {profile.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt={profile.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-4xl font-bold">
                {profile.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>

        {/* Edit Button (if owner) */}
        {isOwner && (
          <Link 
            to="/profile/edit" 
            className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-colors"
          >
            Edit Profile
          </Link>
        )}
      </div>

      <div className="mt-20 px-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium mt-1 capitalize flex items-center gap-2">
              {profile.role}
              {profile.isAvailable && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  Available for work
                </span>
              )}
            </p>
          </div>
          
          {/* Social Links */}
          <div className="flex gap-4">
            {profile.socialLinks?.website && (
              <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Website">
                Website
              </a>
            )}
            {profile.socialLinks?.twitter && (
              <a href={`https://twitter.com/${profile.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Twitter">
                Twitter
              </a>
            )}
            {profile.socialLinks?.github && (
              <a href={`https://github.com/${profile.socialLinks.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="GitHub">
                GitHub
              </a>
            )}
            {profile.socialLinks?.instagram && (
              <a href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors" aria-label="Instagram">
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Bio */}
            <section aria-labelledby="bio-heading">
              <h2 id="bio-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</p>
            </section>

            {/* Work Description */}
            {profile.workDescription && (
              <section aria-labelledby="work-heading">
                <h2 id="work-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Work & Terms</h2>
                <div className="bg-gray-50 dark:bg-dark-surface p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.workDescription}</p>
                </div>
              </section>
            )}

            {/* Portfolio */}
            {profile.portfolio && profile.portfolio.length > 0 && (
              <section aria-labelledby="portfolio-heading">
                <h2 id="portfolio-heading" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolio.map((img, idx) => (
                    <div key={idx} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img src={img} alt={`Portfolio item ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <section aria-labelledby="skills-heading">
                <h2 id="skills-heading" className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Stats */}
            <section aria-labelledby="stats-heading" className="bg-white dark:bg-dark-surface p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
               <h3 id="stats-heading" className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Stats</h3>
               <div className="space-y-3">
                 <div className="flex justify-between">
                   <span className="text-gray-600 dark:text-gray-300">Projects</span>
                   <span className="font-semibold text-gray-900 dark:text-white">{profile.cachedTotalRatings || 0}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600 dark:text-gray-300">Rating</span>
                   <span className="font-semibold text-gray-900 dark:text-white">{profile.cachedAverageRating?.toFixed(1) || '-'}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600 dark:text-gray-300">Completion Rate</span>
                   <span className="font-semibold text-gray-900 dark:text-white">
                     {profile.cachedCompletionRate !== undefined 
                       ? `${(profile.cachedCompletionRate * 100).toFixed(0)}%` 
                       : '100%'}
                   </span>
                 </div>
               </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
