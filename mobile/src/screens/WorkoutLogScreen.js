import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Switch
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Button from '../components/Button';
import apiClient from '../api/client';
import { retrieveData, storeData } from '../utils/storage';

const getIntensityName = (intensityValue) => {
  const intensityMap = {
    "": "-",
    Low: "Low",
    Medium: "Medium",
    High: "High",
    "Very High": "Very High",
    // Handle numeric values too in case they come from the backend
    0: "-",
    1: "Low",
    2: "Medium",
    3: "High",
    4: "Very High",
  };
  return intensityMap[intensityValue] || "-";
};

const WorkoutLogScreen = ({ navigation, route }) => {
  // States for workout info
  const [workoutName, setWorkoutName] = useState("");
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [endTime, setEndTime] = useState("");
  const [bodyweight, setBodyweight] = useState("");
  const [notes, setNotes] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState({});
  const [showRoutinesSelector, setShowRoutinesSelector] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [weightUnit, setWeightUnit] = useState("kg");
  
  // Rest timer states
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [restTime, setRestTime] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Refs
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Load user preferences
    loadUserPreferences();
    
    // Start a new workout or load from routine if provided
    if (route.params?.routineId) {
      loadRoutine(route.params.routineId);
    }
    
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadUserPreferences = async () => {
    try {
      const preferences = await retrieveData('user_preferences');
      if (preferences) {
        if (preferences.weight_unit) {
          setWeightUnit(preferences.weight_unit);
        }
        if (preferences.default_rest_time) {
          setRestTime(preferences.default_rest_time);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === "kg" ? "lbs" : "kg";
    setWeightUnit(newUnit);
    
    // Save to local storage
    const preferences = { weight_unit: newUnit };
    storeData('user_preferences', preferences);
    
    // Save to server
    saveUserPreferences(preferences);
  };

  const toggleExerciseCollapse = (exerciseIndex) => {
    setCollapsedExercises((prev) => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex],
    }));
  };

  const prepareWorkoutForSaving = (workout) => {
    // Make a deep copy of the workout to avoid modifying the original
    const workoutCopy = JSON.parse(JSON.stringify(workout));

    // If the current unit is lbs, convert weights back to kg for storage
    if (weightUnit === "lbs") {
      // Convert bodyweight to kg if present
      if (workoutCopy.bodyweight) {
        const bw = parseFloat(workoutCopy.bodyweight);
        if (!isNaN(bw)) {
          workoutCopy.bodyweight = (bw / 2.20462).toFixed(1);
        }
      }

      // Convert all exercise weights
      if (workoutCopy.exercises && Array.isArray(workoutCopy.exercises)) {
        workoutCopy.exercises.forEach(exercise => {
          if (!exercise.is_cardio && exercise.sets && Array.isArray(exercise.sets)) {
            exercise.sets.forEach(set => {
              if (set.weight) {
                const weight = parseFloat(set.weight);
                if (!isNaN(weight)) {
                  set.weight = (weight / 2.20462).toFixed(1);
                }
              }
            });
          }
        });
      }
    }

    // Store the weight unit with the workout
    workoutCopy.weight_unit = weightUnit;
    return workoutCopy;
  };

  const handleMoveExercise = (exerciseIndex, direction) => {
    if (
      (direction === "up" && exerciseIndex === 0) ||
      (direction === "down" && exerciseIndex === workoutExercises.length - 1)
    ) {
      return;
    }

    const newExercises = [...workoutExercises];
    const targetIndex = direction === "up" ? exerciseIndex - 1 : exerciseIndex + 1;

    // Swap the exercises
    [newExercises[exerciseIndex], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[exerciseIndex],
    ];

    setWorkoutExercises(newExercises);
  };

  const loadRoutine = async (routineId) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/workout-routines/${routineId}`);
      if (response.data) {
        const routine = response.data;
        
        setWorkoutName(routine.name);
        
        // Transform routine exercises to workout exercises
        const exercises = routine.exercises.map(ex => ({
          id: ex.exercise_id || ex.id,
          name: ex.name,
          is_cardio: ex.is_cardio || false,
          muscle_group: ex.muscle_group,
          sets: ex.sets.map(set => ({
            ...set,
            weight: set.weight || "",
            reps: set.reps || "",
            distance: set.distance || "",
            duration: set.duration || "",
            intensity: set.intensity || "",
            completed: false
          })) || []
        }));
        
        setWorkoutExercises(exercises);
      }
    } catch (error) {
      console.error('Error loading routine:', error);
      Alert.alert('Error', 'Failed to load routine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutines = async () => {
    setLoadingRoutines(true);
    try {
      const response = await apiClient.get('/workout-routines');
      if (response.data) {
        setRoutines(response.data);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
      Alert.alert('Error', 'Failed to load routines. Please try again.');
    } finally {
      setLoadingRoutines(false);
    }
  };

  const handleSelectRoutine = (routine) => {
    // If we already have exercises, confirm before replacing
    if (workoutExercises.length > 0) {
      Alert.alert(
        'Replace Current Workout?',
        'This will replace your current workout with the selected routine. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Replace', 
            onPress: () => {
              loadRoutine(routine.id);
              setShowRoutinesSelector(false);
            }
          }
        ]
      );
    } else {
      loadRoutine(routine.id);
      setShowRoutinesSelector(false);
    }
  };

  const validateWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return false;
    }
    
    if (workoutExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise to the workout');
      return false;
    }
    
    // Check if all exercises have at least one completed set
    for (const exercise of workoutExercises) {
      const hasCompletedSet = exercise.sets.some(set => set.completed);
      if (!hasCompletedSet) {
        Alert.alert(
          'Incomplete Workout',
          `The exercise "${exercise.name}" has no completed sets. Do you want to continue anyway?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue Anyway', onPress: () => handleFinishWorkout() }
          ]
        );
        return false;
      }
    }
    
    return true;
  };

  const handleFinishWorkout = async () => {
    if (!validateWorkout()) {
      return;
    }
    
    // Set end time if not already set
    if (!endTime) {
      setEndTime(new Date().toISOString());
    }
    
    const workoutData = {
      name: workoutName,
      start_time: startTime,
      end_time: endTime || new Date().toISOString(),
      bodyweight: bodyweight || null,
      notes: notes,
      exercises: workoutExercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        is_cardio: exercise.is_cardio || false,
        muscle_group: exercise.muscle_group,
        sets: exercise.sets.filter(set => set.completed)
      }))
    };
    
    // Convert weights if necessary and prepare for saving
    const preparedWorkout = prepareWorkoutForSaving(workoutData);
    saveWorkout(preparedWorkout);
  };

  const saveWorkout = async (workout) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/workouts', workout);
      if (response.data) {
        Alert.alert(
          'Success',
          'Workout saved successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserPreferences = async (preferences) => {
    try {
      await apiClient.post('/user/preferences', preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      is_cardio: exercise.is_cardio || false,
      sets: []
    };
    
    setWorkoutExercises([...workoutExercises, newExercise]);
    
    // Add a default set based on exercise type
    handleAddSet(workoutExercises.length);
    setShowExerciseSelection(false);
  };

  const handleDeleteExercise = (exerciseIndex) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const newExercises = [...workoutExercises];
            newExercises.splice(exerciseIndex, 1);
            setWorkoutExercises(newExercises);
          }
        }
      ]
    );
  };

  const handleAddSet = (exerciseIndex) => {
    const newExercises = [...workoutExercises];
    const exercise = newExercises[exerciseIndex];
    
    if (!exercise) return;
    
    const newSet = exercise.is_cardio 
      ? { 
          duration: "", 
          distance: "", 
          intensity: "",
          completed: false 
        }
      : { 
          weight: "", 
          reps: "", 
          rpe: "", 
          is_warmup: false,
          completed: false 
        };
    
    // Copy values from the last set if available
    if (exercise.sets.length > 0) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      if (exercise.is_cardio) {
        newSet.duration = lastSet.duration;
        newSet.distance = lastSet.distance;
        newSet.intensity = lastSet.intensity;
      } else {
        newSet.weight = lastSet.weight;
        newSet.reps = lastSet.reps;
        newSet.rpe = lastSet.rpe;
      }
    }
    
    exercise.sets.push(newSet);
    setWorkoutExercises(newExercises);
  };

  const handleEditSet = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...workoutExercises];
    
    if (!newExercises[exerciseIndex] || !newExercises[exerciseIndex].sets[setIndex]) {
      return;
    }
    
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    
    // If any field is edited, mark the set as completed
    if (field !== 'completed') {
      newExercises[exerciseIndex].sets[setIndex].completed = true;
    }
    
    setWorkoutExercises(newExercises);
  };

  const handleDeleteSet = (exerciseIndex, setIndex) => {
    const newExercises = [...workoutExercises];
    
    if (!newExercises[exerciseIndex] || !newExercises[exerciseIndex].sets[setIndex]) {
      return;
    }
    
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    setWorkoutExercises(newExercises);
  };

  const handleStartRestTimer = (exercise) => {
    setCurrentExercise(exercise);
    setTimeLeft(restTime);
    setShowRestTimer(true);
  };

  const handleRestTimerChange = (value) => {
    setRestTime(parseInt(value) || 60);
    setTimeLeft(parseInt(value) || 60);
  };

  const startRestTimer = () => {
    setIsResting(true);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start a new timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer complete
          clearInterval(timerRef.current);
          setIsResting(false);
          // Play sound or vibrate here if needed
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseRestTimer = () => {
    setIsResting(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resetRestTimer = () => {
    setTimeLeft(restTime);
    setIsResting(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const closeRestTimer = () => {
    setShowRestTimer(false);
    setIsResting(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // Helper function for formatting time display
  const formatTimeForDisplay = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollContainer}>
        {/* Workout Header */}
        <View style={styles.header}>
          <TextInput
            style={styles.workoutNameInput}
            placeholder="Workout Name"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
          
          <View style={styles.unitToggle}>
            <Text style={styles.unitLabel}>Units:</Text>
            <TouchableOpacity 
              style={[
                styles.unitButton, 
                weightUnit === 'kg' && styles.activeUnitButton
              ]}
              onPress={() => weightUnit !== 'kg' && toggleWeightUnit()}
            >
              <Text style={[
                styles.unitButtonText,
                weightUnit === 'kg' && styles.activeUnitButtonText
              ]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.unitButton, 
                weightUnit === 'lbs' && styles.activeUnitButton
              ]}
              onPress={() => weightUnit !== 'lbs' && toggleWeightUnit()}
            >
              <Text style={[
                styles.unitButtonText,
                weightUnit === 'lbs' && styles.activeUnitButtonText
              ]}>lbs</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Bodyweight Input */}
        <View style={styles.bodyweightContainer}>
          <Text style={styles.label}>Bodyweight:</Text>
          <TextInput
            style={styles.bodyweightInput}
            placeholder="0.0"
            value={bodyweight}
            onChangeText={setBodyweight}
            keyboardType="numeric"
          />
          <Text style={styles.unitText}>{weightUnit}</Text>
        </View>
        
        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {workoutExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No exercises added yet. Add an exercise to get started!
              </Text>
            </View>
          ) : (
            workoutExercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exerciseCard}>
                <TouchableOpacity
                  style={styles.exerciseHeader}
                  onPress={() => toggleExerciseCollapse(exerciseIndex)}
                >
                  <View style={styles.exerciseTitleRow}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.exerciseActions}>
                      <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => handleMoveExercise(exerciseIndex, "up")}
                      >
                        <Ionicons name="arrow-up" size={18} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => handleMoveExercise(exerciseIndex, "down")}
                      >
                        <Ionicons name="arrow-down" size={18} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => handleDeleteExercise(exerciseIndex)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                      <Ionicons 
                        name={collapsedExercises[exerciseIndex] ? "chevron-down" : "chevron-up"} 
                        size={18} 
                        color="#6b7280" 
                      />
                    </View>
                  </View>
                  <Text style={styles.exerciseMuscleGroup}>{exercise.muscle_group}</Text>
                </TouchableOpacity>
                
                {!collapsedExercises[exerciseIndex] && (
                  <View style={styles.exerciseContent}>
                    {/* Table header */}
                    <View style={styles.setsHeader}>
                      <Text style={[styles.setHeaderCell, styles.setNumberCell]}>#</Text>
                      {exercise.is_cardio ? (
                        <>
                          <Text style={[styles.setHeaderCell, styles.setDefaultCell]}>Duration</Text>
                          <Text style={[styles.setHeaderCell, styles.setDefaultCell]}>Distance</Text>
                          <Text style={[styles.setHeaderCell, styles.setDefaultCell]}>Intensity</Text>
                        </>
                      ) : (
                        <>
                          <Text style={[styles.setHeaderCell, styles.setDefaultCell]}>Weight</Text>
                          <Text style={[styles.setHeaderCell, styles.setDefaultCell]}>Reps</Text>
                          <Text style={[styles.setHeaderCell, styles.setSmallCell]}>✓</Text>
                        </>
                      )}
                      <Text style={[styles.setHeaderCell, styles.setActionsCell]}></Text>
                    </View>
                    
                    {/* Sets */}
                    {exercise.sets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setRow}>
                        <Text style={[styles.setCell, styles.setNumberCell]}>{setIndex + 1}</Text>
                        
                        {exercise.is_cardio ? (
                          <>
                            <TextInput
                              style={[styles.setCell, styles.setDefaultCell, styles.setInput]}
                              value={set.duration}
                              onChangeText={(value) => handleEditSet(exerciseIndex, setIndex, "duration", value)}
                              keyboardType="numeric"
                              placeholder="min"
                            />
                            <TextInput
                              style={[styles.setCell, styles.setDefaultCell, styles.setInput]}
                              value={set.distance}
                              onChangeText={(value) => handleEditSet(exerciseIndex, setIndex, "distance", value)}
                              keyboardType="numeric"
                              placeholder="km"
                            />
                            <TextInput
                              style={[styles.setCell, styles.setDefaultCell, styles.setInput]}
                              value={set.intensity}
                              onChangeText={(value) => handleEditSet(exerciseIndex, setIndex, "intensity", value)}
                              placeholder="1-5"
                            />
                          </>
                        ) : (
                          <>
                            <TextInput
                              style={[styles.setCell, styles.setDefaultCell, styles.setInput]}
                              value={set.weight}
                              onChangeText={(value) => handleEditSet(exerciseIndex, setIndex, "weight", value)}
                              keyboardType="numeric"
                              placeholder="0"
                            />
                            <TextInput
                              style={[styles.setCell, styles.setDefaultCell, styles.setInput]}
                              value={set.reps}
                              onChangeText={(value) => handleEditSet(exerciseIndex, setIndex, "reps", value)}
                              keyboardType="numeric"
                              placeholder="0"
                            />
                            <TouchableOpacity
                              style={[
                                styles.setCell, 
                                styles.setSmallCell, 
                                set.completed && styles.completedSet
                              ]}
                              onPress={() => handleEditSet(exerciseIndex, setIndex, "completed", !set.completed)}
                            >
                              {set.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </TouchableOpacity>
                          </>
                        )}
                        
                        <View style={[styles.setCell, styles.setActionsCell]}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDeleteSet(exerciseIndex, setIndex)}
                          >
                            <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                    
                    {/* Add Set & Timer buttons */}
                    <View style={styles.exerciseActions}>
                      <TouchableOpacity
                        style={styles.addSetButton}
                        onPress={() => handleAddSet(exerciseIndex)}
                      >
                        <Ionicons name="add-circle-outline" size={18} color="#3b82f6" />
                        <Text style={styles.addSetButtonText}>Add Set</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.timerButton}
                        onPress={() => handleStartRestTimer(exercise)}
                      >
                        <Ionicons name="timer-outline" size={18} color="#3b82f6" />
                        <Text style={styles.timerButtonText}>Rest Timer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
          
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowExerciseSelection(true)}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
        
        {/* Notes Section */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add workout notes here..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              fetchRoutines();
              setShowRoutinesSelector(true);
            }}
          >
            <Ionicons name="list-outline" size={20} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>Load Routine</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleFinishWorkout}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Finish Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseSelection}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exercise</Text>
              <TouchableOpacity
                onPress={() => setShowExerciseSelection(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {/* Exercise search and list would go here */}
            <Text style={styles.modalInfoText}>
              Implementation of the exercise list goes here, similar to CreateWorkoutScreen.
            </Text>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExerciseSelection(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Routines Selection Modal */}
      <Modal
        visible={showRoutinesSelector}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Routine</Text>
              <TouchableOpacity
                onPress={() => setShowRoutinesSelector(false)}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {loadingRoutines ? (
              <ActivityIndicator size="large" color="#3b82f6" />
            ) : (
              <FlatList
                data={routines}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.routineItem}
                    onPress={() => handleSelectRoutine(item)}
                  >
                    <Text style={styles.routineName}>{item.name}</Text>
                    <Text style={styles.routineDetails}>
                      {item.exercises?.length || 0} exercises
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>
                    No routines found. Create some routines first!
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
      
      {/* Rest Timer Modal */}
      <Modal
        visible={showRestTimer}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.timerModalContainer}>
          <View style={styles.timerModalContent}>
            <Text style={styles.timerModalTitle}>Rest Timer</Text>
            {currentExercise && (
              <Text style={styles.timerExerciseName}>{currentExercise.name}</Text>
            )}
            
            <Text style={styles.timerDisplay}>
              {formatTimeForDisplay(timeLeft)}
            </Text>
            
            <View style={styles.timerControls}>
              <TouchableOpacity
                style={styles.timerButton}
                onPress={isResting ? pauseRestTimer : startRestTimer}
              >
                <Ionicons name={isResting ? "pause" : "play"} size={24} color="#3b82f6" />
                <Text style={styles.timerButtonText}>
                  {isResting ? "Pause" : "Start"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.timerButton}
                onPress={resetRestTimer}
              >
                <Ionicons name="refresh" size={24} color="#3b82f6" />
                <Text style={styles.timerButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timerInputContainer}>
              <Text style={styles.timerInputLabel}>Set Rest Time:</Text>
              <TextInput
                style={styles.timerInput}
                value={restTime.toString()}
                onChangeText={handleRestTimerChange}
                keyboardType="numeric"
              />
              <Text style={styles.timerInputUnit}>sec</Text>
            </View>
            
            <TouchableOpacity
              style={styles.closeTimerButton}
              onPress={closeRestTimer}
            >
              <Text style={styles.closeTimerButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutNameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  unitLabel: {
    marginRight: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  unitButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 2,
  },
  activeUnitButton: {
    backgroundColor: '#3b82f6',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activeUnitButtonText: {
    color: '#fff',
  },
  bodyweightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
    color: '#4b5563',
  },
  bodyweightInput: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: 80,
  },
  unitText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4b5563',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  exercisesContainer: {
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  exerciseHeader: {
    padding: 12,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  exerciseMuscleGroup: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  exerciseContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  setsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 8,
  },
  setHeaderCell: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setCell: {
    fontSize: 15,
  },
  setInput: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
  },
  setNumberCell: {
    width: 30,
    textAlign: 'center',
  },
  setDefaultCell: {
    flex: 1,
    marginHorizontal: 4,
  },
  setSmallCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  completedSet: {
    backgroundColor: '#34d399',
  },
  setActionsCell: {
    width: 40,
    alignItems: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  addSetButtonText: {
    marginLeft: 4,
    color: '#3b82f6',
    fontSize: 15,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  timerButtonText: {
    marginLeft: 4,
    color: '#3b82f6',
    fontSize: 15,
  },
  addExerciseButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addExerciseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    flex: 1,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalInfoText: {
    fontSize: 16,
    color: '#6b7280',
    marginVertical: 16,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  routineItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  routineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  routineDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 24,
  },
  timerModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  timerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  timerExerciseName: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 24,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  timerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerInputLabel: {
    fontSize: 16,
    color: '#4b5563',
    marginRight: 8,
  },
  timerInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 8,
    width: 60,
    textAlign: 'center',
  },
  timerInputUnit: {
    fontSize: 16,
    color: '#4b5563',
    marginLeft: 8,
  },
  closeTimerButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeTimerButtonText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: 'bold',
  },
});

export default WorkoutLogScreen; 