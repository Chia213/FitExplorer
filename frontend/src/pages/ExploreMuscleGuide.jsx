import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import BodyTypeToggle from "../components/BodyTypeToggle";

const exerciseAlternatives = {
  // Shoulder Exercises Alternatives
  "Arnold Dumbbell Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/arnold-dumbbell-press.gif",
      description:
        "Seated dumbbell press with a rotational movement, targeting shoulders from multiple angles.",
    },
    female: {
      src: "/src/assets/exercises/female/arnold-press.gif",
      description:
        "Perform seated dumbbell press with a controlled rotational motion, focusing on shoulder muscle engagement.",
    },
  },

  "Seated Dumbbell Shoulder Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/seated-dumbbell-shoulder-press.gif",
      description:
        "Seated press with dumbbells, providing more range of motion compared to barbell press.",
    },
    female: {
      src: "/src/assets/exercises/female/seated-dumbbell-press.gif",
      description:
        "Seated dumbbell press with lighter weights, maintaining proper form and shoulder alignment.",
    },
  },

  "Cable Lateral Raise": {
    type: "animation",
    equipment: "Cable Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-lateral-raise.gif",
      description:
        "Raise your arm to the side using a cable machine, focusing on controlled movement for shoulder isolation.",
    },
    female: {
      src: "/src/assets/exercises/female/female-cable-lateral-raise.gif",
      description:
        "Cable lateral raise with smooth tension, targeting the side delts for balanced shoulder development.",
    },
  },

  "Lateral Raise Machine": {
    type: "animation",
    equipment: "Lateral Raise Machine",
    difficulty: "Beginners",
    male: {
      src: "/src/assets/exercises/male/lateral-raise-machine.gif",
      description:
        "Use a lateral raise machine to lift arms outward, keeping the motion slow and controlled for side delts.",
    },
    female: {
      src: "/src/assets/exercises/female/female-machine-lateral-raise.gif",
      description:
        "Perform lateral raises on a machine for stable, consistent tension that isolates the side shoulder muscles.",
    },
  },

  "Plate Shoulder Press": {
    type: "animation",
    equipment: "Weight Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/plate-shoulder-press.gif",
      description:
        "Hold a weight plate with both hands and raise it in front of your body to shoulder height, then lower it with control.",
    },
    female: {
      src: "/src/assets/exercises/female/plate-front-raise.gif",
      description:
        "Front raise using a plate for focused shoulder activation, maintaining steady movement throughout.",
    },
  },

  "Cable Front Raise": {
    type: "animation",
    equipment: "Cable Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/cable-front-raise.gif",
      description:
        "Raise the cable handle in front of you to shoulder height, keeping a controlled pace and straight arms.",
    },
    female: {
      src: "/src/assets/exercises/female/cable-front-raise.gif",
      description:
        "Perform front raises using a cable machine to target shoulders with constant tension and control.",
    },
  },

  "Barbell Shrugs": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternatives/barbell-shrugs.gif",
      description:
        "Stand holding a barbell in front of your body, lift your shoulders straight up, then lower and repeat.",
    },
    female: {
      src: "/src/assets/exercises/female/barbell-shrugs.gif",
      description:
        "Perform shrugs with a barbell in front, lifting shoulders up and lowering with control.",
    },
  },

  "Smith Machine Shrug": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/alternatives/smith-machine-shrug.gif",
      description:
        "Stand inside a Smith machine, grip the bar and shrug shoulders upward, then lower back down slowly.",
    },
    female: {
      src: "/src/assets/exercises/female/smith-machine-shrug.gif",
      description:
        "Use a Smith machine for controlled shrugs, focusing on slow upward and downward shoulder motion.",
    },
  },

  "Lever Seated Shoulder Press": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/lever-seated-shoulder-press.gif",
      description:
        "Controlled shoulder press using a machine, providing stability and consistent resistance.",
    },
    female: {
      src: "/src/assets/exercises/female/female-lever-seated-shoulder-press.gif",
      description:
        "Machine shoulder press with adjustable resistance, ideal for building shoulder strength safely.",
    },
  },
  "Resistance Band Shoulder Press": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/resistance-band-shoulder-press.gif",
      description:
        "Shoulder press using resistance bands, offering variable tension throughout the movement.",
    },
    female: {
      src: "/src/assets/exercises/female/female-resistance-band-shoulder-press.gif",
      description:
        "Gentle shoulder press with resistance bands, great for building shoulder strength with low joint stress.",
    },
  },

  // Bicep Curl Alternatives
  "Hammer Curl": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/hammer-curl.gif",
      description:
        "Curl with palms facing each other, targeting biceps and forearms with a neutral grip.",
    },
    female: {
      src: "/src/assets/exercises/female/hammer-curl.gif",
      description:
        "Perform curls with a neutral grip, focusing on controlled movement and bicep engagement.",
    },
  },
  "Cable Curls": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/cable-curls.gif",
      description:
        "Bicep curls using cable machine, providing constant tension throughout the movement.",
    },
    female: {
      src: "/src/assets/exercises/female/cable-curls.gif",
      description:
        "Cable curls with lighter weight, maintaining proper form and muscle control.",
    },
  },
  "Preacher Curls": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/preacher-curls.gif",
      description:
        "Bicep curls performed on a preacher bench, isolating bicep muscles and reducing body momentum.",
    },
    female: {
      src: "/src/assets/exercises/female/preacher-curls.gif",
      description:
        "Seated preacher curls with focus on bicep isolation and controlled movement.",
    },
  },

  // Push-up Alternatives
  "Knee Push-ups": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/knee-pushups.gif",
      description:
        "Modified push-ups performed on knees, reducing body weight and helping build strength.",
    },
    female: {
      src: "/src/assets/exercises/female/knee-pushups.gif",
      description:
        "Knee push-ups providing a modified approach to building upper body strength.",
    },
  },
  "Wall Push-ups": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/wall-pushups.gif",
      description:
        "Push-ups performed against a wall, great for beginners or rehabilitation.",
    },
    female: {
      src: "/src/assets/exercises/female/wall-pushups.gif",
      description:
        "Gentle push-ups against a wall, ideal for building initial upper body strength.",
    },
  },
  "Incline Push-ups": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/incline-pushups.gif",
      description:
        "Push-ups performed with hands elevated, reducing difficulty and targeting chest muscles.",
    },
    female: {
      src: "/src/assets/exercises/female/incline-pushups.gif",
      description:
        "Elevated push-ups providing a modified approach to chest and arm strengthening.",
    },
  },

  // Squat Alternatives
  "Bodyweight Squats": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/bodyweight-squats.gif",
      description:
        "Squats performed without additional weight, focusing on form and lower body engagement.",
    },
    female: {
      src: "/src/assets/exercises/female/bodyweight-squats.gif",
      description:
        "Controlled bodyweight squats emphasizing proper form and muscle activation.",
    },
  },
  "Wall Squats": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/wall-squats.gif",
      description:
        "Isometric squat hold against a wall, building endurance and leg strength.",
    },
    female: {
      src: "/src/assets/exercises/female/wall-squats.gif",
      description:
        "Wall squats with focus on maintaining proper alignment and building lower body endurance.",
    },
  },
  "Sumo Squats": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/sumo-squats.gif",
      description:
        "Wide-stance squats targeting inner thighs and providing variation to traditional squats.",
    },
    female: {
      src: "/src/assets/exercises/female/sumo-squats.gif",
      description:
        "Sumo squats with emphasis on inner thigh and glute engagement.",
    },
  },

  // Plank Alternatives
  "Knee Planks": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/knee-planks.gif",
      description:
        "Modified plank performed on knees, reducing body weight and helping build core strength.",
    },
    female: {
      src: "/src/assets/exercises/female/knee-planks.gif",
      description:
        "Knee planks providing a gentler approach to core strengthening.",
    },
  },
  "Side Planks": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/side-planks.gif",
      description:
        "Plank variation focusing on obliques and lateral core muscles.",
    },
    female: {
      src: "/src/assets/exercises/female/side-planks.gif",
      description:
        "Side planks targeting core stability and lateral muscle groups.",
    },
  },
  "Plank with Shoulder Taps": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/male/plank-shoulder-taps.gif",
      description:
        "Plank position with alternating shoulder taps, adding dynamic core engagement.",
    },
    female: {
      src: "/src/assets/exercises/female/plank-shoulder-taps.gif",
      description:
        "Shoulder tap planks providing additional core challenge and stability work.",
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
      description:
        "Sit on a bench with back support, grip the bar, press it overhead, and lower it back to shoulder height. Repeat.",
      alternatives: ["Arnold Dumbbell Press", "Seated Dumbbell Shoulder Press"],
    },
    female: {
      src: "/src/assets/exercises/female/female-seated-barbell-shoulder-press.gif", // Placeholder
      description:
        "Sit with back supported, press dumbbells upward with slightly adjusted form. Lower weights to shoulder level and repeat.",
      alternatives: [
        "Lever Seated Shoulder Press",
        "Resistance Band Shoulder Press",
      ],
    },
  },
  "Dumbbell Lateral Raise": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/lateral-raise.gif",
      description:
        "Stand with dumbbells at sides, raise arms out to sides until parallel with floor, then lower and repeat.",
      alternatives: ["Cable Lateral Raise", "Lateral Raise Machine"],
    },
    female: {
      src: "/src/assets/exercises/female/lateral-raise.gif", // Placeholder
      description:
        "Stand with lighter weights, raise arms out to sides with controlled motion, keeping core engaged.",
      alternatives: [
        "Resistance Band Lateral Raises",
        "Single-Arm Lateral Raises",
      ],
    },
  },
  "Dumbbell Front Raise": {
    type: "animation",
    equipment: "Dumbbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-front-raise.gif",
      description:
        "Stand holding dumbbells in front of thighs, raise arms forward and up to shoulder height, then lower and repeat.",
      alternatives: ["Plate Shoulder Press", "Cable Front Raise"],
    },
    female: {
      src: "/src/assets/exercises/female/front-raise.gif", // Placeholder
      description:
        "Stand with lighter weights, raise arms forward to shoulder height with controlled movement.",
      alternatives: ["Resistance Band Front Raises", "Plate Shoulder Press"],
    },
  },
  "Dumbbell Shrug": {
    type: "animation",
    equipment: "Dumbbell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-shrug.gif",
      description:
        "Stand holding weights at sides, lift shoulders up toward ears, hold briefly, then lower and repeat.",
      alternatives: ["Barbell Shrugs", "Smith Machine Shrug"],
    },
    female: {
      src: "/src/assets/exercises/female/shrugs.gif", // Placeholder
      description:
        "Stand with lighter weights, lift shoulders up toward ears with controlled motion.",
      alternatives: ["Machine Shrugs", "Resistance Band Shrugs"],
    },
  },
  "Bench Press": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/bench-press.gif",
      description:
        "Lie on bench, lower barbell to chest, then press up until arms are extended. Repeat.",
      alternatives: ["Dumbbell Bench Press", "Incline Bench Press"],
    },
    female: {
      src: "/src/assets/exercises/female/bench-press.gif", // Placeholder
      description:
        "Lie on bench with adjusted grip width, lower barbell to chest, then press up with controlled motion.",
      alternatives: ["Push-ups", "Dumbbell Chest Press", "Machine Chest Press"],
    },
  },
  "Push-ups": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/pushups.gif",
      description:
        "Start in plank position, lower chest to floor by bending elbows, then push back up. Repeat.",
      alternatives: ["Knee Push-ups", "Incline Push-ups"],
    },
    female: {
      src: "/src/assets/exercises/female/pushups.gif", // Placeholder
      description:
        "Start in modified plank or knee position, lower chest to floor with proper form, then push back up.",
      alternatives: ["Wall Push-ups", "Assisted Push-ups", "Bench Push-ups"],
    },
  },
  "Bicep Curl": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/bicep-curl.gif",
      description:
        "Stand with dumbbells at sides, curl weights up while keeping elbows close to torso, then lower and repeat.",
      alternatives: ["Hammer Curls", "Barbell Curls"],
    },
    female: {
      src: "/src/assets/exercises/female/bicep-curl.gif", // Placeholder
      description:
        "Stand with lighter weights, curl up with controlled motion, focusing on muscle contraction.",
      alternatives: ["Resistance Band Curls", "Preacher Curls", "Cable Curls"],
    },
  },
  Crunches: {
    type: "animation",
    male: {
      src: "/src/assets/exercises/crunches.gif",
      description:
        "Lie on back with knees bent, contract abs to lift shoulders off floor, then lower and repeat.",
      alternatives: ["Bicycle Crunches", "Reverse Crunches"],
    },
    female: {
      src: "/src/assets/exercises/female/crunches.gif", // Placeholder
      description:
        "Lie on back with knees bent, engage core to lift shoulders, focusing on controlled movement.",
      alternatives: ["Planks", "Leg Raises", "Russian Twists"],
    },
  },
  Squats: {
    type: "animation",
    male: {
      src: "/src/assets/exercises/squats.gif",
      description:
        "Stand with feet shoulder-width apart, bend knees to lower body as if sitting, then stand back up.",
      alternatives: ["Barbell Squats", "Goblet Squats"],
    },
    female: {
      src: "/src/assets/exercises/female/squats.gif", // Placeholder
      description:
        "Stand with feet shoulder-width apart, lower body with proper form, keeping knees aligned with toes.",
      alternatives: ["Bodyweight Squats", "Wall Squats", "Sumo Squats"],
    },
  },
  Lunges: {
    type: "animation",
    male: {
      src: "/src/assets/exercises/lunges.gif",
      description:
        "Step forward with one leg, lower body until both knees are bent 90 degrees, then push back up.",
      alternatives: ["Walking Lunges", "Reverse Lunges"],
    },
    female: {
      src: "/src/assets/exercises/female/lunges.gif", // Placeholder
      description:
        "Step forward with controlled motion, lower body with balance and stability, focusing on proper alignment.",
      alternatives: ["Stationary Lunges", "Reverse Lunges", "Step-ups"],
    },
  },
  Plank: {
    type: "animation",
    male: {
      src: "/src/assets/exercises/planks.gif",
      description:
        "Hold push-up position with weight on forearms, keeping body straight from head to heels.",
      alternatives: ["Side Planks", "Plank with Leg Lifts"],
    },
    female: {
      src: "/src/assets/exercises/female/planks.gif", // Placeholder
      description:
        "Hold push-up position with focus on core engagement, maintaining a straight line from head to heels.",
      alternatives: ["Knee Planks", "Side Planks", "Plank with Shoulder Taps"],
    },
  },
  Deadlifts: {
    type: "animation",
    male: {
      src: "/src/assets/exercises/deadlifts.gif",
      description:
        "Stand with barbell at feet, bend at hips and knees to grasp bar, then stand up straight lifting the bar.",
      alternatives: ["Romanian Deadlifts", "Sumo Deadlifts"],
    },
    female: {
      src: "/src/assets/exercises/female/deadlifts.gif", // Placeholder
      description:
        "Lift with proper form, focusing on hip hinge and maintaining a neutral spine.",
      alternatives: [
        "Kettlebell Deadlifts",
        "Single-Leg Deadlifts",
        "Dumbbell Deadlifts",
      ],
    },
  },
  "Tricep Extensions": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/tricep-extensions.gif",
      description:
        "Hold weight overhead, lower behind head by bending elbows, then extend arms back up.",
      alternatives: ["Skull Crushers", "Cable Tricep Pushdowns"],
    },
    female: {
      src: "/src/assets/exercises/female/tricep-extensions.gif", // Placeholder
      description:
        "Perform with lighter weight, focusing on controlled movement and proper form.",
      alternatives: [
        "Resistance Band Tricep Extensions",
        "Overhead Tricep Dips",
      ],
    },
  },
  "Hip Thrusts": {
    type: "animation",
    male: {
      src: "/src/assets/exercises/hip-thrusts.gif",
      description:
        "Sit with upper back against bench, barbell across hips, thrust hips upward, then lower and repeat.",
      alternatives: ["Glute Bridges", "Single-Leg Hip Thrusts"],
    },
    female: {
      src: "/src/assets/exercises/female/hip-thrusts.gif", // Placeholder
      description:
        "Perform with focus on glute activation, using bodyweight or light resistance.",
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
      "Lateral Raise",
      "Front Raise",
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
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [selectedDotIndex, setSelectedDotIndex] = useState(null);
  const [activeMuscleIndex, setActiveMuscleIndex] = useState(null);
  const [viewingExercise, setViewingExercise] = useState(null);
  const [viewingAlternativeExercise, setViewingAlternativeExercise] =
    useState(null);
  const [highlightedAreas, setHighlightedAreas] = useState({});
  const [parentExercise, setParentExercise] = useState(null);
  // New state for body type
  const [bodyType, setBodyType] = useState("male");

  // Body images for different body types
  const bodyImages = {
    male: "/src/assets/titan.png",
    female: "/src/assets/female-titan.png", // You'll need to add this image
  };

  // Determine which muscle data to use based on body type
  const frontMuscles =
    bodyType === "male" ? maleFrontMuscles : femaleFrontMuscles;
  const backMuscles = bodyType === "male" ? maleBackMuscles : femaleBackMuscles;
  const allMuscles = [...frontMuscles, ...backMuscles];

  const getCurrentMuscleName = () => {
    if (activeMuscleIndex !== null) {
      return allMuscles[activeMuscleIndex].name;
    }
    return null;
  };

  const handleViewAlternative = (alternativeName, parentExerciseName) => {
    setParentExercise(parentExerciseName); // Store the parent exercise
    setViewingExercise(null); // Close the current exercise modal
    setViewingAlternativeExercise(alternativeName); // Open the alternative exercise modal
  };

  const handleDotClick = (muscle, muscleIndex, posIndex) => {
    // Instead of showing a popup, just set the active muscle directly
    if (activeMuscleIndex === muscleIndex) {
      // Toggle off if clicking the same muscle
      setSelectedMuscle(null);
      setSelectedDotIndex(null);
      setActiveMuscleIndex(null);
    } else {
      // Set the new active muscle
      setSelectedMuscle(null);
      setSelectedDotIndex(null);
      setActiveMuscleIndex(muscleIndex);
      setHoveredMuscle(muscle.name);
    }
  };

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
      // If clicking the same muscle that's already active, deactivate it
      if (activeMuscleIndex === closestIndex) {
        setSelectedMuscle(null);
        setSelectedDotIndex(null);
        setActiveMuscleIndex(null);
      } else {
        // Otherwise, activate the new muscle
        setSelectedMuscle(null);
        setSelectedDotIndex(null);
        setActiveMuscleIndex(closestIndex);
        setHoveredMuscle(closestMuscle.name);
      }
    }
  };

  const handleMouseMove = (e) => {
    // Always process hover effects, even if a muscle is already active
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    let closestMuscle = null;
    let minDistance = Infinity;

    // We'll only highlight one muscle at a time to avoid lagginess
    for (let i = 0; i < allMuscles.length; i++) {
      const muscle = allMuscles[i];

      for (let j = 0; j < muscle.positions.length; j++) {
        const position = muscle.positions[j];
        const posLeft = parseInt(position.left);
        const posTop = parseInt(position.top);

        const distance = Math.sqrt(
          Math.pow(x - posLeft, 2) + Math.pow(y - posTop, 2)
        );

        // Use a slightly larger detection area but only pick the closest one
        if (distance < 15 && distance < minDistance) {
          minDistance = distance;
          closestMuscle = muscle;
          // Break early once we found a very close match
          if (distance < 8) break;
        }
      }

      // If we found a very close match, no need to check other muscles
      if (minDistance < 8) break;
    }

    // Only update state if there's a change to avoid unnecessary re-renders
    if (
      (closestMuscle && closestMuscle.name !== hoveredMuscle) ||
      (!closestMuscle && hoveredMuscle !== null)
    ) {
      const newHighlightedAreas = closestMuscle
        ? { [closestMuscle.name]: true }
        : {};

      setHighlightedAreas(newHighlightedAreas);
      setHoveredMuscle(closestMuscle ? closestMuscle.name : null);
    }
  };

  const handleMouseLeave = () => {
    if (activeMuscleIndex === null) {
      setHoveredMuscle(null);
      setHighlightedAreas({});
    }
  };

  // Toggle body type method
  const toggleBodyType = () => {
    setBodyType((prevType) => (prevType === "male" ? "female" : "male"));
    // Reset selection when switching body types
    setSelectedMuscle(null);
    setSelectedDotIndex(null);
    setActiveMuscleIndex(null);
    setHoveredMuscle(null);
    setHighlightedAreas({});
  };

  return (
    <div className="min-h-screen py-4 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">
        Interactive Muscle Guide
      </h1>

      {/* Body Type Toggle */}
      <div className="flex justify-center mb-4">
        <BodyTypeToggle bodyType={bodyType} onToggle={toggleBodyType} />
      </div>

      <div className="bg-transparent dark:bg-transparent px-4 py-2 rounded-lg w-full max-w-4xl mx-auto text-center">
        {activeMuscleIndex !== null ? (
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
        <div className="md:w-3/5 relative">
          <div className="relative max-h-[500px] overflow-hidden mx-auto">
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={handleImageClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            ></div>

            <img
              key={bodyType}
              src={bodyImages[bodyType]}
              alt={`${
                bodyType.charAt(0).toUpperCase() + bodyType.slice(1)
              } Muscle Anatomy`}
              className="w-full max-h-[500px] object-contain"
            />

            {hoveredMuscle && activeMuscleIndex === null && (
              <div
                className="absolute bg-black bg-opacity-80 text-white px-2 py-1 rounded text-sm whitespace-nowrap
                          transition-opacity duration-200 z-20 pointer-events-none"
                style={{
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                {hoveredMuscle}
              </div>
            )}

            {/* Active muscle group dots - always visible when a muscle is selected */}
            {activeMuscleIndex !== null && (
              <div key={`active-dots-${activeMuscleIndex}`}>
                {allMuscles[activeMuscleIndex].positions.map(
                  (position, posIndex) => (
                    <div
                      key={`active-${activeMuscleIndex}-${posIndex}`}
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

            {/* Hovered muscle group dots - only show when hovering and no active selection */}
            {activeMuscleIndex === null &&
              hoveredMuscle &&
              allMuscles
                .filter((muscle) => muscle.name === hoveredMuscle)
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

        {/* Exercise Details Panel */}
        <div className="md:w-2/5">
          {activeMuscleIndex !== null ? (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">
                {allMuscles[activeMuscleIndex].name} Exercises
              </h2>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {allMuscles[activeMuscleIndex].exercises.map(
                  (exercise, idx) => (
                    <li key={idx} className="py-3">
                      <button
                        onClick={() => setViewingExercise(exercise)}
                        className="flex items-center w-full text-left hover:text-blue-500"
                      >
                        <span className="font-medium">{exercise}</span>
                      </button>
                    </li>
                  )
                )}
              </ul>
              <button
                onClick={() => {
                  setSelectedMuscle(null);
                  setSelectedDotIndex(null);
                  setActiveMuscleIndex(null);
                  setHoveredMuscle(null);
                  setHighlightedAreas({});
                }}
                className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset View
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Select a Muscle Group</h2>

              {/* Fixed height container for hover text to prevent layout shifts */}
              <div className="h-16 mb-4">
                {hoveredMuscle && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Hovering over: </span>
                    <span className="text-red-600">{hoveredMuscle}</span>
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
                      setActiveMuscleIndex(idx);
                      setHoveredMuscle(muscle.name);
                    }}
                    onMouseEnter={() => {
                      if (activeMuscleIndex === null) {
                        setHighlightedAreas({ [muscle.name]: true });
                        setHoveredMuscle(muscle.name);
                      }
                    }}
                    onMouseLeave={() => {
                      if (activeMuscleIndex === null) {
                        setHighlightedAreas({});
                        setHoveredMuscle(null);
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

      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto px-4 py-6">
          {/* Muscle Image Section */}
          <div className="md:w-3/5 relative">
            <div className="relative max-h-[500px] overflow-hidden mx-auto">
              {/* (Keep existing image and interaction logic) */}
            </div>
          </div>

          {/* Exercise Details Panel */}
          <div className="md:w-2/5 sticky top-[calc(100vh/4)] self-start">
            {/* (Keep existing exercise panel logic) */}
          </div>
        </div>
      </div>
      {viewingAlternativeExercise && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          onClick={() => setViewingAlternativeExercise(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                {viewingAlternativeExercise}
              </h3>
              <button
                onClick={() => setViewingAlternativeExercise(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white focus:outline-none"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {(() => {
                const alternativeAsset =
                  exerciseAlternatives[viewingAlternativeExercise];
                const variantAsset = alternativeAsset[bodyType];
                return (
                  <img
                    src={variantAsset.src}
                    alt={`${viewingAlternativeExercise} demonstration`}
                    className="w-full object-contain max-h-60"
                  />
                );
              })()}
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">How to Perform:</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {(() => {
                  const alternativeAsset =
                    exerciseAlternatives[viewingAlternativeExercise];
                  const variantAsset = alternativeAsset[bodyType];
                  return variantAsset.description;
                })()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {exerciseAlternatives[viewingAlternativeExercise]
                  ?.equipment && (
                  <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Equipment:{" "}
                      {
                        exerciseAlternatives[viewingAlternativeExercise]
                          .equipment
                      }
                    </span>
                  </div>
                )}
                {exerciseAlternatives[viewingAlternativeExercise]
                  ?.difficulty && (
                  <div className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1">
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                      Difficulty:{" "}
                      {
                        exerciseAlternatives[viewingAlternativeExercise]
                          .difficulty
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              {parentExercise && (
                <button
                  onClick={() => {
                    setViewingAlternativeExercise(null);
                    setViewingExercise(parentExercise);
                    setParentExercise(null);
                  }}
                  className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Back to {parentExercise}
                </button>
              )}
              <button
                onClick={() => setViewingAlternativeExercise(null)}
                className={`py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${
                  parentExercise ? "w-1/2" : "w-full"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingExercise && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            margin: 0,
            padding: 0,
            zIndex: 9999,
            transform: "translateX(0)",
            boxSizing: "border-box",
          }}
          onClick={() => setViewingExercise(null)}
        >
          <div
            className="absolute bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full"
            style={{
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">{viewingExercise}</h3>
              <button
                onClick={() => setViewingExercise(null)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {(() => {
                const exerciseAsset = getExerciseAsset(
                  viewingExercise,
                  bodyType
                );
                return (
                  <img
                    src={exerciseAsset.src}
                    alt={`${viewingExercise} demonstration`}
                    className="w-full object-contain max-h-60"
                  />
                );
              })()}
            </div>

            <div className="text-gray-700 dark:text-gray-300">
              <h4 className="font-bold mb-1">How to perform:</h4>
              <p>{getExerciseAsset(viewingExercise, bodyType).description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {getExerciseAsset(viewingExercise, bodyType).equipment && (
                  <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-3 py-1">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                      Equipment:{" "}
                      {getExerciseAsset(viewingExercise, bodyType).equipment}
                    </span>
                  </div>
                )}
                {getExerciseAsset(viewingExercise, bodyType).difficulty && (
                  <div className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900 px-3 py-1">
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">
                      Difficulty:{" "}
                      {getExerciseAsset(viewingExercise, bodyType).difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* New Alternatives Section */}
            <div className="mt-4">
              <h4 className="font-bold mb-2">Alternative Exercises:</h4>
              <div className="flex flex-wrap gap-2">
                {getExerciseAsset(viewingExercise, bodyType).alternatives.map(
                  (alt, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-600"
                      onClick={() =>
                        handleViewAlternative(alt, viewingExercise)
                      }
                    >
                      {alt}
                    </span>
                  )
                )}
              </div>
            </div>

            <button
              onClick={() => setViewingExercise(null)}
              className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreMuscleGuide;
