export interface User {
  id: number;
  email: string;
  username: string;
  is_admin?: boolean;
  created_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  is_cardio: boolean;
  initial_sets: number;
}

export interface Routine {
  id: number;
  name: string;
  exercises: Exercise[];
  folder_id?: number;
}

export interface Workout {
  id: number;
  routine_id: number;
  completed_at: string;
  exercises: {
    exercise_id: number;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string;
} 