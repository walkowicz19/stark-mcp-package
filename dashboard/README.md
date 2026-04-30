# Sytra MCP Dashboard

A comprehensive, modern web dashboard for managing and monitoring the Sytra MCP (Model Context Protocol) system.

## 🚀 Quick Start

### Option 1: Full Dashboard with Backend (Recommended)

The full dashboard requires the dashboard-api backend server with native dependencies.

**Prerequisites:**
- Node.js 16+ and npm
- Docker Desktop or Docker Engine (recommended when running the full Sytra stack, including backend services)
- Docker Compose / `docker compose` (recommended for starting Sytra backend services alongside the dashboard)
- **C++ Build Tools** (required for native dependencies):
  - **Windows**: Visual Studio Build Tools with "Desktop development with C++"
  - **Linux**: build-essential package (`sudo apt-get install build-essential`)
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)

**Installation:**
```bash
cd dashboard-api
npm install
npm start
```

Then open your browser to `http://localhost:3000`

### Option 2: Static HTML Dashboard (Fallback)

If you encounter native dependency build errors, you can use the static HTML dashboard as a fallback.

**No installation required!** Simply open the HTML file directly in your browser:

**Windows:**
```
file:///C:/Users/YourUsername/path/to/sytra-mcp/dashboard/index.html
```

**Linux/macOS:**
```
file:///home/username/path/to/sytra-mcp/dashboard/index.html
```

Or double-click `dashboard/index.html` in your file explorer.

#### Static Dashboard Limitations

The static dashboard provides basic functionality without backend integration:

✅ **Available Features:**
- View system overview and layout
- Browse UI components
- See dashboard design and structure
- Access documentation

❌ **Not Available (Requires Backend):**
- Real-time monitoring and updates
- Token usage tracking and charts
- Credential management
- Memory graph visualization
- Log streaming
- Security management
- MCP server health monitoring
- WebSocket real-time updates

**When to use static dashboard:**
- Build tools are not available
- Native dependency installation fails
- Quick preview of dashboard UI
- Development/testing without backend

## Features

### 🎨 Design & UI Improvements
- **Art Deco Inspired**: Elegant, professional design with Art Deco typography and styling
- **Light Theme**: Clean, easy-on-the-eyes light color scheme
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations**: Polished transitions and interactions
- **Bootstrap Icons**: Modern, consistent iconography throughout the interface
- **Optimized Header**: Reduced header height for more content space
- **Consistent Cards**: Uniform card styling across all sections

### 📊 Core Functionality

#### 1. System Overview
- Real-time system health monitoring
- Token usage statistics (24h)
- Hallucination detection metrics
- Memory graph statistics
- Active alerts and notifications
- Recent activity feed

#### 2. Model Management
- View and configure AI models
- Model performance metrics
- Temperature, max tokens, and other parameters
- Model switching interface
- Support for GPT-4, Claude 3, and more

#### 3. Token Usage & Cost Tracking
- Real-time token consumption display
- Interactive usage charts (Chart.js)
- Cost estimation and projections
- Usage by model breakdown
- Configurable time periods (1h, 24h, 7d, 30d)
- Usage alerts and limits

#### 4. Hallucination Detection
- Real-time confidence scoring
- Flagged responses tracking
- Historical patterns analysis
- Model-specific statistics
- Confidence level indicators

#### 5. Logs & Activity
- Real-time log streaming
- Multiple log types (MCP servers, commands, hallucinations)
- Log level filtering (INFO, WARN, ERROR)
- Searchable and filterable
- Command execution tracking

#### 6. Credential Management
- Secure encrypted credential storage (AES-256-GCM)
- Visual credential manager
- Password strength indicators
- Credential usage tracking
- Add, edit, and delete credentials
- Secure token generation

#### 7. Memory Graph Visualization
- Interactive D3.js visualization
- Memory nodes and relationships
- Search and filter capabilities
- Zoom and pan controls
- Memory usage statistics
- Access count tracking

#### 8. Security Management ⭐ NEW
- **Admin Password Configuration**: Set and update admin password securely
- **Password Strength Indicator**: Real-time feedback on password strength
- **Password Prompts**: Automatic prompts for dangerous actions
- **Session Management**: "Remember for this session" option (1-hour expiry)
- **Audit Logging**: Complete security event tracking
- **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)

**Important:** Admin passwords are configured exclusively through the dashboard and are **never stored in MCP config files**.

#### 9. MCP Server Health Monitoring
- Real-time health checks for all 9 MCP servers
- Performance metrics (response time, throughput)
- Error rate tracking
- Uptime statistics
- Anomaly detection
- Server status dashboard

## Technology Stack

### Backend (dashboard-api/)
- **Node.js** + **Express.js**: REST API server
- **SQLite** (better-sqlite3): Local database
- **WebSocket** (ws): Real-time updates
- **Crypto**: AES-256-GCM encryption for credentials
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection

