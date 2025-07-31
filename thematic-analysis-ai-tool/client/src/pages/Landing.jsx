import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  Fade,
  Zoom,
  IconButton,
  Avatar,
  Chip,
  Stack,
  TextField,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeModeContext } from '../App';
import {
  Analytics,
  Code,
  TrendingUp,
  Security,
  Speed,
  GroupWork,
  AutoAwesome,
  Insights,
  LightMode,
  DarkMode,
  ArrowForward,
  CheckCircle,
  PlayCircle,
  Twitter,
  LinkedIn,
  GitHub,
} from '@mui/icons-material';

const Landing = () => {
  const theme = useTheme();
  const { toggleColorMode, mode } = useContext(ThemeModeContext);
  const [scrollY, setScrollY] = useState(0);
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Code sx={{ fontSize: 40 }} />,
      title: 'Qualitative Coding',
      description: 'Streamline your coding process with AI-assisted thematic analysis, automated code suggestions, and intelligent pattern recognition across your qualitative data.',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Thematic Analysis',
      description: 'Discover meaningful themes and patterns in interviews, surveys, and documents with powerful analytical tools designed for researchers.',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
    {
      icon: <Insights sx={{ fontSize: 40 }} />,
      title: 'Data Visualization',
      description: 'Transform your findings into compelling visual narratives with interactive charts, theme maps, and publication-ready graphics.',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      icon: <GroupWork sx={{ fontSize: 40 }} />,
      title: 'Team Collaboration',
      description: 'Enable seamless collaboration with inter-rater reliability tools, shared codebooks, and real-time team coding sessions.',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Research Insights',
      description: 'Generate comprehensive reports, track theme evolution, and extract actionable insights from your qualitative research data.',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Ethical',
      description: 'Ensure data privacy and research ethics compliance with end-to-end encryption, anonymization tools, and secure data handling.',
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    },
  ];

  const benefits = [
    'Code interviews, focus groups, and documents',
    'Identify themes with AI-powered analysis',
    'Collaborate with your research team',
    'Export findings in multiple formats',
    'Ensure inter-rater reliability',
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.mode === 'dark' 
        ? 'radial-gradient(ellipse at top, #0f172a 0%, #1e293b 40%, #334155 100%)'
        : 'radial-gradient(ellipse at top, #f8fafc 0%, #e2e8f0 40%, #cbd5e1 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Enhanced animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -200,
          right: -200,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(110, 168, 254, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
          animation: 'floatSlow 8s ease-in-out infinite',
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(192, 132, 252, 0.05) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
          animation: 'floatReverse 10s ease-in-out infinite',
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />
      
      {/* Additional floating elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '10%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 60%)',
          animation: 'pulse 6s ease-in-out infinite',
          transform: `translateX(${scrollY * 0.1}px)`,
        }}
      />

      {/* Enhanced Header with glassmorphism */}
      <Box
        component="nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backdropFilter: 'blur(25px) saturate(200%)',
          background: theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.85)'
            : 'rgba(248, 250, 252, 0.85)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.12)'
            : '0 8px 32px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              ThemeAnalytica
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                onClick={toggleColorMode} 
                color="inherit"
                sx={{
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(110, 168, 254, 0.1)'
                    : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${theme.palette.primary.main}20`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(180deg) scale(1.1)',
                    background: theme.palette.primary.main + '20',
                  },
                }}
              >
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                sx={{ 
                  borderRadius: 25,
                  px: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.25)',
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                sx={{ 
                  borderRadius: 25,
                  px: 3,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)',
                  },
                }}
              >
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Enhanced Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <Fade in timeout={1000}>
          <Box textAlign="center" sx={{ mb: 8 }}>
            <Chip
              label="🔬 AI-Powered Qualitative Research Platform"
              sx={{
                mb: 4,
                px: 3,
                py: 0.8,
                background: theme.palette.mode === 'dark'
                  ? 'rgba(110, 168, 254, 0.15)'
                  : 'rgba(59, 130, 246, 0.15)',
                color: theme.palette.primary.main,
                border: `2px solid ${theme.palette.primary.main}30`,
                fontSize: '1rem',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                animation: 'glow 3s ease-in-out infinite alternate',
              }}
            />
            <Typography
              variant="h1"
              sx={{
                mb: 4,
                fontWeight: 900,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
                  : 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #334155 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '2.8rem', md: '4.5rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Unlock Insights with
              <br />
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -10,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
                    borderRadius: 2,
                    animation: 'shimmer 2s ease-in-out infinite',
                  },
                }}
              >
                Thematic Analysis
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 6,
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              Revolutionary qualitative data analysis platform for researchers. Code interviews, identify themes, and collaborate with your team using cutting-edge AI-powered insights.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
              sx={{ mb: 8 }}
            >
              <Zoom in timeout={1200}>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: 30,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 20px 60px rgba(59, 130, 246, 0.6)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                  }}
                >
                  Start Your Research Journey
                </Button>
              </Zoom>
              <Zoom in timeout={1400}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayCircle />}
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: 30,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    borderWidth: 2,
                    backdropFilter: 'blur(10px)',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.05)'
                      : 'rgba(59, 130, 246, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: theme.palette.primary.main + '15',
                      boxShadow: '0 15px 40px rgba(59, 130, 246, 0.3)',
                    },
                  }}
                >
                  See How It Works
                </Button>
              </Zoom>
            </Stack>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
              {benefits.map((benefit, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    color: theme.palette.text.secondary,
                    px: 2,
                    py: 1,
                    borderRadius: 20,
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(30, 41, 59, 0.4)'
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                    },
                  }}
                >
                  <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 22 }} />
                  <Typography variant="body2" fontWeight={500}>{benefit}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>

        {/* Enhanced Features Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 3,
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Everything You Need for 
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                display: 'block',
              }}
            >
              Qualitative Research
            </Box>
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              mb: 8,
              color: theme.palette.text.secondary,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            From data collection to analysis and reporting - streamline your entire research workflow with our comprehensive suite of intelligent tools
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Fade in timeout={1000 + index * 200}>
                  <Card
                    onMouseEnter={() => setIsHovered(index)}
                    onMouseLeave={() => setIsHovered(null)}
                    sx={{
                      height: '100%',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${isHovered === index ? feature.color + '60' : theme.palette.divider}`,
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? `0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px ${feature.color}40`
                          : `0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px ${feature.color}40`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: feature.bgGradient,
                        opacity: isHovered === index ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
                      <Avatar
                        sx={{
                          width: 90,
                          height: 90,
                          mx: 'auto',
                          mb: 3,
                          background: feature.bgGradient,
                          boxShadow: `0 8px 25px ${feature.color}40`,
                          transition: 'all 0.3s ease',
                          ...(isHovered === index && {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: `0 15px 40px ${feature.color}60`,
                          }),
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 2,
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          transition: 'color 0.3s ease',
                          ...(isHovered === index && {
                            color: feature.color,
                          }),
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          lineHeight: 1.7,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Enhanced Research Process Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 3,
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Your Research Journey,
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                display: 'block',
              }}
            >
              Simplified
            </Box>
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              mb: 10,
              color: theme.palette.text.secondary,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            Follow our proven methodology for systematic qualitative analysis with guided workflows
          </Typography>
          
          <Grid container spacing={6}>
            {[
              {
                number: '1',
                title: 'Upload & Organize',
                description: 'Import interviews, documents, and media files. Organize your data into projects with secure cloud storage and automated backup.',
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#10b981',
              },
              {
                number: '2', 
                title: 'Code & Analyze',
                description: 'Apply codes manually or with AI assistance. Develop your codebook and identify emerging themes systematically with intelligent suggestions.',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#3b82f6',
              },
              {
                number: '3',
                title: 'Report & Share',
                description: 'Generate comprehensive reports, visualize findings, and collaborate with stakeholders on your discoveries with interactive dashboards.',
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#8b5cf6',
              },
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in timeout={1500 + index * 200}>
                  <Box 
                    textAlign="center"
                    sx={{
                      position: 'relative',
                      '&::after': index < 2 ? {
                        content: '""',
                        position: 'absolute',
                        top: 50,
                        right: { xs: '50%', md: -30 },
                        width: { xs: 2, md: 60 },
                        height: { xs: 60, md: 2 },
                        background: `linear-gradient(${index < 2 ? '90deg' : '180deg'}, ${step.color}40, transparent)`,
                        transform: { xs: 'translateX(50%)', md: 'none' },
                        display: { xs: 'block', md: 'block' },
                      } : {},
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 4,
                        background: step.gradient,
                        fontSize: '3rem',
                        fontWeight: 900,
                        boxShadow: `0 15px 40px ${step.color}40`,
                        border: `4px solid ${theme.palette.background.paper}`,
                        transition: 'all 0.4s ease',
                        '&:hover': {
                          transform: 'scale(1.1) rotate(-5deg)',
                          boxShadow: `0 25px 60px ${step.color}60`,
                        },
                      }}
                    >
                      {step.number}
                    </Avatar>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        mb: 3, 
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.7,
                        px: 2,
                      }}
                    >
                      {step.description}
                    </Typography>
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Enhanced Methodology Support Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 3,
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Supported Research
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                display: 'block',
              }}
            >
              Methodologies
            </Box>
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              mb: 8,
              color: theme.palette.text.secondary,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            Flexible tools that adapt to your preferred analytical approach with built-in best practices
          </Typography>
          
          <Grid container spacing={3}>
            {[
              { name: 'Thematic Analysis', desc: 'Braun & Clarke methodology', color: '#3b82f6' },
              { name: 'Grounded Theory', desc: 'Constant comparative method', color: '#8b5cf6' },
              { name: 'Content Analysis', desc: 'Quantitative & qualitative', color: '#10b981' },
              { name: 'Framework Analysis', desc: 'Ritchie & Spencer approach', color: '#f59e0b' },
              { name: 'Narrative Analysis', desc: 'Story-focused interpretation', color: '#ef4444' },
              { name: 'Phenomenological Analysis', desc: 'IPA and descriptive methods', color: '#06b6d4' },
            ].map((method, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Fade in timeout={2000 + index * 100}>
                  <Card
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        border: `2px solid ${method.color}60`,
                        boxShadow: `0 15px 40px ${method.color}30`,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(135deg, ${method.color} 0%, ${method.color}80 100%)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      },
                      '&:hover::before': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {method.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      {method.desc}
                    </Typography>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Enhanced Testimonials Section */}
        <Box sx={{ mb: 12 }}>
          <Typography
            variant="h2"
            textAlign="center"
            sx={{
              mb: 3,
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            Trusted by
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                display: 'block',
              }}
            >
              Researchers Worldwide
            </Box>
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              mb: 10,
              color: theme.palette.text.secondary,
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            Join thousands of researchers who have transformed their qualitative analysis workflow
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                quote: "ThemeAnalytica has revolutionized our qualitative data analysis. The AI-powered tools are incredibly intuitive and have saved us countless hours while improving the depth of our insights.",
                name: 'Dr. Jane Foster',
                title: 'Lead Researcher, University of Oxford',
                avatar: '/path/to/avatar1.png',
                rating: 5,
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              },
              {
                quote: "The collaboration features are seamless. Our team can work on projects in real-time, which has significantly improved our workflow and inter-rater reliability across multiple studies.",
                name: 'Dr. Carlos Ramirez',
                title: 'Director of Research, Innovate Insights',
                avatar: '/path/to/avatar2.png',
                rating: 5,
                gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              },
              {
                quote: "As a PhD student, this tool has been a lifesaver. It's affordable, powerful, and the customer support is outstanding. The learning curve was minimal and results were immediate.",
                name: 'Aisha Khan',
                title: 'PhD Candidate, Stanford University',
                avatar: '/path/to/avatar3.png',
                rating: 5,
                gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              },
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in timeout={2000 + index * 200}>
                  <Card
                    sx={{
                      p: 5,
                      height: '100%',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(25px)',
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 25px 60px rgba(0, 0, 0, 0.4)'
                          : '0 25px 60px rgba(0, 0, 0, 0.15)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: testimonial.gradient,
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', mb: 3 }}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 20,
                              height: 20,
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              borderRadius: '50%',
                              mr: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: 'white',
                            }}
                          >
                            ★
                          </Box>
                        ))}
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          mb: 4,
                          color: theme.palette.text.secondary,
                          lineHeight: 1.8,
                          fontSize: '1.1rem',
                        }}
                      >
                        "{testimonial.quote}"
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          mr: 3,
                          background: testimonial.gradient,
                          fontSize: '1.5rem',
                          fontWeight: 700,
                        }} 
                        src={testimonial.avatar}
                      >
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                          }}
                        >
                          {testimonial.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          {testimonial.title}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Enhanced Feedback Form Section */}
        <Box sx={{ mb: 2 }}>
          <Container maxWidth="lg">
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} md={6}>
                <Fade in timeout={2200}>
                  <Box>
                    <Typography
                      variant="h2"
                      sx={{
                        mb: 4,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #06b6d4 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        fontSize: { xs: '2.5rem', md: '3rem' },
                      }}
                    >
                      Share Your Valuable Feedback
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.7,
                        mb: 3,
                        fontWeight: 500,
                      }}
                    >
                      We would love to hear your insights
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.8,
                        fontSize: '1.1rem',
                      }}
                    >
                      Your feedback helps us improve our platform and create better tools for qualitative researchers worldwide. Share your thoughts, suggestions, or experiences with us and help shape the future of research technology.
                    </Typography>
                    
                    {/* Stats */}
                    <Grid container spacing={3} sx={{ mt: 4 }}>
                      {[
                        { number: '10K+', label: 'Active Researchers' },
                        { number: '50K+', label: 'Projects Completed' },
                        { number: '98%', label: 'Satisfaction Rate' },
                      ].map((stat, index) => (
                        <Grid item xs={4} key={index}>
                          <Box textAlign="center">
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                              }}
                            >
                              {stat.number}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontWeight: 600 }}
                            >
                              {stat.label}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Fade in timeout={2400}>
                  <Card
                    sx={{
                      p: 5,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.9)'
                        : 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(25px)',
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: 4,
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 25px 60px rgba(0, 0, 0, 0.4)'
                        : '0 25px 60px rgba(0, 0, 0, 0.15)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                      },
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        mb: 5,
                        fontWeight: 700,
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                      }}
                    >
                      Feedback Form
                    </Typography>
                    
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <TextField
                        label="Your Name"
                        variant="outlined"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
                            },
                          },
                        }}
                      />
                      <TextField
                        label="Email Address"
                        variant="outlined"
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
                            },
                          },
                        }}
                      />
                      <TextField
                        label="Your Message"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                            },
                            '&.Mui-focused': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
                            },
                          },
                        }}
                      />
                      
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          mt: 2,
                          py: 2,
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 20px 60px rgba(16, 185, 129, 0.6)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            transition: 'left 0.5s',
                          },
                          '&:hover::before': {
                            left: '100%',
                          },
                        }}
                        onClick={() => {
                          alert('Thank you for your valuable feedback! We appreciate your input.');
                        }}
                      >
                        Send Feedback
                      </Button>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Container>

      {/* Enhanced Newsletter Subscription */}
      <Box
        sx={{
          py: 6,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(226, 232, 240, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: `2px solid ${theme.palette.divider}`,
          borderBottom: `2px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
          },
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Stay Updated with Research Insights
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                lineHeight: 1.7,
              }}
            >
              Get the latest updates on qualitative research methodologies, platform features, and exclusive insights from leading researchers
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                maxWidth: 500,
                mx: 'auto',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                label="Enter your email address"
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 25,
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(59, 130, 246, 0.25)',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  px: 4,
                  py: 2,
                  borderRadius: 25,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 15px 40px rgba(59, 130, 246, 0.6)',
                  },
                }}
              >
                Subscribe Now
              </Button>
            </Box>
            <Typography
              variant="body2"
              sx={{
                mt: 3,
                color: theme.palette.text.secondary,
                opacity: 0.8,
              }}
            >
              Join 10,000+ researchers • Unsubscribe anytime • No spam, ever
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Enhanced Footer */}
      <Box
        sx={{
          py: 6,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(226, 232, 240, 0.98) 100%)',
          backdropFilter: 'blur(25px)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 2,
                }}
              >
                ThemeAnalytica
              </Typography>
              <Typography
                variant="body1"
                sx={{ 
                  color: theme.palette.text.secondary,
                  maxWidth: 400,
                  lineHeight: 1.7,
                  fontSize: '1.1rem',
                }}
              >
                Empowering researchers worldwide with intelligent qualitative analysis tools for meaningful insights and groundbreaking discoveries.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-end' },
                  alignItems: 'center',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 3,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  © 2025 ThemeAnalytica. All rights reserved.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[
                    { icon: <Twitter />, color: '#1DA1F2' },
                    { icon: <LinkedIn />, color: '#0077B5' },
                    { icon: <GitHub />, color: theme.palette.text.primary },
                  ].map((social, index) => (
                    <IconButton 
                      key={index}
                      sx={{ 
                        width: 50,
                        height: 50,
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px) scale(1.1)',
                          background: social.color + '20',
                          color: social.color,
                          boxShadow: `0 8px 25px ${social.color}40`,
                        },
                      }}
                    >
                      {social.icon}
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <style>
        {`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(5deg); }
          }
          
          @keyframes floatReverse {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-25px) rotate(-3deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          
          @keyframes glow {
            0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
            100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 40px rgba(139, 92, 246, 0.3); }
          }
          
          @keyframes shimmer {
            0% { transform: scaleX(0); }
            50% { transform: scaleX(1); }
            100% { transform: scaleX(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default Landing;