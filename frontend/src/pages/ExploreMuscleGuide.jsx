import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import BodyTypeToggle from "../components/BodyTypeToggle";
import LoadingSpinner from "../components/LoadingSpinner";

const exerciseAlternatives = {
  // Shoulder Exercises Alternatives
  "Arnold Dumbbell Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/arnold-dumbbell-press.gif",
      description: "Start with dumbbells at shoulder height, palms facing you. Press up while rotating palms forward, then reverse the motion on the way down. Keep core engaged and maintain proper form throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-arnold-dumbbell-press.gif",
      description: "Begin with lighter weights, perform the rotational press with controlled motion. Focus on shoulder stability and proper form throughout the movement.",
    },
  },

  "Seated Dumbbell Shoulder Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/seated-dumbbell-shoulder-press.gif",
      description: "Sit on bench with back support, hold dumbbells at shoulder height. Press upward until arms are extended, then lower with control. Keep core engaged throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-seated-dumbbell-shoulder-press.gif",
      description: "Sit with back supported, use lighter weights. Press upward with controlled motion, focusing on proper shoulder alignment and form.",
    },
  },

  "Cable Lateral Raise": {
    type: "animation",
    equipment: "Cable Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/cable-lateral-raise.gif",
      description: "Stand next to cable machine, grasp handle with opposite hand. Raise arm out to side until parallel with floor, keeping slight bend in elbow. Lower with control.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-cable-lateral-raise.gif",
      description: "Use lighter weight, perform lateral raises with controlled motion. Focus on proper shoulder alignment and core engagement throughout.",
    },
  },

  "Lateral Raise Machine": {
    type: "animation",
    equipment: "Lateral Raise Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/lateral-raise-machine.gif",
      description: "Sit at machine with arms in position. Raise arms out to sides until parallel with floor, then lower with control. Keep proper form throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-lateral-raise-machine.gif",
      description: "Use lighter weight setting, perform raises with controlled motion. Focus on proper shoulder alignment and form throughout the movement.",
    },
  },

  "Plate Shoulder Press": {
    type: "animation",
    equipment: "Weight Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/plate-shoulder-press.gif",
      description: "Hold weight plate with both hands at shoulder height. Press upward until arms are extended, then lower with control. Keep core engaged throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-plate-shoulder-press.gif",
      description: "Use lighter plate, perform presses with controlled motion. Focus on proper shoulder alignment and core engagement throughout.",
    },
  },

  "Cable Front Raise": {
    type: "animation",
    equipment: "Cable Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/cable-front-raise.gif",
      description: "Stand facing cable machine, grasp handle with both hands. Raise arms forward to shoulder height, keeping slight bend in elbows. Lower with control.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-cable-front-raise.gif",
      description: "Use lighter weight, perform front raises with controlled motion. Focus on proper shoulder alignment and core engagement throughout.",
    },
  },

  "Barbell Shrugs": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/barbell-shrugs.gif",
      description: "Stand holding barbell at thighs, lift shoulders up toward ears, hold briefly at top, then lower with control. Keep arms straight and focus on trapezius contraction.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-barbell-shrugs.gif",
      description: "Use lighter weight, perform shrugs with controlled motion. Focus on proper form and trapezius engagement throughout the movement.",
    },
  },

  "Smith Machine Shrug": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/smith-machine-shrug.gif",
      description: "Stand inside Smith machine, grip bar at shoulder width. Lift shoulders up toward ears, hold briefly, then lower with control. Keep proper form throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-smith-machine-shrug.gif",
      description: "Use lighter weight, perform shrugs with controlled motion. Focus on proper form and trapezius engagement throughout the movement.",
    },
  },

  "Lever Seated Shoulder Press": {
    type: "animation",
    equipment: "Lever Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/lever-seated-shoulder-press.gif",
      description: "Sit at machine with back supported, grip handles at shoulder height. Press upward until arms are extended, then lower with control. Keep core engaged throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-lever-seated-shoulder-press.gif",
      description: "Use lighter weight, perform presses with controlled motion. Focus on proper shoulder alignment and form throughout the movement.",
    },
  },

  "Resistance Band Lateral Raises": {
    type: "animation",
    equipment: "Resistance Band",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/resistance-band-lateral-raises.gif",
      description: "Stand on band with feet shoulder-width apart, hold ends with both hands. Raise arms out to sides until parallel with floor, then lower with control. Keep proper form throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-resistance-band-lateral-raises.gif",
      description: "Use lighter resistance band, perform raises with controlled motion. Focus on proper shoulder alignment and core engagement throughout.",
    },
  },

  "Resistance Band Standing Single Arm Shoulder Flexion": {
    type: "animation",
    equipment: "Resistance Band",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/resistance-band-standing-single-arm-shoulder-flexion.gif",
      description: "Stand on band with one foot, hold end with opposite hand. Raise arm forward to shoulder height, then lower with control. Keep proper form throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-resistance-band-standing-single-arm-shoulder-flexion.gif",
      description: "Use lighter resistance band, perform raises with controlled motion. Focus on proper shoulder alignment and core engagement throughout.",
    },
  },

  "Cable One Arm Front Raise": {
    type: "animation",
    equipment: "Cable Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/cable-one-arm-front-raise.gif",
      description: "Stand facing cable machine, grasp handle with one hand. Raise arm forward to shoulder height, keeping slight bend in elbow. Lower with control.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-cable-one-arm-front-raise.gif",
      description: "Use lighter weight, perform raises with controlled motion. Focus on proper shoulder alignment and core engagement throughout.",
    },
  },

  "Barbell Front Raise": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/barbell-front-raise.gif",
      description: "Stand holding barbell with overhand grip at thighs. Raise bar forward to shoulder height, keeping slight bend in elbows. Lower with control.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-barbell-front-raise.gif",
      description: "Use lighter weight, perform raises with controlled motion. Focus on proper shoulder alignment and core engagement throughout.",
    },
  },

  // Bicep Curl Alternatives
  "Hammer Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/hammer-curl.gif",
      description: "Stand with dumbbells at sides, palms facing in. Curl weights up while keeping elbows close to torso, squeeze biceps at top. Lower with control.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-hammer-curl.gif",
      description: "Use lighter weights, perform curls with controlled motion. Focus on bicep contraction and proper form throughout the movement.",
    },
  },

  "Cable Curls": {
    type: "animation",
    equipment: "Cable Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/cable-curls.gif",
      description: "Stand facing cable machine, grasp handle with underhand grip. Curl handle up while keeping elbows close to torso, squeeze biceps at top. Lower with control.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-cable-curls.gif",
      description: "Use lighter weight, perform curls with controlled motion. Focus on bicep contraction and proper form throughout the movement.",
    },
  },

  "Preacher Curls": {
    type: "animation",
    equipment: "Preacher Bench",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/preacher-curls.gif",
      description: "Sit at preacher bench, rest arms on pad. Curl weight up while keeping elbows on pad, squeeze biceps at top. Lower with control.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-preacher-curls.gif",
      description: "Use lighter weight, perform curls with controlled motion. Focus on bicep contraction and proper form throughout the movement.",
    },
  },

  // Push-up Alternatives
  "Knee Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/knee-pushups.gif",
      description: "Start in modified plank position on knees, hands slightly wider than shoulders. Lower chest to floor by bending elbows, keeping body straight. Push back up to starting position.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-knee-pushups.gif",
      description: "Perform push-ups from knees with proper form. Focus on chest and arm engagement while maintaining core stability throughout the movement.",
    },
  },

  "Wall Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/wall-pushups.gif",
      description: "Stand facing wall, place hands on wall at shoulder height. Lower chest toward wall by bending elbows, then push back to start. Keep body straight throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-wall-pushups.gif",
      description: "Perform wall push-ups with proper form. Focus on controlled movement and proper chest engagement throughout the exercise.",
    },
  },

  "Incline Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/incline-pushups.gif",
      description: "Place hands on elevated surface, keep body straight. Lower chest toward surface by bending elbows, then push back up. Maintain proper form throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-incline-pushups.gif",
      description: "Perform incline push-ups with proper form. Focus on controlled movement and proper chest engagement throughout the exercise.",
    },
  },

  // Squat Alternatives
  "Bodyweight Squats": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/bodyweight-squats.gif",
      description: "Stand with feet shoulder-width apart, toes slightly out. Lower body as if sitting back, keeping chest up and knees tracking over toes. Push through heels to stand.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-bodyweight-squats.gif",
      description: "Perform squats with proper form. Keep knees aligned with toes and maintain core engagement throughout the movement.",
    },
  },

  "Wall Squats": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/wall-squats.gif",
      description: "Stand with back against wall, feet shoulder-width apart. Slide down wall until thighs are parallel to floor, hold position. Keep back flat against wall.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-wall-squats.gif",
      description: "Perform wall squats with proper form. Focus on maintaining proper alignment and building lower body endurance.",
    },
  },

  "Sumo Squats": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/sumo-squats.gif",
      description: "Stand with feet wider than shoulder-width, toes pointed out. Lower body as if sitting back, keeping chest up and knees tracking over toes. Push through heels to stand.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-sumo-squats.gif",
      description: "Perform sumo squats with proper form. Focus on inner thigh and glute engagement throughout the movement.",
    },
  },

  // Plank Alternatives
  "Knee Planks": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/knee-planks.gif",
      description: "Start in modified plank position on knees, forearms on floor. Keep body straight from knees to head, engage core. Hold position while maintaining proper form.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-knee-planks.gif",
      description: "Perform knee planks with proper form. Focus on core engagement and maintaining a straight line from knees to head.",
    },
  },

  "Side Planks": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/side-planks.gif",
      description: "Lie on side, prop up on forearm. Lift hips off floor, keeping body straight. Hold position while maintaining proper form and core engagement.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-side-planks.gif",
      description: "Perform side planks with proper form. Focus on core stability and maintaining proper alignment throughout the exercise.",
    },
  },

  "Plank with Shoulder Taps": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/plank-shoulder-taps.gif",
      description: "Start in plank position, tap left shoulder with right hand, then right shoulder with left hand. Keep hips stable and core engaged throughout.",
    },
    female: {
      src: "/src/assets/exercises/female/alternatives/female-plank-shoulder-taps.gif",
      description: "Perform shoulder tap planks with proper form. Focus on core stability and controlled movement throughout the exercise.",
    },
  },
};

