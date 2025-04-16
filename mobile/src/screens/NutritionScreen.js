import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import apiClient from '../api/client';

const MealCard = ({ meal, onPress }) => {
  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <View style={styles.mealTypeBadge}>
          <Text style={styles.mealTypeText}>{meal.type}</Text>
        </View>
      </View>
      
      <Text style={styles.mealDescription}>{meal.description}</Text>
      
      <View style={styles.mealMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="flame-outline" size={18} color="#4b5563" />
          <Text style={styles.metaText}>{meal.calories} cal</Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="restaurant-outline" size={18} color="#4b5563" />
          <Text style={styles.metaText}>{meal.servings} servings</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NutritionScreen = ({ navigation }) => {
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);
  
  const fetchMeals = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/nutrition/meals?date=${selectedDate}`);
      
      if (Array.isArray(response.data)) {
        setMeals(response.data);
        setError(null);
      } else {
        console.error("Unexpected response format from meals API:", response.data);
        setMeals([]);
        setError("Received invalid data format from server.");
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMealPress = (meal) => {
    console.log('Meal pressed:', meal.name);
    navigation.navigate('MealDetails', { mealId: meal.id });
  };
  
  const handleAddMeal = () => {
    console.log('Add new meal');
    navigation.navigate('AddMeal');
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
          onPress={fetchMeals}
          color="#10b981"
          style={styles.retryButton}
        />
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Meals</Text>
          <Button
            title="Add Meal"
            onPress={handleAddMeal}
            color="#10b981"
            style={styles.addButton}
          />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No meals found</Text>
          <Text style={styles.emptySubText}>Add your first meal to get started</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Meals</Text>
        <Button
          title="Add Meal"
          onPress={handleAddMeal}
          color="#10b981"
          style={styles.addButton}
        />
      </View>
      
      <FlatList
        data={meals}
        renderItem={({ item }) => (
          <MealCard 
            meal={item} 
            onPress={() => handleMealPress(item)} 
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchMeals}
        refreshing={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    paddingHorizontal: 12,
    height: 40,
  },
  listContainer: {
    paddingBottom: 20,
  },
  mealCard: {
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  mealTypeBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  mealTypeText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  mealDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  mealMeta: {
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
});

export default NutritionScreen; 