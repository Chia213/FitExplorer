import React, { useState } from 'react';

const ThemeContext = React.createContext();

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({
        useCustomCardColor: false,
        cardColor: '#default',
        premiumTheme: 'default'
    });

    const updateTheme = (newThemeData) => {
        setTheme(prevTheme => ({
            ...prevTheme,
            ...newThemeData,
            // If custom color is enabled, ensure premium theme is cleared
            premiumTheme: newThemeData.useCustomCardColor ? 'default' : (newThemeData.premiumTheme || prevTheme.premiumTheme)
        }));
    };

    const value = {
        theme,
        updateTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider; 