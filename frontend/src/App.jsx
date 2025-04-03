import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import PageTransition from "./components/PageTransition";
import AdminRoute from "./components/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";
// Import NotificationProvider
import { NotificationProvider } from "./contexts/NotificationContext";

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

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminWorkouts from "./pages/admin/AdminWorkouts";

// Context providers
import { ThemeProvider } from "./hooks/useTheme";
import { WelcomeProvider } from "./contexts/WelcomeContext";
import WelcomeBackModal from "./components/WelcomeBackModal";
import { useWelcome } from "./contexts/WelcomeContext";

// Import all CSS files
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
    <Router>
      <ThemeProvider>
        <WelcomeProvider>
          <NotificationProvider>
            <ScrollToTop />
            <Navbar />
            <Layout>
              <PageTransition>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<WorkoutGenerator />} />
                  <Route path="/explore-muscle-guide" element={<ExploreMuscleGuide />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  
                  {/* New Pages */}
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/fitness-calculator" element={<FitnessCalculator />} />
                  
                  {/* User Routes - These should be protected but we'll leave them open for now */}
                  <Route path="/progress-tracker" element={<ProgressTracker />} />
                  <Route path="/workout-log" element={<WorkoutLog />} />
                  <Route path="/workout-history" element={<WorkoutHistory />} />
                  <Route path="/routines" element={<Routines />} />
                  <Route path="/add-exercise" element={<AddExercise />} />
                  <Route path="/confirm-deletion" element={<ConfirmDeletion />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/saved-programs" element={<SavedPrograms />} />
                  <Route path="/program-tracker" element={<ProgramTracker />} />
                  <Route path="/change-password" element={<ChangePassword />} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/exercises" element={<AdminExercises />} />
                  <Route path="/admin/workouts" element={<AdminWorkouts />} />
                </Routes>
              </PageTransition>
            </Layout>

            {/* Welcome Back Modal */}
            <WelcomeModalWrapper />
          </NotificationProvider>
        </WelcomeProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;