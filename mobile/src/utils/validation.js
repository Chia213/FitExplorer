/**
 * Validation utility functions
 */

/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a password
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid flag and issues array
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;
  
  const issues = [];
  
  if (!password) {
    issues.push('Password is required');
    return { isValid: false, issues };
  }
  
  if (password.length < minLength) {
    issues.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    issues.push('Password must contain at least one number');
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('Password must contain at least one special character');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Check if passwords match
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} Whether the passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validates a username
 * @param {string} username - The username to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid flag and issues array
 */
export const validateUsername = (username, options = {}) => {
  const {
    minLength = 3,
    maxLength = 20,
    allowSpaces = false,
    allowSpecialChars = false
  } = options;
  
  const issues = [];
  
  if (!username) {
    issues.push('Username is required');
    return { isValid: false, issues };
  }
  
  if (username.length < minLength) {
    issues.push(`Username must be at least ${minLength} characters long`);
  }
  
  if (username.length > maxLength) {
    issues.push(`Username must be no more than ${maxLength} characters long`);
  }
  
  if (!allowSpaces && /\s/.test(username)) {
    issues.push('Username cannot contain spaces');
  }
  
  if (!allowSpecialChars && /[^a-zA-Z0-9_\s]/.test(username)) {
    issues.push('Username can only contain letters, numbers, and underscores');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Validate a URL
 * @param {string} url - The URL to validate
 * @returns {boolean} Whether the URL is valid
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  
  // Basic phone number regex (international format)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Validate that a string is a number within range
 * @param {string|number} value - The value to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateNumber = (value, options = {}) => {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    isInteger = false
  } = options;
  
  const num = Number(value);
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Must be a number' };
  }
  
  if (isInteger && !Number.isInteger(num)) {
    return { isValid: false, message: 'Must be an integer' };
  }
  
  if (num < min) {
    return { isValid: false, message: `Must be at least ${min}` };
  }
  
  if (num > max) {
    return { isValid: false, message: `Must be no more than ${max}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate a date
 * @param {Date|string} date - The date to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateDate = (date, options = {}) => {
  const {
    minDate,
    maxDate,
    required = false
  } = options;
  
  if (!date && !required) {
    return { isValid: true, message: '' };
  }
  
  if (!date && required) {
    return { isValid: false, message: 'Date is required' };
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: 'Invalid date' };
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    return { isValid: false, message: `Date must be on or after ${new Date(minDate).toLocaleDateString()}` };
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    return { isValid: false, message: `Date must be on or before ${new Date(maxDate).toLocaleDateString()}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate required fields in an object
 * @param {Object} values - The object with values to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} Object with missing fields array and isValid flag
 */
export const validateRequired = (values, requiredFields) => {
  const missingFields = requiredFields.filter(field => {
    const value = values[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

export default {
  isValidEmail,
  validatePassword,
  passwordsMatch,
  validateUsername,
  isValidUrl,
  isValidPhone,
  validateNumber,
  validateDate,
  validateRequired
}; 