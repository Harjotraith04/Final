/**
 * API Utility for making requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Makes an API request with authentication
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Request options
 * @returns {Promise} - API response
 */
// Helper to redirect to login page when auth fails
const redirectToLogin = () => {
  console.log('Authentication failed. Redirecting to login page...');
  // Clear any stale tokens
  localStorage.removeItem('authToken');
  // Use window.location for a full page reload to the login
  window.location.href = '/login';
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  if (!token && options.requireAuth !== false) {
    console.warn('No auth token found for request to:', endpoint);
    redirectToLogin();
    throw new Error('Authentication required');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      // Handle authentication errors specially
      if (response.status === 401 || response.status === 403) {
        console.error(`Authentication error for endpoint ${endpoint}: ${response.status}`);
        redirectToLogin();
        throw new Error('Authentication failed. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error(`API error for endpoint ${endpoint}:`, errorData);
      
      // Handle validation errors (422)
      if (response.status === 422 && errorData.detail) {
        const validationErrors = Array.isArray(errorData.detail) 
          ? errorData.detail.map(err => `${err.loc.join('.')} - ${err.msg}`).join('\n') 
          : errorData.detail;
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Error: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Project API functions
 */
export const projectsApi = {
  /**
   * Get all projects for the current user
   */
  getProjects: () => apiRequest('/projects/'),
  
  /**
   * Get a specific project by ID
   * @param {number|string} id - Project ID
   */
  getProject: (id) => apiRequest(`/projects/${id}`),
  
  /**
   * Get a project with all its content (documents, segments, codes, quotes, annotations)
   * @param {number|string} id - Project ID
   * @returns {Promise} - Complete project data including all related content
   */  getProjectWithContent: (id) => {
    if (!id) {
      throw new Error('Project ID is required to fetch project content');
    }
    console.log(`Fetching full project data for project ${id}`);
    return apiRequest(`/projects/${id}`)
      .then(result => {
        console.log(`Fetched complete project data for project ${id}`);
        
        // Debug response contents
        console.log("Project data structure:", Object.keys(result));
        
        if (result.documents && result.documents.length > 0) {
          console.log("Document has content field:", result.documents[0].hasOwnProperty('content'));
          if (result.documents[0].content) {
            console.log("First document content length:", result.documents[0].content.length);
          }
        }
        
        return result;
      });
  },
  
  /**
   * Create a new project
   * @param {object} projectData - Project data object with title and description
   */
  createProject: (projectData) => apiRequest('/projects/', {
    method: 'POST',
    body: JSON.stringify(projectData)
  }),
  
  /**
   * Update an existing project
   * @param {number|string} id - Project ID
   * @param {object} projectData - Updated project data
   */
  updateProject: (id, projectData) => apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  }),
  
  /**
   * Delete a project
   * @param {number|string} id - Project ID
   */
  deleteProject: (id) => apiRequest(`/projects/${id}`, {
    method: 'DELETE'
  }),
    /**
   * Add a collaborator to a project
   * @param {number|string} projectId - Project ID
   * @param {string} email - Collaborator email address
   */
  addCollaborator: (projectId, email) => apiRequest(`/projects/${projectId}/collaborators?collaborator_email=${encodeURIComponent(email)}`, {
    method: 'POST'
  }),
  
  /**
   * Remove a collaborator from a project
   * @param {number|string} projectId - Project ID
   * @param {string} email - Collaborator email address
   */
  removeCollaborator: (projectId, email) => apiRequest(`/projects/${projectId}/collaborators/${email}`, {
    method: 'DELETE'
  }),

  /**
   * Perform inductive coding on selected documents
   * @param {number|string} projectId - Project ID
   * @param {object} data - Data containing document_ids
   */
  inductiveCoding: (projectId, data) => apiRequest(`/ai/initial-coding`, {
    method: 'POST',
    body: JSON.stringify({ ...data, project_id: projectId })
  }),

  /**
   * Perform deductive coding on selected documents
   * @param {number|string} projectId - Project ID
   * @param {object} data - Data containing document_ids
   */
  deductiveCoding: (projectId, data) => apiRequest(`/deductive-coding`, {
    method: 'POST',
    body: JSON.stringify({ ...data, project_id: projectId })
  }),

  /**
   * Save research details (questions and objectives) for a project
   * @param {number|string} projectId - Project ID
   * @param {object} researchData - Research data containing questions and objectives
   */
  saveResearchDetails: (projectId, researchData) => apiRequest(`/projects/${projectId}/research-details`, {
    method: 'PUT',
    body: JSON.stringify({ research_details: researchData })
  })
};

export const documentsApi = {  
  /**
   * Process document segments from a project content response
   * @param {Object} document - Document object with segments array
   * @returns {Object} - Document with processed segments
   */
  processDocumentSegments: (document) => {
    if (!document || !document.content) {
      return document;
    }
    
    // Process segments based on segment_type or other criteria
    return {
      ...document,
      processedContent: document.content.split('\n').map((line, index) => ({
        id: index,
        content: line,
        type: 'text',
        lineNumber: index + 1,
      }))
    };
  },
  
  /**
   * Upload a single document
   * @param {number|string} projectId - Project ID
   * @param {File} file - File object to upload
   * @param {string} name - Optional name for the document
   * @param {string} description - Optional description for the document
   */
  uploadDocument: async (projectId, file, name = null, description = null) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Ensure projectId is provided and valid
    if (!projectId) {
      throw new Error('Project ID is required for document upload');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);
    
    if (name) {
      formData.append('name', name);
    }
    
    if (description) {
      formData.append('description', description);
    }
    
    try {
      console.log(`Uploading document: ${file.name} (${file.size} bytes) to project ${projectId}`);
      
      const response = await fetch(`${API_BASE_URL}/documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Do NOT set Content-Type here - the browser will set it automatically with the boundary
        },
        body: formData,
      });
      
      // Log response status for debugging
      console.log(`Single document upload response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Single document upload result:', result);
      return result;
    } catch (error) {
      console.error('Upload Document Error:', error);
      throw error;
    }
  },
    /**
   * Upload multiple documents
   * @param {number|string} projectId - Project ID
   * @param {File[]} files - Array of File objects to upload
   */
  bulkUploadDocuments: async (projectId, files) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Ensure projectId is provided and valid
    if (!projectId) {
      throw new Error('Project ID is required for bulk upload');
    }
    
    const formData = new FormData();
    formData.append('project_id', projectId);
    
    // Append each file to the FormData with the same field name 'files'
    // This is crucial for FastAPI to correctly parse the files as a list
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      console.log(`Preparing to upload ${files.length} files to project ${projectId}`);
      
      const response = await fetch(`${API_BASE_URL}/documents/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Do NOT set Content-Type here - the browser will set it automatically with the boundary
        },
        body: formData,
      });
      
      // Log response status for debugging
      console.log(`Bulk upload response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Bulk upload result:', result);
      return result;
    } catch (error) {
      console.error('Bulk Upload Documents Error:', error);
      throw error;
    }
  },
    /**
   * Get all documents for a project
   * @param {number|string} projectId - Project ID
   */
  getProjectDocuments: (projectId) => {
    if (!projectId) {
      throw new Error('Project ID is required to fetch documents');
    }
    console.log(`Fetching documents for project ${projectId}`);
    return apiRequest(`/documents/project/${projectId}`)
      .then(result => {
        console.log(`Fetched ${result?.length || 0} documents for project ${projectId}`);
        return result;
      });
  },
    /**
   * Get a specific document
   * @param {number|string} documentId - Document ID
   */
  getDocument: (documentId) => {
    if (!documentId) {
      throw new Error('Document ID is required to fetch document details');
    }
    console.log(`Fetching document details for document ${documentId}`);
    return apiRequest(`/documents/${documentId}`)
      .then(result => {
        console.log(`Fetched document details for document ${documentId}`, result);
        return result;
      });
  },
  
  /**
   * Update a document
   * @param {number|string} documentId - Document ID
   * @param {object} documentData - Document data to update
   */
  updateDocument: (documentId, documentData) => apiRequest(`/documents/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify(documentData)
  }),
  
  /**
   * Delete a document
   * @param {number|string} documentId - Document ID
   */
  deleteDocument: (documentId) => apiRequest(`/documents/${documentId}`, {
    method: 'DELETE'
  })
};

export const codesApi = {
  createCode: (codeData) => apiRequest('/codes/', {
    method: 'POST',
    body: JSON.stringify(codeData)
  }),

  updateCode: (codeId, codeData) => apiRequest(`/codes/${codeId}`, {
    method: 'PUT',
    body: JSON.stringify(codeData)
  }),

  deleteCode: (codeId) => apiRequest(`/codes/${codeId}`, {
    method: 'DELETE'
  }),

  getProjectCodes: (projectId) => apiRequest(`/codes/project/${projectId}`),

  getCode: (codeId) => apiRequest(`/codes/${codeId}`),

  assignGroup: (codeIds, groupName) => apiRequest('/codes/assign-group', {
    method: 'POST',
    body: JSON.stringify({ code_ids: codeIds, group_name: groupName })
  }),

  assignTheme: (codeIds, themeId) => apiRequest('/codes/assign-theme', {
    method: 'POST',
    body: JSON.stringify({ code_ids: codeIds, theme_id: themeId })
  }),
};

export const codeAssignmentsApi = {
  assignCode: (assignmentData) => apiRequest('/code-assignments/assign', {
    method: 'POST',
    body: JSON.stringify(assignmentData)
  }),
  
  /**
   * Get code assignments for a document
   * @param {number|string} documentId - Document ID
   */
  getDocumentAssignments: (documentId) => apiRequest(`/code-assignments/document/${documentId}`),
  
  /**
   * Delete a code assignment
   * @param {number|string} assignmentId - Assignment ID
   */
  deleteAssignment: (assignmentId) => apiRequest(`/code-assignments/${assignmentId}`, {
    method: 'DELETE'
  }),

  /**
   * Submit code assignments for collaborators
   * @param {number[]} assignmentIds - Array of assignment IDs to submit
   */
  submitAssignments: (assignmentIds) => apiRequest('/code-assignments/submit', {
    method: 'POST',
    body: JSON.stringify(assignmentIds)
  })
};

export const annotationsApi = {
    /**
     * Create a new annotation (comment)
     * @param {object} annotationData - The annotation data to create
     * @returns {Promise} - The created annotation
     */
    createAnnotation: (annotationData) => apiRequest('/annotations/', {
        method: 'POST',
        body: JSON.stringify(annotationData)
    }),

    /**
     * Get all annotations for a project
     * @param {number|string} projectId - The project ID
     * @returns {Promise} - The annotations
     */
    getProjectAnnotations: (projectId) => apiRequest(`/annotations/project/${projectId}`),

    /**
     * Get all annotations for a project (alternative method)
     * @param {number|string} projectId - The project ID
     * @returns {Promise} - The annotations
     */
    getAnnotations: (projectId) => apiRequest(`/projects/${projectId}`),

    /**
     * Delete an annotation
     * @param {number|string} annotationId - The annotation ID
     * @returns {Promise} - The result of the delete operation
     */
    deleteAnnotation: (annotationId) => apiRequest(`/annotations/${annotationId}`, {
        method: 'DELETE'
    }),

    /**
     * Update an annotation
     * @param {number|string} annotationId - The annotation ID
     * @param {object} annotationData - The updated annotation data
     * @returns {Promise} - The updated annotation
     */
    updateAnnotation: (annotationId, annotationData) => apiRequest(`/annotations/${annotationId}`, {
        method: 'PUT',
        body: JSON.stringify(annotationData)
    })
};

export const authApi = {
    login: (credentials) => apiRequest('/auth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(credentials),
        requireAuth: false
    }),
    signup: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        requireAuth: false
    }),
    getCurrentUser: () => apiRequest('/users/me')
};

export default {
  projects: projectsApi,
  documents: documentsApi,
  codes: codesApi,
  annotations: annotationsApi,
  auth: authApi,
  
  /**
   * Code Assignments API functions
   */
  codeAssignments: {
    /**
     * Assign a code to a text selection in a document
     * @param {object} assignmentData - Assignment data containing document_id, code_id, start_char, end_char, text_snapshot, etc.
     * @returns {Promise} - Assignment result
     */
    assignCode: (assignmentData) => apiRequest('/code-assignments/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    }),
    
    /**
     * Get code assignments for a document
     * @param {number|string} documentId - Document ID
     */
    getDocumentAssignments: (documentId) => apiRequest(`/code-assignments/document/${documentId}`),
    
    /**
     * Delete a code assignment
     * @param {number|string} assignmentId - Assignment ID
     */
    deleteAssignment: (assignmentId) => apiRequest(`/code-assignments/${assignmentId}`, {
      method: 'DELETE'
    })
  },
  
  /**
   * Utility function to get a complete project with content and process it
   * @param {number|string} projectId - Project ID
   * @returns {Promise} - Processed project data
   */
  getProcessedProjectContent: async (projectId) => {
    const projectData = await projectsApi.getProjectWithContent(projectId);
    
    // Process documents and their segments
    if (projectData && projectData.documents && projectData.documents.length > 0) {
      projectData.documents = projectData.documents.map(doc => {
        if (doc.content) {
          return documentsApi.processDocumentSegments(doc);
        }
        return doc;
      });
    }
    
    return projectData;
  }
};

/**
 * User API endpoints
 */
export const usersApi = {
  /**
   * Get current user profile
   * @returns {Promise} - User profile data
   */
  getCurrentUser: async () => {
    try {
      const response = await apiRequest('/users/profile');
      console.log('Fetched current user profile:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
};

/**
 * Utility functions for localStorage management
 */
export const storageUtils = {
  /**
   * Validates that the stored project ID actually exists and updates localStorage accordingly
   * @returns {Promise<string|null>} - Valid project ID or null if none found
   */
  validateAndCleanupProjectId: async () => {
    const storedProjectId = localStorage.getItem('currentProjectId');
    console.log('validateAndCleanupProjectId - storedProjectId:', storedProjectId);
    
    if (!storedProjectId) {
      console.log('No project ID stored in localStorage');
      return null;
    }
    
    try {
      // Try to fetch the stored project to validate it exists
      await projectsApi.getProject(storedProjectId);
      console.log(`Validated stored project ID: ${storedProjectId}`);
      return storedProjectId;
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.log(`Stored project ID ${storedProjectId} no longer exists, cleaning up localStorage`);
        localStorage.removeItem('currentProjectId');
        
        // Try to find and set a valid project
        try {
          const projects = await projectsApi.getProjects();
          if (projects && projects.length > 0) {
            const firstProject = projects[0];
            localStorage.setItem('currentProjectId', firstProject.id.toString());
            console.log(`Set new current project: ${firstProject.title} (ID: ${firstProject.id})`);
            return firstProject.id.toString();
          }
        } catch (projectsError) {
          console.error('Error fetching alternative projects during cleanup:', projectsError);
        }
        return null;
      } else {
        // For other errors, keep the stored ID but log the issue
        console.warn('Error validating stored project ID, but keeping it:', error.message);
        return storedProjectId;
      }
    }
  },

  /**
   * Clears all stored application data (useful for logout or data corruption issues)
   */
  clearAllStoredData: () => {
    const keysToRemove = ['authToken', 'currentProjectId'];
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleared localStorage key: ${key}`);
      }
    });
  },

  /**
   * Gets the current project ID, validating it exists first
   * @returns {Promise<string|null>} - Valid project ID or null
   */
  getCurrentProjectId: async () => {
    console.log('getCurrentProjectId called');
    const result = await storageUtils.validateAndCleanupProjectId();
    console.log('getCurrentProjectId result:', result);
    return result;
  }
};