### Frontend (dashboard/)
- **Vanilla JavaScript**: No framework dependencies
- **Chart.js**: Token usage and performance charts
- **D3.js**: Memory graph visualization
- **CSS Grid + Flexbox**: Responsive layout
- **Web Animations API**: Smooth transitions
- **Google Fonts**: Art Deco typography (Poiret One, Raleway, Montserrat)

## Installation

### Prerequisites
- Node.js 16+ and npm
- Git
- Docker Desktop or Docker Engine (recommended for the full Sytra environment)
- Docker Compose / `docker compose` (recommended to run Sytra backend services)

### Setup Steps

1. **Clone the repository** (if not already done):
   ```bash
   cd c:/Users/MatheusNeryWalkowicz/Documents/Automation/sytra-mcp
   ```

2. **Install backend dependencies**:
   ```bash
   cd dashboard-api
   npm install
   ```

3. **Configure environment** (optional):
   Create a `.env` file in `dashboard-api/`:
   ```env
   PORT=3000
   HOST=localhost
   MASTER_KEY=your-secure-master-key-here
   CORS_ORIGIN=*
   ```

4. **Start the dashboard API**:
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the dashboard**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Navigation
Use the top navigation bar to switch between sections:
- **Overview**: System-wide statistics and alerts
- **Models**: Manage AI model configurations
- **Tokens**: Track token usage and costs
- **Logs**: View system logs and activity
- **Credentials**: Manage encrypted credentials
- **Memory**: Visualize memory graph
- **Security**: Configure admin password and view audit logs ⭐ NEW
- **Health**: Monitor MCP server health

### WebSocket Connection
The dashboard automatically connects via WebSocket for real-time updates. Connection status is shown in the header:
- 🟢 **Connected**: Receiving real-time updates
- 🔴 **Disconnected**: Attempting to reconnect

### API Endpoints

All API endpoints are available at `http://localhost:3000/api/`:

#### Models
- `GET /api/models` - List all model configurations
- `GET /api/models/:modelName` - Get specific model
- `POST /api/models` - Create/update model configuration
- `GET /api/models/available/list` - List available models

#### Tokens
- `GET /api/tokens/stats` - Get usage statistics
- `GET /api/tokens/timeseries` - Get time series data
- `POST /api/tokens/track` - Track new usage
- `GET /api/tokens/projection` - Get cost projections

#### Logs
- `GET /api/logs/mcp` - Get MCP server logs
- `GET /api/logs/commands` - Get command logs
- `GET /api/logs/hallucinations` - Get hallucination records
- `GET /api/logs/stream` - Stream logs (SSE)

#### Credentials
- `GET /api/credentials` - List all credentials (without values)
- `GET /api/credentials/:name` - Get specific credential (decrypted)
- `POST /api/credentials` - Create/update credential
- `DELETE /api/credentials/:name` - Delete credential
- `POST /api/credentials/validate` - Validate credential strength

#### Memory
- `GET /api/memory/nodes` - Get all memory nodes
- `GET /api/memory/graph` - Get graph data for visualization
- `POST /api/memory/nodes` - Create/update memory node
- `POST /api/memory/relationships` - Create relationship
- `GET /api/memory/search` - Search memory

#### Health
- `GET /api/health` - Get overall system health
- `GET /api/health/servers` - Get all server statuses
- `GET /api/health/metrics` - Get performance metrics
- `GET /api/health/uptime` - Get uptime statistics

## Security

### Admin Password Configuration ⭐ NEW

**Important:** Admin passwords are configured exclusively through the dashboard interface and are **never stored in MCP config files**.

#### Setting Up Admin Password

1. Navigate to the **Security** section in the dashboard
2. Enter a strong password (minimum 8 characters recommended)
3. Confirm the password
4. Click "Set Admin Password"
5. Password is securely hashed using PBKDF2 with 100,000 iterations

#### Password Strength Requirements

- **Minimum**: 8 characters
- **Recommended**: 12+ characters with mix of:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters

#### Password Prompts for Dangerous Actions

The system automatically prompts for admin password when:
- File operations occur outside the workspace directory
- Dangerous commands are executed
- System paths are accessed
- Sensitive files are modified

**Features:**
- Clear description of the action being attempted
- Display of target file/command
- Reason for security prompt
- "Remember for this session" option (1-hour expiry)
- Allow/Deny buttons

### Credential Encryption
- All credentials are encrypted using **AES-256-GCM**
- Master key can be set via environment variable
- Automatic key derivation using PBKDF2
- Secure random IV and salt generation

### API Security
- **Helmet.js**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP (admin endpoints: 5 attempts per 15 minutes)
- **CORS**: Configurable origin restrictions
- **Audit Logging**: All actions logged with timestamps and IP addresses

