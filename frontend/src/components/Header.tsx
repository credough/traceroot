import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSorobanReact } from '@soroban-react/core';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { address, connect } = useSorobanReact();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnect = async () => {
    if (address) {
      console.log('Wallet already connected');
      return;
    }

    setIsConnecting(true);
    try {
      await connect();
      console.log('Wallet connected successfully');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure Freighter is installed and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          TraceRoot
        </Link>
        <nav className="nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Lookup
          </Link>
          <Link
            to="/farmer"
            className={`nav-link ${location.pathname === '/farmer' ? 'active' : ''}`}
          >
            Farmer
          </Link>
          <Link
            to="/buyer"
            className={`nav-link ${location.pathname === '/buyer' ? 'active' : ''}`}
          >
            Buyer
          </Link>
          <Link
            to="/qr-scanner"
            className={`nav-link ${location.pathname === '/qr-scanner' ? 'active' : ''}`}
          >
            QR Scanner
          </Link>
        </nav>
        <button
          className="wallet-button"
          onClick={handleWalletConnect}
          disabled={isConnecting}
        >
          {isConnecting
            ? 'Connecting...'
            : address
            ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
            : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};

export default Header;
