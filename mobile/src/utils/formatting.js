/**
 * Formatting utility functions for consistent display of data across the app
 */

// Number formatting 
export const formatNumber = (number, options = {}) => {
  const { 
    decimals = 0, 
    decimalSeparator = '.', 
    thousandsSeparator = ',',
    prefix = '',
    suffix = '' 
  } = options;
  
  if (number === null || number === undefined || isNaN(number)) {
    return '';
  }
  
  const num = Number(number);
  const fixedNumber = num.toFixed(decimals);
  const [integerPart, decimalPart] = fixedNumber.split('.');
  
  // Format integer part with thousands separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // Combine with decimal part if needed
  const formattedNumber = decimals > 0 
    ? `${formattedInteger}${decimalSeparator}${decimalPart}` 
    : formattedInteger;
    
  return `${prefix}${formattedNumber}${suffix}`;
};

// Currency formatting
export const formatCurrency = (amount, options = {}) => {
  const { 
    currency = 'USD', 
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;
  
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(amount);
  } catch (error) {
    // Fallback if Intl is not supported
    return `${currency} ${formatNumber(amount, { decimals: minimumFractionDigits })}`;
  }
};

// Percentage formatting
export const formatPercentage = (value, options = {}) => {
  const { 
    decimals = 1, 
    includeSymbol = true,
    multiplier = 1 // Use 100 if value is already in decimal (0.1 = 10%)
  } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }
  
  const percentage = value * multiplier;
  const formatted = formatNumber(percentage, { decimals });
  return includeSymbol ? `${formatted}%` : formatted;
};

// Date formatting
export const formatDate = (date, options = {}) => {
  const { 
    format = 'short', // 'short', 'medium', 'long', 'full', 'numeric', 'custom'
    locale = 'en-US',
    customFormat = null // For custom formats
  } = options;
  
  if (!date) return '';
  
  // Convert to Date object if string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return '';
  }
  
  // For custom format, implement a date formatting library or your own logic
  if (format === 'custom' && customFormat) {
    // This is a placeholder - implement your own custom formatter
    return customFormat.replace(/YYYY/g, dateObj.getFullYear())
      .replace(/MM/g, String(dateObj.getMonth() + 1).padStart(2, '0'))
      .replace(/DD/g, String(dateObj.getDate()).padStart(2, '0'));
  }
  
  // Use Intl for standard formats
  try {
    const formatOptions = {};
    
    if (format === 'short') {
      formatOptions.year = 'numeric';
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
    } else if (format === 'medium') {
      formatOptions.year = 'numeric';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
    } else if (format === 'long') {
      formatOptions.year = 'numeric';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      formatOptions.weekday = 'long';
    } else if (format === 'full') {
      formatOptions.year = 'numeric';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      formatOptions.weekday = 'long';
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
    } else if (format === 'numeric') {
      formatOptions.year = 'numeric';
      formatOptions.month = '2-digit';
      formatOptions.day = '2-digit';
    }
    
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    // Fallback if Intl is not supported
    return dateObj.toLocaleDateString();
  }
};

// Time formatting
export const formatTime = (date, options = {}) => {
  const { 
    format = '24h', // '12h', '24h', 'short', 'full'
    includeSeconds = false,
    locale = 'en-US'
  } = options;
  
  if (!date) return '';
  
  // Convert to Date object if string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj)) {
    return '';
  }
  
  try {
    const formatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };
    
    if (includeSeconds) {
      formatOptions.second = '2-digit';
    }
    
    if (format === '12h') {
      formatOptions.hour12 = true;
    } else if (format === '24h') {
      formatOptions.hour12 = false;
    } else if (format === 'short') {
      formatOptions.hour12 = true;
      delete formatOptions.second;
    } else if (format === 'full') {
      formatOptions.hour12 = true;
      formatOptions.second = '2-digit';
    }
    
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    // Fallback if Intl is not supported
    return dateObj.toLocaleTimeString();
  }
};

