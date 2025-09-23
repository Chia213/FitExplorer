import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

class OfflineStorageService {
  constructor() {
    this.db = SQLite.openDatabase('fitexplorer.db');
    this.initializeDatabase();
  }

  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        // Create workouts table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS workouts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            exercises TEXT NOT NULL,
            startTime TEXT,
            endTime TEXT,
            caloriesBurned INTEGER DEFAULT 0,
            notes TEXT,
            synced INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // Create exercises table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS exercises (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT,
            instructions TEXT,
            muscleGroups TEXT,
            equipment TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // Create user_progress table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_progress (
            id TEXT PRIMARY KEY,
            workoutId TEXT,
            exerciseId TEXT,
            sets INTEGER,
            reps INTEGER,
            weight REAL,
            duration INTEGER,
            distance REAL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workoutId) REFERENCES workouts (id),
            FOREIGN KEY (exerciseId) REFERENCES exercises (id)
          );`
        );
      }, reject, resolve);
    });
  }

  // Workout methods
  async saveWorkout(workout) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO workouts 
           (id, name, exercises, startTime, endTime, caloriesBurned, notes, synced)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            workout.id,
            workout.name,
            JSON.stringify(workout.exercises),
            workout.startTime,
            workout.endTime,
            workout.caloriesBurned || 0,
            workout.notes || '',
            0 // Not synced yet
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getWorkouts() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM workouts ORDER BY createdAt DESC',
          [],
          (_, { rows }) => {
            const workouts = rows._array.map(row => ({
              ...row,
              exercises: JSON.parse(row.exercises)
            }));
            resolve(workouts);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async getUnsyncedWorkouts() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM workouts WHERE synced = 0',
          [],
          (_, { rows }) => {
            const workouts = rows._array.map(row => ({
              ...row,
              exercises: JSON.parse(row.exercises)
            }));
            resolve(workouts);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async markWorkoutAsSynced(workoutId) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE workouts SET synced = 1 WHERE id = ?',
          [workoutId],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Exercise methods
  async saveExercise(exercise) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO exercises 
           (id, name, category, instructions, muscleGroups, equipment)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            exercise.id,
            exercise.name,
            exercise.category || '',
            exercise.instructions || '',
            JSON.stringify(exercise.muscleGroups || []),
            exercise.equipment || ''
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getExercises() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM exercises ORDER BY name',
          [],
          (_, { rows }) => {
            const exercises = rows._array.map(row => ({
              ...row,
              muscleGroups: JSON.parse(row.muscleGroups)
            }));
            resolve(exercises);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Progress methods
  async saveProgress(progress) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO user_progress 
           (id, workoutId, exerciseId, sets, reps, weight, duration, distance)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            progress.id,
            progress.workoutId,
            progress.exerciseId,
            progress.sets || 0,
            progress.reps || 0,
            progress.weight || 0,
            progress.duration || 0,
            progress.distance || 0
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getProgress(workoutId) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM user_progress WHERE workoutId = ?',
          [workoutId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Utility methods
  async clearAllData() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql('DELETE FROM workouts');
        tx.executeSql('DELETE FROM exercises');
        tx.executeSql('DELETE FROM user_progress');
      }, reject, resolve);
    });
  }

  async getStorageStats() {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) as workoutCount FROM workouts',
          [],
          (_, { rows }) => {
            const workoutCount = rows._array[0].workoutCount;
            tx.executeSql(
              'SELECT COUNT(*) as exerciseCount FROM exercises',
              [],
              (_, { rows }) => {
                const exerciseCount = rows._array[0].exerciseCount;
                resolve({ workoutCount, exerciseCount });
              }
            );
          }
        );
      });
    });
  }
}

export default new OfflineStorageService();
