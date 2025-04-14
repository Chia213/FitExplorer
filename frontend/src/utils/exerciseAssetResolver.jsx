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
  if (!path) return '/assets/placeholder-exercise.png';
  
  // For paths starting with '/src/assets/', convert them to proper URLs for Vercel deployment
  if (path.startsWith('/src/assets/')) {
    // In Vercel deployment, the structure might be different
    // Try different path structures
    const fixedPath = path.replace('/src/assets/', '/assets/');
    
    // Log for debugging
    console.log(`Asset path fixed from ${path} to ${fixedPath}`);
    
    return fixedPath;
  }
  
  return path;
}
