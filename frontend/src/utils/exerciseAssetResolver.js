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

  // If a specific type is provided, prioritize that
  if (type && exerciseTypes.includes(type)) {
    const specificPath = `/src/assets/exercises/${type}/${normalizedName}.gif`;
    try {
      // In Vite/React, you can use import.meta.glob or require to check file existence
      const module = import.meta.glob("/src/assets/exercises/**/*.gif");
      if (module[specificPath]) return specificPath;
    } catch (error) {
      console.warn(`Specific path check failed: ${specificPath}`, error);
    }
  }

  // Try to find the gif in all folders
  for (let exerciseType of exerciseTypes) {
    const possiblePath = `/src/assets/exercises/${exerciseType}/${normalizedName}.gif`;

    try {
      const module = import.meta.glob("/src/assets/exercises/**/*.gif");
      if (module[possiblePath]) return possiblePath;
    } catch (error) {
      console.warn(
        `Could not find image for ${exerciseName} in ${exerciseType}`
      );
    }
  }

  // Fallback to placeholder
  return "/src/assets/placeholder-exercise.png";
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
