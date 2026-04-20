import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import './QRScanner.css';

const QRScannerPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoRef.current) return;

    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        console.log('QR Code detected:', result.data);
        setMessage(`QR Code detected! Redirecting...`);
        // Redirect to batch lookup with the scanned hash
        setTimeout(() => {
          navigate(`/?batch=${encodeURIComponent(result.data)}`);
        }, 1000);
      },
      {
        onDecodeError: (error) => {
          console.log('Decode error:', error);
        },
        preferredCamera: 'environment',
        highlightCodeOutline: true,
        highlightScanRegion: true,
        maxScansPerSecond: 5
      }
    );

    setScanner(qrScanner);

    return () => {
      if (qrScanner) {
        qrScanner.destroy();
      }
    };
  }, [navigate]);

  const startScanning = async () => {
    if (scanner) {
      try {
        await scanner.start();
        setIsScanning(true);
        setMessage('📷 Camera started. Point at a QR code.');
      } catch (error) {
        console.error('Failed to start scanner:', error);
        setMessage('Failed to access camera. Please check permissions.');
      }
    }
  };

  const stopScanning = async () => {
    if (scanner) {
      await scanner.stop();
      setIsScanning(false);
      setMessage('⏸️ Scanner stopped');
    }
  };

  return (
    <div className="qr-scanner-page">
      <h1>QR Code Scanner</h1>
      
      <div className="scanner-container">
        <video ref={videoRef} className="scanner-video"></video>
        <div className="scanner-overlay">
          <div className="scanner-frame"></div>
          <p className="scanner-hint">Align QR code within the frame</p>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
          {message}
        </div>
      )}

      <div className="scanner-controls">
        {!isScanning ? (
          <button className="btn btn-primary" onClick={startScanning}>
            🎥 Start Scanner
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={stopScanning}>
            ⏹️ Stop Scanner
          </button>
        )}
      </div>

      <div className="instructions">
        <h3>Instructions</h3>
        <ol>
          <li>Click "Start Scanner" to enable your camera</li>
          <li>Point your camera at a QR code</li>
          <li>The app will automatically detect and redirect to the batch details</li>
          <li>Make sure you have camera permissions enabled</li>
        </ol>
      </div>
    </div>
  );
};

export default QRScannerPage;