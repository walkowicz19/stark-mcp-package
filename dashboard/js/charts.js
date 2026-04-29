// Chart.js configurations and utilities for Sytra MCP Dashboard

let tokenUsageChart = null;
let modelUsageChart = null;
let performanceChart = null;

// Initialize charts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeCharts();
});

function initializeCharts() {
  // Token Usage Chart
  const tokenCanvas = document.getElementById('tokenUsageChart');
  if (tokenCanvas) {
    const ctx = tokenCanvas.getContext('2d');
    tokenUsageChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Total Tokens',
          data: [],
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#e5e7eb'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#e5e7eb',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: '#9ca3af'
            }
          },
          y: {
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: '#9ca3af'
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  // Model Usage Chart
  const modelCanvas = document.getElementById('modelUsageChart');
  if (modelCanvas) {
    const ctx = modelCanvas.getContext('2d');
    modelUsageChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Tokens Used',
          data: [],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderColor: [
            'rgb(99, 102, 241)',
            'rgb(168, 85, 247)',
            'rgb(236, 72, 153)',
            'rgb(251, 146, 60)',
            'rgb(34, 197, 94)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#e5e7eb',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Tokens: ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: '#9ca3af'
            }
          },
          y: {
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: '#9ca3af',
              callback: function(value) {
                return value.toLocaleString();
              }
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  // Performance Chart
  const perfCanvas = document.getElementById('performanceChart');
  if (perfCanvas) {
    const ctx = perfCanvas.getContext('2d');
    performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#e5e7eb'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#e5e7eb',
            bodyColor: '#e5e7eb',
            borderColor: '#374151',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: '#9ca3af'
            }
          },
          y: {
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: '#9ca3af',
              callback: function(value) {
                return value + 'ms';
              }
            },
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Update token usage chart
function updateTokenCharts(stats) {
  if (!stats) return;

  // Update token usage over time chart
  if (tokenUsageChart && stats.timeline) {
    const timeline = stats.timeline;
    tokenUsageChart.data.labels = timeline.map(t => formatChartTime(t.timestamp));
    tokenUsageChart.data.datasets[0].data = timeline.map(t => t.total_tokens);
    tokenUsageChart.update();
  }

  // Update model usage chart
  if (modelUsageChart && stats.by_model) {
    const models = stats.by_model;
    modelUsageChart.data.labels = models.map(m => m.model);
    modelUsageChart.data.datasets[0].data = models.map(m => m.total_tokens);
    modelUsageChart.update();
  }

  // Update cost projection
  updateCostProjection(stats);
}

// Update cost projection display
function updateCostProjection(stats) {
  const projectionEl = document.getElementById('costProjection');
  if (!projectionEl || !stats.summary) return;

  const dailyCost = stats.summary.total_cost || 0;
  const monthlyCost = dailyCost * 30;
  const yearlyCost = dailyCost * 365;

  projectionEl.innerHTML = `
    <div class="projection-grid">
      <div class="projection-item">
        <div class="projection-label">Daily</div>
        <div class="projection-value">$${dailyCost.toFixed(2)}</div>
      </div>
      <div class="projection-item">
        <div class="projection-label">Monthly (Est.)</div>
        <div class="projection-value">$${monthlyCost.toFixed(2)}</div>
      </div>
      <div class="projection-item">
        <div class="projection-label">Yearly (Est.)</div>
        <div class="projection-value">$${yearlyCost.toFixed(2)}</div>
      </div>
    </div>
    <div class="projection-note">
      <i class="bi bi-info-circle"></i>
      Projections based on current usage patterns
    </div>
  `;
}

// Update performance chart
function updatePerformanceChart(healthData) {
  if (!performanceChart || !healthData) return;

  const servers = healthData.servers || [];
  const colors = [
    'rgb(99, 102, 241)',
    'rgb(168, 85, 247)',
    'rgb(236, 72, 153)',
    'rgb(251, 146, 60)',
    'rgb(34, 197, 94)',
    'rgb(59, 130, 246)',
    'rgb(139, 92, 246)',
    'rgb(244, 63, 94)',
    'rgb(249, 115, 22)'
  ];

  // Get historical data for each server
  const datasets = servers.map((server, index) => ({
    label: server.name,
    data: server.history ? server.history.map(h => h.response_time) : [server.response_time],
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
    tension: 0.4,
    fill: false
  }));

  // Use timestamps from first server's history or current time
  const labels = servers[0]?.history 
    ? servers[0].history.map(h => formatChartTime(h.timestamp))
    : [formatChartTime(new Date().toISOString())];

  performanceChart.data.labels = labels;
  performanceChart.data.datasets = datasets;
  performanceChart.update();
}

// Format timestamp for chart labels
function formatChartTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Handle token period selection change
const tokenPeriodSelect = document.getElementById('tokenPeriodSelect');
if (tokenPeriodSelect) {
  tokenPeriodSelect.addEventListener('change', async (e) => {
    const period = e.target.value;
    try {
      const stats = await api.getTokenStats(period);
      updateTokenCharts(stats);
    } catch (error) {
      console.error('Error updating token charts:', error);
    }
  });
}

// Export functions for use in other modules
window.updateTokenCharts = updateTokenCharts;
window.updatePerformanceChart = updatePerformanceChart;

// Made with Bob