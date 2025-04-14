import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTheme } from "../hooks/useTheme";
import BodyTypeToggle from "../components/BodyTypeToggle";
import LoadingSpinner from "../components/LoadingSpinner";
import maleTitanImage from '../assets/titan.png';
import femaleTitanImage from '../assets/female-titan.png';
import ExerciseImage from "../components/ExerciseImage";
import { fixAssetPath } from "../utils/exerciseAssetResolver";

const exerciseAssetsMale = {
  // Shoulders Exercises - Dumbbells
  "Dumbbell Shoulder Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-shoulder-press.gif",
      description: "Sit on a bench with back support. Hold a dumbbell in each hand at shoulder height. Press the weights upward until your arms are fully extended. Lower back to starting position.",
      alternatives: ["Arnold Press", "Barbell Overhead Press", "Machine Shoulder Press"]
    }
  },
  "Dumbbell Lateral Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-lateral-raise.gif",
      description: "Stand with dumbbells at your sides. Keep a slight bend in your elbows and raise the weights out to the sides until they reach shoulder level. Lower back down with control.",
      alternatives: ["Cable Lateral Raise", "Machine Lateral Raise", "Plate Lateral Raise"]
    }
  },
  "Dumbbell Front Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-front-raise.gif",
      description: "Stand holding dumbbells in front of your thighs. Keeping your arms straight, lift the weights forward and upward until they reach shoulder height. Lower back down with control.",
      alternatives: ["Cable Front Raise", "Plate Front Raise", "Barbell Front Raise"]
    }
  },
  "Arnold Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/arnold-press.gif",
      description: "Sit with dumbbells held in front at shoulder height, palms facing you. As you press up, rotate your palms to face forward at the top. Reverse the movement on the way down.",
      alternatives: ["Dumbbell Shoulder Press", "Barbell Overhead Press", "Push Press"]
    }
  },
  
  // Shoulders Exercises - Barbell
  "Barbell Overhead Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-overhead-press.gif",
      description: "Stand with feet shoulder-width apart, holding a barbell at shoulder height. Press the bar overhead until arms are fully extended. Lower the bar back to shoulder height.",
      alternatives: ["Dumbbell Shoulder Press", "Push Press", "Machine Shoulder Press"]
    }
  },
  "Barbell Upright Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-upright-row.gif",
      description: "Stand holding a barbell with hands shoulder-width apart. Pull the barbell up vertically to chin height, keeping it close to your body. Lower back down with control.",
      alternatives: ["Dumbbell Upright Row", "Cable Upright Row", "Face Pull"]
    }
  },
  "Push Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/push-press.gif",
      description: "Stand with barbell at shoulder height. Slightly bend knees, then explosively extend legs while pressing the bar overhead. Lower the bar back to shoulders with control.",
      alternatives: ["Barbell Overhead Press", "Dumbbell Push Press", "Kettlebell Push Press"]
    }
  },
  
  // Shoulders Exercises - Machine
  "Shoulder Press Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/shoulder-press-machine.gif",
      description: "Sit in the machine with back supported. Adjust the seat so handles are at shoulder height. Press the handles upward until arms are extended. Lower back to starting position.",
      alternatives: ["Dumbbell Shoulder Press", "Barbell Overhead Press", "Smith Machine Overhead Press"]
    }
  },
  "Lateral Raise Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/lateral-raise-machine.gif",
      description: "Sit in the machine with arms positioned under the pads. Push outward and upward with your arms until they reach shoulder level. Return to starting position with control.",
      alternatives: ["Dumbbell Lateral Raise", "Cable Lateral Raise", "Plate Lateral Raise"]
    }
  },
  "Reverse Pec Deck": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/reverse-pec-deck.gif",
      description: "Sit facing the pec deck machine. Grasp the handles with arms extended. Pull the handles back by squeezing your shoulder blades together. Return to starting position.",
      alternatives: ["Dumbbell Reverse Fly", "Cable Reverse Fly", "Face Pull"]
    }
  },
  
  // Shoulders Exercises - Cable
  "Cable Lateral Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-lateral-raise.gif",
      description: "Stand sideways to a low cable pulley. Grasp the handle and raise your arm out to the side until it reaches shoulder height. Lower with control and repeat.",
      alternatives: ["Dumbbell Lateral Raise", "Machine Lateral Raise", "Plate Lateral Raise"]
    }
  },
  "Cable Front Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-front-raise.gif",
      description: "Stand facing away from a low cable pulley. Grasp the handle and raise your arm forward until it reaches shoulder height. Lower with control and repeat.",
      alternatives: ["Dumbbell Front Raise", "Plate Front Raise", "Barbell Front Raise"]
    }
  },
  "Face Pull": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/face-pull.gif",
      description: "Stand facing a cable machine with rope attachment at head height. Pull the rope toward your face, separating the ends as you pull. Return to starting position with control.",
      alternatives: ["Reverse Pec Deck", "Dumbbell Reverse Fly", "Barbell Upright Row"]
    }
  },
  
  // Shoulders Exercises - Kettlebell
  "Kettlebell Overhead Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-overhead-press.gif",
      description: "Stand holding a kettlebell at shoulder height. Press it overhead until your arm is fully extended. Lower it back to the shoulder with control.",
      alternatives: ["Dumbbell Shoulder Press", "Barbell Overhead Press", "One-Arm Press"]
    }
  },
  "Kettlebell Push Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-push-press.gif",
      description: "Stand with kettlebell at shoulder height. Slightly bend knees, then explosively extend legs while pressing the kettlebell overhead. Lower back to starting position.",
      alternatives: ["Push Press", "Dumbbell Push Press", "Kettlebell Overhead Press"]
    }
  },
  
  // Shoulders Exercises - Plate
  "Plate Front Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-front-raise.gif",
      description: "Hold a weight plate with both hands at the bottom. Raise the plate forward and upward until arms reach shoulder height. Lower with control back to starting position.",
      alternatives: ["Dumbbell Front Raise", "Cable Front Raise", "Barbell Front Raise"]
    }
  },
  "Plate Lateral Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-lateral-raise.gif",
      description: "Hold a weight plate with both hands at the center. Raise the plate out to the side until arms reach shoulder height. Lower with control and repeat on the other side.",
      alternatives: ["Dumbbell Lateral Raise", "Cable Lateral Raise", "Machine Lateral Raise"]
    }
  },
  
  // Shoulders Exercises - Smith Machine
  "Smith Machine Overhead Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-overhead-press.gif",
      description: "Sit or stand with the Smith machine bar at shoulder height. Press the bar overhead until arms are fully extended. Lower the bar back to shoulder height with control.",
      alternatives: ["Barbell Overhead Press", "Dumbbell Shoulder Press", "Machine Shoulder Press"]
    }
  },
  "Smith Machine Upright Row": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-upright-row.gif",
      description: "Stand holding the Smith machine bar with hands shoulder-width apart. Pull the bar up vertically to chin height, keeping it close to your body. Lower back down with control.",
      alternatives: ["Barbell Upright Row", "Cable Upright Row", "Dumbbell Upright Row"]
    }
  },
  
  // Shoulders Exercises - Bodyweight
  "Pike Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/pike-push-ups.gif",
      description: "Get into a downward dog position with hips high. Bend your elbows to lower your head toward the floor. Push back up to the starting position.",
      alternatives: ["Handstand Push-ups", "Wall Walks", "Dumbbell Shoulder Press"]
    }
  },
  "Handstand Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/handstand-push-ups.gif",
      description: "Get into a handstand position against a wall. Lower your body by bending your elbows until your head nearly touches the ground. Push back up to the starting position.",
      alternatives: ["Pike Push-ups", "Wall Walks", "Barbell Overhead Press"]
    }
  },
  "Wall Walks": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/wall-walks.gif",
      description: "Start in a plank position with feet against a wall. Walk your feet up the wall while walking your hands closer to the wall. Reverse the movement to return to the starting position.",
      alternatives: ["Pike Push-ups", "Handstand Push-ups", "Shoulder Press"]
    }
  },

   // Chest - Dumbbells
   "Dumbbell Bench Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-bench-press.gif",
      description: "Lie on a flat bench holding a dumbbell in each hand. Press the dumbbells upward until arms are extended, then lower them until elbows are at 90 degrees.",
      alternatives: ["Barbell Bench Press", "Incline Dumbbell Press", "Chest Press Machine"]
    }
  },
  "Dumbbell Flyes": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-flyes.gif",
      description: "Lie on a bench holding dumbbells above your chest. With a slight bend in the elbows, lower the dumbbells in a wide arc to the sides, then bring them back together above the chest.",
      alternatives: ["Cable Flyes", "Pec Deck Machine", "Incline Dumbbell Flyes"]
    }
  },
  "Incline Dumbbell Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/incline-dumbbell-press.gif",
      description: "Set a bench to an incline and lie back holding dumbbells. Press the weights upward and slightly inward above your chest. Lower back to starting position.",
      alternatives: ["Incline Bench Press", "Incline Machine Press", "Dumbbell Bench Press"]
    }
  },
  "Single Arm Dumbbell Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/single-arm-dumbbell-press.gif",
      description: "Lie on a bench with one dumbbell. Press it upward while keeping the core tight for stability. Lower with control and repeat.",
      alternatives: ["Dumbbell Bench Press", "Barbell Bench Press", "Dumbbell Flyes"]
    }
  },

  // Chest - Barbell
  "Barbell Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-bench-press.gif",
      description: "Lie on a bench with a barbell over your chest. Lower the bar until it touches your chest, then press it back up to the starting position.",
      alternatives: ["Dumbbell Bench Press", "Chest Press Machine", "Smith Machine Bench Press"]
    }
  },
  "Incline Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/incline-bench-press.gif",
      description: "Lie on an incline bench holding a barbell. Lower the bar to your upper chest, then press it back up to the starting position.",
      alternatives: ["Incline Dumbbell Press", "Smith Machine Incline Press", "Incline Chest Press Machine"]
    }
  },
  "Close Grip Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/close-grip-bench-press.gif",
      description: "Lie on a bench and grip the barbell shoulder-width or narrower. Lower the bar to your chest and press back up, focusing on triceps and inner chest.",
      alternatives: ["Diamond Push-ups", "Dumbbell Close Press", "Chest Dips"]
    }
  },

  // Chest - Machine
  "Chest Press Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/chest-press-machine.gif",
      description: "Sit in the machine with hands at chest level. Press the handles forward until your arms are extended, then return with control.",
      alternatives: ["Dumbbell Bench Press", "Barbell Bench Press", "Smith Machine Bench Press"]
    }
  },
  "Pec Deck Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/pec-deck-machine.gif",
      description: "Sit in the pec deck with arms outstretched on the pads. Squeeze the handles together until they meet in front of your chest, then return slowly.",
      alternatives: ["Dumbbell Flyes", "Cable Flyes", "Chest Press Machine"]
    }
  },
  // Chest - Cable
  "Cable Flyes": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-flyes.gif",
      description: "Stand slightly forward between two cables. Pull the handles together in front of your chest with a slight bend in the elbows. Return to start with control.",
      alternatives: ["Dumbbell Flyes", "Cable Crossover", "Pec Deck Machine"]
    }
  },

  "Cable Crossover": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-crossover.gif",
      description: "Stand between two cable pulleys. With a handle in each hand, bring your hands together in front of your body in a controlled arc, squeezing the chest.",
      alternatives: ["Cable Flyes", "Dumbbell Flyes", "Pec Deck Machine"]
    }
  },

  "Low Cable Crossover": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/low-cable-crossover.gif",
      description: "Position cables low. With a handle in each hand, bring arms upward and inward to chest height. Squeeze the chest, then return with control.",
      alternatives: ["Cable Flyes", "Dumbbell Flyes", "Cable Crossover"]
    }
  },

  // Chest - Kettlebell
  "Kettlebell Floor Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-floor-press.gif",
      description: "Lie on the floor with kettlebells in hand. Press them straight up, then lower until elbows touch the ground.",
      alternatives: ["Dumbbell Bench Press", "Chest Press Machine", "Barbell Floor Press"]
    }
  },
  "Kettlebell Flyes": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-flyes.gif",
      description: "Lie on a bench with kettlebells above chest. Lower arms in a wide arc to sides, then return to starting position.",
      alternatives: ["Dumbbell Flyes", "Cable Flyes", "Pec Deck Machine"]
    }
  },

  // Chest - Plate
  "Plate Press": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-press.gif",
      description: "Hold a plate between your palms in front of your chest. Press it forward, then bring it back while squeezing your chest.",
      alternatives: ["Svend Press", "Push-ups", "Cable Flyes"]
    }
  },
  "Svend Press": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/svend-press.gif",
      description: "Hold a plate between your palms and press outward in front of your chest, squeezing the chest muscles throughout the movement.",
      alternatives: ["Plate Press", "Push-ups", "Cable Flyes"]
    }
  },

  // Chest - Smith Machine
  "Smith Machine Bench Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-bench-press.gif",
      description: "Lie on a bench under the Smith machine bar. Lower the bar to chest level and press back up with control.",
      alternatives: ["Barbell Bench Press", "Chest Press Machine", "Dumbbell Bench Press"]
    }
  },
  "Smith Machine Incline Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-incline-press.gif",
      description: "Lie on an incline bench under the Smith machine. Press the bar upward and slightly inward, then lower with control.",
      alternatives: ["Incline Dumbbell Press", "Incline Bench Press", "Incline Chest Press Machine"]
    }
  },

  // Chest - Bodyweight
  "Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/push-ups.gif",
      description: "Start in a plank position. Lower your body until your chest is close to the floor, then push back up to the starting position.",
      alternatives: ["Incline Push-ups", "Wide Push-ups", "Dumbbell Bench Press"]
    }
  },
  "Incline Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/incline-push-ups.gif",
      description: "Place hands on a raised surface. Lower your body to the surface, then push back up.",
      alternatives: ["Push-ups", "Chest Press Machine", "Dumbbell Bench Press"]
    }
  },
  "Wide Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/wide-push-ups.gif",
      description: "Perform a push-up with hands set wider than shoulder-width to emphasize the chest.",
      alternatives: ["Push-ups", "Cable Flyes", "Chest Press Machine"]
    }
  },
  "Diamond Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/diamond-push-ups.gif",
      description: "Place hands close together forming a diamond shape. Perform push-ups focusing on the inner chest and triceps.",
      alternatives: ["Close Grip Bench Press", "Push-ups", "Plate Press"]
    }
  },
   // Biceps - Dumbbells
   "Dumbbell Bicep Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-bicep-curl.gif",
      description: "Stand with a dumbbell in each hand. Curl the weights up while keeping your elbows close to your torso. Lower with control.",
      alternatives: ["Hammer Curl", "EZ Bar Curl", "Cable Bicep Curl"]
    }
  },
  "Hammer Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/hammer-curl.gif",
      description: "Hold dumbbells with palms facing your body. Curl the weights up while keeping the neutral grip. Lower with control.",
      alternatives: ["Cable Hammer Curl", "Rope Hammer Curl", "Dumbbell Bicep Curl"]
    }
  },
  "Concentration Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/concentration-curl.gif",
      description: "Sit with your elbow resting on your inner thigh. Curl the dumbbell upward and squeeze at the top. Lower with control.",
      alternatives: ["Preacher Curl", "Cable Bicep Curl", "Dumbbell Bicep Curl"]
    }
  },
  "Alternating Bicep Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternating-bicep-curl.gif",
      description: "Stand holding dumbbells at your sides. Curl one arm at a time while keeping the other relaxed. Alternate sides.",
      alternatives: ["Dumbbell Bicep Curl", "Cable Bicep Curl", "EZ Bar Curl"]
    }
  },

  // Biceps - Barbell
  "Lighter Barbell Curl": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/lighter-barbell-curl.gif",
      description: "Hold a light barbell with an underhand grip. Curl the bar up while keeping your elbows still. Lower with control.",
      alternatives: ["EZ Bar Curl", "Dumbbell Bicep Curl", "Cable Bicep Curl"]
    }
  },
  "EZ Bar Curl": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/ez-bar-curl.gif",
      description: "Hold an EZ curl bar with a comfortable grip. Curl the bar up and squeeze the biceps. Lower back slowly.",
      alternatives: ["Dumbbell Bicep Curl", "Cable Bicep Curl", "Hammer Curl"]
    }
  },
  "Reverse Grip Barbell Curl": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/reverse-grip-barbell-curl.gif",
      description: "Hold a barbell with palms facing down. Curl the bar upward using your biceps and forearms. Lower with control.",
      alternatives: ["EZ Bar Curl", "Cable Reverse Curl", "Hammer Curl"]
    }
  },

  // Biceps - Machine
  "Machine Bicep Curl": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/machine-bicep-curl.gif",
      description: "Sit at the machine with arms positioned on the pad. Curl the handles upward and squeeze, then return slowly.",
      alternatives: ["Cable Bicep Curl", "EZ Bar Curl", "Preacher Curl"]
    }
  },
  "Cable Bicep Curl": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-bicep-curl.gif",
      description: "Stand facing a low cable pulley. Curl the handle toward your shoulders, keeping elbows tucked. Lower back with control.",
      alternatives: ["Dumbbell Bicep Curl", "EZ Bar Curl", "Machine Bicep Curl"]
    }
  },

  // Biceps - Cable
  "Cable Hammer Curl": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-hammer-curl.gif",
      description: "Use a rope attachment on a low pulley. Curl upward with palms facing each other. Squeeze and lower slowly.",
      alternatives: ["Hammer Curl", "Rope Hammer Curl", "Cable Bicep Curl"]
    }
  },
  "Rope Hammer Curl": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/rope-hammer-curl.gif",
      description: "Grab the rope and perform hammer curls by keeping palms neutral and pulling toward your shoulders. Return with control.",
      alternatives: ["Cable Hammer Curl", "Hammer Curl", "EZ Bar Curl"]
    }
  },

  // Biceps - Kettlebell
  "Kettlebell Bicep Curl": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-bicep-curl.gif",
      description: "Hold kettlebells at your sides. Curl them upward and squeeze the biceps at the top. Lower slowly.",
      alternatives: ["Dumbbell Bicep Curl", "Hammer Curl", "EZ Bar Curl"]
    }
  },
  "Kettlebell Hammer Curl": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-hammer-curl.gif",
      description: "Hold kettlebells or a dumbbell in a neutral grip. Curl upward without rotating your wrists. Return to starting position with control.",
      alternatives: ["Hammer Curl", "Cable Hammer Curl", "Rope Hammer Curl"]
    }
  },

  // Biceps - Plate
  "Plate Curl": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-curl.gif",
      description: "Hold a weight plate at the sides. Curl it toward your chest and squeeze, then lower back slowly.",
      alternatives: ["Dumbbell Bicep Curl", "EZ Bar Curl", "Cable Bicep Curl"]
    }
  },

  // Biceps - Smith Machine
  "Smith Machine Drag Curl": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-drag-curl.gif",
      description: "Hold the Smith machine bar and pull it up close to your torso. Focus on the biceps and keep elbows back.",
      alternatives: ["EZ Bar Curl", "Barbell Curl", "Cable Curl"]
    }
  },

  // Biceps - Bodyweight
  "Chin-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/chin-ups.gif",
      description: "Grab a bar with palms facing you. Pull your chin above the bar using biceps and back. Lower with control.",
      alternatives: ["Close Grip Pull-ups", "Inverted Row (Underhand)", "Cable Bicep Curl"]
    }
  },
  "Close Grip Pull-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/close-grip-pull-ups.gif",
      description: "Use a close underhand grip. Pull your body up until chin is above the bar. Lower back slowly.",
      alternatives: ["Chin-ups", "Cable Bicep Curl", "EZ Bar Curl"]
    }
  },
  "Inverted Row (Underhand)": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/inverted-row-underhand.gif",
      description: "Lie under a bar with underhand grip. Pull your chest toward the bar by squeezing your arms and back.",
      alternatives: ["Chin-ups", "Cable Bicep Curl", "Bodyweight Curl"]
    }
  },

   // Abs - Dumbbells
   "Dumbbell Russian Twist": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-russian-twist.gif",
      description: "Sit on the floor with knees bent, holding a dumbbell with both hands. Twist your torso from side to side, bringing the dumbbell across your body each time.",
      alternatives: ["Plate Russian Twist", "Cable Oblique Twist", "Kettlebell Russian Twist"]
    }
  },
  "Light Weighted Crunch": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/light-weighted-crunch.gif",
      description: "Lie on your back holding a light dumbbell against your chest. Perform crunches by lifting your upper back off the floor and engaging your abs.",
      alternatives: ["Crunches", "Ab Crunch Machine", "Weighted Plank with Plate"]
    }
  },
  "Side Bend": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/side-bend.gif",
      description: "Stand with a dumbbell in one hand. Bend to the side at the waist and return to upright. Repeat on both sides.",
      alternatives: ["Cable Oblique Twist", "Kettlebell Windmill", "Side Plank"]
    }
  },

  // Abs - Machine
  "Ab Crunch Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/ab-crunch-machine.gif",
      description: "Sit in the machine with the pads against your upper chest. Crunch forward by contracting your abs, then return slowly.",
      alternatives: ["Crunches", "Cable Crunch", "Light Weighted Crunch"]
    }
  },
  "Hanging Leg Raise": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hanging-leg-raise.gif",
      description: "Hang from a pull-up bar. Keeping legs straight or slightly bent, raise them in front of you to activate the core.",
      alternatives: ["Roman Chair", "Hanging Leg Raises", "Mountain Climbers"]
    }
  },
  "Roman Chair": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/roman-chair.gif",
      description: "Position yourself in the Roman chair. Raise knees toward your chest while keeping the movement controlled.",
      alternatives: ["Hanging Leg Raise", "Cable Crunch", "Mountain Climbers"]
    }
  },

  // Abs - Cable
  "Cable Crunch": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-crunch.gif",
      description: "Attach a rope to a high pulley. Kneel below it and crunch downward, pulling the rope with your head down toward your knees.",
      alternatives: ["Ab Crunch Machine", "Crunches", "Cable Oblique Twist"]
    }
  },
  "Cable Woodchopper": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-woodchopper.gif",
      description: "Set a cable to a high pulley. Pull the handle diagonally across your body, rotating your torso to engage the obliques.",
      alternatives: ["Cable Oblique Twist", "Kettlebell Windmill", "Side Plank"]
    }
  },
  "Cable Oblique Twist": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-oblique-twist.gif",
      description: "Set the cable to chest height. Pull the handle across your body in a twisting motion to work the obliques.",
      alternatives: ["Cable Woodchopper", "Dumbbell Russian Twist", "Side Bend"]
    }
  },

  // Abs - Kettlebell
  "Kettlebell Russian Twist": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-russian-twist.gif",
      description: "Sit with knees bent and lean back slightly. Hold a kettlebell and twist your torso side to side.",
      alternatives: ["Dumbbell Russian Twist", "Plate Russian Twist", "Cable Oblique Twist"]
    }
  },
  "Kettlebell Windmill": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/kettlebell-windmill.gif",
      description: "Hold a kettlebell overhead with one arm. Keeping legs straight, bend at the waist and touch the opposite foot with your free hand.",
      alternatives: ["Side Bend", "Cable Woodchopper", "Side Plank"]
    }
  },

  // Abs - Plate
  "Plate Russian Twist": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/plate-russian-twist.gif",
      description: "Sit on the floor with knees bent, holding a plate. Twist your torso from side to side, tapping the plate beside you each time.",
      alternatives: ["Dumbbell Russian Twist", "Kettlebell Russian Twist", "Cable Oblique Twist"]
    }
  },
  "Weighted Plank with Plate": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/weighted-plank-with-plate.gif",
      description: "Get into a plank position with a weight plate on your back. Maintain form by keeping your core tight.",
      alternatives: ["Plank", "Crunches", "Mountain Climbers"]
    }
  },

  // Abs - Bodyweight
  "Crunches": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/crunches.gif",
      description: "Lie on your back with knees bent. Lift your shoulders off the ground by contracting your abs, then return with control.",
      alternatives: ["Cable Crunch", "Ab Crunch Machine", "Light Weighted Crunch"]
    }
  },
  "Hanging Leg Raises": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hanging-leg-raises.gif",
      description: "Hang from a pull-up bar. Raise your legs straight up in front of you, then lower them back with control.",
      alternatives: ["Roman Chair", "Mountain Climbers", "Crunches"]
    }
  },
  "Plank": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plank.gif",
      description: "Hold a plank position on your forearms and toes, keeping your body straight from head to heels.",
      alternatives: ["Side Plank", "Mountain Climbers", "Weighted Plank with Plate"]
    }
  },
  "Side Plank": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/side-plank.gif",
      description: "Lie on your side and prop yourself up with one forearm. Keep your body straight and hold the position. You Can also lift up your leg if you want to make it more harder",
      alternatives: ["Kettlebell Windmill", "Cable Oblique Twist", "Plank"]
    }
  },
  "Mountain Climbers": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/mountain-climbers.gif",
      description: "Start in a plank position. Alternate driving your knees toward your chest in a running motion.",
      alternatives: ["Plank", "Crunches", "Bicycle Crunch"]
    }
  },
  "Bicycle Crunch": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/bicycle-crunch.gif",
      description: "Lie on your back and lift your legs. Alternate bringing each elbow toward the opposite knee in a pedaling motion.",
      alternatives: ["Crunches", "Russian Twist", "Mountain Climbers"]
    }
  },

  // Abs - Cardio
  "Plank Jacks": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/plank-jacks.gif",
      description: "Hold a plank position while jumping your feet in and out, like a jumping jack motion for your core.",
      alternatives: ["Plank", "Mountain Climbers", "Burpees"]
    }
  },

   // Quads - Dumbbells
  "Dumbbell Squat": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-squat.gif",
      description: "Hold dumbbells at your sides. Lower into a squat by bending your knees and hips. Keep your chest up and push back to standing.",
      alternatives: ["Barbell Squat", "Goblet Squat", "Bodyweight Squat"]
    }
  },
  "Dumbbell Lunge": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-lunge.gif",
      description: "Hold dumbbells at your sides. Step forward into a lunge, keeping your knee over your ankle. Push back to start.",
      alternatives: ["Barbell Lunge", "Bodyweight Split Squat", "Walking Lunge"]
    }
  },
  "Dumbbell Step-up": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-step-up.gif",
      description: "Hold dumbbells and step up onto a box or bench with one leg. Drive through your heel to stand, then step down.",
      alternatives: ["Kettlebell Step-up", "Box Step-up", "Bodyweight Step-up"]
    }
  },
  "Goblet Squat": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/goblet-squat.gif",
      description: "Hold a dumbbell vertically at chest level. Lower into a squat with elbows inside the knees, then return to standing.",
      alternatives: ["Dumbbell Squat", "Plate Squat", "Kettlebell Goblet Squat"]
    }
  },

  // Quads - Barbell
  "Barbell Squat": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-squat.gif",
      description: "Place a barbell on your upper back. Squat down by bending your hips and knees, then push back up to standing.",
      alternatives: ["Front Squat", "Smith Machine Squat", "Hack Squat Machine"]
    }
  },
  "Front Squat": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/front-squat.gif",
      description: "Hold a barbell across your front shoulders. Keep your chest upright as you squat down, then return to standing.",
      alternatives: ["Barbell Squat", "Goblet Squat", "Smith Machine Squat"]
    }
  },
  "Barbell Bulgarian Split Squat": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-bulgarian-split-squat.gif",
      description: "Place one leg behind you on a bench. Lower into a squat with the front leg. Push back up through the heel.",
      alternatives: ["Dumbbell Lunge", "Smith Machine Split Squat", "Bodyweight Split Squat"]
    }
  },
  "Barbell Lunge": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-lunge.gif",
      description: "With a barbell on your back, step forward into a lunge. Push back through your heel to return to start.",
      alternatives: ["Dumbbell Lunge", "Walking Lunge", "Bodyweight Split Squat"]
    }
  },

  // Quads - Machine
  "Leg Press": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/leg-press.gif",
      description: "Sit in the leg press machine and place feet on the platform. Push away until legs are extended, then return with control.",
      alternatives: ["Barbell Squat", "Hack Squat Machine", "Leg Extension"]
    }
  },
  "Leg Extension": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/leg-extension.gif",
      description: "Sit on the machine with feet under the pad. Extend your knees to raise the pad, then lower with control.",
      alternatives: ["Dumbbell Squat", "Leg Press", "Bodyweight Squat"]
    }
  },
  "Hack Squat Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hack-squat-machine.gif",
      description: "Position yourself in the machine with back against the pad. Lower into a squat and push back up through your heels.",
      alternatives: ["Barbell Squat", "Smith Machine Squat", "Leg Press"]
    }
  },

  // Quads - Cable
  "Cable Squat": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-squat.gif",
      description: "Hold the cable handle at chest level. Lower into a squat, keeping tension on the cable, then return to standing.",
      alternatives: ["Goblet Squat", "Plate Squat", "Bodyweight Squat"]
    }
  },

  // Quads - Kettlebell
  "Kettlebell Goblet Squat": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/kettlebell-goblet-squat.gif",
      description: "Hold a kettlebell at chest level. Lower into a deep squat, keeping your back straight, then stand back up.",
      alternatives: ["Goblet Squat", "Cable Squat", "Plate Squat"]
    }
  },
  "Kettlebell Lunge": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-lunge.gif",
      description: "Hold kettlebells by your sides and step into a lunge. Keep your core tight and return to standing.",
      alternatives: ["Dumbbell Lunge", "Barbell Lunge", "Bodyweight Lunge"]
    }
  },
  "Kettlebell Step-up": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-step-up.gif",
      description: "Hold kettlebells and step up onto a box. Push through your heel to stand fully, then step down with control.",
      alternatives: ["Box Step-up", "Dumbbell Step-up", "Bodyweight Step-up"]
    }
  },

  // Quads - Plate
  "Plate Squat": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-squat.gif",
      description: "Hold a weight plate at your chest. Squat down until thighs are parallel to the ground, then push back up.",
      alternatives: ["Goblet Squat", "Cable Squat", "Kettlebell Goblet Squat"]
    }
  },

  // Quads - Smith Machine
  "Smith Machine Squat": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-squat.gif",
      description: "Position yourself under the Smith bar. Lower into a squat and press back up while keeping the bar stable.",
      alternatives: ["Barbell Squat", "Hack Squat Machine", "Leg Press"]
    }
  },
  "Smith Machine Split Squat": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-split-squat.gif",
      description: "With one leg elevated behind you, squat down using the front leg while the bar guides movement.",
      alternatives: ["Bodyweight Split Squat", "Barbell Lunge", "Dumbbell Lunge"]
    }
  },

  // Quads - Bodyweight
  "Bodyweight Squat": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/bodyweight-squat.gif",
      description: "Stand with feet shoulder-width apart. Lower into a squat and return to standing by pushing through your heels.",
      alternatives: ["Dumbbell Squat", "Goblet Squat", "Jump Squat"]
    }
  },
  "Walking Lunge": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/walking-lunge.gif",
      description: "Step forward into a lunge, then immediately step into a lunge with the other leg while walking forward.",
      alternatives: ["Dumbbell Lunge", "Barbell Lunge", "Bodyweight Split Squat"]
    }
  },
  "Jump Squat": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/jump-squat.gif",
      description: "Squat down and explosively jump upward. Land softly and repeat.",
      alternatives: ["Bodyweight Squat", "Box Jumps", "Jump Rope"]
    }
  },
  "Bodyweight Split Squat": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/bodyweight-split-squat.gif",
      description: "Place one leg behind you on a surface. Lower into a squat on your front leg and return to standing.",
      alternatives: ["Smith Machine Split Squat", "Barbell Split Squat", "Walking Lunge"]
    }
  },
  "Box Step-up": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/box-step-up.gif",
      description: "Step onto a box or bench with one foot. Drive up through your heel, then step back down.",
      alternatives: ["Dumbbell Step-up", "Kettlebell Step-up", "Bodyweight Lunge"]
    }
  },

  // Quads - Cardio
  "Box Jumps": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/box-jumps.gif",
      description: "Stand in front of a box and jump onto it with both feet. Land softly and step or jump down.",
      alternatives: ["Jump Squat", "Jump Rope", "Stair Climber"]
    }
  },
  "Jump Rope": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/jump-rope.gif",
      description: "Jump continuously over a rope held in your hands to improve endurance and strengthen the legs.",
      alternatives: ["Box Jumps", "Stair Climber", "Jump Squat"]
    }
  },
  "Stair Climber": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/stair-climber.gif",
      description: "Use a stair climber machine to simulate walking up stairs, targeting quads, glutes, and calves.",
      alternatives: ["Jump Rope", "Box Jumps", "Walking Lunge"]
    }
  },

   // Calves - Dumbbells
   "Dumbbell Calf Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-calf-raise.gif",
      description: "Hold dumbbells at your sides and stand with feet hip-width apart. Raise your heels off the floor, squeezing your calves, then lower slowly.",
      alternatives: ["Seated Dumbbell Calf Raise", "Standing Calf Raise", "Smith Machine Calf Raise"]
    }
  },
  "Seated Dumbbell Calf Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/seated-dumbbell-calf-raise.gif",
      description: "Sit on a bench with dumbbells on your thighs. Raise your heels as high as possible, then lower them under control.",
      alternatives: ["Seated Calf Raise Machine", "Dumbbell Calf Raise", "Single Leg Plate Calf Raise"]
    }
  },

  // Calves - Barbell
  "Standing Calf Raise": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/standing-calf-raise.gif",
      description: "With a barbell on your shoulders, raise your heels to contract your calves. Lower back with control.",
      alternatives: ["Smith Machine Calf Raise", "Standing Calf Raise Machine", "Dumbbell Calf Raise"]
    }
  },
  "Barbell Seated Calf Raise": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-seated-calf-raise.gif",
      description: "Sit on a bench with a barbell across your thighs. Raise and lower your heels to work the calves.",
      alternatives: ["Seated Calf Raise Machine", "Seated Dumbbell Calf Raise", "Leg Press Calf Raise"]
    }
  },

  // Calves - Machine
  "Standing Calf Raise Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/standing-calf-raise-machine.gif",
      description: "Stand with your shoulders under the pads. Raise your heels by contracting your calves, then lower back with control.",
      alternatives: ["Smith Machine Calf Raise", "Dumbbell Calf Raise", "Barbell Standing Calf Raise"]
    }
  },
  "Seated Calf Raise Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/seated-calf-raise-machine.gif",
      description: "Sit with legs at 90 degrees and pad over your thighs. Raise and lower your heels while keeping toes flat.",
      alternatives: ["Seated Dumbbell Calf Raise", "Barbell Seated Calf Raise", "Leg Press Calf Raise"]
    }
  },
  "Leg Press Calf Raise": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/leg-press-calf-raise.gif",
      description: "Place feet on the lower edge of the leg press plate. Push using your toes to raise your heels. Return with control.",
      alternatives: ["Standing Calf Raise Machine", "Seated Calf Raise Machine", "Smith Machine Calf Raise"]
    }
  },

  // Calves - Kettlebell
  "Kettlebell Calf Raise": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/kettlebell-calf-raise.gif",
      description: "Hold a kettlebell in one or both hands. Raise your heels off the floor to engage the calves. Lower slowly.",
      alternatives: ["Dumbbell Calf Raise", "Smith Machine Calf Raise", "Single Leg Calf Raise"]
    }
  },

  // Calves - Plate
  "Single Leg Plate Calf Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/single-leg-plate-calf-raise.gif",
      description: "Hold a plate or a dumbbell and perform a calf raise on one leg. Keep your knee slightly bent and movement controlled.",
      alternatives: ["Single Leg Calf Raise", "Dumbbell Calf Raise", "Seated Calf Raise"]
    }
  },

  // Calves - Smith Machine
  "Smith Machine Calf Raise": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-calf-raise.gif",
      description: "Stand under the Smith bar with feet flat. Raise your heels while keeping your knees straight. Lower under control.",
      alternatives: ["Standing Calf Raise", "Standing Calf Raise Machine", "Dumbbell Calf Raise"]
    }
  },

  // Calves - Bodyweight
  "Standing Bodyweight Calf Raise": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/standing-bodyweight-calf-raise.gif",
      description: "Stand with feet flat and raise your heels off the floor. Pause at the top, then lower slowly.",
      alternatives: ["Dumbbell Calf Raise", "Box Calf Raise", "Single Leg Calf Raise"]
    }
  },
  "Single Leg Calf Raise": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/single-leg-calf-raise.gif",
      description: "Stand on one leg and raise your heel as high as possible. Lower with control. Switch sides.",
      alternatives: ["Plate Calf Raise", "Kettlebell Calf Raise", "Standing Bodyweight Calf Raise"]
    }
  },
  "Box Calf Raise": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/box-calf-raise.gif",
      description: "Stand on the edge of a box. Drop your heels down and then raise them as high as possible to work your calves.",
      alternatives: ["Smith Machine Calf Raise", "Standing Calf Raise", "Jump Rope"]
    }
  },

  // Calves - Cardio
  "Jump Rope": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/jump-rope.gif",
      description: "Jump repeatedly over a rope, landing softly on the balls of your feet to engage the calves.",
      alternatives: ["Box Jumps", "Bodyweight Calf Raise", "Stair Climber"]
    }
  },
  "Box Jumps": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/box-jumps.gif",
      description: "Explosively jump onto a sturdy box, landing softly. Step or jump down and repeat.",
      alternatives: ["Jump Rope", "Calf Raise Variations", "Box Calf Raise"]
    }
  },

  // Upper Back - Dumbbells
  "Dumbbell Row": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-row.gif",
      description: "Bend over at the hips with a dumbbell in each hand. Pull the weights toward your torso while squeezing your shoulder blades. Lower with control.",
      alternatives: ["Barbell Row", "Cable Row", "Kettlebell Row"]
    }
  },
  "Dumbbell Reverse Fly": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-reverse-fly.gif",
      description: "Bend at the hips with dumbbells hanging under your shoulders. Lift the arms out to the sides, squeezing the upper back.",
      alternatives: ["Face Pull", "Rear Delt Machine", "Cable Reverse Fly"]
    }
  },
  "Single Arm Row": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/single-arm-row.gif",
      description: "Place one hand and knee on a bench. Pull the dumbbell upward with the opposite hand, focusing on upper back activation.",
      alternatives: ["Dumbbell Row", "Barbell Row", "Kettlebell Row"]
    }
  },

  // Upper Back - Barbell
  "Barbell Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-row.gif",
      description: "Bend at the hips with a barbell in hand. Row the bar toward your torso and lower slowly.",
      alternatives: ["T-Bar Row", "Cable Row", "Dumbbell Row"]
    }
  },
  "T-Bar Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/t-bar-row.gif",
      description: "Load the barbell in a landmine position. Using a close-grip handle, pull the bar toward your chest and lower with control.",
      alternatives: ["Barbell Row", "Lat Pulldown", "Smith Machine Row"]
    }
  },
  "Underhand Grip Barbell Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/underhand-barbell-row.gif",
      description: "Hold a barbell with an underhand grip. Row toward your waist while keeping your torso stable.",
      alternatives: ["Barbell Row", "Cable Row", "Dumbbell Row"]
    }
  },

  // Upper Back - Machine
  "Lat Pulldown": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/lat-pulldown.gif",
      description: "Sit at the pulldown machine. Pull the bar down toward your chest while keeping your back straight. Slowly return.",
      alternatives: ["Pull-ups", "Straight Arm Pulldown", "Cable Row"]
    }
  },
  "Seated Row Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/seated-row-machine.gif",
      description: "Sit down and grab the handles. Pull them toward your torso, squeezing your shoulder blades, then release with control.",
      alternatives: ["Cable Row", "Barbell Row", "Dumbbell Row"]
    }
  },
  "Assisted Pull-up Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/assisted-pull-up-machine.gif",
      description: "Use the machine to support your weight as you perform pull-ups. Focus on pulling your chin above the bar.",
      alternatives: ["Pull-ups", "Lat Pulldown", "Australian Pull-ups"]
    }
  },

  // Upper Back - Cable
  "Cable Row": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-row.gif",
      description: "Sit facing a low pulley. Grab the handles and pull toward your torso, squeezing your back muscles. Return slowly.",
      alternatives: ["Seated Row Machine", "Barbell Row", "Dumbbell Row"]
    }
  },
  "Face Pull": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/face-pull.gif",
      description: "Stand facing a cable machine with rope at eye level. Pull the rope toward your face while externally rotating your shoulders.",
      alternatives: ["Dumbbell Reverse Fly", "Rear Delt Machine", "Cable Reverse Fly"]
    }
  },
  "Straight Arm Pulldown": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/straight-arm-pulldown.gif",
      description: "Stand facing the cable machine. Keeping arms straight, pull the bar down to your thighs. Return slowly.",
      alternatives: ["Lat Pulldown", "Cable Row", "Barbell Row"]
    }
  },

  // Upper Back - Kettlebell
  "Kettlebell Row": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-row.gif",
      description: "Bend over with a kettlebell in one hand on a bench. Pull toward your torso, then lower with control.",
      alternatives: ["Single Arm Row", "Dumbbell Row", "Barbell Row"]
    }
  },
  "Kettlebell High Pull": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-high-pull.gif",
      description: "Stand upright and pull the kettlebell toward your chest while leading with your elbow. Lower with control.",
      alternatives: ["Face Pull", "Cable Row", "T-Bar Row"]
    }
  },

  // Upper Back - Plate
  "Plate Pullover": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/plate-pullover.gif",
      description: "Lie on a bench holding a plate. Lower it behind your head in an arc, then return to starting position. Focus on your lats and upper back.",
      alternatives: ["Straight Arm Pulldown", "Dumbbell Pullover", "Lat Pulldown"]
    }
  },

  // Upper Back - Smith Machine
  "Smith Machine Row": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-row.gif",
      description: "With feet shoulder-width apart and barbell locked in a Smith machine, row the bar to your torso and lower it back down.",
      alternatives: ["Barbell Row", "T-Bar Row", "Cable Row"]
    }
  },

  // Upper Back - Bodyweight
  "Pull-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/pull-ups.gif",
      description: "Hang from a bar with an overhand grip. Pull yourself up until your chin clears the bar. Lower with control.",
      alternatives: ["Lat Pulldown", "Assisted Pull-up Machine", "Australian Pull-ups"]
    }
  },
  "Inverted Row": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/inverted-row.gif",
      description: "Lie under a bar and pull your chest toward it while keeping your body straight. Lower with control.",
      alternatives: ["Australian Pull-ups", "Pull-ups", "Barbell Row"]
    }
  },
  "Australian Pull-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/australian-pull-ups.gif",
      description: "Hang under a low bar with your feet on the ground. Pull your chest to the bar and lower slowly.",
      alternatives: ["Inverted Row", "Pull-ups", "Assisted Pull-up Machine"]
    }
  },

  // Upper Back - Cardio
  "Swimming (Butterfly, Freestyle)": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/swimming-butterfly-freestyle.gif",
      description: "Perform freestyle or butterfly strokes in the pool to engage your lats, rear delts, and traps."
    }
  },

   // Triceps - Dumbbells
   "Dumbbell Tricep Extension": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-tricep-extension.gif",
      description: "Hold a dumbbell with both hands overhead. Lower the weight behind your head, then extend your arms back to the top.",
      alternatives: ["Overhead Extension", "Cable Overhead Extension", "Kettlebell Tricep Extension"]
    }
  },
  "Kickback": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-kickback.gif",
      description: "With your torso bent forward, extend the dumbbell behind you by straightening the elbow. Squeeze and return.",
      alternatives: ["Cable Pushdown", "Rope Pushdown", "Bench Dips"]
    }
  },
  "Overhead Extension": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-overhead-extension.gif",
      description: "Hold a single dumbbell with both hands overhead and sit on a bench. Lower it behind your head, then extend to starting position.",
      alternatives: ["Overhead Tricep Extension", "Cable Overhead Extension"]
    }
  },

  // Triceps - Barbell
  "Close Grip Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/close-grip-bench-press.gif",
      description: "Lie on a bench holding a barbell with hands close together. Lower the bar to your chest and push it back up.",
      alternatives: ["Smith Machine Close Grip Bench Press", "Skull Crushers", "Dips"]
    }
  },
  "Skull Crushers": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/skull-crushers.gif",
      description: "Lie on a bench and hold a barbell above you. Lower it to your forehead by bending your elbows, then extend back.",
      alternatives: ["Overhead Tricep Extension", "Cable Overhead Extension", "Dumbbell Tricep Extension"]
    }
  },
  "Overhead Tricep Extension": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-overhead-tricep-extension.gif",
      description: "Hold a barbell overhead. Lower it behind your head by bending your elbows, then extend your arms fully.",
      alternatives: ["Dumbbell Overhead Extension", "Cable Overhead Extension"]
    }
  },

  // Triceps - Machine
  "Tricep Pushdown Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/tricep-pushdown-machine.gif",
      description: "Use the machine handle to push down and extend the arms fully. Return with control.",
      alternatives: ["Cable Pushdown", "Rope Pushdown", "Kickback"]
    }
  },
  "Assisted Dip Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/assisted-dip-machine.gif",
      description: "Use the assisted machine to perform dips, keeping your torso upright to emphasize triceps.",
      alternatives: ["Dips", "Bench Dips", "Close Grip Bench Press"]
    }
  },

  // Triceps - Cable
  "Tricep Pushdown": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/tricep-pushdown.gif",
      description: "Stand at a cable station. Push the handle down until your arms are fully extended, then return slowly.",
      alternatives: ["Rope Pushdown", "Kickback", "Tricep Pushdown Machine"]
    }
  },
  "Rope Pushdown": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/rope-pushdown.gif",
      description: "Use a rope attachment. Push down and split the rope ends at the bottom, then return to start.",
      alternatives: ["Tricep Pushdown", "Kickback", "Overhead Extension"]
    }
  },
  "Cable Overhead Extension": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-overhead-extension.gif",
      description: "Face away from a low pulley. Hold the handle overhead and extend your arms fully, then return behind your head.",
      alternatives: ["Overhead Tricep Extension", "Dumbbell Overhead Extension", "Skull Crushers"]
    }
  },

  // Triceps - Kettlebell
  "Kettlebell Tricep Extension": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-tricep-extension.gif",
      description: "Hold a kettlebell overhead with both hands. Lower it behind your head, then extend to starting position.",
      alternatives: ["Dumbbell Overhead Extension", "Cable Overhead Extension"]
    }
  },

  // Triceps - Smith Machine
  "Smith Machine Close Grip Bench Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-close-grip-bench-press.gif",
      description: "Use a close grip on the Smith bar. Lower to your chest and push up to focus on triceps.",
      alternatives: ["Close Grip Bench Press", "Dips", "Assisted Dip Machine"]
    }
  },

  // Triceps - Bodyweight
  "Dips": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dips.gif",
      description: "Support yourself on parallel bars and lower your body until elbows are bent. Push back up, focusing on triceps.",
      alternatives: ["Bench Dips", "Assisted Dip Machine", "Close Grip Bench Press"]
    }
  },
  "Diamond Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/diamond-push-ups.gif",
      description: "Get into push-up position with hands close together under your chest. Lower down and push back up, targeting triceps.",
      alternatives: ["Close Grip Bench Press", "Dips", "Tricep Pushdown"]
    }
  },
  "Bench Dips": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/bench-dips.gif",
      description: "Sit on a bench and place hands beside you. Lower your body off the bench and push back up using your triceps.",
      alternatives: ["Dips", "Kickback", "Tricep Pushdown"]
    }
  },

   // Lower Back - Dumbbells
   "Dumbbell Romanian Deadlift": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-romanian-deadlift.gif",
      description: "Stand holding dumbbells in front of your thighs. Hinge at the hips and lower the weights down your legs. Keep your back straight and return to standing."
    }
  },
  "Dumbbell Good Morning": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-good-morning.gif",
      description: "Place dumbbells on your shoulders. Hinge at the hips to lower your torso forward while keeping your back flat. Return to upright."
    }
  },

  // Lower Back - Barbell
  "Barbell Romanian Deadlift": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-romanian-deadlift.gif",
      description: "Hold a barbell at hip level. Hinge at the hips, lowering the bar while keeping your back flat. Return to standing by squeezing your glutes."
    }
  },
  "Barbell Good Morning": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-good-morning.gif",
      description: "With a barbell on your shoulders, bend forward at the hips with a straight back. Reverse the motion to return to upright."
    }
  },
  "Hyperextension": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hyperextension.gif",
      description: "Hold a bar or plate and perform hyperextensions on a bench. Lower your torso and extend up using your lower back."
    }
  },

  // Lower Back - Machine
  "Back Extension Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/back-extension-machine.gif",
      description: "Sit in the machine and extend your torso backward by contracting your lower back muscles. Return slowly."
    }
  },
  "45-Degree Back Extension": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/45-degree-back-extension.gif",
      description: "Position yourself at a 45-degree hyperextension bench. Bend at the hips to lower your torso and return with control."
    }
  },

  // Lower Back - Cable
  "Cable Pull Through": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-pull-through.gif",
      description: "Stand facing away from the pulley. Pull the cable through your legs while hinging at the hips, then drive your hips forward to stand tall."
    }
  },

  // Lower Back - Kettlebell
  "Kettlebell Swing": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-swing.gif",
      description: "Swing a kettlebell from between your legs to chest height using hip drive. Keep your back flat throughout."
    }
  },
  "Kettlebell Deadlift": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/kettlebell-deadlift.gif",
      description: "Stand over a kettlebell and hinge at the hips to grip it. Lift by driving through your heels, then lower back down with control."
    }
  },

  // Lower Back - Plate
  "Weighted Back Extension": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/weighted-back-extension.gif",
      description: "Hold a plate across your chest and perform back extensions. Lower your torso and extend up through your lower back."
    }
  },

  // Lower Back - Smith Machine
  "Smith Machine Romanian Deadlift": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-romanian-deadlift.gif",
      description: "Perform a Romanian Deadlift with the bar on a Smith Machine. Lower with control and engage your glutes and hamstrings to rise."
    }
  },

  // Lower Back - Bodyweight
  "Superman": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/superman.gif",
      description: "Lie face down and simultaneously lift your arms, chest, and legs off the floor. Hold and lower back down."
    }
  },
  "Bird Dog": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/bird-dog.gif",
      description: "From a tabletop position, extend opposite arm and leg while maintaining balance. Return and repeat on the other side."
    }
  },
  "Back Extension": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/back-extension.gif",
      description: "Lie face down and lift your chest and legs using your lower back muscles. Lower with control."
    }
  },

  // Lower Back - Cardio
  "Swimming (Backstroke)": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/swimming-backstroke.gif",
      description: "Swim using the backstroke technique to engage your spinal erectors, glutes, and shoulders."
    }
  },

   // Dumbbells
  "Dumbbell Hip Thrust": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-hip-thrust.gif",
      description: "Sit on the floor with your upper back against a bench, holding a dumbbell over your hips. Drive through your heels to lift your hips until your thighs are parallel to the floor, squeezing your glutes at the top."
    }
  },
  "Dumbbell Bulgarian Split Squat": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-bulgarian-split-squat.gif",
      description: "Stand a few feet in front of a bench, holding dumbbells at your sides. Place one foot behind you on the bench and lower your body until your front thigh is parallel to the floor. Push through your front heel to return to standing."
    }
  },
  "Dumbbell Step-up": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-step-up.gif",
      description: "Holding dumbbells at your sides, step onto a bench or sturdy platform with one foot, pressing through your heel to lift your body up. Step down and repeat on the other side."
    }
  },

  // Barbell
  "Barbell Hip Thrust": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-hip-thrust.gif",
      description: "Sit on the floor with your upper back against a bench and a barbell over your hips. Drive through your heels to lift your hips until your thighs are parallel to the floor, squeezing your glutes at the top."
    }
  },
  "Barbell Glute Bridge": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/barbell-glute-bridge.gif",
      description: "Lie on your back with knees bent and feet flat on the floor, holding a barbell over your hips. Drive through your heels to lift your hips off the ground, squeezing your glutes at the top."
    }
  },
  "Barbell Romanian Deadlift": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-romanian-deadlift.gif",
      description: "Stand holding a barbell in front of your thighs. Hinge at the hips to lower the bar along your legs, keeping your back straight. Engage your glutes to return to standing."
    }
  },

  // Machine
  "Glute Kickback Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/glute-kickback-machine.gif",
      description: "Position yourself on the machine with one foot on the platform. Push the platform back by extending your leg, squeezing your glute at the top. Return and repeat on the other side."
    }
  },
  "Abduction Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/abduction-machine.gif",
      description: "Sit on the machine with your legs inside the pads. Push your legs outward against the resistance, focusing on contracting your glutes. Return slowly to the starting position."
    }
  },

  // Cable
  "Cable Kickback": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-kickback.gif",
      description: "Attach an ankle strap to a low pulley. Stand facing the machine and kick your leg back, squeezing your glute at the top. Return and repeat on the other side."
    }
  },
  "Cable Pull Through": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-pull-through.gif",
      description: "Stand facing away from a low pulley with a rope attachment between your legs. Hinge at the hips to pull the rope through your legs, then drive your hips forward to stand tall."
    }
  },

  // Kettlebell
  "Kettlebell Swing": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-swing.gif",
      description: "Stand with feet shoulder-width apart, holding a kettlebell with both hands. Hinge at the hips to swing the kettlebell between your legs, then thrust your hips forward to swing it up to chest level."
    }
  },
  "Kettlebell Deadlift": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/kettlebell-deadlift.gif",
      description: "Stand over a kettlebell with feet hip-width apart. Hinge at the hips to grasp the kettlebell handle, then drive through your heels to stand up straight, keeping your back flat."
    }
  },
  "Kettlebell Lunge": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-lunge.gif",
      description: "Hold a kettlebell in each hand at your sides. Step forward into a lunge position, lowering your back knee toward the floor. Push through your front heel to return to standing."
    }
  },

   // Smith Machine
   "Smith Machine Hip Thrust": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-hip-thrust.gif",
      description: "Sit with your upper back against a bench and bar positioned across your hips. Drive through your heels to raise your hips to full extension, squeezing your glutes at the top."
    }
  },

  // Bodyweight
  "Single Leg Glute Bridge": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/single-leg-glute-bridge.gif",
      description: "Lie on your back with one leg extended and the other bent. Drive through your planted foot to raise your hips, keeping the extended leg straight."
    }
  },


  // Cardio
  "Stair Climber": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/stair-climber.gif",
      description: "Use the stair climber machine to walk upward against resistance, engaging the glutes and legs with each step."
    }
  },
  "Incline Walking": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/incline-walking.gif",
      description: "Walk at an incline on a treadmill or hill to increase glute activation. Keep your posture upright and stride strong."
    }
  },

   // Dumbbells
   "Dumbbell Romanian Deadlift": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-romanian-deadlift.gif",
      description: "Stand holding dumbbells in front of your thighs. Hinge at the hips and lower the weights down your legs. Keep your back straight and return to standing."
    }
  },
  "Dumbbell Stiff Leg Deadlift": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-stiff-leg-deadlift.gif",
      description: "Stand with dumbbells in front of your thighs. Lower them down with a straight back and minimal knee bend, then return to standing by driving your hips forward."
    }
  },

  // Barbell
  "Barbell Romanian Deadlift": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-romanian-deadlift.gif",
      description: "Hold a barbell at hip level. Hinge at the hips to lower the bar while keeping your back straight. Squeeze your glutes and hamstrings to rise."
    }
  },
  "Barbell Good Morning": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-good-morning.gif",
      description: "With a barbell across your shoulders, hinge at the hips with a flat back until your torso is nearly parallel to the floor. Return to standing."
    }
  },
  "Stiff Leg Deadlift": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/stiff-leg-deadlift.gif",
      description: "Keep your knees slightly bent and lower a barbell down your legs. Focus on a full hamstring stretch before returning upright."
    }
  },

  // Machine
  "Leg Curl Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/leg-curl-machine.gif",
      description: "Lie face down on the machine. Curl your legs up toward your glutes and lower back slowly with control."
    }
  },
  "Seated Leg Curl": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/seated-leg-curl.gif",
      description: "Sit in the machine with the pads above your ankles. Curl the legs toward the seat and return under control."
    }
  },
  "Glute-Ham Raise": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/glute-ham-raise.gif",
      description: "Position yourself in a glute-ham developer. Lower your torso forward, then contract your hamstrings to pull yourself back upright."
    }
  },

  // Cable
  "Cable Pull Through": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-pull-through.gif",
      description: "Stand facing away from a low pulley. Grab the rope and pull it through your legs as you hinge at the hips, then thrust your hips forward to stand up."
    }
  },
  "Cable Leg Curl": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-leg-curl.gif",
      description: "Attach an ankle strap to a low pulley. Stand and curl your heel toward your glutes, keeping control throughout."
    }
  },

  // Kettlebell
  "Kettlebell Romanian Deadlift": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-romanian-deadlift.gif",
      description: "Hold a kettlebell in front of you. Hinge at the hips to lower it, keeping your back straight. Drive through your heels to stand back up."
    }
  },
  "Kettlebell Swing": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-swing.gif",
      description: "Swing a kettlebell from between your legs to chest height using hip drive. Let your hamstrings and glutes control the movement."
    }
  },

  // Smith Machine
  "Smith Machine Romanian Deadlift": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-romanian-deadlift.gif",
      description: "With the bar on the Smith machine, lower it down your legs by hinging at the hips. Engage your hamstrings and glutes to pull yourself back up."
    }
  },

  // Bodyweight
  "Nordic Curl": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/nordic-curl.gif",
      description: "Anchor your feet and slowly lower your torso forward, using hamstrings to control the descent. Pull yourself back up with hamstring force."
    }
  },
  "Stability Ball Leg Curl": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/stability-ball-leg-curl.gif",
      description: "Lie on your back with feet on a stability ball. Raise your hips and curl the ball toward your glutes, then extend again."
    }
  },

  // Cardio
  "Cycling": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/cycling.gif",
      description: "Ride a stationary or road bike to engage your hamstrings throughout the pedaling cycle."
    }
  },
  "Uphill Walking": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/uphill-walking.gif",
      description: "Walk uphill or on an inclined treadmill to increase hamstring and glute activation with each step."
    }
  },
}
 
