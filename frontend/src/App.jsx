import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import PageTransition from "./components/PageTransition";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import { NotificationProvider } from "./contexts/NotificationContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Pages
import ExploreMuscleGuide from "./pages/ExploreMuscleGuide";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProgressTracker from "./pages/ProgressTracker";
import WorkoutLog from "./pages/WorkoutLog";
import WorkoutHistory from "./pages/WorkoutHistory";
import WorkoutGenerator from "./pages/WorkoutGenerator";
import Routines from "./pages/Routines";
import AddExercise from "./pages/AddExercise";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import ConfirmDeletion from "./pages/ConfirmDeletion";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SavedPrograms from "./pages/SavedPrograms";
import ProgramTracker from "./pages/ProgramTracker";
import ChangePassword from "./pages/ChangePassword";
import Notifications from "./pages/Notifications";
import FAQ from "./pages/FAQ";
import FitnessCalculator from "./pages/FitnessCalculator";
import Settings from "./pages/Settings";
import Achievements from "./pages/Achievements";
import PersonalRecords from "./pages/PersonalRecords";
import Nutrition from "./pages/Nutrition";
import TestSearch from "./pages/TestSearch";
import MealTest from "./pages/MealTest";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminWorkouts from "./pages/admin/AdminWorkouts";
import AdminSettings from "./pages/admin/AdminSettings";

// Context providers
import { ThemeProvider } from "./hooks/useTheme";
import { WelcomeProvider } from "./contexts/WelcomeContext";
import WelcomeBackModal from "./components/WelcomeBackModal";
import { useWelcome } from "./contexts/WelcomeContext";

// Import CSS files
import "./styles/design-system.css";
import "./styles/navHover.css";
import "./styles/micro-interactions.css";
import "./styles/custom-scrollbar.css";
import "./styles/responsive-utilities.css";

// WelcomeModalWrapper component to manage the welcome modal
const WelcomeModalWrapper = () => {
  const {
    showWelcomeModal,
    closeWelcomeModal,
    userData,
    isFirstLogin,
    isInitialized,
  } = useWelcome();

  if (!showWelcomeModal || !userData || !isInitialized) return null;

  return (
    <WelcomeBackModal
      username={userData.username}
      onClose={closeWelcomeModal}
      isFirstLogin={isFirstLogin}
    />
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WelcomeProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Navbar />
              <Layout>
                <ScrollToTop />
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<WorkoutGenerator />} />
                    <Route path="/workout-log" element={<WorkoutLog />} />
                    <Route path="/workout-history" element={<WorkoutHistory />} />
                    <Route path="/routines" element={<Routines />} />
                    <Route path="/explore-muscle-guide" element={<ExploreMuscleGuide />} />
                    <Route path="/progress-tracker" element={<ProgressTracker />} />
                    <Route path="/add-exercise" element={<AddExercise />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/confirm-deletion" element={<ConfirmDeletion />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/saved-programs" element={<SavedPrograms />} />
                    <Route path="/program-tracker" element={<ProgramTracker />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/fitness-calculator" element={<FitnessCalculator />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/personal-records" element={<PersonalRecords />} />
                    <Route path="/nutrition" element={<Nutrition />} />
                    <Route path="/test-search" element={<TestSearch />} />
                    <Route path="/meal-test" element={<MealTest />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                    <Route path="/admin/exercises" element={<AdminRoute><AdminExercises /></AdminRoute>} />
                    <Route path="/admin/workouts" element={<AdminRoute><AdminWorkouts /></AdminRoute>} />
                    <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                  </Routes>
                </PageTransition>
              </Layout>
              <WelcomeModalWrapper />
            </div>
          </NotificationProvider>
        </WelcomeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;