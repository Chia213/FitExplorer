import { Platform } from 'react-native';
import { isWeb } from './platform';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cross-platform storage utilities
 */

/**
 * Store data securely
 * @param {string} key - The key to store the data under
 * @param {string} value - The string value to store
 */
export const storeData = async (key, value) => {
  try {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await SecureStore.setItemAsync(key, value);
    } else {
      // Fallback for other platforms
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error('Error storing data:', error);
  }
};

/**
 * Retrieve stored data
 * @param {string} key - The key to retrieve data for
 * @returns {Promise<string|null>} The stored value or null
 */
export const retrieveData = async (key) => {
  try {
    if (isWeb) {
      return localStorage.getItem(key);
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return await SecureStore.getItemAsync(key);
    } else {
      // Fallback for other platforms
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
    return null;
  }
};

/**
 * Remove stored data
 * @param {string} key - The key to remove
 */
export const removeData = async (key) => {
  try {
    if (isWeb) {
      localStorage.removeItem(key);
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      await SecureStore.deleteItemAsync(key);
    } else {
      // Fallback for other platforms
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing data:', error);
  }
};

/**
 * Store an object as JSON securely (cross-platform)
 * @param {string} key - The key to store under
 * @param {Object} value - The object to store
 */
export const storeObjectSecure = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await storeData(key, jsonValue);
  } catch (error) {
    console.error('Error storing object:', error);
  }
};

/**
 * Retrieve and parse a stored JSON object (cross-platform)
 * @param {string} key - The key to retrieve
 * @returns {Promise<Object|null>} The parsed object or null
 */
export const retrieveObject = async (key) => {
  try {
    const jsonValue = await retrieveData(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving object:', error);
    return null;
  }
};

/**
 * AsyncStorage-specific utilities for standard (non-secure) storage
 */

// Store a string value
export const storeString = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error('Error storing string value:', error);
    return false;
  }
};

// Retrieve a string value
export const getString = async (key, defaultValue = null) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (error) {
    console.error('Error retrieving string value:', error);
    return defaultValue;
  }
};

// Store an object value (serialized as JSON)
export const storeObject = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error storing object value:', error);
    return false;
  }
};

// Retrieve an object value (parse from JSON)
export const getObject = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue !== null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error('Error retrieving object value:', error);
    return defaultValue;
  }
};

// Store a number value
export const storeNumber = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value.toString());
    return true;
  } catch (error) {
    console.error('Error storing number value:', error);
    return false;
  }
};

// Retrieve a number value
export const getNumber = async (key, defaultValue = 0) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? Number(value) : defaultValue;
  } catch (error) {
    console.error('Error retrieving number value:', error);
    return defaultValue;
  }
};

// Store a boolean value
export const storeBoolean = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value ? 'true' : 'false');
    return true;
  } catch (error) {
    console.error('Error storing boolean value:', error);
    return false;
  }
};

// Retrieve a boolean value
export const getBoolean = async (key, defaultValue = false) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return defaultValue;
    return value === 'true';
  } catch (error) {
    console.error('Error retrieving boolean value:', error);
    return defaultValue;
  }
};

// Remove a value
export const removeValue = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing value:', error);
    return false;
  }
};

// Clear all values (use with caution)
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// Get all keys
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

// Multi-get values by keys
export const getMultiple = async (keys, defaultValue = null) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.map(([key, value]) => [key, value !== null ? value : defaultValue]);
  } catch (error) {
    console.error('Error getting multiple values:', error);
    return keys.map(key => [key, defaultValue]);
  }
};

// Multi-store values (pairs of [key, value])
export const storeMultiple = async (keyValuePairs) => {
  try {
    await AsyncStorage.multiSet(keyValuePairs);
    return true;
  } catch (error) {
    console.error('Error storing multiple values:', error);
    return false;
  }
};

export default {
  // Cross-platform secure storage
  storeData,
  retrieveData,
  removeData,
  storeObjectSecure,
  retrieveObject,
  
  // AsyncStorage utilities
  storeString,
  getString,
  storeObject,
  getObject,
  storeNumber,
  getNumber,
  storeBoolean,
  getBoolean,
  removeValue,
  clearAll,
  getAllKeys,
  getMultiple,
  storeMultiple
}; 