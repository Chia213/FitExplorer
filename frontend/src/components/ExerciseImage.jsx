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
    
    // First try the fixed path
    setImageSrc(fixAssetPath(src));
  }, [src]);
  
  const handleError = () => {
    console.error(`Failed to load image: ${src} (transformed to ${imageSrc})`);
    
    // Prevent infinite fallback attempts
    if (fallbackAttempts >= 5) {
      setError(true);
      return;
    }
    
    // Handle all exercise files with a general approach
    if (src && src.includes('/exercises/')) {
      const pathParts = src.split('/');
      const exerciseFile = pathParts[pathParts.length - 1]; // Get the filename
      
      // Determine if it has gender info
      const hasGender = src.includes('/male/') || src.includes('/female/');
      const gender = src.includes('/male/') ? 'male' : 'female';
      
      let fallbackPath;
      
      // Try different fallback paths based on the attempt number
      switch (fallbackAttempts) {
        case 0:
          // Try with gender path if appropriate
          fallbackPath = hasGender 
            ? `/assets/exercises/${gender}/${exerciseFile}`
            : `/assets/exercises/${exerciseFile}`;
          break;
        case 1:
          // Try the opposite (with or without gender path)
          fallbackPath = hasGender 
            ? `/assets/exercises/${exerciseFile}` 
            : `/assets/exercises/male/${exerciseFile}`;
          break;
        case 2:
          // Try without the 'src' prefix if it had it
          fallbackPath = src.replace('/src/', '/');
          break;
        case 3:
          // Try with static path
          fallbackPath = hasGender
            ? `/static/exercises/${gender}/${exerciseFile}`
            : `/static/exercises/${exerciseFile}`;
          break;
        default:
          // Try directly at root
          fallbackPath = `/${exerciseFile}`;
      }
      
      console.log(`Trying fallback path (attempt ${fallbackAttempts + 1}): ${fallbackPath}`);
      
      setFallbackAttempts(prev => prev + 1);
      setImageSrc(fallbackPath);
      return; // Give the fallback a chance to load
    }
    
    setError(true);
  };
  
  const handleLoad = (e) => {
    console.log(`Successfully loaded image: ${imageSrc}`);
    if (onLoad) onLoad(e);
  };
  
  return (
    <img 
      src={error ? '/assets/placeholder-exercise.png' : imageSrc}
      alt={alt || ''} 
      className={className || ''}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
};

export default ExerciseImage; 
