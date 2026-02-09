import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';
import { commissionApi } from '../../api/commissions';
import { Commission, CommissionStatus } from '../../types/commission';
import { Chat } from '../Chat/Chat';
import { uploadToCloudinary } from '../../utils/upload';

export const CommissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const [commission, setCommission] = useState<Commission | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !address) return;

      try {
        // Fetch current user to get Mongo ID
        const userRes = await fetch(`${process.env.REACT_APP_API_SERVER_URL}${process.env.REACT_APP_API_PREFIX}/users/${address}`);
        const userData = await userRes.json();
        const user = userData.data;
        setCurrentUser(user);

        // Fetch commission
        const comm = await commissionApi.getById(id);
        setCommission(comm);

        // If user is involved and status allows, get chat token
        if (
          comm.status !== CommissionStatus.PENDING &&
          (comm.requesterId === user.id || comm.providerId === user.id)
        ) {
          const token = await commissionApi.getChatToken(id);
          setChatToken(token);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, address]);

  const handleAccept = async () => {
    if (!id) return;
    try {
      const updated = await commissionApi.accept(id);
      setCommission(updated);
      // Refresh to get chat token
      window.location.reload();
    } catch (error) {
      console.error('Failed to accept:', error);
    }
  };

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !deliveryFile) return;

    setIsSubmitting(true);
    try {
      const url = await uploadToCloudinary(deliveryFile);
      // Mock hash for now, in real app this would be IPFS hash or similar
      const hash = '0x' + Math.random().toString(16).substr(2, 40);
      
      const updated = await commissionApi.deliver(id, url, hash);
      setCommission(updated);
    } catch (error) {
      console.error('Failed to deliver:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      const updated = await commissionApi.complete(id);
      setCommission(updated);
    } catch (error) {
      console.error('Failed to complete:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!commission || !currentUser) return <div className="p-8 text-center">Project not found</div>;

  const isRequester = currentUser.id === commission.requesterId;
  const isProvider = currentUser.id === commission.providerId;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Details & Actions */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{commission.title}</h1>
            <span className={`px-4 py-1 rounded-full text-sm font-semibold capitalize
              ${commission.status === 'completed' ? 'bg-green-100 text-green-800' : 
                commission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'}`}>
              {commission.status.replace('_', ' ')}
            </span>
          </div>
          
          <p className="text-gray-600 mb-6 whitespace-pre-wrap">{commission.description}</p>
          
          <div className="flex gap-6 text-sm text-gray-500 border-t pt-4">
            <div>
              <span className="font-semibold block text-gray-700">Budget</span>
              {commission.price} SOL
            </div>
            <div>
              <span className="font-semibold block text-gray-700">Deadline</span>
              {new Date(commission.deadline).toLocaleDateString()}
            </div>
          </div>

          {commission.referenceImages && commission.referenceImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Reference Images</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {commission.referenceImages.map((img, idx) => (
                  <img key={idx} src={img} alt="Ref" className="h-24 w-24 object-cover rounded-lg border" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Zone */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4">Project Status & Actions</h3>
          
          {commission.status === CommissionStatus.PENDING && !isRequester && (
            <button
              onClick={handleAccept}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Accept Project
            </button>
          )}

          {commission.status === CommissionStatus.IN_PROGRESS && isProvider && (
            <form onSubmit={handleDeliver} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="delivery-upload"
                />
                <label htmlFor="delivery-upload" className="cursor-pointer text-blue-600 font-medium">
                  {deliveryFile ? deliveryFile.name : 'Upload Final Artwork'}
                </label>
              </div>
              <button
                type="submit"
                disabled={!deliveryFile || isSubmitting}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Delivering...' : 'Deliver Work'}
              </button>
            </form>
          )}

          {commission.status === CommissionStatus.DELIVERED && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Delivered Work</h4>
                {commission.finalArtwork?.url && (
                  <img src={commission.finalArtwork.url} alt="Final" className="max-w-full rounded-lg shadow-sm" />
                )}
              </div>
              {isRequester && (
                <button
                  onClick={handleComplete}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Approve & Release Payment
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat */}
      <div className="lg:col-span-1">
        {chatToken && commission.id ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">Project Chat</h3>
            </div>
            <div className="flex-1">
              <Chat channel={`commission.${commission.id}`} uuid={currentUser.id} token={chatToken} />
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-gray-500">
            Chat available after acceptance
          </div>
        )}
      </div>
    </div>
  );
};
