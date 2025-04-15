import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { FaTimes, FaMobile, FaQrcode, FaDownload } from 'react-icons/fa';
import logo from '../assets/Ronjasdrawing.png';

const MobileInstallQR = ({ isOpen, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Get the current URL to encode in the QR code
    setCurrentUrl(window.location.origin);
    
    // Detect platform for specific instructions
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
    setIsAndroid(/android/i.test(userAgent));
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-5 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
                aria-label="Close"
              >
                <FaTimes size={20} />
              </button>
              <h2 className="text-xl font-bold mb-1 flex items-center">
                <FaMobile className="mr-2" /> Install App to Home Screen
              </h2>
              <p className="text-white/80 text-sm">
                Scan this QR code from your mobile device to install our app
              </p>
            </div>
            
            {/* QR Code */}
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md mb-4 relative">
                <div className="relative">
                  <QRCodeSVG
                    value={currentUrl}
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                    includeMargin={false}
                    imageSettings={{
                      src: logo,
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
              
              <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
                Scan this code with your phone's camera to visit our site. When installed, you'll see our app icon on your home screen.
              </p>
              
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-200"
              >
                {showInstructions ? 'Hide' : 'Show'} Installation Instructions
                <FaDownload className="ml-2" />
              </button>
            </div>
            
            {/* Installation Instructions */}
            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
                        How to Install:
                      </h3>
                      
                      {isIOS && (
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                            Open this website in Safari
                          </p>
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                            Tap the Share button <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mx-1 font-mono">􀈂</span> at the bottom of the screen
                          </p>
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                            Scroll down and tap "Add to Home Screen" <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mx-1 font-mono">+</span>
                          </p>
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">4</span>
                            Tap "Add" in the top right corner
                          </p>
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <p className="text-blue-700 dark:text-blue-300 text-xs">
                              Your home screen will now display our app with the FitExplorer logo
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {isAndroid && (
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                            Open this website in Chrome
                          </p>
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                            Tap the menu icon (three dots <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded mx-1 font-mono">⋮</span>) in the top right
                          </p>
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                            Tap "Install app" or "Add to Home screen"
                          </p>
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">4</span>
                            Tap "Install" or "Add" when prompted
                          </p>
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <p className="text-blue-700 dark:text-blue-300 text-xs">
                              The app will be installed with our logo on your home screen
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!isIOS && !isAndroid && (
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                            Open this website on your mobile device
                          </p>
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                            For iOS: Use Safari and tap the share icon, then "Add to Home Screen"
                          </p>
                          <p className="flex items-start">
                            <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                            For Android: Use Chrome and tap the menu, then "Install app" or "Add to Home Screen"
                          </p>
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <p className="text-blue-700 dark:text-blue-300 text-xs">
                              The app will appear on your home screen with our logo for easy access
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileInstallQR; 