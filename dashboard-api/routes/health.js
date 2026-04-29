const express = require('express');
const router = express.Router();

// Get overall system health
router.get('/', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const summary = mcpMonitor.getHealthSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get health status (summary + servers)
router.get('/status', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const summary = mcpMonitor.getHealthSummary();
    const servers = mcpMonitor.getAllStatus();
    
    res.json({
      success: true,
      summary,
      servers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all server statuses
router.get('/servers', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const statuses = mcpMonitor.getAllStatus();
    
    res.json({
      success: true,
      data: statuses,
      count: statuses.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific server status
router.get('/servers/:serverId', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const status = mcpMonitor.getServerStatus(req.params.serverId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check specific server health
router.post('/servers/:serverId/check', async (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const serverId = req.params.serverId;
    
    const config = mcpMonitor.servers[serverId];
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Server not found'
      });
    }
    
    const status = await mcpMonitor.checkServer(serverId, config);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get performance metrics
router.get('/metrics', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const serverId = req.query.server;
    
    const metrics = mcpMonitor.getPerformanceMetrics(serverId || null);
    
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

// Get health history
router.get('/history', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const serverId = req.query.server;
    const period = req.query.period || '1h';
    
    const history = mcpMonitor.getHealthHistory(serverId || null, period);
    
    res.json({
      success: true,
      data: history,
      count: history.length,
      period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get uptime statistics
router.get('/uptime', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const serverId = req.query.server;
    const period = req.query.period || '24h';
    
    if (!serverId) {
      return res.status(400).json({
        success: false,
        error: 'server query parameter is required'
      });
    }
    
    const uptime = mcpMonitor.calculateUptime(serverId, period);
    
    if (!uptime) {
      return res.status(404).json({
        success: false,
        error: 'No uptime data available'
      });
    }
    
    res.json({
      success: true,
      data: uptime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get response time trends
router.get('/trends', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const serverId = req.query.server;
    const period = req.query.period || '1h';
    
    if (!serverId) {
      return res.status(400).json({
        success: false,
        error: 'server query parameter is required'
      });
    }
    
    const trends = mcpMonitor.getResponseTimeTrends(serverId, period);
    
    res.json({
      success: true,
      data: trends,
      count: trends.length,
      period
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Detect anomalies
router.get('/anomalies', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const serverId = req.query.server;
    
    if (!serverId) {
      // Get anomalies for all servers
      const allAnomalies = {};
      for (const [id] of mcpMonitor.metrics.entries()) {
        const anomaly = mcpMonitor.detectAnomalies(id);
        if (anomaly.has_anomaly) {
          allAnomalies[id] = anomaly;
        }
      }
      
      return res.json({
        success: true,
        data: allAnomalies,
        count: Object.keys(allAnomalies).length
      });
    }
    
    const anomaly = mcpMonitor.detectAnomalies(serverId);
    
    res.json({
      success: true,
      data: anomaly
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
    const { mcpMonitor } = req.app.locals;
    const alerts = mcpMonitor.getAlerts();
    
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

// Reset metrics
router.post('/metrics/reset', (req, res) => {
  try {
    const { mcpMonitor } = req.app.locals;
    const serverId = req.body.server;
    
    mcpMonitor.resetMetrics(serverId || null);
    
    res.json({
      success: true,
      message: serverId ? `Metrics reset for ${serverId}` : 'All metrics reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Dashboard API health check
router.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;

// Made with Bob