const exerciseAssetsFemale = {
   // Shoulders - Dumbbells
   "Dumbbell Shoulder Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/dumbbell-shoulder-press.gif",
      description: "Sit on a bench with dumbbells at shoulder height. Press them up overhead until your arms are fully extended. Lower with control.",
      alternatives: ["Arnold Press", "Lighter Barbell Overhead Press", "Shoulder Press Machine"]
    }
  },
  "Dumbbell Lateral Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/dumbbell-lateral-raise.gif",
      description: "Stand with dumbbells at your sides. Raise arms out to shoulder height, keeping a slight bend in your elbows. Lower slowly.",
      alternatives: ["Cable Lateral Raise", "Lateral Raise Machine", "Plate Lateral Raise"]
    }
  },
  "Front Raise with Control": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/front-raise-with-control.gif",
      description: "Hold dumbbells in front of your thighs. Lift them straight in front of you to shoulder level. Lower with full control.",
      alternatives: ["Cable Front Raise", "Light Plate Front Raise", "Barbell Front Raise"]
    }
  },
  "Arnold Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/arnold-press.gif",
      description: "Start with dumbbells in front of your shoulders, palms facing you. Rotate palms outward as you press overhead. Lower back and reverse the motion.",
      alternatives: ["Dumbbell Shoulder Press", "Push Press with Proper Form", "Kettlebell Single Arm Press"]
    }
  },

  // Shoulders - Barbell
  "Lighter Barbell Overhead Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/lighter-barbell-overhead-press.gif",
      description: "Use a lighter barbell at shoulder height. Press it overhead and fully extend your arms. Return with control.",
      alternatives: ["Smith Machine Overhead Press", "Push Press with Proper Form", "Dumbbell Shoulder Press"]
    }
  },
  "Controlled Upright Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/controlled-upright-row.gif",
      description: "Stand with a barbell in front of you. Pull it straight up to chest height, keeping it close to your body. Lower slowly.",
      alternatives: ["Smith Machine Upright Row", "Face Pull with External Rotation", "Dumbbell Upright Row"]
    }
  },
  "Push Press with Proper Form": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Advanced",
    female: {
      src: "/src/assets/exercises/female/push-press-with-proper-form.gif",
      description: "With barbell at shoulders, dip your knees and explosively press the bar overhead. Catch and lower with control.",
      alternatives: ["Kettlebell Push Press", "Lighter Barbell Overhead Press", "Arnold Press"]
    }
  },

  // Shoulders - Machine
  "Shoulder Press Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/shoulder-press-machine.gif",
      description: "Sit upright with handles at shoulder level. Press upward until arms are extended. Return to the start position.",
      alternatives: ["Smith Machine Overhead Press", "Dumbbell Shoulder Press", "Kettlebell Single Arm Press"]
    }
  },
  "Lateral Raise Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/lateral-raise-machine.gif",
      description: "Sit with arms under the machine pads. Raise arms outward to shoulder height, then return slowly.",
      alternatives: ["Dumbbell Lateral Raise", "Cable Lateral Raise", "Plate Lateral Raise"]
    }
  },
  "Reverse Pec Deck": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/reverse-pec-deck.gif",
      description: "Sit facing the machine. With arms extended, pull the handles back by squeezing your shoulder blades together. Return slowly.",
      alternatives: ["Face Pull with External Rotation", "Cable Reverse Fly", "Dumbbell Reverse Fly"]
    }
  },

  // Shoulders - Cable
  "Cable Lateral Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/cable-lateral-raise.gif",
      description: "Stand beside a low cable pulley. Raise the handle laterally to shoulder height. Lower with control.",
      alternatives: ["Dumbbell Lateral Raise", "Lateral Raise Machine", "Plate Lateral Raise"]
    }
  },
  "Cable Front Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/cable-front-raise.gif",
      description: "Face away from a low pulley. Raise the handle in front of you to shoulder height, keeping arm straight. Lower slowly.",
      alternatives: ["Front Raise with Control", "Light Plate Front Raise", "Dumbbell Front Raise"]
    }
  },
  "Face Pull with External Rotation": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/face-pull-external-rotation.gif",
      description: "Use a rope at face height. Pull the rope toward your face while rotating your hands outward at the end. Return with control.",
      alternatives: ["Reverse Pec Deck", "Controlled Upright Row", "Dumbbell Reverse Fly"]
    }
  },

  // Shoulders - Kettlebell
  "Kettlebell Single Arm Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/kettlebell-single-arm-press.gif",
      description: "Hold a kettlebell at shoulder height. Press it overhead with one arm and lower with control.",
      alternatives: ["Arnold Press", "Kettlebell Push Press", "Dumbbell Shoulder Press"]
    }
  },
  "Kettlebell Push Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/kettlebell-push-press.gif",
      description: "Slightly bend knees then explosively drive the kettlebell overhead. Lower with control.",
      alternatives: ["Push Press with Proper Form", "Kettlebell Single Arm Press", "Dumbbell Shoulder Press"]
    }
  },

  // Shoulders - Plate
  "Light Plate Front Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/light-plate-front-raise.gif",
      description: "Hold a light plate with both hands. Raise it in front of you to shoulder height, then return slowly.",
      alternatives: ["Cable Front Raise", "Front Raise with Control", "Dumbbell Front Raise"]
    }
  },
  "Plate Lateral Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/plate-lateral-raise.gif",
      description: "Hold a plate at your side. Raise it laterally to shoulder height, then return with control.",
      alternatives: ["Dumbbell Lateral Raise", "Cable Lateral Raise", "Lateral Raise Machine"]
    }
  },

  // Shoulders - Smith Machine
  "Smith Machine Overhead Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/smith-machine-overhead-press.gif",
      description: "Use the Smith machine bar at shoulder height. Press it overhead until arms are fully extended. Lower with control.",
      alternatives: ["Lighter Barbell Overhead Press", "Shoulder Press Machine", "Dumbbell Shoulder Press"]
    }
  },
  "Smith Machine Upright Row": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/smith-machine-upright-row.gif",
      description: "Pull the Smith machine bar up to your chest, keeping it close to your body. Lower with control.",
      alternatives: ["Controlled Upright Row", "Face Pull with External Rotation", "Cable Upright Row"]
    }
  },

  // Shoulders - Bodyweight
  "Incline Pike Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/incline-pike-push-ups.gif",
      description: "In a downward dog position with feet elevated, lower your head to the floor. Push back up.",
      alternatives: ["Wall Handstand Hold", "Wall Push-ups", "Dumbbell Shoulder Press"]
    }
  },
  "Wall Handstand Hold": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    female: {
      src: "/src/assets/exercises/female/wall-handstand-hold.gif",
      description: "Kick into a handstand position against a wall. Hold the position while keeping your core tight and shoulders active.",
      alternatives: ["Incline Pike Push-ups", "Wall Push-ups", "Handstand Push-ups"]
    }
  },
  "Wall Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/wall-push-ups.gif",
      description: "Stand facing a wall. Place hands on the wall and perform push-ups, keeping your body straight and controlled.",
      alternatives: ["Incline Pike Push-ups", "Shoulder Press Machine", "Dumbbell Shoulder Press"]
    }
  }
};
  
  
const exerciseAlternativesMale = {
  "Dumbbell Shoulder Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-shoulder-press.gif",
      description: "Sit on a bench with back support. Hold a dumbbell in each hand at shoulder height. Press the weights upward until your arms are fully extended. Lower back to starting position.",
      alternatives: ["Arnold Press", "Barbell Overhead Press", "Machine Shoulder Press"]
    }
  },
  // Shoulder Exercises Alternatives
  "Arnold Press": {
    type: "animation",
    equipment: "Dumbbells", 
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/arnold-press.gif",
      description: "Sit with dumbbells held in front at shoulder height, palms facing you. As you press up, rotate your palms to face forward at the top. Reverse the movement on the way down."
    }
  },
  "Barbell Overhead Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-overhead-press.gif",
      description: "Stand with feet shoulder-width apart, holding a barbell at shoulder height. Press the bar overhead until arms are fully extended. Lower the bar back to shoulder height."
    }
  },
  "Machine Shoulder Press": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/shoulder-press-machine.gif",
      description: "Sit in the machine with back supported. Adjust the seat so handles are at shoulder height. Press the handles upward until arms are extended. Lower back to starting position."
    }
  },
  "Dumbbell Lateral Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-lateral-raise.gif",
      description: "Stand with dumbbells at your sides. Keep a slight bend in your elbows and raise the weights out to the sides until they reach shoulder level. Lower back down with control."
    }
  },
  "Cable Lateral Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-lateral-raise.gif",
      description: "Stand sideways to a low cable pulley. Grasp the handle and raise your arm out to the side until it reaches shoulder level. Lower with control and repeat."
    }
  },

  "Shoulder Press Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/shoulder-press-machine.gif",
      description: "Sit in the machine with back supported. Adjust the seat so handles are at shoulder height. Press the handles upward until arms are extended. Lower back to starting position.",
      alternatives: ["Dumbbell Shoulder Press", "Barbell Overhead Press", "Smith Machine Overhead Press"]
    }
  },
  "Machine Lateral Raise": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/lateral-raise-machine.gif",
      description: "Sit in the machine with arms positioned under the pads. Push outward and upward with your arms until they reach shoulder level. Return to starting position with control."
    }
  },
  "Plate Lateral Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-lateral-raise.gif",
      description: "Hold a weight plate with both hands at the center. Raise the plate out to the side until arms reach shoulder height. Lower with control and repeat on the other side."
    }
  },
  "Dumbbell Front Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-front-raise.gif",
      description: "Stand holding dumbbells in front of your thighs. Keeping your arms straight, lift the weights forward and upward until they reach shoulder height. Lower back down with control."
    }
  },
  "Cable Front Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-front-raise.gif",
      description: "Stand facing away from a low cable pulley. Grasp the handle and raise your arm forward until it reaches shoulder height. Lower with control and repeat."
    }
  },
  "Plate Front Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-front-raise.gif",
      description: "Hold a weight plate with both hands at the bottom. Raise the plate forward and upward until arms reach shoulder height. Lower with control back to starting position."
    }
  },
  "Barbell Upright Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-upright-row.gif",
      description: "Stand holding a barbell with hands shoulder-width apart. Pull the barbell up vertically to chin height, keeping it close to your body. Lower back down with control."
    }
  },
  "Face Pull": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/face-pull.gif",
      description: "Stand facing a cable machine with rope attachment at head height. Pull the rope toward your face, separating the ends as you pull. Return to starting position with control."
    }
  },
  "Pike Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/pike-push-ups.gif",
      description: "Get into a downward dog position with hips high. Bend your elbows to lower your head toward the floor. Push back up to the starting position."
    }
  },
  "Handstand Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/handstand-push-ups.gif",
      description: "Get into a handstand position against a wall. Lower your body by bending your elbows until your head nearly touches the ground. Push back up to the starting position."
    }
  },
  "Wall Walks": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/wall-walks.gif",
      description: "Start in a plank position with feet against a wall. Walk your feet up the wall while walking your hands closer to the wall. Reverse the movement to return to the starting position."
    }
  },
  "Kettlebell Overhead Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-overhead-press.gif",
      description: "Stand holding a kettlebell at shoulder height. Press it overhead until your arm is fully extended. Lower it back to the shoulder with control."
    }
  },
  "Kettlebell Push Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-push-press.gif",
      description: "Stand with kettlebell at shoulder height. Slightly bend knees, then explosively extend legs while pressing the kettlebell overhead. Lower back to starting position."
    }
  },
  "Smith Machine Overhead Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-overhead-press.gif",
      description: "Sit or stand with the Smith machine bar at shoulder height. Press the bar overhead until arms are fully extended. Lower the bar back to shoulder height with control."
    }
  },
  "Smith Machine Upright Row": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-upright-row.gif",
      description: "Stand holding the Smith machine bar with hands shoulder-width apart. Pull the bar up vertically to chin height, keeping it close to your body. Lower back down with control."
    }
  },

  "Dumbbell Bench Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-bench-press.gif",
      description: "Lie on a flat bench holding a dumbbell in each hand. Press the dumbbells upward until arms are extended, then lower them until elbows are at 90 degrees.",
      alternatives: ["Barbell Bench Press", "Incline Dumbbell Press", "Chest Press Machine"]
    }
  },
  "Dumbbell Flyes": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-flyes.gif",
      description: "Lie on a bench holding dumbbells above your chest. With a slight bend in the elbows, lower the dumbbells in a wide arc to the sides, then bring them back together above the chest.",
      alternatives: ["Cable Flyes", "Pec Deck Machine", "Incline Dumbbell Flyes"]
    }
  },
  "Incline Dumbbell Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/incline-dumbbell-press.gif",
      description: "Set a bench to an incline and lie back holding dumbbells. Press the weights upward and slightly inward above your chest. Lower back to starting position.",
      alternatives: ["Incline Bench Press", "Incline Machine Press", "Dumbbell Bench Press"]
    }
  },
  "Single Arm Dumbbell Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/single-arm-dumbbell-press.gif",
      description: "Lie on a bench with one dumbbell. Press it upward while keeping the core tight for stability. Lower with control and repeat.",
      alternatives: ["Dumbbell Bench Press", "Barbell Bench Press", "Dumbbell Flyes"]
    }
  },

  // Chest - Barbell
  "Barbell Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-bench-press.gif",
      description: "Lie on a bench with a barbell over your chest. Lower the bar until it touches your chest, then press it back up to the starting position.",
      alternatives: ["Dumbbell Bench Press", "Chest Press Machine", "Smith Machine Bench Press"]
    }
  },
  "Incline Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/incline-bench-press.gif",
      description: "Lie on an incline bench holding a barbell. Lower the bar to your upper chest, then press it back up to the starting position.",
      alternatives: ["Incline Dumbbell Press", "Smith Machine Incline Press", "Incline Chest Press Machine"]
    }
  },
  "Close Grip Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/close-grip-bench-press.gif",
      description: "Lie on a bench and grip the barbell shoulder-width or narrower. Lower the bar to your chest and press back up, focusing on triceps and inner chest.",
      alternatives: ["Diamond Push-ups", "Dumbbell Close Press", "Chest Dips"]
    }
  },

  // Chest - Machine
  "Chest Press Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/chest-press-machine.gif",
      description: "Sit in the machine with hands at chest level. Press the handles forward until your arms are extended, then return with control.",
      alternatives: ["Dumbbell Bench Press", "Barbell Bench Press", "Smith Machine Bench Press"]
    }
  },
  "Pec Deck Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/pec-deck-machine.gif",
      description: "Sit in the pec deck with arms outstretched on the pads. Squeeze the handles together until they meet in front of your chest, then return slowly.",
      alternatives: ["Dumbbell Flyes", "Cable Flyes", "Chest Press Machine"]
    }
  },
  "Cable Crossover": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-crossover.gif",
      description: "Stand between two cable pulleys. With a handle in each hand, bring your hands together in front of your body in a controlled arc, squeezing the chest.",
      alternatives: ["Cable Flyes", "Dumbbell Flyes", "Pec Deck Machine"]
    }
  },

  // Chest - Cable
  "Cable Flyes": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-flyes.gif",
      description: "Stand slightly forward between two cables. Pull the handles together in front of your chest with a slight bend in the elbows. Return to start with control.",
      alternatives: ["Dumbbell Flyes", "Cable Crossover", "Pec Deck Machine"]
    }
  },
  "Low Cable Crossover": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/low-cable-crossover.gif",
      description: "Position cables low. With a handle in each hand, bring arms upward and inward to chest height. Squeeze the chest, then return with control.",
      alternatives: ["Cable Flyes", "Dumbbell Flyes", "Cable Crossover"]
    }
  },

  // Chest - Kettlebell
  "Kettlebell Floor Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-floor-press.gif",
      description: "Lie on the floor with kettlebells in hand. Press them straight up, then lower until elbows touch the ground.",
      alternatives: ["Dumbbell Bench Press", "Chest Press Machine", "Barbell Floor Press"]
    }
  },
  "Kettlebell Flyes": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-flyes.gif",
      description: "Lie on a bench with kettlebells above chest. Lower arms in a wide arc to sides, then return to starting position.",
      alternatives: ["Dumbbell Flyes", "Cable Flyes", "Pec Deck Machine"]
    }
  },

  // Chest - Plate
  "Plate Press": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-press.gif",
      description: "Hold a plate between your palms in front of your chest. Press it forward, then bring it back while squeezing your chest.",
      alternatives: ["Svend Press", "Push-ups", "Cable Flyes"]
    }
  },
  "Svend Press": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/svend-press.gif",
      description: "Hold a plate between your palms and press outward in front of your chest, squeezing the chest muscles throughout the movement.",
      alternatives: ["Plate Press", "Push-ups", "Cable Flyes"]
    }
  },

  // Chest - Smith Machine
  "Smith Machine Bench Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-bench-press.gif",
      description: "Lie on a bench under the Smith machine bar. Lower the bar to chest level and press back up with control.",
      alternatives: ["Barbell Bench Press", "Chest Press Machine", "Dumbbell Bench Press"]
    }
  },
  "Smith Machine Incline Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-incline-press.gif",
      description: "Lie on an incline bench under the Smith machine. Press the bar upward and slightly inward, then lower with control.",
      alternatives: ["Incline Dumbbell Press", "Incline Bench Press", "Incline Chest Press Machine"]
    }
  },

  // Chest - Bodyweight
  "Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/push-ups.gif",
      description: "Start in a plank position. Lower your body until your chest is close to the floor, then push back up to the starting position.",
      alternatives: ["Incline Push-ups", "Wide Push-ups", "Dumbbell Bench Press"]
    }
  },
  "Incline Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/incline-push-ups.gif",
      description: "Place hands on a raised surface. Lower your body to the surface, then push back up.",
      alternatives: ["Push-ups", "Chest Press Machine", "Dumbbell Bench Press"]
    }
  },
  "Wide Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/wide-push-ups.gif",
      description: "Perform a push-up with hands set wider than shoulder-width to emphasize the chest.",
      alternatives: ["Push-ups", "Cable Flyes", "Chest Press Machine"]
    }
  },
  "Diamond Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/diamond-push-ups.gif",
      description: "Place hands close together forming a diamond shape. Perform push-ups focusing on the inner chest and triceps.",
      alternatives: ["Close Grip Bench Press", "Push-ups", "Plate Press"]
    }
  },
  // Dumbbells
  "Dumbbell Bench Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-bench-press.gif",
      description: "Lie on a flat bench holding a dumbbell in each hand. Press the dumbbells upward until arms are extended, then lower them until elbows are at 90 degrees."
    }
  },
  "Dumbbell Flyes": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-flyes.gif",
      description: "Lie on a bench holding dumbbells above your chest. Lower the dumbbells in a wide arc, then bring them back together above your chest."
    }
  },
  "Incline Dumbbell Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/incline-dumbbell-press.gif",
      description: "Set a bench to an incline and lie back holding dumbbells. Press the weights upward and slightly inward above your chest. Lower back to starting position."
    }
  },
  "Single Arm Dumbbell Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/single-arm-dumbbell-press.gif",
      description: "Lie on a bench with one dumbbell. Press it upward while keeping the core tight for stability. Lower with control and repeat."
    }
  },

  // Barbell
  "Barbell Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-bench-press.gif",
      description: "Lie on a bench with a barbell over your chest. Lower the bar until it touches your chest, then press it back up to the starting position."
    }
  },
  "Incline Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/incline-bench-press.gif",
      description: "Lie on an incline bench holding a barbell. Lower the bar to your upper chest, then press it back up to the starting position."
    }
  },
  "Close Grip Bench Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/close-grip-bench-press.gif",
      description: "Lie on a bench and grip the barbell shoulder-width or narrower. Lower the bar to your chest and press back up, focusing on triceps and inner chest."
    }
  },

  // Machine
  "Chest Press Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/chest-press-machine.gif",
      description: "Sit in the machine with hands at chest level. Press the handles forward until your arms are extended, then return with control."
    }
  },
  "Pec Deck Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/pec-deck-machine.gif",
      description: "Sit in the pec deck with arms outstretched on the pads. Squeeze the handles together until they meet in front of your chest, then return slowly."
    }
  },
  "Cable Crossover": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-crossover.gif",
      description: "Stand between two cable pulleys. With a handle in each hand, bring your hands together in front of your body in a controlled arc, squeezing the chest."
    }
  },

  // Cable
  "Cable Flyes": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-flyes.gif",
      description: "Stand slightly forward between two cables. Pull the handles together in front of your chest with a slight bend in the elbows. Return to start with control."
    }
  },
  "Low Cable Crossover": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/low-cable-crossover.gif",
      description: "Position cables low. With a handle in each hand, bring arms upward and inward to chest height. Squeeze the chest, then return with control."
    }
  },

  // Kettlebell
  "Kettlebell Floor Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-floor-press.gif",
      description: "Lie on the floor with kettlebells in hand. Press them straight up, then lower until elbows touch the ground."
    }
  },
  "Kettlebell Flyes": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-flyes.gif",
      description: "Lie on a bench with kettlebells above chest. Lower arms in a wide arc to sides, then return to starting position."
    }
  },

  // Plate
  "Plate Press": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-press.gif",
      description: "Hold a plate between your palms in front of your chest. Press it forward, then bring it back while squeezing your chest."
    }
  },
  "Svend Press": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/svend-press.gif",
      description: "Hold a plate between your palms and press outward in front of your chest, squeezing the chest muscles throughout the movement."
    }
  },

  // Smith Machine
  "Smith Machine Bench Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-bench-press.gif",
      description: "Lie on a bench under the Smith machine bar. Lower the bar to chest level and press back up with control."
    }
  },
  "Smith Machine Incline Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-incline-press.gif",
      description: "Lie on an incline bench under the Smith machine. Press the bar upward and slightly inward, then lower with control."
    }
  },

  // Bodyweight
  "Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/push-ups.gif",
      description: "Start in a plank position. Lower your body until your chest is close to the floor, then push back up to the starting position."
    }
  },
  "Incline Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/incline-push-ups.gif",
      description: "Place hands on a raised surface. Lower your body to the surface, then push back up."
    }
  },
  "Wide Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/wide-push-ups.gif",
      description: "Perform a push-up with hands set wider than shoulder-width to emphasize the chest."
    }
  },
  "Diamond Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/diamond-push-ups.gif",
      description: "Place hands close together forming a diamond shape. Perform push-ups focusing on the inner chest and triceps."
    }
  },

   // Dumbbells
   "Dumbbell Bicep Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-bicep-curl.gif",
      description: "Stand with a dumbbell in each hand. Curl the weights up while keeping your elbows close to your torso. Lower with control."
    }
  },
  "Hammer Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/hammer-curl.gif",
      description: "Hold dumbbells with palms facing your body. Curl the weights up while keeping the neutral grip. Lower with control."
    }
  },
  "Concentration Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/concentration-curl.gif",
      description: "Sit with your elbow resting on your inner thigh. Curl the dumbbell upward and squeeze at the top. Lower with control."
    }
  },
  "Alternating Bicep Curl": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/alternating-bicep-curl.gif",
      description: "Stand holding dumbbells at your sides. Curl one arm at a time while keeping the other relaxed. Alternate sides."
    }
  },

  // Barbell
  "Lighter Barbell Curl": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/lighter-barbell-curl.gif",
      description: "Hold a light barbell with an underhand grip. Curl the bar up while keeping your elbows still. Lower with control."
    }
  },
  "EZ Bar Curl": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/ez-bar-curl.gif",
      description: "Hold an EZ curl bar with a comfortable grip. Curl the bar up and squeeze the biceps. Lower back slowly."
    }
  },
  "Reverse Grip Barbell Curl": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/reverse-grip-barbell-curl.gif",
      description: "Hold a barbell with palms facing down. Curl the bar upward using your biceps and forearms. Lower with control."
    }
  },

  // Machine
  "Machine Bicep Curl": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/machine-bicep-curl.gif",
      description: "Sit at the machine with arms positioned on the pad. Curl the handles upward and squeeze, then return slowly."
    }
  },
  "Cable Bicep Curl": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-bicep-curl.gif",
      description: "Stand facing a low cable pulley. Curl the handle toward your shoulders, keeping elbows tucked. Lower back with control."
    }
  },

  // Cable
  "Cable Hammer Curl": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-hammer-curl.gif",
      description: "Use a rope attachment on a low pulley. Curl upward with palms facing each other. Squeeze and lower slowly."
    }
  },
  "Rope Hammer Curl": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/rope-hammer-curl.gif",
      description: "Grab the rope and perform hammer curls by keeping palms neutral and pulling toward your shoulders. Return with control."
    }
  },

  // Kettlebell
  "Kettlebell Bicep Curl": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-bicep-curl.gif",
      description: "Hold kettlebells at your sides. Curl them upward and squeeze the biceps at the top. Lower slowly."
    }
  },
  "Kettlebell Hammer Curl": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-hammer-curl.gif",
      description: "Hold kettlebells in a neutral grip. Curl upward without rotating your wrists. Return to starting position with control."
    }
  },

  // Plate
  "Plate Curl": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-curl.gif",
      description: "Hold a weight plate at the sides. Curl it toward your chest and squeeze, then lower back slowly."
    }
  },

  // Smith Machine
  "Smith Machine Drag Curl": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-drag-curl.gif",
      description: "Hold the Smith machine bar and pull it up close to your torso. Focus on the biceps and keep elbows back."
    }
  },

  // Bodyweight
  "Chin-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/chin-ups.gif",
      description: "Grab a bar with palms facing you. Pull your chin above the bar using biceps and back. Lower with control."
    }
  },
  "Close Grip Pull-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/close-grip-pull-ups.gif",
      description: "Use a close underhand grip. Pull your body up until chin is above the bar. Lower back slowly."
    }
  },
  "Inverted Row (Underhand)": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/inverted-row-underhand.gif",
      description: "Lie under a bar with underhand grip. Pull your chest toward the bar by squeezing your arms and back."
    }
  },

  // Dumbbells
  "Dumbbell Russian Twist": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-russian-twist.gif",
      description: "Sit on the floor with knees bent, holding a dumbbell with both hands. Twist your torso from side to side, bringing the dumbbell across your body each time."
    }
  },
  "Light Weighted Crunch": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/light-weighted-crunch.gif",
      description: "Lie on your back holding a light dumbbell against your chest. Perform crunches by lifting your upper back off the floor and engaging your abs."
    }
  },
  "Side Bend": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/side-bend.gif",
      description: "Stand with a dumbbell in one hand. Bend to the side at the waist and return to upright. Repeat on both sides."
    }
  },

  // Machine
  "Ab Crunch Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/ab-crunch-machine.gif",
      description: "Sit in the machine with the pads against your upper chest. Crunch forward by contracting your abs, then return slowly."
    }
  },
  "Hanging Leg Raise": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hanging-leg-raise.gif",
      description: "Hang from a pull-up bar. Keeping legs straight or slightly bent, raise them in front of you to activate the core."
    }
  },
  "Roman Chair": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/roman-chair.gif",
      description: "Position yourself in the Roman chair. Raise knees toward your chest while keeping the movement controlled."
    }
  },

  // Cable
  "Cable Crunch": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-crunch.gif",
      description: "Attach a rope to a high pulley. Kneel below it and crunch downward, pulling the rope with your head down toward your knees."
    }
  },
  "Cable Woodchopper": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-woodchopper.gif",
      description: "Set a cable to a high pulley. Pull the handle diagonally across your body, rotating your torso to engage the obliques."
    }
  },
  "Cable Oblique Twist": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-oblique-twist.gif",
      description: "Set the cable to chest height. Pull the handle across your body in a twisting motion to work the obliques."
    }
  },

  // Kettlebell
  "Kettlebell Russian Twist": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-russian-twist.gif",
      description: "Sit with knees bent and lean back slightly. Hold a kettlebell and twist your torso side to side."
    }
  },
  "Kettlebell Windmill": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/kettlebell-windmill.gif",
      description: "Hold a kettlebell overhead with one arm. Keeping legs straight, bend at the waist and touch the opposite foot with your free hand."
    }
  },

  // Plate
  "Plate Russian Twist": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/plate-russian-twist.gif",
      description: "Sit on the floor with knees bent, holding a plate. Twist your torso from side to side, tapping the plate beside you each time."
    }
  },
  "Weighted Plank with Plate": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/weighted-plank-with-plate.gif",
      description: "Get into a plank position with a weight plate on your back. Maintain form by keeping your core tight."
    }
  },

  // Bodyweight
  "Crunches": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/crunches.gif",
      description: "Lie on your back with knees bent. Lift your shoulders off the ground by contracting your abs, then return with control."
    }
  },
  "Hanging Leg Raises": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hanging-leg-raises.gif",
      description: "Hang from a pull-up bar. Raise your legs straight up in front of you, then lower them back with control."
    }
  },
  "Plank": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plank.gif",
      description: "Hold a plank position on your forearms and toes, keeping your body straight from head to heels."
    }
  },
  "Side Plank": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/side-plank.gif",
      description: "Lie on your side and prop yourself up with one forearm. Keep your body straight and hold the position."
    }
  },
  "Mountain Climbers": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/mountain-climbers.gif",
      description: "Start in a plank position. Alternate driving your knees toward your chest in a running motion."
    }
  },
  "Bicycle Crunch": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/bicycle-crunch.gif",
      description: "Lie on your back and lift your legs. Alternate bringing each elbow toward the opposite knee in a pedaling motion."
    }
  },

  // Cardio
  "Plank Jacks": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/plank-jacks.gif",
      description: "Hold a plank position while jumping your feet in and out, like a jumping jack motion for your core."
    }
  },

   // Dumbbells
   "Dumbbell Squat": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-squat.gif",
      description: "Hold dumbbells at your sides. Lower into a squat by bending your knees and hips. Keep your chest up and push back to standing."
    }
  },
  "Dumbbell Lunge": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-lunge.gif",
      description: "Hold dumbbells at your sides. Step forward into a lunge, keeping your knee over your ankle. Push back to start."
    }
  },
  "Dumbbell Step-up": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-step-up.gif",
      description: "Hold dumbbells and step up onto a box or bench with one leg. Drive through your heel to stand, then step down."
    }
  },
  "Goblet Squat": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/goblet-squat.gif",
      description: "Hold a dumbbell vertically at chest level. Lower into a squat with elbows inside the knees, then return to standing."
    }
  },

  // Barbell
  "Barbell Squat": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-squat.gif",
      description: "Place a barbell on your upper back. Squat down by bending your hips and knees, then push back up to standing."
    }
  },
  "Front Squat": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/front-squat.gif",
      description: "Hold a barbell across your front shoulders. Keep your chest upright as you squat down, then return to standing."
    }
  },
  "Barbell Bulgarian Split Squat": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/split-squat.gif",
      description: "Place one leg behind you on a bench. Lower into a squat with the front leg. Push back up through the heel."
    }
  },
  "Barbell Lunge": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-lunge.gif",
      description: "With a barbell on your back, step forward into a lunge. Push back through your heel to return to start."
    }
  },

  // Machine
  "Leg Press": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/leg-press.gif",
      description: "Sit in the leg press machine and place feet on the platform. Push away until legs are extended, then return with control."
    }
  },
  "Leg Extension": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/leg-extension.gif",
      description: "Sit on the machine with feet under the pad. Extend your knees to raise the pad, then lower with control."
    }
  },
  "Hack Squat Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hack-squat-machine.gif",
      description: "Position yourself in the machine with back against the pad. Lower into a squat and push back up through your heels."
    }
  },

  // Cable
  "Cable Squat": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-squat.gif",
      description: "Hold the cable handle at chest level. Lower into a squat, keeping tension on the cable, then return to standing."
    }
  },

  // Kettlebell
  "Kettlebell Goblet Squat": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/kettlebell-goblet-squat.gif",
      description: "Hold a kettlebell at chest level. Lower into a deep squat, keeping your back straight, then stand back up."
    }
  },
  "Kettlebell Lunge": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-lunge.gif",
      description: "Hold kettlebells by your sides and step into a lunge. Keep your core tight and return to standing."
    }
  },
  "Kettlebell Step-up": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-step-up.gif",
      description: "Hold kettlebells and step up onto a box. Push through your heel to stand fully, then step down with control."
    }
  },

  // Plate
  "Plate Squat": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/plate-squat.gif",
      description: "Hold a weight plate at your chest. Squat down until thighs are parallel to the ground, then push back up."
    }
  },

  // Smith Machine
  "Smith Machine Squat": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-squat.gif",
      description: "Position yourself under the Smith bar. Lower into a squat and press back up while keeping the bar stable."
    }
  },
  "Smith Machine Split Squat": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-split-squat.gif",
      description: "With one leg elevated behind you, squat down using the front leg while the bar guides movement."
    }
  },

  // Bodyweight
  "Bodyweight Squat": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/bodyweight-squat.gif",
      description: "Stand with feet shoulder-width apart. Lower into a squat and return to standing by pushing through your heels."
    }
  },
  "Walking Lunge": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/walking-lunge.gif",
      description: "Step forward into a lunge, then immediately step into a lunge with the other leg while walking forward."
    }
  },
  "Split Squat": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/split-squat-bodyweight.gif",
      description: "Place one leg behind you on a surface. Lower into a squat on your front leg and return to standing."
    }
  },
  "Jump Squat": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/jump-squat.gif",
      description: "Squat down and explosively jump upward. Land softly and repeat."
    }
  },
  "Box Step-up": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/box-step-up.gif",
      description: "Step onto a box or bench with one foot. Drive up through your heel, then step back down."
    }
  },

  // Cardio
  "Box Jumps": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/box-jumps.gif",
      description: "Stand in front of a box and jump onto it with both feet. Land softly and step or jump down."
    }
  },
  "Jump Rope": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/jump-rope.gif",
      description: "Jump continuously over a rope held in your hands to improve endurance and strengthen the legs."
    }
  },
  "Stair Climber": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/stair-climber.gif",
      description: "Use a stair climber machine to simulate walking up stairs, targeting quads, glutes, and calves."
    }
  },

  // Dumbbells
  "Dumbbell Calf Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-calf-raise.gif",
      description: "Hold dumbbells at your sides and stand with feet hip-width apart. Raise your heels off the floor, squeezing your calves, then lower slowly."
    }
  },
  "Seated Dumbbell Calf Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/seated-dumbbell-calf-raise.gif",
      description: "Sit on a bench with dumbbells on your thighs. Raise your heels as high as possible, then lower them under control."
    }
  },

  // Barbell
  "Standing Calf Raise": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/standing-calf-raise.gif",
      description: "With a barbell on your shoulders, raise your heels to contract your calves. Lower back with control."
    }
  },
  "Seated Calf Raise": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/seated-calf-raise.gif",
      description: "Sit on a bench with a barbell across your thighs. Raise and lower your heels to work the calves."
    }
  },

  // Machine
  "Standing Calf Raise Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/standing-calf-raise-machine.gif",
      description: "Stand with your shoulders under the pads. Raise your heels by contracting your calves, then lower back with control."
    }
  },
  "Seated Calf Raise Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/seated-calf-raise-machine.gif",
      description: "Sit with legs at 90 degrees and pad over your thighs. Raise and lower your heels while keeping toes flat."
    }
  },
  "Leg Press Calf Raise": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/leg-press-calf-raise.gif",
      description: "Place feet on the lower edge of the leg press plate. Push using your toes to raise your heels. Return with control."
    }
  },

  // Kettlebell
  "Kettlebell Calf Raise": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/kettlebell-calf-raise.gif",
      description: "Hold a kettlebell in one or both hands. Raise your heels off the floor to engage the calves. Lower slowly."
    }
  },

  // Plate
  "Single Leg Plate Calf Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/single-leg-plate-calf-raise.gif",
      description: "Hold a plate and perform a calf raise on one leg. Keep your knee slightly bent and movement controlled."
    }
  },

  // Smith Machine
  "Smith Machine Calf Raise": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-calf-raise.gif",
      description: "Stand under the Smith bar with feet flat. Raise your heels while keeping your knees straight. Lower under control."
    }
  },

  // Bodyweight
  "Standing Bodyweight Calf Raise": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/standing-bodyweight-calf-raise.gif",
      description: "Stand with feet flat and raise your heels off the floor. Pause at the top, then lower slowly."
    }
  },
  "Single Leg Calf Raise": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/single-leg-calf-raise.gif",
      description: "Stand on one leg and raise your heel as high as possible. Lower with control. Switch sides."
    }
  },
  "Box Calf Raise": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/box-calf-raise.gif",
      description: "Stand on the edge of a box. Drop your heels down and then raise them as high as possible to work your calves."
    }
  },

  // Cardio
  "Jump Rope": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/jump-rope.gif",
      description: "Jump repeatedly over a rope, landing softly on the balls of your feet to engage the calves."
    }
  },
  "Box Jumps": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/box-jumps.gif",
      description: "Explosively jump onto a sturdy box, landing softly. Step or jump down and repeat."
    }
  },

  // Dumbbells
  "Dumbbell Row": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-row.gif",
      description: "Bend over at the hips with a dumbbell in each hand. Pull the weights toward your torso while squeezing your shoulder blades. Lower with control."
    }
  },
  "Dumbbell Reverse Fly": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-reverse-fly.gif",
      description: "Bend at the hips with dumbbells hanging under your shoulders. Lift the arms out to the sides, squeezing the upper back."
    }
  },
  "Single Arm Row": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/single-arm-row.gif",
      description: "Place one hand and knee on a bench. Pull the dumbbell upward with the opposite hand, focusing on upper back activation."
    }
  },

  // Barbell
  "Barbell Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-row.gif",
      description: "Bend at the hips with a barbell in hand. Row the bar toward your torso and lower slowly."
    }
  },
  "T-Bar Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/t-bar-row.gif",
      description: "Load the barbell in a landmine position. Using a close-grip handle, pull the bar toward your chest and lower with control."
    }
  },
  "Underhand Grip Barbell Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/underhand-barbell-row.gif",
      description: "Hold a barbell with an underhand grip. Row toward your waist while keeping your torso stable."
    }
  },

  // Machine
  "Lat Pulldown": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/lat-pulldown.gif",
      description: "Sit at the pulldown machine. Pull the bar down toward your chest while keeping your back straight. Slowly return."
    }
  },
  "Seated Row Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/seated-row-machine.gif",
      description: "Sit down and grab the handles. Pull them toward your torso, squeezing your shoulder blades, then release with control."
    }
  },
  "Assisted Pull-up Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/assisted-pull-up-machine.gif",
      description: "Use the machine to support your weight as you perform pull-ups. Focus on pulling your chin above the bar."
    }
  },

  // Cable
  "Cable Row": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-row.gif",
      description: "Sit facing a low pulley. Grab the handles and pull toward your torso, squeezing your back muscles. Return slowly."
    }
  },
  "Face Pull": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/face-pull.gif",
      description: "Stand facing a cable machine with rope at eye level. Pull the rope toward your face while externally rotating your shoulders."
    }
  },
  "Straight Arm Pulldown": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/straight-arm-pulldown.gif",
      description: "Stand facing the cable machine. Keeping arms straight, pull the bar down to your thighs. Return slowly."
    }
  },

  // Kettlebell
  "Kettlebell Row": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-row.gif",
      description: "Bend over with a kettlebell in one hand. Pull toward your torso, then lower with control."
    }
  },
  "Kettlebell High Pull": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-high-pull.gif",
      description: "Stand upright and pull the kettlebell toward your chest while leading with your elbow. Lower with control."
    }
  },

  // Plate
  "Plate Pullover": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/plate-pullover.gif",
      description: "Lie on a bench holding a plate. Lower it behind your head in an arc, then return to starting position. Focus on your lats and upper back."
    }
  },

  // Smith Machine
  "Smith Machine Row": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-row.gif",
      description: "With feet shoulder-width apart and barbell locked in a Smith machine, row the bar to your torso and lower it back down."
    }
  },

  // Bodyweight
  "Pull-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/pull-ups.gif",
      description: "Hang from a bar with an overhand grip. Pull yourself up until your chin clears the bar. Lower with control."
    }
  },
  "Inverted Row": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/inverted-row.gif",
      description: "Lie under a bar and pull your chest toward it while keeping your body straight. Lower with control."
    }
  },
  "Australian Pull-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/australian-pull-ups.gif",
      description: "Hang under a low bar with your feet on the ground. Pull your chest to the bar and lower slowly."
    }
  },

  // Cardio
  "Swimming (Butterfly, Freestyle)": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/swimming.gif",
      description: "Perform freestyle or butterfly strokes in the pool to engage your lats, rear delts, and traps."
    }
  },

    // Dumbbells
    "Dumbbell Tricep Extension": {
      type: "animation",
      equipment: "Dumbbells",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/dumbbell-tricep-extension.gif",
        description: "Hold a dumbbell with both hands overhead. Lower the weight behind your head, then extend your arms back to the top."
      }
    },
    "Kickback": {
      type: "animation",
      equipment: "Dumbbells",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/dumbbell-kickback.gif",
        description: "With your torso bent forward, extend the dumbbell behind you by straightening the elbow. Squeeze and return."
      }
    },
    "Overhead Extension": {
      type: "animation",
      equipment: "Dumbbells",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/dumbbell-overhead-extension.gif",
        description: "Hold a single dumbbell with both hands overhead. Lower it behind your head, then extend to starting position."
      }
    },
  
    // Barbell
    "Close Grip Bench Press": {
      type: "animation",
      equipment: "Barbell",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/close-grip-bench-press.gif",
        description: "Lie on a bench holding a barbell with hands close together. Lower the bar to your chest and push it back up."
      }
    },
    "Skull Crushers": {
      type: "animation",
      equipment: "Barbell",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/skull-crushers.gif",
        description: "Lie on a bench and hold a barbell above you. Lower it to your forehead by bending your elbows, then extend back."
      }
    },
    "Overhead Tricep Extension": {
      type: "animation",
      equipment: "Barbell",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/barbell-overhead-tricep-extension.gif",
        description: "Hold a barbell overhead. Lower it behind your head by bending your elbows, then extend your arms fully."
      }
    },
  
    // Machine
    "Tricep Pushdown Machine": {
      type: "animation",
      equipment: "Machine",
      difficulty: "Beginner",
      male: {
        src: "/src/assets/exercises/male/tricep-pushdown-machine.gif",
        description: "Use the machine handle to push down and extend the arms fully. Return with control."
      }
    },
    "Assisted Dip Machine": {
      type: "animation",
      equipment: "Machine",
      difficulty: "Beginner",
      male: {
        src: "/src/assets/exercises/male/assisted-dip-machine.gif",
        description: "Use the assisted machine to perform dips, keeping your torso upright to emphasize triceps."
      }
    },
  
    // Cable
    "Tricep Pushdown": {
      type: "animation",
      equipment: "Cable",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/tricep-pushdown.gif",
        description: "Stand at a cable station. Push the handle down until your arms are fully extended, then return slowly."
      }
    },
    "Rope Pushdown": {
      type: "animation",
      equipment: "Cable",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/rope-pushdown.gif",
        description: "Use a rope attachment. Push down and split the rope ends at the bottom, then return to start."
      }
    },
    "Cable Overhead Extension": {
      type: "animation",
      equipment: "Cable",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/cable-overhead-extension.gif",
        description: "Face away from a low pulley. Hold the handle overhead and extend your arms fully, then return behind your head."
      }
    },
  
    // Kettlebell
    "Kettlebell Tricep Extension": {
      type: "animation",
      equipment: "Kettlebell",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/kettlebell-tricep-extension.gif",
        description: "Hold a kettlebell overhead with both hands. Lower it behind your head, then extend to starting position."
      }
    },
  
    // Smith Machine
    "Smith Machine Close Grip Bench Press": {
      type: "animation",
      equipment: "Smith Machine",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/smith-machine-close-grip-bench-press.gif",
        description: "Use a close grip on the Smith bar. Lower to your chest and push up to focus on triceps."
      }
    },
  
    // Bodyweight
    "Dips": {
      type: "animation",
      equipment: "Bodyweight",
      difficulty: "Intermediate",
      male: {
        src: "/src/assets/exercises/male/dips.gif",
        description: "Support yourself on parallel bars and lower your body until elbows are bent. Push back up, focusing on triceps."
      }
    },
    "Diamond Push-ups": {
      type: "animation",
      equipment: "Bodyweight",
      difficulty: "Beginner",
      male: {
        src: "/src/assets/exercises/male/diamond-push-ups.gif",
        description: "Get into push-up position with hands close together under your chest. Lower down and push back up, targeting triceps."
      }
    },
    "Bench Dips": {
      type: "animation",
      equipment: "Bodyweight",
      difficulty: "Beginner",
      male: {
        src: "/src/assets/exercises/male/bench-dips.gif",
        description: "Sit on a bench and place hands beside you. Lower your body off the bench and push back up using your triceps."
      }
    },

    // Dumbbells
  "Dumbbell Romanian Deadlift": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-romanian-deadlift.gif",
      description: "Stand holding dumbbells in front of your thighs. Hinge at the hips and lower the weights down your legs. Keep your back straight and return to standing."
    }
  },
  "Dumbbell Good Morning": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-good-morning.gif",
      description: "Place dumbbells on your shoulders. Hinge at the hips to lower your torso forward while keeping your back flat. Return to upright."
    }
  },

  // Barbell
  "Barbell Romanian Deadlift": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-romanian-deadlift.gif",
      description: "Hold a barbell at hip level. Hinge at the hips, lowering the bar while keeping your back flat. Return to standing by squeezing your glutes."
    }
  },
  "Barbell Good Morning": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-good-morning.gif",
      description: "With a barbell on your shoulders, bend forward at the hips with a straight back. Reverse the motion to return to upright."
    }
  },
  "Hyperextension": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/hyperextension.gif",
      description: "Hold a bar or plate and perform hyperextensions on a bench. Lower your torso and extend up using your lower back."
    }
  },

  // Machine
  "Back Extension Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/back-extension-machine.gif",
      description: "Sit in the machine and extend your torso backward by contracting your lower back muscles. Return slowly."
    }
  },
  "45-Degree Back Extension": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/45-degree-back-extension.gif",
      description: "Position yourself at a 45-degree hyperextension bench. Bend at the hips to lower your torso and return with control."
    }
  },

  // Cable
  "Cable Pull Through": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-pull-through.gif",
      description: "Stand facing away from the pulley. Pull the cable through your legs while hinging at the hips, then drive your hips forward to stand tall."
    }
  },

  // Kettlebell
  "Kettlebell Swing": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-swing.gif",
      description: "Swing a kettlebell from between your legs to chest height using hip drive. Keep your back flat throughout."
    }
  },
  "Kettlebell Deadlift": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/kettlebell-deadlift.gif",
      description: "Stand over a kettlebell and hinge at the hips to grip it. Lift by driving through your heels, then lower back down with control."
    }
  },

  // Plate
  "Weighted Back Extension": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/weighted-back-extension.gif",
      description: "Hold a plate across your chest and perform back extensions. Lower your torso and extend up through your lower back."
    }
  },

  // Smith Machine
  "Smith Machine Romanian Deadlift": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-romanian-deadlift.gif",
      description: "Perform a Romanian Deadlift with the bar on a Smith Machine. Lower with control and engage your glutes and hamstrings to rise."
    }
  },

  // Bodyweight
  "Superman": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/superman.gif",
      description: "Lie face down and simultaneously lift your arms, chest, and legs off the floor. Hold and lower back down."
    }
  },
  "Bird Dog": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/bird-dog.gif",
      description: "From a tabletop position, extend opposite arm and leg while maintaining balance. Return and repeat on the other side."
    }
  },
  "Back Extension": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/back-extension.gif",
      description: "Lie face down and lift your chest and legs using your lower back muscles. Lower with control."
    }
  },

  // Cardio
  "Swimming (Backstroke)": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/swimming-backstroke.gif",
      description: "Swim using the backstroke technique to engage your spinal erectors, glutes, and shoulders."
    }
  },

  // Dumbbells
  "Dumbbell Hip Thrust": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-hip-thrust.gif",
      description: "Sit on the floor with your upper back against a bench, holding a dumbbell over your hips. Drive through your heels to lift your hips until your thighs are parallel to the floor, squeezing your glutes at the top."
    }
  },
  "Dumbbell Bulgarian Split Squat": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-bulgarian-split-squat.gif",
      description: "Stand a few feet in front of a bench, holding dumbbells at your sides. Place one foot behind you on the bench and lower your body until your front thigh is parallel to the floor. Push through your front heel to return to standing."
    }
  },
  "Dumbbell Step-up": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/dumbbell-step-up.gif",
      description: "Holding dumbbells at your sides, step onto a bench or sturdy platform with one foot, pressing through your heel to lift your body up. Step down and repeat on the other side."
    }
  },

  // Barbell
  "Barbell Hip Thrust": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-hip-thrust.gif",
      description: "Sit on the floor with your upper back against a bench and a barbell over your hips. Drive through your heels to lift your hips until your thighs are parallel to the floor, squeezing your glutes at the top."
    }
  },
  "Barbell Glute Bridge": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/barbell-glute-bridge.gif",
      description: "Lie on your back with knees bent and feet flat on the floor, holding a barbell over your hips. Drive through your heels to lift your hips off the ground, squeezing your glutes at the top."
    }
  },
  "Barbell Romanian Deadlift": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-romanian-deadlift.gif",
      description: "Stand holding a barbell in front of your thighs. Hinge at the hips to lower the bar along your legs, keeping your back straight. Engage your glutes to return to standing."
    }
  },

  // Machine
  "Glute Kickback Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/glute-kickback-machine.gif",
      description: "Position yourself on the machine with one foot on the platform. Push the platform back by extending your leg, squeezing your glute at the top. Return and repeat on the other side."
    }
  },
  "Abduction Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/abduction-machine.gif",
      description: "Sit on the machine with your legs inside the pads. Push your legs outward against the resistance, focusing on contracting your glutes. Return slowly to the starting position."
    }
  },

  // Cable
  "Cable Kickback": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-kickback.gif",
      description: "Attach an ankle strap to a low pulley. Stand facing the machine and kick your leg back, squeezing your glute at the top. Return and repeat on the other side."
    }
  },

  "Cable Pull Through": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-pull-through.gif",
      description: "Stand facing away from a low pulley with a rope attachment between your legs. Hinge at the hips to pull the rope through your legs, then drive your hips forward to stand tall."
    }
  },

  // Kettlebell
  "Kettlebell Swing": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-swing.gif",
      description: "Stand with feet shoulder-width apart, holding a kettlebell with both hands. Hinge at the hips to swing the kettlebell between your legs, then thrust your hips forward to swing it up to chest level."
    }
  },
  "Kettlebell Deadlift": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/kettlebell-deadlift.gif",
      description: "Stand over a kettlebell with feet hip-width apart. Hinge at the hips to grasp the kettlebell handle, then drive through your heels to stand up straight, keeping your back flat."
    }
  },
  "Kettlebell Lunge": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-lunge.gif",
      description: "Hold a kettlebell in each hand at your sides. Step forward into a lunge position, lowering your back knee toward the floor. Push through your front heel to return to standing."
    }
  },

  // Smith Machine
  "Smith Machine Hip Thrust": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-hip-thrust.gif",
      description: "Sit with your upper back against a bench and bar positioned across your hips. Drive through your heels to raise your hips to full extension, squeezing your glutes at the top."
    }
  },
  // Bodyweight
  "Single Leg Glute Bridge": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/single-leg-glute-bridge.gif",
      description: "Lie on your back with one leg extended and the other bent. Drive through your planted foot to raise your hips, keeping the extended leg straight."
    }
  },

  // Cardio
  "Stair Climber": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/stair-climber.gif",
      description: "Use the stair climber machine to walk upward against resistance, engaging the glutes and legs with each step."
    }
  },
  "Incline Walking": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/incline-walking.gif",
      description: "Walk at an incline on a treadmill or hill to increase glute activation. Keep your posture upright and stride strong."
    }
  },

  // Dumbbells
  "Dumbbell Romanian Deadlift": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-romanian-deadlift.gif",
      description: "Stand holding dumbbells in front of your thighs. Hinge at the hips and lower the weights down your legs, keeping your back flat. Return to standing by engaging your hamstrings and glutes."
    }
  },
  "Dumbbell Stiff Leg Deadlift": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/dumbbell-stiff-leg-deadlift.gif",
      description: "Stand with dumbbells in front of your thighs. Lower them down with a straight back and minimal knee bend, then return to standing by driving your hips forward."
    }
  },

  // Barbell
  "Romanian Deadlift": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-romanian-deadlift.gif",
      description: "Hold a barbell at hip level. Hinge at the hips to lower the bar while keeping your back straight. Squeeze your glutes and hamstrings to rise."
    }
  },
  "Barbell Good Morning": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/barbell-good-morning.gif",
      description: "With a barbell across your shoulders, hinge at the hips with a flat back until your torso is nearly parallel to the floor. Return to standing."
    }
  },
  "Stiff Leg Deadlift": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/stiff-leg-deadlift.gif",
      description: "Keep your knees slightly bent and lower a barbell down your legs. Focus on a full hamstring stretch before returning upright."
    }
  },

  // Machine
  "Leg Curl Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/leg-curl-machine.gif",
      description: "Lie face down on the machine. Curl your legs up toward your glutes and lower back slowly with control."
    }
  },
  "Seated Leg Curl": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/seated-leg-curl.gif",
      description: "Sit in the machine with the pads above your ankles. Curl the legs toward the seat and return under control."
    }
  },
  "Glute-Ham Raise": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/glute-ham-raise.gif",
      description: "Position yourself in a glute-ham developer. Lower your torso forward, then contract your hamstrings to pull yourself back upright."
    }
  },

  // Cable
  "Cable Pull Through": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-pull-through.gif",
      description: "Stand facing away from a low pulley. Grab the rope and pull it through your legs as you hinge at the hips, then thrust your hips forward to stand up."
    }
  },
  "Cable Leg Curl": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/cable-leg-curl.gif",
      description: "Attach an ankle strap to a low pulley. Stand and curl your heel toward your glutes, keeping control throughout."
    }
  },

  // Kettlebell
  "Kettlebell Romanian Deadlift": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-romanian-deadlift.gif",
      description: "Hold a kettlebell in front of you. Hinge at the hips to lower it, keeping your back straight. Drive through your heels to stand back up."
    }
  },
  "Kettlebell Swing": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/kettlebell-swing.gif",
      description: "Swing a kettlebell from between your legs to chest height using hip drive. Let your hamstrings and glutes control the movement."
    }
  },

  // Smith Machine
  "Smith Machine Romanian Deadlift": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/smith-machine-romanian-deadlift.gif",
      description: "With the bar on the Smith machine, lower it down your legs by hinging at the hips. Engage your hamstrings and glutes to pull yourself back up."
    }
  },

  // Bodyweight
  "Nordic Curl": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    male: {
      src: "/src/assets/exercises/male/nordic-curl.gif",
      description: "Anchor your feet and slowly lower your torso forward, using hamstrings to control the descent. Pull yourself back up with hamstring force."
    }
  },
  "Stability Ball Leg Curl": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    male: {
      src: "/src/assets/exercises/male/stability-ball-leg-curl.gif",
      description: "Lie on your back with feet on a stability ball. Raise your hips and curl the ball toward your glutes, then extend again."
    }
  },

  // Cardio
  "Cycling": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/cycling.gif",
      description: "Ride a stationary or road bike to engage your hamstrings throughout the pedaling cycle."
    }
  },
  "Uphill Walking": {
    type: "animation",
    equipment: "Cardio",
    difficulty: "Beginner",
    male: {
      src: "/src/assets/exercises/male/uphill-walking.gif",
      description: "Walk uphill or on an inclined treadmill to increase hamstring and glute activation with each step."
    }
  }
};

