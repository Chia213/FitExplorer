import React, { useState, createContext, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Languages supported by the app
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de'];
const DEFAULT_LANGUAGE = 'en';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
    const [loading, setLoading] = useState(true);

    // Load language preference from AsyncStorage on mount
    useEffect(() => {
        const loadLanguage = async () => {
            setLoading(true);
            try {
                // Try to get stored language preference
                const storedLanguage = await AsyncStorage.getItem('language');
                
                if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
                    setLanguage(storedLanguage);
                } else {
                    // If no stored preference, use device locale if supported
                    const deviceLocale = Localization.locale.split('-')[0];
                    if (SUPPORTED_LANGUAGES.includes(deviceLocale)) {
                        setLanguage(deviceLocale);
                        await AsyncStorage.setItem('language', deviceLocale);
                    }
                }
            } catch (error) {
                console.error('Error loading language preference:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLanguage();
    }, []);

    // Update language preference
    const updateLanguage = async (newLanguage) => {
        if (!SUPPORTED_LANGUAGES.includes(newLanguage)) {
            console.error(`Language "${newLanguage}" is not supported`);
            return;
        }

        try {
            // Update state
            setLanguage(newLanguage);
            
            // Save to storage
            await AsyncStorage.setItem('language', newLanguage);
        } catch (error) {
            console.error('Error saving language preference:', error);
        }
    };

    const value = {
        language,
        updateLanguage,
        loading,
        supportedLanguages: SUPPORTED_LANGUAGES
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageProvider; 