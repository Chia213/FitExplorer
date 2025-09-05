import React, { useRef, useState } from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, StatusBar, StyleSheet, Alert, TouchableOpacity, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function App() {
  const webViewRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState('https://www.fitexplorer.se');

  const handleNavigationStateChange = (navState) => {
    console.log('Navigation to:', navState.url);
    setCurrentUrl(navState.url);
    
    // Handle OAuth redirects by opening in external browser
    if (navState.url.includes('accounts.google.com') ||
        navState.url.includes('oauth2.googleapis.com') ||
        navState.url.includes('google.com/oauth') ||
        navState.url.includes('google.com/auth') ||
        navState.url.includes('googleapis.com/oauth')) {
      
      WebBrowser.openBrowserAsync(navState.url, {
        showTitle: false,
        enableBarCollapsing: false,
        showInRecents: true,
      }).then(() => {
        // After OAuth, reload the WebView
        setTimeout(() => {
          webViewRef.current?.reload();
        }, 2000);
      });
      
      return false; // Prevent WebView from navigating
    }
    return true;
  };

  const handleShouldStartLoadWithRequest = (request) => {
    console.log('Loading request:', request.url);
    
    // Handle OAuth URLs by opening in external browser
    if (request.url.includes('accounts.google.com') ||
        request.url.includes('oauth2.googleapis.com') ||
        request.url.includes('google.com/oauth') ||
        request.url.includes('google.com/auth') ||
        request.url.includes('googleapis.com/oauth')) {
      
      WebBrowser.openBrowserAsync(request.url, {
        showTitle: false,
        enableBarCollapsing: false,
        showInRecents: true,
      }).then(() => {
        // After OAuth, reload the WebView
        setTimeout(() => {
          webViewRef.current?.reload();
        }, 2000);
      });
      
      return false; // Prevent WebView from loading
    }
    return true;
  };

  const handleMessage = (event) => {
    // Handle messages from the web app
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received message from WebView:', data);
      
      if (data.type === 'oauth_complete') {
        // OAuth completed, refresh the page
        webViewRef.current?.reload();
      } else if (data.type === 'google_login_clicked') {
        // Google login button was clicked, wait for OAuth redirect
        console.log('Google login button clicked, waiting for OAuth redirect...');
      } else if (data.type === 'oauth_redirect') {
        // OAuth redirect detected, open in external browser
        console.log('OAuth redirect detected:', data.url);
        WebBrowser.openBrowserAsync(data.url, {
          showTitle: false,
          enableBarCollapsing: false,
          showInRecents: true,
        }).then(() => {
          setTimeout(() => {
            webViewRef.current?.reload();
          }, 2000);
        });
      }
    } catch (error) {
      console.log('Message handling error:', error);
    }
  };

  const refreshWebView = () => {
    webViewRef.current?.reload();
  };

  const goHome = () => {
    webViewRef.current?.goBack();
  };

  const openGoogleLogin = () => {
    // Directly open Google OAuth in external browser
    const googleOAuthUrl = 'https://accounts.google.com/oauth/authorize?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=https://www.fitexplorer.se&response_type=code&scope=openid%20email%20profile';
    WebBrowser.openBrowserAsync(googleOAuthUrl, {
      showTitle: false,
      enableBarCollapsing: false,
      showInRecents: true,
    }).then(() => {
      // After OAuth, reload the WebView
      setTimeout(() => {
        webViewRef.current?.reload();
      }, 2000);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goHome}>
          <Text style={styles.buttonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.googleButton} onPress={openGoogleLogin}>
          <Text style={styles.buttonText}>🔑 Google Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshWebView}>
          <Text style={styles.buttonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.fitexplorer.se' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        mixedContentMode="compatibility"
        allowsLinkPreview={false}
        injectedJavaScript={`
          // Inject script to help with Google login detection
          (function() {
            // Listen for Google login button clicks
            document.addEventListener('click', function(e) {
              if (e.target.closest('[data-provider="google"]') || 
                  e.target.closest('.google-login') ||
                  e.target.closest('[aria-labelledby="button-label"]')) {
                console.log('Google login button clicked');
                // Send message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'google_login_clicked'
                }));
              }
            });
            
            // Also listen for Google OAuth redirects
            if (window.location.href.includes('google.com') || 
                window.location.href.includes('oauth')) {
              console.log('Google OAuth detected');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'oauth_redirect',
                url: window.location.href
              }));
            }
          })();
          true;
        `}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 50,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  googleButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
});