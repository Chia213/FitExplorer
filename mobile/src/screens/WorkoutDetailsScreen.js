import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import apiClient from '../api/client';

const WorkoutDetailsScreen = ({ route, navigation }) => {
  const { workoutId } = route.params;
  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkoutDetails();
  }, [workoutId]);

  const fetchWorkoutDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/workout-routines/${workoutId}`);
      if (response.data) {
        setWorkout(response.data);
        setError(null);
      } else {
        throw new Error('No workout data received');
      }
    } catch (err) {
      console.error('Error fetching workout details:', err);
      setError('Failed to load workout details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkout = () => {
    // In a real app, this would navigate to a workout session screen
    // or add the workout to the user's active workout
    console.log('Starting workout:', workout?.name);
    // navigation.navigate('WorkoutSession', { workoutId });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Try Again"
          onPress={fetchWorkoutDetails}
          style={styles.retryButton}
        />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Workout not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{workout.level}</Text>
        </View>
      </View>

      <Text style={styles.description}>{workout.description}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{workout.duration} min</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{workout.exercises}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="flame-outline" size={24} color="#3b82f6" />
          <Text style={styles.statValue}>{workout.calories || '−−'}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {workout.exerciseList && workout.exerciseList.length > 0 ? (
          workout.exerciseList.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetail}>
                  {exercise.sets} sets × {exercise.reps} reps
                </Text>
              </View>
              <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No exercises found</Text>
        )}
      </View>

      <Button
        title="Start Workout"
        onPress={handleStartWorkout}
        style={styles.startButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  levelBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  levelText: {
    fontSize: 14,
    color: '#0284c7',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  exerciseItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginVertical: 20,
  },
  startButton: {
    margin: 15,
    marginBottom: 30,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
});

export default WorkoutDetailsScreen; 