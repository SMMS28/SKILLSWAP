import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from '../config/axios';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [addSkillData, setAddSkillData] = useState({});
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillType, setSkillType] = useState('offered'); // 'offered' or 'wanted'

  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    if (id) {
      fetchUserProfile(id);
    } else if (currentUser) {
      setProfileUser(currentUser);
      setLoading(false);
    }
    fetchAvailableSkills();
  }, [id, currentUser]);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      if (response.data.success) {
        setProfileUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await axios.get('/api/skills/available');
      if (response.data.success) {
        setAvailableSkills(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch available skills:', error);
    }
  };

  const handleEditClick = () => {
    setEditData({
      name: profileUser.name,
      location: profileUser.location || '',
      bio: profileUser.bio || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(`/api/users/${profileUser.id}`, editData);
      if (response.data.success) {
        setProfileUser(response.data.data);
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddSkillClick = (type) => {
    setSkillType(type);
    setAddSkillData({
      skillID: '',
      skillLevel: 'Beginner',
      hourlyRate: 0,
      maxHourlyRate: 0,
      description: ''
    });
    setAddSkillDialogOpen(true);
  };

  const handleAddSkillSave = async () => {
    try {
      const endpoint = skillType === 'offered' 
        ? `/api/users/${profileUser.id}/skills/offered`
        : `/api/users/${profileUser.id}/skills/wanted`;
      
      const payload = skillType === 'offered' 
        ? {
            skillID: addSkillData.skillID,
            skillLevel: addSkillData.skillLevel,
            hourlyRate: addSkillData.hourlyRate,
            description: addSkillData.description
          }
        : {
            skillID: addSkillData.skillID,
            skillLevel: addSkillData.skillLevel,
            maxHourlyRate: addSkillData.maxHourlyRate,
            description: addSkillData.description
          };

      const response = await axios.post(endpoint, payload);
      if (response.data.success) {
        // Refresh user profile to show new skill
        if (id) {
          fetchUserProfile(id);
        } else {
          // Update current user data
          const updatedUser = { ...profileUser };
          if (skillType === 'offered') {
            updatedUser.skillsOffered = [...(updatedUser.skillsOffered || []), response.data.data];
          } else {
            updatedUser.skillsWanted = [...(updatedUser.skillsWanted || []), response.data.data];
          }
          setProfileUser(updatedUser);
        }
        setAddSkillDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to add skill:', error);
      setError('Failed to add skill');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !profileUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Profile not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Profile Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                src={profileUser.profilePicture}
                sx={{ width: 120, height: 120 }}
              >
                {profileUser.name?.[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {profileUser.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    @{profileUser.userID}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box display="flex" alignItems="center">
                      <LocationIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {profileUser.location || 'Location not specified'}
                      </Typography>
                    </Box>
                    {profileUser.skillsOffered && profileUser.skillsOffered.length > 0 && (
                      <Box display="flex" alignItems="center">
                        <StarIcon sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Rating value={profileUser.averageRating || 0} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({profileUser.averageRating?.toFixed(1) || '0.0'})
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {profileUser.bio || 'No bio available'}
                  </Typography>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    {isOwnProfile && (
                      <Chip
                        icon={<MoneyIcon />}
                        label={`${profileUser.pointsBalance} points`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={`Member since ${new Date(profileUser.createdAt).getFullYear()}`}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Skills Offered" />
          <Tab label="Skills Wanted" />
          <Tab label="Reviews" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Skills Offered</Typography>
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => handleAddSkillClick('offered')}
                >
                  Add Skill
                </Button>
              )}
            </Box>
            {profileUser.skillsOffered?.length > 0 ? (
              <List>
                {profileUser.skillsOffered.map((skill, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SchoolIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={skill.skillName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {skill.skillCategory} • {skill.skillLevel}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {skill.hourlyRate} points/hour
                          </Typography>
                          {skill.description && (
                            <Typography variant="body2">
                              {skill.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                {isOwnProfile ? 'No skills offered yet. Add some skills to get started!' : 'No skills offered.'}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Skills Wanted</Typography>
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => handleAddSkillClick('wanted')}
                >
                  Add Skill
                </Button>
              )}
            </Box>
            {profileUser.skillsWanted?.length > 0 ? (
              <List>
                {profileUser.skillsWanted.map((skill, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SchoolIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={skill.skillName}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {skill.skillCategory} • {skill.skillLevel}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Max: {skill.maxHourlyRate} SEK/hour
                          </Typography>
                          {skill.description && (
                            <Typography variant="body2">
                              {skill.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                {isOwnProfile ? 'No skills wanted yet. Add some skills you want to learn!' : 'No skills wanted.'}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Reviews</Typography>
            {profileUser.ratings?.length > 0 ? (
              <List>
                {profileUser.ratings.map((rating, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating value={rating.score} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            by {rating.raterName}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2">
                          {rating.reviewText || 'No review text provided'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No reviews yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={editData.name || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={editData.location || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={3}
            value={editData.bio || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog open={addSkillDialogOpen} onClose={() => setAddSkillDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add {skillType === 'offered' ? 'Skill Offered' : 'Skill Wanted'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Skill</InputLabel>
            <Select
              value={addSkillData.skillID || ''}
              onChange={(e) => setAddSkillData(prev => ({ ...prev, skillID: e.target.value }))}
              label="Skill"
            >
              {availableSkills.map((skill) => (
                <MenuItem key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Skill Level</InputLabel>
            <Select
              value={addSkillData.skillLevel || 'Beginner'}
              onChange={(e) => setAddSkillData(prev => ({ ...prev, skillLevel: e.target.value }))}
              label="Skill Level"
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
              <MenuItem value="Expert">Expert</MenuItem>
            </Select>
          </FormControl>

          {skillType === 'offered' ? (
          <TextField
            fullWidth
            label="Hourly Rate (Points)"
            type="number"
            value={addSkillData.hourlyRate || 0}
            onChange={(e) => setAddSkillData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
            margin="normal"
            inputProps={{ min: 0, step: 1 }}
          />
          ) : (
            <TextField
              fullWidth
              label="Max Hourly Rate (Points)"
              type="number"
              value={addSkillData.maxHourlyRate || 0}
              onChange={(e) => setAddSkillData(prev => ({ ...prev, maxHourlyRate: parseFloat(e.target.value) || 0 }))}
              margin="normal"
              inputProps={{ min: 0, step: 1 }}
            />
          )}

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={addSkillData.description || ''}
            onChange={(e) => setAddSkillData(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
            placeholder="Describe your experience or what you're looking for..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSkillDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSkillSave} variant="contained">Add Skill</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;






