import { useState, useEffect } from 'react';
import { fixAssetPath } from '../utils/exerciseAssetResolver';

/**
 * ExerciseImage component that properly handles GIF and image loading in both development and production.
 * This component uses a sophisticated approach for asset loading that works with Vite and Vercel.
 */
const ExerciseImage = ({ src, alt, className, onLoad, ...props }) => {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [fallbackAttempts, setFallbackAttempts] = useState(0);
  
  useEffect(() => {
    // Reset error state when source changes
    setError(false);
    setFallbackAttempts(0);
    
    // Log the original source for debugging
    console.log(`Original image source: ${src}`);
    
    // First try the fixed path
    const fixedPath = fixAssetPath(src);
    console.log(`Starting with fixed path: ${fixedPath}`);
    setImageSrc(fixedPath);
  }, [src]);
  
  const handleError = () => {
    console.error(`Failed to load image: ${src} (transformed to ${imageSrc})`);
    
    // Prevent infinite fallback attempts
    if (fallbackAttempts >= 6) {
      console.warn(`All fallback attempts failed for ${src}, using placeholder`);
      setError(true);
      return;
    }
    
    // Extract filename regardless of path structure
    const pathParts = src.split('/');
    const exerciseFile = pathParts[pathParts.length - 1];
    
    // Handle all exercise files with a general approach
    if (exerciseFile.endsWith('.gif') || exerciseFile.endsWith('.png')) {
      // Determine if it has gender info
      const hasGender = src.includes('/male/') || src.includes('/female/');
      const gender = src.includes('/male/') ? 'male' : 'female';
      
      let fallbackPath;
      
      // Comprehensive fallback strategy
      switch (fallbackAttempts) {
        case 0:
          // Try with gender path 
          fallbackPath = `/assets/exercises/${gender}/${exerciseFile}`;
          break;
        case 1:
          // Try without gender path
          fallbackPath = `/assets/exercises/${exerciseFile}`;
          break;
        case 2:
          // Try with opposite gender as a desperate attempt
          const oppositeGender = gender === 'male' ? 'female' : 'male';
          fallbackPath = `/assets/exercises/${oppositeGender}/${exerciseFile}`;
          break;
        case 3:
          // Try without the 'src' prefix
          fallbackPath = src.replace('/src/', '/');
          break;
        case 4:
          // Try with static path
          fallbackPath = `/static/exercises/${gender}/${exerciseFile}`;
          break;
        case 5:
          // Last resort - try directly at root
          fallbackPath = `/${exerciseFile}`;
          break;
        default:
          // If all else fails, use placeholder
          setError(true);
          return;
      }
      
      console.log(`Trying fallback path (attempt ${fallbackAttempts + 1}): ${fallbackPath}`);
      
      setFallbackAttempts(prev => prev + 1);
      setImageSrc(fallbackPath);
      return; // Give the fallback a chance to load
    }
    
    setError(true);
  };
  
  // If we've exhausted all fallback attempts, show the placeholder
  if (error) {
    return (
      <img
        src="/assets/placeholder-exercise.png"
        alt={alt || 'Exercise demonstration not available'}
        className={className}
        onLoad={onLoad}
        {...props}
      />
    );
  }
  
  return (
    <img
      src={imageSrc}
      alt={alt || 'Exercise demonstration'}
      className={className}
      onError={handleError}
      onLoad={onLoad}
      {...props}
    />
  );
};

export default ExerciseImage; 
