// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthCheck } from './hooks/useAuthCheck';
import { useAccount } from '@particle-network/connectkit';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import Header from './components/header';
import OpenHands from './components/openhands';
import styles from './App.module.css';

function LoadingSpinner() {
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
                <Dashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;