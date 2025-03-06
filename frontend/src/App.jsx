import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import WorkoutLog from "./pages/WorkoutLog";
import WorkoutHistory from "./pages/WorkoutHistory";
import WorkoutGenerator from "./pages/WorkoutGenerator";
import Routines from "./pages/Routines";
import AddExercise from "./pages/AddExercise";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import { ThemeProvider } from "./hooks/useTheme";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <Navbar />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/workout-log" element={<WorkoutLog />} />
              <Route path="/workout-history" element={<WorkoutHistory />} />
              <Route path="/workout-generator" element={<WorkoutGenerator />} />
              <Route path="/routines" element={<Routines />} />
              <Route path="/add-exercise" element={<AddExercise />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
