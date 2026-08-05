import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import DatasetPage from "./pages/Dataset/Dataset";
import Analytics from "./pages/Analytics/Analytics";
import Prediction from "./pages/Prediction/Prediction";
import Reports from "./pages/Reports/Reports";
import Presentation from "./pages/Presentation/Presentation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Presentation Mode Slide Deck */}
      <Route path="/presentation" element={<Presentation />} />
      
      {/* Protected Routes internally guarded by Layout context check */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dataset" element={<DatasetPage />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/prediction" element={<Prediction />} />
      <Route path="/reports" element={<Reports />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
