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
import Header from './components/header';
import OpenHands from './components/openhands';
import styles from './App.module.css';

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
    <div className={styles.app}>
      <Header />
      <main className={styles['main-content']}>
        <Routes>
          <Route
            path="/"
            element={
              isConnected && chain ? (
                <OpenHands />
              ) : (
                <div>Connect your wallet to continue</div>
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
          {process.env.NODE_ENV === 'development' && (
            <Route path="/reset" element={<ResetUser />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;