import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, StatusBar } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const APP_URL = 'https://fitexplorer.se'; // Your deployed app URL

export default function App() {
  const openApp = async () => {
    try {
      await WebBrowser.openBrowserAsync(APP_URL, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#007AFF',
        showTitle: false,
        enableBarCollapsing: false,
        showInRecents: true,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to open FitExplorer. Please check your internet connection.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💪</Text>
          <Text style={styles.appName}>FitExplorer</Text>
          <Text style={styles.tagline}>Your Fitness Journey Starts Here</Text>
        </View>
        
        <View style={styles.features}>
          <Text style={styles.feature}>🏋️‍♀️ AI Workout Generator</Text>
          <Text style={styles.feature}>📊 Progress Tracking</Text>
          <Text style={styles.feature}>🥗 Nutrition Tracking</Text>
          <Text style={styles.feature}>📈 Personal Records</Text>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={openApp}>
          <Text style={styles.buttonText}>Open FitExplorer</Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          Tap the button above to access the full FitExplorer experience in your browser.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  features: {
    marginBottom: 40,
    alignItems: 'center',
  },
  feature: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});