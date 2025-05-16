import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { auth } from "../firebase.config";
import { saveSearchQuery } from "../utils/searchHistory";
import { motion } from "framer-motion";

const SearchBar = ({ onSearchResults }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const suggestionsRef = useRef(null);
  const [allMovies, setAllMovies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for suggestions when user stops typing
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout
    setTypingTimeout(
      setTimeout(() => {
        fetchSuggestions(query);
      }, 500)
    );

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [query]);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const apiKey = import.meta.env.VITE_OMDB_API_KEY;
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchQuery)}&type=movie`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();

      if (data.Response === "True" && data.Search) {
        // Limit to 5 suggestions
        const formattedSuggestions = data.Search.slice(0, 5).map((movie) => ({
          id: movie.imdbID,
          title: movie.Title,
          year: movie.Year,
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Suggestion error:", error);
      setSuggestions([]);
    }
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const apiKey = import.meta.env.VITE_OMDB_API_KEY;
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}&type=movie`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movies (HTTP status: ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.Response === "False") {
        if (data.Error === "Movie not found!") {
          setError(`No movies found for "${query}". Try a different search term.`);
        } else {
          setError(data.Error || "No movies found");
        }
        onSearchResults([]);
        return;
      }
      
      if (!data.Search || data.Search.length === 0) {
        setError(`No results for "${query}"`);
        onSearchResults([]);
        return;
      }
      
      // Get the search results
      const results = data.Search;
      
      // Fetch additional details for each movie (in parallel)
      const moviesWithDetails = await Promise.all(
        results.map(async (movie) => {
          try {
            // Get more details for each movie
            const detailsResponse = await fetch(
              `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`
            );
            
            if (!detailsResponse.ok) {
              throw new Error(`Failed to fetch details for ${movie.Title}`);
            }
            
            const details = await detailsResponse.json();
            
            return {
              id: movie.imdbID,
              title: movie.Title,
              year: movie.Year,
              posterUrl: movie.Poster !== "N/A" 
                ? movie.Poster 
                : `https://via.placeholder.com/150x225?text=${encodeURIComponent(movie.Title)}`,
              imdbRating: details.imdbRating !== "N/A" ? details.imdbRating : null,
              genre: details.Genre !== "N/A" ? details.Genre : null,
              type: details.Type || movie.Type,
            };
          } catch (error) {
            // If details fetch fails, return basic info
            console.warn(`Failed to fetch details for movie ${movie.Title}:`, error);
            return {
              id: movie.imdbID,
              title: movie.Title,
              year: movie.Year,
              posterUrl: movie.Poster !== "N/A" 
                ? movie.Poster 
                : `https://via.placeholder.com/150x225?text=${encodeURIComponent(movie.Title)}`,
              type: movie.Type,
            };
          }
        })
      );
      
      // Only proceed if we have movies with details
      if (moviesWithDetails.length === 0) {
        setError("Could not retrieve movie details. Please try again.");
        onSearchResults([]);
        return;
      }
      
      // Store all movies but only show limited number initially
      setAllMovies(moviesWithDetails);
      setVisibleCount(5); // Reset visible count when performing a new search
      
      // Only pass a limited number of movies to parent component initially
      onSearchResults(moviesWithDetails.slice(0, visibleCount));

      // Save search query to Firestore if user is logged in - wrapped in try/catch to prevent errors from affecting search functionality
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // We'll await this but wrap in try/catch to prevent it from affecting the main flow
          await saveSearchQuery(currentUser.uid, query, moviesWithDetails.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.year
          })));
        }
      } catch (saveError) {
        // This is a non-critical error, so we just log it but don't affect the user experience
        console.warn("Failed to save search history:", saveError);
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message || "An unexpected error occurred. Please try again.");
      onSearchResults([]); // Clear previous results on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    
    // Search for the selected suggestion
    const searchEvent = { preventDefault: () => {} };
    handleSearch(searchEvent);
  };

  const handleLoadMore = () => {
    // Increase visible count by 5
    const newVisibleCount = Math.min(visibleCount + 5, allMovies.length);
    setVisibleCount(newVisibleCount);
    
    // Pass updated set of movies to parent component
    onSearchResults(allMovies.slice(0, newVisibleCount));
  };

  return (
    <div className="mb-8 w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 3 && setShowSuggestions(true)}
            placeholder="Search for movies..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-600/50 text-white"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          
          {/* Suggestions dropdown - increased z-index */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute z-50 mt-1 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-lg"
            >
              <ul className="py-1">
                {suggestions.map((suggestion) => (
                  <li 
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white"
                  >
                    {suggestion.title} <span className="text-gray-400 text-sm">({suggestion.year})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg transition-colors hover:bg-red-700 disabled:opacity-50 font-medium"
        >
          {isLoading ? "Searching..." : "Search"}
        </motion.button>
      </form>
      
      {error && (
        <div className="mt-2 text-red-400 text-sm flex justify-between items-center p-2 bg-red-500/10 rounded-lg border border-red-500/20">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            className="ml-2 text-sm hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Load More button - only show if there are more movies to load */}
      {allMovies.length > visibleCount && (
        <div className="mt-4 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleLoadMore}
            className="flex items-center gap-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
          >
            Load More <ChevronDown size={16} />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
