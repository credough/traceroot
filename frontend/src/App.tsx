import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SorobanReactProvider } from '@soroban-react/core';
import { freighter } from '@soroban-react/freighter';
import Header from './components/Header';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import BatchLookup from './pages/BatchLookup';
import QRScanner from './pages/QRScanner';
import './App.css';

const appName = 'TraceRoot';

const chains = [
  {
    id: 'testnet',
    name: 'Stellar Testnet',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org'
  }
];

function App() {
  const connectors = [
    {
      groupName: 'Wallets',
      connectors: [freighter({ appName: 'TraceRoot', chains })]
    }
  ];

  return (
    <SorobanReactProvider
      chains={chains}
      appName={appName}
      connectors={connectors}
    >
      <Router>
        <div className="app">
          <Header />
          <div className="container">
            <Routes>
              <Route path="/" element={<BatchLookup />} />
              <Route path="/farmer" element={<FarmerDashboard />} />
              <Route path="/buyer" element={<BuyerDashboard />} />
              <Route path="/qr-scanner" element={<QRScanner />} />
            </Routes>
          </div>
        </div>
      </Router>
    </SorobanReactProvider>
  );
}

export default App;