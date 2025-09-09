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
    // Use Expo deep link URL for QR code
    setCurrentUrl('exp://exp.host/@chia94/FitExplorerApp');
    
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
                <FaMobile className="mr-2" /> Open in Expo Go
              </h2>
              <p className="text-white/80 text-sm">
                Scan this QR code with Expo Go to open our mobile app
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
                Scan this code with Expo Go to open our mobile app. Download Expo Go from your app store first!
              </p>
              
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-200"
              >
                {showInstructions ? 'Hide' : 'Show'} Expo Go Instructions
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
                        How to Use with Expo Go:
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <p className="flex items-start">
                          <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                          Download Expo Go from App Store or Google Play
                        </p>
                        <p className="flex items-start">
                          <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                          Open Expo Go app
                        </p>
                        <p className="flex items-start">
                          <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                          Scan this QR code with Expo Go
                        </p>
                        <p className="flex items-start">
                          <span className="bg-primary-500 text-white w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0">4</span>
                          FitExplorer will open in Expo Go!
                        </p>
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <p className="text-blue-700 dark:text-blue-300 text-xs">
                            Get the native mobile app experience with all FitExplorer features!
                          </p>
                        </div>
                      </div>
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