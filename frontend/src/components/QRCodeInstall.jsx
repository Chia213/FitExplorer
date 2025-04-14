import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

const QRCodeInstall = () => {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Install FitExplorer on your device</h2>
      <div className="p-4 bg-white rounded-lg">
        <QRCode
          value={currentUrl}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Scan this QR code with your phone's camera to install FitExplorer
      </p>
      <div className="mt-4 text-sm text-gray-600">
        <p>For iOS users:</p>
        <ol className="list-decimal list-inside">
          <li>Open Safari</li>
          <li>Tap the Share button</li>
          <li>Select "Add to Home Screen"</li>
        </ol>
        <p className="mt-2">For Android users:</p>
        <ol className="list-decimal list-inside">
          <li>Open Chrome</li>
          <li>Tap the menu (three dots)</li>
          <li>Select "Add to Home Screen"</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodeInstall; 