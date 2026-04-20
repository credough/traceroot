import React, { useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import './BuyerDashboard.css';

const BuyerDashboard: React.FC = () => {
  const { address } = useSorobanReact();
  const [batchHash, setBatchHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [batchDetails, setBatchDetails] = useState<any>(null);
  const [paymentHash, setPaymentHash] = useState('');
  const [message, setMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (!batchHash) {
      setMessage('Please enter a batch hash');
      return;
    }

    setLoading(true);
    setMessage('Verifying batch...');

    try {
      // Look up the batch from localStorage
      await new Promise(resolve => setTimeout(resolve, 1000));
      const batches = JSON.parse(localStorage.getItem('traceroot_batches') || '{}');
      const foundBatch = batches[batchHash];
      
      if (!foundBatch) {
        setMessage('Batch not found');
        setLoading(false);
        return;
      }
      
      setBatchDetails(foundBatch);
      setVerified(true);
      setMessage('Batch verified successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setMessage('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setMessage('Processing payment...');

    try {
      // Mock payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      const txHash = Math.random().toString(36).substring(2, 15);
      setPaymentHash(txHash);
      setMessage(`Payment successful! TX: ${txHash}`);
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Buyer Dashboard</h1>
      <div className="dashboard-card">
        <h2>Verify & Pay for Batch</h2>
        
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} className="form">
          <div className="form-group">
            <label htmlFor="batchHash">Batch Hash *</label>
            <input
              type="text"
              id="batchHash"
              value={batchHash}
              onChange={(e) => setBatchHash(e.target.value)}
              placeholder="Enter batch hash to verify"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !address}
          >
            {loading ? 'Verifying...' : 'Verify Batch'}
          </button>
        </form>

        {verified && batchDetails && (
          <div className="verification-details">
            <h3>Batch Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Farmer:</span>
                <span className="value">{batchDetails.farmer}</span>
              </div>
              <div className="detail-item">
                <span className="label">Location:</span>
                <span className="value">{batchDetails.location}</span>
              </div>
              <div className="detail-item">
                <span className="label">Quantity:</span>
                <span className="value">{batchDetails.quantity} kg</span>
              </div>
              <div className="detail-item">
                <span className="label">Harvest Date:</span>
                <span className="value">{batchDetails.harvestDate}</span>
              </div>
              <div className="detail-item">
                <span className="label">Coordinates:</span>
                <span className="value">{batchDetails.coordinates}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className="value status-verified">Verified</span>
              </div>
            </div>

            <form onSubmit={handlePayment} className="form payment-form">
              <h3>Link Payment</h3>
              <div className="form-group">
                <label htmlFor="amount">Payment Amount (XLM) *</label>
                <input
                  type="number"
                  id="amount"
                  placeholder="100"
                  step="0.01"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !address}
              >
                {loading ? 'Processing...' : 'Link Payment'}
              </button>
            </form>

            {paymentHash && (
              <div className="info-box">
                <h3>Payment Recorded</h3>
                <p>
                  Transaction hash: <code>{paymentHash}</code>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;