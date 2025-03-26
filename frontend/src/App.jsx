import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import ExploreMuscleGuide from "./pages/ExploreMuscleGuide";
import About from "./pages/About";
import WorkoutLog from "./pages/WorkoutLog";
import WorkoutHistory from "./pages/WorkoutHistory";
import WorkoutGenerator from "./pages/WorkoutGenerator";
import Routines from "./pages/Routines";
import AddExercise from "./pages/AddExercise";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SavedPrograms from "./pages/SavedPrograms";
import ProgramTracker from "./pages/ProgramTracker";
import ChangePassword from "./pages/ChangePassword";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./hooks/useTheme";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <Navbar />
        <Layout>
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
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/saved-programs" element={<SavedPrograms />} />
            <Route path="/program-tracker" element={<ProgramTracker />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
