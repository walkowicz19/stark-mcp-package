const express = require('express');
const router = express.Router();

// Get token usage statistics
router.get('/stats', (req, res) => {
  try {
    const { db } = req.app.locals;
    const period = req.query.period || '24h';
    
    const stats = db.getTokenStats(period);
    
    // Calculate summary
    const summary = {
      total_tokens: stats.reduce((sum, s) => sum + (s.total_tokens || 0), 0),
      total_cost: stats.reduce((sum, s) => sum + (s.total_cost || 0), 0),
      request_count: stats.reduce((sum, s) => sum + (s.request_count || 0), 0)
    };
    
    res.json({
      success: true,
      summary,
      by_model: stats,
      timeline: [], // Would need to implement timeline data
      period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get token usage time series (for charts)
router.get('/timeseries', (req, res) => {
  try {
    const { tokenTracker } = req.app.locals;
    const period = req.query.period || '24h';
    const interval = req.query.interval || '1h';
    
    const timeseries = tokenTracker.getUsageTimeSeries(period, interval);
    
    res.json({
      success: true,
      data: timeseries,
      period,
      interval
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get token usage history
router.get('/history', (req, res) => {
  try {
    const { db } = req.app.locals;
    const filters = {
      model: req.query.model,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      limit: parseInt(req.query.limit) || 100
    };
    
    const history = db.getTokenUsage(filters);
    
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Track new token usage
router.post('/track', (req, res) => {
  try {
    const { tokenTracker, broadcast } = req.app.locals;
    const data = req.body;
    
    // Validate required fields
    if (!data.model || !data.prompt_tokens || !data.completion_tokens) {
      return res.status(400).json({
        success: false,
        error: 'model, prompt_tokens, and completion_tokens are required'
      });
    }
    
    const result = tokenTracker.trackUsage(data);
    
    // Broadcast update
    broadcast({
      type: 'token_usage',
      data: result,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get cost projection
router.get('/projection', (req, res) => {
  try {
    const { tokenTracker } = req.app.locals;
    const period = req.query.period || '30d';
    
    const projection = tokenTracker.getCostProjection(period);
    
    res.json({
      success: true,
      data: projection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get efficiency metrics
router.get('/efficiency', (req, res) => {
  try {
    const { tokenTracker } = req.app.locals;
    
    const metrics = tokenTracker.getEfficiencyMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get active sessions
router.get('/sessions', (req, res) => {
  try {
    const { tokenTracker } = req.app.locals;
    
    const sessions = tokenTracker.getActiveSessions();
    
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get alerts
router.get('/alerts', (req, res) => {
  try {
    const { tokenTracker } = req.app.locals;
    const level = req.query.level;
    
    const alerts = tokenTracker.getAlerts(level);
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear alerts
router.delete('/alerts', (req, res) => {
  try {
    const { tokenTracker } = req.app.locals;
    const type = req.query.type;
    
    tokenTracker.clearAlerts(type);
    
    res.json({
      success: true,
      message: type ? `Cleared ${type} alerts` : 'Cleared all alerts'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update token costs
router.put('/costs/:model', (req, res) => {
  try {
    const { tokenTracker } = req.app.locals;
    const model = req.params.model;
    const costs = req.body;
    
    if (!costs.prompt || !costs.completion) {
      return res.status(400).json({
        success: false,
        error: 'prompt and completion costs are required'
      });
    }
    
    tokenTracker.updateTokenCosts(model, costs);
    
    res.json({
      success: true,
      message: `Updated costs for ${model}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update usage limits
router.put('/limits', (req, res) => {
  try {
    const { tokenTracker } = req.app.locals;
    const limits = req.body;
    
    tokenTracker.updateLimits(limits);
    
    res.json({
      success: true,
      message: 'Usage limits updated',
      data: limits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

// Made with Bob
