import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function InstallAppQR() {
  const [isOpen, setIsOpen] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
    setIsAndroid(/android/i.test(userAgent));
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
              Install FitExplorer App
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <QRCodeSVG
                value={window.location.origin}
                size={200}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Scan this QR code to install the FitExplorer app on your device
            </p>

            {isIOS && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="font-medium mb-1">On iOS:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your camera app</li>
                  <li>Point it at the QR code</li>
                  <li>Tap the notification that appears</li>
                  <li>Tap "Add to Home Screen"</li>
                </ol>
              </div>
            )}

            {isAndroid && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="font-medium mb-1">On Android:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your camera app</li>
                  <li>Point it at the QR code</li>
                  <li>Tap the notification that appears</li>
                  <li>Tap "Install"</li>
                </ol>
              </div>
            )}

            <button
              onClick={handleClose}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 