const exerciseAssets = {
  "Seated Barbell Shoulder Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/seated-barbell-shoulder-press.gif",
      description: "Sit on a bench with back support, grip the bar slightly wider than shoulder width. Press the bar overhead until arms are fully extended, then lower back to shoulder height. Keep core engaged and maintain proper form throughout.",
      alternatives: ["Arnold Dumbbell Press", "Seated Dumbbell Shoulder Press"],
    },
    female: {
      src: "/src/assets/exercises/female/female-seated-barbell-shoulder-press.gif",
      description: "Sit with back supported, grip the bar at shoulder width. Press upward with controlled motion, keeping core engaged. Lower weights to shoulder level with proper form.",
      alternatives: ["Lever Seated Shoulder Press", "Seated Dumbbell Shoulder Press"],
    },
  },
  "Dumbbell Lateral Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-lateral-raise.gif",
      description: "Stand with dumbbells at sides, palms facing in. Raise arms out to sides until parallel with floor, keeping slight bend in elbows. Lower with control, maintaining proper form.",
      alternatives: ["Cable Lateral Raise", "Lateral Raise Machine"],
    },
    female: {
      src: "/src/assets/exercises/female/female-dumbbell-lateral-raise.gif",
      description: "Stand with lighter weights, raise arms out to sides with controlled motion. Keep core engaged and maintain proper shoulder alignment throughout the movement.",
      alternatives: ["Resistance Band Lateral Raises", "Resistance Band Standing Single Arm Shoulder Flexion"],
    },
  },
  "Dumbbell Front Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-front-raise.gif",
      description: "Stand holding dumbbells in front of thighs, palms facing back. Raise arms forward and up to shoulder height, keeping slight bend in elbows. Lower with control.",
      alternatives: ["Plate Shoulder Press", "Cable Front Raise"],
    },
    female: {
      src: "/src/assets/exercises/female/female-dumbbell-front-raise.gif",
      description: "Stand with lighter weights, raise arms forward to shoulder height with controlled movement. Focus on proper form and shoulder stability throughout the exercise.",
      alternatives: ["Cable One Arm Front Raise", "Barbell Front Raise"],
    },
  },
  "Dumbbell Shrug": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-shrug.gif",
      description: "Stand holding weights at sides, lift shoulders up toward ears, hold briefly at the top, then lower with control. Keep arms straight and focus on trapezius contraction.",
      alternatives: ["Barbell Shrugs", "Smith Machine Shrug"],
    },
    female: {
      src: "/src/assets/exercises/female/female-dumbbell-shrug.gif",
      description: "Stand with lighter weights, lift shoulders up toward ears with controlled motion. Focus on proper form and trapezius engagement throughout the movement.",
      alternatives: ["Barbell Shrug", "Lever Shrug"],
    },
  },
  "Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/bench-press.gif",
      description: "Lie on bench, grip bar slightly wider than shoulder width. Lower bar to chest, keeping elbows at 45-degree angle. Press up until arms are extended, maintaining proper form.",
      alternatives: ["Dumbbell Bench Press", "Incline Bench Press"],
    },
    female: {
      src: "/src/assets/exercises/female/female-bench-press.gif",
      description: "Lie on bench with adjusted grip width, lower barbell to chest with controlled motion. Press up with proper form, focusing on chest engagement and shoulder stability.",
      alternatives: ["Push-ups", "Dumbbell Chest Press", "Machine Chest Press"],
    },
  },
  "Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/pushups.gif",
      description: "Start in plank position, hands slightly wider than shoulders. Lower chest to floor by bending elbows, keeping body straight. Push back up to starting position.",
      alternatives: ["Knee Push-ups", "Incline Push-ups"],
    },
    female: {
      src: "/src/assets/exercises/female/female-pushups.gif",
      description: "Start in modified plank or knee position, lower chest to floor with proper form. Push back up, focusing on chest and arm engagement while maintaining core stability.",
      alternatives: ["Wall Push-ups", "Assisted Push-ups", "Bench Push-ups"],
    },
  },
  "Bicep Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/bicep-curl.gif",
      description: "Stand with dumbbells at sides, palms facing forward. Curl weights up while keeping elbows close to torso, squeeze biceps at top. Lower with control.",
      alternatives: ["Hammer Curls", "Barbell Curls"],
    },
    female: {
      src: "/src/assets/exercises/female/female-bicep-curl.gif",
      description: "Stand with lighter weights, curl up with controlled motion. Focus on bicep contraction and proper form throughout the movement.",
      alternatives: ["Resistance Band Curls", "Preacher Curls", "Cable Curls"],
    },
  },
  "Crunches": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/crunches.gif",
      description: "Lie on back with knees bent, hands behind head. Contract abs to lift shoulders off floor, keeping lower back pressed down. Lower with control.",
      alternatives: ["Bicycle Crunches", "Reverse Crunches"],
    },
    female: {
      src: "/src/assets/exercises/female/female-crunches.gif",
      description: "Lie on back with knees bent, engage core to lift shoulders. Focus on controlled movement and proper breathing throughout the exercise.",
      alternatives: ["Planks", "Leg Raises", "Russian Twists"],
    },
  },
  "Squats": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/squats.gif",
      description: "Stand with feet shoulder-width apart, toes slightly out. Lower body as if sitting back, keeping chest up and knees tracking over toes. Push through heels to stand.",
      alternatives: ["Barbell Squats", "Goblet Squats"],
    },
    female: {
      src: "/src/assets/exercises/female/female-squats.gif",
      description: "Stand with feet shoulder-width apart, lower body with proper form. Keep knees aligned with toes and maintain core engagement throughout the movement.",
      alternatives: ["Bodyweight Squats", "Wall Squats", "Sumo Squats"],
    },
  },
  "Lunges": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/lunges.gif",
      description: "Step forward with one leg, lower body until both knees are bent 90 degrees. Keep front knee over ankle, back knee hovering above floor. Push back to start.",
      alternatives: ["Walking Lunges", "Reverse Lunges"],
    },
    female: {
      src: "/src/assets/exercises/female/female-lunges.gif",
      description: "Step forward with controlled motion, lower body with balance and stability. Focus on proper alignment and core engagement throughout the movement.",
      alternatives: ["Stationary Lunges", "Reverse Lunges", "Step-ups"],
    },
  },
  "Plank": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/planks.gif",
      description: "Hold push-up position with weight on forearms, keeping body straight from head to heels. Engage core and maintain proper alignment throughout.",
      alternatives: ["Side Planks", "Plank with Leg Lifts"],
    },
    female: {
      src: "/src/assets/exercises/female/female-planks.gif",
      description: "Hold push-up position with focus on core engagement. Maintain a straight line from head to heels, keeping proper form throughout the exercise.",
      alternatives: ["Knee Planks", "Side Planks", "Plank with Shoulder Taps"],
    },
  },
  "Deadlifts": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/deadlifts.gif",
      description: "Stand with barbell at feet, bend at hips and knees to grasp bar. Keep back straight, lift bar by extending hips and knees. Lower with control.",
      alternatives: ["Romanian Deadlifts", "Sumo Deadlifts"],
    },
    female: {
      src: "/src/assets/exercises/female/female-deadlifts.gif",
      description: "Lift with proper form, focusing on hip hinge and maintaining a neutral spine. Keep core engaged and maintain proper alignment throughout the movement.",
      alternatives: ["Kettlebell Deadlifts", "Single-Leg Deadlifts", "Dumbbell Deadlifts"],
    },
  },
  "Tricep Extensions": {
    type: "animation",
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/tricep-extensions.gif",
      description: "Hold weight overhead, lower behind head by bending elbows. Keep elbows close to head, extend arms back up. Focus on tricep contraction.",
      alternatives: ["Skull Crushers", "Cable Tricep Pushdowns"],
    },
    female: {
      src: "/src/assets/exercises/female/female-tricep-extensions.gif",
      description: "Perform with lighter weight, focusing on controlled movement and proper form. Keep elbows close to head and maintain proper alignment.",
      alternatives: ["Resistance Band Tricep Extensions", "Overhead Tricep Dips"],
    },
  },
  "Hip Thrusts": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hip-thrusts.gif",
      description: "Sit with upper back against bench, barbell across hips. Thrust hips upward until body forms straight line, squeeze glutes at top. Lower with control.",
      alternatives: ["Glute Bridges", "Single-Leg Hip Thrusts"],
    },
    female: {
      src: "/src/assets/exercises/female/female-hip-thrusts.gif",
      description: "Perform with focus on glute activation, using bodyweight or light resistance. Keep core engaged and maintain proper form throughout the movement.",
      alternatives: ["Glute Bridges", "Banded Hip Thrusts", "Step-Ups"],
    },
  },
};

