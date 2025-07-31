/**
 * Debug utilities for development and troubleshooting
 */

export const debugUtils = {
  /**
   * Get and log the current state of localStorage
   */
  getLocalStorageState: () => {
    console.log('=== LOCAL STORAGE STATE ===');
    const keys = Object.keys(localStorage);
    if (keys.length === 0) {
      console.log('localStorage is empty');
    } else {
      keys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          console.log(`${key}:`, value);
        } catch (error) {
          console.log(`${key}: [Error reading value]`, error);
        }
      });
    }
    console.log('=== END LOCAL STORAGE STATE ===');
  },

  /**
   * Log the current URL and its components
   */
  logCurrentUrl: () => {
    console.log('=== CURRENT URL INFO ===');
    console.log('Full URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Search params:', window.location.search);
    console.log('Hash:', window.location.hash);
    console.log('Origin:', window.location.origin);
    console.log('=== END CURRENT URL INFO ===');
  },

  /**
   * Get and log the current user state
   */
  getUserState: () => {
    console.log('=== USER STATE ===');
    const token = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
      } catch (error) {
        console.log('Could not decode token payload:', error);
      }
    }
    console.log('=== END USER STATE ===');
  },

  /**
   * Get and log the current project state
   */
  getProjectState: () => {
    console.log('=== PROJECT STATE ===');
    const projectId = localStorage.getItem('currentProjectId');
    console.log('Current project ID:', projectId);
    console.log('=== END PROJECT STATE ===');
  },

  /**
   * Comprehensive debug info
   */
  getAllDebugInfo: () => {
    console.log('=== COMPREHENSIVE DEBUG INFO ===');
    debugUtils.getLocalStorageState();
    debugUtils.logCurrentUrl();
    debugUtils.getUserState();
    debugUtils.getProjectState();
    console.log('=== END COMPREHENSIVE DEBUG INFO ===');
  }
}; 