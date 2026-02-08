import React from 'react';
import { createRoot } from 'react-dom/client';
import { ParticleConnectkit } from './connectkit';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ParticleConnectkit>
        <App />
      </ParticleConnectkit>
    </BrowserRouter>
  </React.StrictMode>
);