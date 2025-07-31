import { createContext, useState, useContext, useEffect } from 'react';
import { apiRequest } from './api';

// Create a context for global state
export const GlobalStateContext = createContext();

// Global state provider component
export const GlobalStateProvider = ({ children }) => {
  const [projectResponses, setProjectResponses] = useState({});
  const [isLoading, setIsLoading] = useState({});

  // Function to fetch project data and cache it in global state
  const fetchProjectData = async (projectId) => {
    if (!projectId) return null;
    
    // Set loading state for this projectId
    setIsLoading(prev => ({ ...prev, [projectId]: true }));
    
    try {
      console.log(`[GlobalState] Fetching project data for project ${projectId}`);
      const response = await apiRequest(`/projects/${projectId}`);
      
      // Store the response in the global state
      setProjectResponses(prev => ({
        ...prev,
        [projectId]: {
          data: response,
          lastFetched: new Date().toISOString(),
        }
      }));
      
      console.log(`[GlobalState] Project data cached for project ${projectId}`);
      return response;
    } catch (error) {
      console.error(`[GlobalState] Error fetching project data for project ${projectId}:`, error);
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, [projectId]: false }));
    }
  };

  // Function to get cached project data or fetch if not available
  const getProjectData = async (projectId) => {
    // If data exists and was fetched in the last 5 minutes, return it
    const cachedData = projectResponses[projectId];
    if (cachedData) {
      const lastFetched = new Date(cachedData.lastFetched);
      const now = new Date();
      const diffInMinutes = (now - lastFetched) / (1000 * 60);
      
      // Return cached data if it's fresh (less than 5 minutes old)
      if (diffInMinutes < 5) {
        console.log(`[GlobalState] Using cached data for project ${projectId}`);
        return cachedData.data;
      }
    }
    
    // Fetch fresh data if cache is missing or stale
    return await fetchProjectData(projectId);
  };

  // Function to update specific project data (useful after operations)
  const updateProjectData = (projectId, newData) => {
    if (!projectId) return;
    
    setProjectResponses(prev => ({
      ...prev,
      [projectId]: {
        data: newData,
        lastFetched: new Date().toISOString(),
      }
    }));
    console.log(`[GlobalState] Project data updated for project ${projectId}`);
  };

  // Clean up stale data periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      const updatedResponses = { ...projectResponses };
      let hasChanges = false;
      
      Object.entries(updatedResponses).forEach(([id, entry]) => {
        const lastFetched = new Date(entry.lastFetched);
        const diffInHours = (now - lastFetched) / (1000 * 60 * 60);
        
        // Remove data older than 24 hours
        if (diffInHours > 24) {
          delete updatedResponses[id];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setProjectResponses(updatedResponses);
        console.log('[GlobalState] Cleaned up stale project data');
      }
    }, 30 * 60 * 1000); // Run every 30 minutes
    
    return () => clearInterval(cleanupInterval);
  }, [projectResponses]);

  return (
    <GlobalStateContext.Provider 
      value={{ 
        projectResponses,
        isLoading,
        getProjectData,
        updateProjectData,
        fetchProjectData
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use the global state
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};