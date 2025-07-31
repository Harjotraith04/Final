import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  alpha, 
  LinearProgress, 
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Fade,
  Slide,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider
} from '@mui/material';
import { styled } from '@mui/system';
import { 
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
  Assignment as AssignmentIcon,
  FileUpload,
  Add as AddIcon
} from '@mui/icons-material';

const DropzoneArea = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isdragging' && prop !== 'hasFiles',
})(({ theme, isdragging, hasFiles }) => ({
  border: `2px dashed ${isdragging === 'true' 
    ? theme.palette.primary.main 
    : hasFiles 
      ? theme.palette.success.main 
      : alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isdragging === 'true' 
    ? alpha(theme.palette.primary.main, 0.08)
    : hasFiles
      ? alpha(theme.palette.success.main, 0.05)
      : alpha(theme.palette.background.default, 0.3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  minHeight: '80px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-1px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.2)}, transparent)`,
    transition: 'left 0.6s ease',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const FilePreviewCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
}));

const UploadZone = ({ onUpload, uploading }) => {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    const iconProps = { sx: { fontSize: 24, color: theme.palette.primary.main } };
    
    switch (extension) {
      case 'pdf':
        return <DescriptionIcon {...iconProps} sx={{ ...iconProps.sx, color: theme.palette.error.main }} />;
      case 'csv':
        return <TableChartIcon {...iconProps} sx={{ ...iconProps.sx, color: theme.palette.success.main }} />;
      case 'txt':
      case 'doc':
      case 'docx':
        return <AssignmentIcon {...iconProps} sx={{ ...iconProps.sx, color: theme.palette.info.main }} />;
      default:
        return <FileIcon {...iconProps} />;
    }
  };

  const getFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.csv'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const extension = '.' + file.name.toLowerCase().split('.').pop();
    
    if (!allowedTypes.includes(extension)) {
      return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize) {
      return `File too large. Maximum size: 10MB`;
    }
    
    return null;
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSelectFiles = useCallback((event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  }, []);

  const processFiles = (files) => {
    const newFiles = [];
    const errors = {};
    
    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors[file.name] = error;
      } else {
        // Check for duplicates
        const isDuplicate = selectedFiles.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );
        
        if (!isDuplicate) {
          newFiles.push({
            file,
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'ready' // ready, uploading, success, error
          });
        } else {
          errors[file.name] = 'File already selected';
        }
      }
    });
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setFileErrors(errors);
    
    // Clear errors after 5 seconds
    if (Object.keys(errors).length > 0) {
      setTimeout(() => setFileErrors({}), 5000);
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return;
    
    // Update file statuses to uploading
    setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })));
    
    // Simulate upload progress (you would replace this with actual upload logic)
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(prev => ({ ...prev, [file.id]: progress }));
      }
    }
    
    // Call the actual upload function
    const filesToUpload = selectedFiles.map(f => f.file);
    await onUpload(filesToUpload);
    
    // Update statuses to success
    setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'success' })));
    
    // Clear files after successful upload
    setTimeout(() => {
      setSelectedFiles([]);
      setUploadProgress({});
    }, 2000);
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    setFileErrors({});
  };

  return (
    <Box>
      {/* Hidden file input */}
      <input
        accept=".pdf,.doc,.docx,.txt,.csv"
        style={{ display: 'none' }}
        id="file-upload-input"
        multiple
        type="file"
        onChange={handleSelectFiles}
        disabled={uploading}
      />
      
      {/* Main Upload Area */}
      <label htmlFor="file-upload-input">
        <DropzoneArea
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          isdragging={isDragging.toString()}
          hasFiles={selectedFiles.length > 0}
          component="div"
        >
          <Fade in={!isDragging}>
            <CloudUploadIcon 
              sx={{ 
                fontSize: 32, 
                color: selectedFiles.length > 0 ? 'success.main' : 'primary.main',
                mb: 0.5
              }}
            />
          </Fade>
          
          <Fade in={isDragging}>
            <Box sx={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>
              <FileUpload 
                sx={{ 
                  fontSize: 32, 
                  color: 'primary.main',
                  animation: 'bounce 1s infinite'
                }}
              />
            </Box>
          </Fade>
          
          <Typography variant="subtitle2" sx={{ 
            mb: 0.5, 
            fontWeight: 600,
            fontSize: '0.875rem',
            color: selectedFiles.length > 0 ? 'success.main' : 'text.primary'
          }}>
            {isDragging 
              ? 'Drop files here!' 
              : selectedFiles.length > 0 
                ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
                : 'Drag & drop or click'
            }
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontSize: '0.7rem' }}>
            PDF, DOC, DOCX, TXT, CSV • Max 10MB
          </Typography>
          
          {selectedFiles.length === 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              sx={{ 
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                py: 0.5
              }}
            >
              Choose Files
            </Button>
          )}
        </DropzoneArea>
      </label>

      {/* File Preview List */}
      {selectedFiles.length > 0 && (
        <Slide direction="up" in={selectedFiles.length > 0}>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Selected Files ({selectedFiles.length})
              </Typography>
              <Button
                size="small"
                onClick={clearAll}
                sx={{ textTransform: 'none' }}
              >
                Clear All
              </Button>
            </Box>
            
            <Paper sx={{ borderRadius: 2, overflow: 'hidden', backgroundColor: alpha(theme.palette.background.default, 0.5) }}>
              <List disablePadding>
                {selectedFiles.map((fileItem, index) => (
                  <React.Fragment key={fileItem.id}>
                    <ListItem sx={{ py: 1.5 }}>
                      <ListItemIcon>
                        {fileItem.status === 'success' ? (
                          <CheckCircleIcon sx={{ color: 'success.main' }} />
                        ) : fileItem.status === 'uploading' ? (
                          <CircularProgress size={20} />
                        ) : (
                          getFileIcon(fileItem.name)
                        )}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }} noWrap>
                            {fileItem.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {getFileSize(fileItem.size)}
                            </Typography>
                            <Chip
                              label={fileItem.name.toLowerCase().split('.').pop().toUpperCase()}
                              size="small"
                              sx={{ 
                                height: 18, 
                                fontSize: '0.65rem',
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main'
                              }}
                            />
                            {fileItem.status === 'success' && (
                              <Chip
                                label="Uploaded"
                                size="small"
                                color="success"
                                sx={{ height: 18, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        {fileItem.status !== 'uploading' && fileItem.status !== 'success' && (
                          <Tooltip title="Remove file">
                            <IconButton 
                              edge="end" 
                              size="small"
                              onClick={() => removeFile(fileItem.id)}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { 
                                  color: 'error.main',
                                  backgroundColor: alpha(theme.palette.error.main, 0.1)
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    {/* Upload Progress */}
                    {fileItem.status === 'uploading' && uploadProgress[fileItem.id] !== undefined && (
                      <Box sx={{ px: 2, pb: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadProgress[fileItem.id]}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Uploading... {uploadProgress[fileItem.id]}%
                        </Typography>
                      </Box>
                    )}
                    
                    {index < selectedFiles.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Box>
        </Slide>
      )}

      {/* Error Messages */}
      {Object.keys(fileErrors).length > 0 && (
        <Fade in={Object.keys(fileErrors).length > 0}>
          <Box sx={{ mt: 2 }}>
            {Object.entries(fileErrors).map(([fileName, error]) => (
              <Box key={fileName} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon sx={{ color: 'error.main', mr: 1, fontSize: 20 }} />
                <Typography variant="body2" color="error.main">
                  <strong>{fileName}:</strong> {error}
                </Typography>
              </Box>
            ))}
          </Box>
        </Fade>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && !uploading && (
        <Slide direction="up" in={selectedFiles.length > 0}>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleUploadClick}
              disabled={uploading || selectedFiles.every(f => f.status === 'success')}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
              sx={{
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              {uploading 
                ? 'Uploading...' 
                : selectedFiles.every(f => f.status === 'success')
                  ? 'All Files Uploaded'
                  : `Upload ${selectedFiles.filter(f => f.status === 'ready').length} File${selectedFiles.filter(f => f.status === 'ready').length !== 1 ? 's' : ''}`
              }
            </Button>
          </Box>
        </Slide>
      )}

      {/* Global Upload Progress */}
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Processing files...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UploadZone;