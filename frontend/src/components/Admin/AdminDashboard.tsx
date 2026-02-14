import React, { useEffect, useState } from 'react';
import { adminApi, AdminStats } from '../../api/admin';
import { useAccount } from '@particle-network/connectkit';
import { userApi } from '../../api/users';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'disputes'>('stats');
  const [users, setUsers] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!address) return;
      try {
        const profile = await userApi.getProfile(address);
        if (profile.role !== 'admin') {
          navigate('/dashboard');
          return;
        }
        setIsAdmin(true);
        loadStats();
      } catch (error) {
        console.error('Failed to check admin status', error);
        navigate('/dashboard');
      }
    };
    checkAdmin();
  }, [address, navigate]);

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDisputes();
      setDisputes(data);
    } catch (error) {
      console.error('Failed to load disputes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'stats') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'disputes') loadDisputes();
  }, [activeTab, isAdmin]);

  const handleBan = async (userId: string) => {
    try {
      await adminApi.banUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to ban user', error);
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await adminApi.unbanUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to unban user', error);
    }
  };

  const handleResolveDispute = async (commissionId: string, resolution: 'refund' | 'pay_provider') => {
    try {
      await adminApi.resolveDispute(commissionId, resolution);
      loadDisputes();
    } catch (error) {
      console.error('Failed to resolve dispute', error);
    }
  };

  if (!isAdmin) return null;
  if (loading && !stats && users.length === 0 && disputes.length === 0) {
    return <div className="p-8 text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-6 border-b">
        <button
          className={`px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Platform Stats
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'disputes' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          Disputes
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Users</h3>
            <p>Total Users: {stats.users.total}</p>
            <p>Artists: {stats.users.artists}</p>
            <p>Requesters: {stats.users.requesters}</p>
            <p>Banned: {stats.users.banned}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Commissions</h3>
            <p>Completed: {stats.commissions.completed}</p>
            <p>Disputed: {stats.commissions.disputed}</p>
            <p>Total Volume: {stats.commissions.totalVolume} SOL</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed'}</div>
                        <div className="text-sm text-gray-500">{user.walletAddress}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isBanned ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.isBanned ? (
                      <button onClick={() => handleUnban(user.id)} className="text-green-600 hover:text-green-900">Unban</button>
                    ) : (
                      <button onClick={() => handleBan(user.id)} className="text-red-600 hover:text-red-900">Ban</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <p className="text-gray-500">No active disputes.</p>
          ) : (
            disputes.map((dispute) => (
              <div key={dispute.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{dispute.title}</h3>
                    <p className="text-sm text-gray-500">ID: {dispute.id}</p>
                    <p className="mt-2">{dispute.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolveDispute(dispute.id, 'refund')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Refund Requester
                    </button>
                    <button
                      onClick={() => handleResolveDispute(dispute.id, 'pay_provider')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Pay Provider
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