const getExerciseAsset = (exerciseName, bodyType = "male") => {
  const exerciseData = exerciseAssets[exerciseName];

  if (!exerciseData) {
    return {
      type: "image",
      src: "/src/assets/placeholder-exercise.png",
      description: "Demonstration for this exercise will be added soon.",
      alternatives: [],
      equipment: null,
      difficulty: null,
    };
  }

  const genderAsset = exerciseData[bodyType];

  if (genderAsset) {
    return {
      type: exerciseData.type || "animation",
      src: genderAsset.src,
      description: genderAsset.description,
      alternatives: genderAsset.alternatives || [],
      equipment: exerciseData.equipment || null,
      difficulty: exerciseData.difficulty || null,
    };
  }

  // Fallback (should rarely be used)
  return {
    type: exerciseData.type || "animation",
    src: exerciseData.src || "/src/assets/placeholder-exercise.png",
    description: exerciseData.description || "Demonstration for this exercise.",
    alternatives: exerciseData.alternatives || [],
    equipment: exerciseData.equipment || null,
    difficulty: exerciseData.difficulty || null,
  };
};

const maleFrontMuscles = [
  {
    name: "Shoulders",
    positions: [
      { top: "19%", left: "16%" },
      { top: "19%", left: "35%" },
    ],
    exercises: [
      "Seated Barbell Shoulder Press",
      "Dumbbell Lateral Raise",
      "Dumbbell Front Raise",
      "Dumbbell Shrug",
    ],
  },
  {
    name: "Chest",
    positions: [
      { top: "23%", left: "22%" },
      { top: "23%", left: "29%" },
    ],
    exercises: ["Bench Press", "Push-ups", "Chest Fly", "Dumbbell Press"],
  },
  {
    name: "Biceps",
    positions: [
      { top: "29%", left: "14%" },
      { top: "29%", left: "37%" },
    ],
    exercises: ["Bicep Curl", "Hammer Curl", "Chin-ups", "Preacher Curl"],
  },
  {
    name: "Abs",
    positions: [
      { top: "35.5%", left: "27.5%" },
      { top: "35.5%", left: "23.5%" },
    ],
    exercises: ["Crunches", "Planks", "Leg Raises", "Russian Twists"],
  },
  {
    name: "Quads",
    positions: [
      { top: "58%", left: "20%" },
      { top: "58%", left: "31%" },
    ],
    exercises: ["Squats", "Lunges", "Leg Press", "Leg Extensions"],
  },
  {
    name: "Calves",
    positions: [
      { top: "78%", left: "67%" },
      { top: "78%", left: "75%" },
    ],
    exercises: ["Calf Raises", "Seated Calf Press", "Jump Rope"],
  },
];

