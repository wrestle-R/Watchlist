import { doc, setDoc, collection, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';

// Collection reference
const searchHistoryCollection = 'searchHistory';

/**
 * Save a search query to the user's history with retry logic
 * @param {string} userId - The user ID
 * @param {string} query - The search query
 * @param {Array} results - The search results
 * @param {number} retryCount - The number of retries left (internal parameter)
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const saveSearchQuery = async (userId, query, results, retryCount = 3) => {
  try {
    if (!userId || !query) {
      console.warn("Missing userId or query in saveSearchQuery");
      return false;
    }

    // Create a simplified version of the results to store
    const simplifiedResults = results.slice(0, 5).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      timestamp: new Date().toISOString() // Use ISO string instead of serverTimestamp
    }));

    // Create a document with the current timestamp in the filename to ensure uniqueness
    const currentTime = new Date();
    const searchId = `search_${currentTime.getTime()}`;
    
    // Reference to the user's searches collection
    const searchDocRef = doc(db, searchHistoryCollection, userId, 'searches', searchId);
    
    // Create the search document with timestamp field separate from the results array
    await setDoc(searchDocRef, {
      query: query,
      timestamp: serverTimestamp(), // This is at the root level, not in an array
      searchDate: currentTime.toISOString(), // Backup date in string format
      resultCount: simplifiedResults.length,
      results: simplifiedResults // This array doesn't contain serverTimestamp
    });
    
    return true;
  } catch (error) {
    console.error(`Error saving search history (retries left: ${retryCount}):`, error);
    
    // Implement retry logic with exponential backoff
    if (retryCount > 0) {
      const delay = Math.pow(2, 3 - retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Retrying operation after ${delay}ms, ${retryCount - 1} retries left`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry with one less retry count
      return saveSearchQuery(userId, query, results, retryCount - 1);
    }
    
    // Don't throw the error to avoid affecting the main search functionality
    return false;
  }
};

// Get recent search history for a user
export const getSearchHistory = async (userId, maxResults = 10) => {
  try {
    if (!userId) {
      console.warn("Missing userId in getSearchHistory");
      return [];
    }
    
    const searchesRef = collection(db, searchHistoryCollection, userId, 'searches');
    const q = query(searchesRef, orderBy('timestamp', 'desc'), limit(maxResults));
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Handle potential missing timestamp field
      let timestamp;
      try {
        timestamp = data.timestamp ? data.timestamp.toDate() : new Date(data.searchDate || Date.now());
      } catch (e) {
        timestamp = new Date();
      }
      
      return {
        id: doc.id,
        query: data.query || "",
        timestamp: timestamp,
        results: data.results || []
      };
    });
  } catch (error) {
    console.error("Error fetching search history:", error);
    return [];
  }
};
