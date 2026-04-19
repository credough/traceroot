import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import './BatchLookup.css';

interface BatchData {
  id: string;
  farmer: string;
  location: string;
  harvestDate: string;
  quantity: number;
  coordinates: string;
  verified: boolean;
}

const BatchLookup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [batchHash, setBatchHash] = useState(searchParams.get('batch') || '');
  const [loading, setLoading] = useState(false);
  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const hashFromUrl = searchParams.get('batch');
    if (hashFromUrl) {
      setBatchHash(hashFromUrl);
      handleLookup(hashFromUrl);
    }
  }, [searchParams]);

  const handleLookup = async (hash?: string) => {
    const searchHash = hash || batchHash;
    if (!searchHash) {
      setMessage('Please enter a batch hash');
      return;
    }

    setLoading(true);
    setMessage('Looking up batch...');

    try {
      // Look up the batch from localStorage
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const batches = JSON.parse(localStorage.getItem('traceroot_batches') || '{}');
      const foundBatch = batches[searchHash];
      
      if (!foundBatch) {
        setBatchData(null);
        setQrCode('');
        setMessage('❌ Batch not found');
        setLoading(false);
        return;
      }

      setBatchData(foundBatch);
      setMessage('✅ Batch found!');

      // Generate QR code
      const qrUrl = await QRCode.toDataURL(
        `${window.location.origin}/?batch=${searchHash}`
      );
      setQrCode(qrUrl);
    } catch (error) {
      console.error('Lookup error:', error);
      setBatchData(null);
      setQrCode('');
      setMessage('❌ Batch lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup();
  };

  return (
    <div className="batch-lookup">
      <h1>Batch Lookup</h1>
      
      <div className="lookup-card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="batchHash">Batch Hash *</label>
            <input
              type="text"
              id="batchHash"
              value={batchHash}
              onChange={(e) => setBatchHash(e.target.value)}
              placeholder="Enter batch hash"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      {batchData && (
        <div className="results">
          <div className="provenance-card">
            <h2>Batch Provenance Record</h2>
            
            <div className="provenance-grid">
              <div className="provenance-item">
                <span className="label">Batch ID:</span>
                <span className="value">{batchData.id}</span>
              </div>
              <div className="provenance-item">
                <span className="label">Farmer:</span>
                <span className="value">{batchData.farmer}</span>
              </div>
              <div className="provenance-item">
                <span className="label">Location:</span>
                <span className="value">{batchData.location}</span>
              </div>
              <div className="provenance-item">
                <span className="label">Harvest Date:</span>
                <span className="value">{batchData.harvestDate}</span>
              </div>
              <div className="provenance-item">
                <span className="label">Quantity:</span>
                <span className="value">{batchData.quantity} kg</span>
              </div>
              <div className="provenance-item">
                <span className="label">Coordinates:</span>
                <span className="value">{batchData.coordinates}</span>
              </div>
              <div className="provenance-item">
                <span className="label">Verification Status:</span>
                <span className={`value ${batchData.verified ? 'verified' : 'unverified'}`}>
                  {batchData.verified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
            </div>

            {qrCode && (
              <div className="qr-section">
                <h3>Share This Batch</h3>
                <img src={qrCode} alt="Batch QR Code" className="qr-code" />
                <p className="qr-help">Scan this QR code to view this batch record</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchLookup;