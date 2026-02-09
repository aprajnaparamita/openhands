import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { ParticleConnectkit } from './connectkit';
import { BrowserRouter } from 'react-router-dom';
import PubNub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import App, { LoadingSpinner } from './App';
import './index.css';

const pubnub = new PubNub({
  publishKey: process.env.REACT_APP_PUBNUB_PUBLISH_KEY || 'demo',
  subscribeKey: process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY || 'demo',
  userId: 'user', // Will be updated later
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingSpinner />}>
      <PubNubProvider client={pubnub}>
        <BrowserRouter>
          <ParticleConnectkit>
            <App />
          </ParticleConnectkit>
        </BrowserRouter>
      </PubNubProvider>
    </Suspense>
  </React.StrictMode>
);