### Best Practices
1. **Set a strong admin password** through the Security section
2. Set a strong `MASTER_KEY` in production for credential encryption
3. Use HTTPS in production (self-signed cert included)
4. Restrict CORS origins in production
5. Regularly review audit logs in the Security section
6. Keep credentials encrypted at rest
7. Use "Remember for this session" sparingly and only on trusted devices
8. Update admin password periodically

## Development

### Project Structure
```
dashboard/
├── index.html          # Main dashboard page
├── css/
│   ├── main.css       # Core styles (Art Deco theme)
│   ├── components.css # Component-specific styles
│   └── animations.css # Animations and transitions
├── js/
│   ├── app.js         # Main application logic
│   ├── api.js         # API client with WebSocket
│   ├── charts.js      # Chart.js integration
│   ├── memory-viz.js  # D3.js memory visualization
│   ├── logs.js        # Log viewer functionality
│   └── credentials.js # Credential management
└── assets/            # Static assets

dashboard-api/
├── server.js          # Express.js server
├── package.json       # Dependencies
├── routes/            # API route handlers
│   ├── models.js
│   ├── tokens.js
│   ├── logs.js
│   ├── credentials.js
│   ├── memory.js
│   └── health.js
├── services/          # Business logic
│   ├── mcp-monitor.js
│   ├── token-tracker.js
│   ├── hallucination-detector.js
│   └── credential-vault.js
└── db/
    └── sqlite.js      # Database layer
```

### Adding New Features
1. Add backend route in `dashboard-api/routes/`
2. Add service logic in `dashboard-api/services/`
3. Update frontend in `dashboard/js/`
4. Add styles in `dashboard/css/`

## Troubleshooting

### Native Dependency Build Errors

**Problem:** Dashboard API installation fails with errors like:
```
gyp ERR! build error
node-gyp rebuild failed
MSBuild.exe not found
```

**Cause:** The dashboard-api requires native dependencies (better-sqlite3, bcrypt) that need C++ build tools.

**Solutions:**

1. **Install Build Tools:**
   
   **Windows:**
   - Download Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - Run installer and select "Desktop development with C++"
   - Or run: `npm install --global windows-build-tools` (requires admin PowerShell)
   
   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt-get install build-essential
   ```
   
   **Linux (Fedora/RHEL):**
   ```bash
   sudo dnf groupinstall 'Development Tools'
   ```
   
   **macOS:**
   ```bash
   xcode-select --install
   ```

2. **Use Static Dashboard (Fallback):**
   - Open `dashboard/index.html` directly in your browser
   - No backend features, but UI is accessible
   - See "Option 2: Static HTML Dashboard" above

### Dashboard won't load
- Ensure the API server is running on port 3000
- Check browser console for errors
- Verify no other service is using port 3000
- If native dependencies failed, use static HTML dashboard

### WebSocket connection fails
- Check firewall settings
- Ensure WebSocket support in browser
- Verify server is running
- Try static dashboard if backend is unavailable

### MCP servers show as unhealthy
- Ensure all MCP backend services are running (ports 8001-8009)
- Check service logs for errors
- Verify network connectivity

### Database errors
- Check write permissions in `dashboard-api/db/` directory
- Ensure SQLite is properly installed (requires build tools)
- Delete `dashboard.db` to reset (will lose data)
- If SQLite fails to install, use static dashboard

### Dashboard API won't start after installation
- Check if native dependencies installed correctly
- Look for error messages mentioning better-sqlite3 or bcrypt
- Verify build tools are installed
- Try reinstalling: `cd dashboard-api && rm -rf node_modules && npm install`
- Use static dashboard as fallback

## Performance

### Optimization Tips
1. **Database**: Regular VACUUM operations
2. **Logs**: Set retention policies to limit database size
3. **WebSocket**: Limit broadcast frequency for large datasets
4. **Charts**: Use data sampling for large time ranges

### Resource Usage
- **Memory**: ~50-100MB for API server
- **CPU**: Minimal (<5% on modern hardware)
- **Disk**: ~10-50MB for database (grows with usage)
- **Network**: ~1-5KB/s for WebSocket updates

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions:
1. Check existing documentation
2. Review troubleshooting section
3. Check GitHub issues
4. Create new issue with details

## Roadmap

### Planned Features
- [ ] User authentication and multi-user support
- [ ] Custom dashboards and widgets
- [ ] Export data to CSV/JSON
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Dark theme toggle
- [ ] Notification system (email, Slack)
- [ ] Backup and restore functionality

## Credits

Built with ❤️ for the Sytra MCP project.

**Design Inspiration**: Art Deco architecture and typography
**Icons**: Unicode emoji for simplicity and universal support
**Fonts**: Google Fonts (Poiret One, Raleway, Montserrat)