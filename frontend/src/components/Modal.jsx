import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';

/**
 * A reusable modal component
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Controls whether the modal is visible
 * @param {function} props.onClose Function to call when the modal is closed
 * @param {string} props.title Modal title
 * @param {ReactNode} props.children Modal content
 * @param {string} props.size Size of the modal ('sm', 'md', 'lg', 'xl', 'full')
 * @param {boolean} props.closeOnOutsideClick Whether to close the modal when clicking outside
 * @param {boolean} props.showCloseButton Whether to show the X button to close the modal
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  closeOnOutsideClick = true,
  showCloseButton = true
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling on the body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Handle escape key press
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full ${sizeClasses[size]} transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );

  // Check if document is available (for SSR)
  const isBrowser = typeof window !== 'undefined' && window.document;
  
  // Use portal to render modal at the end of the document body
  if (isBrowser) {
    return createPortal(modalContent, document.body);
  }
  
  return modalContent;
};

export default Modal; 