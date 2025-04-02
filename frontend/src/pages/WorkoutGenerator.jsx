import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resolveExercisePath } from "../utils/exerciseAssetResolver";
import { createSavedProgram } from "../api/savedProgramsApi";
import {
  FaDumbbell,
  FaWeightHanging,
  FaRunning,
  FaRegSave,
  FaPrint,
  FaUserAlt,
  FaInfoCircle,
  FaVenusMars,
  FaBirthdayCake,
  FaCalendarAlt,
} from "react-icons/fa";

const allExercises = {
  // CHEST BODYWEIGHT EXERCISES
  "Push-ups": {
    type: "animation",
    description:
      "Start in position, lower body until chest nearly touches the ground, then push back up.",
    muscleWorked: "Chest, Triceps, Shoulders",
    equipment: ["Bodyweight"],
    difficulty: {
      novice: {
        name: "Knee Push-ups",
        src: "/src/assets/exercises/bodyweight/knee-pushup.gif",
        description:
          "Perform push-ups with knees on the ground to reduce resistance.",
      },
      beginner: {
        name: "Standard Push-ups",
        src: "/src/assets/exercises/bodyweight/standard-pushup.gif",
        description: "Standard push-ups with a full plank position.",
      },
      intermediate: {
        name: "Wide Push-ups",
        src: "/src/assets/exercises/bodyweight/wide-pushup.gif",
        description:
          "Push-ups with hands placed wider than shoulders for greater chest engagement.",
      },
      advanced: {
        name: "Plyometric Push-ups",
        src: "/src/assets/exercises/bodyweight/plyo-pushup.gif",
        description:
          "Explosive push-ups where hands leave the ground at the top of the movement.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on proper form, avoid max intensity" },
      "65+": { notes: "Use wall or incline push-ups, reduce range of motion" },
    },
  },

  "Diamond Push-ups": {
    type: "animation",
    description:
      "Perform push-ups with hands close together, forming a diamond shape with thumbs and index fingers.",
    muscleWorked: "Triceps, Chest",
    equipment: ["Bodyweight"],
    difficulty: {
      novice: {
        name: "Knee Diamond Push-ups",
        src: "/src/assets/exercises/bodyweight/knee-diamond-pushup.gif",
        description:
          "Perform diamond push-ups with knees on the ground to reduce resistance while maintaining tricep focus.",
      },
      beginner: {
        name: "Standard Diamond Push-ups",
        src: "/src/assets/exercises/bodyweight/standard-diamond-pushup.gif",
        description:
          "Hands form a diamond shape under chest, elbows stay close to body for maximum tricep activation.",
      },
      intermediate: {
        name: "Decline Diamond Push-ups",
        src: "/src/assets/exercises/bodyweight/decline-diamond-pushup.gif",
        description:
          "Diamond push-ups with feet elevated to increase upper body load and difficulty.",
      },
      advanced: {
        name: "Plyometric Diamond Push-ups",
        src: "/src/assets/exercises/bodyweight/plyo-diamond-pushup.gif",
        description:
          "Explosive diamond push-ups where hands leave the ground at the top, emphasizing power and tricep strength.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "10-12", intensity: "moderate" },
      "Muscle Building": { sets: 3, reps: "6-10", intensity: "high" },
      "Gain Strength": { sets: 4, reps: "3-5", intensity: "very high" },
      Endurance: { sets: 3, reps: "12-15", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Modify hand placement, focus on tricep engagement" },
      "65+": { notes: "Use wall support, reduce range of motion" },
    },
  },

  "Decline Push-ups": {
    type: "animation",
    description:
      "Perform push-ups with feet elevated, increasing difficulty and upper chest engagement.",
    muscleWorked: "Upper Chest, Shoulders",
    equipment: ["Bodyweight"],
    difficulty: {
      novice: {
        name: "Elevated Knee Push-ups",
        src: "/src/assets/exercises/bodyweight/elevated-knee-pushup.gif",
        description:
          "Perform push-ups with knees on the ground and hands on an elevated surface to reduce resistance while targeting upper chest.",
      },
      beginner: {
        name: "Low Decline Push-ups",
        src: "/src/assets/exercises/bodyweight/low-decline-pushup.gif",
        description:
          "Push-ups with feet slightly elevated on a low platform for gentle upper chest activation.",
      },
      intermediate: {
        name: "Stability Ball Decline Push-ups",
        src: "/src/assets/exercises/bodyweight/stability-ball-decline-push-ups.gif",
        description:
          "Perform push-ups with feet or shins on a stability ball, creating an unstable surface that increases core engagement.",
      },
      advanced: {
        name: "Feet High Decline Push-ups",
        src: "/src/assets/exercises/bodyweight/feet-high-decline-pushup.gif",
        description:
          "Push-ups with feet elevated to maximum height, creating a steep angle for extreme upper chest and shoulder emphasis.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "10-12", intensity: "moderate" },
      "Muscle Building": { sets: 3, reps: "8-10", intensity: "high" },
      "Gain Strength": { sets: 4, reps: "4-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "12-15", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Gradual elevation, maintain proper form" },
      "65+": { notes: "Use very low elevation, focus on shoulder health" },
    },
  },

  // BACK BODYWEIGHT EXERCISES
  "Pull-ups": {
    type: "animation",
    description:
      "Hang from a bar, pull your body up until chin is above the bar, then lower down with control.",
    muscleWorked: "Back, Biceps",
    equipment: ["Bodyweight", "Pull-up Bar"],
    difficulty: {
      novice: {
        name: "Assisted Pull-ups",
        src: "/src/assets/exercises/bodyweight/assisted-pullup.gif",
        description:
          "Use a resistance band or assisted pull-up machine to reduce body weight and build initial strength.",
      },
      beginner: {
        name: "Negative Pull-ups",
        src: "/src/assets/exercises/bodyweight/negative-pullup.gif",
        description:
          "Jump to the top position and slowly lower yourself down, focusing on control during the descent.",
      },
      intermediate: {
        name: "Standard Pull-ups",
        src: "/src/assets/exercises/bodyweight/standard-pullup.gif",
        description:
          "Complete pull-ups with full range of motion, pulling chin above the bar with proper form.",
      },
      advanced: {
        name: "Weighted Pull-ups",
        src: "/src/assets/exercises/bodyweight/weighted-pullup.gif",
        description:
          "Perform pull-ups with additional weight attached via belt or held between feet for increased resistance.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "6-8", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "5-7", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-5", intensity: "very high" },
      Endurance: { sets: 3, reps: "8-10", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use assistance, focus on proper technique" },
      "65+": { notes: "Use resistance bands, shorter range of motion" },
    },
  },

  "Inverted Rows": {
    type: "animation",
    description:
      "Hang underneath a bar or table, pull your chest up to the bar while keeping body straight.",
    muscleWorked: "Back, Biceps",
    equipment: ["Bodyweight", "Pull-up Bar"],
    difficulty: {
      novice: {
        name: "Bent Knee Inverted Rows",
        src: "/src/assets/exercises/bodyweight/bent-knee-inverted-row.gif",
        description:
          "Perform inverted rows with knees bent at 90 degrees to reduce resistance and make the exercise more accessible.",
      },
      beginner: {
        name: "Feet on Ground Rows",
        src: "/src/assets/exercises/bodyweight/feet-ground-inverted-row.gif",
        description:
          "Inverted rows with feet on the floor, body at an angle to provide moderate resistance.",
      },
      intermediate: {
        name: "Ring Inverted Row",
        src: "/src/assets/exercises/bodyweight/ring-inverted-row .gif",
        description:
          "Grip gymnastics rings while hanging underneath, pull your chest up towards the rings while maintaining a straight body position.",
      },
      advanced: {
        name: "Elevated Feet Inverted Rows",
        src: "/src/assets/exercises/bodyweight/elevated-feet-inverted-row.gif",
        description:
          "Inverted rows with feet elevated on a platform, increasing difficulty and targeting upper back more intensely.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "10-12", intensity: "moderate" },
      "Muscle Building": { sets: 3, reps: "8-10", intensity: "high" },
      "Gain Strength": { sets: 4, reps: "5-7", intensity: "very high" },
      Endurance: { sets: 3, reps: "12-15", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Adjust bar height, maintain straight body" },
      "65+": { notes: "Use higher bar, shorter range of motion" },
    },
  },

  // SHOULDERS BODYWEIGHT EXERCISES
  "Pike Push-ups": {
    type: "animation",
    description:
      "Form an inverted V-shape, lower head towards ground between hands.",
    muscleWorked: "Shoulders, Upper Chest",
    equipment: ["Bodyweight"],
    difficulty: {
      novice: {
        name: "Wall Pike Push-ups",
        src: "/src/assets/exercises/bodyweight/wall-pike-pushup.gif",
        description:
          "Perform pike push-ups with hands on the floor and feet against a wall, reducing the weight load while maintaining shoulder focus.",
      },
      beginner: {
        name: "Elevated Pike Push-ups",
        src: "/src/assets/exercises/bodyweight/elevated-pike-pushup.gif",
        description:
          "Pike push-ups with feet elevated on a bench or box to create a more vertical angle and moderate shoulder load.",
      },
      intermediate: {
        name: "Standard Pike Push-ups",
        src: "/src/assets/exercises/bodyweight/standard-pike-pushup.gif",
        description:
          "Full pike position with hips high, forming an inverted V-shape while lowering head between hands for deep shoulder work.",
      },
      advanced: {
        name: "Handstand Push-up Progression",
        src: "/src/assets/exercises/bodyweight/handstand-pushup-progression.gif",
        description:
          "Near-vertical pike position or wall-supported handstand push-ups to maximize shoulder strength development.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "8-10", intensity: "moderate" },
      "Muscle Building": { sets: 3, reps: "6-8", intensity: "high" },
      "Gain Strength": { sets: 4, reps: "3-5", intensity: "very high" },
      Endurance: { sets: 3, reps: "10-12", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Gradual progression, avoid full shoulder load" },
      "65+": { notes: "Use wall support, limit range of motion" },
    },
  },

  // BICEPS BODYWEIGHT EXERCISES
  "Chin-ups": {
    type: "animation",
    description:
      "Similar to pull-ups, but with palms facing towards you, emphasizing biceps.",
    muscleWorked: "Biceps, Back",
    equipment: ["Bodyweight", "Pull-up Bar"],
    difficulty: {
      novice: {
        name: "Assisted Chin-ups",
        src: "/src/assets/exercises/bodyweight/assisted-chinup.gif",
        description:
          "Use resistance bands or assisted machine to reduce body weight, allowing for proper form development.",
      },
      beginner: {
        name: "Negative Chin-ups",
        src: "/src/assets/exercises/bodyweight/negative-chinup.gif",
        description:
          "Jump to the top position and slowly lower yourself down, focusing on controlled eccentric movement.",
      },
      intermediate: {
        name: "Standard Chin-ups",
        src: "/src/assets/exercises/bodyweight/standard-chinup.gif",
        description:
          "Full chin-ups with palms facing your body, pulling your chest to the bar with controlled movement.",
      },
      advanced: {
        name: "Weighted Chin-ups",
        src: "/src/assets/exercises/bodyweight/weighted-chinup.gif",
        description:
          "Standard chin-ups with additional weight attached to a belt or held between the legs for increased resistance.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "5-7", intensity: "moderate" },
      "Muscle Building": { sets: 3, reps: "4-6", intensity: "high" },
      "Gain Strength": { sets: 4, reps: "2-4", intensity: "very high" },
      Endurance: { sets: 3, reps: "6-8", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use assistance, focus on form" },
      "65+": { notes: "Use resistance bands, shorter range" },
    },
  },

  // TRICEPS BODYWEIGHT EXERCISES
  Dips: {
    type: "animation",
    description:
      "Using parallel bars or chairs, lower body by bending elbows, then push back up.",
    muscleWorked: "Triceps, Chest",
    equipment: ["Bodyweight", "Parallel Bars"],
    difficulty: {
      novice: {
        name: "Bench Dips",
        src: "/src/assets/exercises/bodyweight/bench-dips.gif",
        description:
          "Perform dips using a bench with feet on the floor to reduce resistance while building tricep strength.",
      },
      beginner: {
        name: "Assisted Dips",
        src: "/src/assets/exercises/bodyweight/assisted-dips.gif",
        description:
          "Use resistance bands or machine assistance to help perform dips with proper form and reduced body weight.",
      },
      intermediate: {
        name: "Standard Dips",
        src: "/src/assets/exercises/bodyweight/standard-dips.gif",
        description:
          "Full body dips on parallel bars, lowering until upper arms are parallel with the ground.",
      },
      advanced: {
        name: "Ring Dips",
        src: "/src/assets/exercises/bodyweight/ring-dips.gif",
        description:
          "Perform dips on gymnastic rings for increased instability and greater muscle recruitment.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "10-12", intensity: "moderate" },
      "Muscle Building": { sets: 3, reps: "8-10", intensity: "high" },
      "Gain Strength": { sets: 4, reps: "5-7", intensity: "very high" },
      Endurance: { sets: 3, reps: "12-15", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Limited range, focus on technique" },
      "65+": { notes: "Use chair support, minimal depth" },
    },
  },

  // CORE/ABS BODYWEIGHT EXERCISES
  Planks: {
    type: "animation",
    description:
      "Hold a straight body position supported on forearms and toes.",
    muscleWorked: "Core, Shoulders",
    equipment: ["Bodyweight"],
    difficulty: {
      novice: {
        name: "Knee Planks",
        src: "/src/assets/exercises/bodyweight/knee-plank.gif",
        description:
          "Modified plank with knees on the ground for reduced difficulty while still engaging the core.",
      },
      beginner: {
        name: "Standard Plank",
        src: "/src/assets/exercises/bodyweight/standard-plank.gif",
        description:
          "Classic forearm plank position maintaining a straight line from head to heels.",
      },
      intermediate: {
        name: "Side Planks",
        src: "/src/assets/exercises/bodyweight/side-plank.gif",
        description:
          "Rotate to the side supported by one forearm, challenging obliques and lateral stability.",
      },
      advanced: {
        name: "Plank Variations",
        src: "/src/assets/exercises/bodyweight/advanced-plank.gif",
        description:
          "Advanced variations including arm/leg raises, plank jacks, or plank reaches for increased challenge.",
      },
    },
    variations: {
      "Weight Loss": {
        duration: "30-45 seconds",
        sets: 3,
        intensity: "moderate",
      },
      "Muscle Building": {
        duration: "45-60 seconds",
        sets: 4,
        intensity: "high",
      },
      "Gain Strength": {
        duration: "60-90 seconds",
        sets: 5,
        intensity: "very high",
      },
      Endurance: { duration: "45-60 seconds", sets: 3, intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Progressive duration, focus on form" },
      "65+": { notes: "Shorter holds, use support" },
    },
  },

  // CHEST BARBELL EXERCISES
  "Barbell Bench Press": {
    type: "animation",
    description:
      "Lie on a bench with your feet flat on the floor, grip the barbell wider than shoulder-width, and lower the barbell to your chest before pressing back up.",
    muscleWorked: "Chest, Shoulders, Triceps",
    equipment: ["Barbell", "Bench"],
    difficulty: {
      novice: {
        name: "Barbell Chest Press with Light Weight",
        src: "/src/assets/exercises/barbell/light-bench-press.gif",
        description:
          "Use a lighter barbell to learn proper form and movement pattern with less resistance.",
      },
      beginner: {
        name: "Standard Barbell Bench Press",
        src: "/src/assets/exercises/barbell/standard-bench-press.gif",
        description:
          "Lie flat on a bench, grip barbell wider than shoulders, lower to mid-chest and press upward with control.",
      },
      intermediate: {
        name: "Incline Barbell Bench Press",
        src: "/src/assets/exercises/barbell/incline-bench-press.gif",
        description:
          "Bench press performed on an inclined bench to target upper chest and provide a new challenge.",
      },
      advanced: {
        name: "Heavy Barbell Bench Press",
        src: "/src/assets/exercises/barbell/heavy-bench-press.gif",
        description:
          "Higher weight bench press with proper form, emphasizing power and strength development.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Start with light weights and focus on form" },
      "65+": {
        notes: "Use light weights, avoid excessive strain on shoulders",
      },
    },
  },

  // BACK BARBELL EXERCISES
  "Barbell Row": {
    type: "animation",
    description:
      "Bend at the waist with a straight back, grip the barbell with hands just wider than shoulder-width, and pull it towards your waist.",
    muscleWorked: "Back, Biceps, Shoulders",
    equipment: ["Barbell"],
    difficulty: {
      novice: {
        name: "Barbell Row with Light Weight",
        src: "/src/assets/exercises/barbell/light-barbell-row.gif",
        description:
          "Barbell row with lighter weight focusing on proper form and back engagement.",
      },
      beginner: {
        name: "Standard Barbell Row",
        src: "/src/assets/exercises/barbell/standard-barbell-row.gif",
        description:
          "Conventional barbell row with moderate weight and controlled movement.",
      },
      intermediate: {
        name: "Bent-Over Barbell Row",
        src: "/src/assets/exercises/barbell/bent-over-barbell-row.gif",
        description:
          "Full bent-over position with increased weight and strict form for maximum back development.",
      },
      advanced: {
        name: "Heavy Barbell Row",
        src: "/src/assets/exercises/barbell/heavy-barbell-row.gif",
        description:
          "Barbell row with challenging weight, maintaining strict form and powerful pull.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": {
        notes: "Focus on maintaining a straight back, use light weights",
      },
      "65+": { notes: "Use lighter weights, avoid bending too much" },
    },
  },

  "Barbell Deadlift": {
    type: "animation",
    description:
      "Stand with feet hip-width apart, grip the barbell with your hands shoulder-width apart, and lift the barbell while maintaining a straight back.",
    muscleWorked: "Hamstrings, Glutes, Lower Back",
    equipment: ["Barbell"],
    difficulty: {
      novice: {
        name: "Light Barbell Deadlift",
        src: "/src/assets/exercises/barbell/light-barbell-deadlift.gif",
        description:
          "Perform deadlifts with light barbell to learn proper form with less weight and risk.",
      },
      beginner: {
        name: "Standard Barbell Deadlift",
        src: "/src/assets/exercises/barbell/standard-deadlift.gif",
        description:
          "Basic barbell deadlift focusing on proper hip hinge and back position.",
      },
      intermediate: {
        name: "Romanian Barbell Deadlift",
        src: "/src/assets/exercises/barbell/romanian-deadlift.gif",
        description:
          "Emphasizes hamstring stretch and glute activation with a partial range of motion.",
      },
      advanced: {
        name: "Heavy Barbell Deadlift",
        src: "/src/assets/exercises/barbell/heavy-deadlift.gif",
        description:
          "High-weight deadlifts with strict form for maximum strength development.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Start with lighter weights, focus on form" },
      "65+": { notes: "Use light weights, avoid bending too much" },
    },
  },

  // SHOULDERS BARBELL EXERCISES
  "Barbell Shoulder Press": {
    type: "animation",
    description:
      "Stand or sit with a barbell at shoulder height, press it overhead until arms are fully extended, then lower back down.",
    muscleWorked: "Shoulders, Triceps",
    equipment: ["Barbell"],
    difficulty: {
      novice: {
        name: "Seated Barbell Shoulder Press",
        src: "/src/assets/exercises/barbell/seated-barbell-shoulder-press.gif",
        description:
          "Perform shoulder press while seated for back support and increased stability, ideal for beginners.",
      },
      beginner: {
        name: "Barbell Frontal Raise",
        src: "/src/assets/exercises/barbell/barbell-frontal-raise.gif",
        description:
          "Classic barbell shoulder press with proper form and moderate weight.",
      },
      intermediate: {
        name: "Standing Barbell Shoulder Press",
        src: "/src/assets/exercises/barbell/standing-barbell-shoulder-press.gif",
        description:
          "Perform overhead press while standing to engage core and improve full-body stability.",
      },
      advanced: {
        name: "Push Press with Barbell",
        src: "/src/assets/exercises/barbell/push-press-barbell.gif",
        description:
          "Use slight leg drive to lift heavier weight overhead, transitioning seamlessly from dip to press motion.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weights and proper form" },
      "65+": { notes: "Use light weights, avoid excessive overhead movement" },
    },
  },

  // LEGS BARBELL EXERCISES
  "Barbell Squat": {
    type: "animation",
    description:
      "Stand with feet shoulder-width apart, place the barbell on your upper back, and squat down until thighs are parallel to the ground, then rise back up.",
    muscleWorked: "Quads, Glutes, Hamstrings",
    equipment: ["Barbell", "Squat Rack"],
    difficulty: {
      novice: {
        name: "Bodyweight Squats",
        src: "/src/assets/exercises/barbell/bodyweight-squat.gif",
        description:
          "Perform squats without weight to master form and movement pattern.",
      },
      beginner: {
        name: "Barbell Back Squats with Light Weight",
        src: "/src/assets/exercises/barbell/light-barbell-squat.gif",
        description:
          "Use light weight to learn barbell positioning and proper squat mechanics.",
      },
      intermediate: {
        name: "Standard Barbell Squat",
        src: "/src/assets/exercises/barbell/standard-barbell-squat.gif",
        description:
          "Full barbell squats with moderate weight, focusing on depth and form.",
      },
      advanced: {
        name: "Heavy Barbell Squat",
        src: "/src/assets/exercises/barbell/heavy-barbell-squat.gif",
        description:
          "Heavy load barbell squats with proper form, emphasizing power and strength.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Start with bodyweight, focus on form" },
      "65+": { notes: "Use light weights, focus on controlled movement" },
    },
  },

  "Barbell Front Squat": {
    type: "animation",
    description:
      "Holding a barbell across front shoulders, perform a squat by bending at knees and hips while maintaining an upright torso.",
    muscleWorked: "Quads, Glutes, Core",
    equipment: ["Barbell", "Squat Rack"],
    difficulty: {
      novice: {
        name: "Bodyweight Front Squat",
        src: "/src/assets/exercises/barbell/bodyweight-front-squat.gif",
        description:
          "Perform a front squat with arms extended forward to prepare for barbell position without using weight.",
      },
      beginner: {
        name: "Barbell Front Squat with Light Weight",
        src: "/src/assets/exercises/barbell/light-front-squat.gif",
        description:
          "Front squat using light weight to perfect form and bar position across shoulders.",
      },
      intermediate: {
        name: "Standard Barbell Front Squat",
        src: "/src/assets/exercises/barbell/standard-front-squat.gif",
        description:
          "Full front squat with moderate weight, maintaining upright torso and proper elbow position.",
      },
      advanced: {
        name: "Heavy Barbell Front Squat",
        src: "/src/assets/exercises/barbell/heavy-front-squat.gif",
        description:
          "Front squat with challenging weight, focusing on depth, speed control, and perfect bar path.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights, focus on form" },
      "65+": { notes: "Use light weights, focus on controlled movements" },
    },
  },

  // CALVES BARBELL EXERCISES
  "Barbell Calf Raise": {
    type: "animation",
    description:
      "Place the barbell on your shoulders, raise your heels off the ground, and lower them back down.",
    muscleWorked: "Calves",
    equipment: ["Barbell"],
    difficulty: {
      novice: {
        name: "Seated Barbell Calf Raise",
        src: "/src/assets/exercises/barbell/seated-barbell-calf-raise.gif",
        description:
          "Perform calf raises while seated with a barbell across your knees to reduce overall resistance.",
      },
      beginner: {
        name: "Standard Barbell Calf Raise",
        src: "/src/assets/exercises/barbell/standard-barbell-calf-raise.gif",
        description:
          "Place barbell on shoulders, stand on flat ground, raise heels up and down with controlled motion.",
      },
      intermediate: {
        name: "Single-Leg Barbell Calf Raise",
        src: "/src/assets/exercises/barbell/single-leg-barbell-calf-raise.gif",
        description:
          "Perform calf raises on one leg at a time with barbell on shoulders for increased challenge.",
      },
      advanced: {
        name: "Heavy Barbell Calf Raise",
        src: "/src/assets/exercises/barbell/heavy-barbell-calf-raise.gif",
        description:
          "Perform calf raises with substantial weight, focusing on maximum contraction and full range of motion.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "15-20", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "10-15", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "6-8", intensity: "very high" },
      Endurance: { sets: 3, reps: "20-25", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on controlled movements" },
      "65+": { notes: "Use light weights, reduce range of motion" },
    },
  },

  // CHEST DUMBBELL EXERCISES
  "Dumbbell Bench Press": {
    type: "animation",
    description:
      "Lie on a bench, hold a dumbbell in each hand, lower them to chest level, then press up.",
    muscleWorked: "Chest, Triceps, Shoulders",
    equipment: ["Dumbbells", "Bench"],
    difficulty: {
      novice: {
        name: "Dumbbell Chest Press with Low Weight",
        src: "/src/assets/exercises/dumbbell/novice-dumbbell-bench-press.gif",
        description:
          "Perform with lighter dumbbells to develop proper form and muscle activation patterns.",
      },
      beginner: {
        name: "Standard Dumbbell Chest Press",
        src: "/src/assets/exercises/dumbbell/dumbbell-bench-press.gif",
        description:
          "Lie flat on a bench, press dumbbells from chest level to full arm extension.",
      },
      intermediate: {
        name: "Incline Dumbbell Chest Press",
        src: "/src/assets/exercises/dumbbell/incline-dumbbell-bench-press.gif",
        description:
          "Press dumbbells while on an inclined bench to target upper chest and increase difficulty.",
      },
      advanced: {
        name: "Heavy Dumbbell Chest Press",
        src: "/src/assets/exercises/dumbbell/advanced-dumbbell-bench-press.gif",
        description:
          "Use heavier dumbbells with controlled movement for maximum chest and tricep development.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on lighter weights and proper form" },
      "65+": { notes: "Use light weights, avoid overhead movements" },
    },
  },

  "Dumbbell Chest Fly": {
    type: "animation",
    description:
      "Lie on a bench, holding dumbbells in each hand, arms outstretched, then bring the dumbbells together in front of your chest.",
    muscleWorked: "Chest, Shoulders",
    equipment: ["Dumbbells", "Bench"],
    difficulty: {
      novice: {
        name: "Dumbbell Chest Fly with Light Weight",
        src: "/src/assets/exercises/dumbell/novice-dumbbell-chest-fly.gif",
        description:
          "Perform chest flies with light dumbbells to learn proper form and muscle engagement without strain.",
      },
      beginner: {
        name: "Standard Dumbbell Chest Fly",
        src: "/src/assets/exercises/dumbell/standard-dumbbell-chest-fly.gif",
        description:
          "Lie on a flat bench with dumbbells extended above chest, lower arms out to sides in arc motion, then return to center.",
      },
      intermediate: {
        name: "Incline Dumbbell Chest Fly",
        src: "/src/assets/exercises/dumbell/incline-dumbbell-chest-fly.gif",
        description:
          "Perform chest flies on an incline bench to target upper chest fibers and increase overall chest development.",
      },
      advanced: {
        name: "Heavy Dumbbell Chest Fly",
        src: "/src/assets/exercises/dumbell/heavy-dumbbell-chest-fly.gif",
        description:
          "Execute chest flies with substantial weight, emphasizing controlled eccentric phase and full range of motion.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on lighter weights and proper form" },
      "65+": { notes: "Use light weights, avoid excessive strain" },
    },
  },

  // BACK DUMBBELL EXERCISES
  "Dumbbell Row": {
    type: "animation",
    description:
      "With one knee and hand on a bench, pull a dumbbell towards your waist while keeping your back flat.",
    muscleWorked: "Back, Biceps",
    equipment: ["Dumbbells", "Bench"],
    difficulty: {
      novice: {
        name: "Seated Dumbbell Row",
        src: "/src/assets/exercises/dumbbell/seated-dumbbell-row.gif",
        description:
          "Perform rows while bending 90 degress on a bench with back supported to maintain proper form and reduce strain.",
      },
      beginner: {
        name: "Standard Dumbbell Row",
        src: "/src/assets/exercises/dumbbell/standard-dumbbell-row.gif",
        description:
          "One knee and hand on bench, pull dumbbell toward hip with elbow close to body, maintaining flat back.",
      },
      intermediate: {
        name: "Bent-Over Dumbbell Row",
        src: "/src/assets/exercises/dumbbell/bent-over-dumbbell-row.gif",
        description:
          "Perform rows while standing with torso bent forward, engaging more core stability and back muscles.",
      },
      advanced: {
        name: "Single-Arm Dumbbell Row",
        src: "/src/assets/exercises/dumbbell/single-arm-dumbbell-row-heavy.gif",
        description:
          "Single-arm row with heavier weight, focusing on maximum back activation and controlled movement.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-10", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-5", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Start with moderate weight and focus on form" },
      "65+": { notes: "Use lighter weights, avoid full range of motion" },
    },
  },

  "Dumbbell Pullover": {
    type: "animation",
    description:
      "Lie on a bench with your upper back and shoulders supported, holding a dumbbell with both hands, then lower it behind your head and pull it back up.",
    muscleWorked: "Chest, Lats, Triceps",
    equipment: ["Dumbbells", "Bench"],
    difficulty: {
      novice: {
        name: "Dumbbell Pullover with Light Weight",
        src: "/src/assets/exercises/dumbbell/light-dumbbell-pullover.gif",
        description:
          "Perform the pullover motion using a light dumbbell to learn proper form and reduce risk of injury.",
      },
      beginner: {
        name: "Standard Dumbbell Pullover",
        src: "/src/assets/exercises/dumbbell/standard-dumbbell-pullover.gif",
        description:
          "Lie perpendicular on bench with shoulders supported, lower dumbbell behind head with slight elbow bend, then pull back up.",
      },
      intermediate: {
        name: "Heavy Dumbbell Pullover",
        src: "/src/assets/exercises/dumbbell/heavy-dumbbell-pullover.gif",
        description:
          "Perform pullover with challenging weight, focusing on controlled movement and lat engagement.",
      },
      advanced: {
        name: "Dumbbell Pullover with Full Range of Motion",
        src: "/src/assets/exercises/dumbbell/full-rom-dumbbell-pullover.gif",
        description:
          "Maximize stretch and contraction with full range of motion, using appropriate weight for complete muscle activation.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weights and proper form" },
      "65+": {
        notes: "Use light weights, avoid excessive strain on shoulders",
      },
    },
  },
  // SHOULDERS DUMBBELL EXERCISES
  "Dumbbell Shoulder Press": {
    type: "animation",
    description:
      "Sit or stand with dumbbells at shoulder height, press them overhead until your arms are fully extended.",
    muscleWorked: "Shoulders, Triceps",
    equipment: ["Dumbbells"],
    difficulty: {
      novice: {
        name: "Seated Dumbbell Shoulder Press with Light Weight",
        src: "/src/assets/exercises/dumbbell/seated-light-dumbbell-shoulder-press.gif",
        description:
          "Perform shoulder press while seated with back support using lighter weights to develop proper form.",
      },
      beginner: {
        name: "Standard Dumbbell Shoulder Press",
        src: "/src/assets/exercises/dumbbell/standard-dumbbell-shoulder-press.gif",
        description:
          "Press dumbbells from shoulder height to full extension overhead while seated or standing.",
      },
      intermediate: {
        name: "Alternating Dumbbell Shoulder Press",
        src: "/src/assets/exercises/dumbbell/alternating-dumbbell-shoulder-press.gif",
        description:
          "Press one dumbbell at a time overhead, alternating arms to increase core engagement and unilateral strength.",
      },
      advanced: {
        name: "Arnold Press",
        src: "/src/assets/exercises/dumbbell/arnold-press.gif",
        description:
          "Start with dumbbells at shoulders with palms facing you, rotate palms outward as you press upward for greater shoulder activation.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Avoid heavy weights, focus on shoulder health" },
      "65+": { notes: "Use light weights, avoid excessive overhead motion" },
    },
  },

  "Lateral Raise": {
    type: "animation",
    description:
      "Hold a dumbbell in each hand at your sides, raise the dumbbells out to the sides until your arms are parallel to the ground.",
    muscleWorked: "Shoulders",
    equipment: ["Dumbbells"],
    difficulty: {
      novice: {
        name: "Lateral Raise with Light Weight",
        src: "/src/assets/exercises/dumbbell/light-lateral-raise.gif",
        description:
          "Perform lateral raises with very light dumbbells to learn proper form and movement pattern.",
      },
      beginner: {
        name: "Standard Lateral Raise",
        src: "/src/assets/exercises/dumbbell/standard-lateral-raise.gif",
        description:
          "Raise dumbbells to shoulder height with slight bend in elbows, controlling the movement throughout.",
      },
      intermediate: {
        name: "Heavy Lateral Raise",
        src: "/src/assets/exercises/dumbbell/heavy-lateral-raise.gif",
        description:
          "Perform lateral raises with moderate to heavy weights, focusing on maintaining form while increasing resistance.",
      },
      advanced: {
        name: "Alternating Dumbbell Lateral Raise",
        src: "/src/assets/exercises/dumbbell/alternating-lateral-raise.gif",
        description:
          "Raise one dumbbell at a time with heavier weight, focusing on complete shoulder isolation and control.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weights and proper form" },
      "65+": { notes: "Use light weights, avoid excessive shoulder strain" },
    },
  },

  // BICEPS DUMBBELL EXERCISES
  "Dumbbell Bicep Curl": {
    type: "animation",
    description:
      "Stand tall, holding a dumbbell in each hand, curl the weights towards your shoulders, then lower slowly.",
    muscleWorked: "Biceps",
    equipment: ["Dumbbells"],
    difficulty: {
      novice: {
        name: "Seated Dumbbell Bicep Curl",
        src: "/src/assets/exercises/dumbbell/seated-dumbbell-bicep-curl.gif",
        description:
          "Perform bicep curls while seated to remove momentum and focus on proper form with lighter weights.",
      },
      beginner: {
        name: "Standard Dumbbell Bicep Curl",
        src: "/src/assets/exercises/dumbbell/standard-dumbbell-bicep-curl.gif",
        description:
          "Stand with dumbbells at sides, palms facing forward, curl weights to shoulders while keeping elbows fixed.",
      },
      intermediate: {
        name: "Hammer Curl",
        src: "/src/assets/exercises/dumbbell/hammer-curl.gif",
        description:
          "Perform curls with palms facing each other throughout the movement to target the brachialis and brachioradialis.",
      },
      advanced: {
        name: "Concentration Curl",
        src: "/src/assets/exercises/dumbbell/concentration-curl.gif",
        description:
          "Seated with elbow braced against inner thigh, perform single-arm curls with strict form and maximum contraction.",
      },
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on controlled movement and form" },
      "65+": { notes: "Use light weights, avoid heavy curls" },
    },
  },

  // TRICEPS DUMBBELL EXERCISES
  "Dumbbell Tricep Kickback": {
    type: "animation",
    src: "/src/assets/exercises/dumbbell-tricep-kickback.gif",
    description:
      "Bend forward at the waist, hold a dumbbell in each hand, and extend your arms behind you to work the triceps.",
    muscleWorked: "Triceps",
    equipment: ["Dumbbells"],
    difficulty: {
      novice: "Seated Dumbbell Tricep Kickback",
      beginner: "Standard Dumbbell Tricep Kickback",
      intermediate: "Alternating Dumbbell Tricep Kickback",
      advanced: "Single-Arm Dumbbell Tricep Kickback",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use lighter weights to focus on muscle engagement" },
      "65+": { notes: "Use light weights, perform slowly and controlled" },
    },
  },

  // LEGS DUMBBELL EXERCISES
  "Dumbbell Lunges": {
    type: "animation",
    src: "/src/assets/exercises/dumbbell-lunge.gif",
    description:
      "Step forward with one leg into a lunge, lowering the back knee toward the ground while holding dumbbells at your sides.",
    muscleWorked: "Quads, Glutes, Hamstrings",
    equipment: ["Dumbbells"],
    difficulty: {
      novice: "Bodyweight Lunges",
      beginner: "Standard Dumbbell Lunges",
      intermediate: "Walking Dumbbell Lunges",
      advanced: "Bulgarian Split Squats with Dumbbells",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Start with lighter weights, focus on form" },
      "65+": { notes: "Use support if needed, reduce depth of lunge" },
    },
  },

  "Dumbbell Deadlift": {
    type: "animation",
    src: "/src/assets/exercises/dumbbell-deadlift.gif",
    description:
      "Stand with feet hip-width apart, hold dumbbells in front of thighs, hinge at hips and lower dumbbells towards the floor, then stand back up.",
    muscleWorked: "Hamstrings, Glutes, Lower Back",
    equipment: ["Dumbbells"],
    difficulty: {
      novice: "Dumbbell Deadlift with Light Weight",
      beginner: "Standard Dumbbell Deadlift",
      intermediate: "Romanian Deadlifts",
      advanced: "Single-Leg Dumbbell Deadlifts",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on form, avoid heavy loads" },
      "65+": { notes: "Use light weights, avoid bending too much" },
    },
  },
  // CHEST MACHINE EXERCISES
  "Machine Chest Press": {
    type: "animation",
    src: "/src/assets/exercises/machine-chest-press.gif",
    description:
      "Sit down on the machine with handles at chest level, press them forward until your arms are fully extended, then return slowly.",
    muscleWorked: "Chest, Shoulders, Triceps",
    equipment: ["Chest Press Machine"],
    difficulty: {
      novice: "Low Weight Machine Chest Press",
      beginner: "Standard Machine Chest Press",
      intermediate: "Incline Machine Chest Press",
      advanced: "Heavy Machine Chest Press",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Start with low weight and focus on form" },
      "65+": { notes: "Use light weights, avoid excessive strain" },
    },
  },

  "Machine Chest Fly": {
    type: "animation",
    src: "/src/assets/exercises/machine-chest-fly.gif",
    description:
      "Sit down on the chest fly machine, grasp the handles with your arms slightly bent, and bring the handles together in front of your chest.",
    muscleWorked: "Chest, Shoulders",
    equipment: ["Chest Fly Machine"],
    difficulty: {
      novice: "Light Weight Chest Fly",
      beginner: "Standard Machine Chest Fly",
      intermediate: "Incline Machine Chest Fly",
      advanced: "Heavy Machine Chest Fly",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on lighter weights and proper form" },
      "65+": { notes: "Use light weights, avoid excessive chest strain" },
    },
  },

  // BACK MACHINE EXERCISES
  "Lat Pulldown Machine": {
    type: "animation",
    src: "/src/assets/exercises/lat-pulldown-machine.gif",
    description:
      "Sit on the machine and grip the bar with your hands wider than shoulder-width, pull the bar down towards your chest, then release it slowly.",
    muscleWorked: "Back, Biceps, Shoulders",
    equipment: ["Lat Pulldown Machine"],
    difficulty: {
      novice: "Assisted Lat Pulldown",
      beginner: "Standard Lat Pulldown",
      intermediate: "Wide Grip Lat Pulldown",
      advanced: "Heavy Lat Pulldown",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on controlled movements and form" },
      "65+": { notes: "Use light weight, avoid pulling too hard" },
    },
  },

  "Seated Row Machine": {
    type: "animation",
    src: "/src/assets/exercises/seated-row-machine.gif",
    description:
      "Sit on the machine with feet flat, grip the handles, and pull them towards your torso, squeezing your shoulder blades together before releasing.",
    muscleWorked: "Back, Biceps",
    equipment: ["Seated Row Machine"],
    difficulty: {
      novice: "Light Weight Seated Row",
      beginner: "Standard Seated Row",
      intermediate: "Wide Grip Seated Row",
      advanced: "Heavy Seated Row",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on proper form and light weight" },
      "65+": { notes: "Use light weight and avoid jerking movements" },
    },
  },

  // LEGS MACHINE EXERCISES
  "Leg Press Machine": {
    type: "animation",
    src: "/src/assets/exercises/leg-press-machine.gif",
    description:
      "Sit on the machine with your feet placed shoulder-width apart on the platform, then press the weight upward by extending your legs and return slowly.",
    muscleWorked: "Quads, Hamstrings, Glutes",
    equipment: ["Leg Press Machine"],
    difficulty: {
      novice: "Light Weight Leg Press",
      beginner: "Standard Leg Press",
      intermediate: "Heavy Leg Press",
      advanced: "Single Leg Press",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weight and controlled movement" },
      "65+": { notes: "Use low weight and avoid locking knees" },
    },
  },

  "Leg Curl Machine": {
    type: "animation",
    src: "/src/assets/exercises/leg-curl-machine.gif",
    description:
      "Sit or lie on the machine with legs extended, then curl the weight by bringing your heels toward your glutes, and return slowly.",
    muscleWorked: "Hamstrings",
    equipment: ["Leg Curl Machine"],
    difficulty: {
      novice: "Light Weight Leg Curl",
      beginner: "Standard Leg Curl",
      intermediate: "Heavy Leg Curl",
      advanced: "Single Leg Curl",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weight and focus on form" },
      "65+": { notes: "Use low weight, avoid overstretching" },
    },
  },

  // SHOULDERS MACHINE EXERCISES
  "Machine Shoulder Press": {
    type: "animation",
    src: "/src/assets/exercises/machine-shoulder-press.gif",
    description:
      "Sit on the machine, grip the handles, and press them overhead until arms are fully extended, then return to the starting position.",
    muscleWorked: "Shoulders, Triceps",
    equipment: ["Shoulder Press Machine"],
    difficulty: {
      novice: "Light Weight Machine Shoulder Press",
      beginner: "Standard Machine Shoulder Press",
      intermediate: "Heavy Machine Shoulder Press",
      advanced: "Seated Machine Shoulder Press",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weight and controlled movement" },
      "65+": { notes: "Use light weight and avoid overhead strain" },
    },
  },

  // TRICEPS MACHINE EXERCISES
  "Machine Tricep Pushdown": {
    type: "animation",
    src: "/src/assets/exercises/machine-tricep-pushdown.gif",
    description:
      "Stand facing the machine, grip the rope attachment, and press the rope down towards your thighs, keeping elbows stationary.",
    muscleWorked: "Triceps",
    equipment: ["Cable Machine", "Rope Attachment"],
    difficulty: {
      novice: "Light Weight Tricep Pushdown",
      beginner: "Standard Tricep Pushdown",
      intermediate: "Heavy Tricep Pushdown",
      advanced: "Single Arm Tricep Pushdown",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights, focus on form" },
      "65+": { notes: "Use light weight, avoid locking elbows" },
    },
  },

  // CALVES MACHINE EXERCISES
  "Seated Calf Raise Machine": {
    type: "animation",
    src: "/src/assets/exercises/seated-calf-raise-machine.gif",
    description:
      "Sit on the calf raise machine with feet on the footplate, raise your heels as high as possible, then lower them back down.",
    muscleWorked: "Calves",
    equipment: ["Seated Calf Raise Machine"],
    difficulty: {
      novice: "Low Weight Seated Calf Raise",
      beginner: "Standard Seated Calf Raise",
      intermediate: "Heavy Seated Calf Raise",
      advanced: "Single Leg Seated Calf Raise",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "15-20", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "10-15", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "6-8", intensity: "very high" },
      Endurance: { sets: 3, reps: "20-25", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weight, focus on controlled motion" },
      "65+": { notes: "Use light weight, reduce range of motion" },
    },
  },
  // CHEST CABLE EXERCISES
  "Cable Chest Fly": {
    type: "animation",
    src: "/src/assets/exercises/cable-chest-fly.gif",
    description:
      "Stand between two cable machines, grip the handles with your arms slightly bent, and bring the cables together in front of your chest.",
    muscleWorked: "Chest, Shoulders",
    equipment: ["Cable Machine", "Handles"],
    difficulty: {
      novice: "Light Weight Cable Chest Fly",
      beginner: "Standard Cable Chest Fly",
      intermediate: "Incline Cable Chest Fly",
      advanced: "Heavy Cable Chest Fly",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on controlled movement and proper form" },
      "65+": { notes: "Use light weights, avoid excessive strain on chest" },
    },
  },

  "Cable Crossovers": {
    type: "animation",
    src: "/src/assets/exercises/cable-crossover.gif",
    description:
      "Stand between two cable machines, pull the cables down and across your body, and bring your hands together in front of your chest.",
    muscleWorked: "Chest, Shoulders",
    equipment: ["Cable Machine", "Handles"],
    difficulty: {
      novice: "Light Cable Crossovers",
      beginner: "Standard Cable Crossovers",
      intermediate: "High Cable Crossovers",
      advanced: "Heavy Cable Crossovers",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights and focus on form" },
      "65+": { notes: "Use light weights, avoid excessive chest strain" },
    },
  },

  // BACK CABLE EXERCISES
  "Cable Rows": {
    type: "animation",
    src: "/src/assets/exercises/cable-row.gif",
    description:
      "Sit on the machine, grip the handles, and pull them towards your torso, keeping your back straight and shoulders engaged.",
    muscleWorked: "Back, Biceps, Shoulders",
    equipment: ["Cable Machine", "Handles"],
    difficulty: {
      novice: "Light Weight Cable Rows",
      beginner: "Standard Cable Rows",
      intermediate: "Wide Grip Cable Rows",
      advanced: "Heavy Cable Rows",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on controlled movement, use light weights" },
      "65+": { notes: "Use light weights, avoid jerky movements" },
    },
  },

  "Cable Pulldowns": {
    type: "animation",
    src: "/src/assets/exercises/cable-pulldown.gif",
    description:
      "Sit at the machine, grip the bar wider than shoulder-width, and pull the bar down towards your chest.",
    muscleWorked: "Back, Biceps",
    equipment: ["Cable Machine", "Bar Attachment"],
    difficulty: {
      novice: "Assisted Cable Pulldowns",
      beginner: "Standard Cable Pulldowns",
      intermediate: "Wide Grip Cable Pulldowns",
      advanced: "Heavy Cable Pulldowns",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on proper form and use light weight" },
      "65+": { notes: "Use light weight, avoid pulling too hard" },
    },
  },

  // SHOULDERS CABLE EXERCISES
  "Cable Lateral Raise": {
    type: "animation",
    src: "/src/assets/exercises/cable-lateral-raise.gif",
    description:
      "Stand with your side to the cable machine, hold the handle with one hand, and raise your arm out to the side until it’s parallel with the floor.",
    muscleWorked: "Shoulders",
    equipment: ["Cable Machine", "Handle"],
    difficulty: {
      novice: "Light Weight Cable Lateral Raise",
      beginner: "Standard Cable Lateral Raise",
      intermediate: "Heavy Cable Lateral Raise",
      advanced: "Alternating Cable Lateral Raise",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights and avoid swinging" },
      "65+": { notes: "Use light weights, avoid lifting too high" },
    },
  },

  "Cable Face Pulls": {
    type: "animation",
    src: "/src/assets/exercises/cable-face-pull.gif",
    description:
      "Attach a rope to the cable machine, stand facing the machine, pull the rope towards your face while keeping your elbows high.",
    muscleWorked: "Shoulders, Upper Back",
    equipment: ["Cable Machine", "Rope Attachment"],
    difficulty: {
      novice: "Light Cable Face Pulls",
      beginner: "Standard Cable Face Pulls",
      intermediate: "Heavy Cable Face Pulls",
      advanced: "Single Arm Cable Face Pulls",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on proper form and light weights" },
      "65+": { notes: "Use light weights, avoid jerking motions" },
    },
  },

  // BICEPS CABLE EXERCISES
  "Cable Bicep Curl": {
    type: "animation",
    src: "/src/assets/exercises/cable-bicep-curl.gif",
    description:
      "Stand facing the cable machine, grip the handle with both hands, and curl the cable towards your face, keeping elbows close to your body.",
    muscleWorked: "Biceps",
    equipment: ["Cable Machine", "Handle"],
    difficulty: {
      novice: "Light Cable Bicep Curl",
      beginner: "Standard Cable Bicep Curl",
      intermediate: "Heavy Cable Bicep Curl",
      advanced: "Alternating Cable Bicep Curl",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights, focus on controlled motion" },
      "65+": { notes: "Use light weights, avoid excessive strain" },
    },
  },

  // TRICEPS CABLE EXERCISES
  "Cable Tricep Pushdown": {
    type: "animation",
    src: "/src/assets/exercises/cable-tricep-pushdown.gif",
    description:
      "Stand facing the cable machine with a rope attachment, pull the rope down towards your thighs while keeping elbows stationary.",
    muscleWorked: "Triceps",
    equipment: ["Cable Machine", "Rope Attachment"],
    difficulty: {
      novice: "Light Cable Tricep Pushdown",
      beginner: "Standard Cable Tricep Pushdown",
      intermediate: "Heavy Cable Tricep Pushdown",
      advanced: "Single Arm Cable Tricep Pushdown",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights, avoid jerking movements" },
      "65+": { notes: "Use light weights, focus on controlled motion" },
    },
  },

  // LEGS CABLE EXERCISES
  "Cable Leg Curl": {
    type: "animation",
    src: "/src/assets/exercises/cable-leg-curl.gif",
    description:
      "Attach an ankle strap to the low pulley, curl your leg upwards towards your glutes, and return slowly.",
    muscleWorked: "Hamstrings",
    equipment: ["Cable Machine", "Ankle Strap"],
    difficulty: {
      novice: "Light Cable Leg Curl",
      beginner: "Standard Cable Leg Curl",
      intermediate: "Heavy Cable Leg Curl",
      advanced: "Single Leg Cable Leg Curl",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weight and controlled movements" },
      "65+": { notes: "Use light weight, avoid excessive leg strain" },
    },
  },
  // CHEST KETTLEBELL EXERCISES
  "Kettlebell Chest Press": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-chest-press.gif",
    description:
      "Lie on a bench, holding a kettlebell in each hand, lower the kettlebells to chest level, and then press them up.",
    muscleWorked: "Chest, Shoulders, Triceps",
    equipment: ["Kettlebells", "Bench"],
    difficulty: {
      novice: "Light Weight Kettlebell Chest Press",
      beginner: "Standard Kettlebell Chest Press",
      intermediate: "Incline Kettlebell Chest Press",
      advanced: "Heavy Kettlebell Chest Press",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weights and controlled movement" },
      "65+": { notes: "Use light weights, avoid excessive overhead movements" },
    },
  },

  "Kettlebell Fly": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-fly.gif",
    description:
      "Lie on a bench, holding a kettlebell in each hand with arms extended, lower the kettlebells to your sides, and bring them back up.",
    muscleWorked: "Chest, Shoulders",
    equipment: ["Kettlebells", "Bench"],
    difficulty: {
      novice: "Light Kettlebell Fly",
      beginner: "Standard Kettlebell Fly",
      intermediate: "Incline Kettlebell Fly",
      advanced: "Heavy Kettlebell Fly",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights and focus on form" },
      "65+": { notes: "Use light weights, avoid excessive chest strain" },
    },
  },

  // BACK KETTLEBELL EXERCISES
  "Kettlebell Row": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-row.gif",
    description:
      "Bend at the waist with a straight back, grip the kettlebell, and pull it towards your waist, squeezing your shoulder blades together.",
    muscleWorked: "Back, Biceps",
    equipment: ["Kettlebell"],
    difficulty: {
      novice: "Light Weight Kettlebell Row",
      beginner: "Standard Kettlebell Row",
      intermediate: "Single-Arm Kettlebell Row",
      advanced: "Heavy Kettlebell Row",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on controlled movements and proper form" },
      "65+": { notes: "Use light weights and avoid jerky movements" },
    },
  },

  "Kettlebell Deadlift": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-deadlift.gif",
    description:
      "Stand with feet hip-width apart, grip the kettlebell with both hands, and hinge at the hips, lowering the kettlebell towards the floor while maintaining a straight back.",
    muscleWorked: "Hamstrings, Glutes, Lower Back",
    equipment: ["Kettlebell"],
    difficulty: {
      novice: "Light Weight Kettlebell Deadlift",
      beginner: "Standard Kettlebell Deadlift",
      intermediate: "Single-Leg Kettlebell Deadlift",
      advanced: "Heavy Kettlebell Deadlift",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on form and light weight" },
      "65+": { notes: "Use light weights and avoid overextending" },
    },
  },

  // SHOULDERS KETTLEBELL EXERCISES
  "Kettlebell Shoulder Press": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-shoulder-press.gif",
    description:
      "Hold a kettlebell in each hand at shoulder height, press the kettlebells overhead until your arms are fully extended, and then lower them back down.",
    muscleWorked: "Shoulders, Triceps",
    equipment: ["Kettlebells"],
    difficulty: {
      novice: "Seated Kettlebell Shoulder Press",
      beginner: "Standard Kettlebell Shoulder Press",
      intermediate: "Alternating Kettlebell Shoulder Press",
      advanced: "Heavy Kettlebell Shoulder Press",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weights and proper form" },
      "65+": { notes: "Use light weights, avoid overhead strain" },
    },
  },

  "Kettlebell Lateral Raise": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-lateral-raise.gif",
    description:
      "Hold a kettlebell in each hand at your sides, then raise the kettlebells out to the sides until your arms are parallel to the floor.",
    muscleWorked: "Shoulders",
    equipment: ["Kettlebells"],
    difficulty: {
      novice: "Light Weight Kettlebell Lateral Raise",
      beginner: "Standard Kettlebell Lateral Raise",
      intermediate: "Heavy Kettlebell Lateral Raise",
      advanced: "Alternating Kettlebell Lateral Raise",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights and focus on controlled movement" },
      "65+": { notes: "Use light weights, avoid excessive shoulder strain" },
    },
  },

  // BICEPS KETTLEBELL EXERCISES
  "Kettlebell Bicep Curl": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-bicep-curl.gif",
    description:
      "Stand tall, holding a kettlebell in each hand, curl the weights towards your shoulders, then lower slowly.",
    muscleWorked: "Biceps",
    equipment: ["Kettlebells"],
    difficulty: {
      novice: "Light Weight Kettlebell Bicep Curl",
      beginner: "Standard Kettlebell Bicep Curl",
      intermediate: "Hammer Curl with Kettlebells",
      advanced: "Concentration Curl with Kettlebell",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Use light weights and focus on form" },
      "65+": { notes: "Use light weights, avoid excessive strain" },
    },
  },

  // TRICEPS KETTLEBELL EXERCISES
  "Kettlebell Tricep Extension": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-tricep-extension.gif",
    description:
      "Hold a kettlebell with both hands overhead, lower the kettlebell behind your head by bending the elbows, and extend back up.",
    muscleWorked: "Triceps",
    equipment: ["Kettlebell"],
    difficulty: {
      novice: "Light Weight Kettlebell Tricep Extension",
      beginner: "Standard Kettlebell Tricep Extension",
      intermediate: "Heavy Kettlebell Tricep Extension",
      advanced: "Single Arm Kettlebell Tricep Extension",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on proper form and light weight" },
      "65+": { notes: "Use light weights, avoid overhead strain" },
    },
  },

  // LEGS KETTLEBELL EXERCISES
  "Kettlebell Goblet Squat": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-goblet-squat.gif",
    description:
      "Hold a kettlebell close to your chest with both hands, squat down, keeping your chest up and back straight.",
    muscleWorked: "Quads, Glutes, Hamstrings",
    equipment: ["Kettlebell"],
    difficulty: {
      novice: "Light Weight Kettlebell Goblet Squat",
      beginner: "Standard Kettlebell Goblet Squat",
      intermediate: "Heavy Kettlebell Goblet Squat",
      advanced: "Single Leg Kettlebell Squat",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on light weights and form" },
      "65+": { notes: "Use light weights, focus on squat depth" },
    },
  },

  "Kettlebell Lunge": {
    type: "animation",
    src: "/src/assets/exercises/kettlebell-lunge.gif",
    description:
      "Hold a kettlebell in each hand, step forward with one leg into a lunge, then push back to the starting position.",
    muscleWorked: "Quads, Glutes, Hamstrings",
    equipment: ["Kettlebells"],
    difficulty: {
      novice: "Bodyweight Lunges",
      beginner: "Light Weight Kettlebell Lunges",
      intermediate: "Standard Kettlebell Lunges",
      advanced: "Heavy Kettlebell Lunges",
    },
    variations: {
      "Weight Loss": { sets: 3, reps: "12-15", intensity: "moderate" },
      "Muscle Building": { sets: 4, reps: "8-12", intensity: "high" },
      "Gain Strength": { sets: 5, reps: "3-6", intensity: "very high" },
      Endurance: { sets: 3, reps: "15-20", intensity: "low" },
    },
    ageModifications: {
      "13-18": { notes: "Focus on balance and light weights" },
      "65+": { notes: "Use light weights and avoid deep lunges" },
    },
  },
};

const exercisesByMuscle = {
  Chest: [
    "Push-ups",
    "Diamond Push-ups",
    "Decline Push-ups",
    "Barbell Bench Press",
    "Dumbbell Bench Press",
    "Kettlebell Chest Press",
    "Dumbbell Chest Fly",
    "Kettlebell Fly",
    "Cable Chest Fly",
    "Cable Crossovers",
    "Machine Chest Press",
    "Machine Chest Fly",
  ],
  Back: [
    "Pull-ups",
    "Chin-ups",
    "Inverted Rows",
    "Barbell Row",
    "Barbell Deadlift",
    "Dumbbell Row",
    "Dumbbell Pullover",
    "Kettlebell Row",
    "Kettlebell Deadlift",
    "Cable Rows",
    "Cable Pulldowns",
    "Lat Pulldown Machine",
    "Seated Row Machine",
  ],
  Shoulders: [
    "Pike Push-ups",
    "Barbell Shoulder Press",
    "Dumbbell Shoulder Press",
    "Kettlebell Shoulder Press",
    "Lateral Raise",
    "Kettlebell Lateral Raise",
    "Cable Lateral Raise",
    "Cable Face Pulls",
    "Machine Shoulder Press",
  ],
  Biceps: [
    "Chin-ups",
    "Dumbbell Bicep Curl",
    "Kettlebell Bicep Curl",
    "Cable Bicep Curl",
  ],
  Triceps: [
    "Dips",
    "Diamond Push-ups",
    "Dumbbell Tricep Kickback",
    "Kettlebell Tricep Extension",
    "Cable Tricep Pushdown",
    "Machine Tricep Pushdown",
  ],
  Abs: ["Planks"],
  Quads: [
    "Barbell Squat",
    "Barbell Front Squat",
    "Dumbbell Lunges",
    "Kettlebell Goblet Squat",
    "Kettlebell Lunge",
    "Leg Press Machine",
    "Leg Curl Machine",
  ],
  Hamstrings: [
    "Barbell Deadlift",
    "Dumbbell Deadlift",
    "Kettlebell Deadlift",
    "Leg Curl Machine",
    "Cable Leg Curl",
  ],
  Glutes: [
    "Barbell Squat",
    "Barbell Deadlift",
    "Dumbbell Lunges",
    "Kettlebell Goblet Squat",
    "Kettlebell Lunge",
  ],
  Calves: ["Barbell Calf Raise", "Seated Calf Raise Machine"],
};

const getExerciseAsset = (exerciseName, fitnessLevel = "beginner") => {
  const asset = allExercises[exerciseName];

  if (!asset) {
    return {
      type: "image",
      src: resolveExercisePath(exerciseName),
      description: "Demonstration for this exercise will be added soon.",
      muscleWorked: "Multiple",
      equipment: ["Various"],
      difficulty: "Varies",
    };
  }

  // Prioritize getting the correct difficulty level information
  const levelInfo =
    asset.difficulty[fitnessLevel] ||
    asset.difficulty.beginner ||
    Object.values(asset.difficulty)[0];

  return {
    ...asset,
    // Use the specific level's src or fallback to resolveExercisePath
    src:
      levelInfo.src ||
      resolveExercisePath(exerciseName, asset.type) ||
      asset.src,

    // Use the specific level's description or fallback to main description
    description:
      levelInfo.description || asset.description || "No description available.",

    // Use the specific level's name or fallback to exercise name
    name: levelInfo.name || exerciseName,

    // Always use the main asset's muscleWorked
    muscleWorked: asset.muscleWorked || "Multiple Muscles",

    // Use the specific level's difficulty or fallback
    difficulty: levelInfo.name || "Varies",
  };
};

const bodyImages = {
  male: "/src/assets/titan.png",
  female: "/src/assets/female-titan.png",
};

const fitnessGoalInfo = {
  Endurance:
    "Focuses on increasing your stamina and cardiovascular capacity with higher reps, shorter rest periods, and moderate intensity. Great for improving overall fitness and energy levels.",
  "Gain Strength":
    "Prioritizes heavier weights with lower reps and longer rest periods to maximize strength gains. Ideal for building raw power and functional strength.",
  "Muscle Building":
    "Balances moderate-to-heavy weights with optimal time under tension and moderate rest periods to stimulate muscle growth (hypertrophy). Perfect for adding muscle mass and definition.",
  "Weight Loss":
    "Combines resistance training with higher rep ranges and shorter rest periods to maximize calorie burn and metabolic impact. Effective for fat loss while preserving muscle.",
};

const fitnessLevelInfo = {
  novice:
    "You're new to exercise or returning after a long break. Focus on learning proper form and building basic fitness.",
  beginner:
    "You have some exercise experience but are still developing consistent workout habits and foundational strength.",
  intermediate:
    "You've been exercising regularly for some time and have good technique in most exercises.",
  advanced:
    "You have extensive training experience and are looking to optimize your workouts for specific goals.",
};

function WorkoutGenerator() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [viewingGoalInfo, setViewingGoalInfo] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [preferences, setPreferences] = useState({
    gender: "",
    age: 30,
    fitnessGoal: "",
    fitnessLevel: "",
    workoutsPerWeek: 3,
    equipment: [],
    targetMuscles: [],
  });
  const [workout, setWorkout] = useState(null);
  const [viewingExercise, setViewingExercise] = useState(null);
  const [viewingLevelInfo, setViewingLevelInfo] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("workout");
  const [workoutVersions, setWorkoutVersions] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [bodyImage, setBodyImage] = useState(
    bodyImages[preferences.gender.toLowerCase()]
  );
  const [selectedDayExercises, setSelectedDayExercises] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return preferences.gender ? true : false;
      case 2:
        return preferences.age >= 13 && preferences.age <= 100 ? true : false;
      case 3:
        return preferences.fitnessGoal ? true : false;
      case 4:
        return preferences.fitnessLevel ? true : false;
      case 5:
        return preferences.workoutsPerWeek >= 1 &&
          preferences.workoutsPerWeek <= 7
          ? true
          : false;
      case 6:
        return preferences.equipment.length > 0 ? true : false;
      case 7:
        if (
          preferences.workoutsPerWeek > 5 &&
          preferences.targetMuscles.length < 4
        ) {
          return false;
        } else if (
          preferences.workoutsPerWeek > 2 &&
          preferences.targetMuscles.length < 2
        ) {
          return false;
        }
        return preferences.targetMuscles.length > 0 ? true : false;
      default:
        return true;
    }
  };

  const saveWorkoutProgram = async () => {
    try {
      if (!isAuthenticated) {
        setShowLoginPrompt(true);
        return;
      }

      const token = localStorage.getItem("token");

      // Create a simplified version of the workout that removes any potential circular references
      const simplifiedWorkout = {
        id: workout.id,
        title: workout.title,
        difficulty: workout.difficulty,
        fitnessGoal: workout.fitnessGoal,
        duration: workout.duration,
        workoutsPerWeek: workout.workoutsPerWeek,
        targetMuscles: workout.targetMuscles,
        exercises: workout.exercises.map((ex) => ({
          name: ex.name,
          muscle: ex.muscle,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          intensity: ex.intensity,
        })),
      };

      await createSavedProgram(simplifiedWorkout, token);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/saved-programs");
      }, 3000);
    } catch (error) {
      console.error("Error saving workout program:", error);
      alert("Failed to save workout program. Please try again.");
    }
  };

  const handleStepValidation = () => {
    switch (currentStep) {
      case 1:
        if (!preferences.gender) {
          alert("Please select your gender");
        }
        break;
      case 2:
        if (preferences.age < 13 || preferences.age > 100) {
          alert("Please enter a valid age between 13 and 100");
        }
        break;
      case 3:
        if (!preferences.fitnessGoal) {
          alert("Please select your fitness goal");
        }
        break;
      case 4:
        if (!preferences.fitnessLevel) {
          alert("Please select your fitness level");
        }
        break;
      case 5:
        if (
          preferences.workoutsPerWeek < 1 ||
          preferences.workoutsPerWeek > 7
        ) {
          alert("Please select between 1 and 7 workouts per week");
        }
        break;
      case 6:
        if (preferences.equipment.length === 0) {
          alert("Please select at least one type of equipment");
        }
        break;
      case 7:
        if (preferences.targetMuscles.length === 0) {
          alert("Please select at least one muscle group to train");
        } else if (
          preferences.workoutsPerWeek > 5 &&
          preferences.targetMuscles.length < 4
        ) {
          alert(
            "When training more than 5 times per week, you should select at least 4 muscle groups for a balanced routine"
          );
        } else if (
          preferences.workoutsPerWeek > 2 &&
          preferences.targetMuscles.length < 2
        ) {
          alert(
            "When training more than 2 times per week, you should select at least 2 muscle groups for a balanced routine"
          );
        }
        break;
      default:
        break;
    }
  };

  const getExercisesForEquipment = (
    muscle,
    equipmentList,
    age,
    fitnessLevel,
    fitnessGoal
  ) => {
    console.log(`Selecting exercises for: 
        Muscle: ${muscle}
        Equipment: ${equipmentList}
        Age: ${age}
        Fitness Level: ${fitnessLevel}
        Fitness Goal: ${fitnessGoal}`);

    // If no specific equipment is selected, return all exercises for the muscle
    if (equipmentList.length === 0 || equipmentList.includes("Select all")) {
      return exercisesByMuscle[muscle] || [];
    }

    const muscleExercises = exercisesByMuscle[muscle] || [];
    console.log(`Initial muscle exercises: ${muscleExercises}`);

    // Expanded filtering with detailed logging
    const equipmentFilteredExercises = muscleExercises.filter((exercise) => {
      const exerciseInfo = allExercises[exercise];

      if (!exerciseInfo) {
        console.warn(`No exercise info found for: ${exercise}`);
        return false;
      }

      // Check equipment match
      const equipmentMatch = exerciseInfo.equipment?.some(
        (eq) => equipmentList.includes(eq) || eq === "Bodyweight"
      );

      // Check goal variations exist
      const goalVariationExists =
        exerciseInfo.variations?.[fitnessGoal] !== undefined;

      if (!equipmentMatch) {
        console.log(`Equipment mismatch for ${exercise}. 
                Required: ${equipmentList}
                Exercise Equipment: ${exerciseInfo.equipment}`);
      }

      if (!goalVariationExists) {
        console.log(`Goal variation mismatch for ${exercise}. 
                Required Goal: ${fitnessGoal}
                Available Variations: ${Object.keys(
                  exerciseInfo.variations || {}
                )}`);
      }

      return equipmentMatch && goalVariationExists;
    });

    console.log(
      `Filtered exercises after equipment and goal check: ${equipmentFilteredExercises}`
    );

    // Fallback strategies with logging
    if (equipmentFilteredExercises.length === 0) {
      console.warn(
        `No exercises found for ${muscle} with current filters. Attempting fallbacks.`
      );

      // Fallback 1: Bodyweight exercises
      const bodyweightExercises = muscleExercises.filter((exercise) =>
        allExercises[exercise]?.equipment?.includes("Bodyweight")
      );

      if (bodyweightExercises.length > 0) {
        console.log(`Falling back to bodyweight exercises for ${muscle}`);
        return bodyweightExercises;
      }

      // Fallback 2: All muscle exercises
      console.log(`Falling back to all exercises for ${muscle}`);
      return muscleExercises;
    }

    // Age and fitness level-based modifications
    const ageAdjustedExercises = equipmentFilteredExercises.map((exercise) => {
      const exerciseInfo = allExercises[exercise];

      // Age and difficulty modifications
      if (exerciseInfo.difficulty) {
        if (age < 18 && exerciseInfo.difficulty.advanced) {
          return `Modified ${exercise}`;
        } else if (age > 65 && exerciseInfo.difficulty.advanced) {
          return `Low-Impact ${exercise}`;
        }
      }

      return exercise;
    });

    console.log(
      `Final selected exercises after age adjustment: ${ageAdjustedExercises}`
    );
    return ageAdjustedExercises;
  };

  const generateWorkoutPlan = (prefs) => {
    const setsReps = {
      "Weight Loss": {
        sets: 3,
        reps: "12-15",
        rest: 45,
        intensity: "60-75%",
      },
      Endurance: {
        sets: 3,
        reps: "15-20",
        rest: 60,
        intensity: "50-70%",
      },
      "Gain Strength": {
        sets: 5,
        reps: "3-5",
        rest: 180,
        intensity: "85-95%",
      },
      "Muscle Building": {
        sets: 4,
        reps: "8-12",
        rest: 90,
        intensity: "70-85%",
      },
    };

    let targetMuscles =
      prefs.targetMuscles.length > 0
        ? prefs.targetMuscles
        : [
            "Chest",
            "Back",
            "Shoulders",
            "Biceps",
            "Triceps",
            "Abs",
            "Quads",
            "Hamstrings",
            "Glutes",
            "Calves",
          ];

    let workoutDuration = 60;
    switch (prefs.fitnessLevel) {
      case "novice":
        workoutDuration = 30;
        break;
      case "beginner":
        workoutDuration = 45;
        break;
      case "intermediate":
        workoutDuration = 60;
        break;
      case "advanced":
        workoutDuration = 75;
        break;
      default:
        workoutDuration = 60;
    }

    const selectedExercises = [];
    let totalWorkoutTime = 0; // Initialize total workout time

    targetMuscles.forEach((muscle) => {
      let availableExercises = getExercisesForEquipment(
        muscle,
        prefs.equipment,
        prefs.age,
        prefs.fitnessLevel, // New parameter
        prefs.fitnessGoal // New parameter
      );

      if (availableExercises.length === 0) {
        availableExercises = getExercisesForEquipment(muscle, ["Bodyweight"]);
      }

      // Ensure we select up to 3 unique exercises per muscle group
      const desiredExerciseCount = Math.min(3, availableExercises.length);
      const muscleExercises = [];

      // Use a Set to track selected exercises to ensure uniqueness
      const selectedExerciseNames = new Set();

      while (
        muscleExercises.length < desiredExerciseCount &&
        availableExercises.length > 0
      ) {
        // Randomly select an index
        const randomIndex = Math.floor(
          Math.random() * availableExercises.length
        );
        const exercise = availableExercises[randomIndex];

        // Only add if not already selected
        if (!selectedExerciseNames.has(exercise)) {
          const sets = setsReps[prefs.fitnessGoal]?.sets || 3;
          const reps = setsReps[prefs.fitnessGoal]?.reps || "10-12";
          const rest = setsReps[prefs.fitnessGoal]?.rest || 60;
          const exerciseInfo = allExercises[exercise];

          // Handle difficulty correctly
          let displayName = exercise;
          let difficultyLevel = prefs.fitnessLevel;

          // If the exercise has a structured difficulty object
          if (exerciseInfo && typeof exerciseInfo.difficulty === "object") {
            // Get the appropriate variant for the user's fitness level
            const levelInfo = exerciseInfo.difficulty[difficultyLevel];
            if (levelInfo) {
              displayName = levelInfo.name || exercise;
            }
          }

          muscleExercises.push({
            name: displayName,
            muscle: muscle,
            sets: sets,
            reps: reps,
            rest: rest,
            intensity: setsReps[prefs.fitnessGoal]?.intensity || "70-80%",
          });

          // Mark as selected and remove from available list
          selectedExerciseNames.add(exercise);
          availableExercises.splice(randomIndex, 1);

          // Calculate total workout time
          totalWorkoutTime +=
            sets * (parseInt(reps.split("-")[0]) + 1) * 0.5 + rest;
        }
      }

      // Add all exercises for this muscle group to the main selected exercises array
      selectedExercises.push(...muscleExercises);
    });

    // Convert total workout time to minutes
    const totalTimeInMinutes = Math.ceil(totalWorkoutTime / 60);

    let ageAdjustments = [];
    if (prefs.age < 18) {
      ageAdjustments.push("Reduced weights, focus on technique");

      selectedExercises.forEach((ex) => {
        ex.intensity = "60-70%";
      });
    } else if (prefs.age > 65) {
      ageAdjustments.push("Added joint-friendly variations");
      ageAdjustments.push("Extended warm-up recommendation");

      selectedExercises.forEach((ex) => {
        ex.rest += 30;
      });
    }

    const workoutId = Date.now().toString();

    const cardioOptions = [
      "Treadmill - 10 minutes, moderate pace",
      "Stationary Bike - 8 minutes, moderate resistance",
      "Jumping Jacks - 2 sets of 30 seconds",
      "Jump Rope - 2 minutes",
      "High Knees - 1 minute",
      "Bodyweight Squats - 15 reps",
    ];

    // Then select random cardio options for warmup
    const selectedCardio =
      cardioOptions[Math.floor(Math.random() * cardioOptions.length)];

    return {
      id: workoutId,
      title: `${
        prefs.fitnessLevel.charAt(0).toUpperCase() + prefs.fitnessLevel.slice(1)
      } ${prefs.fitnessGoal} Workout (${prefs.workoutsPerWeek}x/week)`,
      exercises: selectedExercises,
      duration: totalTimeInMinutes,
      difficulty: prefs.fitnessLevel,
      fitnessGoal: prefs.fitnessGoal,
      workoutsPerWeek: prefs.workoutsPerWeek,
      restPeriod: setsReps[prefs.fitnessGoal]?.rest || 60,
      targetMuscles: targetMuscles,
      equipment: prefs.equipment,
      gender: prefs.gender,
      age: prefs.age,
      ageAdjustments: ageAdjustments,
      warmup: [
        "Light Cardio (5 min)",
        `${selectedCardio}`,
        "Dynamic Stretching (5 min)",
      ],
      cooldown: ["Static Stretching (5 min)"],
      createdAt: new Date().toISOString(),
    };
  };

  const generateTrainingSchedule = (muscleGroups, daysPerWeek) => {
    // Create organized muscle groups based on movement patterns
    const pushMuscles = ["Chest", "Shoulders", "Triceps"];
    const pullMuscles = ["Back", "Biceps"];
    const legMuscles = ["Quads", "Hamstrings", "Glutes", "Calves"];
    const coreMuscles = ["Abs"];

    // Filter user-selected muscles into these categories
    const selectedPush = muscleGroups.filter((m) => pushMuscles.includes(m));
    const selectedPull = muscleGroups.filter((m) => pullMuscles.includes(m));
    const selectedLegs = muscleGroups.filter((m) => legMuscles.includes(m));
    const selectedCore = muscleGroups.filter((m) => coreMuscles.includes(m));

    const schedule = {};

    // Handle different training frequencies with proper splits
    switch (daysPerWeek) {
      case 1:
        // Full body
        schedule["Day 1"] = muscleGroups;
        break;

      case 2:
        // Upper/Lower split
        const upperBody = [...selectedPush, ...selectedPull, ...selectedCore];
        const lowerBody = [...selectedLegs];

        schedule["Day 1"] =
          upperBody.length > 0
            ? upperBody
            : muscleGroups.slice(0, Math.ceil(muscleGroups.length / 2));
        schedule["Day 2"] =
          lowerBody.length > 0
            ? lowerBody
            : muscleGroups.slice(Math.ceil(muscleGroups.length / 2));
        break;

      case 3:
        // Push/Pull/Legs (PPL) split
        if (
          selectedPush.length > 0 ||
          selectedPull.length > 0 ||
          selectedLegs.length > 0
        ) {
          // Add core to pull day by default, but if pull is empty, add to push
          const pullWithCore =
            selectedPull.length > 0
              ? [...selectedPull, ...selectedCore]
              : selectedCore;
          const pushWithCore =
            selectedPull.length === 0
              ? [...selectedPush, ...selectedCore]
              : selectedPush;

          schedule["Day 1 - Push"] =
            pushWithCore.length > 0
              ? pushWithCore
              : muscleGroups.slice(0, Math.ceil(muscleGroups.length / 3));
          schedule["Day 2 - Pull"] =
            pullWithCore.length > 0
              ? pullWithCore
              : muscleGroups.slice(
                  Math.ceil(muscleGroups.length / 3),
                  Math.ceil((muscleGroups.length * 2) / 3)
                );
          schedule["Day 3 - Legs"] =
            selectedLegs.length > 0
              ? selectedLegs
              : muscleGroups.slice(Math.ceil((muscleGroups.length * 2) / 3));
        } else {
          // Fallback to simple division if user selected unusual muscle groups
          const chunkSize = Math.ceil(muscleGroups.length / 3);
          schedule["Day 1"] = muscleGroups.slice(0, chunkSize);
          schedule["Day 2"] = muscleGroups.slice(chunkSize, chunkSize * 2);
          schedule["Day 3"] = muscleGroups.slice(chunkSize * 2);
        }
        break;

      case 4:
        // Upper/Lower twice per week
        if (
          selectedPush.length > 0 ||
          selectedPull.length > 0 ||
          selectedLegs.length > 0
        ) {
          const upperBody = [...selectedPush, ...selectedPull];
          const upperWithCore = [...upperBody, ...selectedCore];

          schedule["Day 1 - Upper"] =
            upperWithCore.length > 0
              ? upperWithCore
              : muscleGroups.slice(0, Math.ceil(muscleGroups.length / 2));
          schedule["Day 2 - Lower"] =
            selectedLegs.length > 0
              ? selectedLegs
              : muscleGroups.slice(Math.ceil(muscleGroups.length / 2));
          schedule["Day 3 - Upper"] =
            upperBody.length > 0
              ? upperBody
              : muscleGroups.slice(0, Math.ceil(muscleGroups.length / 2));
          schedule["Day 4 - Lower"] =
            selectedLegs.length > 0
              ? selectedLegs
              : muscleGroups.slice(Math.ceil(muscleGroups.length / 2));
        } else {
          // Fallback if unusual muscle groups
          const chunkSize = Math.ceil(muscleGroups.length / 4);
          for (let i = 0; i < 4; i++) {
            schedule[`Day ${i + 1}`] = muscleGroups
              .slice(i * chunkSize, (i + 1) * chunkSize)
              .filter(Boolean);
          }
        }
        break;

      case 5:
        // Push/Pull/Legs/Upper/Lower or 5-day body part split
        if (
          selectedPush.length > 0 &&
          selectedPull.length > 0 &&
          selectedLegs.length > 0
        ) {
          schedule["Day 1 - Push"] = selectedPush;
          schedule["Day 2 - Pull"] = [...selectedPull, ...selectedCore];
          schedule["Day 3 - Legs"] = selectedLegs;
          schedule["Day 4 - Upper"] = [...selectedPush, ...selectedPull];
          schedule["Day 5 - Lower"] = selectedLegs;
        } else {
          // Body part split or fallback
          const muscleChunks = [];
          const chunkSize = Math.ceil(muscleGroups.length / 5);

          for (let i = 0; i < 5; i++) {
            const chunk = muscleGroups
              .slice(i * chunkSize, (i + 1) * chunkSize)
              .filter(Boolean);
            if (chunk.length > 0) {
              muscleChunks.push(chunk);
            }
          }

          muscleChunks.forEach((chunk, index) => {
            schedule[`Day ${index + 1}`] = chunk;
          });
        }
        break;

      case 6:
        // Push/Pull/Legs twice per week (advanced)
        if (
          selectedPush.length > 0 ||
          selectedPull.length > 0 ||
          selectedLegs.length > 0
        ) {
          schedule["Day 1 - Push"] =
            selectedPush.length > 0
              ? selectedPush
              : muscleGroups.slice(0, Math.ceil(muscleGroups.length / 3));
          schedule["Day 2 - Pull"] =
            selectedPull.length > 0
              ? [...selectedPull, ...selectedCore]
              : [
                  ...muscleGroups.slice(
                    Math.ceil(muscleGroups.length / 3),
                    Math.ceil((muscleGroups.length * 2) / 3)
                  ),
                  ...selectedCore,
                ];
          schedule["Day 3 - Legs"] =
            selectedLegs.length > 0
              ? selectedLegs
              : muscleGroups.slice(Math.ceil((muscleGroups.length * 2) / 3));
          schedule["Day 4 - Push"] =
            selectedPush.length > 0
              ? selectedPush
              : muscleGroups.slice(0, Math.ceil(muscleGroups.length / 3));
          schedule["Day 5 - Pull"] =
            selectedPull.length > 0
              ? selectedPull
              : muscleGroups.slice(
                  Math.ceil(muscleGroups.length / 3),
                  Math.ceil((muscleGroups.length * 2) / 3)
                );
          schedule["Day 6 - Legs"] =
            selectedLegs.length > 0
              ? selectedLegs
              : muscleGroups.slice(Math.ceil((muscleGroups.length * 2) / 3));
        } else {
          // Fallback
          const chunkSize = Math.ceil(muscleGroups.length / 3);
          schedule["Day 1"] = muscleGroups.slice(0, chunkSize);
          schedule["Day 2"] = muscleGroups.slice(chunkSize, chunkSize * 2);
          schedule["Day 3"] = muscleGroups.slice(chunkSize * 2);
          schedule["Day 4"] = muscleGroups.slice(0, chunkSize);
          schedule["Day 5"] = muscleGroups.slice(chunkSize, chunkSize * 2);
          schedule["Day 6"] = muscleGroups.slice(chunkSize * 2);
        }
        break;

      case 7:
        // Full body split or specialized
        if (
          selectedPush.length > 0 &&
          selectedPull.length > 0 &&
          selectedLegs.length > 0
        ) {
          schedule["Day 1 - Push"] = selectedPush;
          schedule["Day 2 - Pull"] = selectedPull;
          schedule["Day 3 - Legs"] = selectedLegs;
          schedule["Day 4 - Push"] = selectedPush;
          schedule["Day 5 - Pull"] = selectedPull;
          schedule["Day 6 - Legs"] = selectedLegs;
          schedule["Day 7 - Core & Recovery"] = [...selectedCore];
        } else {
          // Assign each muscle group to a day or distribute evenly
          muscleGroups.forEach((muscle, index) => {
            const day = `Day ${(index % 7) + 1}`;
            if (!schedule[day]) schedule[day] = [];
            schedule[day].push(muscle);
          });
        }
        break;

      default:
        // Handle any other case
        muscleGroups.forEach((muscle, index) => {
          const day = `Day ${(index % daysPerWeek) + 1}`;
          if (!schedule[day]) schedule[day] = [];
          schedule[day].push(muscle);
        });
    }

    // Remove any empty days
    Object.keys(schedule).forEach((day) => {
      if (schedule[day].length === 0) {
        delete schedule[day];
      }
    });

    return schedule;
  };

  const generateWorkoutHandler = () => {
    console.log("Starting generateWorkoutHandler");
    console.log("Current preferences:", preferences);
    console.log("Current workoutVersions:", workoutVersions);

    try {
      // Validate preferences before generation
      if (!preferences.gender) {
        console.error("Missing gender");
        return;
      }
      if (!preferences.fitnessGoal) {
        console.error("Missing fitness goal");
        return;
      }
      if (!preferences.fitnessLevel) {
        console.error("Missing fitness level");
        return;
      }
      if (!preferences.equipment || preferences.equipment.length === 0) {
        console.error("No equipment selected");
        return;
      }
      if (
        !preferences.targetMuscles ||
        preferences.targetMuscles.length === 0
      ) {
        console.error("No target muscles selected");
        return;
      }

      if (workoutVersions.length < 3) {
        console.log("Generating new workout plan");
        const workoutPlan = generateWorkoutPlan(preferences);
        console.log("Generated workoutPlan:", workoutPlan);

        const trainingSchedule = generateTrainingSchedule(
          workoutPlan.targetMuscles,
          workoutPlan.workoutsPerWeek
        );
        console.log("Generated trainingSchedule:", trainingSchedule);

        workoutPlan.trainingSchedule = trainingSchedule;

        const sixWeekProgram = [];
        const basePlan = { ...workoutPlan };

        for (let week = 1; week <= 6; week++) {
          const weeklyPlan = { ...basePlan, week };

          if (week > 1) {
            weeklyPlan.exercises = weeklyPlan.exercises.map((ex) => ({
              ...ex,
              sets: Math.min(ex.sets + Math.floor((week - 1) / 2), 6),
              intensity: `${Math.min(
                parseInt(ex.intensity.split("-")[0] || "70") + (week - 1) * 5,
                95
              )}%`,
            }));
          }

          sixWeekProgram.push(weeklyPlan);
        }

        workoutPlan.sixWeekProgram = sixWeekProgram;

        const updatedVersions = [...workoutVersions, workoutPlan];
        console.log("Updated workout versions:", updatedVersions);

        setWorkoutVersions(updatedVersions);
        setCurrentVersionIndex(updatedVersions.length - 1);
        setWorkout(workoutPlan);
      } else {
        console.log("Cycling to next workout version");
        const nextIndex = (currentVersionIndex + 1) % workoutVersions.length;
        setCurrentVersionIndex(nextIndex);
        setWorkout(workoutVersions[nextIndex]);
      }

      setTimeout(() => {
        const workoutResults = document.getElementById("workout-results");
        if (workoutResults) {
          workoutResults.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (error) {
      console.error("Error in generateWorkoutHandler:", error);
    }
  };

  const cycleWorkoutVersion = () => {
    if (workoutVersions.length > 1) {
      const nextIndex = (currentVersionIndex + 1) % workoutVersions.length;
      setCurrentVersionIndex(nextIndex);
      setWorkout(workoutVersions[nextIndex]);
    }
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      handleStepValidation();
      return;
    }

    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      generateWorkoutHandler();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEquipmentChange = (equipment) => {
    if (equipment === "Select all") {
      if (preferences.equipment.includes("Select all")) {
        setPreferences({
          ...preferences,
          equipment: [],
        });
      } else {
        setPreferences({
          ...preferences,
          equipment: [
            "Select all",
            "Barbell",
            "Dumbbells",
            "Bodyweight",
            "Machine",
            "Kettlebells",
            "Cables",
          ],
        });
      }
      return;
    }

    // Remove 'Select all' if it's present
    const currentEquipment = preferences.equipment.filter(
      (e) => e !== "Select all"
    );

    // If the equipment is already selected, remove it
    if (currentEquipment.includes(equipment)) {
      setPreferences({
        ...preferences,
        equipment: currentEquipment.filter((e) => e !== equipment),
      });
    } else {
      // Add the new equipment
      setPreferences({
        ...preferences,
        equipment: [...currentEquipment, equipment],
      });
    }
  };

  const handleMuscleChange = (muscle) => {
    if (preferences.targetMuscles.includes(muscle)) {
      setPreferences({
        ...preferences,
        targetMuscles: preferences.targetMuscles.filter((m) => m !== muscle),
      });
    } else {
      setPreferences({
        ...preferences,
        targetMuscles: [...preferences.targetMuscles, muscle],
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaVenusMars className="mr-2 text-blue-500" /> Select Your Gender
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {["Male", "Female"].map((gender) => (
                <label
                  key={gender}
                  className={`
                    flex items-center justify-center p-6 rounded-lg cursor-pointer transition-all
                    ${
                      preferences.gender === gender
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={preferences.gender === gender}
                    onChange={() => setPreferences({ ...preferences, gender })}
                    className="sr-only"
                  />
                  {gender}
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaBirthdayCake className="mr-2 text-blue-500" /> Enter Your Age
            </h2>
            <div className="mb-4">
              <input
                type="number"
                min="13"
                max="100"
                value={preferences.age}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    age: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center text-xl"
              />
              <p className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                Please enter an age between 13 and 100
              </p>
            </div>

            <div className="mt-8">
              <input
                type="range"
                min="13"
                max="100"
                value={preferences.age}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    age: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>13</span>
                <span>100</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaRunning className="mr-2 text-blue-500" /> Select Your Fitness
              Goal
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Endurance",
                "Gain Strength",
                "Muscle Building",
                "Weight Loss",
              ].map((goal) => (
                <label
                  key={goal}
                  className={`
                      relative flex flex-col items-center justify-center p-6 rounded-lg cursor-pointer transition-all
                      ${
                        preferences.fitnessGoal === goal
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }
                    `}
                >
                  <input
                    type="radio"
                    name="fitnessGoal"
                    value={goal}
                    checked={preferences.fitnessGoal === goal}
                    onChange={() =>
                      setPreferences({ ...preferences, fitnessGoal: goal })
                    }
                    className="sr-only"
                  />
                  <div className="font-medium">{goal}</div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setViewingGoalInfo(goal);
                    }}
                    className={`mt-2 text-xs ${
                      preferences.fitnessGoal === goal
                        ? "text-white"
                        : "text-blue-500"
                    }`}
                  >
                    <FaInfoCircle /> More info
                  </button>
                </label>
              ))}
            </div>

            {viewingGoalInfo && (
              <div
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                onClick={() => setViewingGoalInfo(null)}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">{viewingGoalInfo}</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {fitnessGoalInfo[viewingGoalInfo]}
                  </p>
                  <button
                    onClick={() => setViewingGoalInfo(null)}
                    className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaUserAlt className="mr-2 text-blue-500" /> Select Your Fitness
              Level
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {["novice", "beginner", "intermediate", "advanced"].map(
                (level) => (
                  <label
                    key={level}
                    className={`
                    relative flex flex-col items-center justify-center p-6 rounded-lg cursor-pointer transition-all
                    ${
                      preferences.fitnessLevel === level
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                  >
                    <input
                      type="radio"
                      name="fitnessLevel"
                      value={level}
                      checked={preferences.fitnessLevel === level}
                      onChange={() =>
                        setPreferences({ ...preferences, fitnessLevel: level })
                      }
                      className="sr-only"
                    />
                    <div className="font-medium">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setViewingLevelInfo(level);
                      }}
                      className={`mt-2 text-xs ${
                        preferences.fitnessLevel === level
                          ? "text-white"
                          : "text-blue-500"
                      }`}
                    >
                      <FaInfoCircle /> More info
                    </button>
                  </label>
                )
              )}
            </div>

            {viewingLevelInfo && (
              <div
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                onClick={() => setViewingLevelInfo(null)}
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4 capitalize">
                    {viewingLevelInfo} Level
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {fitnessLevelInfo[viewingLevelInfo]}
                  </p>
                  <button
                    onClick={() => setViewingLevelInfo(null)}
                    className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-500" /> How Many Times Do
              You Want to Workout in a Week?
            </h2>
            <div className="mb-4">
              <div className="flex justify-center mb-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center p-1">
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={preferences.workoutsPerWeek}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 1 && value <= 7) {
                        setPreferences({
                          ...preferences,
                          workoutsPerWeek: value,
                        });
                      }
                    }}
                    className="w-16 bg-transparent text-center text-3xl font-bold p-2 focus:outline-none"
                  />
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    days / week
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() =>
                      setPreferences({ ...preferences, workoutsPerWeek: num })
                    }
                    className={`
                      flex items-center justify-center p-3 rounded-lg transition-all
                      ${
                        preferences.workoutsPerWeek === num
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                Select between 1 and 7 workouts per week
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaDumbbell className="mr-2 text-blue-500" /> Select Available
              Equipment
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Select all",
                "Barbell",
                "Dumbbells",
                "Bodyweight",
                "Machine",
                "Kettlebells",
                "Cables",
              ].map((equipment) => (
                <label
                  key={equipment}
                  className={`
                    flex items-center justify-center p-4 rounded-lg cursor-pointer transition-all
                    ${
                      preferences.equipment.includes(equipment)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={preferences.equipment.includes(equipment)}
                    onChange={() => handleEquipmentChange(equipment)}
                    className="sr-only"
                  />
                  {equipment}
                </label>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaWeightHanging className="mr-2 text-blue-500" /> Select Muscle
              Groups to Train
            </h2>
            {/* Add this preferences summary section */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-lg mb-3">
                Your Workout Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Gender:</span>{" "}
                  {preferences.gender}
                </div>
                <div>
                  <span className="font-medium">Age:</span> {preferences.age}
                </div>
                <div>
                  <span className="font-medium">Fitness Goal:</span>{" "}
                  {preferences.fitnessGoal}
                </div>
                <div>
                  <span className="font-medium">Fitness Level:</span>{" "}
                  {preferences.fitnessLevel}
                </div>
                <div>
                  <span className="font-medium">Workouts Per Week:</span>{" "}
                  {preferences.workoutsPerWeek}
                </div>
                <div>
                  <span className="font-medium">Equipment:</span>{" "}
                  {preferences.equipment.join(", ")}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-4 items-start"></div>

            <div className="flex flex-col md:flex-row gap-6 mt-4 items-start">
              {/* Muscle Diagram Container - Keep original size */}
              <div className="relative w-full max-w-md mx-auto md:mx-0 mb-6 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-center text-sm mb-2">
                  Click on the muscle groups you want to train
                </p>
                <div className="relative">
                  <img
                    key={preferences.gender} // Add key to force re-render when gender changes
                    src={
                      preferences.gender === "Male"
                        ? "/src/assets/titan.png"
                        : "/src/assets/female-titan.png"
                    }
                    alt={`${preferences.gender} Muscle Groups Diagram`}
                    className="w-full"
                  />

                  {/* Male Muscle Dots */}
                  {preferences.gender === "Male" && (
                    <>
                      {/* Chest - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Chest")}
                        className="absolute top-[20%] left-[10%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Chest") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Chest - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Chest")}
                        className="absolute top-[20%] left-[21%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Chest") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Back - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Back")}
                        className="absolute top-[29%] left-[68%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Back") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Back - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Back")}
                        className="absolute top-[29%] left-[78%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Back") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Shoulders */}
                      <div
                        onClick={() => handleMuscleChange("Shoulders")}
                        className="absolute top-[15%] left-[30%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Shoulders") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Left Shoulder - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Shoulders")}
                        className="absolute top-[15%] left-[2%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Shoulders") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Right Shoulder - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Shoulders")}
                        className="absolute top-[15%] left-[60%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Shoulders") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Right Shoulder - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Shoulders")}
                        className="absolute top-[15%] left-[88%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Shoulders") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Biceps */}
                      <div
                        onClick={() => handleMuscleChange("Biceps")}
                        className="absolute top-[26%] left-[3%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Biceps") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Right Bicep - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Biceps")}
                        className="absolute top-[26%] left-[30%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Biceps") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Triceps */}
                      <div
                        onClick={() => handleMuscleChange("Triceps")}
                        className="absolute top-[23%] left-[60%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Triceps") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Right Triceps - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Triceps")}
                        className="absolute top-[23%] left-[88%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Triceps") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Abs Area */}
                      <div
                        onClick={() => handleMuscleChange("Abs")}
                        className="absolute top-[25%] left-[13%] w-[15%] h-[29%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Abs") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Quads */}
                      <div
                        onClick={() => handleMuscleChange("Quads")}
                        className="absolute top-[52%] left-[8%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Quads") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Right Quads - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Quads")}
                        className="absolute top-[52%] left-[23%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Quads") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Hamstrings */}
                      <div
                        onClick={() => handleMuscleChange("Hamstrings")}
                        className="absolute top-[56%] left-[67%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Hamstrings") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Right Hamstrings - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Hamstrings")}
                        className="absolute top-[56%] left-[80%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Hamstrings") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Glutes */}
                      <div
                        onClick={() => handleMuscleChange("Glutes")}
                        className="absolute top-[43%] left-[69%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Glutes") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Right Glutes Dot */}
                      <div
                        onClick={() => handleMuscleChange("Glutes")}
                        className="absolute top-[43%] left-[77%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Glutes") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Calves */}
                      <div
                        onClick={() => handleMuscleChange("Calves")}
                        className="absolute top-[75%] left-[68%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Calves") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Right Calves - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Calves")}
                        className="absolute top-[75%] left-[80%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Calves") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Female Muscle Dots */}
                  {preferences.gender === "Female" && (
                    <>
                      {/* Chest - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Chest")}
                        className="absolute top-[20%] left-[15%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Chest") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Chest - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Chest")}
                        className="absolute top-[20%] left-[24%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Chest") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Back - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Back")}
                        className="absolute top-[12%] left-[66%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Back") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Back - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Back")}
                        className="absolute top-[12%] left-[72%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Back") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Shoulders - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Shoulders")}
                        className="absolute top-[14.5%] left-[58%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Shoulders") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Shoulders - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Shoulders")}
                        className="absolute top-[14.5%] left-[79%] w-[10%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Shoulders") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Biceps - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Biceps")}
                        className="absolute top-[24%] left-[9.5%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Biceps") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Biceps - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Biceps")}
                        className="absolute top-[24%] left-[32%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Biceps") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Triceps - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Triceps")}
                        className="absolute top-[22%] left-[58.5%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Triceps") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Triceps - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Triceps")}
                        className="absolute top-[22%] left-[81.5%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Triceps") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Abs - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Abs")}
                        className="absolute top-[20%] left-[17%] w-[15%] h-[29%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Abs") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[55%] h-[50%] rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Quads - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Quads")}
                        className="absolute top-[50%] left-[13%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Quads") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Quads - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Quads")}
                        className="absolute top-[50%] left-[25%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Quads") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Hamstrings - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Hamstrings")}
                        className="absolute top-[55%] left-[62.5%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Hamstrings") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Hamstrings - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Hamstrings")}
                        className="absolute top-[55%] left-[74.5%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Hamstrings") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Glutes - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Glutes")}
                        className="absolute top-[40%] left-[63.5%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Glutes") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Glutes - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Glutes")}
                        className="absolute top-[40%] left-[73.5%] w-[10%] h-[12%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Glutes") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Calves - First Dot */}
                      <div
                        onClick={() => handleMuscleChange("Calves")}
                        className="absolute top-[71%] left-[61.5%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Calves") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>

                      {/* Calves - Second Dot */}
                      <div
                        onClick={() => handleMuscleChange("Calves")}
                        className="absolute top-[71%] left-[77.5%] w-[8%] h-[10%] rounded-full cursor-pointer hover:bg-red-400 hover:bg-opacity-30"
                      >
                        {preferences.targetMuscles.includes("Calves") && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md"></div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Muscle Selection Buttons Container */}
              <div className="w-full md:w-auto md:flex-1">
                <p className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                  Select muscle groups:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Chest",
                    "Back",
                    "Shoulders",
                    "Biceps",
                    "Triceps",
                    "Abs",
                    "Quads",
                    "Hamstrings",
                    "Glutes",
                    "Calves",
                  ].map((muscle) => (
                    <label
                      key={muscle}
                      className={`
                    flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all text-sm
                    ${
                      preferences.targetMuscles.includes(muscle)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }
                  `}
                    >
                      <input
                        type="checkbox"
                        checked={preferences.targetMuscles.includes(muscle)}
                        onChange={() => handleMuscleChange(muscle)}
                        className="sr-only"
                      />
                      {muscle}
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => {
                    // Get all muscle names
                    const allMuscles = [
                      "Chest",
                      "Back",
                      "Shoulders",
                      "Biceps",
                      "Triceps",
                      "Abs",
                      "Quads",
                      "Hamstrings",
                      "Glutes",
                      "Calves",
                    ];

                    // If all muscles are already selected, deselect all
                    if (
                      allMuscles.every((muscle) =>
                        preferences.targetMuscles.includes(muscle)
                      )
                    ) {
                      setPreferences({
                        ...preferences,
                        targetMuscles: [],
                      });
                    } else {
                      // Otherwise select all
                      setPreferences({
                        ...preferences,
                        targetMuscles: allMuscles,
                      });
                    }
                  }}
                  className={`w-full mt-4 py-2 text-white rounded-md transition-colors ${
                    [
                      "Chest",
                      "Back",
                      "Shoulders",
                      "Biceps",
                      "Triceps",
                      "Abs",
                      "Quads",
                      "Hamstrings",
                      "Glutes",
                      "Calves",
                    ].every((muscle) =>
                      preferences.targetMuscles.includes(muscle)
                    )
                      ? "bg-red-500 hover:bg-red-600 text-white" // Red when "Deselect All Muscles"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"

                    // Blue when "Select All Muscles"
                  }`}
                >
                  {[
                    "Chest",
                    "Back",
                    "Shoulders",
                    "Biceps",
                    "Triceps",
                    "Abs",
                    "Quads",
                    "Hamstrings",
                    "Glutes",
                    "Calves",
                  ].every((muscle) =>
                    preferences.targetMuscles.includes(muscle)
                  )
                    ? "Deselect All Muscles"
                    : "Select All Muscles"}
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
        Personalized Workout Generator
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
        Create a custom workout plan tailored to your specific needs and goals
      </p>

      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <button
              key={step}
              onClick={() => {
                if (step < currentStep || validateCurrentStep()) {
                  setCurrentStep(step);
                } else {
                  handleStepValidation();
                }
              }}
              className={`text-xs font-medium cursor-pointer transition-all duration-200 px-2 py-1 ${
                currentStep >= step
                  ? "text-blue-500 font-bold"
                  : "text-gray-400 hover:text-gray-500"
              }`}
            >
              Step {step}
            </button>
          ))}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        {renderStep()}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrevStep}
            className={`px-6 py-2 rounded-lg transition-colors ${
              currentStep === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
            }`}
            disabled={currentStep === 1}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {currentStep === 7 ? "Generate Workout" : "Next"}
          </button>
        </div>
      </div>

      {showLoginPrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Login Required</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              You need to be logged in to save your personalized workout. Would
              you like to:
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create an Account
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {workout && (
        <div
          id="workout-results"
          className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">{workout.title}</h2>
            <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              ~{workout.duration} min
            </div>
          </div>

          {/* Add this where you display workout details */}
          {workout.ageAdjustments && workout.ageAdjustments.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h4 className="font-medium">Age-Specific Adjustments:</h4>
              <ul className="list-disc pl-5 mt-2">
                {workout.ageAdjustments.map((adjustment, index) => (
                  <li key={index} className="text-sm">
                    {adjustment}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add after the age adjustments section and before the exercise list */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Warmup Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-lg mb-2 flex items-center">
                <span className="mr-2">🔥</span> Warm-up
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {workout.warmup &&
                  workout.warmup.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Cooldown Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-lg mb-2 flex items-center">
                <span className="mr-2">❄️</span> Cool-down
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {workout.cooldown &&
                  workout.cooldown.map((item, index) => (
                    <li key={index} className="text-sm">
                      {item}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Workout Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "workout"
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("workout")}
              >
                Current Workout
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "program"
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => setActiveTab("program")}
              >
                6-Week Progression
              </button>
            </div>

            {activeTab === "workout" ? (
              <div className="space-y-6">
                <h3 className="text-lg font-medium mb-2">Main Workout</h3>

                {workout.trainingSchedule &&
                  Object.entries(workout.trainingSchedule).map(
                    ([day, muscles]) => (
                      <div
                        key={day}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-lg bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            {day} - {muscles.join(", ")}
                          </h4>
                          <button
                            onClick={() =>
                              setSelectedDayExercises(
                                workout.exercises.filter((exercise) =>
                                  muscles.includes(exercise.muscle)
                                )
                              )
                            }
                            className="text-blue-500 hover:text-blue-700 flex items-center"
                          >
                            <FaDumbbell className="mr-2" /> View Exercises
                          </button>
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  6-Week Progression Plan
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Week
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Focus
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Intensity
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          Changes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {workout.sixWeekProgram &&
                        workout.sixWeekProgram.map((weekPlan, index) => (
                          <tr
                            key={weekPlan.week}
                            className={
                              index % 2 === 0
                                ? ""
                                : "bg-gray-50 dark:bg-gray-800"
                            }
                          >
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-medium">
                              Week {weekPlan.week}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                              {weekPlan.week <= 2
                                ? "Form & Adaptation"
                                : weekPlan.week <= 4
                                ? "Progressive Overload"
                                : "Peak Intensity"}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                              {weekPlan.week === 1
                                ? "Base"
                                : `+${(weekPlan.week - 1) * 5}% intensity`}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                              {weekPlan.week === 1
                                ? "Starting point"
                                : weekPlan.week <= 3
                                ? "Focus on increasing reps"
                                : weekPlan.week <= 5
                                ? "Increase weight/resistance"
                                : "Max effort, full intensity"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedDayExercises && (
              <div
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedDayExercises(null);
                  }
                }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                  <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 mb-4">
                    <h3 className="text-xl font-bold text-center">
                      {/* Find the exact day name */}
                      {Object.entries(workout.trainingSchedule).find(
                        ([day, muscles]) =>
                          selectedDayExercises.every((ex) =>
                            muscles.includes(ex.muscle)
                          )
                      )?.[0] || "Day Exercises"}
                    </h3>
                    <button
                      onClick={() => setSelectedDayExercises(null)}
                      className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedDayExercises.map((exercise, exIndex) => (
                      <div
                        key={exIndex}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-shadow hover:shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium text-lg">
                            {exIndex + 1}. {exercise.name}
                          </h5>
                          <div className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                            {exercise.muscle}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="font-bold">Sets:</span>{" "}
                            {exercise.sets}
                          </div>
                          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="font-bold">Reps:</span>{" "}
                            {exercise.reps}
                          </div>
                          <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                            <span className="font-bold">Rest:</span>{" "}
                            {exercise.rest}s
                          </div>
                        </div>

                        <button
                          className="mt-3 text-blue-500 hover:text-blue-700 text-sm flex items-center"
                          onClick={() => {
                            setSelectedDayExercises(null);
                            setViewingExercise(exercise.name);
                          }}
                        >
                          <span className="mr-1">View Demonstration</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Week Details Section */}
                <div className="mt-6">
                  <h4 className="font-medium text-lg mb-3">Week Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 3, 6].map((weekNum) => {
                      const weekPlan = workout.sixWeekProgram?.find(
                        (p) => p.week === weekNum
                      );
                      if (!weekPlan) return null;

                      return (
                        <div
                          key={weekNum}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                        >
                          <h5 className="font-medium mb-2">Week {weekNum}</h5>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <p>
                              <span className="font-medium">Sets:</span>{" "}
                              {weekPlan.exercises[0].sets}
                            </p>
                            <p>
                              <span className="font-medium">Intensity:</span>{" "}
                              {weekPlan.exercises[0].intensity}
                            </p>
                            <p className="text-xs">
                              {weekNum === 1
                                ? "Focus on proper form and building a foundation"
                                : weekNum === 3
                                ? "Increase volume and begin pushing intensity"
                                : "Peak week - max effort for best results"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <FaPrint className="mr-2" /> Print Workout
            </button>

            <button
              onClick={saveWorkoutProgram}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <FaRegSave className="mr-2" /> Save Workout Program
            </button>
            {workoutVersions.length > 1 && (
              <button
                onClick={cycleWorkoutVersion}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                Show Different Workout ({currentVersionIndex + 1}/
                {workoutVersions.length})
              </button>
            )}
          </div>

          {showSuccess && (
            <div className="text-center mt-3 text-sm text-green-600 dark:text-green-500">
              Workout saved successfully to your Account!
            </div>
          )}
        </div>
      )}

      {viewingExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{viewingExercise}</h3>
              <button
                onClick={() => setViewingExercise(null)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {(() => {
              const asset = getExerciseAsset(
                viewingExercise,
                preferences.fitnessLevel || "beginner"
              );

              return (
                <>
                  <div className="mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={asset.src}
                      alt={`${viewingExercise} demonstration`}
                      className="w-full object-contain max-h-80"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex gap-2 mb-4">
                      <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                        {asset.muscleWorked}
                      </span>
                      <span className="text-sm bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                        {asset.difficulty}
                      </span>
                    </div>

                    <h4 className="font-bold mb-2">How to perform:</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {asset.description}
                    </p>
                  </div>
                </>
              );
            })()}

            <button
              onClick={() => setViewingExercise(null)}
              className="mt-6 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutGenerator;
