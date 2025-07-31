import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Collapse,
  useTheme,
  Typography,
  Stack,
  Chip,
  alpha,
  CircularProgress,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  Fab,
  Zoom
} from '@mui/material';
import './Documents.css';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import TableViewIcon from '@mui/icons-material/TableView';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import UploadZone from './UploadZone';
import DocumentList from './DocumentList';
import DocumentViewer from './DocumentViewer';
import FloatingSelectionToolbar from './FloatingSelectionToolbar';
import { useDocuments } from '../hooks/useDocuments';
import { useAnnotations } from '../hooks/useAnnotations';
import { 
  DashboardCard, 
  AnimatedChip, 
  GradientButton, 
  StatusBadge,
  LoadingSkeleton,
  FloatingPanel 
} from './StyledComponents';

function Documents({ 
  projectId, 
  setCodesModalOpen, 
  setPendingCodeSelection,  
  commentData,
  setCommentData,
  codeAssignments,
  documents: parentDocuments,
  setDocuments: setParentDocuments,
  refreshSidebar,
  onDocumentsUpdated,
  onCommentsUpdated,
  selectedDocumentId,
  setSelectedDocumentId
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const mainContentRef = useRef(null);
  
  const {
    documents,
    isLoading,
    uploading,
    uploadError,
    uploadSuccess,
    activeDocument,
    documentContent,
    loadingDocument,
    handleDocumentSelect,
    handleUpload,
    handleDeleteDocument,
    fetchProjectDocuments,
    setActiveDocument
  } = useDocuments(projectId, parentDocuments, setParentDocuments, onDocumentsUpdated);

  const {
    commentModalOpen,
    setCommentModalOpen,
    newComment,
    setNewComment,
    snackbarMessage,
    setSnackbarMessage,
    snackbarOpen,
    setSnackbarOpen,
    handleSaveComment,
  } = useAnnotations(projectId, onCommentsUpdated, refreshSidebar);

  const [selection, setSelection] = useState(null);
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState({ top: 0, left: 0 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const [showUploadFab, setShowUploadFab] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const minSidebarWidth = 300;
  const maxSidebarWidth = 800;

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

  // Keyboard shortcut to toggle documents panel
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + D to toggle documents panel
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && !event.shiftKey) {
        event.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close sidebar on mobile when document is selected
  useEffect(() => {
    if (isMobile && activeDocument) {
      setIsSidebarOpen(false);
    }
  }, [activeDocument, isMobile]);

  useEffect(() => {
    if (!isSidebarOpen && isMobile && activeDocument) {
      setTimeout(() => mainContentRef.current?.focus(), 0);
    }
  }, [isSidebarOpen, isMobile, activeDocument]);

  // Handle document selection from external sources
  useEffect(() => {
    if (selectedDocumentId && documents && Array.isArray(documents)) {
      const selectedDoc = documents.find(doc => doc.id === selectedDocumentId);
      if (selectedDoc) {
        handleDocumentSelect(selectedDoc);
        if (setSelectedDocumentId) {
          setSelectedDocumentId(null);
        }
      }
    }
  }, [selectedDocumentId, documents, setSelectedDocumentId, handleDocumentSelect]);

  const handleTextSelection = useCallback((selectionData) => {
    console.log('Text selection data:', selectionData);
    setSelection(selectionData);
    if (selectionData) {
      const position = {
          top: selectionData.rect.top + window.scrollY - 10,
          left: selectionData.rect.left + selectionData.rect.width / 2,
        };
      console.log('Setting toolbar position:', position);
      setSelectionPosition(position);
      setShowSelectionToolbar(true);
    } else {
      setShowSelectionToolbar(false);
    }
  }, []);

  const handleAddComment = () => {
    if (selection) {
      setCommentModalOpen(true);
      setShowSelectionToolbar(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDocumentSelectMobile = (doc) => {
    handleDocumentSelect(doc);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  // Show upload FAB when no document is selected or on mobile
  useEffect(() => {
    setShowUploadFab(isMobile && (!activeDocument || !isSidebarOpen));
  }, [isMobile, activeDocument, isSidebarOpen]);

  // Enhanced sidebar content
  const sidebarContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      width: isMobile ? '100vw' : 380,
      maxWidth: isMobile ? '100vw' : 380,
    }}>
      {/* Sidebar Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <MenuBookIcon sx={{ color: theme.palette.primary.main }} />
            Documents
          </Typography>
          <IconButton 
            onClick={() => setIsSidebarOpen(false)} 
            sx={{ 
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main
              }
            }}
          >
            {isMobile ? <CloseIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        {/* Compact Status Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${documents?.length || 0} Documents`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, height: 24 }}
          />
          {activeDocument && (
            <Chip
              label="Viewing"
              size="small"
              color="success"
              sx={{ fontWeight: 600, height: 24 }}
            />
          )}
          {uploading && (
            <Chip
              label="Uploading..."
              size="small"
              color="warning"
              icon={<CircularProgress size={12} />}
              sx={{ fontWeight: 600, height: 24 }}
            />
          )}
        </Box>
      </Box>

      {/* Upload Zone - Moved to top and made compact */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <UploadZone onUpload={handleUpload} uploading={uploading} />
      </Box>

      {/* Document List - Now below upload zone with better visibility */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {/* Section Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1
          }}>
            📁 Your Documents
            {documents?.length > 0 && (
              <Typography component="span" variant="caption" sx={{ 
                color: 'text.secondary',
                fontWeight: 400 
              }}>
                (Click to view)
              </Typography>
            )}
          </Typography>
          
          {documents?.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Upload documents above to start analyzing
            </Typography>
          )}
        </Box>

        {/* Documents List */}
        <Box sx={{ px: 2, pb: 2 }}>
          <DocumentList
            documents={documents}
            activeDocument={activeDocument}
            onDocumentSelect={handleDocumentSelectMobile}
            onDocumentDelete={handleDeleteDocument}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%', 
      width: '100%', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar 
          position="absolute" 
          elevation={0}
          sx={{ 
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.appBar,
            display: activeDocument ? 'block' : 'none'
          }}
        >
          <Toolbar variant="dense">
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleSidebar}
              sx={{ mr: 2, color: theme.palette.text.primary }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                color: theme.palette.text.primary,
                fontWeight: 600,
                fontSize: '1rem'
              }}
              noWrap
            >
              {activeDocument?.name || 'Documents'}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Sidebar / Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          PaperProps={{
            sx: {
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none',
            }
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Collapse in={isSidebarOpen} orientation="horizontal">
          <Paper 
            elevation={0} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
              position: 'relative',
              zIndex: 2
            }}
          >
            {sidebarContent}
          </Paper>
        </Collapse>
      )}

      {/* Toggle Sidebar Button (Desktop) - Always visible and properly positioned */}
      {!isMobile && !isSidebarOpen && (
        <Zoom in={true} timeout={500}>
          <Fab
            size="medium"
            color="primary"
            onClick={() => setIsSidebarOpen(true)}
            sx={{
              position: 'fixed',
              top: 20, // Clean positioning from top
              left: 20, // Clean positioning from left edge
              zIndex: 1200, // Lower z-index to stay below fullscreen controls (which are at 1600)
              boxShadow: theme.shadows[8],
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
              // Ensure visibility across all scenarios
              minWidth: '48px',
              minHeight: '48px',
              '&.MuiFab-root': {
                position: 'fixed !important', // Override any inherited positioning
              }
            }}
            aria-label="Open documents panel"
          >
            <MenuBookIcon />
          </Fab>
        </Zoom>
      )}

      {/* Main Content Area */}
      <Box 
        component="main"
        ref={mainContentRef}
        tabIndex="-1"
        sx={{
          flexGrow: 1,
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: isSidebarOpen && !isMobile ? 'calc(100% - 380px)' : '100%',
          pt: isMobile && activeDocument ? '48px' : 0, // Account for mobile app bar
          transition: isResizing ? 'none' : 'width 0.3s ease-in-out',
        }}>
        {/* Loading State */}
        {loadingDocument ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Loading document...
            </Typography>
          </Box>
        ) : activeDocument ? (
          // Document Viewer
          <Box 
            sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <DocumentViewer
              documentData={{...activeDocument, content: documentContent.join('\n')}}
              annotations={[
                ...(codeAssignments || []).filter(assignment => assignment.document_id === activeDocument.id),
                ...(commentData || []).filter(comment => comment.document_id === activeDocument.id)
              ]}
              onTextSelect={handleTextSelection}
              currentUserId={null}
            />
          </Box>
        ) : (
          // Welcome State
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%',
            height: '100%',
            flexDirection: 'column',
            gap: 3,
            p: 4,
            textAlign: 'center'
          }}>
            <Box sx={{
              p: 4,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              maxWidth: 400,
              width: '100%'
            }}>
              <MenuBookIcon sx={{ 
                fontSize: 64, 
                color: theme.palette.primary.main, 
                mb: 2,
                opacity: 0.8
              }} />
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 1
              }}>
                {documents?.length > 0 ? 'Select a Document' : 'No Documents Yet'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {documents?.length > 0 
                  ? 'Choose a document from the sidebar to start viewing and analyzing'
                  : 'Upload your first document to begin your thematic analysis journey'
                }
              </Typography>
              {isMobile && (
                <Button
                  variant="contained"
                  startIcon={<MenuIcon />}
                  onClick={() => setIsSidebarOpen(true)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3
                  }}
                >
                  {documents?.length > 0 ? 'Browse Documents' : 'Upload Documents'}
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Floating Upload Button (Mobile) */}
      {showUploadFab && (
        <Zoom in={showUploadFab}>
          <Fab
            color="primary"
            onClick={() => setIsSidebarOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: theme.zIndex.fab,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            <UploadFileIcon />
          </Fab>
        </Zoom>
      )}

      {/* Selection Toolbar */}
      {showSelectionToolbar && selection && (
        <FloatingSelectionToolbar
          show={showSelectionToolbar}
          position={selectionPosition}
          onAddComment={handleAddComment}
          onAssignCode={() => {
            if (setCodesModalOpen && setPendingCodeSelection) {
              setPendingCodeSelection(selection);
              setCodesModalOpen(true);
            }
            setShowSelectionToolbar(false);
          }}
        />
      )}

      {/* Comment Dialog */}
      <Dialog 
        open={commentModalOpen} 
        onClose={() => setCommentModalOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            m: isMobile ? 0 : 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          Add Comment
          {isMobile && (
            <IconButton onClick={() => setCommentModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your comment"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mt: 1 }}
          />
          {selection && (
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Selected text:
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                "{selection.text}"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setCommentModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleSaveComment(selection)} 
            variant="contained"
            disabled={!newComment.trim()}
            sx={{ borderRadius: 2 }}
          >
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={uploadError ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Documents;