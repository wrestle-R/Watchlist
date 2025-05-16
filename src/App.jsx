import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase.config";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Auth from "./pages/Auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
    
    if (!user) {
      return <Navigate to="/auth" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={
          <ProtectedRoute>
            <Movies />
          </ProtectedRoute>
        } />
        <Route path="/auth" element={user ? <Navigate to="/movies" replace /> : <Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;