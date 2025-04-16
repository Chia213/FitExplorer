import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import apiClient from '../api/client';

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

const CreateWorkoutScreen = ({ navigation }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchExercises();
  }, []);
  
  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/exercises');
      if (response.data) {
        setAvailableExercises(response.data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      Alert.alert('Error', 'Failed to load exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddExercise = (exercise) => {
    const newExerciseItem = {
      ...exercise,
      sets: 3,
      reps: 10,
      id: Date.now().toString(), // temporary id for the list
    };
    
    setExercises([...exercises, newExerciseItem]);
    setShowExerciseSelector(false);
  };
  
  const handleRemoveExercise = (index) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };
  
  const handleUpdateExercise = (index, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[index][field] = value;
    setExercises(updatedExercises);
  };
  
  const handleSaveWorkout = async () => {
    // Basic validation
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }
    
    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise to the workout');
      return;
    }
    
    setIsSaving(true);
    try {
      const workoutData = {
        name: workoutName,
        description,
        level,
        duration: parseInt(duration) || 0,
        exercises: exercises.map(ex => ({
          exercise_id: ex.id,
          sets: ex.sets,
          reps: ex.reps,
        })),
      };
      
      const response = await apiClient.post('/workout-routines', workoutData);
      
      if (response.data) {
        Alert.alert('Success', 'Workout created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const filteredExercises = searchQuery 
    ? availableExercises.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.muscle_group && ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : availableExercises;
  
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {showExerciseSelector ? (
          <View style={styles.exerciseSelectorContainer}>
            <View style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>Select Exercise</Text>
              <TouchableOpacity 
                onPress={() => setShowExerciseSelector(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <ScrollView style={styles.exercisesList}>
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseOption}
                    onPress={() => handleAddExercise(exercise)}
                  >
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMuscle}>
                      {exercise.muscle_group || 'Unknown muscle group'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No exercises found' : 'No exercises available'}
                </Text>
              )}
            </ScrollView>
          </View>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Workout Name</Text>
              <TextInput
                style={styles.input}
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholder="Enter workout name"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter workout description"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="e.g., 45"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Difficulty Level</Text>
                <View style={styles.levelSelector}>
                  {difficultyLevels.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.levelOption,
                        level === item && styles.selectedLevel,
                      ]}
                      onPress={() => setLevel(item)}
                    >
                      <Text
                        style={[
                          styles.levelText,
                          level === item && styles.selectedLevelText,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.exercisesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <Button
                  title="Add Exercise"
                  onPress={() => setShowExerciseSelector(true)}
                  style={styles.addButton}
                />
              </View>
              
              {exercises.length > 0 ? (
                exercises.map((exercise, index) => (
                  <View key={exercise.id} style={styles.exerciseItem}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseItemName}>{exercise.name}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveExercise(index)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.exerciseControls}>
                      <View style={styles.counterContainer}>
                        <Text style={styles.counterLabel}>Sets</Text>
                        <View style={styles.counter}>
                          <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => handleUpdateExercise(
                              index, 
                              'sets', 
                              Math.max(1, exercise.sets - 1)
                            )}
                          >
                            <Text style={styles.counterButtonText}>−</Text>
                          </TouchableOpacity>
                          
                          <Text style={styles.counterValue}>{exercise.sets}</Text>
                          
                          <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => handleUpdateExercise(
                              index, 
                              'sets', 
                              exercise.sets + 1
                            )}
                          >
                            <Text style={styles.counterButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.counterContainer}>
                        <Text style={styles.counterLabel}>Reps</Text>
                        <View style={styles.counter}>
                          <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => handleUpdateExercise(
                              index, 
                              'reps', 
                              Math.max(1, exercise.reps - 1)
                            )}
                          >
                            <Text style={styles.counterButtonText}>−</Text>
                          </TouchableOpacity>
                          
                          <Text style={styles.counterValue}>{exercise.reps}</Text>
                          
                          <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => handleUpdateExercise(
                              index, 
                              'reps', 
                              exercise.reps + 1
                            )}
                          >
                            <Text style={styles.counterButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No exercises added yet</Text>
              )}
            </View>
            
            <Button
              title={isSaving ? 'Saving...' : 'Save Workout'}
              onPress={handleSaveWorkout}
              disabled={isSaving}
              style={styles.saveButton}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  levelSelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  levelOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectedLevel: {
    backgroundColor: '#3b82f6',
  },
  levelText: {
    fontSize: 14,
    color: '#4b5563',
  },
  selectedLevelText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  exercisesSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    paddingHorizontal: 12,
    height: 36,
  },
  exerciseItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  exerciseControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  counterContainer: {
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  counterButton: {
    width: 28,
    height: 28,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 10,
  },
  exerciseSelectorContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  exercisesList: {
    maxHeight: 500,
  },
  exerciseOption: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  exerciseMuscle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CreateWorkoutScreen; 