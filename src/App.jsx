import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import WorkoutLog from "./pages/WorkoutLog";
import AddExercise from "./pages/AddExercise";

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-gray-100 text-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/workout-log" element={<WorkoutLog />} />
          <Route path="/add-exercise" element={<AddExercise />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
