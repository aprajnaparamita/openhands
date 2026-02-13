import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from '@particle-network/connectkit';
import { commissionApi } from '../../api/commissions';
import { Commission, CommissionStatus } from '../../types/commission';
import { Chat } from '../Chat/Chat';
import { uploadToCloudinary } from '../../utils/upload';
import { useEscrow } from '../../hooks/useEscrow';

export const CommissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();
  const [commission, setCommission] = useState<Commission | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requester, setRequester] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  const { initializeEscrow, acceptProject, releasePayment, submitReview, deliverProject, loading: escrowLoading } = useEscrow();

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
        
        // Fetch requester details if needed
        if (comm.requesterId) {
            const reqRes = await fetch(`${process.env.REACT_APP_API_SERVER_URL}${process.env.REACT_APP_API_PREFIX}/users/${comm.requesterId}`);
            const reqData = await reqRes.json();
            setRequester(reqData.data);
        }

        // Fetch provider details if needed
        if (comm.providerId) {
            const provRes = await fetch(`${process.env.REACT_APP_API_SERVER_URL}${process.env.REACT_APP_API_PREFIX}/users/${comm.providerId}`);
            const provData = await provRes.json();
            setProvider(provData.data);
        }

        // If user is involved and status allows, get chat token
        if (
          comm.status !== CommissionStatus.CREATED &&
          comm.status !== CommissionStatus.FUNDED &&
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

  const handleFund = async () => {
    if (!id || !commission) return;
    try {
      const tx = await initializeEscrow(commission.price, id);
      if (tx) {
        const updated = await commissionApi.fund(id, tx);
        setCommission(updated);
      }
    } catch (error) {
      console.error('Failed to fund:', error);
      alert('Failed to fund project: ' + (error as Error).message);
    }
  };

  const handleAccept = async () => {
    if (!id || !requester) return;
    try {
      // Use requester wallet address to find the escrow PDA
      const tx = await acceptProject(requester.walletAddress);
      if (tx) {
        const updated = await commissionApi.accept(id, tx);
        setCommission(updated);
        // Refresh to get chat token
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to accept:', error);
      alert('Failed to accept project. ' + (error as Error).message);
    }
  };

  const handleReviewSubmit = async () => {
    if (!id || !provider) return;
    try {
      const tx = await submitReview(reviewScore, reviewText, provider.walletAddress);
      if (tx) {
        const updated = await commissionApi.review(id, reviewScore, reviewText, tx);
        setCommission(updated);
      }
    } catch (error) {
      console.error('Failed to review:', error);
      alert('Failed to submit review: ' + (error as Error).message);
    }
  };

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !deliveryFile || !requester) return;

    setIsSubmitting(true);
    try {
      const url = await uploadToCloudinary(deliveryFile);
      // Mock hash for now, in real app this would be IPFS hash or similar
      const hash = '0x' + Math.random().toString(16).substr(2, 40);
      
      const tx = await deliverProject(requester.walletAddress);
      
      if (tx) {
        const updated = await commissionApi.deliver(id, url, hash, tx);
        setCommission(updated);
      }
    } catch (error) {
      console.error('Failed to deliver:', error);
      alert('Failed to deliver project: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      // Release payment from escrow
      const tx = await releasePayment();
      
      if (tx) {
        const updated = await commissionApi.complete(id, tx);
        setCommission(updated);
      }
    } catch (error) {
      console.error('Failed to complete:', error);
      alert('Failed to release payment: ' + (error as Error).message);
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
          
          {commission.status === CommissionStatus.CREATED && isRequester && (
            <button
              onClick={handleFund}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Fund Project (Escrow)
            </button>
          )}

          {commission.status === CommissionStatus.FUNDED && !isRequester && (
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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                    <select 
                      value={reviewScore} 
                      onChange={(e) => setReviewScore(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Review</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleReviewSubmit}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          )}

          {commission.status === CommissionStatus.REVIEWED && isRequester && (
             <button
                onClick={handleComplete}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Release Payment & Complete
             </button>
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
