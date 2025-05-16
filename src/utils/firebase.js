import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase.config';

// Collection references
const usersCollection = 'users';
const watchlistsCollection = 'watchlists';

// Categories
export const CATEGORIES = {
  WATCHLIST: 'watchlist',
  WATCHING: 'watching',
  WATCHED: 'watched'
};

// Initialize user data when they first sign in
export const initializeUserData = async (userId) => {
  let retries = 3; // Number of retries
  
  while (retries > 0) {
    try {
      // Use a transaction to ensure atomicity and avoid race conditions
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, usersCollection, userId);
        const userSnapshot = await transaction.get(userDocRef);
        
        if (!userSnapshot.exists()) {
          // Create user document if it doesn't exist
          transaction.set(userDocRef, {
            uid: userId,
            createdAt: new Date()
          });
          
          // Create empty watchlist categories for the user
          const watchlistDocRef = doc(db, watchlistsCollection, userId);
          transaction.set(watchlistDocRef, {
            [CATEGORIES.WATCHLIST]: [],
            [CATEGORIES.WATCHING]: [],
            [CATEGORIES.WATCHED]: []
          });
        }
      });
      
      console.log("User data initialized successfully");
      return true;
    } catch (error) {
      console.error(`Error initializing user data (attempt ${4 - retries}/3):`, error);
      retries--;
      
      if (retries === 0) {
        console.error("Failed to initialize user data after multiple attempts");
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
    }
  }
};

// Fetch all movies for a user by category
export const fetchUserMovies = async (userId) => {
  try {
    const watchlistDocRef = doc(db, watchlistsCollection, userId);
    const watchlistDoc = await getDoc(watchlistDocRef);

    if (!watchlistDoc.exists()) {
      // If watchlist document doesn't exist, create it
      await setDoc(watchlistDocRef, {
        [CATEGORIES.WATCHLIST]: [],
        [CATEGORIES.WATCHING]: [],
        [CATEGORIES.WATCHED]: []
      });
      return {
        [CATEGORIES.WATCHLIST]: [],
        [CATEGORIES.WATCHING]: [],
        [CATEGORIES.WATCHED]: []
      };
    }

    return watchlistDoc.data();
  } catch (error) {
    console.error("Error fetching user movies:", error);
    throw error;
  }
};

// Add a movie to a category
export const addMovieToCategory = async (userId, movie, category) => {
  try {
    const watchlistDocRef = doc(db, watchlistsCollection, userId);
    
    // First check if the document exists
    const watchlistDoc = await getDoc(watchlistDocRef);
    
    // If document doesn't exist, create it with empty arrays
    if (!watchlistDoc.exists()) {
      await setDoc(watchlistDocRef, {
        [CATEGORIES.WATCHLIST]: [],
        [CATEGORIES.WATCHING]: [],
        [CATEGORIES.WATCHED]: []
      });
    }
    
    // Get the current data
    const currentData = watchlistDoc.exists() ? watchlistDoc.data() : {};
    const categoryMovies = currentData[category] || [];
    
    // Check if movie already exists in this category
    const movieExists = categoryMovies.some(m => m.id === movie.id);
    if (movieExists) {
      console.log(`Movie ${movie.title || movie.id} already exists in ${category}`);
      return false; // Movie already exists, no action needed
    }
    
    // Check if movie exists in other categories and remove it if found
    for (const cat of Object.values(CATEGORIES)) {
      if (cat !== category) {
        const otherCategoryMovies = currentData[cat] || [];
        const movieInOtherCategory = otherCategoryMovies.find(m => m.id === movie.id);
        
        if (movieInOtherCategory) {
          // Remove from other category
          await updateDoc(watchlistDocRef, {
            [cat]: arrayRemove(movieInOtherCategory)
          });
          console.log(`Removed movie ${movie.title || movie.id} from ${cat}`);
        }
      }
    }
    
    // Add to the selected category
    const movieToAdd = {
      ...movie,
      addedAt: new Date().toISOString() // Using ISO string instead of serverTimestamp
    };
    
    await updateDoc(watchlistDocRef, {
      [category]: arrayUnion(movieToAdd)
    });
    
    return true;
  } catch (error) {
    console.error("Error adding movie to category:", error);
    throw error;
  }
};

// Move a movie between categories
export const moveMovie = async (userId, movie, fromCategory, toCategory) => {
  try {
    const watchlistDocRef = doc(db, watchlistsCollection, userId);
    
    // Check if the document exists first
    const watchlistDoc = await getDoc(watchlistDocRef);
    if (!watchlistDoc.exists()) {
      throw new Error("User watchlist not found");
    }
    
    // Remove from source category
    await updateDoc(watchlistDocRef, {
      [fromCategory]: arrayRemove(movie)
    });
    
    // Add to destination category with timestamp
    await updateDoc(watchlistDocRef, {
      [toCategory]: arrayUnion({
        ...movie,
        addedAt: new Date().toISOString()
      })
    });
    
    return true;
  } catch (error) {
    console.error("Error moving movie between categories:", error);
    throw error;
  }
};

// Remove a movie from a category
export const removeMovie = async (userId, movie, category) => {
  try {
    const watchlistDocRef = doc(db, watchlistsCollection, userId);
    
    // Check if the document exists first
    const watchlistDoc = await getDoc(watchlistDocRef);
    if (!watchlistDoc.exists()) {
      throw new Error("User watchlist not found");
    }
    
    await updateDoc(watchlistDocRef, {
      [category]: arrayRemove(movie)
    });
    
    return true;
  } catch (error) {
    console.error("Error removing movie from category:", error);
    throw error;
  }
};
