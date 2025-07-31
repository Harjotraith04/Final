import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  Zoom,
  Fade,
  Backdrop,
  Tooltip,
  alpha,
  useMediaQuery,
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CodeIcon from '@mui/icons-material/Code';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import ResearchDetails from '../components/ResearchDetails';
import Comments from '../components/Comments';
import Codebook from '../components/Codebook';
import CodeModals from '../components/CodeModals';
import OptionsBar from '../components/OptionsBar';
import Navigation from '../components/Navigation';
import Documents from '../components/Documents';
import VisualizationDashboard from '../components/VisualizationDashboard';
import MergingPage from '../components/MergingPage';
import AICodingDialog from '../components/AICodingDialog';
import '../components/VisualizationDashboard.css';
import { 
  FrostedGlassPaper, 
  DashboardCard, 
  GradientButton, 
  AnimatedChip, 
  LoadingSkeleton,
  GradientDivider,
  StatusBadge
} from '../components/StyledComponents';
import { projectsApi, usersApi } from '../utils/api';
import { useGlobalState } from '../utils/globalState';

function Dashboard() {
  const theme = useTheme();
  const { projectId } = useParams();
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [selectedAIModel, setSelectedAIModel] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');  
  const [activeMenuItem, setActiveMenuItem] = useState('Documents');
  const [projectData, setProjectData] = useState({ title: 'Project', description: '' });
  const [navigationExpanded, setNavigationExpanded] = useState(true);
  const [isAiCodingDialogOpen, setIsAiCodingDialogOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    usersApi.getCurrentUser().then(setCurrentUser).catch((e) => {
      console.error('Failed to fetch current user:', e);
    });
  }, []);

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsResizing(false), 200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Media queries for responsive behavior
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [selection, setSelection] = useState(null);
  const [bubbleAnchor, setBubbleAnchor] = useState(null);
  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [codes, setCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [pendingCodeSelection, setPendingCodeSelection] = useState(null);
  const [createCodeDialogOpen, setCreateCodeDialogOpen] = useState(false);
  const [newCodeFields, setNewCodeFields] = useState({
    name: '',
    description: '',
    color: ''  });
  
  // SpeedDial state
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  
  const handleSpeedDialOpen = () => setSpeedDialOpen(true);
  const handleSpeedDialClose = () => setSpeedDialOpen(false);

  // State for documents uploaded - start with empty array
  const [documents, setDocuments] = useState([]);

  // Add state for comments and code assignments
  const [commentData, setCommentData] = useState([]);
  const [codeAssignments, setCodeAssignments] = useState([]);
  const [codebooks, setCodebooks] = useState([]);

  // State to track selected document for processing
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch complete project data on component mount - includes documents, segments, codes, quotes, annotations
  React.useEffect(() => {
    const fetchProjectWithContent = async () => {
      try {
        if (!projectId || isRefreshing) {
          return;
        }
        
        console.log(`Fetching complete project data for project ${projectId}`);
        // Use global state to get project data
        const data = await getProjectData(projectId);
        
        if (!data) {
          throw new Error('Failed to get project data');
        }
        
        // Debug: Log the complete response to see the structure
        console.log("Complete project data response:", data);
        
        // Update project data
        setProjectData({
          id: data.id,
          title: data.title,
          description: data.description || '',
          created_at: data.created_at,
          created_by: data.created_by,
          owner: data.owner, // Ensure owner is included
          collaborators: data.collaborators, // Optionally include collaborators
          // Include any other project level data
        });

        // Update documents if they exist in the response
        if (data.documents && Array.isArray(data.documents)) {
          console.log(`Found ${data.documents.length} documents in project data`);
          console.log("Document data sample:", data.documents[0]);
          setDocuments(data.documents);
        } else {
          console.warn("No documents array found in response or it's not an array");
        }

        // Update codes if they exist in the response
        if (data.codes && Array.isArray(data.codes)) {
          console.log(`Found ${data.codes.length} codes in project data`);
          setCodes(data.codes);
        } else {
          console.warn("No codes array found in response or it's not an array");
        }

        // Set code assignments if available
        if (data.code_assignments && Array.isArray(data.code_assignments)) {
          console.log(`Found ${data.code_assignments.length} code assignments`);
          setCodeAssignments(data.code_assignments);
        }

        // Set comments/annotations if available
        if (data.annotations && Array.isArray(data.annotations)) {
          console.log(`Found ${data.annotations.length} annotations`);
          setCommentData(data.annotations);
        }

        // Set codebooks if available
        if (data.codebooks && Array.isArray(data.codebooks)) {
          console.log(`Found ${data.codebooks.length} codebooks`);
          setCodebooks(data.codebooks);
        }
      
      } catch (err) {
        console.error('Error fetching complete project data:', err);
        console.error('Error details:', err.message);
        // Try to get a more detailed error
        if (err.stack) {
          console.error('Error stack:', err.stack);
        }
      }
    };

    fetchProjectWithContent();
  }, [projectId]);

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleNavigationToggle = (isExpanded) => {
    setNavigationExpanded(isExpanded);
  };

  // Get global state utilities
  const { getProjectData, updateProjectData } = useGlobalState();

  // Function to refresh project data after operations
  const refreshProjectData = async () => {
    if (isRefreshing) {
      console.log('Refresh already in progress, skipping...');
      return;
    }
    
    try {
      setIsRefreshing(true);
      console.log(`Refreshing project data for project ${projectId}`);
      
      // Use global state to get project data
      const data = await getProjectData(projectId);
      
      if (!data) {
        console.error('Failed to get project data');
        return;
      }
      
      // Update all relevant state with fresh data
      setProjectData({
        id: data.id,
        title: data.title,
        description: data.description || '',
        created_at: data.created_at,
        created_by: data.created_by,
        owner: data.owner, // Ensure owner is included
        collaborators: data.collaborators, // Optionally include collaborators
      });
      
      if (data.documents && Array.isArray(data.documents)) {
        setDocuments(data.documents);
      }
      
      if (data.codes && Array.isArray(data.codes)) {
        setCodes(data.codes);
      }
      
      if (data.code_assignments && Array.isArray(data.code_assignments)) {
        setCodeAssignments(data.code_assignments);
      }
      
      if (data.annotations && Array.isArray(data.annotations)) {
        setCommentData(data.annotations);
      }
      
      // Update the global state with our local changes (for other components)
      updateProjectData(projectId, data);
      
      console.log('Project data refreshed successfully');
    } catch (err) {
      console.error('Error refreshing project data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBubbleCodesClick = () => {
    setPendingCodeSelection(selection);
    setCodesModalOpen(true);
  };

  const handleRemoveFile = (fileName, event) => {
    event.stopPropagation();
    const newFiles = selectedFiles.filter(f => f.name !== fileName);
    setSelectedFiles(newFiles);
    
    if (activeFile === fileName) {
      setActiveFile(newFiles.length > 0 ? newFiles[0].name : null);
    }
  };
    // Handle document selection from navigation
  const handleDocumentSelect = (documentId, documentObject) => {
    // Ensure we're on the Documents page
    setActiveMenuItem('Documents');
    
    console.log('Document selected:', documentId, 'with document object:', !!documentObject);
    
    if (!documentId) {
      console.error('No document ID provided for selection');
      return;
    }

    // Find the document in our array
    const selectedDoc = documents.find(doc => doc.id === documentId);
    
    if (!selectedDoc) {
      console.error(`Document with ID ${documentId} not found`);
      return;
    }
    
    // Set the selected document ID which will be picked up by Documents component
    setSelectedDocumentId(documentId);
    
    // Set this document as active
    setActiveFile(documentId);
    
    console.log(`Selected document ${documentId} (${selectedDoc.name || selectedDoc.file_name || 'Untitled'}) for display`);
  };

  // Speed dial actions
  const actions = [
    { icon: <NoteAddIcon />, name: 'New Document', onClick: () => setActiveMenuItem('Documents') },
    { icon: <CodeIcon />, name: 'Add Code', onClick: () => setCreateCodeDialogOpen(true) },
    { icon: <InsertChartIcon />, name: 'View Analysis', onClick: () => setActiveMenuItem('Visualizations') },
    { icon: <BookmarkIcon />, name: 'View Codes', onClick: () => setActiveMenuItem('Codebook') },
  ];

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        position: 'relative',
        backgroundImage: theme.palette.mode === 'dark' 
          ? `radial-gradient(circle at 10% 10%, ${alpha(theme.palette.primary.dark, 0.15)} 0%, transparent 50%), 
             radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.dark, 0.1)} 0%, transparent 100%)`
          : `radial-gradient(circle at 10% 10%, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 50%), 
             radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.light, 0.05)} 0%, transparent 100%)`
      }}
    >
      {/* AI Coding Button - Prominent top position */}
      <Box
        sx={{
          position: 'fixed',
          top: theme.spacing(0.2), // Moved up slightly
          right: theme.spacing(3),
          zIndex: 1300, // Ensure it's above content but below modals
        }}
      >
        <Button 
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeIcon />}
          onClick={() => setIsAiCodingDialogOpen(true)}
          size="large"
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: theme.shadows[8],
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 3,
            '&:hover': {
              transform: 'translateY(-2px) scale(1.02)',
              boxShadow: theme.shadows[12],
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          AI Coding
        </Button>
      </Box>


      <AICodingDialog 
        open={isAiCodingDialogOpen} 
        onClose={() => setIsAiCodingDialogOpen(false)} 
        projectId={projectId}
        onCodingComplete={refreshProjectData}
      />
      <Navigation
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        selectedFiles={selectedFiles}
        documents={documents}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        handleRemoveFile={handleRemoveFile}
        onDocumentSelect={handleDocumentSelect}
        onNavigationToggle={handleNavigationToggle}
      />      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          // Responsive margin and width based on screen size and navigation state
          marginLeft: isDesktop ? (navigationExpanded ? '280px' : '80px') : 0,
          width: isDesktop ? (navigationExpanded ? 'calc(100% - 280px)' : 'calc(100% - 80px)') : '100%',
          transition: isResizing ? 'none' : 'all 0.3s ease-in-out',
          height: 'calc(100vh - 0px)', // Adjust height for the new top offset
          overflow: 'hidden', // Prevent the main container from scrolling
          position: 'fixed',
          top: '22px', // Move down to avoid overlap
          right: 0,
          p: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Main Content Area with Enhanced Styling */}
        <Fade in={true} style={{ transitionDelay: '200ms' }}>
          <DashboardCard 
            sx={{ 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden', // Remove auto scrolling
              height: '100%',
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.elevated, 0.9)} 100%)`
                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.mode === 'dark' 
                ? alpha(theme.palette.common.white, 0.1)
                : alpha(theme.palette.primary.main, 0.08)}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.08)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                opacity: 0.8,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '40%',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.secondary.main, 0.6)})`,
              }
            }}
          >
            {activeMenuItem === 'Research details' && (
              <Box sx={{ 
                height: '100%', 
                overflow: 'auto',
                p: { xs: 1, sm: 1.5 }, // Reduced padding for more space
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '3px',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  },
                },
              }}>
                <ResearchDetails
                  projectId={projectId}
                  selectedAnalysis={selectedAnalysis}
                  setSelectedAnalysis={setSelectedAnalysis}
                  selectedAIModel={selectedAIModel}
                  setSelectedAIModel={setSelectedAIModel}
                  openaiApiKey={openaiApiKey}
                  setOpenaiApiKey={setOpenaiApiKey}
                  geminiApiKey={geminiApiKey}
                  setGeminiApiKey={setGeminiApiKey}
                  groqApiKey={groqApiKey}
                  setGroqApiKey={setGroqApiKey}
                  claudeApiKey={claudeApiKey}
                  setClaudeApiKey={setClaudeApiKey}
                />
              </Box>
            )}
            
            {activeMenuItem === 'Documents' && (
              <Box sx={{ 
                height: '100%', 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '3px',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  },
                },
              }}>
                <Documents
                    projectId={projectId}
                    setCodesModalOpen={setCodesModalOpen}
                    selection={selection}
                    setSelection={setSelection}
                    bubbleAnchor={bubbleAnchor}
                    setBubbleAnchor={setBubbleAnchor}
                    handleBubbleCodesClick={handleBubbleCodesClick}
                    setPendingCodeSelection={setPendingCodeSelection}
                    commentData={commentData}
                    setCommentData={setCommentData}
                    codeAssignments={codeAssignments}
                    setCodeAssignments={setCodeAssignments}
                    documents={documents}
                    setDocuments={setDocuments}
                    refreshSidebar={refreshProjectData} // Enable refresh callback
                    selectedDocumentId={selectedDocumentId}
                    setSelectedDocumentId={setSelectedDocumentId}
                    onDocumentsUpdated={(updatedDocs) => {
                      console.log("Documents updated via upload:", updatedDocs);
                      // Only refresh when documents are actually uploaded/modified
                      // The Documents component already fetches the data, so we don't need to refresh again
                      // refreshProjectData(); 
                    }}
                    onCommentsUpdated={() => {
                      console.log("Comments updated, refreshing comment data");
                      // Force refresh the project data to get latest comments
                      refreshProjectData();
                    }}
                  />
              </Box>
            )}

            {activeMenuItem === 'Comments' && (
              <Box sx={{ 
                height: '100%', 
                overflow: 'auto',
                p: { xs: 1, sm: 1.5 }, // Reduced padding for more space
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '3px',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  },
                },
              }}>
                <Comments 
                  projectId={projectId} 
                  annotations={commentData}
                  loading={isRefreshing}
                />
              </Box>
            )}

            {activeMenuItem === 'Codebook' && (
              <Box sx={{ 
                height: '100%', 
                overflow: 'auto',
                p: { xs: 1, sm: 1.5 }, // Reduced padding for more space
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '3px',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  },
                },
              }}>
                <Codebook 
                  codeAssignments={codeAssignments} 
                  projectId={projectId}
                  codes={codes}
                  setCodes={setCodes}
                  onCodesUpdated={refreshProjectData}
                  documents={documents}
                  codebooks={codebooks}
                />
              </Box>
            )}
            
            {activeMenuItem === 'Merging Page' && (
              <Box sx={{ 
                height: '100%', 
                overflow: 'auto',
                p: { xs: 1, sm: 1.5 }, // Reduced padding for more space
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '3px',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  },
                },
              }}>
                <MergingPage 
                  projectId={projectId} 
                  codes={codes}
                  codeAssignments={codeAssignments}
                  documents={documents}
                  codebooks={codebooks}
                  refreshProjectData={refreshProjectData}
                  currentUser={currentUser}
                  projectData={projectData}
                />
              </Box>
            )}

            {activeMenuItem === 'Visualizations' && (
              <Box sx={{ 
                height: '100%', 
                overflow: 'auto',
                p: { xs: 1, sm: 1.5 }, // Reduced padding for more space
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.background.paper, 0.1),
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '3px',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  },
                },
              }}>
                <VisualizationDashboard data={codeAssignments} />
              </Box>
            )}
          </DashboardCard>
        </Fade>
      </Box>

      {/* Code Modals */}      <CodeModals
        codesModalOpen={codesModalOpen}
        setCodesModalOpen={setCodesModalOpen}
        selectedCode={selectedCode}
        setSelectedCode={setSelectedCode}
        codes={codes}
        createCodeDialogOpen={createCodeDialogOpen}
        setCreateCodeDialogOpen={setCreateCodeDialogOpen}
        newCodeFields={newCodeFields}
        setNewCodeFields={setNewCodeFields}
        setCodes={setCodes}
        pendingCodeSelection={pendingCodeSelection}
        setPendingCodeSelection={setPendingCodeSelection}
        codeAssignments={codeAssignments}
        setCodeAssignments={setCodeAssignments}
        projectId={projectId}
        onCodesUpdated={refreshProjectData}
      />
    </Box>
  );
}

export default Dashboard;