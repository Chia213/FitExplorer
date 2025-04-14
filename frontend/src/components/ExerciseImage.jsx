import { useState, useEffect } from 'react';
import { fixAssetPath } from '../utils/exerciseAssetResolver';

/**
 * ExerciseImage component that properly handles GIF and image loading in both development and production.
 * This component uses a more sophisticated approach for asset loading that works well with Vite and Vercel.
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
    if (fallbackAttempts >= 3) {
      setError(true);
      return;
    }
    
    // If image fails to load with the current path, try fallbacks
    if (src && src.includes('/exercises/')) {
      const pathParts = src.split('/');
      const exerciseFile = pathParts[pathParts.length - 1]; // Get the filename
      
      let fallbackPath;
      
      // Try different fallback paths based on the attempt number
      if (fallbackAttempts === 0) {
        // Try direct filename (flattened structure)
        fallbackPath = `/assets/exercises/${exerciseFile}`;
      } else if (fallbackAttempts === 1) {
        // If src contains 'male' or 'female', try with gender subfolder
        const gender = src.includes('/male/') ? 'male' : 'female';
        fallbackPath = `/assets/exercises/${gender}/${exerciseFile}`;
      } else {
        // Try without the 'src' prefix if it still has it
        fallbackPath = src.replace('/src/', '/');
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
