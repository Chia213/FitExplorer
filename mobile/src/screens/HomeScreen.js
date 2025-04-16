import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Button from '../components/Button';
import { isWeb } from '../utils/platform';
import { scheduleLocalNotification } from '../utils/notifications';

const HomeScreen = ({ navigation }) => {
  const handleTestNotification = async () => {
    await scheduleLocalNotification(
      'FitExplorer',
      'Thanks for using FitExplorer! Here\'s a test notification.',
      { screen: 'Home' },
      2
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to FitExplorer</Text>
        <Text style={styles.subtitle}>
          Your AI-powered fitness companion
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Start Workout" 
            onPress={() => navigation.navigate('Workouts')}
          />
          
          <Button 
            title="Meal Plan" 
            onPress={() => navigation.navigate('Nutrition')}
            color="#10b981"
            style={styles.secondaryButton}
          />
          
          <Button 
            title="View Profile" 
            onPress={() => navigation.navigate('Profile')}
            color="#6366f1"
            style={styles.secondaryButton}
          />

          <Button 
            title="Test Notification" 
            onPress={handleTestNotification}
            color="#f59e0b"
            style={styles.secondaryButton}
          />
        </View>
        
        <Text style={styles.platformText}>
          Running on: {isWeb ? 'Web' : 'Native Mobile'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
    marginBottom: 30,
  },
  secondaryButton: {
    marginTop: 10,
  },
  platformText: {
    marginTop: 20,
    fontSize: 14,
    color: '#6b7280',
  },
});

export default HomeScreen; 