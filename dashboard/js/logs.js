// Log Viewer for Sytra MCP Dashboard

let currentLogFilters = {
  type: 'all',
  level: '',
  limit: 100
};

// Initialize log viewer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupLogControls();
});

function setupLogControls() {
  // Log type selector
  const typeSelect = document.getElementById('logTypeSelect');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentLogFilters.type = e.target.value;
      refreshLogs();
    });
  }

  // Log level selector
  const levelSelect = document.getElementById('logLevelSelect');
  if (levelSelect) {
    levelSelect.addEventListener('change', (e) => {
      currentLogFilters.level = e.target.value;
      refreshLogs();
    });
  }

  // Clear logs button
  const clearBtn = document.getElementById('clearLogsBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to clear all logs?')) {
        try {
          await api.clearLogs(currentLogFilters.type);
          refreshLogs();
        } catch (error) {
          console.error('Error clearing logs:', error);
          alert('Failed to clear logs: ' + error.message);
        }
      }
    });
  }
}

async function refreshLogs() {
  try {
    const filters = { ...currentLogFilters };
    if (!filters.level) delete filters.level;

    let logs;
    if (filters.type === 'mcp') {
      logs = await api.getMCPLogs(filters);
    } else if (filters.type === 'commands') {
      logs = await api.getCommandLogs(filters);
    } else if (filters.type === 'hallucinations') {
      logs = await api.getHallucinationLogs(filters);
    } else {
      logs = await api.getLogs(filters);
    }

    displayLogs(logs);
  } catch (error) {
    console.error('Error refreshing logs:', error);
  }
}

function displayLogs(logsData) {
  const viewer = document.getElementById('logViewer');
  if (!viewer) return;

  const logs = logsData.logs || [];

  if (logs.length === 0) {
    viewer.innerHTML = '<div class="no-logs">No logs to display</div>';
    return;
  }

  viewer.innerHTML = logs.map(log => {
    if (currentLogFilters.type === 'commands') {
      return renderCommandLog(log);
    } else if (currentLogFilters.type === 'hallucinations') {
      return renderHallucinationLog(log);
    } else {
      return renderMCPLog(log);
    }
  }).join('');
}

function renderMCPLog(log) {
  const levelClass = getLevelClass(log.level);
  const levelIcon = getLevelIcon(log.level);
  
  return `
    <div class="log-entry log-${levelClass}">
      <div class="log-header">
        <span class="log-level">
          <i class="bi ${levelIcon}"></i>
          ${log.level}
        </span>
        <span class="log-server">${escapeHtml(log.server_name || 'System')}</span>
        <span class="log-time">${formatLogTime(log.timestamp)}</span>
      </div>
      <div class="log-message">${escapeHtml(log.message)}</div>
      ${log.metadata ? `<div class="log-metadata">${formatMetadata(log.metadata)}</div>` : ''}
    </div>
  `;
}

function renderCommandLog(log) {
  const statusClass = log.status === 'success' ? 'success' : 'error';
  
  return `
    <div class="log-entry log-${statusClass}">
      <div class="log-header">
        <span class="log-level">
          <i class="bi ${log.status === 'success' ? 'bi-check-circle' : 'bi-x-circle'}"></i>
          ${log.status.toUpperCase()}
        </span>
        <span class="log-tool">${escapeHtml(log.tool_name)}</span>
        <span class="log-time">${formatLogTime(log.timestamp)}</span>
      </div>
      <div class="log-command">
        <code>${escapeHtml(log.command)}</code>
      </div>
      ${log.parameters ? `
        <div class="log-params">
          <strong>Parameters:</strong>
          <pre>${formatJSON(log.parameters)}</pre>
        </div>
      ` : ''}
      ${log.execution_time ? `
        <div class="log-execution-time">
          Execution time: ${log.execution_time}ms
        </div>
      ` : ''}
      ${log.error ? `
        <div class="log-error">
          <strong>Error:</strong> ${escapeHtml(log.error)}
        </div>
      ` : ''}
    </div>
  `;
}

function renderHallucinationLog(log) {
  const flagged = log.is_flagged;
  const confidence = (log.confidence_score * 100).toFixed(1);
  
  return `
    <div class="log-entry ${flagged ? 'log-warning' : 'log-info'}">
      <div class="log-header">
        <span class="log-level">
          <i class="bi ${flagged ? 'bi-exclamation-triangle' : 'bi-check-circle'}"></i>
          ${flagged ? 'FLAGGED' : 'VERIFIED'}
        </span>
        <span class="log-model">${escapeHtml(log.model)}</span>
        <span class="log-confidence">Confidence: ${confidence}%</span>
        <span class="log-time">${formatLogTime(log.timestamp)}</span>
      </div>
      <div class="log-hallucination-content">
        <div class="log-prompt">
          <strong>Prompt:</strong>
          <div class="log-text">${escapeHtml(truncateText(log.prompt, 200))}</div>
        </div>
        <div class="log-response">
          <strong>Response:</strong>
          <div class="log-text">${escapeHtml(truncateText(log.response, 200))}</div>
        </div>
        ${log.verification_result ? `
          <div class="log-verification">
            <strong>Verification:</strong>
            <div class="log-text">${escapeHtml(log.verification_result)}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getLevelClass(level) {
  const classes = {
    'INFO': 'info',
    'WARN': 'warning',
    'ERROR': 'error',
    'SUCCESS': 'success',
    'DEBUG': 'debug'
  };
  return classes[level] || 'info';
}

function getLevelIcon(level) {
  const icons = {
    'INFO': 'bi-info-circle',
    'WARN': 'bi-exclamation-triangle',
    'ERROR': 'bi-x-circle',
    'SUCCESS': 'bi-check-circle',
    'DEBUG': 'bi-bug'
  };
  return icons[level] || 'bi-circle';
}

function formatLogTime(timestamp) {
  if (!timestamp) return '-';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // If less than 1 minute ago
  if (diff < 60000) {
    return 'Just now';
  }
  
  // If less than 1 hour ago
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // If today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString();
  }
  
  // Otherwise show full date
  return date.toLocaleString();
}

function formatMetadata(metadata) {
  if (typeof metadata === 'string') {
    try {
      metadata = JSON.parse(metadata);
    } catch (e) {
      return escapeHtml(metadata);
    }
  }
  
  if (typeof metadata === 'object') {
    return `<pre>${formatJSON(metadata)}</pre>`;
  }
  
  return escapeHtml(String(metadata));
}

function formatJSON(data) {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return escapeHtml(data);
    }
  }
  
  return escapeHtml(JSON.stringify(data, null, 2));
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export for use in other modules
window.displayLogs = displayLogs;
window.refreshLogs = refreshLogs;

// Made with Bob