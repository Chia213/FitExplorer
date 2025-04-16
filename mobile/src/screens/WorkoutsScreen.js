import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { isWeb } from '../utils/platform';
import apiClient from '../api/client';

const WorkoutCard = ({ workout, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={onPress}
    >
      <View style={styles.workoutHeader}>
        <Text style={styles.workoutName}>{workout.name}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{workout.level}</Text>
        </View>
      </View>
      
      <Text style={styles.workoutDescription}>{workout.description}</Text>
      
      <View style={styles.workoutMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={20} color="#4b5563" />
          <Text style={styles.metaText}>{workout.duration} min</Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="barbell-outline" size={20} color="#4b5563" />
          <Text style={styles.metaText}>{workout.exercises} exercises</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const workoutSections = [
  { id: 'routines', title: 'My Routines', icon: 'list-outline' },
  { id: 'generator', title: 'Workout Generator', icon: 'flash-outline' },
  { id: 'ai-generator', title: 'AI Generator', icon: 'pulse-outline' },
  { id: 'log', title: 'Workout Log', icon: 'create-outline' },
  { id: 'history', title: 'History', icon: 'time-outline' },
];

const WorkoutsScreen = ({ navigation }) => {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('routines');
  
  useEffect(() => {
    fetchWorkouts();
  }, []);
  
  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/workout-routines');
      
      if (response.data) {
        setWorkouts(response.data);
        setError(null);
      } else {
        throw new Error('No workout data received');
      }
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workouts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWorkoutPress = (workout) => {
    console.log('Workout pressed:', workout.name);
    navigation.navigate('WorkoutDetails', { workoutId: workout.id });
  };
  
  const handleNewWorkout = () => {
    console.log('Create new workout');
    navigation.navigate('CreateWorkout');
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'routines':
        return renderRoutines();
      case 'generator':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.comingSoonText}>Workout Generator</Text>
            <Text style={styles.emptySubText}>This feature is coming soon!</Text>
          </View>
        );
      case 'ai-generator':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.comingSoonText}>AI Workout Generator</Text>
            <Text style={styles.emptySubText}>This feature is coming soon!</Text>
          </View>
        );
      case 'log':
        return (
          <View style={styles.centerContainer}>
            <Button
              title="Start Logging Workout"
              onPress={() => navigation.navigate('WorkoutLog')}
              style={styles.logButton}
            />
            <Text style={styles.logText}>Track your workout progress</Text>
          </View>
        );
      case 'history':
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.comingSoonText}>Workout History</Text>
            <Text style={styles.emptySubText}>This feature is coming soon!</Text>
          </View>
        );
      default:
        return renderRoutines();
    }
  };

  const renderRoutines = () => {
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
            onPress={fetchWorkouts}
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (workouts.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No workouts found</Text>
          <Text style={styles.emptySubText}>Create your first workout to get started</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={workouts}
        renderItem={({ item }) => (
          <WorkoutCard 
            workout={item} 
            onPress={() => handleWorkoutPress(item)} 
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchWorkouts}
        refreshing={isLoading}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        {activeSection === 'routines' && (
          <Button
            title="New Workout"
            onPress={handleNewWorkout}
            style={styles.newButton}
          />
        )}
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
        {workoutSections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[
              styles.tabButton,
              activeSection === section.id && styles.activeTabButton
            ]}
            onPress={() => setActiveSection(section.id)}
          >
            <Ionicons 
              name={section.icon} 
              size={18} 
              color={activeSection === section.id ? '#ffffff' : '#4b5563'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeSection === section.id && styles.activeTabText
              ]}
            >
              {section.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.contentContainer}>
        {renderSectionContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  newButton: {
    paddingHorizontal: 12,
    height: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  levelBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  levelText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '500',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4b5563',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  tabScrollView: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabContainer: {
    paddingHorizontal: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTabButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#ffffff',
  },
  logButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 12,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default WorkoutsScreen; 