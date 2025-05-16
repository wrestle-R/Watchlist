import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../firebase.config";
import { initializeUserData } from "../utils/firebase";
import { Clapperboard } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      // Initialize the user's data in Firestore
      await initializeUserData(result.user.uid);
      navigate("/movies");
    } catch (error) {
      console.error("Google authentication error:", error);
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-black text-white">
      {/* Navigation bar matching Home.jsx */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <div className="bg-black/90 backdrop-blur-sm shadow-lg rounded-full py-3 px-6 max-w-3xl mx-auto border border-gray-800">
          <div className="flex items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Clapperboard size={24} className="text-red-600" />
              <span className="text-xl font-bold text-white tracking-tighter">
                Watchlist
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 rounded-full"
                >
                  Home
                </motion.button>
              </Link>
              <Link to="/movies">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 rounded-full"
                >
                  Movies
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-xl"
        >
          <h2 className="text-3xl font-bold text-white mb-2 text-center">Movie Watchlist</h2>
          <p className="text-gray-400 text-center mb-8">Sign in to track your favorite films</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="px-8 py-4 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
              {loading ? "Authenticating..." : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </motion.button>
          </div>
          
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-gray-800 flex-1"></div>
              <span className="text-gray-400 text-sm">OR</span>
              <div className="h-px bg-gray-800 flex-1"></div>
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>
              By continuing, you agree to our{" "}
              <a href="#" className="text-white hover:text-red-500 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-white hover:text-red-500 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-gray-800 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-3 md:mb-0">
            <Clapperboard size={20} className="text-red-600" />
            <span className="text-lg font-bold text-white tracking-tighter">
              Watchlist
            </span>
          </div>
          
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Wacthlist. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Login;