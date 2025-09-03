import { BrowserRouter, Routes, Route, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import PageTransition from "./components/PageTransition";
import AdminRoute from "./components/AdminRoute";
import AuthRoute from "./components/AuthRoute";
import ScrollToTop from "./components/ScrollToTop";
import MobileBottomNav from "./components/MobileBottomNav";
import { NotificationProvider } from "./contexts/NotificationContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from 'react-hot-toast';

// Components
import HomePage from "./components/HomePage";

// Pagess
import ExploreMuscleGuide from "./pages/ExploreMuscleGuide";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ProgressTracker from "./pages/ProgressTracker";
import WorkoutLog from "./pages/WorkoutLog";
import WorkoutHistory from "./pages/WorkoutHistory";
import WorkoutGenerator from "./pages/WorkoutGenerator";
import AIWorkoutGenerator from "./pages/AIWorkoutGenerator";
import Routines from "./pages/Routines";
import AddExercise from "./pages/AddExercise";
import CustomExercises from "./pages/CustomExercises";
import CustomExercisesTest from "./pages/CustomExercisesTest";
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
import Faq from "./pages/Faq";
import FitnessCalculator from "./pages/FitnessCalculator";
import Settings from "./pages/Settings";
import Achievements from "./pages/Achievements";
import PersonalRecords from "./pages/PersonalRecords";
import Nutrition from "./pages/Nutrition";
import TestSearch from "./pages/TestSearch";
import MealTest from "./pages/MealTest";
import LandingPage from "./pages/LandingPage";

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
import "./styles/custom-exercises.css";

// Component to handle OAuth return in PWA mode
const OAuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if we're returning from an OAuth flow
    const isPwa = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone === true;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    console.log("OAuthHandler - checking for return path", {
      isPwa,
      isMobile,
      pathname: location.pathname,
      token: !!localStorage.getItem('access_token'),
      returnTo: localStorage.getItem('auth_return_to')
    });
    
    // Handle both PWA and mobile browser returns
    if (isPwa || isMobile) {
      // Check for access_token in localStorage that might have been set during login
      const token = localStorage.getItem('access_token');
      const returnTo = localStorage.getItem('auth_return_to');
      
      // If we have a token and return path, redirect to the return path
      if (token && returnTo && (location.pathname === '/login' || location.pathname === '/')) {
        console.log("OAuthHandler - redirecting to return path:", returnTo);
        localStorage.removeItem('auth_return_to'); // Clear the return path
        navigate(returnTo);
      }
    }
  }, [navigate, location]);
  
  return null; // This component doesn't render anything
};

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
                <OAuthHandler />
                <PageTransition>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/faq" element={<Faq />} />

                    {/* Protected Routes (require authentication) */}
                    <Route path="/workout-generator" element={<AuthRoute><WorkoutGenerator /></AuthRoute>} />
                    <Route path="/workout-log" element={<AuthRoute><WorkoutLog /></AuthRoute>} />
                    <Route path="/workout-history" element={<AuthRoute><WorkoutHistory /></AuthRoute>} />
                    <Route path="/ai-workout-generator" element={<AuthRoute><AIWorkoutGenerator /></AuthRoute>} />
                    <Route path="/routines" element={<AuthRoute><Routines /></AuthRoute>} />
                    <Route path="/custom-exercises" element={<AuthRoute><CustomExercises /></AuthRoute>} />
                    <Route path="/custom-exercises-test" element={<AuthRoute><CustomExercisesTest /></AuthRoute>} />
                    <Route path="/explore-muscle-guide" element={<AuthRoute><ExploreMuscleGuide /></AuthRoute>} />
                    <Route path="/progress-tracker" element={<AuthRoute><ProgressTracker /></AuthRoute>} />
                    <Route path="/add-exercise" element={<AuthRoute><AddExercise /></AuthRoute>} />
                    <Route path="/confirm-deletion" element={<AuthRoute><ConfirmDeletion /></AuthRoute>} />
                    <Route path="/profile" element={<AuthRoute><Profile /></AuthRoute>} />
                    <Route path="/saved-programs" element={<AuthRoute><SavedPrograms /></AuthRoute>} />
                    <Route path="/program-tracker" element={<AuthRoute><ProgramTracker /></AuthRoute>} />
                    <Route path="/change-password" element={<AuthRoute><ChangePassword /></AuthRoute>} />
                    <Route path="/notifications" element={<AuthRoute><Notifications /></AuthRoute>} />
                    <Route path="/fitness-calculator" element={<AuthRoute><FitnessCalculator /></AuthRoute>} />
                    <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>} />
                    <Route path="/achievements" element={<AuthRoute><Achievements /></AuthRoute>} />
                    <Route path="/personal-records" element={<AuthRoute><PersonalRecords /></AuthRoute>} />
                    <Route path="/nutrition" element={<AuthRoute><Nutrition /></AuthRoute>} />
                    <Route path="/test-search" element={<AuthRoute><TestSearch /></AuthRoute>} />
                    <Route path="/meal-test" element={<AuthRoute><MealTest /></AuthRoute>} />
                    
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
              <MobileBottomNav />
              <Toaster position="bottom-center" toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                  maxWidth: '500px',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#EF4444',
                  },
                },
              }} />
            </div>
          </NotificationProvider>
        </WelcomeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
