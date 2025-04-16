import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Platform, Image, Alert } from 'react-native';
import { isWeb } from '../utils/platform';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/client';

// Register for redirect
WebBrowser.maybeCompleteAuthSession();

// Google sign-in configuration
const googleConfig = {
  androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || '917960701094-3448boe93v2n4bru03t0t71n6016lbao.apps.googleusercontent.com',
  expoClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || '917960701094-3448boe93v2n4bru03t0t71n6016lbao.apps.googleusercontent.com',
};

const GoogleSignInButton = ({ style }) => {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  // Use expo-auth-session's Google provider
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Platform.select({
      ios: googleConfig.iosClientId,
      android: googleConfig.androidClientId,
      default: googleConfig.webClientId,
    }),
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response.authentication);
    } else if (response?.type === 'error') {
      Alert.alert('Authentication error', response.error?.message || 'Failed to authenticate with Google');
    }
  }, [response]);

  const handleGoogleResponse = async (authentication) => {
    if (!authentication) return;
    
    try {
      setIsLoading(true);
      
      // Get user info using the access token
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });
      
      const userInfo = await userInfoResponse.json();
      
      // Send both tokens to your backend
      const success = await loginWithGoogle({
        idToken: authentication.idToken, // ID token for backend verification
        accessToken: authentication.accessToken, // Access token 
        user: {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.picture
        }
      });
      
      if (!success) {
        Alert.alert('Login Failed', 'Failed to authenticate with the server. Please try again.');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Login Error', 'Failed to process Google login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Authentication Error', 'Failed to start Google authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleGoogleSignIn}
      disabled={isLoading || !request}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <Image 
          source={require('../../assets/google_icon.png')} 
          style={styles.googleIcon}
          defaultSource={require('../../assets/google_icon.png')}
        />
        <Text style={styles.buttonText}>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#3c4043',
    fontWeight: '500',
  },
});

export default GoogleSignInButton; 