const express = require('express');
const database = require('../models/Database');
const notificationService = require('../services/NotificationService');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Create new exchange request
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const {
      providerID,
      skillID,
      skill,
      skillLevel,
      description,
      sessionType,
      hourlyRate,
      scheduledDate,
      durationHours,
      isMutualExchange
    } = req.body;

    // Validation
    if (!providerID || !skillID || !skill) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID, skill ID, and skill name are required'
      });
    }

    // Check if provider exists
    const provider = await database.findUserById(providerID);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check if user is not trying to create exchange with themselves
    if (req.user.userId === providerID) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create exchange with yourself'
      });
    }

    // Calculate total points needed for the exchange
    const totalPoints = (hourlyRate || 0) * (durationHours || 1.0);
    
    // Check if requester has enough points
    const requester = await database.findUserById(req.user.userId);
    if (requester.pointsBalance < totalPoints) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You need ${totalPoints} points but only have ${requester.pointsBalance} points.`
      });
    }

    const exchangeData = {
      requesterID: req.user.userId,
      providerID,
      skillID,
      skill,
      skillLevel: skillLevel || 'Beginner',
      description,
      sessionType: sessionType || 'Exchange',
      hourlyRate: hourlyRate || 0,
      scheduledDate,
      durationHours: durationHours || 1.0,
      isMutualExchange: isMutualExchange || false
    };

    const exchange = await database.createExchange(exchangeData);
    
    // Deduct points from requester immediately when exchange is created
    await database.deductPoints(req.user.userId, totalPoints, 'Payment', `Exchange request for ${skill}`, exchange.id);

    // Send notification to requester about points deduction
    await notificationService.notifyPointsDeducted(req.user.userId, {
      amount: totalPoints,
      reason: `Exchange request for ${skill}`,
      exchangeId: exchange.id
    });

    // Send notification to provider
    await notificationService.notifyNewExchangeRequest(providerID, {
      exchangeId: exchange.id,
      requesterName: req.user.name || 'Unknown User',
      skill: exchange.skill,
      description: exchange.description
    });

    res.status(201).json({
      success: true,
      message: 'Exchange request created successfully',
      data: exchange
    });

  } catch (error) {
    console.error('Create exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all exchanges for current user
router.get('/my-exchanges', authenticateToken, async (req, res) => {
  try {
    const exchanges = await database.findExchangesByUserId(req.user.userId);
    
    res.json({
      success: true,
      data: exchanges
    });

  } catch (error) {
    console.error('Get exchanges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get exchange details with messages
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is part of this exchange
    if (exchange.requesterID !== req.user.userId && exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this exchange'
      });
    }

    // Get messages for this exchange
    const messages = await database.getExchangeMessages(id);
    
    // Get ratings for this exchange
    const ratings = await database.getExchangeRatings(id);

    res.json({
      success: true,
      data: {
        ...exchange,
        messages,
        ratings
      }
    });

  } catch (error) {
    console.error('Get exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Accept exchange request
router.put('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is the provider
    if (exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the provider can accept this exchange'
      });
    }

    // Check if exchange is still pending
    if (exchange.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Exchange is no longer pending'
      });
    }

    const updatedExchange = await database.acceptExchange(id);

    // Send notification to requester
    await notificationService.notifyExchangeAccepted(exchange.requesterID, {
      exchangeId: id,
      providerName: req.user.name || 'Unknown User',
      skill: exchange.skill
    });

    res.json({
      success: true,
      message: 'Exchange accepted successfully',
      data: updatedExchange
    });

  } catch (error) {
    console.error('Accept exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Decline exchange request
router.put('/:id/decline', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is the provider
    if (exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the provider can decline this exchange'
      });
    }

    // Check if exchange is still pending
    if (exchange.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Exchange is no longer pending'
      });
    }

    const updatedExchange = await database.declineExchange(id);

    // Refund points to requester when exchange is declined
    const totalPoints = exchange.hourlyRate * exchange.durationHours;
    await database.awardPoints(
      exchange.requesterID, 
      totalPoints, 
      'Award', 
      `Refund for declined exchange: ${exchange.skill}`, 
      id
    );

    // Send notification to requester about points refund
    await notificationService.notifyPointsAwarded(exchange.requesterID, {
      amount: totalPoints,
      reason: `Refund for declined exchange: ${exchange.skill}`,
      exchangeId: id
    });

    // Send notification to requester
    await notificationService.notifyExchangeDeclined(exchange.requesterID, {
      exchangeId: id,
      providerName: req.user.name || 'Unknown User',
      skill: exchange.skill
    });

    res.json({
      success: true,
      message: 'Exchange declined successfully',
      data: updatedExchange
    });

  } catch (error) {
    console.error('Decline exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send message in exchange
router.post('/:id/message', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, messageType } = req.body;
    
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is part of this exchange
    if (exchange.requesterID !== req.user.userId && exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this exchange'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const message = await database.addMessage({
      exchangeID: id,
      senderID: req.user.userId,
      content,
      messageType: messageType || 'text'
    });

    // Get sender info for real-time broadcast
    const sender = await database.findUserById(req.user.userId);
    const messageWithSender = {
      ...message,
      senderName: sender.name,
      senderPicture: sender.profilePicture
    };

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messageWithSender
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update exchange status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Check if user is part of this exchange
    if (exchange.requesterID !== req.user.userId && exchange.providerID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this exchange'
      });
    }

    const validStatuses = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const updatedExchange = await database.updateExchangeStatus(id, status);

    // If exchange is completed, award points to provider
    if (status === 'Completed') {
      const totalPoints = exchange.hourlyRate * exchange.durationHours;
      await database.awardPoints(
        exchange.providerID, 
        totalPoints, 
        'Award', 
        `Completed exchange: ${exchange.skill}`, 
        id
      );

      // Send notification to provider about points earned
      await notificationService.notifyPointsAwarded(exchange.providerID, {
        amount: totalPoints,
        reason: `Completed exchange: ${exchange.skill}`,
        exchangeId: id
      });
    }

    // If exchange is cancelled, refund points to requester
    if (status === 'Cancelled') {
      const totalPoints = exchange.hourlyRate * exchange.durationHours;
      await database.awardPoints(
        exchange.requesterID, 
        totalPoints, 
        'Award', 
        `Refund for cancelled exchange: ${exchange.skill}`, 
        id
      );

      // Send notification to requester about points refund
      await notificationService.notifyPointsAwarded(exchange.requesterID, {
        amount: totalPoints,
        reason: `Refund for cancelled exchange: ${exchange.skill}`,
        exchangeId: id
      });
    }

    // Send notification about status change
    const otherUserId = exchange.requesterID === req.user.userId ? exchange.providerID : exchange.requesterID;
    await notificationService.notifyExchangeStatusChange(otherUserId, {
      exchangeId: id,
      status,
      updatedBy: req.user.name || 'Unknown User'
    });

    res.json({
      success: true,
      message: 'Exchange status updated successfully',
      data: updatedExchange
    });

  } catch (error) {
    console.error('Update exchange status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Rate an exchange
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { ratedUserID, score, reviewText } = req.body;
    
    const exchange = await database.findExchangeById(id);
    
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    // Only the requester (student) can rate the provider (teacher)
    if (exchange.requesterID !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the student can rate the teacher'
      });
    }

    // Check if exchange is completed
    if (exchange.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed exchanges'
      });
    }

    // Verify they are rating the provider (teacher), not themselves
    if (ratedUserID !== exchange.providerID) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating target'
      });
    }

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 5'
      });
    }

    const rating = await database.createRating({
      exchangeID: id,
      raterID: req.user.userId,
      ratedUserID,
      score,
      reviewText
    });
    
    // Recalculate and update average rating for the rated user
    const userRatings = await database.getUserRatings(ratedUserID);
    const avgRating = userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length;
    await database.updateUser(ratedUserID, { averageRating: avgRating });

    // Send notification about new rating
    await notificationService.notifyNewRating(ratedUserID, {
      exchangeId: id,
      raterName: req.user.name || 'Unknown User',
      score,
      skill: exchange.skill
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: rating
    });

  } catch (error) {
    console.error('Rate exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