const maleBackMuscles = [
  {
    name: "Upper Back",
    positions: [
      { top: "15%", left: "67.5%" },
      { top: "15%", left: "74%" },
    ],
    exercises: ["Pull-ups", "Lat Pulldowns", "Rows", "Face Pulls"],
  },
  {
    name: "Triceps",
    positions: [
      { top: "26%", left: "60%" },
      { top: "26%", left: "81.5%" },
    ],
    exercises: [
      "Dips",
      "Tricep Extensions",
      "Close-Grip Bench Press",
      "Skull Crushers",
    ],
  },
  {
    name: "Lower Back",
    positions: [
      { top: "31%", left: "66.5%" },
      { top: "31%", left: "75%" },
    ],
    exercises: ["Deadlifts", "Back Extensions", "Good Mornings", "Superman"],
  },
  {
    name: "Glutes",
    positions: [
      { top: "47%", left: "67%" },
      { top: "47%", left: "74%" },
    ],
    exercises: [
      "Hip Thrusts",
      "Glute Bridges",
      "Kickbacks",
      "Bulgarian Split Squats",
    ],
  },
  {
    name: "Hamstrings",
    positions: [
      { top: "62%", left: "65.5%" },
      { top: "62%", left: "75.5%" },
    ],
    exercises: [
      "Romanian Deadlifts",
      "Leg Curls",
      "Good Mornings",
      "Glute-Ham Raises",
    ],
  },
];

