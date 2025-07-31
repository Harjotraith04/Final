import React, { useState, useMemo } from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  useTheme,
  alpha,
  styled,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { getFileIcon } from '../utils/fileUtils.jsx';

const ListItemCard = styled(ListItemButton)(({ theme, selected }) => ({
  marginBottom: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  border: `2px solid ${selected ? theme.palette.primary.main : 'transparent'}`,
  backgroundColor: selected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  padding: theme.spacing(1, 1.5),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    border: `2px solid ${theme.palette.primary.main}`,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[2],
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.background.default, 0.6),
    height: '36px',
    '& input': {
      padding: '8px 12px',
      fontSize: '0.875rem',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const DocumentList = ({ documents, activeDocument, onDocumentSelect, onDocumentDelete }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDocForMenu, setSelectedDocForMenu] = useState(null);

  // Filter documents based on search term
  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents;
    
    return documents.filter(doc => 
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  const handleMenuClick = (event, doc) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDocForMenu(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocForMenu(null);
  };

  const handleDelete = () => {
    if (selectedDocForMenu) {
      onDocumentDelete(selectedDocForMenu.id);
    }
    handleMenuClose();
  };

  const getFileSize = (doc) => {
    if (doc.file_size) {
      const size = parseInt(doc.file_size);
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    return '';
  };

  const getDocumentTypeColor = (docType) => {
    const typeColors = {
      'pdf': theme.palette.error.main,
      'csv': theme.palette.success.main,
      'txt': theme.palette.info.main,
      'doc': theme.palette.primary.main,
      'docx': theme.palette.primary.main,
    };
    
    const extension = docType?.toLowerCase() || 'unknown';
    return typeColors[extension] || theme.palette.grey[500];
  };

  if (documents.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No documents uploaded yet
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Use the upload area above to add documents
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Compact Search */}
      {documents.length > 3 && (
        <StyledTextField
          fullWidth
          size="small"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />
      )}

      {/* Compact Document Counter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
      </Box>

      {/* Compact Document List */}
      <List disablePadding sx={{ '& .MuiListItemButton-root': { minHeight: 'auto' } }}>
        {filteredDocuments.map((doc) => (
          <ListItemCard
            key={doc.id}
            selected={activeDocument?.id === doc.id}
            onClick={() => onDocumentSelect(doc)}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {getFileIcon(doc.document_type, { 
                sx: { 
                  color: getDocumentTypeColor(doc.document_type),
                  fontSize: 20 
                } 
              })}
            </ListItemIcon>
            
            <ListItemText 
              primary={
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }} noWrap>
                  {doc.name}
                </Typography>
              }
              secondary={
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Chip
                    label={doc.document_type?.toUpperCase() || 'DOC'}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.6rem',
                      backgroundColor: alpha(getDocumentTypeColor(doc.document_type), 0.1),
                      color: getDocumentTypeColor(doc.document_type),
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                  {getFileSize(doc) && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {getFileSize(doc)}
                    </Typography>
                  )}
                </span>
              }
              secondaryTypographyProps={{ component: 'div' }}
              sx={{ margin: 0 }}
            />
            
            <IconButton 
              edge="end" 
              size="small"
              onClick={(e) => handleMenuClick(e, doc)}
              sx={{ 
                opacity: 0.6,
                ml: 0.5,
                '&:hover': { 
                  opacity: 1, 
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main 
                }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </ListItemCard>
        ))}
      </List>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          if (selectedDocForMenu) onDocumentSelect(selectedDocForMenu);
          handleMenuClose();
        }}>
          <Typography variant="body2">Open Document</Typography>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleDelete}
          sx={{ 
            color: theme.palette.error.main,
            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DocumentList;