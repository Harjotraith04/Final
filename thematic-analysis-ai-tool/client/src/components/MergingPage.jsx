import React, { useState, useMemo, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Fade,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Badge,
  Divider,
  alpha,
  Card,
  CardContent,
  Grid,
  Collapse,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  DashboardCard, 
  AnimatedChip, 
  GradientButton, 
  StatusBadge,
  LoadingSkeleton,
  FloatingPanel 
} from './StyledComponents';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SyncIcon from '@mui/icons-material/Sync';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';

import TuneIcon from '@mui/icons-material/Tune';
import SortIcon from '@mui/icons-material/Sort';
import BookIcon from '@mui/icons-material/Book';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SaveIcon from '@mui/icons-material/Save';
import { EnhancedTableRow, GlowButton, FrostedGlassPaper } from './StyledComponents';
import { codesApi, codeAssignmentsApi } from '../utils/api';
import AIGenerationButtons from './AIGenerationButtons';

const MergingPage = ({ projectId, codes = [], codeAssignments = [], documents = [], codebooks = [], refreshProjectData, currentUser, projectData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Extract codes and organize them by type
  const manualCodes = useMemo(() => {
    if (!codes || !codebooks) return [];
    const manualCodebookIds = codebooks.filter(cb => !cb.is_ai_generated).map(cb => cb.id);
    return codes.filter(code => manualCodebookIds.includes(code.codebook_id));
  }, [codes, codebooks]);

  const aiCodes = useMemo(() => {
    if (!codes || !codebooks) return [];
    const aiCodebookIds = codebooks.filter(cb => cb.is_ai_generated).map(cb => cb.id);
    return codes.filter(code => aiCodebookIds.includes(code.codebook_id));
  }, [codes, codebooks]);

  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCodes, setSelectedCodes] = useState([]);

  const [documentContents, setDocumentContents] = useState({});
  const [loading, setLoading] = useState(true);

  const [assignmentStatus, setAssignmentStatus] = useState({}); // Track status of assignments: pending, accepted, rejected
  const [isSaving, setIsSaving] = useState(false);
  const [statusSubTab, setStatusSubTab] = useState(0); // 0: pending, 1: accepted, 2: rejected
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [collaboratorSubmissions, setCollaboratorSubmissions] = useState([]);
  const [loadingCollaboratorData, setLoadingCollaboratorData] = useState(false);
  const [hasCollaborators, setHasCollaborators] = useState(false);

  // Initialize assignment status from codeAssignments data
  useEffect(() => {
    const statusMap = {};
    
    // Initialize owner assignments
    codeAssignments.forEach(assignment => {
      statusMap[assignment.id] = assignment.status || 'pending';
    });
    
    setAssignmentStatus(statusMap);
  }, [codeAssignments]);

  // Initialize collaborator assignment status separately to avoid circular dependency
  useEffect(() => {
    if (!collaboratorSubmissions || collaboratorSubmissions.length === 0) {
      return;
    }

    setAssignmentStatus(prevStatus => {
      const newStatusMap = { ...prevStatus };
      
      // Add collaborator assignments directly from collaboratorSubmissions
      collaboratorSubmissions.forEach(userSubmission => {
        if (userSubmission.assignments) {
          userSubmission.assignments.forEach(assignment => {
            // Use id as key for collaborator assignments
            newStatusMap[assignment.id] = assignment.status || 'pending';
          });
        }
      });
      
      return newStatusMap;
    });
  }, [collaboratorSubmissions]);

  // Clean up invalid assignment IDs from assignmentStatus
  useEffect(() => {
    const allValidIds = new Set([
      ...codeAssignments.map(a => a.id),
      ...(collaboratorSubmissions || []).flatMap(user => 
        user.assignments?.map(a => a.id) || []
      )
    ]);

    setAssignmentStatus(prevStatus => {
      const cleanedStatus = {};
      Object.entries(prevStatus).forEach(([id, status]) => {
        if (allValidIds.has(parseInt(id))) {
          cleanedStatus[id] = status;
        }
      });
      
      // Log if we removed any invalid IDs
      const removedIds = Object.keys(prevStatus).filter(id => !allValidIds.has(parseInt(id)));
      if (removedIds.length > 0) {
        console.log('Cleaned up invalid assignment IDs from state:', removedIds);
      }
      
      return cleanedStatus;
    });
  }, [codeAssignments, collaboratorSubmissions]);

  // Debug function to help identify issues
  const debugAssignmentState = () => {
    console.log('=== Assignment State Debug ===');
    console.log('Assignment Status State:', assignmentStatus);
    console.log('Code Assignments:', codeAssignments.map(a => ({ id: a.id, status: a.status })));
    console.log('Collaborator Submissions:', collaboratorSubmissions);
    console.log('Processed Collaborator Data:', processedCollaboratorData);
    
    const allValidIds = new Set([
      ...codeAssignments.map(a => a.id),
      ...(collaboratorSubmissions || []).flatMap(user => 
        user.assignments?.map(a => a.id) || []
      )
    ]);
    
    const invalidIds = Object.keys(assignmentStatus).filter(id => !allValidIds.has(parseInt(id)));
    console.log('Invalid IDs in assignmentStatus:', invalidIds);
    console.log('All Valid IDs:', Array.from(allValidIds));
    console.log('=== End Debug ===');
  };

  // Helper function to get document name
  const getDocName = useMemo(() => (assignment) => {
    return assignment.document_name || '';
  }, []);
  
  // Helper function to get code names and colors
  const getCodeData = useMemo(() => (assignment) => {
    const assignedCode = codes.find(c => c.id === assignment.code_id);
    const isAICode = assignedCode && aiCodes.some(ac => ac.id === assignedCode.id);
    const isManualCode = assignedCode && manualCodes.some(mc => mc.id === assignedCode.id);
    
    return {
      manual: {
        name: isManualCode ? assignedCode.name : '',
        color: isManualCode ? theme.palette.success.main : theme.palette.grey[300],
        deleted: false
      },
      ai: {
        name: isAICode ? assignedCode.name : '',
        color: isAICode ? theme.palette.success.main : theme.palette.grey[300],
        deleted: false
      }
    };
  }, [codes, manualCodes, aiCodes, theme.palette.grey, theme.palette.success]);

  // Save assignment status to backend
  const saveAssignmentStatus = async (assignmentId, newStatus) => {
    try {
      setIsSaving(true);
      const response = await apiRequest(`/code-assignments/${assignmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Status updated successfully
        console.log(`Assignment ${assignmentId} status updated to ${newStatus}`);
        
        // If status was set to rejected, the assignment was deleted from database
        // Refresh project data to update the UI
        if (newStatus === 'rejected' && refreshProjectData) {
          await refreshProjectData();
        }
      } else {
        console.error('Failed to update assignment status');
        // Revert status change on error
        setAssignmentStatus(prev => ({
          ...prev,
          [assignmentId]: prev[assignmentId] // Revert to previous status
        }));
      }
    } catch (error) {
      console.error('Error updating assignment status:', error);
      // Revert status change on error
      setAssignmentStatus(prev => ({
        ...prev,
        [assignmentId]: prev[assignmentId] // Revert to previous status
      }));
    } finally {
      setIsSaving(false);
    }
  };



  // Handle save and bulk upload
  const handleSaveAndUpload = async () => {
    setIsSaving(true);
    try {
      // Debug the current state to help identify issues
      debugAssignmentState();
      
      // Get all assignments with their current status from owner assignments
      const ownerAcceptedAssignments = Object.entries(assignmentStatus)
        .filter(([id, status]) => status === 'accepted' && codeAssignments.some(a => a.id === parseInt(id)))
        .map(([id]) => parseInt(id));
      
      const ownerRejectedAssignments = Object.entries(assignmentStatus)
        .filter(([id, status]) => status === 'rejected' && codeAssignments.some(a => a.id === parseInt(id)))
        .map(([id]) => parseInt(id));
      
      // Get all assignments with their current status from collaborator assignments
      const collabAcceptedAssignments = (processedCollaboratorData && processedCollaboratorData.length > 0) ? 
        Object.entries(assignmentStatus)
          .filter(([id, status]) => 
            status === 'accepted' && 
            processedCollaboratorData.some(user => 
              user.clubbedData && user.clubbedData.some(club => 
                club.assignments.some(a => a.id === parseInt(id))
              )
            )
          )
          .map(([id]) => parseInt(id))
        : [];
      
      const collabRejectedAssignments = (processedCollaboratorData && processedCollaboratorData.length > 0) ? 
        Object.entries(assignmentStatus)
          .filter(([id, status]) => 
            status === 'rejected' && 
            processedCollaboratorData.some(user => 
              user.clubbedData && user.clubbedData.some(club => 
                club.assignments.some(a => a.id === parseInt(id))
              )
            )
          )
          .map(([id]) => parseInt(id))
        : [];
      
      // Combine all assignments
      const accepted_assignment_ids = [...ownerAcceptedAssignments, ...collabAcceptedAssignments];
      const rejected_assignment_ids = [...ownerRejectedAssignments, ...collabRejectedAssignments];

      // Debug logging to help identify the issue
      console.log('Debug - Assignment Status State:', assignmentStatus);
      console.log('Debug - Available Code Assignments:', codeAssignments.map(a => a.id));
      console.log('Debug - Owner Accepted Assignments:', ownerAcceptedAssignments);
      console.log('Debug - Owner Rejected Assignments:', ownerRejectedAssignments);
      console.log('Debug - Collaborator Accepted Assignments:', collabAcceptedAssignments);
      console.log('Debug - Collaborator Rejected Assignments:', collabRejectedAssignments);
      console.log('Debug - Final Accepted IDs:', accepted_assignment_ids);
      console.log('Debug - Final Rejected IDs:', rejected_assignment_ids);

      // Validate that all IDs exist in the available assignments
      const allAvailableIds = new Set([
        ...codeAssignments.map(a => a.id),
        ...(processedCollaboratorData || []).flatMap(user => 
          user.clubbedData?.flatMap(club => club.assignments.map(a => a.id)) || []
        )
      ]);

      const invalidAcceptedIds = accepted_assignment_ids.filter(id => !allAvailableIds.has(id));
      const invalidRejectedIds = rejected_assignment_ids.filter(id => !allAvailableIds.has(id));

      if (invalidAcceptedIds.length > 0 || invalidRejectedIds.length > 0) {
        console.error('Invalid assignment IDs found:', {
          invalidAcceptedIds,
          invalidRejectedIds,
          allAvailableIds: Array.from(allAvailableIds)
        });
        throw new Error(`Invalid assignment IDs detected. Please refresh the page and try again.`);
      }

      // Only proceed if there are assignments to update
      if (accepted_assignment_ids.length === 0 && rejected_assignment_ids.length === 0) {
        console.log('No assignments to update');
        return;
      }

      // Additional validation - ensure all IDs are valid integers
      const allIds = [...accepted_assignment_ids, ...rejected_assignment_ids];
      const invalidIds = allIds.filter(id => !Number.isInteger(id) || id <= 0);
      if (invalidIds.length > 0) {
        console.error('Invalid assignment IDs detected:', invalidIds);
        throw new Error(`Invalid assignment IDs: ${invalidIds.join(', ')}`);
      }

      // Ensure we're not sending empty arrays when there are no assignments to update
      const requestBody = {
        accepted_assignment_ids: accepted_assignment_ids.length > 0 ? accepted_assignment_ids : [],
        rejected_assignment_ids: rejected_assignment_ids.length > 0 ? rejected_assignment_ids : []
      };

      console.log('Sending bulk update request with:', {
        accepted_count: accepted_assignment_ids.length,
        rejected_count: rejected_assignment_ids.length,
        accepted_ids: accepted_assignment_ids,
        rejected_ids: rejected_assignment_ids,
        requestBody
      });

      // Call the bulk update API
      const response = await apiRequest('/code-review/assignments/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Bulk update response:', response);
      
      // Refresh project data to get updated assignments
      if (refreshProjectData) {
        await refreshProjectData();
      }
      
      // Switch to compare tab after successful save and refresh
      setActiveTab(1);
      
    } catch (error) {
      console.error('Error saving assignments:', error);
      
      // Check if it's a "Some assignments not found" error
      if (error.message && error.message.includes('Some assignments not found')) {
        console.error('Some assignment IDs are invalid. Cleaning up state and retrying...');
        
        // Try to extract missing IDs from the error message
        const missingIdsMatch = error.message.match(/Missing IDs: \[([^\]]+)\]/);
        const missingIds = missingIdsMatch ? 
          missingIdsMatch[1].split(',').map(id => parseInt(id.trim())) : [];
        
        console.error('Missing assignment IDs:', missingIds);
        
        // Clean up the assignment status state by removing invalid IDs
        const allValidIds = new Set([
          ...codeAssignments.map(a => a.id),
          ...(collaboratorSubmissions || []).flatMap(user => 
            user.assignments?.map(a => a.id) || []
          )
        ]);
        
        setAssignmentStatus(prevStatus => {
          const cleanedStatus = {};
          Object.entries(prevStatus).forEach(([id, status]) => {
            if (allValidIds.has(parseInt(id))) {
              cleanedStatus[id] = status;
            }
          });
          return cleanedStatus;
        });
        
        // Show a more helpful error message
        const errorMessage = missingIds.length > 0 
          ? `Some assignments (IDs: ${missingIds.join(', ')}) were not found. The page has been refreshed to sync with the server. Please try your action again.`
          : 'Some assignments were not found. The page has been refreshed to sync with the server. Please try your action again.';
        
        alert(errorMessage);
        
        // Refresh project data to get the latest state
        if (refreshProjectData) {
          await refreshProjectData();
        }
      } else {
        // Reset assignment status on other errors
        const originalStatus = {};
        codeAssignments.forEach(assignment => {
          originalStatus[assignment.id] = assignment.status || 'pending';
        });
        setAssignmentStatus(originalStatus);
        
        // Show generic error message
        alert('Failed to save changes. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Filter assignments based on search query and selected codes
  const filteredAssignments = useMemo(() => {
    return codeAssignments.filter((assignment) => {
      const searchLower = searchQuery.toLowerCase();
      
      const documentName = assignment.document_name || '';
      
      // Get the manual code details
      const assignedCode = codes.find(c => c.id === assignment.code_id);
      const manualCodeName = manualCodes.some(mc => mc.id === assignment.code_id) ? assignedCode?.name || '' : '';
      
      // Get the AI code suggestion details  
      const aiCodeName = aiCodes.some(ac => ac.id === assignment.code_id) ? assignedCode?.name || '' : '';
      
      // Search across all relevant fields
      const matchesSearch = searchLower === '' || [
        documentName,
        assignment.text_snapshot || '',
        manualCodeName,
        aiCodeName,
        assignment.ai_suggestion || ''
      ].some(text => text.toLowerCase().includes(searchLower));
      
      // Filter by selected codes if any are selected
      const matchesSelectedCodes = selectedCodes.length === 0 || 
        selectedCodes.some(codeId => assignment.code_id === codeId);
      
      return matchesSearch && matchesSelectedCodes;
    });
  }, [codeAssignments, documents, manualCodes, aiCodes, searchQuery, selectedCodes]);

  // Filter for Compare tab - show pending and accepted assignments (not rejected)
  const filteredCompareAssignments = useMemo(() => {
    return filteredAssignments.filter((assignment) => {
      const status = assignmentStatus[assignment.id] || 'pending';
      return status === 'pending' || status === 'accepted';
    });
  }, [filteredAssignments, assignmentStatus]);

  // Filter for Status tab - categorize by status (pending, accepted, and rejected)
  const statusCategorizedAssignments = useMemo(() => {
    const categorized = {
      pending: [],
      accepted: [],
      rejected: []
    };
    
    filteredAssignments.forEach(assignment => {
      const status = assignmentStatus[assignment.id] || 'pending';
      if (categorized[status]) {
        categorized[status].push(assignment);
      }
    });
    
    return categorized;
  }, [filteredAssignments, assignmentStatus]);

  // Sort assignments based on selected sort option
  const sortedData = useMemo(() => {
    // Use different data source based on active tab
    let dataToSort;
    if (activeTab === 1) {
      dataToSort = filteredCompareAssignments;
    } else if (activeTab === 3) {
      // For Status tab, return categorized data without sorting
      return statusCategorizedAssignments;
    } else {
      dataToSort = filteredAssignments;
    }
    
    return [...dataToSort].sort((a, b) => {
      switch (sortBy) {
        case 'document':
          return getDocName(a).localeCompare(getDocName(b));
        case 'text':
          return (a.text_snapshot || '').localeCompare(b.text_snapshot || '');
        case 'manual-code':
          return getCodeData(a).manual.name.localeCompare(getCodeData(b).manual.name);
        case 'ai-code':
          return getCodeData(a).ai.name.localeCompare(getCodeData(b).ai.name);
        case 'recent':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  }, [filteredAssignments, filteredCompareAssignments, statusCategorizedAssignments, activeTab, documents, manualCodes, aiCodes, sortBy, getDocName, getCodeData]);


  const processedData = useMemo(() => {
    if (loading || Object.keys(documentContents).length === 0 && codeAssignments.length > 0) {
      return [];
    }

    // Determine which assignments to process based on active tab
    let assignmentsToProcess;
    if (activeTab === 1) {
      // Compare tab: use filtered assignments (pending and accepted only)
      assignmentsToProcess = filteredCompareAssignments;
    } else {
      // Edit and other tabs: use all filtered assignments
      assignmentsToProcess = filteredAssignments;
    }
    
    // 1. Group by document
    const groupedByDocument = assignmentsToProcess.reduce((acc, assignment) => {
      const docId = assignment.document_id;
      if (!acc[docId]) {
        const doc = documents.find(d => d.id === docId);
        acc[docId] = {
          documentName: doc ? doc.name : 'Unknown Document',
          documentId: docId,
          assignments: [],
        };
      }
      acc[docId].assignments.push(assignment);
      return acc;
    }, {});

    // 2. Sort assignments within each document by start character
    for (const docId in groupedByDocument) {
      groupedByDocument[docId].assignments.sort((a, b) => a.start_char - b.start_char);
    }

    // 3. Club overlapping assignments
    let clubbedData = [];
    for (const docId in groupedByDocument) {
      const assignments = groupedByDocument[docId].assignments;
      const docContent = documentContents[docId];

      if (assignments.length === 0 || !docContent) {
        continue;
      }
      
      let clubs = [];
      if (assignments.length > 0) {
        let currentClub = {
          start_char: assignments[0].start_char,
          end_char: assignments[0].end_char,
          assignments: [assignments[0]],
          documentName: groupedByDocument[docId].documentName,
          documentId: docId,
        };

        for (let i = 1; i < assignments.length; i++) {
          const currentAssignment = assignments[i];
          if (currentAssignment.start_char < currentClub.end_char) {
            currentClub.end_char = Math.max(currentClub.end_char, currentAssignment.end_char);
            currentClub.assignments.push(currentAssignment);
          } else {
            clubs.push(currentClub);
            currentClub = {
              start_char: currentAssignment.start_char,
              end_char: currentAssignment.end_char,
              assignments: [currentAssignment],
              documentName: groupedByDocument[docId].documentName,
              documentId: docId,
            };
          }
        }
        clubs.push(currentClub);
      }
     
      // 4. For Compare tab, filter assignments within each club to only show pending and accepted
      if (activeTab === 1) {
        clubs.forEach(club => {
          club.assignments = club.assignments.filter(assignment => {
            const status = assignmentStatus[assignment.id] || 'pending';
            return status === 'pending' || status === 'accepted';
          });
        });
        // Remove clubs that have no remaining assignments after filtering
        clubs = clubs.filter(club => club.assignments.length > 0);
      }

      // Add text_snapshot to each club
      clubs.forEach(club => {
        club.text_snapshot = docContent.substring(club.start_char, club.end_char);
      });

      clubbedData = clubbedData.concat(clubs);
    }

    return clubbedData;
  }, [codeAssignments, documents, codes, codebooks, documentContents, loading, filteredAssignments, filteredCompareAssignments, activeTab, assignmentStatus]);

  // Processed data for Status tab with proper filtering by status
  const statusProcessedData = useMemo(() => {
    if (activeTab !== 3) return processedData;
    
    const statusTypes = ['pending', 'accepted', 'rejected'];
    const currentStatus = statusTypes[statusSubTab];
    
    // Filter and modify clubs to only show assignments matching the current status
    return processedData.map(club => {
      const filteredAssignments = club.assignments.filter(assignment => {
        const status = assignmentStatus[assignment.id] || 'pending';
        return status === currentStatus;
      });
      
      return {
        ...club,
        assignments: filteredAssignments
      };
    }).filter(club => club.assignments.length > 0); // Remove clubs with no matching assignments
    
  }, [processedData, activeTab, statusSubTab, assignmentStatus]);

  // Process collaborator submissions to handle overlapping codes
  const processedCollaboratorData = useMemo(() => {
    if (!collaboratorSubmissions || collaboratorSubmissions.length === 0) {
      return [];
    }

    return collaboratorSubmissions.map(userSubmission => {
      // 1. Group assignments by document
      const groupedByDocument = userSubmission.assignments.reduce((acc, assignment) => {
        const docId = assignment.document_id;
        if (!acc[docId]) {
          acc[docId] = {
            documentName: assignment.document_name || 'Unknown Document',
            documentId: docId,
            assignments: [],
          };
        }
        acc[docId].assignments.push(assignment);
        return acc;
      }, {});

      // 2. Sort assignments within each document by start character
      for (const docId in groupedByDocument) {
        groupedByDocument[docId].assignments.sort((a, b) => a.start_char - b.start_char);
      }

      // 3. Club overlapping assignments
      let clubbedData = [];
      for (const docId in groupedByDocument) {
        const assignments = groupedByDocument[docId].assignments;

        if (assignments.length === 0) {
          continue;
        }
        
        let clubs = [];
        if (assignments.length > 0) {
          let currentClub = {
            start_char: assignments[0].start_char,
            end_char: assignments[0].end_char,
            assignments: [assignments[0]],
            documentName: groupedByDocument[docId].documentName,
            documentId: docId,
          };

          for (let i = 1; i < assignments.length; i++) {
            const currentAssignment = assignments[i];
            if (currentAssignment.start_char < currentClub.end_char) {
              currentClub.end_char = Math.max(currentClub.end_char, currentAssignment.end_char);
              currentClub.assignments.push(currentAssignment);
            } else {
              clubs.push(currentClub);
              currentClub = {
                start_char: currentAssignment.start_char,
                end_char: currentAssignment.end_char,
                assignments: [currentAssignment],
                documentName: groupedByDocument[docId].documentName,
                documentId: docId,
              };
            }
          }
          clubs.push(currentClub);
        }

        clubbedData = clubbedData.concat(clubs);
      }

      return {
        ...userSubmission,
        clubbedData
      };
    });
  }, [collaboratorSubmissions]);

  // Handle assignment accept - only updates local state
  const handleAcceptAssignment = (assignmentId) => {
    setAssignmentStatus(prev => ({
      ...prev,
      [assignmentId]: 'accepted'
    }));
  };

  // Handle assignment reject - only updates local state
  const handleRejectAssignment = (assignmentId) => {
    setAssignmentStatus(prev => ({
      ...prev,
      [assignmentId]: 'rejected'
    }));
  };

  // Handle submit assignments for collaborators
  const handleSubmitAssignments = async () => {
    if (!currentUser || isOwner) {
      console.error('Submit is only available for collaborators');
      return;
    }

    // Get accepted assignment IDs
    const acceptedAssignments = codeAssignments.filter(assignment => 
      assignmentStatus[assignment.id] === 'accepted'
    );

    if (acceptedAssignments.length === 0) {
      alert('Please accept at least one assignment before submitting.');
      return;
    }

    const assignmentIds = acceptedAssignments.map(assignment => assignment.id);

    try {
      setIsSubmitting(true);
      setSubmitSuccess(false);
      
      const result = await codeAssignmentsApi.submitAssignments(assignmentIds);
      
      console.log('Submit successful:', result);
      setSubmitSuccess(true);
      
      // Refresh project data to get updated status
      if (refreshProjectData) {
        await refreshProjectData();
      }

      // Show success message
      alert(`Successfully submitted ${assignmentIds.length} accepted assignments!`);
      
    } catch (error) {
      console.error('Submit failed:', error);
      alert(`Failed to submit assignments: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle row expansion
  const handleRowClick = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleStatusSubTabChange = (event, newValue) => {
    setStatusSubTab(newValue);
  };

  // Handle filter menu
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  // Handle sort menu
  const handleSortMenuOpen = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  // Text truncation helper
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Row rendering
  const renderTableRow = (club) => {
    const isExpanded = expandedRows[club.start_char + '-' + club.end_char];
    
    // Get all unique manual and AI codes for the club
    const manualCodesInClub = [];
    const aiCodesInClub = [];

    club.assignments.forEach(assignment => {
      const codeData = getCodeData(assignment);
      if(codeData.manual.name){
        manualCodesInClub.push({ ...codeData.manual, assignmentId: assignment.id });
      }
      if(codeData.ai.name) {
        aiCodesInClub.push({ ...codeData.ai, assignmentId: assignment.id });
      }
    });

    return (
      <React.Fragment key={club.start_char + '-' + club.end_char}>
        <TableRow
          hover
          onClick={() => handleRowClick(club.start_char + '-' + club.end_char)}
          sx={{
            cursor: 'pointer',
            // You can style the row based on the status of its assignments if needed
          }}
        >
          <TableCell>
            <Typography variant="body2">{club.documentName}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">{truncateText(club.text_snapshot, 100)}</Typography>
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {manualCodesInClub.length > 1 ? (
                // When multiple codes, show them without individual buttons
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {manualCodesInClub.map((code, index) => (
                    <Chip
                      key={index}
                      label={code.name}
                      size="small"
                      sx={{
                        backgroundColor: (() => {
                          const status = assignmentStatus[code.assignmentId] || 'pending';
                          if (status === 'pending') return theme.palette.warning.main;
                          if (status === 'accepted') return theme.palette.success.main;
                          if (status === 'rejected') return theme.palette.error.main;
                          return code.color;
                        })(),
                        color: (() => {
                          const status = assignmentStatus[code.assignmentId] || 'pending';
                          if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                          if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                          if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                          return theme.palette.getContrastText(code.color);
                        })(),
                        '& .MuiChip-label': { fontWeight: 500 },
                      }}
                    />
                  ))}
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                    ({manualCodesInClub.length} codes - expand to manage)
                  </Typography>
                </Box>
              ) : (
                // When single code, show with buttons as before
                manualCodesInClub.map((code, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={code.name}
                      sx={{
                        backgroundColor: (() => {
                          const status = assignmentStatus[code.assignmentId] || 'pending';
                          if (status === 'pending') return theme.palette.warning.main;
                          if (status === 'accepted') return theme.palette.success.main;
                          if (status === 'rejected') return theme.palette.error.main;
                          return code.color;
                        })(),
                        color: (() => {
                          const status = assignmentStatus[code.assignmentId] || 'pending';
                          if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                          if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                          if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                          return theme.palette.getContrastText(code.color);
                        })(),
                        '& .MuiChip-label': { fontWeight: 500 },
                      }}
                    />
                    <Tooltip title="Accept Assignment">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptAssignment(code.assignmentId);
                        }}
                        sx={{
                          color: assignmentStatus[code.assignmentId] === 'accepted' ? 
                            theme.palette.success.main : theme.palette.grey[500],
                        }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject Assignment">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectAssignment(code.assignmentId);
                        }}
                         sx={{
                          color: assignmentStatus[code.assignmentId] === 'rejected' ? 
                            theme.palette.error.main : theme.palette.grey[500],
                        }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))
              )}
              {manualCodesInClub.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'normal', fontSize: '1.2rem' }}>
                  ❌
                </Typography>
              )}
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {aiCodesInClub.length > 1 ? (
                // When multiple codes, show them without individual buttons
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {aiCodesInClub.map((code, index) => (
                    <Chip
                      key={index}
                      label={code.name}
                      size="small"
                      sx={{
                        backgroundColor: (() => {
                          const status = assignmentStatus[code.assignmentId] || 'pending';
                          if (status === 'pending') return alpha(theme.palette.warning.main, 0.8);
                          if (status === 'accepted') return alpha(theme.palette.success.main, 0.8);
                          if (status === 'rejected') return alpha(theme.palette.error.main, 0.8);
                          return alpha(code.color, 0.8);
                        })(),
                        color: (() => {
                          const status = assignmentStatus[code.assignmentId] || 'pending';
                          if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                          if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                          if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                          return theme.palette.getContrastText(code.color);
                        })(),
                        '& .MuiChip-label': { fontWeight: 500 },
                      }}
                    />
                  ))}
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                    ({aiCodesInClub.length} codes - expand to manage)
                  </Typography>
                </Box>
              ) : (
                // When single code, show with buttons as before
                aiCodesInClub.map((code, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={code.name}
                      sx={{
                        backgroundColor: (() => {
                          const status = assignmentStatus[code.assignmentId] || 'pending';
                          if (status === 'pending') return alpha(theme.palette.warning.main, 0.8);
                          if (status === 'accepted') return alpha(theme.palette.success.main, 0.8);
                          if (status === 'rejected') return alpha(theme.palette.error.main, 0.8);
                          return alpha(code.color, 0.8);
                        })(),
                        color: (() => {
                          const status = assignmentStatus[code.assignmentId] || 'pending';
                          if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                          if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                          if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                          return theme.palette.getContrastText(code.color);
                        })(),
                        '& .MuiChip-label': { fontWeight: 500 },
                      }}
                    />
                    <Tooltip title="Accept Assignment">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptAssignment(code.assignmentId);
                      }}
                      sx={{
                        color: assignmentStatus[code.assignmentId] === 'accepted' ? 
                          theme.palette.success.main : theme.palette.grey[500],
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject Assignment">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectAssignment(code.assignmentId);
                      }}
                       sx={{
                        color: assignmentStatus[code.assignmentId] === 'rejected' ? 
                          theme.palette.error.main : theme.palette.grey[500],
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  </Box>
                ))
              )}
              {aiCodesInClub.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'normal', fontSize: '1.2rem' }}>
                  ❌
                </Typography>
              )}
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ m: 1 }}>
                <Card variant="outlined" sx={{ 
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    {/* Assignments Table - Detailed View */}
                    {club.assignments && club.assignments.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Assignment Details ({club.assignments.length} assignments)
                          </Typography>
                          {club.assignments.length > 3 && (
                            <Typography variant="caption" sx={{ 
                              color: theme.palette.primary.main, 
                              fontStyle: 'italic',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}>
                              <Box sx={{ 
                                width: 4, 
                                height: 4, 
                                borderRadius: '50%', 
                                backgroundColor: theme.palette.primary.main,
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%': {
                                    opacity: 1,
                                    transform: 'scale(1)',
                                  },
                                  '50%': {
                                    opacity: 0.7,
                                    transform: 'scale(1.2)',
                                  },
                                  '100%': {
                                    opacity: 1,
                                    transform: 'scale(1)',
                                  },
                                },
                              }} />
                              Scroll to see all assignments
                            </Typography>
                          )}
                        </Box>
                        
                        <TableContainer 
                          component={Paper} 
                          sx={{ 
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            maxHeight: '500px',
                            mb: 1,
                            overflowY: 'auto',
                            overflowX: 'auto',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                              height: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: alpha(theme.palette.divider, 0.1),
                              borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.3),
                              borderRadius: '4px',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.5),
                              },
                            },
                          }}
                        >
                          <Table size="small" stickyHeader>
                             <TableHead>
                               <TableRow sx={{ 
                                 backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                 '& .MuiTableCell-head': {
                                   backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                   borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                   position: 'sticky',
                                   top: 0,
                                   zIndex: 10,
                                 }
                               }}>
                                 <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Document</TableCell>
                                 <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Selected Text</TableCell>
                                 <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Manual Code</TableCell>
                                 <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>AI Code</TableCell>
                                 <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Created</TableCell>
                               </TableRow>
                             </TableHead>
                            <TableBody>
                              {club.assignments.map((assignment, index) => {
                                const codeData = getCodeData(assignment);
                                const assignmentStatus_current = assignmentStatus[assignment.id] || 'pending';
                                
                                return (
                                  <TableRow 
                                    key={assignment.id}
                                    sx={{ 
                                      '&:hover': { 
                                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                        transform: 'scale(1.001)',
                                        transition: 'all 0.2s ease-in-out'
                                      },
                                      '&:nth-of-type(odd)': {
                                        backgroundColor: alpha(theme.palette.background.default, 0.3)
                                      }
                                    }}
                                  >
                                    {/* Document Name */}
                                    <TableCell sx={{ verticalAlign: 'top', p: 1.5, minWidth: '120px' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {assignment.document_name || club.documentName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Chars: {assignment.start_char}-{assignment.end_char}
                                      </Typography>
                                    </TableCell>
                                    
                                                                         {/* Selected Text */}
                                     <TableCell sx={{ verticalAlign: 'top', p: 1.5, maxWidth: '300px' }}>
                                       <Typography 
                                         variant="body2" 
                                         sx={{ 
                                           fontStyle: 'italic',
                                           lineHeight: 1.4,
                                           wordBreak: 'break-word',
                                           whiteSpace: 'pre-wrap',
                                           color: theme.palette.text.primary,
                                           p: 1,
                                           backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                           borderRadius: 1,
                                           border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                         }}
                                       >
                                         "{assignment.text_snapshot || 'No text available'}"
                                       </Typography>
                                     </TableCell>
                                    
                                                                         {/* Manual Code */}
                                     <TableCell sx={{ verticalAlign: 'top', p: 1.5 }}>
                                       {codeData.manual.name ? (
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                           <Chip
                                             label={codeData.manual.name}
                                             size="small"
                                             sx={{
                                               backgroundColor: (() => {
                                                 if (assignmentStatus_current === 'pending') return theme.palette.warning.main;
                                                 if (assignmentStatus_current === 'accepted') return theme.palette.success.main;
                                                 if (assignmentStatus_current === 'rejected') return theme.palette.error.main;
                                                 return codeData.manual.color;
                                               })(),
                                               color: (() => {
                                                 if (assignmentStatus_current === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                                                 if (assignmentStatus_current === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                                                 if (assignmentStatus_current === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                                                 return theme.palette.getContrastText(codeData.manual.color);
                                               })(),
                                               '& .MuiChip-label': { fontWeight: 500 },
                                             }}
                                           />
                                           <Tooltip title="Accept Assignment">
                                             <IconButton 
                                               size="small" 
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleAcceptAssignment(assignment.id);
                                               }}
                                               sx={{
                                                 color: assignmentStatus_current === 'accepted' ? 
                                                   theme.palette.success.main : theme.palette.grey[500],
                                               }}
                                             >
                                               <CheckCircleIcon fontSize="small" />
                                             </IconButton>
                                           </Tooltip>
                                           <Tooltip title="Reject Assignment">
                                             <IconButton 
                                               size="small" 
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleRejectAssignment(assignment.id);
                                               }}
                                                sx={{
                                                 color: assignmentStatus_current === 'rejected' ? 
                                                   theme.palette.error.main : theme.palette.grey[500],
                                               }}
                                             >
                                               <CancelIcon fontSize="small" />
                                             </IconButton>
                                           </Tooltip>
                                         </Box>
                                       ) : (
                                         <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                           -
                                         </Typography>
                                       )}
                                     </TableCell>
                                    
                                                                         {/* AI Code */}
                                     <TableCell sx={{ verticalAlign: 'top', p: 1.5 }}>
                                       {codeData.ai.name ? (
                                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                           <Chip
                                             label={codeData.ai.name}
                                             size="small"
                                             sx={{
                                               backgroundColor: (() => {
                                                 if (assignmentStatus_current === 'pending') return alpha(theme.palette.warning.main, 0.8);
                                                 if (assignmentStatus_current === 'accepted') return alpha(theme.palette.success.main, 0.8);
                                                 if (assignmentStatus_current === 'rejected') return alpha(theme.palette.error.main, 0.8);
                                                 return alpha(codeData.ai.color, 0.8);
                                               })(),
                                               color: (() => {
                                                 if (assignmentStatus_current === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                                                 if (assignmentStatus_current === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                                                 if (assignmentStatus_current === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                                                 return theme.palette.getContrastText(codeData.ai.color);
                                               })(),
                                               '& .MuiChip-label': { fontWeight: 500 },
                                             }}
                                           />
                                           <Tooltip title="Accept Assignment">
                                             <IconButton 
                                               size="small" 
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleAcceptAssignment(assignment.id);
                                               }}
                                               sx={{
                                                 color: assignmentStatus_current === 'accepted' ? 
                                                   theme.palette.success.main : theme.palette.grey[500],
                                               }}
                                             >
                                               <CheckCircleIcon fontSize="small" />
                                             </IconButton>
                                           </Tooltip>
                                           <Tooltip title="Reject Assignment">
                                             <IconButton 
                                               size="small" 
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 handleRejectAssignment(assignment.id);
                                               }}
                                                sx={{
                                                 color: assignmentStatus_current === 'rejected' ? 
                                                   theme.palette.error.main : theme.palette.grey[500],
                                               }}
                                             >
                                               <CancelIcon fontSize="small" />
                                             </IconButton>
                                           </Tooltip>
                                         </Box>
                                       ) : (
                                         <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'normal', fontSize: '1.2rem' }}>
                                           ❌
                                         </Typography>
                                       )}
                                     </TableCell>
                                    
                                                                         {/* Created Date */}
                                     <TableCell sx={{ verticalAlign: 'top', p: 1.5 }}>
                                       <Typography variant="caption" color="text.secondary">
                                         {assignment.created_at ? new Date(assignment.created_at).toLocaleDateString() : 'Unknown'}
                                       </Typography>
                                       <Typography variant="caption" color="text.secondary" display="block">
                                         Status: {assignmentStatus_current}
                                       </Typography>
                                     </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  // Filter menu options
  const filterOptions = [
    { id: 'clear', label: 'Clear Filters', icon: <CancelIcon /> },
    ...manualCodes.map(code => ({
      id: code.id,
      label: code.name,
      color: code.color,
      isManual: true,
    })),
    ...aiCodes.map(code => ({
      id: code.id,
      label: code.name,
      color: code.color,
      isAI: true,
    }))
  ];

  // Sort menu options
  const sortOptions = [
    { id: 'recent', label: 'Most Recent', icon: <AutorenewIcon /> },
    { id: 'document', label: 'Document Name', icon: <BookIcon /> },
    { id: 'text', label: 'Text Content', icon: <TuneIcon /> },
    { id: 'manual-code', label: 'Manual Code', icon: <EditIcon /> },
    { id: 'ai-code', label: 'AI Code', icon: <CompareArrowsIcon /> },
  ];

  // Handle filter selection
  const handleFilterSelect = (codeId) => {
    if (codeId === 'clear') {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(prev => {
        const isSelected = prev.includes(codeId);
        if (isSelected) {
          return prev.filter(id => id !== codeId);
        } else {
          return [...prev, codeId];
        }
      });
    }
    setFilterMenuAnchor(null);
  };

  // Handle sort selection
  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    setSortMenuAnchor(null);
  };

  // Determine if the current user is the owner
  const isOwner = currentUser && projectData && projectData.owner && currentUser.id === projectData.owner.id;

  // Get the actual tab index for content rendering, accounting for different tab layout for owners vs collaborators
  const getContentTabIndex = (tabValue) => {
    if (isOwner) {
      // For owners: 0=Edit, 1=Collaborator, 2=Finalize, 3=Status
      return tabValue;
    } else {
      // For collaborators: 0=Edit, 1=Finalize, 2=Status (no Collaborator tab)
      // Map collaborator tab indices to owner tab indices for content rendering
      switch (tabValue) {
        case 0: return 0; // Edit
        case 1: return 2; // Finalize Codebook
        case 2: return 3; // Status
        default: return 0;
      }
    }
  };

  // Fetch collaborator submitted assignments
  useEffect(() => {
    const fetchCollaboratorData = async () => {
      if (!projectId) return;
      
      setLoadingCollaboratorData(true);
      try {
        // Fetch project data with collaborator submissions
        const projectResponse = await apiRequest(`/projects/${projectId}`);
        
        if (projectResponse && projectResponse.submitted_assignments_by_user) {
          setCollaboratorSubmissions(projectResponse.submitted_assignments_by_user);
          setHasCollaborators(projectResponse.submitted_assignments_by_user.length > 0);
        } else {
          console.error('No collaborator submission data found in project response');
          setCollaboratorSubmissions([]);
          setHasCollaborators(false);
        }
      } catch (error) {
        console.error('Error fetching collaborator data:', error);
        setCollaboratorSubmissions([]);
        setHasCollaborators(false);
      } finally {
        setLoadingCollaboratorData(false);
      }
    };

    fetchCollaboratorData();
  }, [projectId]);

  useEffect(() => {
    const fetchDocumentContents = async () => {
      setLoading(true);
      const docIds = [...new Set(codeAssignments.map(a => a.document_id))];
      
      const promises = docIds.map(docId => 
        apiRequest(`/documents/${docId}`).catch(e => {
          console.error(`Failed to fetch document ${docId}`, e);
          return null;
        })
      );
      
      const results = await Promise.all(promises);
      
      const contents = {};
      results.forEach(doc => {
        if (doc) {
          contents[doc.id] = doc.content;
        }
      });
      
      setDocumentContents(contents);
      setLoading(false);
    };

    if (codeAssignments.length > 0) {
      fetchDocumentContents();
    } else {
      setLoading(false);
    }
  }, [codeAssignments]);

  // Render collaborator table row
  const renderCollaboratorTableRow = (club, userSubmission, clubIndex) => {
    const isExpanded = expandedRows[`${userSubmission.user_id}-${club.start_char}-${club.end_char}`];
    const userName = userSubmission.user_name || `User ${userSubmission.user_id}`;
    

    
    return (
      <React.Fragment key={`${userSubmission.user_id}-${club.start_char}-${club.end_char}`}>
        <TableRow
          hover
          onClick={() => handleRowClick(`${userSubmission.user_id}-${club.start_char}-${club.end_char}`)}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          <TableCell>
            <Typography variant="body2">{club.documentName}</Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2">{truncateText(club.assignments[0].text_snapshot || club.assignments[0].text || '', 100)}</Typography>
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {club.assignments.length > 1 ? (
                // When multiple codes, show them without individual buttons
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {club.assignments.map((assignment, index) => (
                    <Chip
                      key={index}
                      label={assignment.code_name || assignment.code?.name || 'Unknown Code'}
                      size="small"
                      sx={{
                        backgroundColor: (() => {
                          const status = assignmentStatus[assignment.id] || 'pending';
                          if (status === 'pending') return theme.palette.warning.main;
                          if (status === 'accepted') return theme.palette.success.main;
                          if (status === 'rejected') return theme.palette.error.main;
                          return assignment.code_color || assignment.code?.color || theme.palette.primary.main;
                        })(),
                        color: (() => {
                          const status = assignmentStatus[assignment.id] || 'pending';
                          if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                          if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                          if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                          return theme.palette.getContrastText(assignment.code_color || assignment.code?.color || theme.palette.primary.main);
                        })(),
                        '& .MuiChip-label': { fontWeight: 500 },
                      }}
                    />
                  ))}
                  <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                    ({club.assignments.length} codes - expand to manage)
                  </Typography>
                </Box>
              ) : (
                // When single code, show with buttons
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={club.assignments[0].code_name || club.assignments[0].code?.name || 'Unknown Code'}
                    sx={{
                      backgroundColor: (() => {
                        const status = assignmentStatus[club.assignments[0].id] || 'pending';
                        if (status === 'pending') return theme.palette.warning.main;
                        if (status === 'accepted') return theme.palette.success.main;
                        if (status === 'rejected') return theme.palette.error.main;
                        return club.assignments[0].code_color || club.assignments[0].code?.color || theme.palette.primary.main;
                      })(),
                      color: (() => {
                        const status = assignmentStatus[club.assignments[0].id] || 'pending';
                        if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                        if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                        if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                        return theme.palette.getContrastText(club.assignments[0].code_color || club.assignments[0].code?.color || theme.palette.primary.main);
                      })(),
                      '& .MuiChip-label': { fontWeight: 500 },
                    }}
                  />
                  <Tooltip title="Accept Assignment">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptAssignment(club.assignments[0].id);
                      }}
                      sx={{
                        color: assignmentStatus[club.assignments[0].id] === 'accepted' ? 
                          theme.palette.success.main : theme.palette.grey[500],
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject Assignment">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectAssignment(club.assignments[0].id);
                      }}
                      sx={{
                        color: assignmentStatus[club.assignments[0].id] === 'rejected' ? 
                          theme.palette.error.main : theme.palette.grey[500],
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 24, height: 24 }}>
                <PersonIcon sx={{ fontSize: 14 }} />
              </Avatar>
              <Typography variant="body2">{userName}</Typography>
            </Box>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ m: 1 }}>
                <Card variant="outlined" sx={{ 
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    {/* Full text */}
                    <Box sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 1, 
                      backgroundColor: alpha(theme.palette.background.paper, 0.5),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        "{club.assignments[0].text_snapshot || club.assignments[0].text || ''}"
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Chars: {club.start_char}-{club.end_char}
                      </Typography>
                    </Box>

                    {/* Assignments Table - Detailed View */}
                    {club.assignments.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Code Details ({club.assignments.length} {club.assignments.length === 1 ? 'code' : 'codes'})
                          </Typography>
                        </Box>
                        
                        <TableContainer 
                          component={Paper} 
                          sx={{ 
                            borderRadius: '8px',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            maxHeight: '300px',
                            mb: 1,
                            overflowY: 'auto',
                          }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ 
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                '& .MuiTableCell-head': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                }
                              }}>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Code</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Confidence</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {club.assignments.map((assignment, index) => (
                                <TableRow 
                                  key={assignment.id}
                                  sx={{ 
                                    '&:hover': { 
                                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                    },
                                    '&:nth-of-type(odd)': {
                                      backgroundColor: alpha(theme.palette.background.default, 0.3)
                                    }
                                  }}
                                >
                                  {/* Code */}
                                  <TableCell sx={{ verticalAlign: 'top', p: 1.5 }}>
                                    <Chip
                                      label={assignment.code_name || assignment.code?.name || 'Unknown Code'}
                                      size="small"
                                      sx={{
                                        backgroundColor: (() => {
                                          const status = assignmentStatus[assignment.id] || 'pending';
                                          if (status === 'pending') return theme.palette.warning.main;
                                          if (status === 'accepted') return theme.palette.success.main;
                                          if (status === 'rejected') return theme.palette.error.main;
                                          return assignment.code_color || assignment.code?.color || theme.palette.primary.main;
                                        })(),
                                        color: (() => {
                                          const status = assignmentStatus[assignment.id] || 'pending';
                                          if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                                          if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                                          if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                                          return theme.palette.getContrastText(assignment.code_color || assignment.code?.color || theme.palette.primary.main);
                                        })(),
                                        '& .MuiChip-label': { fontWeight: 500 },
                                      }}
                                    />
                                  </TableCell>
                                  
                                  {/* Description */}
                                  <TableCell sx={{ verticalAlign: 'top', p: 1.5, maxWidth: '300px' }}>
                                    <Typography variant="body2">
                                      {assignment.code?.description || 'No description'}
                                    </Typography>
                                  </TableCell>
                                  
                                  {/* Confidence */}
                                  <TableCell sx={{ verticalAlign: 'top', p: 1.5 }}>
                                    {assignment.confidence ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                          <CircularProgress
                                            variant="determinate"
                                            value={assignment.confidence}
                                            size={24}
                                            thickness={4}
                                            sx={{
                                              color: (() => {
                                                if (assignment.confidence >= 80) return theme.palette.success.main;
                                                if (assignment.confidence >= 50) return theme.palette.warning.main;
                                                return theme.palette.error.main;
                                              })(),
                                            }}
                                          />
                                          <Box
                                            sx={{
                                              top: 0,
                                              left: 0,
                                              bottom: 0,
                                              right: 0,
                                              position: 'absolute',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                            }}
                                          >
                                            <Typography variant="caption" component="div" sx={{ fontSize: '0.6rem' }}>
                                              {`${assignment.confidence}%`}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        —
                                      </Typography>
                                    )}
                                  </TableCell>
                                  
                                  {/* Actions */}
                                  <TableCell sx={{ verticalAlign: 'top', p: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Tooltip title="Accept Assignment">
                                        <IconButton 
                                          size="small" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAcceptAssignment(assignment.id);
                                          }}
                                          sx={{
                                            color: assignmentStatus[assignment.id] === 'accepted' ? 
                                              theme.palette.success.main : theme.palette.grey[500],
                                          }}
                                        >
                                          <CheckCircleIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Reject Assignment">
                                        <IconButton 
                                          size="small" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRejectAssignment(assignment.id);
                                          }}
                                          sx={{
                                            color: assignmentStatus[assignment.id] === 'rejected' ? 
                                              theme.palette.error.main : theme.palette.grey[500],
                                          }}
                                        >
                                          <CancelIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      minHeight: '500px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header Section */}
      <Fade in={true} style={{ transitionDelay: '100ms' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.5,
                fontSize: '1.75rem',
                lineHeight: 1.2,
              }}
            >
              Code Merging
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
              Compare and merge coding decisions between different coders
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label={`${activeTab === 3 ? statusProcessedData.length : processedData.length} ${activeTab === 1 ? 'Compare Entries' : activeTab === 3 ? 'Status Entries' : 'Entries'}`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ height: '22px', fontSize: '0.7rem' }}
              />
              <Chip 
                label="2 Coders"
                color="secondary"
                variant="outlined"
                size="small"
                sx={{ height: '22px', fontSize: '0.7rem' }}
              />
              <Chip 
                label={activeTab === 1 ? "Pending & Accepted Codes" : activeTab === 3 ? "Status-Filtered Codes" : "Similarity Analysis"}
                color="primary"
                variant="filled"
                size="small"
                sx={{ height: '22px', fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TextField
              placeholder="Search..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: theme.shape.borderRadius * 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.05)
                    : alpha(theme.palette.common.black, 0.02),
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.common.white, 0.07)
                      : alpha(theme.palette.common.black, 0.04),
                  },
                  height: '36px',
                }
              }}
              sx={{ width: '280px' }}
            />
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Filter options">
                <IconButton 
                  onClick={handleFilterMenuOpen}
                  size="small"
                  sx={{
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.common.white, 0.05)
                      : alpha(theme.palette.common.black, 0.02),
                    width: '36px',
                    height: '36px',
                  }}
                >
                  <TuneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Sort options">
                <IconButton 
                  onClick={handleSortMenuOpen}
                  size="small"
                  sx={{
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.common.white, 0.05)
                      : alpha(theme.palette.common.black, 0.02),
                    width: '36px',
                    height: '36px',
                  }}
                >
                  <SortIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Save Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveAndUpload}
              disabled={isSaving}
              sx={{
                borderRadius: theme.shape.borderRadius * 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
                ...(Object.values(assignmentStatus).some(status => status !== 'pending') && {
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: theme.shadows[2],
                    },
                    '50%': {
                      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                    '100%': {
                      boxShadow: theme.shadows[2],
                    },
                  },
                })
              }}
            >
              {isSaving ? 'Saving Changes...' : 
                (() => {
                  const pendingChanges = Object.values(assignmentStatus).filter(status => status !== 'pending').length;
                  return pendingChanges > 0 
                    ? `Save ${pendingChanges} Change${pendingChanges > 1 ? 's' : ''}`
                    : 'Save Changes';
                })()
              }
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Tabs Section */}
      <Fade in={true} style={{ transitionDelay: '200ms' }}>
        <Box sx={{ mb: 2 }}>
          <Paper 
            elevation={0}
            variant="outlined"
            sx={{ 
              borderRadius: theme.shape.borderRadius * 2,
              overflow: 'hidden',
              borderColor: alpha(theme.palette.divider, 0.5)
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant={isMobile ? "fullWidth" : "standard"}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                minHeight: '48px',
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .MuiTab-root': {
                  minHeight: '48px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                  py: 1.5,
                },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon fontSize="small" />
                    <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                      Edit
                    </Typography>
                  </Box>
                } 
              />
              {isOwner && (
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CompareArrowsIcon fontSize="small" />
                      <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                        Collaborator
                      </Typography>
                    </Box>
                  } 
                />
              )}
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DoneAllIcon fontSize="small" />
                    <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                      Finalize Codebook
                    </Typography>
                    {!isOwner && (
                      <Chip 
                        label="Submit" 
                        size="small" 
                        color="primary" 
                        sx={{ height: 16, fontSize: '0.6rem' }}
                      />
                    )}
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon fontSize="small" />
                    <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                      Status
                    </Typography>
                  </Box>
                } 
              />
            </Tabs>
          </Paper>
        </Box>
      </Fade>

      {/* Menus */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: {
            minWidth: 250,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }
        }}
      >
        <MenuItem disabled>
          <ListItemText primary="Filter by Similarity" />
        </MenuItem>
        <Divider />
        {filterOptions.map(option => (
          <MenuItem 
            key={option.id} 
            onClick={() => handleFilterSelect(option.id)}
            sx={{ 
              color: option.isManual ? theme.palette.success.main : option.isAI ? theme.palette.info.main : 'inherit',
            }}
          >
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          }
        }}
      >
        {sortOptions.map(option => (
          <MenuItem key={option.id} onClick={() => handleSortSelect(option.id)}>
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText primary={option.label} secondary={sortBy === option.id ? 'Selected' : ''} />
          </MenuItem>
        ))}
      </Menu>

      {/* Main Content - Tab Panels */}
      {/* Edit Tab Content */}
      {getContentTabIndex(activeTab) === 0 && (
        processedData.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ 
          borderRadius: 0,
          flexGrow: 1, 
          overflow: 'auto',
          maxHeight: 'calc(100vh - 280px)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.common.white, 0.05)
              : alpha(theme.palette.common.black, 0.03),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.common.white, 0.15)
              : alpha(theme.palette.common.black, 0.15),
            borderRadius: '3px',
            '&:hover': {
              background: theme.palette.mode === 'dark'
                ? alpha(theme.palette.common.white, 0.25)
                : alpha(theme.palette.common.black, 0.25),
            },
          },
        }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Document</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Selected Text</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Selected Code</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>AI Code</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedData.map((item) => (
                renderTableRow(item)
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Fade in={true} style={{ transitionDelay: '300ms' }}>
          <FrostedGlassPaper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: theme.shape.borderRadius * 3,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                mb: 1,
              }}
            >
              <CompareArrowsIcon sx={{ fontSize: 35, color: theme.palette.primary.main }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              No Coding Data Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3, lineHeight: 1.6 }}>
              {searchQuery 
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'Start coding your documents or upload coded data to begin merging and comparing codes.'
              }
            </Typography>
            <GlowButton
              variant="contained"
              startIcon={<SyncIcon />}
              size="large"
              sx={{ borderRadius: theme.shape.borderRadius * 2 }}
            >
              Generate Sample Data
            </GlowButton>
          </FrostedGlassPaper>
        </Fade>
      )
      )}
      
      {/* Compare Tab Content */}
      {getContentTabIndex(activeTab) === 1 && (
        <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Collaborator Submissions
            </Typography>
            
          </Box>
          
          {loadingCollaboratorData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : processedCollaboratorData.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ 
              borderRadius: 0,
              flexGrow: 1, 
              overflow: 'auto',
              maxHeight: 'calc(100vh - 280px)',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.common.white, 0.05)
                  : alpha(theme.palette.common.black, 0.03),
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.15)
                  : alpha(theme.palette.common.black, 0.15),
                borderRadius: '3px',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.25)
                    : alpha(theme.palette.common.black, 0.25),
                },
              },
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Document</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Selected Text</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Collaborator</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedCollaboratorData.flatMap(userSubmission => 
                    userSubmission.clubbedData.map((club, clubIndex) => 
                      renderCollaboratorTableRow(club, userSubmission, clubIndex)
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Fade in={true} style={{ transitionDelay: '300ms' }}>
              <FrostedGlassPaper 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                  borderRadius: theme.shape.borderRadius * 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    mb: 1,
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 35, color: theme.palette.info.main }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {hasCollaborators ? "No Code Submissions Yet" : "No Collaborators"}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3, lineHeight: 1.6 }}>
                  {hasCollaborators ? 
                    "Your collaborators haven't submitted any codes yet. When they do, their coded data will appear here." :
                    "You don't have any collaborators for this project. Invite collaborators to help with the coding process."
                  }
                </Typography>

                {!hasCollaborators && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PeopleIcon />}
                    sx={{
                      borderRadius: theme.shape.borderRadius * 2,
                      px: 3,
                      py: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                    onClick={() => {
                      // Could navigate to a page to manage collaborators
                      console.log("Navigate to invite collaborators");
                    }}
                  >
                    Invite Collaborators
                  </Button>
                )}
              </FrostedGlassPaper>
            </Fade>
          )}
        </Box>
      )}
      
      {/* Finalize Codebook Tab Content */}
      {getContentTabIndex(activeTab) === 2 && (
        <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {!isOwner ? (
            // Collaborator view: Show accepted codes with Submit button
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Accepted Codes for Submission
              </Typography>
              
              {(() => {
                // Filter assignments that are accepted
                const acceptedAssignments = codeAssignments.filter(assignment => 
                  assignmentStatus[assignment.id] === 'accepted'
                );

                return acceptedAssignments.length > 0 ? (
                  <Box>
                    <DashboardCard sx={{ mb: 3 }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Document</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Selected Text</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Accepted Code</TableCell>
                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {acceptedAssignments.map((assignment) => {
                              const codeData = getCodeData(assignment);
                              const documentName = assignment.document_name || '';
                              
                              return (
                                <TableRow key={assignment.id} hover>
                                  <TableCell>
                                    <Typography variant="body2">{documentName}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {assignment.text_snapshot ? 
                                        (assignment.text_snapshot.length > 100 ? 
                                          assignment.text_snapshot.substring(0, 100) + '...' : 
                                          assignment.text_snapshot
                                        ) : 'No text snapshot'
                                      }
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={codeData.manual.name || codeData.ai.name || 'Unknown Code'}
                                      sx={{
                                        backgroundColor: theme.palette.success.main,
                                        color: theme.palette.getContrastText(theme.palette.success.main),
                                        '& .MuiChip-label': { fontWeight: 500 }
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label="Accepted"
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </DashboardCard>
                    
                    {/* Submit Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <GlowButton
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSubmitAssignments}
                        disabled={isSubmitting || submitSuccess}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                        sx={{ 
                          borderRadius: theme.shape.borderRadius * 2,
                          px: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          minWidth: 200
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : 
                         submitSuccess ? 'Submitted Successfully!' : 
                         `Submit ${acceptedAssignments.length} Accepted Code${acceptedAssignments.length > 1 ? 's' : ''}`
                        }
                      </GlowButton>
                    </Box>
                  </Box>
                ) : (
                  <DashboardCard sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No Accepted Codes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accept some code assignments in the Edit or Status tabs before submitting.
                    </Typography>
                  </DashboardCard>
                );
              })()}
            </Box>
          ) : (
            // Owner view: Show all accepted codes from owner and collaborators
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Final Codebook
              </Typography>
              
              {(() => {
                // Get all accepted codes from both owner and collaborators
                const ownerAcceptedAssignments = codeAssignments.filter(assignment => 
                  assignmentStatus[assignment.id] === 'accepted'
                );
                
                // Get collaborator accepted codes - safely check for processedCollaboratorData
                const collaboratorAcceptedCodes = processedCollaboratorData && processedCollaboratorData.length > 0 ? 
                  processedCollaboratorData.flatMap(userSubmission => 
                    userSubmission.clubbedData ? userSubmission.clubbedData.flatMap(club => 
                      club.assignments.filter(assignment => 
                        assignmentStatus[assignment.id] === 'accepted'
                      )
                    ) : []
                  ) : [];
                
                const allAcceptedCodes = [...ownerAcceptedAssignments, ...collaboratorAcceptedCodes];
                
                // Debug logging
                console.log('Owner accepted assignments:', ownerAcceptedAssignments.length);
                console.log('Collaborator accepted codes:', collaboratorAcceptedCodes.length);
                console.log('Total accepted codes:', allAcceptedCodes.length);
                
                return allAcceptedCodes.length > 0 ? (
                  <Box>
                    {/* Summary Section */}
                    <DashboardCard sx={{ mb: 3, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Final Codebook Summary
                        </Typography>
                        <Chip 
                          label={`${allAcceptedCodes.length} Total Accepted Codes`}
                          color="success"
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`${ownerAcceptedAssignments.length} Owner Codes`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        <Chip 
                          label={`${collaboratorAcceptedCodes.length} Collaborator Codes`}
                          color="info"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </DashboardCard>
                    
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Document</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Selected Text</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Accepted Code</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Source</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ownerAcceptedAssignments.map((assignment) => {
                            const codeData = getCodeData(assignment);
                            const documentName = assignment.document_name || '';
                            
                            return (
                              <TableRow 
                                key={`owner-${assignment.id}`} 
                                hover
                                sx={{
                                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                  },
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body2">{documentName}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {assignment.text_snapshot ? 
                                      (assignment.text_snapshot.length > 100 ? 
                                        assignment.text_snapshot.substring(0, 100) + '...' : 
                                        assignment.text_snapshot
                                      ) : 'No text snapshot'
                                    }
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={codeData.manual.name || codeData.ai.name || 'Unknown Code'}
                                    sx={{
                                      backgroundColor: theme.palette.success.main,
                                      color: theme.palette.getContrastText(theme.palette.success.main),
                                      '& .MuiChip-label': { fontWeight: 500 }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 24, height: 24 }}>
                                      <PersonIcon sx={{ fontSize: 14 }} />
                                    </Avatar>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      Owner
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          
                          {collaboratorAcceptedCodes.map((assignment) => {
                            const userName = processedCollaboratorData && processedCollaboratorData.find(
                              user => user.clubbedData && user.clubbedData.some(club => 
                                club.assignments.some(a => a.id === assignment.id)
                              )
                            )?.user_name || 'Collaborator';
                            
                            return (
                              <TableRow 
                                key={`collab-${assignment.id}`} 
                                hover
                                sx={{
                                  backgroundColor: alpha(theme.palette.info.main, 0.02),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.info.main, 0.08),
                                  },
                                }}
                              >
                                <TableCell>
                                  <Typography variant="body2">{assignment.document_name || assignment.documentName}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {assignment.text_snapshot || assignment.text ? 
                                      ((assignment.text_snapshot || assignment.text).length > 100 ? 
                                        (assignment.text_snapshot || assignment.text).substring(0, 100) + '...' : 
                                        (assignment.text_snapshot || assignment.text)
                                      ) : 'No text snapshot'
                                    }
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={assignment.code_name || assignment.code?.name || 'Unknown Code'}
                                    sx={{
                                      backgroundColor: assignment.code_color || assignment.code?.color || theme.palette.success.main,
                                      color: theme.palette.getContrastText(assignment.code_color || assignment.code?.color || theme.palette.success.main),
                                      '& .MuiChip-label': { fontWeight: 500 }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ bgcolor: theme.palette.info.main, width: 24, height: 24 }}>
                                      <PersonIcon sx={{ fontSize: 14 }} />
                                    </Avatar>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                      {userName}
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {/* Finalize Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <GlowButton
                        variant="contained"
                        color="success"
                        startIcon={<BookIcon />}
                        size="large"
                        sx={{ borderRadius: theme.shape.borderRadius * 2 }}
                      >
                        Finalize Codebook
                      </GlowButton>
                    </Box>
                    
                    {/* AI Generation Buttons - Only for Owner */}
                    <AIGenerationButtons
                      projectId={projectId}
                      codeAssignments={codeAssignments}
                      currentUser={currentUser}
                      projectData={projectData}
                      onThemeGenerated={(themes) => {
                        console.log('Themes generated:', themes);
                        // Optionally refresh project data to show new themes
                        if (refreshProjectData) {
                          refreshProjectData();
                        }
                      }}
                      onReportGenerated={(report) => {
                        console.log('Report generated:', report);
                        // Optionally refresh project data to show new report
                        if (refreshProjectData) {
                          refreshProjectData();
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <FrostedGlassPaper 
                    sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                      borderRadius: theme.shape.borderRadius * 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        mb: 1,
                      }}
                    >
                      <DoneAllIcon sx={{ fontSize: 35, color: theme.palette.success.main }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      No Accepted Codes Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3, lineHeight: 1.6 }}>
                      Accept codes from your review (Edit tab) or from collaborator submissions (Collaborator tab) to build your final codebook.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Chip 
                        label={`${ownerAcceptedAssignments.length} Owner Codes`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Chip 
                        label={`${collaboratorAcceptedCodes.length} Collaborator Codes`}
                        color="info"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </FrostedGlassPaper>
                );
              })()}
            </Box>
          )}
        </Box>
      )}
      
      {/* Status Tab Content */}
      {getContentTabIndex(activeTab) === 3 && (
        <Box sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {/* Status Sub-tabs */}
          <Paper 
            elevation={0}
            variant="outlined"
            sx={{ 
              borderRadius: theme.shape.borderRadius * 1.5,
              overflow: 'hidden',
              borderColor: alpha(theme.palette.divider, 0.3),
              mb: 2
            }}
          >
            <Tabs 
              value={statusSubTab} 
              onChange={handleStatusSubTabChange}
              variant={isMobile ? "fullWidth" : "standard"}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                minHeight: '40px',
                '& .MuiTabs-indicator': {
                  height: 2,
                  borderRadius: '2px 2px 0 0',
                },
                '& .MuiTab-root': {
                  minHeight: '40px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                  py: 1,
                },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                      Pending
                    </Typography>
                    <Badge 
                      badgeContent={(() => {
                        return processedData.map(club => {
                          const filteredAssignments = club.assignments.filter(assignment => {
                            const status = assignmentStatus[assignment.id] || 'pending';
                            return status === 'pending';
                          });
                          return { ...club, assignments: filteredAssignments };
                        }).filter(club => club.assignments.length > 0).length;
                      })()} 
                      color="warning"
                      sx={{ 
                        '& .MuiBadge-badge': { 
                          fontSize: '0.6rem',
                          minWidth: '16px',
                          height: '16px'
                        } 
                      }}
                    />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                      Accepted
                    </Typography>
                    <Badge 
                      badgeContent={(() => {
                        return processedData.map(club => {
                          const filteredAssignments = club.assignments.filter(assignment => {
                            const status = assignmentStatus[assignment.id] || 'pending';
                            return status === 'accepted';
                          });
                          return { ...club, assignments: filteredAssignments };
                        }).filter(club => club.assignments.length > 0).length;
                      })()} 
                      color="success"
                      sx={{ 
                        '& .MuiBadge-badge': { 
                          fontSize: '0.6rem',
                          minWidth: '16px',
                          height: '16px'
                        } 
                      }}
                    />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                      Rejected
                    </Typography>
                    <Badge 
                      badgeContent={(() => {
                        return processedData.map(club => {
                          const filteredAssignments = club.assignments.filter(assignment => {
                            const status = assignmentStatus[assignment.id] || 'pending';
                            return status === 'rejected';
                          });
                          return { ...club, assignments: filteredAssignments };
                        }).filter(club => club.assignments.length > 0).length;
                      })()} 
                      color="error"
                      sx={{ 
                        '& .MuiBadge-badge': { 
                          fontSize: '0.6rem',
                          minWidth: '16px',
                          height: '16px'
                        } 
                      }}
                    />
                  </Box>
                } 
              />
            </Tabs>
          </Paper>

          {/* Status Tab Content */}
          {(() => {
            const statusTypes = ['pending', 'accepted', 'rejected'];
            const currentStatus = statusTypes[statusSubTab];
            const statusData = statusProcessedData; // Use the new filtered data
            const statusColor = {
              pending: theme.palette.warning.main,
              accepted: theme.palette.success.main,
              rejected: theme.palette.error.main
            }[currentStatus];
            
            return (
              <Box>
                {statusData.length > 0 ? (
                  <DashboardCard>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Document</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Selected Text</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>Manual Code</TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', py: 0.75 }}>AI Code</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statusData.map((item) => (
                            <TableRow key={item.start_char + '-' + item.end_char} hover sx={{
                              cursor: 'pointer',
                              backgroundColor: alpha(statusColor, 0.02),
                              '&:hover': {
                                backgroundColor: alpha(statusColor, 0.08),
                              },
                            }}>
                              <TableCell>
                                <Typography variant="body2">{item.documentName}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{truncateText(item.text_snapshot, 100)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {item.assignments.map((assignment, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Chip
                                        label={getCodeData(assignment).manual.name || '❌'}
                                        sx={{
                                          backgroundColor: (() => {
                                            if (!getCodeData(assignment).manual.name) {
                                              return alpha(theme.palette.error.main, 0.1);
                                            }
                                            if (getCodeData(assignment).manual.deleted) {
                                              return alpha(theme.palette.error.main, 0.1);
                                            }
                                            const status = assignmentStatus[assignment.id] || 'pending';
                                            if (status === 'pending') return theme.palette.warning.main;
                                            if (status === 'accepted') return theme.palette.success.main;
                                            if (status === 'rejected') return theme.palette.error.main;
                                            return getCodeData(assignment).manual.color;
                                          })(),
                                          color: (() => {
                                            if (!getCodeData(assignment).manual.name) {
                                              return theme.palette.error.main;
                                            }
                                            if (getCodeData(assignment).manual.deleted) {
                                              return theme.palette.error.main;
                                            }
                                            const status = assignmentStatus[assignment.id] || 'pending';
                                            if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                                            if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                                            if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                                            return theme.palette.getContrastText(getCodeData(assignment).manual.color);
                                          })(),
                                          '& .MuiChip-label': { fontWeight: 500 },
                                          textDecoration: getCodeData(assignment).manual.deleted ? 'line-through' : 'none'
                                        }}
                                      />
                                      {getCodeData(assignment).manual.name && (
                                        <>
                                          <Tooltip title="Accept Assignment">
                                            <IconButton 
                                              size="small" 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleAcceptAssignment(assignment.id);
                                              }}
                                              sx={{
                                                color: theme.palette.success.main,
                                                '&:hover': {
                                                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                }
                                              }}
                                            >
                                              <CheckCircleIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Reject Assignment">
                                            <IconButton 
                                              size="small" 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRejectAssignment(assignment.id);
                                              }}
                                              sx={{
                                                color: theme.palette.error.main,
                                                '&:hover': {
                                                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                }
                                              }}
                                            >
                                              <CancelIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </>
                                      )}
                                    </Box>
                                  ))}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {/* Check if any assignment in this item has an AI code */}
                                  {item.assignments.some(assignment => getCodeData(assignment).ai.name) ? (
                                    // Show individual AI codes if any exist
                                    item.assignments.map((assignment, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getCodeData(assignment).ai.name ? (
                                          <>
                                            <Chip
                                              label={getCodeData(assignment).ai.name}
                                              sx={{
                                                backgroundColor: (() => {
                                                  if (getCodeData(assignment).ai.deleted) {
                                                    return alpha(theme.palette.error.main, 0.1);
                                                  }
                                                  const status = assignmentStatus[assignment.id] || 'pending';
                                                  if (status === 'pending') return alpha(theme.palette.warning.main, 0.8);
                                                  if (status === 'accepted') return alpha(theme.palette.success.main, 0.8);
                                                  if (status === 'rejected') return alpha(theme.palette.error.main, 0.8);
                                                  return alpha(getCodeData(assignment).ai.color, 0.8);
                                                })(),
                                                color: (() => {
                                                  if (getCodeData(assignment).ai.deleted) {
                                                    return theme.palette.error.main;
                                                  }
                                                  const status = assignmentStatus[assignment.id] || 'pending';
                                                  if (status === 'pending') return theme.palette.getContrastText(theme.palette.warning.main);
                                                  if (status === 'accepted') return theme.palette.getContrastText(theme.palette.success.main);
                                                  if (status === 'rejected') return theme.palette.getContrastText(theme.palette.error.main);
                                                  return theme.palette.getContrastText(getCodeData(assignment).ai.color);
                                                })(),
                                                '& .MuiChip-label': { fontWeight: 500 },
                                                textDecoration: getCodeData(assignment).ai.deleted ? 'line-through' : 'none'
                                              }}
                                            />
                                            <Tooltip title="Accept Assignment">
                                            <IconButton 
                                              size="small" 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleAcceptAssignment(assignment.id);
                                              }}
                                              sx={{
                                                color: assignmentStatus[assignment.id] === 'accepted' ? 
                                                  theme.palette.success.main : theme.palette.grey[500],
                                              }}
                                            >
                                              <CheckCircleIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Reject Assignment">
                                            <IconButton 
                                              size="small" 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRejectAssignment(assignment.id);
                                              }}
                                               sx={{
                                                color: assignmentStatus[assignment.id] === 'rejected' ? 
                                                  theme.palette.error.main : theme.palette.grey[500],
                                              }}
                                            >
                                              <CancelIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          </>
                                        ) : null}
                                      </Box>
                                    ))
                                  ) : (
                                    // Show single ❌ if no AI codes exist in the entire overlapping cluster
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'normal', fontSize: '1.2rem' }}>
                                      ❌
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </DashboardCard>
                ) : (
                  <DashboardCard sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No {currentStatus} assignments
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentStatus === 'pending' && 'All assignments have been reviewed'}
                      {currentStatus === 'accepted' && 'No assignments have been accepted yet'}
                      {currentStatus === 'rejected' && 'No assignments have been rejected yet'}
                    </Typography>
                  </DashboardCard>
                )}
              </Box>
            );
          })()}
        </Box>
      )}
    </Box>
  );
};

export default MergingPage;