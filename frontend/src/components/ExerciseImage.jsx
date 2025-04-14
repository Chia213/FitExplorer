import { useState } from 'react';

/**
 * ExerciseImage component that properly handles GIF and image loading in both development and production.
 * This component uses a more sophisticated approach for asset loading that works well with Vite and Vercel.
 */
const ExerciseImage = ({ src, alt, className, onLoad, ...props }) => {
  const [error, setError] = useState(false);
  
  // Function to properly transform paths for production
  const getProperImagePath = (path) => {
    if (!path) return '/assets/placeholder-exercise.png';
    
    // For paths starting with '/src/assets/'
    if (path.startsWith('/src/assets/')) {
      // Simply remove the /src prefix which works with our vite.config.js alias
      return path.replace('/src/assets/', '/assets/');
    }
    
    return path;
  };
  
  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setError(true);
  };
  
  const handleLoad = (e) => {
    if (onLoad) onLoad(e);
  };
  
  return (
    <img 
      src={error ? '/assets/placeholder-exercise.png' : getProperImagePath(src)}
      alt={alt || ''} 
      className={className || ''}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy" // Add lazy loading for better performance
      {...props}
    />
  );
};

export default ExerciseImage; 
