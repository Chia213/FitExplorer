const translations = {
  en: {
    // Common
    settings: "Settings",
    save: "Save",
    saving: "Saving...",
    back: "Back",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    update: "Update",
    success: "Success",
    error: "Error",
    loading: "Loading...",
    
    // Settings
    account: "Account",
    notifications: "Notifications",
    language: "Language",
    selectLanguage: "Select Language",
    savePreferences: "Save Preferences",
    preferencesSaved: "Preferences saved successfully",
    
    // Profile
    profile: "Profile",
    username: "Username",
    email: "Email",
    password: "Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    changePassword: "Change Password",
    passwordChanged: "Password changed successfully",
    
    // Workout
    workout: "Workout",
    workouts: "Workouts",
    exercises: "Exercises",
    sets: "Sets",
    reps: "Reps",
    weight: "Weight",
    duration: "Duration",
    distance: "Distance",
    start: "Start",
    end: "End",
    complete: "Complete",
    saveWorkout: "Save Workout",
    
    // Stats
    statistics: "Statistics",
    currentStreak: "Current Streak",
    totalWorkouts: "Total Workouts",
    workoutFrequency: "Workout Frequency",
    workoutFrequencyGoal: "Workout Frequency Goal",
    dailyStreak: "Daily Streak",
    workoutsPerWeek: "workouts/week",
  },
  
  sv: {
    // Common
    settings: "Inställningar",
    save: "Spara",
    saving: "Sparar...",
    back: "Tillbaka",
    cancel: "Avbryt",
    confirm: "Bekräfta",
    delete: "Radera",
    edit: "Redigera",
    update: "Uppdatera",
    success: "Lyckades",
    error: "Fel",
    loading: "Laddar...",
    
    // Settings
    account: "Konto",
    notifications: "Notifieringar",
    language: "Språk",
    selectLanguage: "Välj Språk",
    savePreferences: "Spara Inställningar",
    preferencesSaved: "Inställningar sparades",
    
    // Profile
    profile: "Profil",
    username: "Användarnamn",
    email: "E-post",
    password: "Lösenord",
    currentPassword: "Nuvarande Lösenord",
    newPassword: "Nytt Lösenord",
    confirmPassword: "Bekräfta Lösenord",
    changePassword: "Ändra Lösenord",
    passwordChanged: "Lösenordet ändrades",
    
    // Workout
    workout: "Träning",
    workouts: "Träningar",
    exercises: "Övningar",
    sets: "Set",
    reps: "Reps",
    weight: "Vikt",
    duration: "Varaktighet",
    distance: "Distans",
    start: "Starta",
    end: "Sluta",
    complete: "Avsluta",
    saveWorkout: "Spara Träning",
    
    // Stats
    statistics: "Statistik",
    currentStreak: "Nuvarande Streak",
    totalWorkouts: "Totalt Antal Träningar",
    workoutFrequency: "Träningsfrekvens",
    workoutFrequencyGoal: "Träningsfrekvens Mål",
    dailyStreak: "Daglig Streak",
    workoutsPerWeek: "träningar/vecka",
  }
};

export const getTranslation = (key, language = 'en') => {
  return translations[language]?.[key] || translations['en'][key] || key;
};

export default translations; 