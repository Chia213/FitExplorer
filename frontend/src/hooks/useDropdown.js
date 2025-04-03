import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook to manage dropdown state and outside click handling
 * 
 * @param {boolean} initialState - Initial open/closed state
 * @returns {Array} [isOpen, toggle, close, ref] - State and handlers for the dropdown
 */
const useDropdown = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const ref = useRef(null);
  
  // Toggle dropdown state
  const toggle = () => setIsOpen(prev => !prev);
  
  // Close dropdown
  const close = () => setIsOpen(false);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        close();
      }
    };
    
    // Add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  return [isOpen, toggle, close, ref];
};

export default useDropdown;