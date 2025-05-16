import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase.config";
import NavbarComponent from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import Card from "../components/Card";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { 
  fetchUserMovies, 
  addMovieToCategory as addMovieToCategoryFirebase,
  moveMovie as moveMovieFirebase,
  removeMovie as removeMovieFirebase,
  CATEGORIES 
} from "../utils/firebase";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

const Movies = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(CATEGORIES.WATCHLIST);
  const [movies, setMovies] = useState({
    [CATEGORIES.WATCHLIST]: [],
    [CATEGORIES.WATCHING]: [],
    [CATEGORIES.WATCHED]: []
  });
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Function to fetch user movies safely
  const fetchMovies = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the user's movie lists from Firestore
      const userMovies = await fetchUserMovies(userId);
      
      // Ensure all categories exist even if Firestore doesn't have them
      const updatedMovies = {
        [CATEGORIES.WATCHLIST]: userMovies[CATEGORIES.WATCHLIST] || [],
        [CATEGORIES.WATCHING]: userMovies[CATEGORIES.WATCHING] || [],
        [CATEGORIES.WATCHED]: userMovies[CATEGORIES.WATCHED] || []
      };
      
      setMovies(updatedMovies);
    } catch (error) {
      console.error("Error fetching user movies:", error);
      setError("Failed to load your movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchMovies(currentUser.uid);
      } else {
        navigate("/auth");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const addToCategory = async (movie, category) => {
    try {
      if (!user) return;
      
      // Check if movie is already in the category
      if (movies[category].some(m => m.id === movie.id)) {
        // Show a toast notification that movie is already in the list
        toast.custom((t) => (
          <div className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-700 p-4`}>
            <div className="flex-1 w-0 flex items-center">
              <Info className="h-6 w-6 text-blue-400" />
              <p className="ml-3 text-sm font-medium text-white">
                "{movie.title}" is already in your {category.toLowerCase()}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ), { duration: 3000 });
        return;
      }
      
      // Add to Firestore
      await addMovieToCategoryFirebase(user.uid, movie, category);
      
      // Update local state
      setMovies(prev => ({
        ...prev,
        [category]: [...prev[category], {
          ...movie,
          addedAt: new Date().toISOString()
        }]
      }));
      
      // Remove from search results
      setSearchResults(prev => prev.filter(m => m.id !== movie.id));
      
      // Show success toast
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-green-700 p-4`}>
          <div className="flex-1 w-0 flex items-center">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <p className="ml-3 text-sm font-medium text-white">
              Added "{movie.title}" to your {category.toLowerCase()}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ), { duration: 3000 });
    } catch (error) {
      console.error(`Error adding movie to ${category}:`, error);
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-red-700 p-4`}>
          <div className="flex-1 w-0 flex items-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <p className="ml-3 text-sm font-medium text-white">
              Failed to add movie to {category}. Please try again.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ), { duration: 4000 });
    }
  };

  const moveMovie = async (movie, fromCategory, toCategory) => {
    try {
      if (!user) return;
      
      // Update Firestore
      await moveMovieFirebase(user.uid, movie, fromCategory, toCategory);
      
      // Update local state
      setMovies(prev => ({
        ...prev,
        [fromCategory]: prev[fromCategory].filter(m => m.id !== movie.id),
        [toCategory]: [...prev[toCategory], {
          ...movie,
          addedAt: new Date().toISOString()
        }]
      }));
      
      // Show success toast
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-green-700 p-4`}>
          <div className="flex-1 w-0 flex items-center">
            <CheckCircle className="h-6 w-6 text-green-400" />
            <p className="ml-3 text-sm font-medium text-white">
              Moved "{movie.title}" to {toCategory.toLowerCase()}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ), { duration: 3000 });
    } catch (error) {
      console.error(`Error moving movie from ${fromCategory} to ${toCategory}:`, error);
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-red-700 p-4`}>
          <div className="flex-1 w-0 flex items-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <p className="ml-3 text-sm font-medium text-white">
              Failed to move movie. Please try again.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ), { duration: 4000 });
    }
  };

  const removeMovie = async (movieObj, category) => {
    try {
      if (!user) return;
      
      // Remove from Firestore
      await removeMovieFirebase(user.uid, movieObj, category);
      
      // Update local state
      setMovies(prev => ({
        ...prev,
        [category]: prev[category].filter(m => m.id !== movieObj.id)
      }));
      
      // Show remove toast
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-amber-700 p-4`}>
          <div className="flex-1 w-0 flex items-center">
            <Info className="h-6 w-6 text-amber-400" />
            <p className="ml-3 text-sm font-medium text-white">
              Removed "{movieObj.title}" from your {category.toLowerCase()}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ), { duration: 3000 });
    } catch (error) {
      console.error(`Error removing movie from ${category}:`, error);
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-red-700 p-4`}>
          <div className="flex-1 w-0 flex items-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <p className="ml-3 text-sm font-medium text-white">
              Failed to remove movie. Please try again.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ), { duration: 4000 });
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <NavbarComponent user={user}/>
      <Toaster position="top-right" />

      <section className="pt-28 px-4 pb-20 max-w-6xl mx-auto flex-grow">
        <SearchBar onSearchResults={handleSearchResults} />

        {/* Remove the error div since we're using toast notifications instead */}
        
        {searchResults.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {searchResults.map((movie, index) => (
                <motion.div 
                  key={movie.id} 
                  className="h-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    movie={movie}
                    actions={
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => addToCategory(movie, CATEGORIES.WATCHLIST)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                        >
                          + Add to Watchlist
                        </button>
                        <button 
                          onClick={() => addToCategory(movie, CATEGORIES.WATCHING)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                        >
                          + Currently Watching
                        </button>
                        <button 
                          onClick={() => addToCategory(movie, CATEGORIES.WATCHED)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                        >
                          + Watched
                        </button>
                      </div>
                    }
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex border-b border-gray-800 mb-6">
            <motion.button
              onClick={() => setActiveTab(CATEGORIES.WATCHLIST)}
              className={`px-4 py-2 font-medium relative ${
                activeTab === CATEGORIES.WATCHLIST
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              whileHover={{ scale: activeTab !== CATEGORIES.WATCHLIST ? 1.05 : 1 }}
            >
              Watchlist ({movies[CATEGORIES.WATCHLIST].length})
              {activeTab === CATEGORIES.WATCHLIST && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                  layoutId="activeTabIndicator"
                />
              )}
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab(CATEGORIES.WATCHING)}
              className={`px-4 py-2 font-medium relative ${
                activeTab === CATEGORIES.WATCHING
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              whileHover={{ scale: activeTab !== CATEGORIES.WATCHING ? 1.05 : 1 }}
            >
              Currently Watching ({movies[CATEGORIES.WATCHING].length})
              {activeTab === CATEGORIES.WATCHING && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                  layoutId="activeTabIndicator"
                />
              )}
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab(CATEGORIES.WATCHED)}
              className={`px-4 py-2 font-medium relative ${
                activeTab === CATEGORIES.WATCHED
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              whileHover={{ scale: activeTab !== CATEGORIES.WATCHED ? 1.05 : 1 }}
            >
              Watched ({movies[CATEGORIES.WATCHED].length})
              {activeTab === CATEGORIES.WATCHED && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                  layoutId="activeTabIndicator"
                />
              )}
            </motion.button>
          </div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
            layout
          >
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden animate-pulse">
                  <div className="w-full aspect-[2/3] bg-gray-800"></div>
                  <div className="p-3">
                    <div className="h-5 bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-800 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-800 rounded"></div>
                      <div className="h-6 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : movies[activeTab].map((movie, index) => (
              <motion.div 
                key={movie.id} 
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  movie={movie} 
                  actions={
                    <div className="flex flex-col gap-1">
                      {activeTab === CATEGORIES.WATCHLIST && (
                        <>
                          <button 
                            onClick={() => moveMovie(movie, CATEGORIES.WATCHLIST, CATEGORIES.WATCHING)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                          >
                            → Move to Watching
                          </button>
                          <button 
                            onClick={() => moveMovie(movie, CATEGORIES.WATCHLIST, CATEGORIES.WATCHED)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                          >
                            → Move to Watched
                          </button>
                        </>
                      )}
                      {activeTab === CATEGORIES.WATCHING && (
                        <>
                          <button 
                            onClick={() => moveMovie(movie, CATEGORIES.WATCHING, CATEGORIES.WATCHLIST)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                          >
                            → Move to Watchlist
                          </button>
                          <button 
                            onClick={() => moveMovie(movie, CATEGORIES.WATCHING, CATEGORIES.WATCHED)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                          >
                            → Mark as Watched
                          </button>
                        </>
                      )}
                      {activeTab === CATEGORIES.WATCHED && (
                        <>
                          <button 
                            onClick={() => moveMovie(movie, CATEGORIES.WATCHED, CATEGORIES.WATCHING)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                          >
                            → Move to Watching
                          </button>
                          <button 
                            onClick={() => moveMovie(movie, CATEGORIES.WATCHED, CATEGORIES.WATCHLIST)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-white/80 hover:text-white py-1 px-2 rounded transition-colors"
                          >
                            → Move to Watchlist
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => removeMovie(movie, activeTab)}
                        className="text-xs bg-red-600/10 hover:bg-red-600/20 text-red-500 py-1 px-2 rounded mt-1 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  }
                />
              </motion.div>
            ))}
            {!loading && movies[activeTab].length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-400">
                <p>No movies in this category yet.</p>
                <p className="mt-2">Search for movies to add them!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Watchlist. All rights reserved.
          </div>
          <div className="flex gap-4 text-sm">
            <button className="text-gray-400 hover:text-white">Privacy Policy</button>
            <button className="text-gray-400 hover:text-white">Terms of Service</button>
            <button className="text-gray-400 hover:text-white">Contact Us</button>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Movies;
