import React, { useState, useEffect } from 'react';
import {
  Container,
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
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Grid
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from '../config/axios';

const ExchangeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { joinExchange, sendMessage } = useSocket();
  
  const [exchange, setExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingData, setRatingData] = useState({ score: 5, reviewText: '' });
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    if (id) {
      fetchExchangeDetails();
      joinExchange(id);
    }

    return () => {
      // Leave exchange room when component unmounts
    };
  }, [id, joinExchange]);

  // Listen for real-time messages from all users
  useEffect(() => {
    const handleNewMessage = (event) => {
      const message = event.detail;
      // Add messages from all users for this exchange
      if (message.exchangeID === id) {
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    window.addEventListener('newMessage', handleNewMessage);
    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
    };
  }, [id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchExchangeDetails = async () => {
    try {
      const response = await axios.get(`/api/exchanges/${id}`);
      if (response.data.success) {
        setExchange(response.data.data);
        setMessages(response.data.data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch exchange details:', error);
      setError('Failed to load exchange details');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Save to database via API
      const response = await axios.post(`/api/exchanges/${id}/message`, {
        content: newMessage,
        messageType: 'text'
      });

      if (response.data.success) {
        const newMsg = response.data.data;
        
        // Send via socket for real-time delivery to both users
        sendMessage({
          exchangeId: id,
          senderId: user.id,
          content: newMessage,
          messageType: 'text',
          senderName: user.name,
          senderPicture: user.profilePicture,
          id: newMsg.id,
          createdAt: newMsg.createdAt
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`/api/exchanges/${id}/status`, { status: newStatus });
      setExchange(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleRateExchange = async () => {
    try {
      const otherUserId = exchange.requesterID === user.id ? exchange.providerID : exchange.requesterID;
      const response = await axios.post(`/api/exchanges/${id}/rate`, {
        ratedUserID: otherUserId,
        score: ratingData.score,
        reviewText: ratingData.reviewText
      });
      
      if (response.data.success) {
        alert('Rating submitted successfully!');
        setRatingDialogOpen(false);
        setRatingData({ score: 5, reviewText: '' });
        // Refresh exchange details to show the new rating
        fetchExchangeDetails();
      }
    } catch (error) {
      console.error('Failed to rate exchange:', error);
      alert(error.response?.data?.message || 'Failed to submit rating');
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

  // Only the requester (student) can rate the provider (teacher)
  const canRate = exchange?.status === 'Completed' && exchange?.requesterID === user?.id;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !exchange) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Exchange not found'}
        </Alert>
      </Container>
    );
  }

  const otherUser = exchange.requesterID === user?.id ? 
    { name: exchange.providerName, id: exchange.providerID } : 
    { name: exchange.requesterName, id: exchange.requesterID };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Exchange Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {exchange.skill} Exchange
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                with {otherUser.name}
              </Typography>
              <Chip
                label={exchange.status}
                color={getStatusColor(exchange.status)}
                sx={{ mb: 2 }}
              />
            </Box>
            <Box display="flex" gap={1}>
              {exchange.status === 'Pending' && exchange.providerID === user?.id && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleStatusChange('Accepted')}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleStatusChange('Cancelled')}
                  >
                    Decline
                  </Button>
                </>
              )}
              {exchange.status === 'Accepted' && (
                <Button
                  variant="contained"
                  onClick={() => handleStatusChange('In Progress')}
                >
                  Start Session
                </Button>
              )}
              {exchange.status === 'In Progress' && (
                <Button
                  variant="contained"
                  onClick={() => handleStatusChange('Completed')}
                >
                  Complete
                </Button>
              )}
              {canRate && (
                <Button
                  variant="outlined"
                  startIcon={<StarIcon />}
                  onClick={() => setRatingDialogOpen(true)}
                >
                  Rate Exchange
                </Button>
              )}
            </Box>
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {exchange.description}
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip label={`Level: ${exchange.skillLevel}`} variant="outlined" />
            <Chip label={`Type: ${exchange.sessionType}`} variant="outlined" />
            {exchange.hourlyRate > 0 && (
              <Chip label={`${exchange.hourlyRate} points/hour`} variant="outlined" />
            )}
            {exchange.scheduledDate && (
              <Chip 
                label={`Scheduled: ${new Date(exchange.scheduledDate).toLocaleDateString()}`} 
                variant="outlined" 
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Messages */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Messages
              </Typography>
              <Paper
                sx={{
                  height: 400,
                  overflow: 'auto',
                  p: 2,
                  mb: 2,
                  backgroundColor: 'grey.50'
                }}
              >
                {messages.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    No messages yet. Start the conversation!
                  </Typography>
                ) : (
                  <List>
                    {messages.map((message) => (
                      <ListItem key={message.id} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {message.senderName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2">
                                {message.senderName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(message.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2">
                              {message.content}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                  </List>
                )}
              </Paper>
              
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  startIcon={<SendIcon />}
                >
                  Send
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Exchange Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exchange Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={exchange.status}
                        color={getStatusColor(exchange.status)}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Created"
                    secondary={new Date(exchange.createdAt).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Duration"
                    secondary={`${exchange.durationHours} hours`}
                  />
                </ListItem>
                {exchange.isMutualExchange && (
                  <ListItem>
                    <ListItemText
                      primary="Type"
                      secondary="Mutual Exchange"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Ratings Section */}
          {exchange.ratings && exchange.ratings.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ratings
                </Typography>
                <List dense>
                  {exchange.ratings.map((rating, index) => (
                    <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid #eee' }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Rating value={rating.score} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(rating.createdAt).toLocaleDateString('sv-SE')}
                        </Typography>
                      </Box>
                      {rating.reviewText && (
                        <Typography variant="body2" color="text.secondary">
                          {rating.reviewText}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Exchange</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body1" gutterBottom>
              How would you rate your experience with {otherUser.name}?
            </Typography>
            <Rating
              value={ratingData.score}
              onChange={(event, newValue) => {
                setRatingData(prev => ({ ...prev, score: newValue }));
              }}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            label="Review (Optional)"
            multiline
            rows={3}
            value={ratingData.reviewText}
            onChange={(e) => setRatingData(prev => ({ ...prev, reviewText: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRateExchange} variant="contained">Submit Rating</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExchangeDetails;
