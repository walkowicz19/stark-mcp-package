const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

// Import services
const DashboardDatabase = require('./db/sqlite');
const CredentialVault = require('./services/credential-vault');
const TokenTracker = require('./services/token-tracker');
const HallucinationDetector = require('./services/hallucination-detector');
const MCPMonitor = require('./services/mcp-monitor');

// Import routes
const modelsRouter = require('./routes/models');
const tokensRouter = require('./routes/tokens');
const logsRouter = require('./routes/logs');
const credentialsRouter = require('./routes/credentials');
const memoryRouter = require('./routes/memory');
const healthRouter = require('./routes/health');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Initialize services (async initialization)
let db, vault, tokenTracker, hallucinationDetector, mcpMonitor;

async function initializeServices() {
  db = new DashboardDatabase();
  await db.ensureInitialized();
  vault = new CredentialVault();
  tokenTracker = new TokenTracker(db);
  hallucinationDetector = new HallucinationDetector(db);
  mcpMonitor = new MCPMonitor(db);
  
  // Store services in app for access in routes (after initialization)
  app.locals.db = db;
  app.locals.vault = vault;
  app.locals.tokenTracker = tokenTracker;
  app.locals.hallucinationDetector = hallucinationDetector;
  app.locals.mcpMonitor = mcpMonitor;
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Log to audit
    db.logAudit(
      `${req.method} ${req.path}`,
      req.headers['x-user'] || 'anonymous',
      req.path,
      { statusCode: res.statusCode, duration },
      req.ip
    );
  });
  
  next();
});

// Serve static files (dashboard frontend)
app.use(express.static(path.join(__dirname, '../dashboard')));

// API Routes
app.use('/api/models', modelsRouter);
app.use('/api/tokens', tokensRouter);
app.use('/api/logs', logsRouter);
app.use('/api/credentials', credentialsRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/health', healthRouter);

// Admin password management endpoints
app.post('/api/admin/set-password', async (req, res) => {
  try {
    const { newPassword, currentPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if password is already set
    const isConfigured = vault.isPasswordConfigured();
    
    if (isConfigured && !currentPassword) {
      return res.status(400).json({ error: 'Current password required to update' });
    }

    // Verify current password if updating
    if (isConfigured && currentPassword) {
      const isValid = await vault.verifyAdminPassword(currentPassword);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid current password' });
      }
    }

    // Set new password
    await vault.setAdminPassword(newPassword);

    // Log the event
    db.logAudit(
      'admin_password_set',
      req.headers['x-user'] || 'admin',
      '/api/admin/set-password',
      { action: isConfigured ? 'updated' : 'created' },
      req.ip
    );

    res.json({ success: true, message: 'Admin password set successfully' });
  } catch (error) {
    console.error('Error setting admin password:', error);
    res.status(500).json({ error: error.message || 'Failed to set password' });
  }
});

app.post('/api/admin/verify-password', async (req, res) => {
  try {
    const { password, context, rememberSession } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const isValid = await vault.verifyAdminPassword(password);

    if (isValid) {
      let sessionToken = null;
      
      if (rememberSession) {
        sessionToken = vault.generateToken();
        // Store session token (in production, use Redis or similar)
        vault.storeSessionToken(sessionToken, context);
      }

      // Log successful authentication
      db.logAudit(
        'admin_auth_success',
        req.headers['x-user'] || 'admin',
        '/api/admin/verify-password',
        { context, rememberSession },
        req.ip
      );

      res.json({ valid: true, sessionToken });
    } else {
      // Log failed authentication
      db.logAudit(
        'admin_auth_failed',
        req.headers['x-user'] || 'admin',
        '/api/admin/verify-password',
        { context },
        req.ip
      );

      res.status(401).json({ valid: false, error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: error.message || 'Failed to verify password' });
  }
});

app.get('/api/admin/password-status', (req, res) => {
  try {
    const configured = vault.isPasswordConfigured();
    res.json({ configured });
  } catch (error) {
    console.error('Error checking password status:', error);
    res.status(500).json({ error: 'Failed to check password status' });
  }
});

app.get('/api/admin/audit-log', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = db.getAuditLogs(limit);
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Sytra MCP Dashboard API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      models: '/api/models',
      tokens: '/api/tokens',
      logs: '/api/logs',
      credentials: '/api/credentials',
      memory: '/api/memory',
      health: '/api/health'
    }
  });
});

