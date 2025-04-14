import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import BodyTypeToggle from "../components/BodyTypeToggle";
import LoadingSpinner from "../components/LoadingSpinner";
import maleTitanImage from '../assets/titan.png';
import femaleTitanImage from '../assets/female-titan.png';
import ExerciseImage from "../components/ExerciseImage";
import { fixAssetPath } from "../utils/exerciseAssetResolver";

const exerciseAssets = {
  // Shoulders Exercises - Dumbbells
  "Dumbbell Shoulder Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/dumbbell-shoulder-press.gif"),
      description: "Sit on a bench with back support. Hold a dumbbell in each hand at shoulder height. Press the weights upward until your arms are fully extended. Lower back to starting position.",
      alternatives: ["Arnold Press", "Barbell Overhead Press", "Machine Shoulder Press"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/dumbbell-shoulder-press.gif"),
      description: "Sit on a bench with dumbbells at shoulder height. Press them up overhead until your arms are fully extended. Lower with control.",
      alternatives: ["Arnold Press", "Lighter Barbell Overhead Press", "Shoulder Press Machine"]
    }
  },
  "Dumbbell Lateral Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: fixAssetPath("/assets/exercises/male/dumbbell-lateral-raise.gif"),
      description: "Stand with dumbbells at your sides. Keep a slight bend in your elbows and raise the weights out to the sides until they reach shoulder level. Lower back down with control.",
      alternatives: ["Cable Lateral Raise", "Machine Lateral Raise", "Plate Lateral Raise"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/dumbbell-lateral-raise.gif"),
      description: "Stand with dumbbells at your sides. Raise arms out to shoulder height, keeping a slight bend in your elbows. Lower slowly.",
      alternatives: ["Cable Lateral Raise", "Lateral Raise Machine", "Plate Lateral Raise"]
    }
  },
  "Dumbbell Front Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: fixAssetPath("/assets/exercises/male/dumbbell-front-raise.gif"),
      description: "Stand holding dumbbells in front of your thighs. Keeping your arms straight, lift the weights forward and upward until they reach shoulder height. Lower back down with control.",
      alternatives: ["Cable Front Raise", "Plate Front Raise", "Barbell Front Raise"]
    }
  },
  "Front Raise with Control": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    female: {
      src: fixAssetPath("/assets/exercises/female/front-raise-with-control.gif"),
      description: "Hold dumbbells in front of your thighs. Lift them straight in front of you to shoulder level. Lower with full control.",
      alternatives: ["Cable Front Raise", "Light Plate Front Raise", "Barbell Front Raise"]
    }
  },
  "Arnold Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/arnold-press.gif"),
      description: "Sit with dumbbells held in front at shoulder height, palms facing you. As you press up, rotate your palms to face forward at the top. Reverse the movement on the way down.",
      alternatives: ["Dumbbell Shoulder Press", "Barbell Overhead Press", "Push Press"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/arnold-press.gif"),
      description: "Start with dumbbells in front of your shoulders, palms facing you. Rotate palms outward as you press overhead. Lower back and reverse the motion.",
      alternatives: ["Dumbbell Shoulder Press", "Push Press with Proper Form", "Kettlebell Single Arm Press"]
    }
  },
  
  // Shoulders Exercises - Barbell
  "Barbell Overhead Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/barbell-overhead-press.gif"),
      description: "Stand with feet shoulder-width apart, holding a barbell at shoulder height. Press the bar overhead until arms are fully extended. Lower the bar back to shoulder height.",
      alternatives: ["Dumbbell Shoulder Press", "Push Press", "Machine Shoulder Press"]
    }
  },
  "Lighter Barbell Overhead Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    female: {
      src: fixAssetPath("/assets/exercises/female/lighter-barbell-overhead-press.gif"),
      description: "Use a lighter barbell at shoulder height. Press it overhead and fully extend your arms. Return with control.",
      alternatives: ["Smith Machine Overhead Press", "Push Press with Proper Form", "Dumbbell Shoulder Press"]
    }
  },
  "Barbell Upright Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/barbell-upright-row.gif"),
      description: "Stand holding a barbell with hands shoulder-width apart. Pull the barbell up vertically to chin height, keeping it close to your body. Lower back down with control.",
      alternatives: ["Dumbbell Upright Row", "Cable Upright Row", "Face Pull"]
    }
  },
  "Controlled Upright Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    female: {
      src: fixAssetPath("/assets/exercises/female/controlled-upright-row.gif"),
      description: "Stand with a barbell in front of you. Pull it straight up to chest height, keeping it close to your body. Lower slowly.",
      alternatives: ["Smith Machine Upright Row", "Face Pull with External Rotation", "Dumbbell Upright Row"]
    }
  },
  "Push Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Advanced",
    male: {
      src: fixAssetPath("/assets/exercises/male/push-press.gif"),
      description: "Stand with barbell at shoulder height. Slightly bend knees, then explosively extend legs while pressing the bar overhead. Lower the bar back to shoulders with control.",
      alternatives: ["Barbell Overhead Press", "Dumbbell Push Press", "Kettlebell Push Press"]
    }
  },
  "Push Press with Proper Form": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Advanced",
    female: {
      src: fixAssetPath("/assets/exercises/female/push-press-with-proper-form.gif"),
      description: "With barbell at shoulders, dip your knees and explosively press the bar overhead. Catch and lower with control.",
      alternatives: ["Kettlebell Push Press", "Lighter Barbell Overhead Press", "Arnold Press"]
    }
  },
  
  // Shoulders Exercises - Machine
  "Shoulder Press Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: fixAssetPath("/assets/exercises/male/shoulder-press-machine.gif"),
      description: "Sit in the machine with back supported. Adjust the seat so handles are at shoulder height. Press the handles upward until arms are extended. Lower back to starting position.",
      alternatives: ["Dumbbell Shoulder Press", "Barbell Overhead Press", "Smith Machine Overhead Press"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/shoulder-press-machine.gif"),
      description: "Sit upright with handles at shoulder level. Press upward until arms are extended. Return to the start position.",
      alternatives: ["Smith Machine Overhead Press", "Dumbbell Shoulder Press", "Kettlebell Single Arm Press"]
    }
  },
  "Lateral Raise Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: fixAssetPath("/assets/exercises/male/lateral-raise-machine.gif"),
      description: "Sit in the machine with arms positioned under the pads. Push outward and upward with your arms until they reach shoulder level. Return to starting position with control.",
      alternatives: ["Dumbbell Lateral Raise", "Cable Lateral Raise", "Plate Lateral Raise"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/lateral-raise-machine.gif"),
      description: "Sit with arms under the machine pads. Raise arms outward to shoulder height, then return slowly.",
      alternatives: ["Dumbbell Lateral Raise", "Cable Lateral Raise", "Plate Lateral Raise"]
    }
  },
  "Reverse Pec Deck": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: fixAssetPath("/assets/exercises/male/reverse-pec-deck.gif"),
      description: "Sit facing the pec deck machine. Grasp the handles with arms extended. Pull the handles back by squeezing your shoulder blades together. Return to starting position.",
      alternatives: ["Dumbbell Reverse Fly", "Cable Reverse Fly", "Face Pull"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/reverse-pec-deck.gif"),
      description: "Sit facing the machine. With arms extended, pull the handles back by squeezing your shoulder blades together. Return slowly.",
      alternatives: ["Face Pull with External Rotation", "Cable Reverse Fly", "Dumbbell Reverse Fly"]
    }
  },
  
  // Shoulders Exercises - Cable
  "Cable Lateral Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/cable-lateral-raise.gif"),
      description: "Stand sideways to a low cable pulley. Grasp the handle and raise your arm out to the side until it reaches shoulder height. Lower with control and repeat.",
      alternatives: ["Dumbbell Lateral Raise", "Machine Lateral Raise", "Plate Lateral Raise"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/cable-lateral-raise.gif"),
      description: "Stand beside a low cable pulley. Raise the handle laterally to shoulder height. Lower with control.",
      alternatives: ["Dumbbell Lateral Raise", "Lateral Raise Machine", "Plate Lateral Raise"]
    }
  },
  "Cable Front Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/cable-front-raise.gif"),
      description: "Stand facing away from a low cable pulley. Grasp the handle and raise your arm forward until it reaches shoulder height. Lower with control and repeat.",
      alternatives: ["Dumbbell Front Raise", "Plate Front Raise", "Barbell Front Raise"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/cable-front-raise.gif"),
      description: "Face away from a low pulley. Raise the handle in front of you to shoulder height, keeping arm straight. Lower slowly.",
      alternatives: ["Front Raise with Control", "Light Plate Front Raise", "Dumbbell Front Raise"]
    }
  },
  "Face Pull": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/face-pull.gif"),
      description: "Stand facing a cable machine with rope attachment at head height. Pull the rope toward your face, separating the ends as you pull. Return to starting position with control.",
      alternatives: ["Reverse Pec Deck", "Dumbbell Reverse Fly", "Barbell Upright Row"]
    }
  },
  "Face Pull with External Rotation": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    female: {
      src: fixAssetPath("/assets/exercises/female/face-pull-external-rotation.gif"),
      description: "Use a rope at face height. Pull the rope toward your face while rotating your hands outward at the end. Return with control.",
      alternatives: ["Reverse Pec Deck", "Controlled Upright Row", "Dumbbell Reverse Fly"]
    }
  },
  
  // Shoulders Exercises - Kettlebell
  "Kettlebell Overhead Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/kettlebell-overhead-press.gif"),
      description: "Stand holding a kettlebell at shoulder height. Press it overhead until your arm is fully extended. Lower it back to the shoulder with control.",
      alternatives: ["Dumbbell Shoulder Press", "Barbell Overhead Press", "One-Arm Press"]
    }
  },
  "Kettlebell Single Arm Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    female: {
      src: fixAssetPath("/assets/exercises/female/kettlebell-single-arm-press.gif"),
      description: "Hold a kettlebell at shoulder height. Press it overhead with one arm and lower with control.",
      alternatives: ["Arnold Press", "Kettlebell Push Press", "Dumbbell Shoulder Press"]
    }
  },
  "Kettlebell Push Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/kettlebell-push-press.gif"),
      description: "Stand with kettlebell at shoulder height. Slightly bend knees, then explosively extend legs while pressing the kettlebell overhead. Lower back to starting position.",
      alternatives: ["Push Press", "Dumbbell Push Press", "Kettlebell Overhead Press"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/kettlebell-push-press.gif"),
      description: "Slightly bend knees then explosively drive the kettlebell overhead. Lower with control.",
      alternatives: ["Push Press with Proper Form", "Kettlebell Single Arm Press", "Dumbbell Shoulder Press"]
    }
  },
  
  // Shoulders Exercises - Plate
  "Plate Front Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: fixAssetPath("/assets/exercises/male/plate-front-raise.gif"),
      description: "Hold a weight plate with both hands at the bottom. Raise the plate forward and upward until arms reach shoulder height. Lower with control back to starting position.",
      alternatives: ["Dumbbell Front Raise", "Cable Front Raise", "Barbell Front Raise"]
    }
  },
  "Light Plate Front Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    female: {
      src: fixAssetPath("/assets/exercises/female/light-plate-front-raise.gif"),
      description: "Hold a light plate with both hands. Raise it in front of you to shoulder height, then return slowly.",
      alternatives: ["Cable Front Raise", "Front Raise with Control", "Dumbbell Front Raise"]
    }
  },
  "Plate Lateral Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: fixAssetPath("/assets/exercises/male/plate-lateral-raise.gif"),
      description: "Hold a weight plate with both hands at the center. Raise the plate out to the side until arms reach shoulder height. Lower with control and repeat on the other side.",
      alternatives: ["Dumbbell Lateral Raise", "Cable Lateral Raise", "Machine Lateral Raise"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/plate-lateral-raise.gif"),
      description: "Hold a plate at your side. Raise it laterally to shoulder height, then return with control.",
      alternatives: ["Dumbbell Lateral Raise", "Cable Lateral Raise", "Lateral Raise Machine"]
    }
  },
  
  // Shoulders Exercises - Smith Machine
  "Smith Machine Overhead Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/smith-machine-overhead-press.gif"),
      description: "Sit or stand with the Smith machine bar at shoulder height. Press the bar overhead until arms are fully extended. Lower the bar back to shoulder height with control.",
      alternatives: ["Barbell Overhead Press", "Dumbbell Shoulder Press", "Machine Shoulder Press"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/smith-machine-overhead-press.gif"),
      description: "Use the Smith machine bar at shoulder height. Press it overhead until arms are fully extended. Lower with control.",
      alternatives: ["Lighter Barbell Overhead Press", "Shoulder Press Machine", "Dumbbell Shoulder Press"]
    }
  },
  "Smith Machine Upright Row": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/smith-machine-upright-row.gif"),
      description: "Stand holding the Smith machine bar with hands shoulder-width apart. Pull the bar up vertically to chin height, keeping it close to your body. Lower back down with control.",
      alternatives: ["Barbell Upright Row", "Cable Upright Row", "Dumbbell Upright Row"]
    },
    female: {
      src: fixAssetPath("/assets/exercises/female/smith-machine-upright-row.gif"),
      description: "Pull the Smith machine bar up to your chest, keeping it close to your body. Lower with control.",
      alternatives: ["Controlled Upright Row", "Face Pull with External Rotation", "Cable Upright Row"]
    }
  },
  
  // Shoulders Exercises - Bodyweight
  "Pike Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/pike-push-ups.gif"),
      description: "Get into a downward dog position with hips high. Bend your elbows to lower your head toward the floor. Push back up to the starting position.",
      alternatives: ["Handstand Push-ups", "Wall Walks", "Dumbbell Shoulder Press"]
    }
  },
  "Incline Pike Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    female: {
      src: fixAssetPath("/assets/exercises/female/incline-pike-push-ups.gif"),
      description: "In a downward dog position with feet elevated, lower your head to the floor. Push back up.",
      alternatives: ["Wall Handstand Hold", "Wall Push-ups", "Dumbbell Shoulder Press"]
    }
  },
  "Handstand Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: fixAssetPath("/assets/exercises/male/handstand-push-ups.gif"),
      description: "Get into a handstand position against a wall. Lower your body by bending your elbows until your head nearly touches the ground. Push back up to the starting position.",
      alternatives: ["Pike Push-ups", "Wall Walks", "Barbell Overhead Press"]
    }
  },
  "Wall Handstand Hold": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    female: {
      src: fixAssetPath("/assets/exercises/female/wall-handstand-hold.gif"),
      description: "Kick into a handstand position against a wall. Hold the position while keeping your core tight and shoulders active.",
      alternatives: ["Incline Pike Push-ups", "Wall Push-ups", "Handstand Push-ups"]
    }
  },
  "Wall Walks": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: fixAssetPath("/assets/exercises/male/wall-walks.gif"),
      description: "Start in a plank position with feet against a wall. Walk your feet up the wall while walking your hands closer to the wall. Reverse the movement to return to the starting position.",
      alternatives: ["Pike Push-ups", "Handstand Push-ups", "Shoulder Press"]
    }
  },
  "Wall Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    female: {
      src: fixAssetPath("/assets/exercises/female/wall-push-ups.gif"),
      description: "Stand facing a wall. Place hands on the wall and perform push-ups, keeping your body straight and controlled.",
      alternatives: ["Incline Pike Push-ups", "Shoulder Press Machine", "Dumbbell Shoulder Press"]
    }
  },
}

