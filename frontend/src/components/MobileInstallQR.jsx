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
    // Use modern Expo URL format
    setCurrentUrl('https://expo.dev/@chia94/FitExplorerApp');
    
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
                Multiple ways to access our mobile app - choose what works best for you!
              </p>
              
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-800 dark:text-gray-200"
              >
{showInstructions ? 'Hide' : 'Show'} Mobile App Instructions
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
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
                        Choose Your Preferred Method:
                      </h3>
                      
                      {/* Method 1: Direct Link */}
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center">
                          <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                          Direct Link (Easiest)
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                          Click the link below to open directly in your browser:
                        </p>
                        <a 
                          href="https://expo.dev/@chia94/FitExplorerApp" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                        >
                          Open FitExplorer App
                        </a>
                      </div>

                      {/* Method 2: Expo Go */}
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                          <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                          With Expo Go App
                        </h4>
                        <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                          <p>1. Download Expo Go from your app store</p>
                          <p>2. Open Expo Go and tap "Enter URL manually"</p>
                          <p>3. Enter: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">https://expo.dev/@chia94/FitExplorerApp</code></p>
                        </div>
                      </div>

                      {/* Method 3: QR Code */}
                      <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                          <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                          Scan QR Code
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Use your camera or QR scanner app to scan the code above
                        </p>
                      </div>

                      {/* Method 4: Web Version */}
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                          <span className="bg-gray-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm">4</span>
                          Web Version
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Use the full web version in your mobile browser:
                        </p>
                        <a 
                          href="https://www.fitexplorer.se" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          Open Web Version
                        </a>
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