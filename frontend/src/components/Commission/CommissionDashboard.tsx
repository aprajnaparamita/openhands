import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { commissionApi } from '../../api/commissions';
import { userApi } from '../../api/users';
import { useAccount } from '@particle-network/connectkit';
import { Commission } from '../../types/commission';

const CommissionCard: React.FC<{ commission: Commission }> = ({ commission }) => (
  <Link
    to={`/commissions/${commission.id}`}
    className="block bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden mb-4"
  >
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
          ${commission.status === 'completed' ? 'bg-green-100 text-green-800' : 
            commission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            commission.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
            commission.status === 'accepted' ? 'bg-indigo-100 text-indigo-800' :
            'bg-yellow-100 text-yellow-800'}`}>
          {commission.status.replace('_', ' ')}
        </span>
        <span className="text-gray-500 text-sm">{new Date(commission.createdAt).toLocaleDateString()}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{commission.title}</h3>
      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{commission.description}</p>
      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <span className="font-bold text-gray-900">{commission.price} SOL</span>
        <span className="text-sm text-gray-500">
          {commission.providerId ? 'Provider Assigned' : 'Looking for Provider'}
        </span>
      </div>
    </div>
  </Link>
);

const Section: React.FC<{ title: string; commissions: Commission[]; emptyMessage: string }> = ({ title, commissions, emptyMessage }) => (
  <div className="mb-12">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">{title}</h2>
    {commissions.length === 0 ? (
      <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">{emptyMessage}</div>
    ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {commissions.map(comm => (
          <CommissionCard key={comm.id} commission={comm} />
        ))}
      </div>
    )}
  </div>
);

export const CommissionDashboard: React.FC = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!address) return;
      try {
        const [profile, comms] = await Promise.all([
          userApi.getProfile(address),
          commissionApi.getAll()
        ]);
        setRole(profile.role || 'requester');
        setCommissions(comms);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [address]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const requests = commissions.filter(c => c.status === 'pending');
  const active = commissions.filter(c => ['accepted', 'in_progress'].includes(c.status));
  const past = commissions.filter(c => ['delivered', 'completed', 'cancelled'].includes(c.status));

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Top Menu */}
      <div className="flex flex-wrap gap-4 mb-8 border-b pb-4">
        <button 
          onClick={() => navigate('/browse-artists')}
          className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Browse Artists
        </button>
        <button 
          onClick={() => navigate('/profile/edit')}
          className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Edit my Profile
        </button>
        <button 
          onClick={() => navigate('/account')}
          className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          My Account
        </button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {role === 'requester' && (
          <Link
            to="/commissions/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            + New Project
          </Link>
        )}
      </div>

      <Section 
        title="Commission Requests" 
        commissions={requests} 
        emptyMessage="No pending requests." 
      />

      <Section 
        title="Active Commissions" 
        commissions={active} 
        emptyMessage="No active commissions." 
      />

      <Section 
        title="Past Commissions" 
        commissions={past} 
        emptyMessage="No past commissions." 
      />
    </div>
  );
};
