import { useAccount } from '@particle-network/connectkit';
import { isEVMChain } from '@particle-network/connectkit/chains';
import { Suspense } from 'react';
import demoImage from './assets/demo.gif';
import OpenHands from './components/openhands';
import Header from './components/header';
import styles from './App.module.css';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

function App() {
  const { isConnected, chain } = useAccount();
  
  // Add this debug log
  console.log('Connection state:', { isConnected, chain });
  
  // Debug EVM chain check
  if (isConnected && chain) {
    console.log('Chain info:', {
      chainId: chain.id,
      isEVM: isEVMChain(chain),
      chainName: chain.name
    });
  }

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles['main-content']}>
        <Suspense fallback={<LoadingSpinner />}>
          {isConnected && chain && isEVMChain(chain) ? (
            <OpenHands />
          ) : (
            <img 
              src={demoImage} 
              alt="demo" 
              style={{ 
                width: '100%', 
                height: 'auto',
                maxWidth: '800px',
                margin: '0 auto',
                display: 'block'
              }} 
            />
          )}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
