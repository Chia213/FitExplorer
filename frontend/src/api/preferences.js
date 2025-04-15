export const updatePreferences = async (useCustomCardColor, cardColor) => {
    try {
        const response = await axios.post('/api/preferences/update', {
            use_custom_card_color: useCustomCardColor,
            card_color: cardColor,
            clear_premium_theme: useCustomCardColor // Clear premium theme when custom color is enabled
        });
        return response.data;
    } catch (error) {
        console.error('Error updating preferences:', error);
        throw error;
    }
}; 