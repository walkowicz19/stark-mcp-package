const http = require('http');

class MCPMonitor {
  constructor(database) {
    this.db = database;
    
    // MCP server configurations
    this.servers = {
      'security': { port: 8001, name: 'Security Guardrails' },
      'codegen': { port: 8002, name: 'Code Generation' },
      'memory': { port: 8003, name: 'Memory Management' },
      'intelligence': { port: 8004, name: 'Intelligence Amplification' },
      'tokens': { port: 8005, name: 'Token Optimization' },
      'sdlc': { port: 8006, name: 'SDLC Integration' },
      'legacy': { port: 8007, name: 'Legacy Support' },
      'schema': { port: 8008, name: 'Schema Intelligence' },
      'performance': { port: 8009, name: 'Performance Optimizer' }
    };

    // Server status cache
    this.statusCache = new Map();
    
    // Monitoring interval
    this.monitoringInterval = null;
    this.checkInterval = 30000; // 30 seconds

    // Performance metrics
    this.metrics = new Map();
  }

  // Start monitoring all MCP servers
  startMonitoring() {
    if (this.monitoringInterval) {
      return;
    }

    console.log('Starting MCP server monitoring...');
    
    // Initial check
    this.checkAllServers();

    // Set up periodic checks
    this.monitoringInterval = setInterval(() => {
      this.checkAllServers();
    }, this.checkInterval);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Stopped MCP server monitoring');
    }
  }

  // Check all servers
  async checkAllServers() {
    const checks = Object.entries(this.servers).map(([id, config]) =>
      this.checkServer(id, config)
    );

    const results = await Promise.allSettled(checks);
    
    return results.map((result, index) => {
      const [id] = Object.entries(this.servers)[index];
      return {
        server: id,
        status: result.status === 'fulfilled' ? result.value : 'error',
        error: result.status === 'rejected' ? result.reason : null
      };
    });
  }

  // Check individual server health
  async checkServer(serverId, config) {
    const startTime = Date.now();
    
    try {
      const health = await this.makeHealthCheck(config.port);
      const responseTime = Date.now() - startTime;

      const status = {
        server: serverId,
        name: config.name,
        port: config.port,
        status: health.status || 'healthy',
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        details: health
      };

      // Update cache
      this.statusCache.set(serverId, status);

      // Update metrics
      this.updateMetrics(serverId, responseTime, true);

      // Log to database
      this.db.logHealthMetric({
        service_name: serverId,
        status: 'healthy',
        response_time: responseTime,
        error_rate: this.getErrorRate(serverId),
        throughput: this.getThroughput(serverId),
        metadata: health
      });

      // Log MCP event
      this.db.logMCPEvent(serverId, 'INFO', 'Health check successful', {
        response_time: responseTime
      });

      return status;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      const status = {
        server: serverId,
        name: config.name,
        port: config.port,
        status: 'unhealthy',
        response_time: responseTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };

      // Update cache
      this.statusCache.set(serverId, status);

      // Update metrics
      this.updateMetrics(serverId, responseTime, false);

      // Log to database
      this.db.logHealthMetric({
        service_name: serverId,
        status: 'unhealthy',
        response_time: responseTime,
        error_rate: this.getErrorRate(serverId),
        metadata: { error: error.message }
      });

      // Log MCP event
      this.db.logMCPEvent(serverId, 'ERROR', `Health check failed: ${error.message}`, {
        response_time: responseTime
      });

      return status;
    }
  }

  // Make HTTP health check
  makeHealthCheck(port) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: port,
        path: '/health',
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const health = JSON.parse(data);
            resolve(health);
          } catch (error) {
            resolve({ status: 'healthy', raw: data });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Health check timeout'));
      });

      req.end();
    });
  }

  // Update performance metrics
  updateMetrics(serverId, responseTime, success) {
    if (!this.metrics.has(serverId)) {
      this.metrics.set(serverId, {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        total_response_time: 0,
        response_times: [],
        last_check: null
      });
    }

    const metrics = this.metrics.get(serverId);
    metrics.total_requests++;
    
    if (success) {
      metrics.successful_requests++;
    } else {
      metrics.failed_requests++;
    }

    metrics.total_response_time += responseTime;
    metrics.response_times.push(responseTime);

    // Keep only last 100 response times
    if (metrics.response_times.length > 100) {
      metrics.response_times.shift();
    }

    metrics.last_check = Date.now();
  }

  // Get error rate for a server
  getErrorRate(serverId) {
    const metrics = this.metrics.get(serverId);
    if (!metrics || metrics.total_requests === 0) {
      return 0;
    }

    return metrics.failed_requests / metrics.total_requests;
  }

  // Get throughput (requests per minute)
  getThroughput(serverId) {
    const metrics = this.metrics.get(serverId);
    if (!metrics || !metrics.last_check) {
      return 0;
    }

    const minutesElapsed = (Date.now() - metrics.last_check) / 60000;
    return minutesElapsed > 0 ? metrics.total_requests / minutesElapsed : 0;
  }

  // Get current status of all servers
  getAllStatus() {
    const statuses = [];
    
    for (const [id, config] of Object.entries(this.servers)) {
      const cached = this.statusCache.get(id);
      statuses.push(cached || {
        server: id,
        name: config.name,
        port: config.port,
        status: 'unknown',
        timestamp: new Date().toISOString()
      });
    }

    return statuses;
  }

  // Get status of specific server
  getServerStatus(serverId) {
    return this.statusCache.get(serverId) || null;
  }

  // Get performance metrics
  getPerformanceMetrics(serverId = null) {
    if (serverId) {
      const metrics = this.metrics.get(serverId);
      if (!metrics) return null;

      return {
        server: serverId,
        total_requests: metrics.total_requests,
        success_rate: metrics.total_requests > 0
          ? metrics.successful_requests / metrics.total_requests
          : 0,
        error_rate: this.getErrorRate(serverId),
        avg_response_time: metrics.total_requests > 0
          ? metrics.total_response_time / metrics.total_requests
          : 0,
        recent_response_times: metrics.response_times.slice(-10),
        throughput: this.getThroughput(serverId)
      };
    }

    // Return metrics for all servers
    const allMetrics = {};
    for (const [id] of this.metrics.entries()) {
      allMetrics[id] = this.getPerformanceMetrics(id);
    }
    return allMetrics;
  }

  // Get system health summary
  getHealthSummary() {
    const statuses = this.getAllStatus();
    
    const summary = {
      total_servers: statuses.length,
      healthy: 0,
      unhealthy: 0,
      unknown: 0,
      overall_status: 'healthy',
      timestamp: new Date().toISOString()
    };

    statuses.forEach(status => {
      if (status.status === 'healthy') {
        summary.healthy++;
      } else if (status.status === 'unhealthy') {
        summary.unhealthy++;
      } else {
        summary.unknown++;
      }
    });

    // Determine overall status
    if (summary.unhealthy > 0) {
      summary.overall_status = summary.unhealthy >= summary.total_servers / 2
        ? 'critical'
        : 'degraded';
    } else if (summary.unknown > 0) {
      summary.overall_status = 'unknown';
    }

    return summary;
  }

  // Get logs from database
  getLogs(filters = {}) {
    return this.db.getMCPLogs(filters);
  }

  // Log custom event
  logEvent(serverId, level, message, metadata = {}) {
    this.db.logMCPEvent(serverId, level, message, metadata);
  }

  // Get historical health data
  getHealthHistory(serverId = null, period = '1h') {
    return this.db.getHealthMetrics(serverId, period);
  }

  // Calculate uptime percentage
  calculateUptime(serverId, period = '24h') {
    const history = this.getHealthHistory(serverId, period);
    
    if (history.length === 0) {
      return null;
    }

    const healthyChecks = history.filter(h => h.status === 'healthy').length;
    const totalChecks = history.length;

    return {
      uptime_percentage: (healthyChecks / totalChecks) * 100,
      total_checks: totalChecks,
      healthy_checks: healthyChecks,
      unhealthy_checks: totalChecks - healthyChecks,
      period
    };
  }

  // Get response time trends
  getResponseTimeTrends(serverId, period = '1h') {
    const history = this.getHealthHistory(serverId, period);
    
    return history.map(h => ({
      timestamp: h.timestamp,
      response_time: h.response_time,
      status: h.status
    }));
  }

  // Detect anomalies
  detectAnomalies(serverId) {
    const metrics = this.metrics.get(serverId);
    if (!metrics || metrics.response_times.length < 10) {
      return { has_anomaly: false };
    }

    // Calculate average and standard deviation
    const times = metrics.response_times;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    // Check recent response times for anomalies (> 2 standard deviations)
    const recentTimes = times.slice(-5);
    const anomalies = recentTimes.filter(time => Math.abs(time - avg) > 2 * stdDev);

    return {
      has_anomaly: anomalies.length > 0,
      anomaly_count: anomalies.length,
      avg_response_time: avg,
      std_deviation: stdDev,
      anomalous_times: anomalies
    };
  }

  // Get alerts
  getAlerts() {
    const alerts = [];
    const summary = this.getHealthSummary();

    // Critical: Multiple servers down
    if (summary.unhealthy >= 3) {
      alerts.push({
        level: 'critical',
        type: 'multiple_servers_down',
        message: `${summary.unhealthy} servers are unhealthy`,
        timestamp: Date.now()
      });
    }

    // Warning: Any server down
    if (summary.unhealthy > 0) {
      const unhealthyServers = this.getAllStatus()
        .filter(s => s.status === 'unhealthy')
        .map(s => s.name);
      
      alerts.push({
        level: 'warning',
        type: 'server_down',
        message: `Servers down: ${unhealthyServers.join(', ')}`,
        timestamp: Date.now()
      });
    }

    // Check for performance anomalies
    for (const [serverId] of this.metrics.entries()) {
      const anomaly = this.detectAnomalies(serverId);
      if (anomaly.has_anomaly) {
        alerts.push({
          level: 'warning',
          type: 'performance_anomaly',
          message: `Performance anomaly detected in ${serverId}`,
          details: anomaly,
          timestamp: Date.now()
        });
      }
    }

    return alerts;
  }

  // Reset metrics
  resetMetrics(serverId = null) {
    if (serverId) {
      this.metrics.delete(serverId);
    } else {
      this.metrics.clear();
    }
  }
}

module.exports = MCPMonitor;

// Made with Bob