const getExerciseAssetByGender = (exerciseName, gender = "male") => {
  const data = exerciseAssets[exerciseName];

  if (!data) {
    return {
      type: "image",
      src: fixAssetPath("/assets/placeholder-exercise.png"),
      description: "No demonstration available yet.",
      alternatives: [],
      equipment: null,
      difficulty: null
    };
  }

  // Get the gender-specific data
  const genderData = data[gender];
  
  if (!genderData) {
    return {
      type: data.type || "image",
      src: fixAssetPath("/assets/placeholder-exercise.png"),
      description: "No demonstration available for this gender.",
      alternatives: data.alternatives || [],
      equipment: data.equipment,
      difficulty: data.difficulty
    };
  }

  return {
    type: data.type || "image",
    src: genderData.src,
    description: genderData.description || "No description available.",
    alternatives: genderData.alternatives || [],
    equipment: data.equipment,
    difficulty: data.difficulty
  };
};

const maleFrontMuscles = [
  {
    name: "Shoulders",
    positions: [
      { top: "22%", left: "7%" },
      { top: "22%", left: "30.5%" },
    ],
  },
  {
    name: "Chest",
    positions: [
      { top: "27%", left: "14%" },
      { top: "27%", left: "22.5%" },
    ],
  },
  {
    name: "Biceps",
    positions: [
      { top: "31.5%", left: "5%" },
      { top: "31.5%", left: "33.5%" },
    ],
  },
  {
    name: "Abs",
    positions: [
      { top: "37%", left: "16.2%" },
      { top: "37%", left: "21%" },
    ],
  },
  {
    name: "Quads",
    positions: [
      { top: "57%", left: "11%" },
      { top: "57%", left: "25%" },
    ],
  },
  {
    name: "Calves",
    positions: [
      { top: "74%", left: "67%" },
      { top: "74%", left: "86%" },
    ],
  },
];

