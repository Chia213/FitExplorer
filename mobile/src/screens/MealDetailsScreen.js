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

const MacroItem = ({ label, value, color, unit = 'g' }) => (
  <View style={styles.macroItem}>
    <View style={[styles.macroIcon, { backgroundColor: color }]}>
      <Text style={styles.macroIconText}>{label.charAt(0).toUpperCase()}</Text>
    </View>
    <Text style={styles.macroLabel}>{label}</Text>
    <Text style={styles.macroValue}>{value}{unit}</Text>
  </View>
);

const MealDetailsScreen = ({ route, navigation }) => {
  const { mealId } = route.params;
  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMealDetails();
  }, [mealId]);

  const fetchMealDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/nutrition/meals/${mealId}`);
      if (response.data) {
        setMeal(response.data);
        setError(null);
      } else {
        throw new Error('No meal data received');
      }
    } catch (err) {
      console.error('Error fetching meal details:', err);
      setError('Failed to load meal details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalNutrition = (foods) => {
    return foods.reduce((totals, food) => {
      const quantity = food.quantity || 1;
      return {
        calories: totals.calories + (food.calories * quantity || 0),
        protein: totals.protein + (food.protein * quantity || 0),
        carbs: totals.carbs + (food.carbs * quantity || 0),
        fat: totals.fat + (food.fat * quantity || 0),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleEditMeal = () => {
    // Navigate to edit meal screen
    console.log('Edit meal:', meal?.name);
    // navigation.navigate('EditMeal', { mealId });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Try Again"
          onPress={fetchMealDetails}
          color="#10b981"
          style={styles.retryButton}
        />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Meal not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          color="#10b981"
          style={styles.retryButton}
        />
      </View>
    );
  }

  const totalNutrition = calculateTotalNutrition(meal.foods || []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <View style={styles.mealTime}>
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text style={styles.mealTimeText}>{meal.time || 'No time specified'}</Text>
        </View>
      </View>

      <View style={styles.nutritionCard}>
        <Text style={styles.sectionTitle}>Nutrition Summary</Text>
        
        <View style={styles.calorieDisplay}>
          <Text style={styles.calorieValue}>{Math.round(totalNutrition.calories)}</Text>
          <Text style={styles.calorieLabel}>calories</Text>
        </View>
        
        <View style={styles.macrosContainer}>
          <MacroItem 
            label="Protein" 
            value={Math.round(totalNutrition.protein)} 
            color="#ef4444" 
          />
          <MacroItem 
            label="Carbs" 
            value={Math.round(totalNutrition.carbs)} 
            color="#3b82f6" 
          />
          <MacroItem 
            label="Fat" 
            value={Math.round(totalNutrition.fat)} 
            color="#f59e0b" 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Foods</Text>
        {meal.foods && meal.foods.length > 0 ? (
          meal.foods.map((food, index) => (
            <View key={index} style={styles.foodItem}>
              <View style={styles.foodHeader}>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodQuantity}>
                  {food.quantity || 1} {food.serving_size || 'serving'}
                </Text>
              </View>
              
              <View style={styles.foodNutrition}>
                <Text style={styles.foodCalories}>
                  {Math.round(food.calories * (food.quantity || 1))} cal
                </Text>
                <View style={styles.foodMacros}>
                  <Text style={styles.foodMacro}>
                    P: {Math.round(food.protein * (food.quantity || 1))}g
                  </Text>
                  <Text style={styles.foodMacro}>
                    C: {Math.round(food.carbs * (food.quantity || 1))}g
                  </Text>
                  <Text style={styles.foodMacro}>
                    F: {Math.round(food.fat * (food.quantity || 1))}g
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No foods in this meal</Text>
        )}
      </View>

      {meal.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{meal.notes}</Text>
        </View>
      )}

      <Button
        title="Edit Meal"
        onPress={handleEditMeal}
        color="#10b981"
        style={styles.editButton}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  mealTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTimeText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  nutritionCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  calorieDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroIconText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  macroLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  foodItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  foodQuantity: {
    fontSize: 14,
    color: '#6b7280',
  },
  foodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  foodMacros: {
    flexDirection: 'row',
  },
  foodMacro: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 10,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginVertical: 20,
  },
  editButton: {
    margin: 16,
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

export default MealDetailsScreen; 