const femaleFrontMuscles = [
  {
    name: "Shoulders",
    positions: [
      { top: "19%", left: "21%" },
      { top: "19%", left: "37%" },
    ],
    exercises: [
      "Seated Barbell Shoulder Press",
      "Dumbbell Lateral Raise",
      "Dumbbell Front Raise",
      "Dumbbell Shrug",
    ],
  },
  {
    name: "Chest",
    positions: [
      { top: "23%", left: "25%" },
      { top: "23%", left: "32%" },
    ],
    exercises: ["Bench Press", "Push-ups", "Chest Fly", "Dumbbell Press"],
  },
  {
    name: "Biceps",
    positions: [
      { top: "27%", left: "20%" },
      { top: "27%", left: "37.5%" },
    ],
    exercises: ["Bicep Curl", "Hammer Curl", "Chin-ups", "Preacher Curl"],
  },
  {
    name: "Abs",
    positions: [
      { top: "31.5%", left: "30.5%" },
      { top: "31.5%", left: "27.3%" },
    ],
    exercises: ["Crunches", "Planks", "Leg Raises", "Russian Twists"],
  },
  {
    name: "Quads",
    positions: [
      { top: "53%", left: "23.5%" },
      { top: "53%", left: "33.5%" },
    ],
    exercises: ["Squats", "Lunges", "Leg Press", "Leg Extensions"],
  },
  {
    name: "Calves",
    positions: [
      { top: "75%", left: "60.5%" },
      { top: "75%", left: "73.5%" },
    ],
    exercises: ["Calf Raises", "Seated Calf Press", "Jump Rope"],
  },
];

const femaleBackMuscles = [
  {
    name: "Upper Back",
    positions: [
      { top: "16%", left: "65.5%" },
      { top: "16%", left: "70%" },
    ],
    exercises: ["Pull-ups", "Lat Pulldowns", "Rows", "Face Pulls"],
  },
  {
    name: "Triceps",
    positions: [
      { top: "26%", left: "58.5%" },
      { top: "26%", left: "76.5%" },
    ],
    exercises: [
      "Dips",
      "Tricep Extensions",
      "Close-Grip Bench Press",
      "Skull Crushers",
    ],
  },
  {
    name: "Lower Back",
    positions: [
      { top: "30%", left: "64%" },
      { top: "30%", left: "70.9%" },
    ],
    exercises: ["Deadlifts", "Back Extensions", "Good Mornings", "Superman"],
  },
  {
    name: "Glutes",
    positions: [
      { top: "45%", left: "64%" },
      { top: "45%", left: "71%" },
    ],
    exercises: [
      "Hip Thrusts",
      "Glute Bridges",
      "Kickbacks",
      "Bulgarian Split Squats",
    ],
  },
  {
    name: "Hamstrings",
    positions: [
      { top: "59%", left: "62%" },
      { top: "59%", left: "72%" },
    ],
    exercises: [
      "Romanian Deadlifts",
      "Leg Curls",
      "Good Mornings",
      "Glute-Ham Raises",
    ],
  },
];

