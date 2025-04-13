import React from 'react';

/**
 * SafeImage component that fixes paths for production by converting /src/assets/ to /assets/
 */
const SafeImage = ({ src, alt, className, ...props }) => {
  const fixPath = (imagePath) => {
    if (!imagePath) return '/assets/placeholder-exercise.png';
    if (imagePath.startsWith('/src/assets/')) {
      return imagePath.replace('/src/assets/', '/assets/');
    }
    return imagePath;
  };

  return (
    <img 
      src={fixPath(src)} 
      alt={alt || ''} 
      className={className || ''}
      {...props}
    />
  );
};

export default SafeImage; 
