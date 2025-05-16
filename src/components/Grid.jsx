import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "./Card";

const Grid = ({ title, movies, renderActions, isSearchResults = false }) => {
  const [visibleMovies, setVisibleMovies] = useState(isSearchResults ? 8 : movies.length);
  
  // Ensure we have a movies array
  const moviesArray = Array.isArray(movies) ? movies : [];
  
  // Reset visible movies when the movies prop changes
  useEffect(() => {
    setVisibleMovies(isSearchResults ? Math.min(8, moviesArray.length) : moviesArray.length);
  }, [movies, isSearchResults]);

  const loadMore = () => {
    setVisibleMovies(prevCount => Math.min(prevCount + 8, moviesArray.length));
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Ensure we're working with valid data
  const displayedMovies = moviesArray.slice(0, visibleMovies);
  const hasMoreToLoad = isSearchResults && visibleMovies < moviesArray.length;

  return (
    <div className="mb-10">
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      
      {moviesArray.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border border-white/10 rounded-lg">
          No movies in this category yet. Search for movies to add them!
        </div>
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {displayedMovies.map((movie, index) => (
              <motion.div key={movie.id || index} variants={item} className="h-full">
                <Card 
                  movie={movie}
                  actions={renderActions ? renderActions(movie) : null}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {hasMoreToLoad && (
            <div className="flex justify-center mt-6">
              <motion.button
                onClick={loadMore}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Load More
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Grid;
