import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkoutScreen = ({ route }) => {
  const { workout } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workout Screen</Text>
      <Text style={styles.subtitle}>Coming Soon!</Text>
      {workout && (
        <Text style={styles.workoutName}>Selected: {workout.name}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  workoutName: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 16,
  },
});

export default WorkoutScreen;
