const express = require('express');
const router = express.Router();

// Get all logs (combined)
router.get('/', (req, res) => {
  try {
    const { db } = req.app.locals;
    const limit = parseInt(req.query.limit) || 100;
    const level = req.query.level;
    
    const filters = { limit };
    if (level) filters.level = level;
    
    const logs = db.getMCPLogs(filters);
    
    res.json({
      success: true,
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get MCP server logs
router.get('/mcp', (req, res) => {
  try {
    const { db } = req.app.locals;
    const filters = {
      server_name: req.query.server,
      level: req.query.level,
      startDate: req.query.start_date,
      limit: parseInt(req.query.limit) || 100
    };
    
    const logs = db.getMCPLogs(filters);
    
    res.json({
      success: true,
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get command execution logs
router.get('/commands', (req, res) => {
  try {
    const { db } = req.app.locals;
    const filters = {
      tool_name: req.query.tool,
      status: req.query.status,
      startDate: req.query.start_date,
      limit: parseInt(req.query.limit) || 100
    };
    
    const logs = db.getCommandLogs(filters);
    
    res.json({
      success: true,
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Log a command execution
router.post('/commands', (req, res) => {
  try {
    const { db, broadcast } = req.app.locals;
    const data = req.body;
    
    // Validate required fields
    if (!data.command || !data.tool_name || !data.status) {
      return res.status(400).json({
        success: false,
        error: 'command, tool_name, and status are required'
      });
    }
    
    const result = db.logCommand(data);
    
    // Broadcast log event
    broadcast({
      type: 'command_log',
      data: {
        id: result.lastInsertRowid,
        ...data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: {
        id: result.lastInsertRowid
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get hallucination detection logs
router.get('/hallucinations', (req, res) => {
  try {
    const { db } = req.app.locals;
    const filters = {
      is_flagged: req.query.flagged === 'true' ? true : req.query.flagged === 'false' ? false : undefined,
      model: req.query.model,
      limit: parseInt(req.query.limit) || 100
    };
    
    const logs = db.getHallucinationRecords(filters);
    
    res.json({
      success: true,
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analyze response for hallucinations
router.post('/hallucinations/analyze', (req, res) => {
  try {
    const { hallucinationDetector, broadcast } = req.app.locals;
    const data = req.body;
    
    // Validate required fields
    if (!data.model || !data.prompt || !data.response) {
      return res.status(400).json({
        success: false,
        error: 'model, prompt, and response are required'
      });
    }
    
    const analysis = hallucinationDetector.analyzeResponse(data);
    
    // Broadcast if flagged
    if (analysis.is_flagged) {
      broadcast({
        type: 'hallucination_detected',
        data: {
          model: data.model,
          confidence: analysis.confidence,
          issues: analysis.issues
        },
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get hallucination statistics
router.get('/hallucinations/stats', (req, res) => {
  try {
    const { hallucinationDetector } = req.app.locals;
    const period = req.query.period || '24h';
    
    const stats = hallucinationDetector.getStatistics(period);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get audit logs
router.get('/audit', (req, res) => {
  try {
    const { db } = req.app.locals;
    const filters = {
      action: req.query.action,
      user: req.query.user,
      startDate: req.query.start_date,
      limit: parseInt(req.query.limit) || 100
    };
    
    const logs = db.getAuditLogs(filters);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stream logs via Server-Sent Events (SSE)
router.get('/stream', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const type = req.query.type || 'all'; // mcp, commands, hallucinations, all
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
  
  // Set up interval to send updates
  const interval = setInterval(() => {
    try {
      const { db } = req.app.locals;
      let logs = [];
      
      if (type === 'mcp' || type === 'all') {
        const mcpLogs = db.getMCPLogs({ limit: 10 });
        logs = logs.concat(mcpLogs.map(l => ({ ...l, log_type: 'mcp' })));
      }
      
      if (type === 'commands' || type === 'all') {
        const commandLogs = db.getCommandLogs({ limit: 10 });
        logs = logs.concat(commandLogs.map(l => ({ ...l, log_type: 'command' })));
      }
      
      if (type === 'hallucinations' || type === 'all') {
        const hallucinationLogs = db.getHallucinationRecords({ limit: 10 });
        logs = logs.concat(hallucinationLogs.map(l => ({ ...l, log_type: 'hallucination' })));
      }
      
      // Sort by timestamp
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      res.write(`data: ${JSON.stringify({ type: 'logs', data: logs.slice(0, 10), timestamp: new Date().toISOString() })}\n\n`);
    } catch (error) {
      console.error('Error streaming logs:', error);
    }
  }, 2000); // Update every 2 seconds
  
  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

module.exports = router;

// Made with Bob
