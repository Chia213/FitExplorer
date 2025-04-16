import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

/**
 * A cross-platform button component that works on both web and mobile
 */
const Button = ({ 
  title, 
  onPress, 
  color = '#3b82f6', // Default to FitExplorer blue
  textColor = 'white',
  style,
  disabled = false,
  ...props 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color },
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Web-specific styles
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.2s ease'
      },
      default: {}
    })
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  }
});

export default Button; 