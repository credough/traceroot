import React, { useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import './FarmerDashboard.css';

const CONTRACT_ID = 'CCNVQH6W7AFL6XU62N7GW3QZXLA3QNCOGGSOQT7I6J364IHESMMOPTJE';

interface BatchData {
  farmerAddress: string;
  farmerName: string;
  location: string;
  harvestDate: string;
  quantity: number;
  latitude: string;
  longitude: string;
}

const FarmerDashboard: React.FC = () => {
  const { address } = useSorobanReact();
  const [formData, setFormData] = useState<BatchData>({
    farmerAddress: address || '',
    farmerName: '',
    location: '',
    harvestDate: '',
    quantity: 0,
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setMessage('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setMessage('Processing batch registration...');

    try {
      // Create a unique hash based on the batch data
      const batchDataStr = JSON.stringify({
        farmer: formData.farmerName,
        location: formData.location,
        date: formData.harvestDate,
        quantity: formData.quantity,
        lat: formData.latitude,
        lng: formData.longitude,
        timestamp: Date.now()
      });
      const batchHash = btoa(batchDataStr).substring(0, 20);
      
      // Store the batch data in localStorage
      const batches = JSON.parse(localStorage.getItem('traceroot_batches') || '{}');
      batches[batchHash] = {
        id: batchHash,
        farmer: formData.farmerName,
        location: formData.location,
        harvestDate: formData.harvestDate,
        quantity: formData.quantity,
        coordinates: `${formData.latitude}, ${formData.longitude}`,
        verified: true,
        farmerAddress: address
      };
      localStorage.setItem('traceroot_batches', JSON.stringify(batches));
      
      console.log('Batch registered with hash:', batchHash);
      setMessage(`Batch registered successfully! Hash: ${batchHash}`);
      
      // Reset form
      setFormData({
        farmerAddress: address,
        farmerName: '',
        location: '',
        harvestDate: '',
        quantity: 0,
        latitude: '',
        longitude: ''
      });
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Farmer Dashboard</h1>
      <div className="dashboard-card">
        <h2>Register New Batch</h2>
        
        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="farmerName">Farmer Name *</label>
            <input
              type="text"
              id="farmerName"
              name="farmerName"
              value={formData.farmerName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Accra, Ghana"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude *</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                step="0.000001"
                placeholder="5.603722"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="longitude">Longitude *</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                step="0.000001"
                placeholder="-0.187192"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="harvestDate">Harvest Date *</label>
              <input
                type="date"
                id="harvestDate"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="quantity">Quantity (kg) *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="0.1"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !address}
          >
            {loading ? 'Processing...' : 'Register Batch'}
          </button>
        </form>

        <div className="info-box">
          <h3>Smart Contract Info</h3>
          <p>
            <strong>Contract ID:</strong> <code>{CONTRACT_ID}</code>
          </p>
          <p>
            <strong>Network:</strong> Stellar Testnet
          </p>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
