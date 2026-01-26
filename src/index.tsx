import React from 'react';
import { createRoot } from 'react-dom/client';
import { ParticleConnectkit } from './connectkit';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ParticleConnectkit>
      <App />
    </ParticleConnectkit>
  </React.StrictMode>
);