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
    return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading admin dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'stats' 
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          Platform Stats
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'users' 
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'disputes' 
              ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('disputes')}
        >
          Disputes
        </button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Users</h3>
            <dl className="space-y-2 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <dt>Total Users:</dt>
                <dd className="font-medium">{stats.users.total}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Artists:</dt>
                <dd className="font-medium">{stats.users.artists}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Requesters:</dt>
                <dd className="font-medium">{stats.users.requesters}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Banned:</dt>
                <dd className="font-medium">{stats.users.banned}</dd>
              </div>
            </dl>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Commissions</h3>
            <dl className="space-y-2 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <dt>Completed:</dt>
                <dd className="font-medium">{stats.commissions.completed}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Disputed:</dt>
                <dd className="font-medium">{stats.commissions.disputed}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Total Volume:</dt>
                <dd className="font-medium">{stats.commissions.totalVolume} SOL</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Unnamed'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.walletAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBanned ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.isBanned ? (
                        <button onClick={() => handleUnban(user.id)} className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">Unban</button>
                      ) : (
                        <button onClick={() => handleBan(user.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Ban</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No active disputes.</p>
          ) : (
            disputes.map((dispute) => (
              <div key={dispute.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{dispute.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {dispute.id}</p>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{dispute.description}</p>
                  </div>
                  <div className="flex space-x-2 shrink-0">
                    <button
                      onClick={() => handleResolveDispute(dispute.id, 'refund')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Refund Requester
                    </button>
                    <button
                      onClick={() => handleResolveDispute(dispute.id, 'pay_provider')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium"
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
