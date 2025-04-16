import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import NutritionScreen from './src/screens/NutritionScreen';
import WorkoutDetailsScreen from './src/screens/WorkoutDetailsScreen';
import CreateWorkoutScreen from './src/screens/CreateWorkoutScreen';
import MealDetailsScreen from './src/screens/MealDetailsScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import WorkoutLogScreen from './src/screens/WorkoutLogScreen';

// Import contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Create navigation stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const WorkoutStack = createNativeStackNavigator();
const NutritionStack = createNativeStackNavigator();

// Workouts Stack Navigator
function WorkoutsStackNavigator() {
  return (
    <WorkoutStack.Navigator>
      <WorkoutStack.Screen 
        name="WorkoutsList" 
        component={WorkoutsScreen} 
        options={{ headerShown: false }}
      />
      <WorkoutStack.Screen 
        name="WorkoutDetails" 
        component={WorkoutDetailsScreen}
        options={{ title: 'Workout Details' }}
      />
      <WorkoutStack.Screen 
        name="CreateWorkout" 
        component={CreateWorkoutScreen}
        options={{ title: 'Create Workout' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutLog" 
        component={WorkoutLogScreen}
        options={{ title: 'Log Workout' }}
      />
    </WorkoutStack.Navigator>
  );
}

// Nutrition Stack Navigator
function NutritionStackNavigator() {
  return (
    <NutritionStack.Navigator>
      <NutritionStack.Screen 
        name="MealsList" 
        component={NutritionScreen} 
        options={{ headerShown: false }}
      />
      <NutritionStack.Screen 
        name="MealDetails" 
        component={MealDetailsScreen}
        options={{ title: 'Meal Details' }}
      />
      <NutritionStack.Screen 
        name="AddMeal" 
        component={AddMealScreen}
        options={{ title: 'Add Meal' }}
      />
    </NutritionStack.Navigator>
  );
}

// Tab Navigator for authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workouts') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'nutrition' : 'nutrition-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          headerShown: true,
          title: 'FitExplorer',
          headerTitleStyle: {
            fontWeight: 'bold',
          }
        }} 
      />
      <Tab.Screen 
        name="Workouts" 
        component={WorkoutsStackNavigator} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionStackNavigator} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
}

// Authentication navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Root navigator that handles authenticated vs unauthenticated routes
function RootNavigator() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading screen while checking authentication status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator>
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </AuthProvider>
  );
}
