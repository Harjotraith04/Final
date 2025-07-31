import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
  Fade,
  Slide,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  alpha,
  Paper,
  Stack,
  Chip,
  Drawer,
  useMediaQuery,
  AppBar,
  Toolbar,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import FolderIcon from '@mui/icons-material/Folder';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ProfileButton from './ProfileButton';
import { ThemeModeContext } from '../App';
import { 
  NavigationCard, 
  AnimatedChip, 
  GradientButton, 
  StatusBadge,
  LoadingSkeleton 
} from './StyledComponents';

function Navigation({ 
  activeMenuItem, 
  handleMenuItemClick, 
  selectedFiles, 
  documents, 
  activeFile, 
  setActiveFile, 
  handleRemoveFile, 
  onDocumentSelect, 
  onNavigationToggle,
  onFileUpload,
  onFileDelete 
}) {
  const theme = useTheme();
  const { toggleColorMode, mode } = useContext(ThemeModeContext);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Media queries for responsive behavior
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Toggle mobile drawer
  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Close mobile drawer when menu item is clicked
  const handleMobileMenuItemClick = (itemName) => {
    handleMenuItemClick(itemName);
    if (isMobile || isTablet) {
      setMobileDrawerOpen(false);
    }
  };

  // Notify parent component when navigation state changes
  React.useEffect(() => {
    if (onNavigationToggle) {
      onNavigationToggle(isExpanded);
    }
  }, [isExpanded, onNavigationToggle]);

  const menuItems = [
    {
      name: 'Documents',
      icon: <DescriptionOutlinedIcon />,
      description: 'Manage research documents'
    },
    {
      name: 'Research details',
      icon: <ScienceOutlinedIcon />,
      description: 'Configure research parameters'
    },
    {
      name: 'Comments',
      icon: <CommentOutlinedIcon />,
      description: 'View document annotations'
    },
    {
      name: 'Codebook',
      icon: <BookOutlinedIcon />,
      description: 'Organize research codes'
    },
    {
      name: 'Merging Page',
      icon: <MergeTypeIcon />,
      description: 'Merge and organize themes'
    },
    {
      name: 'Visualizations',
      icon: <BarChartOutlinedIcon />,
      description: 'Explore thematic analysis visualizations'
    }
  ];

  // Add click handler prevention to stop event propagation
  const handleButtonClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    handleMobileMenuItemClick(item.name);
  };

  // Render the navigation content (shared between drawer and sidebar)
  const renderNavigationContent = (isTemporaryDrawer = false) => (
    <Box
      sx={{
        width: isExpanded || isTemporaryDrawer ? 280 : 80,
        height: '100vh',
        bgcolor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease-in-out',
        // Remove all overflow scrolling - make it fixed
        overflow: 'hidden',
      }}
    >
      {/* Header Section - Modernized */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        height: 80,
        borderBottom: `1px solid ${theme.palette.divider}`,
        flexShrink: 0,
        bgcolor: theme.palette.background.paper,
      }}>
        <Collapse in={isExpanded || isTemporaryDrawer} orientation="horizontal" timeout={300}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOutlinedIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" noWrap sx={{ fontWeight: 600, color: theme.palette.text.primary, lineHeight: 1.2 }}>
                Thematic Analysis
              </Typography>
              <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                AI Research Tool
              </Typography>
            </Box>
          </Box>
        </Collapse>
        
        {/* Collapsed Logo */}
        {!(isExpanded || isTemporaryDrawer) && (
          <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOutlinedIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
            </Box>
          </Box>
        )}
      </Box>


      {/* Theme Toggle Section - Fixed */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isExpanded || isTemporaryDrawer ? 'flex-start' : 'center',
        mx: isExpanded || isTemporaryDrawer ? 2 : 'auto',
        my: 1,
        p: 1,
        width: isExpanded || isTemporaryDrawer ? 'auto' : '48px',
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        flexShrink: 0, // Prevent shrinking
      }}>
        <Tooltip title={isExpanded || isTemporaryDrawer ? '' : (theme.palette.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode')}>
          <IconButton 
            onClick={toggleColorMode} 
            color="inherit" 
            size="small"
            sx={{ 
              mr: isExpanded || isTemporaryDrawer ? 1 : 0,
              transition: 'transform 0.2s',
              color: theme.palette.primary.main,
              '&:hover': {
                transform: 'rotate(30deg)',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
        {(isExpanded || isTemporaryDrawer) && (
          <Fade in={isExpanded || isTemporaryDrawer}>
            <Typography variant="body2" sx={{ 
              fontSize: '0.875rem',
              fontWeight: 500,
              color: theme.palette.primary.main 
            }}>
              {theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Typography>
          </Fade>
        )}
      </Box>        
      
      {/* Menu Items - Flexible center section */}
      <Box sx={{ 
        flex: 1, // Take up remaining space
        display: 'flex', 
        flexDirection: 'column', 
        gap: 0.5,
        px: isExpanded || isTemporaryDrawer ? 2 : 1,
        py: 1,
        alignItems: isExpanded || isTemporaryDrawer ? 'stretch' : 'center',
        // No overflow - all items should fit in available space
        overflow: 'hidden',
      }}>
        {menuItems.map((item) => (
          <Tooltip 
            key={item.name}
            title={!(isExpanded || isTemporaryDrawer) ? item.name : ''}
            placement="right"
          >
            <GradientButton
              variant={activeMenuItem === item.name ? 'contained' : 'text'}
              onClick={(e) => handleButtonClick(e, item)}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              sx={{
                justifyContent: isExpanded || isTemporaryDrawer ? 'flex-start' : 'center',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 2,
                gap: 2,
                width: '100%',
                mx: isExpanded || isTemporaryDrawer ? 0 : 'auto',
                minHeight: '52px',
                maxHeight: '52px', // Fixed height to prevent growth
                color: activeMenuItem === item.name ? 'white' : theme.palette.text.primary,
                bgcolor: activeMenuItem === item.name ? 'transparent' : 'transparent',
                background: activeMenuItem === item.name 
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                  : 'transparent',
                transition: 'all 0.3s ease-in-out',
                transform: hoveredItem === item.name && activeMenuItem !== item.name ? 'translateX(4px) scale(1.02)' : 'none',
                '&:hover': {
                  background: activeMenuItem === item.name 
                    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                    : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.1)} 100%)`,
                  boxShadow: activeMenuItem === item.name 
                    ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                    : '0 4px 15px rgba(0,0,0,0.1)',
                  transform: 'translateX(4px) scale(1.02)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&:after': activeMenuItem === item.name ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '4px',
                  background: `linear-gradient(to bottom, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                } : {},
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minWidth: '24px',
                flexShrink: 0
              }}>
                {item.icon}
              </Box>
              <Collapse in={isExpanded || isTemporaryDrawer} orientation="horizontal">
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  flexGrow: 1,
                  width: '100%',
                  overflow: 'hidden',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ flexGrow: 1, overflow: 'hidden', textAlign: 'left' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: 'inherit',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          color: activeMenuItem === item.name 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : theme.palette.text.secondary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.1,
                          fontSize: '0.7rem',
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Collapse>
            </GradientButton>
          </Tooltip>
        ))}
      </Box>

      {/* Bottom Section - Fixed at bottom */}
      <Box sx={{ 
        flexShrink: 0, // Prevent shrinking
        marginTop: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
      }}>
        {/* Desktop Toggle Button */}
        {isDesktop && (
          <Box sx={{ p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              fullWidth
              variant="text"
              sx={{
                justifyContent: isExpanded ? 'space-between' : 'center',
                alignItems: 'center',
                minWidth: 'auto',
                py: 1.5,
                px: 2,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              {isExpanded && (
                <Fade in={isExpanded} timeout={200}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Collapse
                  </Typography>
                </Fade>
              )}
              {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </Button>
          </Box>
        )}
        {/* Profile Button */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: '100%',
          transition: 'all 0.3s ease'
        }}>
          <ProfileButton sidebarMode={!(isExpanded || isTemporaryDrawer)} />
        </Box>

        {/* Footer */}
        {(isExpanded || isTemporaryDrawer) && (
          <Fade in={isExpanded || isTemporaryDrawer} timeout={300}>
            <Box sx={{ 
              px: 2, 
              pb: 2,
              textAlign: 'center',
              width: '100%'
            }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  width: '100%',
                  fontSize: '0.7rem',
                }}
              >
                © 2024 Thematic Analysis Tool
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );

  // For mobile and tablet, return drawer navigation with burger menu
  if (isMobile || isTablet) {
    return (
      <>
        {/* Mobile/Tablet App Bar with Burger Menu */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 2px 8px rgba(0,0,0,0.3)' 
              : '0 2px 8px rgba(0,0,0,0.1)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Thematic Analysis
            </Typography>
            {/* Theme toggle in header for mobile */}
            <IconButton 
              onClick={toggleColorMode} 
              color="inherit"
              sx={{
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'rotate(30deg)',
                },
              }}
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Mobile/Tablet Drawer */}
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={handleMobileDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              bgcolor: theme.palette.background.paper,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            },
          }}
        >
          {/* Close button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={handleMobileDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          {renderNavigationContent(true)}
        </Drawer>
      </>
    );
  }

  // For desktop, return the traditional sidebar
  return (
    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
      <Box
        className="navigation-wrapper"
        sx={{
          width: isExpanded ? 280 : 80,
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1200,
          boxShadow: mode === 'dark' 
            ? '2px 0 8px rgba(0,0,0,0.3)' 
            : '2px 0 8px rgba(0,0,0,0.05)',
          height: '100vh',
          transition: 'all 0.3s ease-in-out',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          // Add subtle gradient overlay
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.elevated, 0.9)} 100%)`
              : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
            zIndex: -1,
          }
        }}
      >
        {renderNavigationContent()}
      </Box>
    </Slide>
  );
}

export default Navigation;