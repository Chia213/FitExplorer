import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import CreateWorkoutScreen from './src/screens/CreateWorkoutScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import services
import NotificationService from './src/services/NotificationService';
import HealthKitService from './src/services/HealthKitService';
import OfflineStorageService from './src/services/OfflineStorageService';

const Stack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          ...Ionicons.font,
        });

        // Initialize native services
        await initializeNativeServices();
        
        setIsReady(true);
      } catch (e) {
        console.warn('Error during app initialization:', e);
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const initializeNativeServices = async () => {
    try {
      // Initialize notification service
      await NotificationService.registerForPushNotifications();
      
      // Initialize HealthKit service
      await HealthKitService.requestPermissions();
      
      // Initialize offline storage
      await OfflineStorageService.initializeDatabase();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing native services:', error);
    }
  };

  const onLayoutRootView = async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading FitExplorer...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: '#1a1a1a',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'FitExplorer',
            headerRight: () => (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => Alert.alert('Settings', 'Settings coming soon!')}
              >
                <Ionicons name="settings-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen 
          name="WorkoutScreen" 
          component={WorkoutScreen}
          options={{ title: 'Workout' }}
        />
        <Stack.Screen 
          name="ProgressScreen" 
          component={ProgressScreen}
          options={{ title: 'Progress' }}
        />
        <Stack.Screen 
          name="CreateWorkoutScreen" 
          component={CreateWorkoutScreen}
          options={{ title: 'Create Workout' }}
        />
        <Stack.Screen 
          name="ProfileScreen" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
});