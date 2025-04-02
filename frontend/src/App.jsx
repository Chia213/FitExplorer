import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import PageTransition from "./components/PageTransition";
import ExploreMuscleGuide from "./pages/ExploreMuscleGuide";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
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
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./hooks/useTheme";

// Import Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminWorkouts from "./pages/admin/AdminWorkouts";
import AdminRoute from "./components/AdminRoute";

// Import all CSS files
import "./styles/design-system.css";
import "./styles/navHover.css";
import "./styles/page-transitions.css";
import "./styles/micro-interactions.css";
import "./styles/custom-scrollbar.css";
import "./styles/responsive-utilities.css";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Layout>
          <PageTransition>
            <Routes>
              <Route path="/" element={<WorkoutGenerator />} />
              <Route
                path="/explore-muscle-guide"
                element={<ExploreMuscleGuide />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/workout-log" element={<WorkoutLog />} />
              <Route path="/workout-history" element={<WorkoutHistory />} />
              <Route path="/routines" element={<Routines />} />
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
              <Route path="/privacy" element={<PrivacyPolicy />} />

              {/* Admin Routes with Protection */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/exercises"
                element={
                  <AdminRoute>
                    <AdminExercises />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/workouts"
                element={
                  <AdminRoute>
                    <AdminWorkouts />
                  </AdminRoute>
                }
              />
            </Routes>
          </PageTransition>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