// Format distance/relative time (e.g., "2 hours ago", "in 5 minutes")
export const formatRelativeTime = (date, options = {}) => {
  const { 
    now = new Date(),
    locale = 'en-US',
    style = 'long' // 'long', 'short', 'narrow'
  } = options;
  
  if (!date) return '';
  
  // Convert to Date object if string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const nowObj = typeof now === 'string' ? new Date(now) : now;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj) || 
      !(nowObj instanceof Date) || isNaN(nowObj)) {
    return '';
  }
  
  const diffMs = dateObj.getTime() - nowObj.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { style });
    
    if (Math.abs(diffSec) < 60) {
      return rtf.format(diffSec, 'second');
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, 'minute');
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, 'hour');
    } else if (Math.abs(diffDay) < 7) {
      return rtf.format(diffDay, 'day');
    } else if (Math.abs(diffWeek) < 4) {
      return rtf.format(diffWeek, 'week');
    } else if (Math.abs(diffMonth) < 12) {
      return rtf.format(diffMonth, 'month');
    } else {
      return rtf.format(diffYear, 'year');
    }
  } catch (error) {
    // Fallback if RelativeTimeFormat is not supported
    if (diffMs < 0) {
      const absValue = Math.abs(diffMs);
      if (absValue < 60000) return 'just now';
      if (absValue < 3600000) return `${Math.round(absValue / 60000)} minutes ago`;
      if (absValue < 86400000) return `${Math.round(absValue / 3600000)} hours ago`;
      if (absValue < 604800000) return `${Math.round(absValue / 86400000)} days ago`;
      if (absValue < 2629800000) return `${Math.round(absValue / 604800000)} weeks ago`;
      if (absValue < 31557600000) return `${Math.round(absValue / 2629800000)} months ago`;
      return `${Math.round(absValue / 31557600000)} years ago`;
    } else {
      if (diffMs < 60000) return 'in a moment';
      if (diffMs < 3600000) return `in ${Math.round(diffMs / 60000)} minutes`;
      if (diffMs < 86400000) return `in ${Math.round(diffMs / 3600000)} hours`;
      if (diffMs < 604800000) return `in ${Math.round(diffMs / 86400000)} days`;
      if (diffMs < 2629800000) return `in ${Math.round(diffMs / 604800000)} weeks`;
      if (diffMs < 31557600000) return `in ${Math.round(diffMs / 2629800000)} months`;
      return `in ${Math.round(diffMs / 31557600000)} years`;
    }
  }
};

// Weight formatting (for fitness app)
export const formatWeight = (weight, options = {}) => {
  const { 
    unit = 'kg', // 'kg' or 'lb'
    decimals = unit === 'kg' ? 1 : 0,
    includeUnit = true
  } = options;
  
  if (weight === null || weight === undefined || isNaN(weight)) {
    return '';
  }
  
  const formatted = formatNumber(weight, { decimals });
  return includeUnit ? `${formatted} ${unit}` : formatted;
};

// Distance formatting (for fitness app)
export const formatDistance = (distance, options = {}) => {
  const { 
    unit = 'km', // 'km', 'm', 'mi', 'ft'
    decimals = unit === 'km' || unit === 'mi' ? 2 : 0,
    includeUnit = true
  } = options;
  
  if (distance === null || distance === undefined || isNaN(distance)) {
    return '';
  }
  
  const formatted = formatNumber(distance, { decimals });
  return includeUnit ? `${formatted} ${unit}` : formatted;
};

// Format duration in seconds to HH:MM:SS or MM:SS
export const formatDuration = (seconds, options = {}) => {
  const { 
    format = 'hh:mm:ss', // 'hh:mm:ss', 'mm:ss', 'hh:mm', 'verbose'
    padHours = true,
    padMinutes = true,
    padSeconds = true
  } = options;
  
  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return '';
  }
  
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  
  if (format === 'verbose') {
    const parts = [];
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    if (remainingSeconds > 0 || parts.length === 0) {
      parts.push(`${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`);
    }
    return parts.join(' ');
  }
  
  const paddedHours = padHours ? hours.toString().padStart(2, '0') : hours;
  const paddedMinutes = padMinutes ? minutes.toString().padStart(2, '0') : minutes;
  const paddedSeconds = padSeconds ? remainingSeconds.toString().padStart(2, '0') : remainingSeconds;
  
  if (format === 'mm:ss') {
    return `${hours * 60 + minutes}:${paddedSeconds}`;
  } else if (format === 'hh:mm') {
    return `${paddedHours}:${paddedMinutes}`;
  } else {
    // Default hh:mm:ss
    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
};

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatTime,
  formatRelativeTime,
  formatWeight,
  formatDistance,
  formatDuration
}; 