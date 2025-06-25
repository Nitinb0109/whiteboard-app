import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomSelection from './RoomSelection';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Grid,
  Divider,
  Paper
} from '@mui/material';

import {
  Menu as MenuIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
  Help as HelpIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await fetch('import.meta.env.VITE_API_BASE_URL/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          navigate('/signin');
          return;
        }

        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const menuItems = [
    { text: 'Profile', icon: <PersonIcon />, onClick: () => setActiveSection('profile'), section: 'profile' },
    { text: 'History', icon: <HistoryIcon />, onClick: () => setActiveSection('history'), section: 'history' },
    { text: 'Help', icon: <HelpIcon />, onClick: () => setActiveSection('help'), section: 'help' },
    { text: 'About Us', icon: <InfoIcon />, onClick: () => setActiveSection('about'), section: 'about' },
    { text: 'Logout', icon: <LogoutIcon />, onClick: handleLogout }
  ];

  const renderContent = () => {
    if (!userProfile) return <Typography>Loading profile information...</Typography>;

    switch (activeSection) {
      case 'Private Room':
        return <RoomSelection />;
      case 'history':
        return <Typography variant="h2">History section coming soon...</Typography>;
      case 'help':
        return <Typography variant="h2">Help section coming soon...</Typography>;
      case 'about':
        return <Typography variant="h2">About Us section coming soon...</Typography>;
      default:
        return (
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ height: '70vh' }}
          >
            {[
              { label: 'Private Room', color: '#1976d2', section: 'Private Room' },
              { label: 'Public Room', color: '#9c27b0', section: 'Public Room' },
             
            ].map(({ label, color, section }) => (
              <Grid item xs={12} sm={6} md={5} key={label}>
                <Paper
                  elevation={6}
                  sx={{
                    height: 250,
                    width: 700,
                    bgcolor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition: '0.3s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    }
                  }}
                  onClick={() => setActiveSection(section)}
                >
                  {label}
                </Paper>
              </Grid>
            ))}
          </Grid>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            bgcolor: 'white'
          },
        }}
      >
        <Toolbar />
        {userProfile && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                margin: '0 auto',
                bgcolor: 'primary.main'
              }}
            >
              {userProfile.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" sx={{ mt: 1 }}>
              {userProfile.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarIcon sx={{ fontSize: 16, mr: 1 }} />
              <Typography variant="body2">
                Joined: {new Date(userProfile.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
          </Box>
        )}

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={item.onClick}
              selected={item.section === activeSection}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: 8
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;
