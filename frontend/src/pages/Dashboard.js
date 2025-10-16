import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from '../config/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications } = useSocket();
  
  const [tabValue, setTabValue] = useState(0);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      const response = await axios.get('/api/exchanges/my-exchanges');
      if (response.data.success) {
        setExchanges(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch exchanges:', error);
      setError('Failed to load exchanges');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <PendingIcon color="warning" />;
      case 'Accepted':
        return <CheckCircleIcon color="success" />;
      case 'In Progress':
        return <ScheduleIcon color="info" />;
      case 'Completed':
        return <CheckCircleIcon color="primary" />;
      case 'Cancelled':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Accepted':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Completed':
        return 'primary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredExchanges = exchanges.filter(exchange => {
    switch (tabValue) {
      case 0: // All
        return true;
      case 1: // Pending
        return exchange.status === 'Pending';
      case 2: // Active
        return ['Accepted', 'In Progress'].includes(exchange.status);
      case 3: // Completed
        return exchange.status === 'Completed';
      default:
        return true;
    }
  });

  const baseStats = [
    {
      title: 'Total Exchanges',
      value: exchanges.length,
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary'
    },
    {
      title: 'Points Balance',
      value: user?.pointsBalance || 0,
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success'
    },
    {
      title: 'Unread Messages',
      value: notifications.filter(n => n.type === 'new_message' && !n.isRead).length,
      icon: <MessageIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info'
    }
  ];

  // Only show rating if user has skills offered
  const stats = user?.skillsOffered && user.skillsOffered.length > 0 
    ? [
        ...baseStats.slice(0, 2),
        {
          title: 'Average Rating',
          value: user?.averageRating ? user.averageRating.toFixed(1) : '0.0',
          icon: <StarIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
          color: 'warning'
        },
        ...baseStats.slice(2)
      ]
    : baseStats;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your skill exchanges
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate('/search')}
                  fullWidth
                >
                  Find Teachers
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/profile')}
                  fullWidth
                >
                  Update Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  onClick={() => navigate('/messages')}
                  fullWidth
                >
                  View Messages
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {notifications.slice(0, 3).map((notification, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={notification.title}
                      secondary={notification.message}
                    />
                  </ListItem>
                ))}
                {notifications.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No recent activity"
                      secondary="Start by searching for skills to learn!"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Exchanges Section */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            My Exchanges
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/search')}
            startIcon={<SchoolIcon />}
          >
            New Exchange
          </Button>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="Active" />
          <Tab label="Completed" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {filteredExchanges.length === 0 ? (
          <Box textAlign="center" py={4}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No exchanges found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {tabValue === 0 
                ? "You haven't created any exchanges yet. Start by finding a teacher!"
                : `No ${['all', 'pending', 'active', 'completed'][tabValue]} exchanges found.`
              }
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/search')}
              startIcon={<SchoolIcon />}
            >
              Find Teachers
            </Button>
          </Box>
        ) : (
          <List>
            {filteredExchanges.map((exchange) => (
              <ListItem
                key={exchange.id}
                button
                onClick={() => navigate(`/exchange/${exchange.id}`)}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    {exchange.requesterID === user?.id ? exchange.providerName?.[0] : exchange.requesterName?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">
                        {exchange.skill} with {exchange.requesterID === user?.id ? exchange.providerName : exchange.requesterName}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(exchange.status)}
                        label={exchange.status}
                        size="small"
                        color={getStatusColor(exchange.status)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {exchange.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(exchange.createdAt)}
                        {exchange.scheduledDate && ` • Scheduled: ${formatDate(exchange.scheduledDate)}`}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/exchange/${exchange.id}`);
                    }}
                  >
                    <MessageIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;






