import { useState, useEffect } from 'react';
import { fixAssetPath } from '../utils/exerciseAssetResolver';

/**
 * ExerciseImage component that properly handles GIF and image loading in both development and production.
 * This component uses a more sophisticated approach for asset loading that works well with Vite and Vercel.
 */
const ExerciseImage = ({ src, alt, className, onLoad, ...props }) => {
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  useEffect(() => {
    // Use the utility function from exerciseAssetResolver
    setImageSrc(fixAssetPath(src));
  }, [src]);
  
  const handleError = () => {
    console.error(`Failed to load image: ${src} (transformed to ${imageSrc})`);
    setError(true);
  };
  
  const handleLoad = (e) => {
    if (onLoad) onLoad(e);
  };
  
  return (
    <img 
      src={error ? '/assets/placeholder-exercise.png' : imageSrc}
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
