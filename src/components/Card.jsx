import { useState, useEffect } from "react";
import { Star, Film, Tv, X, Clock, Check } from "lucide-react";
import { motion } from "framer-motion";

const Card = ({ movie, actions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch movie details when modal is opened for the first time
  useEffect(() => {
    if (isModalOpen && !details) {
      fetchMovieDetails();
    }
  }, [isModalOpen]);

  // Close modal when escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isModalOpen]);

  const fetchMovieDetails = async () => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OMDB_API_KEY;
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.id}&plot=full`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }

      const data = await response.json();
      if (data.Response === "True") {
        setDetails(data);
      }
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const TypeIcon = movie.type === "movie" ? Film : Tv;
  
  // Get category icon based on action buttons
  const getCategoryIcon = () => {
    if (!actions) return null;
    
    if (actions.toString().includes("Move to Watched")) {
      return <Clock size={14} className="text-yellow-400" />;
    } else if (actions.toString().includes("Move to Watching")) {
      return <Check size={14} className="text-green-400" />;
    }
    return null;
  };
  
  const categoryIcon = getCategoryIcon();
  
  // Format the date when the movie was added
  const formatAddedDate = () => {
    if (!movie.addedAt) return null;
    try {
      const date = new Date(movie.addedAt);
      return date.toLocaleDateString();
    } catch (e) {
      return null;
    }
  };

  return (
    <>
      {/* Movie Card */}
      <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg overflow-hidden h-full flex flex-col transition-all shadow-lg">
        <div className="relative cursor-pointer group" onClick={openModal}>
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://via.placeholder.com/150x225?text=${encodeURIComponent(movie.title)}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-red-600 p-3 rounded-full"
            >
              <Film size={20} className="text-white" />
            </motion.button>
          </div>
          
          {categoryIcon && (
            <div className="absolute top-2 left-2 bg-black/70 rounded-full p-1 z-20">
              {categoryIcon}
            </div>
          )}
          
          {movie.imdbRating && (
            <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-md text-xs font-medium z-20">
              ★ {movie.imdbRating}
            </div>
          )}
        </div>
        
        <div className="p-3 flex-grow cursor-pointer" onClick={openModal}>
          <h3 className="font-bold text-sm md:text-base line-clamp-1">{movie.title}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-400 text-xs">{movie.year}</span>
            {movie.genre && (
              <span className="text-gray-400 text-xs">{movie.genre.split(',')[0]}</span>
            )}
          </div>
          
          {/* Show when movie was added */}
          {formatAddedDate() && (
            <p className="text-xs text-gray-500 mt-1">
              Added: {formatAddedDate()}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="p-3 pt-0 mt-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="font-bold text-lg">{movie.title} <span className="text-gray-400">({movie.year})</span></h3>
              <button 
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row p-4 gap-4">
              <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title} 
                    className="w-full rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                
                {movie.imdbRating && (
                  <div className="flex items-center mt-2 justify-center bg-black/30 py-1 px-2 rounded">
                    <Star size={16} className="text-yellow-500 fill-yellow-500 mr-1" />
                    <span>{movie.imdbRating}</span>
                  </div>
                )}
              </div>
              
              <div className="w-full md:w-2/3 overflow-y-auto" style={{ maxHeight: "400px" }}>
                {isLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                ) : details ? (
                  <div className="space-y-4">
                    {details.Plot && details.Plot !== "N/A" && (
                      <div>
                        <h4 className="font-semibold text-white mb-1">Plot</h4>
                        <p className="text-gray-400">{details.Plot}</p>
                      </div>
                    )}
                    
                    {details.Director && details.Director !== "N/A" && (
                      <div>
                        <h4 className="font-semibold text-white mb-1">Director</h4>
                        <p className="text-gray-400">{details.Director}</p>
                      </div>
                    )}
                    
                    {details.Actors && details.Actors !== "N/A" && (
                      <div>
                        <h4 className="font-semibold text-white mb-1">Cast</h4>
                        <p className="text-gray-400">{details.Actors}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      {details.Runtime && details.Runtime !== "N/A" && (
                        <div>
                          <h4 className="font-semibold text-white mb-1">Runtime</h4>
                          <p className="text-gray-400">{details.Runtime}</p>
                        </div>
                      )}
                      
                      {details.Released && details.Released !== "N/A" && (
                        <div>
                          <h4 className="font-semibold text-white mb-1">Released</h4>
                          <p className="text-gray-400">{details.Released}</p>
                        </div>
                      )}
                      
                      {details.Genre && details.Genre !== "N/A" && (
                        <div>
                          <h4 className="font-semibold text-white mb-1">Genre</h4>
                          <p className="text-gray-400">{details.Genre}</p>
                        </div>
                      )}
                      
                      {details.Language && details.Language !== "N/A" && (
                        <div>
                          <h4 className="font-semibold text-white mb-1">Language</h4>
                          <p className="text-gray-400">{details.Language}</p>
                        </div>
                      )}
                    </div>
                    
                    {details.Awards && details.Awards !== "N/A" && (
                      <div>
                        <h4 className="font-semibold text-white mb-1">Awards</h4>
                        <p className="text-gray-400">{details.Awards}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">No details available</p>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="p-4 border-t border-gray-800 bg-black/20">
                <div className="flex flex-wrap gap-2">
                  {actions}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Card;