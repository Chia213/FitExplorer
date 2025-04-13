import { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../utils/translations';

// Create a context for language settings
const LanguageContext = createContext();

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Default to English
  const [isLoading, setIsLoading] = useState(true);

  // Load user's language preference when component mounts
  useEffect(() => {
    // Try to get stored preference from localStorage first
    const storedLang = localStorage.getItem('language');
    if (storedLang) {
      setLanguage(storedLang);
      document.documentElement.lang = storedLang;
      setIsLoading(false);
      return;
    }

    // If no stored preference, check user's profile if logged in
    const loadLanguageFromProfile = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/user-profile`, {
          headers: { 
            'Authorization': `Bearer ${token}` 
          },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.language) {
            setLanguage(userData.language);
            localStorage.setItem('language', userData.language);
            document.documentElement.lang = userData.language;
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageFromProfile();
  }, []);

  // Function to update user's language preference
  const updateLanguage = async (newLanguage) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (token) {
        const response = await fetch(`${API_URL}/user/settings/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ language: newLanguage })
        });
        
        if (!response.ok) {
          console.error('Failed to update language preference on server');
        }
      }
      
      // Update local state and localStorage regardless of server response
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
      document.documentElement.lang = newLanguage;
    } catch (error) {
      console.error('Error updating language preference:', error);
      // Still update local state even if server update fails
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
      document.documentElement.lang = newLanguage;
    }
  };

  const t = (key) => getTranslation(key, language);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 
