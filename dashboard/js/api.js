// API Client for Sytra MCP Dashboard
class DashboardAPI {
  constructor() {
    this.baseURL = window.location.origin;
    this.wsURL = `ws://${window.location.host}`;
    this.ws = null;
    this.wsReconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.eventHandlers = new Map();
  }

  // HTTP Request wrapper
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // WebSocket connection
  connectWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Connecting to WebSocket...');
    this.ws = new WebSocket(this.wsURL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.wsReconnectAttempts = 0;
      this.emit('ws:connected');
      
      // Subscribe to all events
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        events: ['health_update', 'token_update', 'alerts', 'log_update']
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(`ws:${data.type}`, data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('ws:error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('ws:disconnected');
      this.attemptReconnect();
    };
  }

  // Reconnect WebSocket
  attemptReconnect() {
    if (this.wsReconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max WebSocket reconnection attempts reached');
      return;
    }

    this.wsReconnectAttempts++;
    console.log(`Reconnecting WebSocket (attempt ${this.wsReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connectWebSocket();
    }, this.reconnectDelay);
  }

  // Event emitter
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  emit(event, data) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // API Endpoints

  // Health
  async getHealth() {
    return this.get('/api/health');
  }

  async getHealthStatus() {
    return this.get('/api/health/status');
  }

  async getHealthHistory(serverId = null, period = '1h') {
    const params = new URLSearchParams({ period });
    if (serverId) params.append('server', serverId);
    return this.get(`/api/health/history?${params}`);
  }

  // Models
  async getModels() {
    return this.get('/api/models');
  }

  async getActiveModels() {
    return this.get('/api/models/active');
  }

  async addModel(modelData) {
    return this.post('/api/models', modelData);
  }

  async updateModel(modelName, modelData) {
    return this.put(`/api/models/${modelName}`, modelData);
  }

  async deleteModel(modelName) {
    return this.delete(`/api/models/${modelName}`);
  }

  // Tokens
  async getTokenUsage(period = '24h') {
    return this.get(`/api/tokens/usage?period=${period}`);
  }

  async getTokenStats(period = '24h') {
    return this.get(`/api/tokens/stats?period=${period}`);
  }

  async getTokenCostProjection() {
    return this.get('/api/tokens/projection');
  }

  async logTokenUsage(data) {
    return this.post('/api/tokens/log', data);
  }

  // Logs
  async getLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/api/logs?${params}`);
  }

  async getMCPLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/api/logs/mcp?${params}`);
  }

  async getCommandLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/api/logs/commands?${params}`);
  }

  async getHallucinationLogs(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/api/logs/hallucinations?${params}`);
  }

  async clearLogs(type = 'all') {
    return this.delete(`/api/logs?type=${type}`);
  }

  // Credentials
  async getCredentials() {
    return this.get('/api/credentials');
  }

  async addCredential(data) {
    return this.post('/api/credentials', data);
  }

  async deleteCredential(name) {
    return this.delete(`/api/credentials/${name}`);
  }

  async testCredential(name) {
    return this.post(`/api/credentials/${name}/test`, {});
  }

  // Memory
  async getMemoryGraph() {
    return this.get('/api/memory/graph');
  }

  async getMemoryStats() {
    return this.get('/api/memory/stats');
  }

  async searchMemory(query) {
    return this.get(`/api/memory/search?q=${encodeURIComponent(query)}`);
  }

  async addMemoryNode(data) {
    return this.post('/api/memory/nodes', data);
  }

  async addMemoryRelationship(data) {
    return this.post('/api/memory/relationships', data);
  }

  // Admin
  async setAdminPassword(newPassword, currentPassword = null) {
    return this.post('/api/admin/set-password', {
      newPassword,
      currentPassword
    });
  }

  async verifyAdminPassword(password, context = 'general', rememberSession = false) {
    return this.post('/api/admin/verify-password', {
      password,
      context,
      rememberSession
    });
  }

  async getPasswordStatus() {
    return this.get('/api/admin/password-status');
  }

  async getAuditLog(limit = 50) {
    return this.get(`/api/admin/audit-log?limit=${limit}`);
  }
}

// Create global API instance
const api = new DashboardAPI();

// Auto-connect WebSocket when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    api.connectWebSocket();
  });
} else {
  api.connectWebSocket();
}

// Made with Bob