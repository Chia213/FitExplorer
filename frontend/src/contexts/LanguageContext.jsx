import { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch("http://localhost:8000/user-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          if (userData.preferences?.language) {
            setLanguage(userData.preferences.language);
            document.documentElement.lang = userData.preferences.language;
          }
        }
      } catch (err) {
        console.error("Error fetching user preferences:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, []);

  const changeLanguage = async (newLanguage) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Update backend
      const response = await fetch("http://localhost:8000/user/settings/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          language: newLanguage
        }),
      });

      if (response.ok) {
        setLanguage(newLanguage);
        document.documentElement.lang = newLanguage;
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating language:", err);
      return false;
    }
  };

  const t = (key) => getTranslation(key, language);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 