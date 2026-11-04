import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BarcodeScanner({ onScanSuccess }) {
  const [scannedResult, setScannedResult] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        setScannedResult(decodedText);
        if (onScanSuccess) {
          onScanSuccess(decodedText);
        }
      },
      (errorMessage) => {}
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <div id="reader"></div>
      {scannedResult && (
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'green' }}>
          آخر باركود تم قراءته: {scannedResult}
        </p>
      )}
    </div>
  );
}