const maleBackMuscles = [
  {
    name: "Upper Back",
    positions: [
      { top: "20%", left: "72.5%" },
      { top: "20%", left: "80.5%" },
    ],
  },
  {
    name: "Triceps",
    positions: [
      { top: "30%", left: "63%" },
      { top: "30%", left: "90%" },
    ],
  },
  {
    name: "Lower Back",
    positions: [
      { top: "34%", left: "70.5%" },
      { top: "34%", left: "82%" },
    ],
  },
  {
    name: "Glutes",
    positions: [
      { top: "47.5%", left: "72%" },
      { top: "47.5%", left: "80%" },
    ],
  },
  {
    name: "Hamstrings",
    positions: [
      { top: "60%", left: "70%" },
      { top: "60%", left: "82%" },
    ],
  },
];

const femaleFrontMuscles = [
  {
    name: "Shoulders",
    positions: [
      { top: "21.5%", left: "62.5%" },
      { top: "21.5%", left: "82%" },
    ],
  },
  {
    name: "Chest",
    positions: [
      { top: "26%", left: "18.5%" },
      { top: "26%", left: "27.5%" },
    ],
  },
  {
    name: "Biceps",
    positions: [
      { top: "29.5%", left: "12.5%" },
      { top: "29.5%", left: "34%" },
    ],
  },
  {
    name: "Abs",
    positions: [
      { top: "33.5%", left: "20.8%" },
      { top: "33.5%", left: "24.8%" },
    ],
  },
  {
    name: "Quads",
    positions: [
      { top: "53%", left: "16.5%" },
      { top: "53%", left: "28%" },
    ],
  },
  {
    name: "Calves",
    positions: [
      { top: "72%", left: "63%" },
      { top: "72%", left: "80%" },
    ],
  },
];

const femaleBackMuscles = [
  {
    name: "Upper Back",
    positions: [
      { top: "20%", left: "70%" },
      { top: "20%", left: "75%" },
    ],
  },
  {
    name: "Triceps",
    positions: [
      { top: "28%", left: "60.5%" },
      { top: "28%", left: "83.5%" },
    ],
  },
  {
    name: "Lower Back",
    positions: [
      { top: "33%", left: "68%" },
      { top: "33%", left: "76%" },
    ],
  },
  {
    name: "Glutes",
    positions: [
      { top: "45%", left: "67%" },
      { top: "45%", left: "77%" },
    ],
  },
  {
    name: "Hamstrings",
    positions: [
      { top: "59%", left: "65.5%" },
      { top: "59%", left: "78%" },
    ],
  },
];

// Define available equipment types for filtering
const equipmentTypes = [
  "All Equipment",
  "Dumbbells",
  "Barbell",
  "Machine",
  "Cable",
  "Kettlebell",
  "Plate",
  "Smith Machine",
  "Bodyweight",
  "Cardio"
];

