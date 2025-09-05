import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, StatusBar, StyleSheet, Alert, TouchableOpacity, Text, View } from 'react-native';

export default function App() {
  const webViewRef = useRef(null);

  const handleNavigationStateChange = (navState) => {
    // Allow OAuth to work within WebView
    console.log('Navigation to:', navState.url);
    return true;
  };

  const handleShouldStartLoadWithRequest = (request) => {
    // Allow all navigation including OAuth
    console.log('Loading request:', request.url);
    return true;
  };

  const handleMessage = (event) => {
    // Handle messages from the web app
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'oauth_complete') {
        // OAuth completed, refresh the page
        webViewRef.current?.reload();
      }
    } catch (error) {
      console.log('Message handling error:', error);
    }
  };

  const refreshWebView = () => {
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshWebView}>
          <Text style={styles.refreshText}>🔄 Refresh</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
});