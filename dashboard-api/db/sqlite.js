const SqlJsAdapter = require('./sqlite-adapter');
const path = require('path');
const crypto = require('crypto');

class DashboardDatabase {
  constructor(dbPath = path.join(__dirname, 'dashboard.db')) {
    this.db = new SqlJsAdapter(dbPath);
    this.initPromise = this.initialize();
  }

  async initialize() {
    await this.db.init();
    this.initializeTables();
  }

  async ensureInitialized() {
    await this.initPromise;
  }

  initializeTables() {
    // Token usage tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS token_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        model TEXT NOT NULL,
        prompt_tokens INTEGER NOT NULL,
        completion_tokens INTEGER NOT NULL,
        total_tokens INTEGER NOT NULL,
        cost REAL,
        session_id TEXT,
        tool_name TEXT
      )
    `);

    // Command execution logs
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS command_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        command TEXT NOT NULL,
        tool_name TEXT NOT NULL,
        parameters TEXT,
        status TEXT NOT NULL,
        execution_time INTEGER,
        result TEXT,
        error TEXT
      )
    `);

    // Encrypted credentials storage
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        encrypted_value TEXT NOT NULL,
        iv TEXT NOT NULL,
        service TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME
      )
    `);

    // Memory graph nodes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory_nodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        access_count INTEGER DEFAULT 0
      )
    `);

    // Memory graph relationships
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memory_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_node_id TEXT NOT NULL,
        target_node_id TEXT NOT NULL,
        relationship_type TEXT NOT NULL,
        weight REAL DEFAULT 1.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_node_id) REFERENCES memory_nodes(node_id),
        FOREIGN KEY (target_node_id) REFERENCES memory_nodes(node_id)
      )
    `);

    // MCP server logs
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS mcp_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        server_name TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata TEXT
      )
    `);

    // Hallucination detection records
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS hallucination_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        model TEXT NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        confidence_score REAL NOT NULL,
        is_flagged BOOLEAN DEFAULT 0,
        verification_result TEXT
      )
    `);

    // Model configurations
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS model_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT UNIQUE NOT NULL,
        temperature REAL DEFAULT 0.7,
        max_tokens INTEGER DEFAULT 2000,
        top_p REAL DEFAULT 1.0,
        frequency_penalty REAL DEFAULT 0.0,
        presence_penalty REAL DEFAULT 0.0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // System health metrics
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        service_name TEXT NOT NULL,
        status TEXT NOT NULL,
        response_time INTEGER,
        error_rate REAL,
        throughput INTEGER,
        metadata TEXT
      )
    `);

    // Audit logs
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action TEXT NOT NULL,
        user TEXT,
        resource TEXT,
        details TEXT,
        ip_address TEXT
      )
    `);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_token_usage_timestamp ON token_usage(timestamp);
      CREATE INDEX IF NOT EXISTS idx_token_usage_model ON token_usage(model);
      CREATE INDEX IF NOT EXISTS idx_command_logs_timestamp ON command_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_mcp_logs_timestamp ON mcp_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_mcp_logs_server ON mcp_logs(server_name);
      CREATE INDEX IF NOT EXISTS idx_memory_nodes_type ON memory_nodes(type);
      CREATE INDEX IF NOT EXISTS idx_health_metrics_timestamp ON health_metrics(timestamp);
    `);

    console.log('Database tables initialized successfully');
  }

  // Token usage methods
  logTokenUsage(data) {
    const stmt = this.db.prepare(`
      INSERT INTO token_usage (model, prompt_tokens, completion_tokens, total_tokens, cost, session_id, tool_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.model,
      data.prompt_tokens,
      data.completion_tokens,
      data.total_tokens,
      data.cost || null,
      data.session_id || null,
      data.tool_name || null
    );
  }

  getTokenUsage(filters = {}) {
    let query = 'SELECT * FROM token_usage WHERE 1=1';
    const params = [];

    if (filters.model) {
      query += ' AND model = ?';
      params.push(filters.model);
    }
    if (filters.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND timestamp <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(filters.limit || 100);

    return this.db.prepare(query).all(...params);
  }

  getTokenStats(period = '24h') {
    const timeMap = {
      '1h': '-1 hours',
      '24h': '-24 hours',
      '7d': '-7 days',
      '30d': '-30 days'
    };

    const stmt = this.db.prepare(`
      SELECT 
        model,
        COUNT(*) as request_count,
        SUM(total_tokens) as total_tokens,
        SUM(prompt_tokens) as total_prompt_tokens,
        SUM(completion_tokens) as total_completion_tokens,
        SUM(cost) as total_cost,
        AVG(total_tokens) as avg_tokens_per_request
      FROM token_usage
      WHERE timestamp >= datetime('now', ?)
      GROUP BY model
    `);

    return stmt.all(timeMap[period] || timeMap['24h']);
  }

  // Command log methods
  logCommand(data) {
    const stmt = this.db.prepare(`
      INSERT INTO command_logs (command, tool_name, parameters, status, execution_time, result, error)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.command,
      data.tool_name,
      JSON.stringify(data.parameters || {}),
      data.status,
      data.execution_time || null,
      data.result || null,
      data.error || null
    );
  }

  getCommandLogs(filters = {}) {
    let query = 'SELECT * FROM command_logs WHERE 1=1';
    const params = [];

    if (filters.tool_name) {
      query += ' AND tool_name = ?';
      params.push(filters.tool_name);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(filters.limit || 100);

    return this.db.prepare(query).all(...params);
  }

  // Credential methods (encryption handled by credential-vault service)
  saveCredential(name, encryptedValue, iv, service) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO credentials (name, encrypted_value, iv, service, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(name, encryptedValue, iv, service);
  }

  getCredential(name) {
    const stmt = this.db.prepare('SELECT * FROM credentials WHERE name = ?');
    return stmt.get(name);
  }

  getAllCredentials() {
    const stmt = this.db.prepare('SELECT id, name, service, created_at, updated_at, last_used FROM credentials');
    return stmt.all();
  }

  deleteCredential(name) {
    const stmt = this.db.prepare('DELETE FROM credentials WHERE name = ?');
    return stmt.run(name);
  }

  updateCredentialLastUsed(name) {
    const stmt = this.db.prepare('UPDATE credentials SET last_used = CURRENT_TIMESTAMP WHERE name = ?');
    return stmt.run(name);
  }

  // Memory graph methods
  saveMemoryNode(nodeId, type, content, metadata = {}) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO memory_nodes (node_id, type, content, metadata, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(nodeId, type, content, JSON.stringify(metadata));
  }

  getMemoryNode(nodeId) {
    const stmt = this.db.prepare('SELECT * FROM memory_nodes WHERE node_id = ?');
    return stmt.get(nodeId);
  }

  getAllMemoryNodes() {
    const stmt = this.db.prepare('SELECT * FROM memory_nodes ORDER BY updated_at DESC');
    return stmt.all();
  }

  saveMemoryRelationship(sourceId, targetId, type, weight = 1.0) {
    const stmt = this.db.prepare(`
      INSERT INTO memory_relationships (source_node_id, target_node_id, relationship_type, weight)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(sourceId, targetId, type, weight);
  }

  getMemoryRelationships(nodeId = null) {
    if (nodeId) {
      const stmt = this.db.prepare(`
        SELECT * FROM memory_relationships 
        WHERE source_node_id = ? OR target_node_id = ?
      `);
      return stmt.all(nodeId, nodeId);
    }
    return this.db.prepare('SELECT * FROM memory_relationships').all();
  }

  incrementNodeAccess(nodeId) {
    const stmt = this.db.prepare(`
      UPDATE memory_nodes 
      SET access_count = access_count + 1, updated_at = CURRENT_TIMESTAMP 
      WHERE node_id = ?
    `);
    return stmt.run(nodeId);
  }

  // MCP log methods
  logMCPEvent(serverName, level, message, metadata = {}) {
    const stmt = this.db.prepare(`
      INSERT INTO mcp_logs (server_name, level, message, metadata)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(serverName, level, message, JSON.stringify(metadata));
  }

  getMCPLogs(filters = {}) {
    let query = 'SELECT * FROM mcp_logs WHERE 1=1';
    const params = [];

    if (filters.server_name) {
      query += ' AND server_name = ?';
      params.push(filters.server_name);
    }
    if (filters.level) {
      query += ' AND level = ?';
      params.push(filters.level);
    }
    if (filters.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(filters.limit || 100);

    return this.db.prepare(query).all(...params);
  }

  // Hallucination detection methods
  logHallucination(data) {
    const stmt = this.db.prepare(`
      INSERT INTO hallucination_records (model, prompt, response, confidence_score, is_flagged, verification_result)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.model,
      data.prompt,
      data.response,
      data.confidence_score,
      data.is_flagged ? 1 : 0,
      data.verification_result || null
    );
  }

  getHallucinationRecords(filters = {}) {
    let query = 'SELECT * FROM hallucination_records WHERE 1=1';
    const params = [];

    if (filters.is_flagged !== undefined) {
      query += ' AND is_flagged = ?';
      params.push(filters.is_flagged ? 1 : 0);
    }
    if (filters.model) {
      query += ' AND model = ?';
      params.push(filters.model);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(filters.limit || 100);

    return this.db.prepare(query).all(...params);
  }

  // Model configuration methods
  saveModelConfig(config) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO model_configs 
      (model_name, temperature, max_tokens, top_p, frequency_penalty, presence_penalty, is_active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(
      config.model_name,
      config.temperature,
      config.max_tokens,
      config.top_p,
      config.frequency_penalty,
      config.presence_penalty,
      config.is_active ? 1 : 0
    );
  }

  getModelConfig(modelName) {
    const stmt = this.db.prepare('SELECT * FROM model_configs WHERE model_name = ?');
    return stmt.get(modelName);
  }

  getAllModelConfigs() {
    const stmt = this.db.prepare('SELECT * FROM model_configs ORDER BY model_name');
    return stmt.all();
  }

  // Health metrics methods
  logHealthMetric(data) {
    const stmt = this.db.prepare(`
      INSERT INTO health_metrics (service_name, status, response_time, error_rate, throughput, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.service_name,
      data.status,
      data.response_time || null,
      data.error_rate || null,
      data.throughput || null,
      JSON.stringify(data.metadata || {})
    );
  }

  getHealthMetrics(serviceName = null, period = '1h') {
    const timeMap = {
      '1h': '-1 hours',
      '24h': '-24 hours',
      '7d': '-7 days'
    };

    let query = `
      SELECT * FROM health_metrics 
      WHERE timestamp >= datetime('now', ?)
    `;
    const params = [timeMap[period] || timeMap['1h']];

    if (serviceName) {
      query += ' AND service_name = ?';
      params.push(serviceName);
    }

    query += ' ORDER BY timestamp DESC';

    return this.db.prepare(query).all(...params);
  }

  // Audit log methods
  logAudit(action, user, resource, details, ipAddress) {
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (action, user, resource, details, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(action, user, resource, JSON.stringify(details), ipAddress);
  }

  getAuditLogs(filters = {}) {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }
    if (filters.user) {
      query += ' AND user = ?';
      params.push(filters.user);
    }
    if (filters.startDate) {
      query += ' AND timestamp >= ?';
      params.push(filters.startDate);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(filters.limit || 100);

    return this.db.prepare(query).all(...params);
  }

  // Utility methods
  close() {
    this.db.close();
  }

  vacuum() {
    this.db.exec('VACUUM');
  }
}

module.exports = DashboardDatabase;

// Made with Bob