function ExploreMuscleGuide() {
  const { theme } = useTheme();
  const [state, setState] = useState({
    selectedMuscle: null,
    hoveredMuscle: null,
    selectedDotIndex: null,
    activeMuscleIndex: null,
    viewingExercise: null,
    viewingAlternativeExercise: null,
    highlightedAreas: {},
    parentExercise: null,
    bodyType: "male",
    scrolled: false,
    navigationHistory: [],
    isLoading: false
  });

  const exerciseModalContentRef = useRef(null);
  const imageRef = useRef(null);

  // Memoized values
  const bodyImages = useMemo(() => ({
    male: "/src/assets/titan.png",
    female: "/src/assets/female-titan.png",
  }), []);

  const frontMuscles = useMemo(() => 
    state.bodyType === "male" ? maleFrontMuscles : femaleFrontMuscles,
    [state.bodyType]
  );

  const backMuscles = useMemo(() => 
    state.bodyType === "male" ? maleBackMuscles : femaleBackMuscles,
    [state.bodyType]
  );

  const allMuscles = useMemo(() => 
    [...frontMuscles, ...backMuscles],
    [frontMuscles, backMuscles]
  );

  // Memoized handlers
  const handleResetView = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedMuscle: null,
      selectedDotIndex: null,
      activeMuscleIndex: null,
      hoveredMuscle: null,
      highlightedAreas: {},
      navigationHistory: []
    }));
  }, []);

  const handleViewExercise = useCallback((exercise) => {
    setState(prev => ({
      ...prev,
      navigationHistory: prev.viewingExercise ? [...prev.navigationHistory, prev.viewingExercise] : prev.navigationHistory,
      viewingExercise: exercise,
      viewingAlternativeExercise: null
    }));
  }, []);

  const handleViewAlternative = (alternativeExercise, parentExercise) => {
    // If we're viewing an exercise and want to see an alternative
    if (parentExercise) {
      setState(prev => ({
        ...prev,
        viewingExercise: null,
        viewingAlternativeExercise: alternativeExercise,
        parentExercise: parentExercise,
        navigationHistory: [...prev.navigationHistory, parentExercise]
      }));
    } 
    // If we're going back from an alternative to the parent exercise
    else {
      // Get the last item from navigation history
      const lastParent = state.navigationHistory[state.navigationHistory.length - 1] || null;
      
      // Remove the last item from navigation history
      const newHistory = [...state.navigationHistory];
      if (newHistory.length > 0) {
        newHistory.pop();
      }
      
      setState(prev => ({
        ...prev,
        viewingExercise: lastParent,
        viewingAlternativeExercise: null,
        navigationHistory: newHistory
      }));
    }
  };

  // Track scrolling with debounce
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setState(prev => ({
          ...prev,
          scrolled: window.scrollY > 100
        }));
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Scroll modal content to top when changing exercises
  useEffect(() => {
    if (exerciseModalContentRef.current) {
      exerciseModalContentRef.current.scrollTop = 0;
    }
  }, [state.viewingExercise, state.viewingAlternativeExercise]);

  // Image loading state
  const [imageLoading, setImageLoading] = useState(true);
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Accessibility improvements
  const getCurrentMuscleName = useCallback(() => {
    if (state.activeMuscleIndex !== null) {
      return allMuscles[state.activeMuscleIndex].name;
    }
    return null;
  }, [state.activeMuscleIndex, allMuscles]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      if (state.viewingExercise || state.viewingAlternativeExercise) {
        setState(prev => ({
          ...prev,
          viewingExercise: null,
          viewingAlternativeExercise: null
        }));
      } else if (state.activeMuscleIndex !== null) {
        handleResetView();
      }
    }
  }, [state.viewingExercise, state.viewingAlternativeExercise, state.activeMuscleIndex, handleResetView]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let closestMuscle = null;
    let closestIndex = null;
    let minDistance = Infinity;

    allMuscles.forEach((muscle, muscleIndex) => {
      muscle.positions.forEach((position) => {
        const posLeft = parseInt(position.left);
        const posTop = parseInt(position.top);

        const distance = Math.sqrt(
          Math.pow(x - posLeft, 2) + Math.pow(y - posTop, 2)
        );

        if (distance < minDistance && distance < 15) {
          minDistance = distance;
          closestMuscle = muscle;
          closestIndex = muscleIndex;
        }
      });
    });

    if (closestMuscle) {
      if (state.activeMuscleIndex === closestIndex) {
        handleResetView();
      } else {
        setState(prev => ({
          ...prev,
          selectedMuscle: null,
          selectedDotIndex: null,
          activeMuscleIndex: closestIndex,
          hoveredMuscle: closestMuscle.name
        }));
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let closestMuscle = null;
    let minDistance = Infinity;

    for (let i = 0; i < allMuscles.length; i++) {
      const muscle = allMuscles[i];

      for (let j = 0; j < muscle.positions.length; j++) {
        const position = muscle.positions[j];
        const posLeft = parseInt(position.left);
        const posTop = parseInt(position.top);

        const distance = Math.sqrt(
          Math.pow(x - posLeft, 2) + Math.pow(y - posTop, 2)
        );

        if (distance < 15 && distance < minDistance) {
          minDistance = distance;
          closestMuscle = muscle;
          if (distance < 8) break;
        }
      }

      if (minDistance < 8) break;
    }

    if (
      (closestMuscle && closestMuscle.name !== state.hoveredMuscle) ||
      (!closestMuscle && state.hoveredMuscle !== null)
    ) {
      const newHighlightedAreas = closestMuscle
        ? { [closestMuscle.name]: true }
        : {};

      setState(prev => ({
        ...prev,
        highlightedAreas: newHighlightedAreas,
        hoveredMuscle: closestMuscle ? closestMuscle.name : null
      }));
    }
  };

  const handleMouseLeave = () => {
    if (state.activeMuscleIndex === null) {
      setState(prev => ({
        ...prev,
        hoveredMuscle: null,
        highlightedAreas: {}
      }));
    }
  };

  const toggleBodyType = () => {
    setState(prev => ({
      ...prev,
      bodyType: prev.bodyType === "male" ? "female" : "male"
    }));
    handleResetView();
  };

  // Get alternative exercise asset with proper fallback
  const getAlternativeExerciseAsset = (exerciseName) => {
    const alternativeAsset = exerciseAlternatives[exerciseName];
    if (!alternativeAsset) {
      return {
        src: "/src/assets/placeholder-exercise.png",
        description: "Demonstration for this exercise will be added soon.",
        equipment: null,
        difficulty: null,
      };
    }

    const variantAsset =
      alternativeAsset[state.bodyType] ||
      alternativeAsset.male ||
      alternativeAsset.female;
    return {
      src: variantAsset?.src || "/src/assets/placeholder-exercise.png",
      description:
        variantAsset?.description || "Demonstration for this exercise.",
      equipment: alternativeAsset.equipment || null,
      difficulty: alternativeAsset.difficulty || null,
    };
  };

  return (
    <div className="min-h-screen py-4 px-4" role="main" aria-label="Interactive Muscle Guide">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        Interactive Muscle Guide
      </h1>

      {/* Body Type Toggle */}
      <div className="flex justify-center mb-4">
        <BodyTypeToggle 
          bodyType={state.bodyType} 
          onToggle={toggleBodyType} 
        />
      </div>

      {/* Current muscle status */}
      <div className="bg-transparent dark:bg-transparent px-4 py-2 rounded-lg w-full max-w-4xl mx-auto text-center">
        {state.activeMuscleIndex !== null ? (
          <p className="font-medium">
            Currently Exploring:{" "}
            <span className="text-red-600 font-bold">
              {getCurrentMuscleName()}
            </span>
          </p>
        ) : (
          <p className="text-black dark:text-gray-300 opacity-80">
            Hover over or click on any muscle area to explore exercises
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
        {/* Muscle Image Section */}
        <div className="md:w-3/5 relative">
          <div className="relative max-h-[500px] overflow-hidden mx-auto">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <LoadingSpinner />
              </div>
            )}
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              role="img"
              aria-label={`${state.bodyType} muscle anatomy diagram`}
            ></div>

            <img
              ref={imageRef}
              key={state.bodyType}
              src={bodyImages[state.bodyType]}
              alt={`${state.bodyType.charAt(0).toUpperCase() + state.bodyType.slice(1)} Muscle Anatomy`}
              className={`w-full max-h-[500px] object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              loading="lazy"
            />

            {/* Hover tooltip */}
            {state.hoveredMuscle && state.activeMuscleIndex === null && (
              <div
                className="absolute bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm whitespace-nowrap
                          transition-opacity duration-200 z-20 pointer-events-none"
                style={{
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                {state.hoveredMuscle}
              </div>
            )}

            {/* Active muscle group dots */}
            {state.activeMuscleIndex !== null && (
              <div key={`active-dots-${state.activeMuscleIndex}`}>
                {allMuscles[state.activeMuscleIndex].positions.map(
                  (position, posIndex) => (
                    <div
                      key={`active-${state.activeMuscleIndex}-${posIndex}`}
                      style={{
                        position: "absolute",
                        top: position.top,
                        left: position.left,
                        transition: "transform 0.2s ease",
                        zIndex: 10,
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        className="relative"
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: "#ff6600",
                          borderRadius: "50%",
                          border: "2px solid white",
                          boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                          transform: "scale(1.3)",
                        }}
                      ></div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Hovered muscle group dots */}
            {state.activeMuscleIndex === null &&
              state.hoveredMuscle &&
              allMuscles
                .filter((muscle) => muscle.name === state.hoveredMuscle)
                .map((muscle, idx) => (
                  <div key={`hover-dots-${idx}`}>
                    {muscle.positions.map((position, posIndex) => (
                      <div
                        key={`hover-${idx}-${posIndex}`}
                        style={{
                          position: "absolute",
                          top: position.top,
                          left: position.left,
                          transition: "transform 0.2s ease",
                          zIndex: 10,
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          className="relative"
                          style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#ff0000",
                            borderRadius: "50%",
                            border: "2px solid white",
                            boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                            transform: "scale(1.2)",
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                ))}
          </div>
        </div>

        {/* Exercise Details Panel - visible when not scrolling */}
        <div className={`md:w-2/5 ${state.scrolled ? "md:hidden" : ""}`}>
          {state.activeMuscleIndex !== null ? (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">
                {allMuscles[state.activeMuscleIndex].name} Exercises
              </h2>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {allMuscles[state.activeMuscleIndex].exercises.map(
                  (exercise, idx) => (
                    <li key={idx} className="py-3">
                      <button
                        onClick={() => handleViewExercise(exercise)}
                        className="flex items-center w-full text-left hover:text-blue-500"
                      >
                        <span className="font-medium">{exercise}</span>
                      </button>
                    </li>
                  )
                )}
              </ul>
              <button
                onClick={handleResetView}
                className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset View
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Select a Muscle Group</h2>

              {/* Fixed height container for hover text */}
              <div className="h-16 mb-4">
                {state.hoveredMuscle && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Hovering over: </span>
                    <span className="text-red-600">{state.hoveredMuscle}</span>
                    <br />
                    <span className="text-sm">
                      Click to select this muscle group
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {allMuscles.map((muscle, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setState(prev => ({
                        ...prev,
                        activeMuscleIndex: idx,
                        hoveredMuscle: muscle.name
                      }));
                    }}
                    onMouseEnter={() => {
                      if (state.activeMuscleIndex === null) {
                        setState(prev => ({
                          ...prev,
                          highlightedAreas: { [muscle.name]: true },
                          hoveredMuscle: muscle.name
                        }));
                      }
                    }}
                    onMouseLeave={() => {
                      if (state.activeMuscleIndex === null) {
                        setState(prev => ({
                          ...prev,
                          highlightedAreas: {}
                        }));
                      }
                    }}
                    className="text-left p-2 bg-white dark:bg-gray-700 rounded-md hover:bg-blue-50 dark:hover:bg-gray-600"
                  >
                    {muscle.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Exercise Window when scrolled */}
      {state.activeMuscleIndex !== null && state.scrolled && (
        <div 
          className="fixed bottom-4 right-4 z-50 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          role="dialog"
          aria-label={`${getCurrentMuscleName()} exercises`}
        >
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800 dark:text-white">
                {allMuscles[state.activeMuscleIndex].name}
              </h3>
              <button
                onClick={handleResetView}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {allMuscles[state.activeMuscleIndex].exercises.map((exercise, idx) => (
                <li key={idx} className="py-2">
                  <button
                    onClick={() => handleViewExercise(exercise)}
                    className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="font-medium text-sm">{exercise}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Alternative Exercise Modal with improved navigation */}
      {state.viewingAlternativeExercise && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-[1000] flex items-center justify-center"
          onClick={() => setState(prev => ({
            ...prev,
            viewingExercise: null,
            viewingAlternativeExercise: null
          }))}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
            ref={exerciseModalContentRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation breadcrumb */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <button
                onClick={handleResetView}
                className="hover:underline"
              >
                {getCurrentMuscleName()}
              </button>
              <span className="mx-1">›</span>
              <button 
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    viewingExercise: state.parentExercise,
                    viewingAlternativeExercise: null
                  }));
                }} 
                className="hover:underline"
              >
                {state.parentExercise}
              </button>
              <span className="mx-1">›</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {state.viewingAlternativeExercise}
              </span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                {state.viewingAlternativeExercise}
              </h3>
              <button
                onClick={() => setState(prev => ({
                  ...prev,
                  viewingExercise: null,
                  viewingAlternativeExercise: null
                }))}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white focus:outline-none"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {(() => {
                const asset = getAlternativeExerciseAsset(
                  state.viewingAlternativeExercise
                );
                return (
                  <img
                    src={asset.src}
                    alt={`${state.viewingAlternativeExercise} demonstration`}
                    className="w-full object-contain max-h-60"
                  />
                );
              })()}
            </div>

            <div>
              <h4 className="text-lg font-bold mb-2">How to Perform:</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {
                  getAlternativeExerciseAsset(state.viewingAlternativeExercise)
                    .description
                }
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {getAlternativeExerciseAsset(state.viewingAlternativeExercise)
                  .equipment && (
                  <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Equipment:{" "}
                      {
                        getAlternativeExerciseAsset(state.viewingAlternativeExercise)
                          .equipment
                      }
                    </span>
                  </div>
                )}
                {getAlternativeExerciseAsset(state.viewingAlternativeExercise)
                  .difficulty && (
                  <div className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1">
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                      Difficulty:{" "}
                      {
                        getAlternativeExerciseAsset(state.viewingAlternativeExercise)
                          .difficulty
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleViewAlternative}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Back to {state.parentExercise}
              </button>
              <button
                onClick={() => setState(prev => ({
                  ...prev,
                  viewingExercise: null,
                  viewingAlternativeExercise: null
                }))}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Exercise Modal with improved navigation */}
      {state.viewingExercise && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black bg-opacity-70 z-[9999] flex items-center justify-center"
          onClick={() => setState(prev => ({
            ...prev,
            viewingExercise: null,
            viewingAlternativeExercise: null
          }))}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            ref={exerciseModalContentRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation breadcrumb */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
              <button
                onClick={handleResetView}
                className="hover:underline"
              >
                {getCurrentMuscleName()}
              </button>

              {state.navigationHistory.length > 0 && (
                <>
                  <span className="mx-1">›</span>
                  <button
                    onClick={handleViewAlternative}
                    className="hover:underline"
                  >
                    {state.navigationHistory[state.navigationHistory.length - 1]}
                  </button>
                </>
              )}

              <span className="mx-1">›</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {state.viewingExercise}
              </span>
            </div>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">{state.viewingExercise}</h3>
              <button
                onClick={() => setState(prev => ({
                  ...prev,
                  viewingExercise: null,
                  viewingAlternativeExercise: null
                }))}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {(() => {
                const exerciseAsset = getExerciseAsset(
                  state.viewingExercise,
                  state.bodyType
                );
                return (
                  <img
                    src={exerciseAsset.src}
                    alt={`${state.viewingExercise} demonstration`}
                    className="w-full object-contain max-h-60"
                  />
                );
              })()}
            </div>

            <div className="text-gray-700 dark:text-gray-300">
              <h4 className="font-bold mb-1">How to perform:</h4>
              <p>{getExerciseAsset(state.viewingExercise, state.bodyType).description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {getExerciseAsset(state.viewingExercise, state.bodyType).equipment && (
                  <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Equipment:{" "}
                      {getExerciseAsset(state.viewingExercise, state.bodyType).equipment}
                    </span>
                  </div>
                )}
                {getExerciseAsset(state.viewingExercise, state.bodyType).difficulty && (
                  <div className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1">
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                      Difficulty:{" "}
                      {getExerciseAsset(state.viewingExercise, state.bodyType).difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Improved Alternatives Section */}
            <div className="mt-4">
              <h4 className="font-bold mb-2">Alternative Exercises:</h4>
              <div className="flex flex-wrap gap-2">
                {getExerciseAsset(state.viewingExercise, state.bodyType).alternatives.map(
                  (alt, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600"
                      onClick={() =>
                        handleViewAlternative(alt, state.viewingExercise)
                      }
                    >
                      {alt}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex space-x-2 mt-4">
              {state.navigationHistory.length > 0 && (
                <button
                  onClick={handleViewAlternative}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => setState(prev => ({
                  ...prev,
                  viewingExercise: null,
                  viewingAlternativeExercise: null
                }))}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreMuscleGuide;
