import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import apiClient from '../api/client';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddMealScreen = ({ navigation }) => {
  const [mealName, setMealName] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [foods, setFoods] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/nutrition/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
      Alert.alert('Error', 'Failed to search foods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = (food) => {
    const newFood = {
      ...food,
      quantity: 1,
      id: food.id || Date.now().toString(),
    };
    
    setFoods([...foods, newFood]);
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveFood = (index) => {
    const updatedFoods = [...foods];
    updatedFoods.splice(index, 1);
    setFoods(updatedFoods);
  };

  const handleUpdateFoodQuantity = (index, quantity) => {
    if (quantity <= 0) return;
    
    const updatedFoods = [...foods];
    updatedFoods[index].quantity = quantity;
    setFoods(updatedFoods);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateTotalNutrition = () => {
    return foods.reduce((totals, food) => ({
      calories: totals.calories + (food.calories * food.quantity),
      protein: totals.protein + (food.protein * food.quantity),
      carbs: totals.carbs + (food.carbs * food.quantity),
      fat: totals.fat + (food.fat * food.quantity),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSaveMeal = async () => {
    // Basic validation
    if (!mealName.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }
    
    if (foods.length === 0) {
      Alert.alert('Error', 'Please add at least one food to the meal');
      return;
    }
    
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const timeStr = formatTime(time);
      
      const mealData = {
        name: mealName,
        date: dateStr,
        time: timeStr,
        foods: foods.map(food => ({
          food_id: food.id,
          quantity: food.quantity,
        })),
        notes,
      };
      
      const response = await apiClient.post('/nutrition/meals', mealData);
      
      if (response.data) {
        Alert.alert('Success', 'Meal added successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isSearching ? (
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Search Foods</Text>
              <TouchableOpacity
                onPress={() => setIsSearching(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for foods..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Ionicons name="search" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <ActivityIndicator size="large" color="#10b981" style={styles.loader} />
            ) : (
              <ScrollView style={styles.resultsContainer}>
                {searchResults.length > 0 ? (
                  searchResults.map((food, index) => (
                    <TouchableOpacity
                      key={food.id || index}
                      style={styles.foodSearchResult}
                      onPress={() => handleAddFood(food)}
                    >
                      <View>
                        <Text style={styles.foodResultName}>{food.name}</Text>
                        <Text style={styles.foodResultServingSize}>
                          {food.serving_size || 'No serving size'}
                        </Text>
                      </View>
                      <Text style={styles.foodResultCalories}>
                        {food.calories} cal
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : searchQuery ? (
                  <Text style={styles.emptyText}>No foods found</Text>
                ) : (
                  <Text style={styles.emptyText}>Search for foods to add to your meal</Text>
                )}
              </ScrollView>
            )}
          </View>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Meal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter meal name"
                value={mealName}
                onChangeText={setMealName}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity 
                style={styles.timeSelector}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeText}>{formatTime(time)}</Text>
                <Ionicons name="time-outline" size={20} color="#6b7280" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>
            
            <View style={styles.foodsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Foods</Text>
                <Button
                  title="Add Food"
                  onPress={() => setIsSearching(true)}
                  color="#10b981"
                  style={styles.addButton}
                />
              </View>
              
              {foods.length > 0 ? (
                <View>
                  {foods.map((food, index) => (
                    <View key={food.id} style={styles.foodItem}>
                      <View style={styles.foodItemHeader}>
                        <Text style={styles.foodItemName}>{food.name}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveFood(index)}
                          style={styles.removeButton}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.foodControls}>
                        <View style={styles.quantityControl}>
                          <Text style={styles.quantityLabel}>Quantity</Text>
                          <View style={styles.quantityButtons}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleUpdateFoodQuantity(index, food.quantity - 0.5)}
                            >
                              <Text style={styles.quantityButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>{food.quantity}</Text>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => handleUpdateFoodQuantity(index, food.quantity + 0.5)}
                            >
                              <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        <View style={styles.foodNutrition}>
                          <Text style={styles.foodCalories}>
                            {Math.round(food.calories * food.quantity)} cal
                          </Text>
                          <View style={styles.foodMacros}>
                            <Text style={styles.foodMacro}>
                              P: {Math.round(food.protein * food.quantity)}g
                            </Text>
                            <Text style={styles.foodMacro}>
                              C: {Math.round(food.carbs * food.quantity)}g
                            </Text>
                            <Text style={styles.foodMacro}>
                              F: {Math.round(food.fat * food.quantity)}g
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                  
                  <View style={styles.nutritionSummary}>
                    <Text style={styles.summaryTitle}>Meal Total</Text>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Calories:</Text>
                      <Text style={styles.summaryValue}>{Math.round(totalNutrition.calories)} cal</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Protein:</Text>
                      <Text style={styles.summaryValue}>{Math.round(totalNutrition.protein)}g</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Carbs:</Text>
                      <Text style={styles.summaryValue}>{Math.round(totalNutrition.carbs)}g</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Fat:</Text>
                      <Text style={styles.summaryValue}>{Math.round(totalNutrition.fat)}g</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyText}>No foods added yet</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any notes about this meal"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
            
            <Button
              title={isLoading ? 'Saving...' : 'Save Meal'}
              onPress={handleSaveMeal}
              color="#10b981"
              style={styles.saveButton}
              disabled={isLoading}
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
  formGroup: {
    marginBottom: 20,
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
  timeSelector: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#111827',
  },
  foodsSection: {
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
  foodItem: {
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
  foodItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  foodControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  foodNutrition: {
    alignItems: 'flex-end',
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
    marginBottom: 4,
  },
  foodMacros: {
    flexDirection: 'row',
  },
  foodMacro: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  nutritionSummary: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    marginTop: 10,
  },
  searchContainer: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 40,
  },
  resultsContainer: {
    flex: 1,
    maxHeight: 500,
  },
  foodSearchResult: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  foodResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  foodResultServingSize: {
    fontSize: 14,
    color: '#6b7280',
  },
  foodResultCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default AddMealScreen; 