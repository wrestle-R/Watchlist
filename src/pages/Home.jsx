import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clapperboard, Play, Star, Clock, Plus, ChevronRight, Heart, ListFilter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../firebase.config";

const MovieApp = () => {
  const [user, setUser] = useState(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("trending");
  const navigate = useNavigate();
  
  // Sample movie quotes
  const movieQuotes = [
    { quote: "May the Force be with you.", movie: "Star Wars", year: 1977 },
    { quote: "I'm going to make him an offer he can't refuse.", movie: "The Godfather", year: 1972 },
    { quote: "Here's looking at you, kid.", movie: "Casablanca", year: 1942 },
    { quote: "There's no place like home.", movie: "The Wizard of Oz", year: 1939 },
    { quote: "Life is like a box of chocolates, you never know what you're gonna get.", movie: "Forrest Gump", year: 1994 }
  ];
  
  // Sample trending movies
  const trendingMovies = [
    { id: 1, title: "Dune: Part Two", rating: 4.7, poster: "https://m.media-amazon.com/images/M/MV5BODI0YjNhNjUtYjM0My00MTUwLWFlYTMtMWI2NGUzYjNjNGQzXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg", year: 2024, category: "Sci-Fi" },
    { id: 2, title: "Poor Things", rating: 4.5, poster: "https://m.media-amazon.com/images/M/MV5BNGIyYWMzNjktNDE3MC00YWQyLWEyMmEtN2ZmNzZhZDk3NGJlXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_FMjpg_UX1000_.jpg", year: 2023, category: "Drama" },
    { id: 3, title: "Oppenheimer", rating: 4.8, poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg", year: 2023, category: "Biography" },
    { id: 4, title: "Past Lives", rating: 4.6, poster: "https://m.media-amazon.com/images/M/MV5BOTkzYmMxNTItZDAxNC00NGM0LWIyODMtMWYzMzRkMTU0ZGJhXkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_.jpg", year: 2023, category: "Romance" }
  ];
  
  // Sample recommended movies
  const recommendedMovies = [
    { id: 5, title: "The Holdovers", rating: 4.4, poster: "https://m.media-amazon.com/images/M/MV5BNDc2MzNkMjMtZDY5NC00NmQ0LWI1NjctZjRhNWIzZjc4MGRiXkEyXkFqcGdeQXVyMjkwOTAyMDU@._V1_.jpg", year: 2023, category: "Comedy-Drama" },
    { id: 6, title: "Killers of the Flower Moon", rating: 4.3, poster: "https://m.media-amazon.com/images/M/MV5BMjE4ZTZlNDAtM2Q3YS00YjFhLThjN2UtODg2ZGNlN2E2MWU2XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg", year: 2023, category: "Crime" },
    { id: 7, title: "The Boy and the Heron", rating: 4.5, poster: "https://m.media-amazon.com/images/M/MV5BZGFiZmMzNmUtZmQwMi00ZjlkLWJkMDEtMDliNGFmOGFjZDZjXkEyXkFqcGdeQXVyMTM1MDExOTE0._V1_.jpg", year: 2023, category: "Animation" },
    { id: 8, title: "Anatomy of a Fall", rating: 4.2, poster: "https://m.media-amazon.com/images/M/MV5BMDBiYmRkNjUtYzc4My00NGFiLWE2NWUtMGU1ZDA1NTQ3ZjAwXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", year: 2023, category: "Legal Drama" }
  ];
  
  // Sample watchlist movies
  const watchlistMovies = [
    { id: 9, title: "The Zone of Interest", rating: 4.1, poster: "https://m.media-amazon.com/images/M/MV5BNzNlMDJjYTQtYjYxNi00YWI0LWE2NTQtYjViMjZhZDZiYTRiXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg", year: 2023, category: "Historical Drama" },
    { id: 10, title: "American Fiction", rating: 4.0, poster: "https://m.media-amazon.com/images/M/MV5BMTY0NTY5OGItNmNmMS00ZDQ1LTliNTgtZWIwNzU2MmZiMmMxXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg", year: 2023, category: "Comedy-Drama" },
    { id: 11, title: "Fallen Leaves", rating: 3.9, poster: "https://m.media-amazon.com/images/M/MV5BZTFmNTBiMjktMTYyYy00YWU4LTgxNDYtMDQ2MzdiZmQ4ZjU0XkEyXkFqcGdeQXVyMTAyMjQ3NzQ1._V1_.jpg", year: 2023, category: "Romance" },
    { id: 12, title: "The Killer", rating: 3.8, poster: "https://m.media-amazon.com/images/M/MV5BZGJkMDUwZWQtYTMzMS00NTg5LWE1ZTYtOTVhMDI4NGI1YjMyXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg", year: 2023, category: "Thriller" }
  ];
  
  useEffect(() => {
    // Check actual user authentication
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    
    // Rotate quotes every 8 seconds
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % movieQuotes.length);
    }, 8000);
    
    // Handle scroll effect
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      unsubscribe();
      clearInterval(quoteInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Current quote
  const randomQuote = movieQuotes[currentQuoteIndex];
  
  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        setUser(null);
      })
      .catch(error => {
        console.error("Sign out error:", error);
      });
  };
  
  const getMoviesByTab = () => {
    switch(activeTab) {
      case "trending":
        return trendingMovies;
      case "recommended":
        return recommendedMovies;
      case "watchlist":
        return watchlistMovies;
      default:
        return trendingMovies;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Navbar */}
      <header className="relative z-50 mt-12">
        <AnimatePresence>
          {!scrolled ? (
            <motion.nav
              className="fixed top-0 left-0 right-0 z-50 py-4 bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-800"
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="flex items-center gap-2"
                  >
                    <Clapperboard size={24} className="text-red-600" />
                    <span className="text-xl font-bold text-white tracking-tighter">
                      Watchlist
                    </span>
                  </motion.div>

                  {/* Desktop Menu */}
                  <div className="hidden md:flex items-center space-x-4">
                    <Link to="/">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 rounded-full text-white"
                      >
                        Home
                      </motion.button>
                    </Link>
                    <Link to="/movies">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 rounded-full text-white"
                      >
                        Movies
                      </motion.button>
                    </Link>
                    {user ? (
                      <motion.button
                        onClick={handleSignOut}
                        className="px-4 py-2 rounded-full text-white bg-transparent border border-gray-700"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Sign Out
                      </motion.button>
                    ) : (
                      <Link to="/auth">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-full bg-red-600 text-white"
                        >
                          Sign In
                        </motion.button>
                      </Link>
                    )}
                  </div>

                  {/* Mobile Menu Toggle */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden text-white p-2"
                  >
                    {isMobileMenuOpen ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div 
                      className="md:hidden pt-4 pb-2 mt-2 space-y-3"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link to="/" className="block">
                        <motion.div whileHover={{ x: 5 }}>
                          <button className="block w-full px-4 py-2 rounded-md text-center text-white bg-gray-900">
                            Home
                          </button>
                        </motion.div>
                      </Link>
                      <Link to="/movies" className="block">
                        <motion.div whileHover={{ x: 5 }}>
                          <button className="block w-full px-4 py-2 rounded-md text-center text-white hover:bg-gray-900">
                            Movies
                          </button>
                        </motion.div>
                      </Link>
                      {user ? (
                        <motion.button
                          onClick={handleSignOut}
                          className="block w-full mt-4 px-4 py-2 rounded-md text-center text-white border border-gray-700"
                          whileHover={{ scale: 1.02 }}
                        >
                          Sign Out
                        </motion.button>
                      ) : (
                        <Link to="/auth" className="block">
                          <motion.div whileHover={{ scale: 1.02 }}>
                            <button className="block w-full mt-4 px-4 py-2 rounded-md text-center text-white bg-red-600 font-medium">
                              Sign In
                            </button>
                          </motion.div>
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.nav>
          ) : (
            <motion.div 
              className="fixed top-6 left-0 right-0 z-50 flex justify-center"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.nav 
                className="bg-black/90 backdrop-blur-sm shadow-lg rounded-full py-3 px-6 max-w-3xl mx-auto border border-gray-800"
                initial={{ width: "50%" }}
                animate={{ width: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between gap-6">
                  {/* Logo */}
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link to="/" className="text-base font-bold text-white tracking-tighter whitespace-nowrap flex items-center">
                      <Clapperboard size={22} strokeWidth={2} className="text-red-600" />
                    </Link>
                  </motion.div>

                  {/* Navigation */}
                  <div className="hidden md:flex items-center space-x-1">
                    <Link to="/">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 text-sm font-medium text-white rounded-full bg-gray-800"
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

                  {/* User Menu */}
                  <div className="hidden md:block">
                    {user ? (
                      <motion.button
                        onClick={handleSignOut}
                        className="px-3 py-1.5 text-sm font-medium text-white rounded-full hover:bg-gray-800"
                        whileHover={{ scale: 1.05 }}
                      >
                        Sign Out
                      </motion.button>
                    ) : (
                      <Link to="/auth">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-full"
                        >
                          Sign In
                        </motion.button>
                      </Link>
                    )}
                  </div>

                  {/* Mobile Menu Toggle */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden text-white"
                  >
                    {isMobileMenuOpen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Mobile Menu - Scrolled version */}
                <AnimatePresence>
                  {isMobileMenuOpen && (
                    <motion.div 
                      className="md:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black border border-gray-800 rounded-lg shadow-lg p-3 w-48"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to="/" className="block">
                        <button className="block w-full px-3 py-2 rounded-md text-center text-white bg-gray-800 text-sm">
                          Home
                        </button>
                      </Link>
                      <Link to="/movies" className="block">
                        <button className="block w-full px-3 py-2 rounded-md text-center text-white hover:bg-gray-800 text-sm mt-1">
                          Movies
                        </button>
                      </Link>
                      {user ? (
                        <button
                          onClick={handleSignOut}
                          className="block w-full mt-2 px-3 py-2 rounded-md text-center text-white border border-gray-700 text-sm"
                        >
                          Sign Out
                        </button>
                      ) : (
                        <Link to="/auth" className="block">
                          <button className="block w-full mt-2 px-3 py-2 rounded-md text-center text-white bg-red-600 text-sm font-medium">
                            Sign In
                          </button>
                        </Link>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Column */}
              <div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300">
                    {user ? `Welcome back, ${user.displayName || 'Movie Fan'}` : "Track Your Movie Journey"}
                  </h1>
                  
                  <p className="text-gray-400 text-lg mb-6">
                    Discover, track, and share your favorite films with the ultimate movie companion.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Link to="/movies">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg shadow-lg flex items-center gap-2"
                      >
                        <Play size={18} /> Explore Movies
                      </motion.button>
                    </Link>
                    {!user && (
                      <Link to="/auth">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg border border-gray-700 shadow-lg"
                        >
                          Sign In
                        </motion.button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              </div>
              
              {/* Right Column - Movie Quote Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-opacity-10 bg-gradient-to-br from-red-900/20 to-transparent"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Clapperboard size={28} className="text-red-600" />
                    <div className="flex gap-1">
                      {movieQuotes.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-1 rounded-full transition-all duration-300 ${
                            idx === currentQuoteIndex ? "w-8 bg-red-600" : "w-3 bg-gray-700"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuoteIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      <blockquote className="italic text-xl mb-3 font-medium leading-relaxed text-white">
                        "{randomQuote.quote}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <cite className="text-gray-400 text-sm not-italic block">
                          — {randomQuote.movie}
                        </cite>
                        <span className="text-gray-500 text-sm">{randomQuote.year}</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
              >
                <div className="bg-red-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600/30 transition-colors">
                  <Star className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Rate Films</h3>
                <p className="text-gray-400 mb-4">Keep track of your thoughts and share your ratings with friends.</p>
                <motion.button 
                  whileHover={{ x: 5 }}
                  className="flex items-center text-sm text-red-500 font-medium"
                >
                  Rate now <ChevronRight size={16} className="ml-1" />
                </motion.button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
              >
                <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Track Watchlist</h3>
                <p className="text-gray-400 mb-4">Never forget what to watch next. Organize your personal watchlist.</p>
                <motion.button 
                  whileHover={{ x: 5 }}
                  className="flex items-center text-sm text-blue-500 font-medium"
                >
                  View watchlist <ChevronRight size={16} className="ml-1" />
                </motion.button>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all group"
              >
                <div className="bg-green-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600/30 transition-colors">
                  <Heart className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold mb-2">Build Collection</h3>
                <p className="text-gray-400 mb-4">Create your personal film library and showcase your favorites.</p>
                <motion.button 
                  whileHover={{ x: 5 }}
                  className="flex items-center text-sm text-green-500 font-medium"
                >
                  Start collection <ChevronRight size={16} className="ml-1" />
                </motion.button>
              </motion.div>
            </div>
          </section>
          
          {/* Movie Section */}
          <section>
            <div className="mb-6 flex justify-between items-end">
              <h2 className="text-2xl md:text-3xl font-bold">
                {activeTab === "trending" && "Trending Now"}
                {activeTab === "recommended" && "Recommended for You"}
                {activeTab === "watchlist" && "Your Watchlist"}
              </h2>
              
            </div>
            
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveTab("trending")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "trending" 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-800 text-gray-300 hover:text-white"
                }`}
              >
                Trending
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveTab("recommended")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "recommended" 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-800 text-gray-300 hover:text-white"
                }`}
              >
                Recommended
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveTab("watchlist")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === "watchlist" 
                    ? "bg-red-600 text-white" 
                    : "bg-gray-800 text-gray-300 hover:text-white"
                }`}
              >
                Watchlist
              </motion.button>
            </div>
            
            {/* Movie Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {getMoviesByTab().map(movie => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: movie.id * 0.05 }}
                  className="group relative bg-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  {/* Poster Image */}
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                    <img 
                      src={movie.poster}
                      alt={movie.title} 
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-red-600 p-3 rounded-full"
                      >
                        <Play size={20} />
                      </motion.button>
                    </div>
                    
                    {/* Rating */}
                    <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-md text-xs font-medium z-20">
                      ★ {movie.rating}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    <h3 className="font-bold text-sm md:text-base line-clamp-1">{movie.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400 text-xs">{movie.year}</span>
                      <span className="text-gray-400 text-xs">{movie.category}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="text-xs text-white/80 hover:text-white bg-gray-800 px-2 py-1 rounded"
                      >
                        + Watchlist
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.2 }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Heart size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and Description */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clapperboard size={20} className="text-red-600" />
                <span className="text-lg font-bold text-white tracking-tighter">
                  Watchlist
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Your personal movie companion for discovering, tracking, and sharing your cinematic journey.
              </p>
              <div className="flex gap-3">
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.5 6.908v-.784c0-.395-.322-.716-.716-.716h-3.6l.478-1.856-.785-.202-.606 2.359h-6.74l.477-1.856-.784-.202-.607 2.359h-3.334c-.395 0-.716.321-.716.716v.784c0 .395.321.716.716.716h2.99l-1.29 5.008h-2.416c-.394 0-.716.322-.716.716v.784c0 .395.322.716.716.716h2.073l-.606 2.359.785.202.477-1.856h6.74l-.607 2.359.784.202.478-1.856h3.222c.394 0 .716-.321.716-.716v-.784c0-.394-.322-.716-.716-.716h-2.879l1.29-5.008h2.305c.394 0 .716-.321.716-.716zm-5.506 5.725h-6.739l1.29-5.009h6.739l-1.29 5.009z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-base font-bold mb-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="text-gray-400 hover:text-white text-sm text-left">Home</button>
                <button className="text-gray-400 hover:text-white text-sm text-left">Movies</button>
                <button className="text-gray-400 hover:text-white text-sm text-left">TV Shows</button>
                <button className="text-gray-400 hover:text-white text-sm text-left">Watchlist</button>
                <button className="text-gray-400 hover:text-white text-sm text-left">Coming Soon</button>
                <button className="text-gray-400 hover:text-white text-sm text-left">Top Rated</button>
              </div>
            </div>
            
            {/* Newsletter */}
            <div>
              <h4 className="text-base font-bold mb-4">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-3">
                Subscribe to receive updates on new releases and features.
              </p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-sm flex-grow focus:outline-none focus:border-red-600"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Watchlist . All rights reserved.
            </div>
            <div className="flex gap-4 text-sm">
              <button className="text-gray-400 hover:text-white">Privacy Policy</button>
              <button className="text-gray-400 hover:text-white">Terms of Service</button>
              <button className="text-gray-400 hover:text-white">Contact Us</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MovieApp;