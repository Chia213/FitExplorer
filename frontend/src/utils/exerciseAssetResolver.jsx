export function resolveExercisePath(exerciseName, type = null) {
  // Normalize exercise name (convert to lowercase, replace spaces with hyphens)
  const normalizedName = exerciseName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Potential exercise type folders
  const exerciseTypes = [
    "bodyweight",
    "barbell",
    "dumbbell",
    "machine",
    "cable",
    "kettlebell",
  ];

  // Fix paths for production by removing '/src' prefix if it exists
  const fixPath = (path) => {
    if (path.startsWith('/src/assets/')) {
      return path.replace('/src/assets/', '/assets/');
    }
    return path;
  };

  // If a specific type is provided, prioritize that
  if (type && exerciseTypes.includes(type)) {
    const specificPath = `/assets/exercises/${type}/${normalizedName}.gif`;
    try {
      // In Vite/React, you can use import.meta.glob or require to check file existence
      const module = import.meta.glob("/assets/exercises/**/*.gif");
      if (module[specificPath]) return specificPath;
    } catch (error) {
      console.warn(`Specific path check failed: ${specificPath}`, error);
    }
  }

  // Try to find the gif in all folders
  for (let exerciseType of exerciseTypes) {
    const possiblePath = `/assets/exercises/${exerciseType}/${normalizedName}.gif`;

    try {
      const module = import.meta.glob("/assets/exercises/**/*.gif");
      if (module[possiblePath]) return possiblePath;
    } catch (error) {
      console.warn(
        `Could not find image for ${exerciseName} in ${exerciseType}`
      );
    }
  }

  // Fallback to placeholder
  return "/assets/placeholder-exercise.png";
}

// Optional: Add a function to update exercise objects
export function updateExerciseAssets(exercisesObject) {
  return Object.fromEntries(
    Object.entries(exercisesObject).map(([name, exercise]) => [
      name,
      {
        ...exercise,
        src: resolveExercisePath(name, exercise.type || null),
      },
    ])
  );
}

// Add a utility function to fix paths for any asset
export function fixAssetPath(path) {
  if (!path) return '/src/assets/placeholder-exercise.png';
  
  // Handle all types of exercise file paths
  if (path.includes('/exercises/') || path.includes('exercises/') || path.endsWith('.gif')) {
    // Extract filename from path regardless of structure
    let filename = path.split('/').pop();
    
    // For predictable path handling:
    // 1. If path includes gender info (male/female)
    if (path.includes('/male/') || path.includes('male/')) {
      return `/src/assets/exercises/male@assets/${filename}`;
    } 
    else if (path.includes('/female/') || path.includes('female/')) {
      return `/src/assets/exercises/female@assets/${filename}`;
    }
    
    // 2. Default to male path for exercise files (most common in the app)
    return `/src/assets/exercises/male@assets/${filename}`;
  }
  
  // For other assets in src/assets
  if (path.includes('/assets/')) {
    return `/src/assets/${path.split('/assets/').pop()}`;
  }
  
  // If the path starts with /src/assets, keep it as is
  if (path.startsWith('/src/assets/')) {
    return path;
  }
  
  // If the path doesn't start with a slash, add it and prepend src/assets
  if (!path.startsWith('/')) {
    return `/src/assets/${path}`;
  }
  
  // For any other path, prepend src/assets
  return `/src/assets${path}`;
}
