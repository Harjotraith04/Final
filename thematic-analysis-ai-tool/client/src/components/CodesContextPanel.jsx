import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  alpha,
  Collapse,
  Badge,
  Button
} from '@mui/material';
import {
  Code as CodeIcon,
  ExpandMore,
  ExpandLess,
  Visibility,
  VisibilityOff,
  LocationOn,
  BookmarkBorder
} from '@mui/icons-material';

const CodesContextPanel = ({ 
  codeAssignments = [], 
  onCodeClick, 
  onCodeNavigate,
  documentContent = "",
  selectedCodeId = null,
  className = "",
  onClose,
}) => {
  const theme = useTheme();
  const [hiddenCodes, setHiddenCodes] = useState(new Set());

  // Group code assignments by code and calculate statistics
  const codeGroups = useMemo(() => {
    const groups = {};
    
    codeAssignments.forEach(assignment => {
      const codeId = assignment.code_id;
      const codeName = assignment.code_name || `Code ${codeId}`;
      const codeColor = assignment.code_color || '#4ECDC4';
      
      if (!groups[codeId]) {
        groups[codeId] = {
          id: codeId,
          name: codeName,
          color: codeColor,
          assignments: [],
          totalChars: 0,
          avgLength: 0
        };
      }
      
      groups[codeId].assignments.push(assignment);
      groups[codeId].totalChars += (assignment.end_char - assignment.start_char);
    });

    // Calculate average length and sort by frequency
    Object.values(groups).forEach(group => {
      group.avgLength = Math.round(group.totalChars / group.assignments.length);
    });

    return Object.values(groups).sort((a, b) => b.assignments.length - a.assignments.length);
  }, [codeAssignments]);

  const toggleCodeVisibility = (codeId) => {
    const newHidden = new Set(hiddenCodes);
    if (newHidden.has(codeId)) {
      newHidden.delete(codeId);
    } else {
      newHidden.add(codeId);
    }
    setHiddenCodes(newHidden);
  };

  const getTextPreview = (assignment) => {
    if (!documentContent) return assignment.text_snapshot || '';
    
    const start = Math.max(0, assignment.start_char - 20);
    const end = Math.min(documentContent.length, assignment.end_char + 20);
    const preview = documentContent.slice(start, end);
    
    const beforeText = start > 0 ? '...' : '';
    const afterText = end < documentContent.length ? '...' : '';
    
    return `${beforeText}${preview}${afterText}`;
  };

  return (
    <Paper
      className={className}
      sx={{
        width: 320,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        borderLeft: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease-in-out',
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Applied Codes
          </Typography>
          <Chip 
            label={codeGroups.length} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
        
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ color: theme.palette.text.secondary }}
        >
          <ExpandMore />
        </IconButton>
      </Box>

      {/* Codes List */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {codeGroups.length === 0 ? (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            opacity: 0.7
          }}>
            <BookmarkBorder sx={{ fontSize: 48, color: theme.palette.text.secondary }} />
            <Typography variant="body2" color="text.secondary">
              No codes applied to this document yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
            {codeGroups.map((codeGroup) => (
              <Box key={codeGroup.id}>
                <ListItem
                  disablePadding
                  sx={{
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    backgroundColor: selectedCodeId === codeGroup.id 
                      ? alpha(codeGroup.color, 0.1) 
                      : 'transparent'
                  }}
                >
                  <ListItemButton
                    onClick={() => onCodeClick?.(codeGroup)}
                    sx={{ 
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: alpha(codeGroup.color, 0.1)
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          backgroundColor: codeGroup.color,
                          color: theme.palette.getContrastText(codeGroup.color),
                          fontSize: '0.8rem',
                          opacity: hiddenCodes.has(codeGroup.id) ? 0.4 : 1
                        }}
                      >
                        {codeGroup.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            sx={{ 
                              flexGrow: 1,
                              opacity: hiddenCodes.has(codeGroup.id) ? 0.4 : 1
                            }}
                          >
                            {codeGroup.name}
                          </Typography>
                          <Chip 
                            label={codeGroup.assignments.length} 
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: alpha(codeGroup.color, 0.2),
                              color: codeGroup.color,
                              opacity: hiddenCodes.has(codeGroup.id) ? 0.4 : 1
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ opacity: hiddenCodes.has(codeGroup.id) ? 0.4 : 1 }}
                        >
                          Avg: {codeGroup.avgLength} chars
                        </Typography>
                      }
                    />
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCodeVisibility(codeGroup.id);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {hiddenCodes.has(codeGroup.id) ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </ListItemButton>
                </ListItem>
                
                {/* Code instances */}
                <Collapse in={selectedCodeId === codeGroup.id}>
                  <List disablePadding sx={{ backgroundColor: alpha(codeGroup.color, 0.05) }}>
                    {codeGroup.assignments.map((assignment, index) => (
                      <ListItem key={`${assignment.id}-${index}`} disablePadding>
                        <ListItemButton
                          onClick={() => onCodeNavigate?.(assignment)}
                          sx={{ 
                            pl: 6,
                            py: 1,
                            '&:hover': {
                              backgroundColor: alpha(codeGroup.color, 0.15)
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <LocationOn 
                              fontSize="small" 
                              sx={{ color: codeGroup.color }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontStyle: 'italic',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                "{getTextPreview(assignment)}"
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                Characters {assignment.start_char}-{assignment.end_char}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default CodesContextPanel; 