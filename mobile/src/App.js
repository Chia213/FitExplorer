import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Theme demo component that uses the ThemeContext
const ThemeDemo = () => {
  const { 
    theme, 
    themeName, 
    changeTheme, 
    toggleDarkMode, 
    unlockedThemes,
    premiumThemes,
    setCustomThemeColor
  } = useTheme();

  // Create styles based on current theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 8,
    },
    text: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 12,
    },
    buttonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 10,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 10,
      borderRadius: 6,
      margin: 4,
      minWidth: 100,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    themeCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      margin: 5,
      borderWidth: 2,
      borderColor: 'white',
    },
    customColors: {
      flexDirection: 'row',
      justifyContent: 'center',
      padding: 10,
    },
    colorButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      margin: 5,
      borderWidth: 2,
      borderColor: 'white',
    }
  });

  const colorOptions = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Orange', value: '#f59e0b' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.card}>
          <Text style={styles.title}>Current Theme: {theme.name}</Text>
          <Text style={styles.text}>
            Primary Color: {theme.primary}{'\n'}
            Dark Mode: {theme.darkMode ? 'Yes' : 'No'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.secondary }]}
            onPress={toggleDarkMode}>
            <Text style={styles.buttonText}>Toggle Dark Mode</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Available Themes</Text>
          <Text style={styles.text}>Click a theme to apply it:</Text>
          
          <View style={styles.buttonRow}>
            {Object.entries(premiumThemes)
              .filter(([key]) => unlockedThemes.includes(key))
              .map(([key, themeObj]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.button,
                    { backgroundColor: themeObj.primary },
                    themeName === key ? { borderWidth: 3, borderColor: 'gold' } : {}
                  ]}
                  onPress={() => changeTheme(key)}>
                  <Text style={styles.buttonText}>{themeObj.name}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Custom Colors</Text>
          <Text style={styles.text}>Choose a custom primary color:</Text>
          
          <View style={styles.customColors}>
            {colorOptions.map(color => (
              <TouchableOpacity
                key={color.value}
                style={[styles.colorButton, { backgroundColor: color.value }]}
                onPress={() => setCustomThemeColor(color.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Theme Preview</Text>
          <View style={{ backgroundColor: theme.background, padding: 10, borderRadius: 8 }}>
            <View style={{ backgroundColor: theme.card, padding: 15, borderRadius: 8, marginBottom: 10 }}>
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Primary Text</Text>
              <Text style={{ color: theme.secondary }}>Secondary Text</Text>
              <Text style={{ color: theme.accent }}>Accent Text</Text>
              <Text style={{ color: theme.text }}>Normal Text</Text>
            </View>
            <View style={{ backgroundColor: theme.primary, padding: 10, borderRadius: 4, alignItems: 'center' }}>
              <Text style={{ color: 'white' }}>Primary Button</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <StatusBar style={theme.darkMode ? 'light' : 'dark'} />
    </SafeAreaView>
  );
};

// Main App component wrapped with ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <ThemeDemo />
    </ThemeProvider>
  );
} 