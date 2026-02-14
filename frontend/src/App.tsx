// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthCheck } from './hooks/useAuthCheck';
import { useAccount } from '@particle-network/connectkit';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import { CommissionDashboard } from './components/Commission/CommissionDashboard';
import { CreateCommission } from './components/Commission/CreateCommission';
import { CommissionDetail } from './components/Commission/CommissionDetail';
import { ResetUser } from './components/ResetUser';
import { EditProfile } from './components/EditProfile';
import { ProfileView } from './components/ProfileView';
import { BrowseArtists } from './components/BrowseArtists';
import { BrowseProjects } from './components/BrowseProjects';
import { MyAccount } from './components/MyAccount';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import Header from './components/header';
import Footer from './components/Footer';
import OpenHands from './components/openhands';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

function App() {
  const { isConnected } = useAuthCheck();
  const { chain } = useAccount();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="flex-grow w-full pt-8 pb-16">
        <Routes>
          <Route
            path="/"
            element={
              isConnected && chain ? (
                <div className="max-w-2xl mx-auto mt-8">
                  <OpenHands />
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to OpenHands</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300">Connect your wallet to get started</p>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="/profile/setup"
            element={
              isConnected ? (
                <ProfileSetup />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile/edit"
            element={
              isConnected ? (
                <EditProfile />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile/:walletAddress"
            element={<ProfileView />}
          />
          <Route
            path="/browse-artists"
            element={
              isConnected ? (
                <BrowseArtists />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/browse-projects"
            element={
              isConnected ? (
                <BrowseProjects />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/account"
            element={
              isConnected ? (
                <MyAccount />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isConnected ? (
                <CommissionDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/commissions/create"
            element={
              isConnected ? (
                <CreateCommission />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/commissions/:id"
            element={
              isConnected ? (
                <CommissionDetail />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isConnected ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          {process.env.NODE_ENV === 'development' && (
            <Route path="/reset" element={<ResetUser />} />
          )}
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;