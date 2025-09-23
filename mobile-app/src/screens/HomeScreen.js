import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WorkoutCard from '../components/WorkoutCard';
import NotificationService from '../services/NotificationService';
import HealthKitService from '../services/HealthKitService';
import OfflineStorageService from '../services/OfflineStorageService';
import SharingService from '../services/SharingService';

const HomeScreen = ({ navigation }) => {
  const [workouts, setWorkouts] = useState([]);
  const [healthData, setHealthData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    initializeApp();
    loadData();
  }, []);

  const initializeApp = async () => {
    try {
      // Request notification permissions
      await NotificationService.registerForPushNotifications();
      
      // Schedule default notifications
      await NotificationService.scheduleDailyWorkoutReminder();
      await NotificationService.scheduleProgressReminder();
      
      // Request HealthKit permissions
      const healthPermissions = await HealthKitService.requestPermissions();
      if (healthPermissions) {
        loadHealthData();
      }
      
      // Initialize offline storage
      await OfflineStorageService.initializeDatabase();
      
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const loadData = async () => {
    try {
      // Load workouts from offline storage
      const savedWorkouts = await OfflineStorageService.getWorkouts();
      setWorkouts(savedWorkouts);
      
      // Load health data
      await loadHealthData();
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadHealthData = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      const steps = await HealthKitService.readSteps(startOfDay, endOfDay);
      const heartRate = await HealthKitService.readHeartRate(startOfDay, endOfDay);
      
      setHealthData({
        steps: steps?.value || 0,
        heartRate: heartRate?.value || 0,
      });
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartWorkout = (workout) => {
    navigation.navigate('WorkoutScreen', { workout });
  };

  const handleShareWorkout = async (workout) => {
    const success = await SharingService.shareWorkout(workout);
    if (success) {
      Alert.alert('Success', 'Workout shared successfully!');
    } else {
      Alert.alert('Error', 'Failed to share workout');
    }
  };

  const handleCreateWorkout = () => {
    navigation.navigate('CreateWorkoutScreen');
  };

  const handleViewProgress = () => {
    navigation.navigate('ProgressScreen');
  };

  const handleViewProfile = () => {
    navigation.navigate('ProfileScreen');
  };

  const handleSyncData = async () => {
    try {
      // Sync unsynced workouts with server
      const unsyncedWorkouts = await OfflineStorageService.getUnsyncedWorkouts();
      
      for (const workout of unsyncedWorkouts) {
        // Here you would sync with your backend
        console.log('Syncing workout:', workout.id);
        await OfflineStorageService.markWorkoutAsSynced(workout.id);
      }
      
      Alert.alert('Success', 'Data synced successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back! 💪</Text>
        <Text style={styles.subtitle}>Ready for your next workout?</Text>
      </View>

      {/* Health Data Summary */}
      <View style={styles.healthSummary}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
        <View style={styles.healthCards}>
          <View style={styles.healthCard}>
            <Ionicons name="walk-outline" size={24} color="#007AFF" />
            <Text style={styles.healthValue}>{healthData.steps.toLocaleString()}</Text>
            <Text style={styles.healthLabel}>Steps</Text>
          </View>
          
          <View style={styles.healthCard}>
            <Ionicons name="heart-outline" size={24} color="#FF3B30" />
            <Text style={styles.healthValue}>{healthData.heartRate}</Text>
            <Text style={styles.healthLabel}>BPM</Text>
          </View>
          
          <View style={styles.healthCard}>
            <Ionicons name="fitness-outline" size={24} color="#34C759" />
            <Text style={styles.healthValue}>{workouts.length}</Text>
            <Text style={styles.healthLabel}>Workouts</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCreateWorkout}>
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Create Workout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewProgress}>
          <Ionicons name="stats-chart-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>View Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleViewProfile}>
          <Ionicons name="person-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Workouts */}
      <View style={styles.workoutsSection}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No workouts yet</Text>
            <Text style={styles.emptySubtext}>Create your first workout to get started!</Text>
          </View>
        ) : (
          workouts.slice(0, 5).map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onPress={() => handleStartWorkout(workout)}
              onShare={handleShareWorkout}
              onStart={handleStartWorkout}
            />
          ))
        )}
      </View>

      {/* Offline Indicator */}
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="cloud-offline-outline" size={16} color="#FF9500" />
          <Text style={styles.offlineText}>Working offline - data will sync when connected</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  healthSummary: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  healthCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  healthValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 8,
  },
  healthLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
    textAlign: 'center',
  },
  workoutsSection: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFF3CD',
    margin: 16,
    borderRadius: 8,
  },
  offlineText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#856404',
  },
});

export default HomeScreen;