const exerciseAlternativesFemale = {
   // Dumbbells
   "Dumbbell Shoulder Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/dumbbell-shoulder-press.gif",
      description: "Sit on a bench with dumbbells at shoulder height. Press them up overhead until your arms are fully extended. Lower with control."
    }
  },
  "Dumbbell Lateral Raise": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/dumbbell-lateral-raise.gif",
      description: "Stand with dumbbells at your sides. Raise arms out to shoulder height, keeping a slight bend in your elbows. Lower slowly."
    }
  },
  "Front Raise with Control": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/front-raise-with-control.gif",
      description: "Hold dumbbells in front of your thighs. Lift them straight in front of you to shoulder level. Lower with full control."
    }
  },
  "Arnold Press": {
    type: "animation",
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/arnold-press.gif",
      description: "Start with dumbbells in front of your shoulders, palms facing you. Rotate palms outward as you press overhead. Lower back and reverse the motion."
    }
  },

  // Barbell
  "Lighter Barbell Overhead Press": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/lighter-barbell-overhead-press.gif",
      description: "Use a lighter barbell at shoulder height. Press it overhead and fully extend your arms. Return with control."
    }
  },
  "Controlled Upright Row": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/controlled-upright-row.gif",
      description: "Stand with a barbell in front of you. Pull it straight up to chest height, keeping it close to your body. Lower slowly."
    }
  },
  "Push Press with Proper Form": {
    type: "animation",
    equipment: "Barbell",
    difficulty: "Advanced",
    female: {
      src: "/src/assets/exercises/female/push-press-with-proper-form.gif",
      description: "With barbell at shoulders, dip your knees and explosively press the bar overhead. Catch and lower with control."
    }
  },

  // Machine
  "Shoulder Press Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/shoulder-press-machine.gif",
      description: "Sit upright with handles at shoulder level. Press upward until arms are extended. Return to the start position."
    }
  },
  "Lateral Raise Machine": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/lateral-raise-machine.gif",
      description: "Sit with arms under the machine pads. Raise arms outward to shoulder height, then return slowly."
    }
  },
  "Reverse Pec Deck": {
    type: "animation",
    equipment: "Machine",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/reverse-pec-deck.gif",
      description: "Sit facing the machine. With arms extended, pull the handles back by squeezing your shoulder blades together. Return slowly."
    }
  },

  // Cable
  "Cable Lateral Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/cable-lateral-raise.gif",
      description: "Stand beside a low cable pulley. Raise the handle laterally to shoulder height. Lower with control."
    }
  },
  "Cable Front Raise": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/cable-front-raise.gif",
      description: "Face away from a low pulley. Raise the handle in front of you to shoulder height, keeping arm straight. Lower slowly."
    }
  },
  "Face Pull with External Rotation": {
    type: "animation",
    equipment: "Cable",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/face-pull-external-rotation.gif",
      description: "Use a rope at face height. Pull the rope toward your face while rotating your hands outward at the end. Return with control."
    }
  },

  // Kettlebell
  "Kettlebell Single Arm Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/kettlebell-single-arm-press.gif",
      description: "Hold a kettlebell at shoulder height. Press it overhead with one arm and lower with control."
    }
  },
  "Kettlebell Push Press": {
    type: "animation",
    equipment: "Kettlebell",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/kettlebell-push-press.gif",
      description: "Slightly bend knees then explosively drive the kettlebell overhead. Lower with control."
    }
  },

  // Plate
  "Light Plate Front Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/light-plate-front-raise.gif",
      description: "Hold a light plate with both hands. Raise it in front of you to shoulder height, then return slowly."
    }
  },
  "Plate Lateral Raise": {
    type: "animation",
    equipment: "Plate",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/plate-lateral-raise.gif",
      description: "Hold a plate at your side. Raise it laterally to shoulder height, then return with control."
    }
  },

  // Smith Machine
  "Smith Machine Overhead Press": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/smith-machine-overhead-press.gif",
      description: "Use the Smith machine bar at shoulder height. Press it overhead until arms are fully extended. Lower with control."
    }
  },
  "Smith Machine Upright Row": {
    type: "animation",
    equipment: "Smith Machine",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/smith-machine-upright-row.gif",
      description: "Pull the Smith machine bar up to your chest, keeping it close to your body. Lower with control."
    }
  },

  // Bodyweight
  "Incline Pike Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    female: {
      src: "/src/assets/exercises/female/incline-pike-push-ups.gif",
      description: "In a downward dog position with feet elevated, lower your head to the floor. Push back up."
    }
  },
  "Wall Handstand Hold": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Advanced",
    female: {
      src: "/src/assets/exercises/female/wall-handstand-hold.gif",
      description: "Kick into a handstand position against a wall. Hold the position while keeping your core tight and shoulders active."
    }
  },
  "Wall Push-ups": {
    type: "animation",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    female: {
      src: "/src/assets/exercises/female/wall-push-ups.gif",
      description: "Stand facing a wall. Place hands on the wall and perform push-ups, keeping your body straight and controlled."
    }
  }
};