// Enhanced exercise data organized by equipment type - separated by gender
const muscleExercisesByEquipment = {
    male: {
    // Male exercises (existing data)
    "Shoulders": {
      "Dumbbells": ["Dumbbell Shoulder Press", "Dumbbell Lateral Raise", "Dumbbell Front Raise", "Arnold Press"],
      "Barbell": ["Barbell Overhead Press", "Barbell Upright Row", "Push Press"],
      "Machine": ["Shoulder Press Machine", "Lateral Raise Machine", "Reverse Pec Deck"],
      "Cable": ["Cable Lateral Raise", "Cable Front Raise", "Face Pull"],
      "Kettlebell": ["Kettlebell Overhead Press", "Kettlebell Push Press"],
      "Plate": ["Plate Front Raise", "Plate Lateral Raise"],
      "Smith Machine": ["Smith Machine Overhead Press", "Smith Machine Upright Row"],
      "Bodyweight": ["Pike Push-ups", "Handstand Push-ups", "Wall Walks"],
      "Cardio": []
    },
    "Chest": {
      "Dumbbells": ["Dumbbell Bench Press", "Dumbbell Flyes", "Incline Dumbbell Press", "Single Arm Dumbbell Press"],
      "Barbell": ["Barbell Bench Press", "Incline Bench Press", "Close Grip Bench Press"],
      "Machine": ["Chest Press Machine", "Pec Deck Machine"],
      "Cable": ["Cable Flyes", "Cable Crossover", "Low Cable Crossover"],
      "Kettlebell": ["Kettlebell Floor Press", "Kettlebell Flyes"],
      "Plate": ["Plate Press", "Svend Press"],
      "Smith Machine": ["Smith Machine Bench Press", "Smith Machine Incline Press"],
      "Bodyweight": ["Push-ups", "Incline Push-ups", "Wide Push-ups", "Diamond Push-ups"],
      "Cardio": []
    },
    "Biceps": {
      "Dumbbells": ["Dumbbell Bicep Curl", "Hammer Curl", "Concentration Curl", "Alternating Bicep Curl"],
      "Barbell": ["Lighter Barbell Curl", "EZ Bar Curl", "Reverse Grip Barbell Curl"],
      "Machine": ["Machine Bicep Curl"],
      "Cable": ["Cable Bicep Curl", "Cable Hammer Curl", "Rope Hammer Curl"],
      "Kettlebell": ["Kettlebell Bicep Curl", "Kettlebell Hammer Curl"],
      "Plate": ["Plate Curl"],
      "Smith Machine": ["Smith Machine Drag Curl"],
      "Bodyweight": ["Chin-ups", "Close Grip Pull-ups", "Inverted Row (Underhand)"],
      "Cardio": []
    },
    "Abs": {
      "Dumbbells": ["Dumbbell Russian Twist", "Light Weighted Crunch", "Side Bend"],
      "Barbell": [],
      "Machine": ["Ab Crunch Machine", "Hanging Leg Raise", "Roman Chair"],
      "Cable": ["Cable Crunch", "Cable Woodchopper", "Cable Oblique Twist"],
      "Kettlebell": ["Kettlebell Russian Twist", "Kettlebell Windmill"],
      "Plate": ["Plate Russian Twist", "Weighted Plank with Plate"],
      "Smith Machine": [],
      "Bodyweight": ["Crunches", "Hanging Leg Raises", "Plank", "Side Plank", "Mountain Climbers", "Bicycle Crunch"],
      "Cardio": ["Mountain Climbers", "Plank Jacks"]
    },
    "Quads": {
      "Dumbbells": ["Dumbbell Squat", "Dumbbell Lunge", "Dumbbell Step-up", "Goblet Squat"],
      "Barbell": ["Barbell Squat", "Front Squat", "Barbell Bulgarian Split Squat", "Barbell Lunge"],
      "Machine": ["Leg Press", "Leg Extension", "Hack Squat Machine"],
      "Cable": ["Cable Squat"],
      "Kettlebell": ["Kettlebell Goblet Squat", "Kettlebell Lunge", "Kettlebell Step-up"],
      "Plate": ["Plate Squat"],
      "Smith Machine": ["Smith Machine Squat", "Smith Machine Split Squat"],
      "Bodyweight": ["Bodyweight Squat", "Walking Lunge", "Bodyweight Split Squat", "Jump Squat", "Box Step-up"],
      "Cardio": ["Box Jumps", "Jump Rope", "Stair Climber"]
    },
    "Calves": {
      "Dumbbells": ["Dumbbell Calf Raise", "Seated Dumbbell Calf Raise"],
      "Barbell": ["Standing Calf Raise", "Barbell Seated Calf Raise"],
      "Machine": ["Standing Calf Raise Machine", "Seated Calf Raise Machine", "Leg Press Calf Raise"],
      "Cable": [],
      "Kettlebell": ["Kettlebell Calf Raise"],
      "Plate": ["Single Leg Plate Calf Raise"],
      "Smith Machine": ["Smith Machine Calf Raise"],
      "Bodyweight": ["Standing Bodyweight Calf Raise", "Single Leg Calf Raise", "Box Calf Raise"],
      "Cardio": ["Jump Rope", "Box Jumps"]
    },
    "Upper Back": {
      "Dumbbells": ["Dumbbell Row", "Dumbbell Reverse Fly", "Single Arm Row"],
      "Barbell": ["Barbell Row", "T-Bar Row", "Underhand Grip Barbell Row"],
      "Machine": ["Lat Pulldown", "Seated Row Machine", "Assisted Pull-up Machine"],
      "Cable": ["Cable Row", "Face Pull", "Straight Arm Pulldown"],
      "Kettlebell": ["Kettlebell Row", "Kettlebell High Pull"],
      "Plate": ["Plate Pullover"],
      "Smith Machine": ["Smith Machine Row"],
      "Bodyweight": ["Pull-ups", "Inverted Row", "Australian Pull-ups"],
      "Cardio": ["Swimming (Butterfly, Freestyle)"]
    },
    "Triceps": {
      "Dumbbells": ["Dumbbell Tricep Extension", "Kickback", "Overhead Extension"],
      "Barbell": ["Close Grip Bench Press", "Skull Crushers", "Overhead Tricep Extension"],
      "Machine": ["Tricep Pushdown Machine", "Assisted Dip Machine"],
      "Cable": ["Tricep Pushdown", "Rope Pushdown", "Cable Overhead Extension"],
      "Kettlebell": ["Kettlebell Tricep Extension"],
      "Smith Machine": ["Smith Machine Close Grip Bench Press"],
      "Bodyweight": ["Dips", "Diamond Push-ups", "Bench Dips"],
      "Cardio": []
    },
    "Lower Back": {
      "Dumbbells": ["Dumbbell Romanian Deadlift", "Dumbbell Good Morning"],
      "Barbell": ["Barbell Romanian Deadlift", "Barbell Good Morning", "Hyperextension"],
      "Machine": ["Back Extension Machine", "45-Degree Back Extension"],
      "Cable": ["Cable Pull Through"],
      "Kettlebell": ["Kettlebell Swing", "Kettlebell Deadlift"],
      "Plate": ["Weighted Back Extension"],
      "Smith Machine": ["Smith Machine Romanian Deadlift"],
      "Bodyweight": ["Superman", "Bird Dog", "Back Extension"],
      "Cardio": ["Swimming (Backstroke)"]
    },
    "Glutes": {
      "Dumbbells": ["Dumbbell Hip Thrust", "Dumbbell Bulgarian Split Squat", "Dumbbell Step-up"],
      "Barbell": ["Barbell Hip Thrust", "Barbell Glute Bridge", "Barbell Romanian Deadlift"],
      "Machine": ["Glute Kickback Machine", "Abduction Machine"],
      "Cable": ["Cable Kickback", "Cable Pull Through"],
      "Kettlebell": ["Kettlebell Swing", "Kettlebell Deadlift", "Kettlebell Lunge"],
      "Smith Machine": ["Smith Machine Hip Thrust"],
      "Bodyweight": ["Single Leg Glute Bridge"],
      "Cardio": ["Stair Climber", "Incline Walking"]
    },
    "Hamstrings": {
      "Dumbbells": ["Dumbbell Romanian Deadlift", "Dumbbell Stiff Leg Deadlift"],
      "Barbell": ["Barbell Romanian Deadlift", "Barbell Good Morning", "Stiff Leg Deadlift"],
      "Machine": ["Leg Curl Machine", "Seated Leg Curl", "Glute-Ham Raise"],
      "Cable": ["Cable Pull Through", "Cable Leg Curl"],
      "Kettlebell": ["Kettlebell Romanian Deadlift", "Kettlebell Swing"],
      "Smith Machine": ["Smith Machine Romanian Deadlift"],
      "Bodyweight": ["Nordic Curl", "Stability Ball Leg Curl"],
      "Cardio": ["Cycling", "Uphill Walking"]
    },
  },
  female: {
    // Female exercises - optimized for female training needs
    "Shoulders": {
      "Dumbbells": ["Dumbbell Shoulder Press", "Dumbbell Lateral Raise", "Front Raise with Control", "Arnold Press"],
      "Barbell": ["Lighter Barbell Overhead Press", "Controlled Upright Row", "Push Press with Proper Form"],
      "Machine": ["Shoulder Press Machine", "Lateral Raise Machine", "Reverse Pec Deck"],
      "Cable": ["Cable Lateral Raise", "Cable Front Raise", "Face Pull with External Rotation"],
      "Kettlebell": ["Kettlebell Single Arm Press", "Kettlebell Push Press"],
      "Plate": ["Light Plate Front Raise", "Plate Lateral Raise"],
      "Smith Machine": ["Smith Machine Overhead Press", "Smith Machine Upright Row"],
      "Bodyweight": ["Incline Pike Push-ups", "Wall Handstand Hold", "Wall Push-ups"],
      "Cardio": []
    },
    "Chest": {
      "Dumbbells": ["Dumbbell Bench Press", "Dumbbell Flyes", "Incline Dumbbell Press", "Single Arm Dumbbell Press"],
      "Barbell": ["Barbell Bench Press", "Incline Bench Press", "Close Grip Bench Press"],
      "Machine": ["Chest Press Machine", "Pec Deck Machine", "Cable Crossover"],
      "Cable": ["Cable Flyes", "Cable Crossover", "Low Cable Crossover"],
      "Kettlebell": ["Kettlebell Floor Press", "Kettlebell Flyes"],
      "Plate": ["Plate Press", "Svend Press"],
      "Smith Machine": ["Smith Machine Bench Press", "Smith Machine Incline Press"],
      "Bodyweight": ["Push-ups", "Incline Push-ups", "Knee Push-ups", "Wall Push-ups"],
      "Cardio": []
    },
    "Biceps": {
      "Dumbbells": ["Dumbbell Bicep Curl", "Hammer Curl", "Concentration Curl", "Alternating Bicep Curl"],
      "Barbell": ["Lighter Barbell Curl", "EZ Bar Curl", "Reverse Grip Barbell Curl"],
      "Machine": ["Machine Bicep Curl", "Cable Bicep Curl"],
      "Cable": ["Cable Bicep Curl", "Cable Hammer Curl", "Rope Hammer Curl"],
      "Kettlebell": ["Kettlebell Bicep Curl", "Kettlebell Hammer Curl"],
      "Plate": ["Plate Curl"],
      "Smith Machine": [],
      "Bodyweight": ["Underhand Grip Inverted Row", "Assisted Chin-ups"],
      "Cardio": []
    },
    "Abs": {
      "Dumbbells": ["Dumbbell Russian Twist", "Light Weighted Crunch", "Side Bend"],
      "Barbell": [],
      "Machine": ["Ab Crunch Machine", "Hanging Leg Raise", "Roman Chair"],
      "Cable": ["Cable Crunch", "Cable Woodchopper", "Cable Oblique Twist"],
      "Kettlebell": ["Kettlebell Russian Twist", "Kettlebell Windmill"],
      "Plate": ["Plate Russian Twist", "Weighted Plank with Plate"],
      "Smith Machine": [],
      "Bodyweight": ["Crunches", "Leg Raises", "Plank", "Russian Twist", "Mountain Climbers", "Bicycle Crunch", "Reverse Crunch"],
      "Cardio": ["Mountain Climbers", "Plank Jacks"]
    },
    "Quads": {
      "Dumbbells": ["Dumbbell Squat", "Dumbbell Lunge", "Dumbbell Step-up", "Goblet Squat"],
      "Barbell": ["Barbell Squat", "Front Squat", "Barbell Bulgarian Split Squat", "Barbell Lunge"],
      "Machine": ["Leg Press", "Leg Extension", "Hack Squat Machine"],
      "Cable": ["Cable Squat"],
      "Kettlebell": ["Kettlebell Goblet Squat", "Kettlebell Lunge", "Kettlebell Step-up"],
      "Plate": ["Plate Squat"],
      "Smith Machine": ["Smith Machine Squat", "Smith Machine Split Squat"],
      "Bodyweight": ["Bodyweight Squat", "Walking Lunge", "Split Squat", "Jump Squat", "Box Step-up"],
      "Cardio": ["Stair Climber", "Cycling", "Jump Rope", "Box Jumps"]
    },
    "Calves": {
      "Dumbbells": ["Dumbbell Calf Raise", "Seated Dumbbell Calf Raise"],
      "Barbell": ["Standing Calf Raise", "Barbell Seated Calf Raise"],
      "Machine": ["Standing Calf Raise Machine", "Seated Calf Raise Machine", "Leg Press Calf Raise"],
      "Cable": [],
      "Kettlebell": ["Kettlebell Calf Raise"],
      "Plate": ["Single Leg Plate Calf Raise"],
      "Smith Machine": ["Smith Machine Calf Raise"],
      "Bodyweight": ["Standing Bodyweight Calf Raise", "Single Leg Calf Raise", "Seated Calf Raise"],
      "Cardio": ["Jump Rope", "Box Jumps"]
    },
    "Upper Back": {
      "Dumbbells": ["Dumbbell Row", "Dumbbell Reverse Fly", "Single Arm Row"],
      "Barbell": ["Barbell Row", "T-Bar Row", "Underhand Grip Barbell Row"],
      "Machine": ["Lat Pulldown", "Seated Row Machine", "Assisted Pull-up Machine"],
      "Cable": ["Cable Row", "Face Pull", "Straight Arm Pulldown"],
      "Kettlebell": ["Kettlebell Row", "Kettlebell High Pull"],
      "Plate": ["Plate Pullover"],
      "Smith Machine": ["Smith Machine Row"],
      "Bodyweight": ["Assisted Pull-ups", "Inverted Row", "TRX Row"],
      "Cardio": ["Swimming (Butterfly, Freestyle)"]
    },
    "Triceps": {
      "Dumbbells": ["Dumbbell Tricep Extension", "Kickback", "Overhead Extension"],
      "Barbell": ["Close Grip Bench Press", "Skull Crushers", "Overhead Tricep Extension"],
      "Machine": ["Tricep Pushdown Machine", "Assisted Dip Machine"],
      "Cable": ["Tricep Pushdown", "Rope Pushdown", "Cable Overhead Extension"],
      "Kettlebell": ["Kettlebell Tricep Extension"],
      "Smith Machine": ["Smith Machine Close Grip Bench Press"],
      "Bodyweight": ["Bench Dips", "Incline Push-ups", "Diamond Push-ups"],
      "Cardio": []
    },
    "Lower Back": {
      "Dumbbells": ["Dumbbell Romanian Deadlift", "Dumbbell Good Morning"],
      "Barbell": ["Barbell Romanian Deadlift", "Barbell Good Morning", "Hyperextension"],
      "Machine": ["Back Extension Machine", "45-Degree Back Extension"],
      "Cable": ["Cable Pull Through"],
      "Kettlebell": ["Kettlebell Swing", "Kettlebell Deadlift"],
      "Plate": ["Weighted Back Extension"],
      "Smith Machine": ["Smith Machine Romanian Deadlift"],
      "Bodyweight": ["Superman", "Bird Dog", "Back Extension"],
      "Cardio": ["Swimming (Backstroke)"]
    },
    "Glutes": {
      "Dumbbells": ["Dumbbell Hip Thrust", "Dumbbell Bulgarian Split Squat", "Dumbbell Step-up"],
      "Barbell": ["Barbell Hip Thrust", "Barbell Glute Bridge", "Barbell Romanian Deadlift"],
      "Machine": ["Glute Kickback Machine", "Abduction Machine"],
      "Cable": ["Cable Kickback", "Cable Pull Through"],
      "Kettlebell": ["Kettlebell Swing", "Kettlebell Deadlift", "Kettlebell Lunge"],
      "Smith Machine": ["Smith Machine Hip Thrust"],
      "Bodyweight": ["Single Leg Glute Bridge", "Fire Hydrant", "Donkey Kick", "Frog Pump"],
      "Cardio": ["Stair Climber", "Incline Walking", "Hip Thrust Pulses"]
    },
    "Hamstrings": {
      "Dumbbells": ["Dumbbell Romanian Deadlift", "Dumbbell Stiff Leg Deadlift"],
      "Barbell": ["Barbell Romanian Deadlift", "Barbell Good Morning", "Stiff Leg Deadlift"],
      "Machine": ["Leg Curl Machine", "Seated Leg Curl", "Glute-Ham Raise"],
      "Cable": ["Cable Pull Through", "Cable Leg Curl"],
      "Kettlebell": ["Kettlebell Romanian Deadlift", "Kettlebell Swing"],
      "Smith Machine": ["Smith Machine Romanian Deadlift"],
      "Bodyweight": ["Nordic Curl", "Stability Ball Leg Curl"],
      "Cardio": ["Cycling", "Uphill Walking"]
    }
  }
};

