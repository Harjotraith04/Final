import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  useTheme,
  Divider,
  Alert,
  Fade,
  Zoom,
  IconButton,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  LockOutlined, 
  Google, 
  GitHub, 
  ArrowBack,
  Visibility,
  VisibilityOff,
  Email,
  Security,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { ThemeModeContext } from '../App';
import axios from 'axios';

function Login() {
  const theme = useTheme();
  const { mode, toggleColorMode } = useContext(ThemeModeContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        formData
      );

      console.log('Login successful:', response.data);
      localStorage.setItem('authToken', response.data.access_token);

      navigate('/project-selection');

    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${API_BASE_URL}/auth/login/google`;
  };

  const handleGitHubLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${API_BASE_URL}/auth/login/github`;
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.palette.mode === 'dark' 
          ? 'radial-gradient(ellipse at center, #0f172a 0%, #1e293b 40%, #334155 100%)'
          : 'radial-gradient(ellipse at center, #f8fafc 0%, #e2e8f0 40%, #cbd5e1 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Enhanced animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -300,
          right: -300,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 70%)',
          animation: 'floatSlow 12s ease-in-out infinite',
          transform: `translateY(${scrollY * 0.3}px)`,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -250,
          left: -250,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(192, 132, 252, 0.06) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
          animation: 'floatReverse 15s ease-in-out infinite',
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      />

      {/* Additional floating elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 60%)',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />

      {/* Top navigation bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backdropFilter: 'blur(20px)',
          background: theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(248, 250, 252, 0.8)',
          borderBottom: `1px solid ${theme.palette.divider}`,
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                component={RouterLink}
                to="/"
                sx={{
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${theme.palette.primary.main}20`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(-3px)',
                    background: theme.palette.primary.main + '20',
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                ThemeAnalytica
              </Typography>
            </Box>
            
            <IconButton 
              onClick={toggleColorMode}
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'rgba(110, 168, 254, 0.1)'
                  : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${theme.palette.primary.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'rotate(180deg)',
                  background: theme.palette.primary.main + '20',
                },
              }}
            >
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Main content area */}
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', py: 12 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left side - Welcome content */}
          <Grid item xs={12} lg={6} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Fade in={true} timeout={1000}>
              <Box sx={{ pr: 4 }}>
                <Typography
                  variant="h2"
                  sx={{
                    mb: 3,
                    fontWeight: 900,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
                      : 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    fontSize: '3.5rem',
                    lineHeight: 1.1,
                  }}
                >
                  Welcome Back to
                  <Box
                    component="span"
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      display: 'block',
                    }}
                  >
                    ThemeAnalytica
                  </Box>
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    color: theme.palette.text.secondary,
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                >
                  Continue your research journey with our powerful qualitative analysis platform
                </Typography>

                {/* Feature highlights */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[
                    {
                      icon: <Security sx={{ fontSize: 24 }} />,
                      title: 'Secure Authentication',
                      desc: 'Your data is protected with enterprise-grade security',
                      color: '#10b981',
                    },
                    {
                      icon: <Email sx={{ fontSize: 24 }} />,
                      title: 'Multiple Sign-in Options',
                      desc: 'Choose from email, Google, or GitHub authentication',
                      color: '#3b82f6',
                    },
                  ].map((feature, index) => (
                    <Fade key={index} in={true} timeout={1200 + index * 200}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          p: 3,
                          borderRadius: 3,
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(30, 41, 59, 0.4)'
                            : 'rgba(255, 255, 255, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${theme.palette.divider}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(10px)',
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(30, 41, 59, 0.6)'
                              : 'rgba(255, 255, 255, 0.8)',
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 50,
                            height: 50,
                            background: `linear-gradient(135deg, ${feature.color} 0%, ${feature.color}80 100%)`,
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Fade>
                  ))}
                </Box>
              </Box>
            </Fade>
          </Grid>

          {/* Right side - Login form */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                <Paper
                  elevation={0}
                  sx={{
                    padding: { xs: 4, sm: 6 },
                    width: '100%',
                    maxWidth: 480,
                    borderRadius: 4,
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(30, 41, 59, 0.9)'
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(25px)',
                    border: `2px solid ${theme.palette.divider}`,
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 25px 60px rgba(0, 0, 0, 0.4)'
                      : '0 25px 60px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 35px 80px rgba(0, 0, 0, 0.5)'
                        : '0 35px 80px rgba(0, 0, 0, 0.2)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%)',
                    },
                  }}
                >
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Fade in={true} style={{ transitionDelay: '400ms' }}>
                      <Avatar
                        sx={{
                          m: '0 auto 2rem',
                          width: 80,
                          height: 80,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1) rotate(5deg)',
                            boxShadow: '0 20px 50px rgba(59, 130, 246, 0.6)',
                          },
                        }}
                      >
                        <LockOutlined sx={{ fontSize: 40 }} />
                      </Avatar>
                    </Fade>

                    <Fade in={true} style={{ transitionDelay: '500ms' }}>
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
                        Sign In
                      </Typography>
                    </Fade>

                    <Fade in={true} style={{ transitionDelay: '600ms' }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                        }}
                      >
                        Access your research dashboard and continue your analysis
                      </Typography>
                    </Fade>
                  </Box>

                  {/* Social Login Buttons */}
                  <Box sx={{ mb: 4 }}>
                    <Fade in={true} style={{ transitionDelay: '700ms' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Google />}
                        onClick={handleGoogleLogin}
                        sx={{
                          mb: 2,
                          py: 2,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderColor: theme.palette.divider,
                          borderWidth: 2,
                          backgroundColor: 'transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#4285f4',
                            backgroundColor: 'rgba(66, 133, 244, 0.1)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(66, 133, 244, 0.3)',
                          },
                        }}
                      >
                        Continue with Google
                      </Button>
                    </Fade>

                    <Fade in={true} style={{ transitionDelay: '800ms' }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GitHub />}
                        onClick={handleGitHubLogin}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderColor: theme.palette.divider,
                          borderWidth: 2,
                          backgroundColor: 'transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: theme.palette.text.primary,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'rgba(0, 0, 0, 0.1)',
                            transform: 'translateY(-2px)',
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 8px 25px rgba(255, 255, 255, 0.2)'
                              : '0 8px 25px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        Continue with GitHub
                      </Button>
                    </Fade>
                  </Box>

                  {/* Divider */}
                  <Fade in={true} style={{ transitionDelay: '900ms' }}>
                    <Divider sx={{ mb: 4 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 600,
                          px: 2,
                        }}
                      >
                        OR CONTINUE WITH EMAIL
                      </Typography>
                    </Divider>
                  </Fade>

                  {/* Error Alert */}
                  {error && (
                    <Fade in={true}>
                      <Alert
                        severity="error"
                        sx={{
                          mb: 3,
                          borderRadius: 3,
                          fontWeight: 500,
                        }}
                      >
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  {/* Login Form */}
                  <Box component="form" onSubmit={handleSubmit}>
                    <Fade in={true} style={{ transitionDelay: '1000ms' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.02)',
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
                          '& .MuiInputLabel-root': {
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Fade>

                    <Fade in={true} style={{ transitionDelay: '1100ms' }}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined sx={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ color: theme.palette.text.secondary }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: 4,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.02)',
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
                          '& .MuiInputLabel-root': {
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Fade>

                    <Fade in={true} style={{ transitionDelay: '1200ms' }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                          mb: 3,
                          py: 2,
                          borderRadius: 3,
                          textTransform: 'none',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-3px)',
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
                        Sign In to Dashboard
                      </Button>
                    </Fade>

                    {/* Footer Links */}
                    <Fade in={true} style={{ transitionDelay: '1300ms' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={handleForgotPassword}
                          sx={{
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: theme.palette.primary.dark,
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Forgot your password?
                        </Link>
                      </Box>
                    </Fade>

                    <Fade in={true} style={{ transitionDelay: '1400ms' }}>
                      <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          New to ThemeAnalytica?
                        </Typography>
                        <Link
                          component={RouterLink}
                          to="/signup"
                          sx={{
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '1rem',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              color: theme.palette.primary.dark,
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Create your account →
                        </Link>
                      </Box>
                    </Fade>
                  </Box>
                </Paper>
              </Zoom>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <style>
        {`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(3deg); }
          }
          
          @keyframes floatReverse {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-25px) rotate(-2deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
}

export default Login;