const getExerciseAssetByGender = (exerciseName, gender = "male") => {
  const dataset = gender === "female" ? exerciseAssetsFemale : exerciseAssetsMale;
  const data = dataset[exerciseName];

  if (!data) {
    return {
      type: "image",
      src: fixAssetPath("/src/assets/placeholder-exercise.png"),
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
      src: fixAssetPath("/src/assets/placeholder-exercise.png"),
      description: "No demonstration available for this gender.",
      alternatives: data.alternatives || [],
      equipment: data.equipment,
      difficulty: data.difficulty
    };
  }

  return {
    type: data.type || "image",
    src: fixAssetPath(genderData.src),
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
  const bodyImages = {
    male: maleTitanImage,
    female: femaleTitanImage,
  }; 

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
    const alternativeAsset = state.bodyType === "female" 
      ? exerciseAlternativesFemale[exerciseName] 
      : exerciseAlternativesMale[exerciseName];
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
        src: fixAssetPath("/src/assets/placeholder-exercise.png"),
        description: "Demonstration for this exercise will be added soon.",
        equipment: equipment,
        difficulty: "Intermediate",
        alternatives: getAlternativeExercises(exerciseName, 3)
      };
    }
    
    return {
      src: exerciseData.src || fixAssetPath("/src/assets/placeholder-exercise.png"),
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



