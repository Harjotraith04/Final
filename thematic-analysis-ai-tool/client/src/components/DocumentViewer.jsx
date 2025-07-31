import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  alpha, 
  Chip, 
  Divider, 
  Tooltip, 
  IconButton,
  AppBar,
  Toolbar,
  Fab,
  Zoom,
  Slider,
  ButtonGroup,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop
} from '@mui/material';
import { 
  Description, 
  TableChart, 
  Assignment,
  ZoomIn,
  ZoomOut,
  RestartAlt,
  FormatSize,
  Palette,
  BookmarkBorder,
  Print,
  Share,
  FindInPage,
  ViewColumn,
  Article,
  Close,
  Settings,
  Fullscreen,
  FullscreenExit,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import ReadyToAnalyze from './ReadyToAnalyze';
import { getAnnotationColor } from '../utils/colorUtils';
import CodesContextPanel from './CodesContextPanel';
import CommentsPanel from './CommentsPanel';

const DocumentViewer = ({ documentData, annotations, onTextSelect, currentUserId }) => {
  const theme = useTheme();
  const contentRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const [fontSize, setFontSize] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [viewOptionsAnchor, setViewOptionsAnchor] = useState(null);
  const [fontFamily, setFontFamily] = useState('Inter, system-ui, sans-serif');
  const [lineHeight, setLineHeight] = useState(1.7);
  const [maxWidth, setMaxWidth] = useState('800px');
  const [isResizing, setIsResizing] = useState(false);
  
  // New state for panels
  const [selectedCodeId, setSelectedCodeId] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [showCodesPanel, setShowCodesPanel] = useState(true);
  const [showCommentsPanel, setShowCommentsPanel] = useState(true);
  const [documentHeight, setDocumentHeight] = useState(1000);

  // Separate annotations into comments (code assignments are handled below)
  const commentsFromAnnotations = useMemo(() => {
    return annotations?.filter(ann => 
      ann.annotation_type && 
      (ann.annotation_type === 'COMMENT' || ann.annotation_type === 'MEMO' || ann.annotation_type === 'QUESTION')
    ) || [];
  }, [annotations]);

  // Effect to calculate document height
  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setDocumentHeight(height);
    }
  }, [documentData, fontSize, lineHeight, zoom]);

  // Panel handlers
  const handleCodeClick = (codeGroup) => {
    setSelectedCodeId(selectedCodeId === codeGroup.id ? null : codeGroup.id);
  };

  const handleCodeNavigate = (assignment) => {
    // Scroll to the assignment in the document
    if (contentRef.current) {
      const element = contentRef.current.querySelector(`[data-assignment-id="${assignment.id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleCommentSelect = (commentId) => {
    setSelectedCommentId(selectedCommentId === commentId ? null : commentId);
  };

  const handleCommentReply = async (commentId, replyText) => {
    // TODO: Implement comment reply functionality
    console.log('Reply to comment:', commentId, replyText);
  };

  const handleCommentEdit = (comment) => {
    // TODO: Implement comment edit functionality
    console.log('Edit comment:', comment);
  };

  const handleCommentDelete = async (commentId) => {
    // TODO: Implement comment delete functionality
    console.log('Delete comment:', commentId);
  };

  const handleCommentResolve = async (commentId) => {
    // TODO: Implement comment resolve functionality
    console.log('Resolve comment:', commentId);
  };

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

  // Keyboard shortcut for fullscreen mode
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Escape key to exit fullscreen
      if (event.key === 'Escape' && isFullscreen) {
        event.preventDefault();
        setIsFullscreen(false);
      }
      // F11 to toggle fullscreen
      if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (!documentData) {
    return <ReadyToAnalyze />;
  }

  // Separate code assignments from comments and filter by document ID
  const codeAssignments = useMemo(() => {
    return (annotations || []).filter(annotation => 
      annotation.code_name && 
      annotation.start_char !== undefined && 
      annotation.end_char !== undefined &&
      annotation.document_id === documentData.id
    );
  }, [annotations, documentData.id]);

  const commentAnnotations = useMemo(() => {
    return (annotations || []).filter(annotation => 
      !annotation.code_name && 
      annotation.comment !== undefined &&
      annotation.document_id === documentData.id
    );
  }, [annotations, documentData.id]);

  // Combine comment annotations
  const allComments = useMemo(() => {
    return [...(commentsFromAnnotations || []), ...(commentAnnotations || [])];
  }, [commentsFromAnnotations, commentAnnotations]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || selection.isCollapsed) {
      onTextSelect(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText.trim().length === 0) {
      onTextSelect(null);
      return;
    }

    const contentElement = contentRef.current;
    if (!contentElement || !contentElement.contains(range.commonAncestorContainer)) {
      onTextSelect(null);
      return;
    }

    const getOffset = (node, offsetInNode) => {
      let container = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      const elementWithOffset = container.closest('[data-offset]');
      
      if (!elementWithOffset) {
        return -1;
      }

      const baseOffset = parseInt(elementWithOffset.dataset.offset, 10);
      if (isNaN(baseOffset)) {
        return -1;
      }
      
      const range = document.createRange();
      range.selectNodeContents(elementWithOffset);
      range.setEnd(node, offsetInNode);

      return baseOffset + range.toString().length;
    };

    const start = getOffset(range.startContainer, range.startOffset);
    const end = getOffset(range.endContainer, range.endOffset);

    if (start === -1 || end === -1 || start >= end) {
      onTextSelect(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const selectionData = {
      text: selectedText,
      documentId: documentData.id,
      start_char: start,
      end_char: end,
      rect,
    };
    
    onTextSelect(selectionData);
  }, [documentData, onTextSelect]);

  // Function to create highlighted content with code assignments
  const createHighlightedContent = (content) => {
    if (!codeAssignments || codeAssignments.length === 0) {
      return content;
    }

    // Sort code assignments by start position to process them in order
    const sortedAssignments = [...codeAssignments]
      .filter(assignment => 
        assignment.start_char !== undefined && 
        assignment.end_char !== undefined &&
        assignment.start_char >= 0 &&
        assignment.end_char <= content.length &&
        assignment.start_char < assignment.end_char &&
        assignment.document_id === documentData.id // Ensure it belongs to this document
      )
      .sort((a, b) => a.start_char - b.start_char);

    // If no valid assignments, return original content
    if (sortedAssignments.length === 0) {
      return content;
    }

    const segments = [];
    let lastIndex = 0;

    sortedAssignments.forEach((assignment, index) => {
      const { start_char, end_char, code_name, code_color } = assignment;
      
      // Add text before this assignment
      if (start_char > lastIndex) {
        segments.push({
          type: 'text',
          content: content.slice(lastIndex, start_char),
          startOffset: lastIndex,
          key: `text-${index}-${lastIndex}`
        });
      }

      // Add the highlighted assignment
      const assignmentText = content.slice(start_char, end_char);
      segments.push({
        type: 'highlight',
        content: assignmentText,
        code_name,
        code_color: code_color || getAnnotationColor({ code_name }),
        assignment,
        startOffset: start_char,
        key: `highlight-${index}-${start_char}`
      });

      lastIndex = end_char;
    });

    // Add any remaining text after the last assignment
    if (lastIndex < content.length) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex),
        startOffset: lastIndex,
        key: `text-final-${lastIndex}`
      });
    }

    return segments;
  };

  const renderHighlightedContent = (segments) => {
    if (typeof segments === 'string') {
      const paragraphs = segments.split('\n\n');
      let currentOffset = 0;
      // For non-highlighted content, split into paragraphs
      return paragraphs.map((paragraph, index) => {
        const pOffset = currentOffset;
        currentOffset += paragraph.length + 2; // for \n\n
        return (
          <Typography 
            key={`paragraph-${index}`} 
            variant="body1" 
            component="p"
            data-offset={pOffset}
            sx={{ 
              mb: 2.5, 
              lineHeight,
              color: theme.palette.text.primary,
              textAlign: 'justify',
              fontSize: `${fontSize}px`,
              fontFamily,
              wordSpacing: '0.1em',
              letterSpacing: '0.01em',
              textIndent: readingMode ? '1.5em' : 0,
              '&:first-of-type': {
                textIndent: 0,
              },
            }}
          >
            {paragraph}
          </Typography>
        );
      });
    }

    return segments.map((segment) => {
      if (segment.type === 'text') {
        // Split text segments into paragraphs, preserving the highlighting structure
        const paragraphs = segment.content.split('\n\n');
        let currentOffset = segment.startOffset;
        return paragraphs.map((paragraph, pIndex) => {
          if (!paragraph.trim()) return null;
          const pOffset = currentOffset;
          currentOffset += paragraph.length + 2; // for \n\n
          return (
            <span 
              key={`${segment.key}-p${pIndex}`} 
              data-offset={pOffset}
              style={{ 
                lineHeight,
                color: theme.palette.text.primary,
                fontSize: `${fontSize}px`,
                fontFamily,
                wordSpacing: '0.1em',
                letterSpacing: '0.01em',
              }}
            >
              {paragraph}
              {pIndex < paragraphs.length - 1 && <><br /><br /></>}
            </span>
          );
        }).filter(Boolean);
      } else if (segment.type === 'highlight') {
        return (
          <Tooltip 
            key={segment.key}
            title={
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Code: {segment.code_name}
                </Typography>
                <Typography variant="caption">
                  Click to view code details
                </Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <span
              data-assignment-id={segment.assignment?.id}
              data-offset={segment.startOffset}
              style={{
                backgroundColor: alpha(segment.code_color, 0.25),
                color: theme.palette.getContrastText(segment.code_color),
                padding: '3px 6px',
                borderRadius: '6px',
                border: `2px solid ${alpha(segment.code_color, 0.5)}`,
                cursor: 'pointer',
                display: 'inline',
                lineHeight,
                fontWeight: 600,
                fontSize: `${fontSize}px`,
                fontFamily,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 2px 4px ${alpha(segment.code_color, 0.2)}`,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = alpha(segment.code_color, 0.4);
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = `0 4px 8px ${alpha(segment.code_color, 0.3)}`;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = alpha(segment.code_color, 0.25);
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = `0 2px 4px ${alpha(segment.code_color, 0.2)}`;
              }}
              onClick={() => {
                console.log('Code assignment clicked:', segment.assignment);
                // You can add navigation to code details here
              }}
            >
              {segment.content}
            </span>
          </Tooltip>
        );
      }
      return null;
    }).filter(Boolean);
  };

  const getHighlightedContent = () => {
    if (!documentData || !documentData.content) return null;

    const content = documentData.content;
    
    // Create highlighted segments for the content
    const segments = createHighlightedContent(content);
    
    // Return highlighted content for all file types
    return renderHighlightedContent(segments);
  };



  const getFileIcon = () => {
    const fileName = documentData.name.toLowerCase();
    if (fileName.includes('.csv')) return <TableChart sx={{ fontSize: 20 }} />;
    if (fileName.includes('.pdf')) return <Description sx={{ fontSize: 20 }} />;
    return <Assignment sx={{ fontSize: 20 }} />;
  };

  const getFileTypeChip = () => {
    const fileName = documentData.name.toLowerCase();
    let type = 'Document';
    let color = 'default';
    
    if (fileName.includes('.csv')) {
      type = 'CSV Data';
      color = 'success';
    } else if (fileName.includes('.pdf')) {
      type = 'PDF';
      color = 'error';
    } else if (fileName.includes('.txt')) {
      type = 'Text';
      color = 'info';
    }
    
    return (
      <Chip 
        label={type} 
        size="small" 
        color={color}
        variant="outlined"
        sx={{ 
          ml: 1,
          fontSize: '0.7rem',
          height: '22px',
          fontWeight: 600,
          '& .MuiChip-label': {
            px: 1
          }
        }}
      />
    );
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const handleFontSizeChange = (event, newValue) => {
    setFontSize(newValue);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleReadingMode = () => {
    setReadingMode(!readingMode);
  };

  const speedDialActions = [
    { icon: <Print />, name: 'Print', onClick: () => window.print() },
    { icon: <Share />, name: 'Share', onClick: () => {} },
    { icon: <BookmarkBorder />, name: 'Bookmark', onClick: () => {} },
    { icon: <FindInPage />, name: 'Find', onClick: () => {} },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'row',
      height: '100%', 
      width: '100%', 
      maxWidth: '100%',
      position: isFullscreen ? 'fixed' : 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: isFullscreen ? 1300 : 'auto',
      backgroundColor: isFullscreen ? theme.palette.background.default : 'transparent',
    }}>
      {/* Main Document Container */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1,
        height: '100%', 
        width: showCodesPanel ? 'calc(100% - 320px)' : '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'width 0.3s ease-in-out',
      }}>
      {/* Enhanced Header/Toolbar */}
      <AppBar 
        position="absolute" 
        elevation={0}
        sx={{ 
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          zIndex: isFullscreen ? 1600 : 10, // Higher z-index in fullscreen to stay above floating buttons
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: '56px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {getFileIcon()}
            <Typography variant="h6" sx={{ 
              ml: 1.5, 
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              flex: 1,
              minWidth: 0,
            }} noWrap>
              {documentData.name}
            </Typography>
            {getFileTypeChip()}
          </Box>

          {/* Toolbar Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Zoom Controls */}
            <ButtonGroup size="small" variant="outlined">
              <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOut fontSize="small" />
              </IconButton>
              <Button size="small" onClick={handleZoomReset} sx={{ minWidth: '60px' }}>
                {zoom}%
              </Button>
              <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomIn fontSize="small" />
              </IconButton>
            </ButtonGroup>

            {/* View Options */}
            <IconButton 
              size="small"
              onClick={(e) => setViewOptionsAnchor(e.currentTarget)}
            >
              <Settings fontSize="small" />
            </IconButton>

            {/* Reading Mode */}
            <IconButton 
              size="small"
              onClick={toggleReadingMode}
              color={readingMode ? "primary" : "default"}
            >
              <Article fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="Toggle Comments">
                <IconButton 
                  size="small" 
                  onClick={() => setShowCommentsPanel(prev => !prev)}
                  color={showCommentsPanel ? "primary" : "default"}
                >
                  <ChatBubbleOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Toggle Codes">
                <IconButton 
                  size="small" 
                  onClick={() => setShowCodesPanel(prev => !prev)}
                  color={showCodesPanel ? "primary" : "default"}
                >
                  <LocalOfferIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}>
                <IconButton 
                  size="small" 
                  onClick={toggleFullscreen}
                  sx={{
                    zIndex: isFullscreen ? 1650 : 'auto',
                    position: 'relative',
                  }}
                >
                  {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>

      </AppBar>

      {/* Enhanced Content */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          pt: '72px', // Removed conditional padding since code stats bar is gone
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: readingMode ? alpha(theme.palette.background.paper, 0.9) : 'transparent',
        }} 
      >
        <Paper 
          elevation={readingMode ? 2 : 0} 
          sx={{ 
            p: { xs: 2, sm: 4, md: 6 }, 
            background: readingMode ? theme.palette.background.paper : 'transparent',
            borderRadius: readingMode ? '16px' : '0px',
            boxShadow: readingMode ? theme.shadows[4] : 'none',
            width: '100%',
            height: 'fit-content',
            minHeight: readingMode ? 'calc(100vh - 200px)' : '100%',
            maxWidth: readingMode ? maxWidth : '100%',
            margin: readingMode ? '20px' : 0,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: isResizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Document Content */}
          <Box 
            sx={{ 
              width: '100%',
              '& > *:last-child': { mb: 4 },
            }}
            ref={contentRef}
            onMouseUp={handleMouseUp}
          >
            {getHighlightedContent()}
          </Box>
        </Paper>
      </Box>

      {/* View Options Menu */}
      <Menu
        anchorEl={viewOptionsAnchor}
        open={Boolean(viewOptionsAnchor)}
        onClose={() => setViewOptionsAnchor(null)}
        PaperProps={{
          sx: { width: '300px', p: 1 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Font Size</Typography>
          <Slider
            value={fontSize}
            onChange={handleFontSizeChange}
            min={12}
            max={24}
            step={1}
            marks
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>Line Height</Typography>
          <Slider
            value={lineHeight}
            onChange={(e, v) => setLineHeight(v)}
            min={1.2}
            max={2.5}
            step={0.1}
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />



          <Typography variant="subtitle2" gutterBottom>Max Width</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['600px', '800px', '1000px', '100%'].map((width) => (
              <Button
                key={width}
                size="small"
                variant={maxWidth === width ? 'contained' : 'outlined'}
                onClick={() => setMaxWidth(width)}
              >
                {width === '100%' ? 'Full' : width}
              </Button>
            ))}
          </Box>
        </Box>
      </Menu>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Document Actions"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          zIndex: 1200,
          '& .MuiFab-primary': {
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }
        }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
        direction="up"
      >
        <SpeedDialAction
          key="fullscreen"
          icon={isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          tooltipTitle={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
        />
        <SpeedDialAction
          key="reading-mode"
          icon={<Article />}
          tooltipTitle="Reading Mode"
          onClick={() => setReadingMode(!readingMode)}
        />
        <SpeedDialAction
          key="zoom-in"
          icon={<ZoomIn />}
          tooltipTitle="Zoom In"
          onClick={() => setZoom(prev => Math.min(prev + 10, 200))}
        />
        <SpeedDialAction
          key="zoom-out"
          icon={<ZoomOut />}
          tooltipTitle="Zoom Out"
          onClick={() => setZoom(prev => Math.max(prev - 10, 50))}
        />
        <SpeedDialAction
          key="reset-zoom"
          icon={<RestartAlt />}
          tooltipTitle="Reset Zoom"
          onClick={() => setZoom(100)}
        />
      </SpeedDial>

      

      {/* Backdrop for fullscreen mode */}
      {isFullscreen && (
        <Backdrop
          sx={{ color: '#fff', zIndex: 1200 }}
          open={false}
        />
      )}
      </Box>

      {/* Comments Panel */}
      {showCommentsPanel && (
        <CommentsPanel
          comments={allComments}
          documentContent={documentData?.content || ''}
          onCommentReply={handleCommentReply}
          onCommentEdit={handleCommentEdit}
          onCommentDelete={handleCommentDelete}
          onCommentResolve={handleCommentResolve}
          selectedCommentId={selectedCommentId}
          onCommentSelect={handleCommentSelect}
          currentUserId={currentUserId}
          documentHeight={documentHeight}
          onClose={() => setShowCommentsPanel(false)}
        />
      )}

      {/* Codes Context Panel */}
      {showCodesPanel && (
        <CodesContextPanel
          codeAssignments={codeAssignments}
          onCodeClick={handleCodeClick}
          onCodeNavigate={handleCodeNavigate}
          documentContent={documentData?.content || ''}
          selectedCodeId={selectedCodeId}
          onClose={() => setShowCodesPanel(false)}
        />
      )}
    </Box>
  );
};

export default DocumentViewer;