const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

class SqlJsAdapter {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.initialized = false;
    this.saveInterval = null;
    this.backupInterval = null;
    this.pendingSave = false;
  }

  async init() {
    if (this.initialized) return;
    
    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(this.dbPath)) {
      console.log(`Loading existing database from ${this.dbPath}`);
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      console.log(`Creating new database at ${this.dbPath}`);
      this.db = new SQL.Database();
      // Save immediately after creation
      this.saveSync();
    }
    
    this.initialized = true;
    
    // Auto-save every 5 seconds if there are pending changes
    this.saveInterval = setInterval(() => {
      if (this.pendingSave) {
        this.saveSync();
      }
    }, 5000);
    
    // Create backup every 30 minutes
    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, 30 * 60 * 1000);
    
    console.log('Database initialized with auto-save and backup enabled');
  }

  exec(sql) {
    if (!this.initialized) throw new Error('Database not initialized');
    this.db.run(sql);
    this.pendingSave = true;
    this.saveSync(); // Save immediately for schema changes
  }

  prepare(sql) {
    if (!this.initialized) throw new Error('Database not initialized');
    
    return {
      run: (...params) => {
        this.db.run(sql, params);
        this.pendingSave = true;
        // Save immediately for write operations
        this.saveSync();
        return { changes: this.db.getRowsModified() };
      },
      get: (...params) => {
        const stmt = this.db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all: (...params) => {
        const stmt = this.db.prepare(sql);
        stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      }
    };
  }

  saveSync() {
    if (!this.initialized) return;
    
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      
      // Write to temporary file first
      const tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, buffer);
      
      // Rename to actual file (atomic operation)
      fs.renameSync(tempPath, this.dbPath);
      
      this.pendingSave = false;
    } catch (error) {
      console.error('Error saving database:', error);
      throw error;
    }
  }

  createBackup() {
    if (!this.initialized) return;
    
    try {
      const backupDir = path.join(path.dirname(this.dbPath), 'backups');
      
      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Create backup with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `dashboard-${timestamp}.db`);
      
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(backupPath, buffer);
      
      console.log(`Database backup created: ${backupPath}`);
      
      // Keep only last 10 backups
      this.cleanOldBackups(backupDir, 10);
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  cleanOldBackups(backupDir, keepCount) {
    try {
      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('dashboard-') && f.endsWith('.db'))
        .map(f => ({
          name: f,
          path: path.join(backupDir, f),
          time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);
      
      // Delete old backups
      files.slice(keepCount).forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`Deleted old backup: ${file.name}`);
      });
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  close() {
    if (this.db) {
      // Clear intervals
      if (this.saveInterval) {
        clearInterval(this.saveInterval);
      }
      if (this.backupInterval) {
        clearInterval(this.backupInterval);
      }
      
      // Final save before closing
      this.saveSync();
      
      // Create final backup
      this.createBackup();
      
      this.db.close();
      this.initialized = false;
      console.log('Database closed with final save and backup');
    }
  }
}

module.exports = SqlJsAdapter;

// Made with Bob
