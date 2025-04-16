/**
 * Asset utilities for resolving paths to exercise images/GIFs and other assets
 * Adapted from web app for React Native use
 */

// Mapping of exercises to their type categories
const exerciseTypes = {
  bodyweight: [
    "push-up",
    "pull-up",
    "squat",
    "lunge",
    "plank",
    "burpee",
    "mountain-climber",
    "crunch"
  ],
  barbell: [
    "bench-press",
    "squat",
    "deadlift",
    "overhead-press",
    "bent-over-row",
    "lunge",
    "good-morning",
    "romanian-deadlift"
  ],
  dumbbell: [
    "curl",
    "press",
    "fly",
    "lateral-raise",
    "row",
    "lunge",
    "goblet-squat",
    "french-press"
  ],
  machine: [
    "leg-press",
    "chest-press",
    "lat-pulldown",
    "seated-row",
    "leg-extension",
    "leg-curl",
    "pec-deck",
    "hack-squat"
  ],
  cable: [
    "tricep-pushdown",
    "face-pull",
    "cable-curl",
    "cable-crossover",
    "lat-pulldown",
    "cable-row",
    "cable-crunch",
    "wood-chop"
  ],
  kettlebell: [
    "swing",
    "clean",
    "snatch",
    "goblet-squat",
    "turkish-get-up",
    "kettlebell-press",
    "kettlebell-row",
    "windmill"
  ]
};

/**
 * Get asset path for an exercise
 * @param {string} exerciseName - The name of the exercise
 * @param {string} type - Exercise type (bodyweight, barbell, etc)
 * @returns {any} - Path or require() for the exercise asset
 */
export function getExerciseAsset(exerciseName, type = null) {
  // Normalize exercise name (convert to lowercase, replace spaces with hyphens)
  const normalizedName = exerciseName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  
  // Determine the likely exercise type if not provided
  let exerciseType = type;
  if (!exerciseType) {
    // Try to infer type from the exercise name
    for (const [typeKey, exercises] of Object.entries(exerciseTypes)) {
      if (exercises.some(ex => normalizedName.includes(ex))) {
        exerciseType = typeKey;
        break;
      }
    }
  }
  
  // For React Native, we need to use require() or import for local assets
  // This structure assumes you've organized your assets similarly to the web app
  try {
    // Try specific type folder first
    if (exerciseType) {
      // This is a simplification - in a real app, you would need to handle
      // dynamic requires differently or use a mapping approach
      switch (exerciseType) {
        case 'bodyweight':
          return require(`../assets/exercises/bodyweight/${normalizedName}.gif`);
        case 'barbell':
          return require(`../assets/exercises/barbell/${normalizedName}.gif`);
        case 'dumbbell':
          return require(`../assets/exercises/dumbbell/${normalizedName}.gif`);
        case 'machine':
          return require(`../assets/exercises/machine/${normalizedName}.gif`);
        case 'cable':
          return require(`../assets/exercises/cable/${normalizedName}.gif`);
        case 'kettlebell':
          return require(`../assets/exercises/kettlebell/${normalizedName}.gif`);
      }
    }
    
    // Return placeholder if type-specific asset cannot be found
    return require('../assets/placeholder-exercise.png');
  } catch (error) {
    // Fallback to placeholder
    console.warn(`Error loading exercise asset for ${exerciseName}:`, error);
    return require('../assets/placeholder-exercise.png');
  }
}

/**
 * Update a list of exercises with their asset paths
 * @param {Object} exercisesObject - Object with exercise data
 * @returns {Object} - Updated exercises with asset paths
 */
export function updateExerciseAssets(exercisesObject) {
  return Object.fromEntries(
    Object.entries(exercisesObject).map(([name, exercise]) => [
      name,
      {
        ...exercise,
        asset: getExerciseAsset(name, exercise.type || null),
      },
    ])
  );
}

/**
 * Get a generic app asset
 * @param {string} assetName - Asset name or path
 * @returns {any} - Asset reference 
 */
export function getAppAsset(assetName) {
  // Helper to get common app assets by name
  // This is a simplification - in a real app, you would need a more
  // comprehensive mapping of assets
  
  if (!assetName) return require('../assets/placeholder.png');
  
  // Common asset mapping
  const assetMap = {
    'logo': require('../assets/logo.png'),
    'profile-placeholder': require('../assets/profile-placeholder.png'),
    'workout-placeholder': require('../assets/workout-placeholder.jpg'),
    'nutrition-placeholder': require('../assets/nutrition-placeholder.jpg'),
  };
  
  // Check if the asset is in our map
  if (assetMap[assetName]) {
    return assetMap[assetName];
  }
  
  // For more complex paths, you would implement a similar approach to
  // the exercise asset resolver, but customized for React Native's
  // asset handling requirements
  
  // Return placeholder as fallback
  console.warn(`Asset not found: ${assetName}`);
  return require('../assets/placeholder.png');
}

export default {
  getExerciseAsset,
  updateExerciseAssets,
  getAppAsset
}; 