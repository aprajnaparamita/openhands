import React, { useEffect, useState } from 'react';
import { useAccount } from '@particle-network/connectkit';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/users';
import { commissionApi } from '../api/commissions';

interface ImageUploadProps {
  label: string;
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  multiple?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, multiple }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const { signature, timestamp, cloudName, apiKey } = await commissionApi.getUploadSignature();
      const urls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
          urls.push(data.secure_url);
        }
      }

      if (multiple) {
        const currentUrls = Array.isArray(value) ? value : [];
        onChange([...currentUrls, ...urls]);
      } else {
        onChange(urls[0]);
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter((_, idx) => idx !== indexToRemove));
    } else {
      onChange('');
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Preview */}
      <div className="flex flex-wrap gap-4 mb-2">
        {multiple && Array.isArray(value) ? (
          value.map((url, idx) => (
            <div key={idx} className="relative w-24 h-24">
              <img src={url} alt="Uploaded" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))
        ) : (
          value && typeof value === 'string' && (
            <div className="relative w-full h-48 md:w-64 md:h-64">
              <img src={value} alt="Uploaded" className="w-full h-full object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => removeImage(0)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
    </div>
  );
};

export const EditProfile: React.FC = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    role: '',
    profileImage: '',
    headerImage: '',
    portfolio: [] as string[],
  });

  useEffect(() => {
    if (!address) return;
    const fetchProfile = async () => {
      try {
        const profile = await userApi.getProfile(address);
        // Ensure we are accessing the data correctly
        const data = profile.data || profile; 
        
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          role: data.role || '',
          profileImage: data.profileImage || '',
          headerImage: data.headerImage || '',
          portfolio: data.portfolio || [],
        });
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setSaving(true);
    try {
      await userApi.updateProfile(address, formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <ImageUpload
          label="Profile Photo"
          value={formData.profileImage}
          onChange={(url) => setFormData({ ...formData, profileImage: url as string })}
        />

        <ImageUpload
          label="Header Image"
          value={formData.headerImage}
          onChange={(url) => setFormData({ ...formData, headerImage: url as string })}
        />

        {formData.role === 'artist' && (
          <ImageUpload
            label="Portfolio / Artwork"
            value={formData.portfolio}
            onChange={(urls) => setFormData({ ...formData, portfolio: urls as string[] })}
            multiple
          />
        )}

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mr-4 px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
