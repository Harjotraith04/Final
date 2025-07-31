import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  useTheme,
  Badge,
  Tooltip,
  Chip,
  alpha,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, useLocation } from 'react-router-dom';
import { usersApi, projectsApi, storageUtils } from '../utils/api';
import { debugUtils } from '../utils/debug';
import ProjectSettings from './ProjectSettings';

function ProfileButton({ sidebarMode }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [projectSettingsOpen, setProjectSettingsOpen] = useState(false);
  const open = Boolean(anchorEl);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Fetch real user data from backend
        const userData = await usersApi.getCurrentUser();
        console.log('Fetched user profile:', userData);
        setUser(userData);
        
        // Fetch real project data using the utility that validates localStorage
        try {
          let validProjectId = await storageUtils.getCurrentProjectId();
          
          // If no project ID in localStorage, try to get it from current URL
          if (!validProjectId) {
            const urlMatch = location.pathname.match(/\/dashboard\/(\d+)/);
            if (urlMatch) {
              validProjectId = urlMatch[1];
              console.log('Found project ID in URL:', validProjectId);
              // Store it in localStorage for future use
              localStorage.setItem('currentProjectId', validProjectId);
            }
          }
          
          if (validProjectId) {
            try {
              const projectData = await projectsApi.getProject(validProjectId);
              console.log('Fetched current project:', projectData);
              console.log('Project title:', projectData?.title);
              console.log('Project ID:', projectData?.id);
              
              if (projectData && projectData.title) {
                setCurrentProject(projectData);
                console.log('Set current project to:', projectData.title);
              } else {
                console.warn('Project data is missing title, using fallback');
                const fallbackProjectData = {
                  id: 'default',
                  title: 'No project selected',
                  description: 'Please select a project'
                };
                setCurrentProject(fallbackProjectData);
              }
            } catch (projectFetchError) {
              console.error('Error fetching project data:', projectFetchError);
              const fallbackProjectData = {
                id: 'default',
                title: 'No project selected',
                description: 'Please select a project'
              };
              setCurrentProject(fallbackProjectData);
            }
          } else {
            // No valid project found, use a generic fallback
            console.log('No valid project ID found, using fallback');
            const fallbackProjectData = {
              id: 'default',
              title: 'No project selected',
              description: 'Please select a project'
            };
            setCurrentProject(fallbackProjectData);
          }
        } catch (projectError) {
          console.error('Error fetching project data:', projectError);
          // Use a generic fallback if project fetch fails
          const fallbackProjectData = {
            id: 'default',
            title: 'No project selected',
            description: 'Please select a project'
          };
          setCurrentProject(fallbackProjectData);
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If authentication fails, redirect to login
        if (error.message.includes('Authentication')) {
          navigate('/login');
        } else {
          // Fallback to mock data if API fails but user is authenticated
          console.warn('Using fallback user data due to API error');
          const fallbackUserData = {
            id: '1',
            email: 'demo.user@example.com'
          };
          setUser(fallbackUserData);
          
          const fallbackProjectData = {
            id: '1',
            title: 'No project selected',
            description: 'Please select a project'
          };
          setCurrentProject(fallbackProjectData);
        }
      }
    };

    fetchUserData();
  }, [navigate, location.pathname]);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    storageUtils.clearAllStoredData();
    navigate('/login');
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    handleProfileClose();
  };

  const handleChangeEmail = () => {
    // TODO: Implement change email functionality
    handleProfileClose();
  };

  const handleProjectSelection = () => {
    navigate('/project-selection');
    handleProfileClose();
  };

  const handleProjectSettings = () => {
    // Only open project settings if we have a valid project ID (not the fallback "default")
    if (!currentProject?.id || currentProject.id === 'default' || isNaN(parseInt(currentProject.id))) {
      alert('Please select a valid project first from the project selection page.');
      handleProfileClose();
      return;
    }
    
    // Ensure we have a valid project ID before opening settings
    if (currentProject.id && currentProject.id !== 'default') {
      setProjectSettingsOpen(true);
      handleProfileClose();
    } else {
      alert('Please select a valid project first from the project selection page.');
      handleProfileClose();
    }
  };

  const handleDebugInfo = () => {
    console.log('=== DEBUG INFO ===');
    console.log('Current project state:', currentProject);
    console.log('User state:', user);
    debugUtils.getLocalStorageState();
    debugUtils.logCurrentUrl();
    console.log('=== END DEBUG INFO ===');
    handleProfileClose();
  };

  const handleRefreshProject = async () => {
    console.log('Refreshing project data...');
    try {
      const validProjectId = await storageUtils.getCurrentProjectId();
      if (validProjectId) {
        const projectData = await projectsApi.getProject(validProjectId);
        console.log('Refreshed project data:', projectData);
        setCurrentProject(projectData);
        alert('Project data refreshed successfully!');
      } else {
        alert('No valid project ID found. Please select a project first.');
      }
    } catch (error) {
      console.error('Error refreshing project data:', error);
      alert('Error refreshing project data: ' + error.message);
    }
    handleProfileClose();
  };
  if (sidebarMode) {
    // Collapsed sidebar: show only avatar, centered, with menu on click
    return (
      <>
        <Tooltip title="Account Settings">
          <IconButton
            onClick={handleProfileClick}
            size="large"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              width: 48,
              height: 48,
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              },
              transition: 'all 0.2s',
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'inherit',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              {user?.email ? user.email[0].toUpperCase() : <AccountCircleIcon />}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleProfileClose}
          onClick={handleProfileClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 260,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.email}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {currentProject?.title || 'No project selected'}
            </Typography>
          </Box>
                  <Divider />
        <MenuItem onClick={handleProjectSelection}>
          <ListItemIcon>
            <FolderIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Select Project" />
        </MenuItem>
        <MenuItem onClick={handleProjectSettings}>
          <ListItemIcon>
            <SettingsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Project Settings" />
        </MenuItem>
        <MenuItem onClick={handleDebugInfo}>
          <ListItemIcon>
            <SettingsIcon color="secondary" />
          </ListItemIcon>
          <ListItemText primary="Debug Info" />
        </MenuItem>
        <MenuItem onClick={handleRefreshProject}>
          <ListItemIcon>
            <SettingsIcon color="info" />
          </ListItemIcon>
          <ListItemText primary="Refresh Project Data" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleChangePassword}>
            <ListItemIcon>
              <VpnKeyIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Change Password" />
          </MenuItem>
          <MenuItem onClick={handleChangeEmail}>
            <ListItemIcon>
              <EmailIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Change Email" />
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />          </MenuItem>
        </Menu>
        
        {/* Project Settings Dialog */}
        {currentProject && (
          <ProjectSettings 
            projectId={currentProject.id} 
            open={projectSettingsOpen}
            onClose={() => setProjectSettingsOpen(false)}
          />
        )}
      </>
    );
  }

  // Expanded sidebar: show avatar, email, project, and menu
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <Tooltip title="Account Settings">
        <IconButton
          onClick={handleProfileClick}
          size="large"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            width: 48,
            height: 48,
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            transition: 'all 0.2s',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'inherit',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {user?.email ? user.email[0].toUpperCase() : <AccountCircleIcon />}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {user?.email || 'User'}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {currentProject?.title || 'No project selected'}
        </Typography>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleProfileClose}
        onClick={handleProfileClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 260,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 2, bgcolor: theme.palette.primary.main, color: 'white' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.email}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {currentProject?.title || 'No project selected'}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProjectSelection}>
          <ListItemIcon>
            <FolderIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Select Project" />
        </MenuItem>
        <MenuItem onClick={handleProjectSettings}>
          <ListItemIcon>
            <SettingsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Project Settings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleChangePassword}>
          <ListItemIcon>
            <VpnKeyIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Change Password" />
        </MenuItem>
        <MenuItem onClick={handleChangeEmail}>
          <ListItemIcon>
            <EmailIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Change Email" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
      
      {/* Project Settings Dialog */}
      {currentProject && (
        <ProjectSettings 
          projectId={currentProject.id} 
          open={projectSettingsOpen}
          onClose={() => setProjectSettingsOpen(false)}
        />
      )}
    </Box>
  );
}

export default ProfileButton; 