// Add new function to filter exercises by equipment type, using the enhanced data
const filterExercisesByEquipment = (muscleName, equipmentType, bodyType) => {
  if (!muscleName) return [];
  
  if (!equipmentType || equipmentType === "All Equipment") {
    // Return all exercises for this muscle group
    return Object.values(muscleExercisesByEquipment[bodyType][muscleName] || {}).flat();
  }
  
  // Return exercises for this muscle group and equipment type
  return muscleExercisesByEquipment[bodyType][muscleName]?.[equipmentType] || [];
};

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
    isLoading: false,
    selectedEquipment: "All Equipment",
    muscleExerciseFilter: "All Equipment" // New state for muscle-specific equipment filter
  });

  const exerciseModalContentRef = useRef(null);
  const imageRef = useRef(null);

  // Memoized values
  const bodyImages = useMemo(() => ({
    male: maleTitanImage,
    female: femaleTitanImage,
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
      bodyType: prev.bodyType === "male" ? "female" : "male",
      muscleExerciseFilter: "All Equipment", // Reset muscle filter when changing body type
      selectedEquipment: "All Equipment", // Reset equipment filter when changing body type
      activeMuscleIndex: null,
      selectedMuscle: null,
      hoveredMuscle: null
    }));
    handleResetView();
  };

  // Get alternative exercise asset with proper fallback
  const getAlternativeExerciseAsset = (exerciseName) => {
    const asset = getExerciseAssetByGender(exerciseName, state.bodyType);
    
    if (!asset) {
      console.warn(`No asset found for exercise: ${exerciseName}`);
      return {
        src: fixAssetPath("/assets/placeholder-exercise.png"),
        description: "Demonstration for this exercise will be added soon.",
        equipment: "Varies",
        difficulty: "Intermediate"
      };
    }
    
    // Add debugging to help diagnose path issues
    console.log(`Loading asset for ${exerciseName}:`, asset.src);
    
    return asset;
  };

  // Filter exercises based on selected equipment
  const getFilteredExercises = useCallback((muscleGroup) => {
    if (!muscleGroup || !muscleGroup.name) return [];
    return filterExercisesByEquipment(muscleGroup.name, state.selectedEquipment, state.bodyType);
  }, [state.selectedEquipment, state.bodyType]);

  // Handle equipment filter change
  const handleEquipmentChange = (equipment) => {
    setState(prev => ({
      ...prev,
      selectedEquipment: equipment,
      // Reset active muscle when changing equipment
      activeMuscleIndex: null,
      selectedMuscle: null,
      hoveredMuscle: null
    }));
  };

  // Check if a muscle group has exercises for the selected equipment
  const hasMuscleExercisesForEquipment = useCallback((muscleName) => {
    if (state.selectedEquipment === "All Equipment") {
      return true;
    }
    
    const exercises = muscleExercisesByEquipment[state.bodyType][muscleName]?.[state.selectedEquipment];
    return exercises && exercises.length > 0;
  }, [state.selectedEquipment, state.bodyType]);

  // Get equipment type for display in exercise detail
  const getExerciseEquipment = useCallback((exerciseName) => {
    for (const equipment of equipmentTypes) {
      if (equipment === "All Equipment") continue;
      
      for (const muscleGroup in muscleExercisesByEquipment[state.bodyType]) {
        const exercisesForEquipment = muscleExercisesByEquipment[state.bodyType][muscleGroup][equipment] || [];
        if (exercisesForEquipment.includes(exerciseName)) {
          return equipment;
        }
      }
    }
    return "Bodyweight"; // Default fallback
  }, [state.bodyType]);

  // Get alternative exercises for the selected exercise
  const getAlternativeExercises = useCallback((exerciseName, limit = 3) => {
    const equipment = getExerciseEquipment(exerciseName);
    const alternatives = [];
    
    // Find the muscle group this exercise belongs to
    let exerciseMuscleGroup = null;
    for (const muscleGroup in muscleExercisesByEquipment[state.bodyType]) {
      const exercisesForEquipment = muscleExercisesByEquipment[state.bodyType][muscleGroup][equipment] || [];
      if (exercisesForEquipment.includes(exerciseName)) {
        exerciseMuscleGroup = muscleGroup;
        break;
      }
    }
    
    if (!exerciseMuscleGroup) return [];
    
    // Get exercises from different equipment types for the same muscle
    for (const altEquipment of equipmentTypes) {
      if (altEquipment === "All Equipment" || altEquipment === equipment) continue;
      
      const altExercises = muscleExercisesByEquipment[state.bodyType][exerciseMuscleGroup][altEquipment] || [];
      if (altExercises.length > 0) {
        alternatives.push(altExercises[0]); // Add the first exercise of each equipment type
      }
      
      if (alternatives.length >= limit) break;
    }
    
    return alternatives;
  }, [state.bodyType, getExerciseEquipment]);

  // This replaces the getExerciseAsset function for the exercise modal
   const getExerciseDetails = useCallback((exerciseName) => {
    const equipment = getExerciseEquipment(exerciseName);
    const exerciseData = getExerciseAssetByGender(exerciseName, state.bodyType);
    
    if (!exerciseData) {
      return {
        src: fixAssetPath("/assets/placeholder-exercise.png"),
        description: "Demonstration for this exercise will be added soon.",
        equipment: equipment,
        difficulty: "Intermediate",
        alternatives: getAlternativeExercises(exerciseName, 3)
      };
    }
    
    return {
      src: exerciseData.src || fixAssetPath("/assets/placeholder-exercise.png"),
      description: exerciseData.description || "Demonstration for this exercise will be added soon.",
      equipment: equipment,
      difficulty: exerciseData.difficulty || "Intermediate",
      alternatives: getAlternativeExercises(exerciseName, 3)
    };
  }, [state.bodyType, getExerciseEquipment, getAlternativeExercises]);

  // Handle muscle-specific equipment filter change
  const handleMuscleExerciseFilterChange = (equipment) => {
    setState(prev => ({
      ...prev,
      muscleExerciseFilter: equipment
    }));
  };

  // Get filtered exercises for a specific muscle group with secondary filter
  const getFilteredExercisesWithSecondaryFilter = useCallback((muscleGroup) => {
    if (!muscleGroup || !muscleGroup.name) return [];
    
    // Get the muscle group's exercises for the current body type
    const muscleExercises = muscleExercisesByEquipment[state.bodyType][muscleGroup.name];
    if (!muscleExercises) return [];
    
    // If 'All Equipment' is selected, return all exercises for the muscle group
    if (state.selectedEquipment === "All Equipment" && state.muscleExerciseFilter === "All Equipment") {
      return Object.values(muscleExercises).flat();
    }
    
    // If a specific equipment is selected in the main filter
    if (state.selectedEquipment !== "All Equipment") {
      return muscleExercises[state.selectedEquipment] || [];
    }
    
    // If only the secondary filter has a specific equipment selected
    if (state.muscleExerciseFilter !== "All Equipment") {
      return muscleExercises[state.muscleExerciseFilter] || [];
    }
    
    // Default case: return all exercises
    return Object.values(muscleExercises).flat();
  }, [state.selectedEquipment, state.muscleExerciseFilter, state.bodyType]);

  // Get available equipment types for a muscle group (for secondary filter)
  const getAvailableEquipmentForMuscle = useCallback((muscleName) => {
    if (!muscleName) return [];
    
    const availableEquipment = ["All Equipment"];
    
    // Add only equipment types that have exercises for this muscle and body type
    for (const equipment of equipmentTypes) {
      if (equipment === "All Equipment") continue;
      
      const exercises = muscleExercisesByEquipment[state.bodyType][muscleName]?.[equipment] || [];
      if (exercises.length > 0) {
        availableEquipment.push(equipment);
      }
    }
    
    return availableEquipment;
  }, [state.bodyType]);

  useEffect(() => {
    // Validate that exercise data is properly loaded
    if (!muscleExercisesByEquipment[state.bodyType]) {
      console.warn(`No exercise data found for body type: ${state.bodyType}`);
      return;
    }

    const currentMuscleGroup = state.selectedMuscleGroup;
    if (!currentMuscleGroup || !currentMuscleGroup.name) return;

    const muscleExercises = muscleExercisesByEquipment[state.bodyType][currentMuscleGroup.name];
    if (!muscleExercises) {
      console.warn(`No exercises found for muscle group: ${currentMuscleGroup.name}`);
      return;
    }

    // Update available equipment based on current muscle group
    const availableEquipment = Object.keys(muscleExercises);
    if (availableEquipment.length === 0) {
      console.warn(`No equipment types found for muscle group: ${currentMuscleGroup.name}`);
      return;
    }

    setState(prev => ({
      ...prev,
      availableEquipment: ["All Equipment", ...availableEquipment],
      muscleExerciseFilter: "All Equipment"
    }));
  }, [state.selectedMuscleGroup, state.bodyType]);

  return (
    <div className="min-h-screen py-4 px-4 max-w-6xl mx-auto" role="main" aria-label="Interactive Muscle Guide">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Interactive Muscle Guide
      </h1>

      <p className="text-center mb-5">
        Hover over or click on any muscle area to explore exercises
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar with filters */}
        <div className="md:w-1/4 flex flex-col gap-4">
      {/* Body Type Toggle */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Body Type</h3>
            <div className="flex justify-center">
        <BodyTypeToggle 
          bodyType={state.bodyType} 
          onToggle={toggleBodyType} 
        />
            </div>
      </div>

          {/* Equipment Filter */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Equipment</h3>
            <div className="flex flex-col gap-1">
              {equipmentTypes.map(equipment => (
                <button
                  key={equipment}
                  onClick={() => handleEquipmentChange(equipment)}
                  className={`px-3 py-2 text-sm rounded transition-colors text-left ${
                    state.selectedEquipment === equipment
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {equipment}
                </button>
              ))}
            </div>
          </div>
      </div>

        {/* Middle section with body image - add a fixed height container */}
        <div className="md:w-2/5 relative">
          <div className="relative mx-auto h-[500px] flex items-center justify-center">
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
              className={`max-h-[500px] object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
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

        {/* Right section with muscle group selection or exercise details - add min-height */}
        <div className={`md:w-1/3 ${state.scrolled ? "md:hidden" : ""}`}>
          {state.activeMuscleIndex !== null ? (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm min-h-[500px] overflow-auto">
              <h2 className="text-xl font-bold mb-2">
                {allMuscles[state.activeMuscleIndex].name} Exercises
                {state.selectedEquipment !== "All Equipment" && (
                  <span className="text-sm font-normal ml-2 text-blue-600">
                    ({state.selectedEquipment})
                  </span>
                )}
              </h2>
              
              {/* Secondary filter - only show when All Equipment is selected */}
              {state.selectedEquipment === "All Equipment" && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Filter by equipment:</p>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto pb-1">
                    {getAvailableEquipmentForMuscle(getCurrentMuscleName()).map(equipment => (
                      <button
                        key={equipment}
                        onClick={() => handleMuscleExerciseFilterChange(equipment)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          state.muscleExerciseFilter === equipment
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {equipment}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Use the enhanced filtering function */}
              {(() => {
                const filteredExercises = getFilteredExercisesWithSecondaryFilter(allMuscles[state.activeMuscleIndex]);
                
                if (filteredExercises.length === 0) {
                  return (
                    <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                      <p>No {state.muscleExerciseFilter} exercises found for {allMuscles[state.activeMuscleIndex].name}.</p>
                      <button 
                        onClick={() => setState(prev => ({ 
                          ...prev, 
                          muscleExerciseFilter: "All Equipment",
                          selectedEquipment: "All Equipment" 
                        }))}
                        className="mt-2 text-blue-500 hover:underline"
                      >
                        View all equipment types
                      </button>
                    </div>
                  );
                }
                
                // Group exercises by equipment type for better organization
                const exercisesByEquipment = {};
                
                // Only group when showing all equipment
                if (state.selectedEquipment === "All Equipment" && state.muscleExerciseFilter === "All Equipment") {
                  filteredExercises.forEach(exercise => {
                    const equipment = getExerciseEquipment(exercise);
                    if (!exercisesByEquipment[equipment]) {
                      exercisesByEquipment[equipment] = [];
                    }
                    exercisesByEquipment[equipment].push(exercise);
                  });
                  
                  return (
                    <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                      {Object.entries(exercisesByEquipment).map(([equipment, exercises]) => (
                        <div key={equipment} className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                          <h3 className="font-medium text-sm uppercase text-gray-600 dark:text-gray-300 border-b pb-1 mb-2">
                            {equipment}
                          </h3>
                          <ul className="space-y-1">
                            {exercises.map((exercise, idx) => (
                              <li key={idx} className="py-1">
                      <button
                        onClick={() => handleViewExercise(exercise)}
                                  className="flex items-center w-full text-left hover:text-blue-500 text-sm"
                      >
                        <span className="font-medium">{exercise}</span>
                      </button>
                    </li>
                            ))}
              </ul>
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  // Simple list for filtered equipment
                  return (
                    <div className="h-[400px] overflow-y-auto pr-2">
                      <div className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                        <h3 className="font-medium text-sm uppercase text-gray-600 dark:text-gray-300 border-b pb-1 mb-2">
                          {state.muscleExerciseFilter}
                        </h3>
                        <ul className="space-y-1">
                          {filteredExercises.map((exercise, idx) => (
                            <li key={idx} className="py-1">
                              <button
                                onClick={() => handleViewExercise(exercise)}
                                className="flex items-center w-full text-left hover:text-blue-500 text-sm"
                              >
                                <span className="font-medium">{exercise}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                }
              })()}
              
              <div className="flex space-x-2 mt-4">
              <button
                onClick={handleResetView}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset View
              </button>
                {state.muscleExerciseFilter !== "All Equipment" && (
                  <button
                    onClick={() => setState(prev => ({ ...prev, muscleExerciseFilter: "All Equipment" }))}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Show All
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-sm min-h-[500px]">
              <h2 className="text-lg font-semibold mb-2">Select a Muscle Group</h2>

              <div className="grid grid-cols-1 gap-1">
                {allMuscles.map((muscle, idx) => {
                  // Check if this muscle has exercises for the selected equipment
                  const hasExercisesForEquipment = hasMuscleExercisesForEquipment(muscle.name);
                  
                  return (
                  <button
                    key={idx}
                    onClick={() => {
                        if (hasExercisesForEquipment) {
                      setState(prev => ({
                        ...prev,
                        activeMuscleIndex: idx,
                        hoveredMuscle: muscle.name
                      }));
                        }
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
                      className={`text-left py-1.5 px-2 text-sm bg-white dark:bg-gray-700 rounded-md 
                        ${hasExercisesForEquipment 
                          ? 'hover:bg-blue-50 dark:hover:bg-gray-600' 
                          : 'opacity-50 cursor-not-allowed'
                        }`}
                      disabled={!hasExercisesForEquipment}
                  >
                    {muscle.name}
                      {state.selectedEquipment !== "All Equipment" && !hasExercisesForEquipment && (
                        <span className="ml-1 text-xs text-red-500">
                          (no exercises)
                        </span>
                      )}
                  </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Exercise Window when scrolled - update to show filtered exercises */}
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
                {state.selectedEquipment !== "All Equipment" && (
                  <span className="text-xs font-normal ml-2 text-blue-600">
                    ({state.selectedEquipment})
                  </span>
                )}
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
            {(() => {
              const filteredExercises = getFilteredExercises(allMuscles[state.activeMuscleIndex]);
              
              if (filteredExercises.length === 0) {
                return (
                  <div className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <p>No {state.selectedEquipment} exercises available.</p>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, selectedEquipment: "All Equipment" }))}
                      className="mt-2 text-xs text-blue-500 hover:underline"
                    >
                      Show all equipment
                    </button>
                  </div>
                );
              }
              
              return (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredExercises.map((exercise, idx) => (
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
              );
            })()}
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
                  <ExerciseImage
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
                const exerciseDetails = getExerciseDetails(state.viewingExercise);
                return (
                  <ExerciseImage
  src={exerciseDetails.src}
  alt={`${state.viewingExercise} demonstration`}
  className="w-full object-contain max-h-60"
                  />
                );
              })()}
            </div>

            <div className="text-gray-700 dark:text-gray-300">
              <h4 className="font-bold mb-1">How to perform:</h4>
              <p>{getExerciseDetails(state.viewingExercise).description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {getExerciseDetails(state.viewingExercise).equipment && (
                  <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Equipment:{" "}
                      {getExerciseDetails(state.viewingExercise).equipment}
                    </span>
                  </div>
                )}
                {getExerciseDetails(state.viewingExercise).difficulty && (
                  <div className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1">
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                      Difficulty:{" "}
                      {getExerciseDetails(state.viewingExercise).difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Improved Alternatives Section */}
            <div className="mt-4">
              <h4 className="font-bold mb-2">Alternative Exercises:</h4>
              <div className="flex flex-wrap gap-2">
                {getExerciseDetails(state.viewingExercise).alternatives.map(
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