// WebSocket connection handling
const wsClients = new Set();

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');
  wsClients.add(ws);

  // Send initial connection message
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to Sytra MCP Dashboard',
    timestamp: new Date().toISOString()
  }));

  // Handle client messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    wsClients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    wsClients.delete(ws);
  });
});

// Handle WebSocket messages
function handleWebSocketMessage(ws, data) {
  switch (data.type) {
    case 'subscribe':
      // Subscribe to specific events
      ws.subscriptions = data.events || [];
      ws.send(JSON.stringify({
        type: 'subscribed',
        events: ws.subscriptions,
        timestamp: new Date().toISOString()
      }));
      break;

    case 'ping':
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${data.type}`,
        timestamp: new Date().toISOString()
      }));
  }
}

// Broadcast to all connected WebSocket clients
function broadcast(event) {
  const message = JSON.stringify(event);
  
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      // Check if client is subscribed to this event type
      if (!client.subscriptions || client.subscriptions.includes(event.type)) {
        client.send(message);
      }
    }
  });
}

// Make broadcast available to routes
app.locals.broadcast = broadcast;

// Periodic broadcasts
setInterval(() => {
  // Broadcast health status
  const healthSummary = mcpMonitor.getHealthSummary();
  broadcast({
    type: 'health_update',
    data: healthSummary,
    timestamp: new Date().toISOString()
  });

  // Broadcast token usage stats
  const tokenStats = tokenTracker.getUsageStats('1h');
  broadcast({
    type: 'token_update',
    data: tokenStats,
    timestamp: new Date().toISOString()
  });

  // Broadcast alerts
  const mcpAlerts = mcpMonitor.getAlerts();
  const tokenAlerts = tokenTracker.getAlerts();
  
  if (mcpAlerts.length > 0 || tokenAlerts.length > 0) {
    broadcast({
      type: 'alerts',
      data: {
        mcp: mcpAlerts,
        tokens: tokenAlerts
      },
      timestamp: new Date().toISOString()
    });
  }
}, 10000); // Every 10 seconds

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error to database
  db.logMCPEvent('dashboard-api', 'ERROR', err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  // If it's an API request, return JSON
  if (req.path.startsWith('/api/')) {
    res.status(404).json({
      error: {
        message: 'Endpoint not found',
        status: 404
      }
    });
  } else {
    // Otherwise, serve the dashboard index.html
    res.sendFile(path.join(__dirname, '../dashboard/index.html'));
  }
});


// Cleanup on shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  
  // Stop monitoring
  mcpMonitor.stopMonitoring();
  
  // Close WebSocket connections
  wsClients.forEach(client => {
    client.close(1000, 'Server shutting down');
  });
  
  // Close database
  db.close();
  
  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server with async initialization
async function startServer() {
  try {
    // Initialize services first
    await initializeServices();
    
    // Start MCP monitoring
    mcpMonitor.startMonitoring();
    
    // Start server
    server.listen(PORT, HOST, () => {
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║                                                            ║');
      console.log('║          Sytra MCP Dashboard API Server                   ║');
      console.log('║                                                            ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`🚀 Server running at http://${HOST}:${PORT}`);
      console.log(`📊 Dashboard: http://${HOST}:${PORT}`);
      console.log(`🔌 API: http://${HOST}:${PORT}/api`);
      console.log(`📡 WebSocket: ws://${HOST}:${PORT}`);
      console.log('');
      console.log('Services initialized:');
      console.log('  ✓ Database (SQLite with sql.js)');
      console.log('  ✓ Credential Vault');
      console.log('  ✓ Token Tracker');
      console.log('  ✓ Hallucination Detector');
      console.log('  ✓ MCP Monitor');
      console.log('');
      console.log('Press Ctrl+C to stop');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, wss };

// Made with Bob
