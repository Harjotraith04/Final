import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  Tooltip
} from '@mui/material';
import {
  AutoAwesome,
  Assessment as ReportIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { apiRequest } from '../utils/api';

const AIGenerationButtons = ({ 
  projectId, 
  codeAssignments = [], 
  currentUser, 
  projectData,
  onThemeGenerated,
  onReportGenerated 
}) => {
  const theme = useTheme();
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [themeResult, setThemeResult] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [error, setError] = useState(null);

  // Check if current user is the owner
  const isOwner = currentUser && projectData && projectData.owner && currentUser.id === projectData.owner.id;

  // If not owner, don't render anything
  if (!isOwner) {
    return null;
  }

  // Get accepted code assignment IDs
  const getAcceptedAssignmentIds = () => {
    return codeAssignments
      .filter(assignment => assignment.status === 'accepted')
      .map(assignment => assignment.id);
  };

  const handleGenerateTheme = async () => {
    const acceptedIds = getAcceptedAssignmentIds();
    
    if (acceptedIds.length === 0) {
      setError('No accepted code assignments found. Please accept some code assignments before generating themes.');
      return;
    }

    setIsGeneratingTheme(true);
    setError(null);
    setThemeResult(null);

    try {
      const response = await apiRequest('/ai/generate-themes', {
        method: 'POST',
        body: JSON.stringify({
          code_assignment_ids: acceptedIds
        })
      });

      setThemeResult(response);
      if (onThemeGenerated) {
        onThemeGenerated(response);
      }
    } catch (error) {
      console.error('Error generating themes:', error);
      setError(`Failed to generate themes: ${error.message}`);
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const handleGenerateReport = async () => {
    const acceptedIds = getAcceptedAssignmentIds();
    
    if (acceptedIds.length === 0) {
      setError('No accepted code assignments found. Please accept some code assignments before generating a report.');
      return;
    }

    setIsGeneratingReport(true);
    setError(null);
    setReportResult(null);

    try {
      const response = await apiRequest('/ai/generate-report', {
        method: 'POST',
        body: JSON.stringify({
          code_assignment_ids: acceptedIds
        })
      });

      setReportResult(response);
      if (onReportGenerated) {
        onReportGenerated(response);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const acceptedCount = getAcceptedAssignmentIds().length;

  return (
    <Fade in={true} style={{ transitionDelay: '400ms' }}>
      <Card 
        sx={{ 
          mt: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AutoAwesome 
              sx={{ 
                color: theme.palette.primary.main, 
                mr: 1,
                fontSize: '1.5rem'
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI Generation Tools
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate themes and reports from your accepted code assignments using AI analysis.
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {themeResult && (
            <Alert 
              severity="success" 
              icon={<SuccessIcon />}
              sx={{ mb: 2 }}
              onClose={() => setThemeResult(null)}
            >
              <Typography variant="body2">
                <strong>Theme Generation Successful!</strong> Generated {themeResult.length} themes.
              </Typography>
            </Alert>
          )}

          {reportResult && (
            <Alert 
              severity="success" 
              icon={<SuccessIcon />}
              sx={{ mb: 2 }}
              onClose={() => setReportResult(null)}
            >
              <Typography variant="body2">
                <strong>Report Generation Successful!</strong> Report has been saved to the project.
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Tooltip 
              title={acceptedCount === 0 ? "No accepted assignments available" : "Generate themes from accepted code assignments"}
              placement="top"
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={
                    isGeneratingTheme ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <AutoAwesome />
                    )
                  }
                  onClick={handleGenerateTheme}
                  disabled={isGeneratingTheme || acceptedCount === 0}
                  sx={{
                    borderRadius: theme.shape.borderRadius * 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: alpha(theme.palette.grey[400], 0.5),
                      color: theme.palette.grey[600],
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isGeneratingTheme ? 'Generating Themes...' : 'Generate Theme'}
                </Button>
              </span>
            </Tooltip>

            <Tooltip 
              title={acceptedCount === 0 ? "No accepted assignments available" : "Generate comprehensive report from accepted code assignments"}
              placement="top"
            >
              <span>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={
                    isGeneratingReport ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <ReportIcon />
                    )
                  }
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport || acceptedCount === 0}
                  sx={{
                    borderRadius: theme.shape.borderRadius * 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.4)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: alpha(theme.palette.grey[400], 0.5),
                      color: theme.palette.grey[600],
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isGeneratingReport ? 'Generating Report...' : 'Generate Report'}
                </Button>
              </span>
            </Tooltip>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Available assignments: {acceptedCount} accepted
            </Typography>
            {acceptedCount === 0 && (
              <Typography variant="caption" color="error.main">
                • Accept some code assignments to enable AI generation
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default AIGenerationButtons; 