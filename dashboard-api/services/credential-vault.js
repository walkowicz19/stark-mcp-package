const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SYTRA_DIR = path.join(os.homedir(), '.sytra');
const ADMIN_PASSWORD_FILE = path.join(SYTRA_DIR, 'admin.hash');

class CredentialVault {
  constructor(masterKey = null) {
    // Set constants first
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.saltLength = 64;
    this.tagLength = 16;
    this.sessionTokens = new Map(); // Store session tokens in memory
    
    // Use environment variable or generate a master key (after keyLength is set)
    this.masterKey = masterKey || process.env.MASTER_KEY || this.generateMasterKey();
    
    // Ensure .sytra directory exists
    this.ensureSytraDir();
  }

  ensureSytraDir() {
    if (!fs.existsSync(SYTRA_DIR)) {
      fs.mkdirSync(SYTRA_DIR, { recursive: true, mode: 0o700 });
    }
  }

  generateMasterKey() {
    // Generate a random master key (should be stored securely in production)
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  deriveKey(password, salt) {
    // Derive a key from password using PBKDF2
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha512');
  }

  encrypt(plaintext) {
    try {
      // Generate random IV and salt
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);

      // Derive key from master key and salt
      const key = this.deriveKey(this.masterKey, salt);

      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      // Encrypt the plaintext
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Return encrypted data with IV, salt, and tag
      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedData) {
    try {
      const { encrypted, iv, salt, tag } = encryptedData;

      // Convert hex strings back to buffers
      const ivBuffer = Buffer.from(iv, 'hex');
      const saltBuffer = Buffer.from(salt, 'hex');
      const tagBuffer = Buffer.from(tag, 'hex');

      // Derive the same key
      const key = this.deriveKey(this.masterKey, saltBuffer);

      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer);
      decipher.setAuthTag(tagBuffer);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  // Hash a password for authentication
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { salt, hash };
  }

  // Verify a password against a hash
  verifyPassword(password, salt, hash) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  // Generate a secure random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Validate credential strength
  validateCredentialStrength(credential) {
    const strength = {
      score: 0,
      feedback: []
    };

    // Length check
    if (credential.length >= 12) {
      strength.score += 25;
    } else {
      strength.feedback.push('Credential should be at least 12 characters long');
    }

    // Complexity checks
    if (/[a-z]/.test(credential)) strength.score += 15;
    if (/[A-Z]/.test(credential)) strength.score += 15;
    if (/[0-9]/.test(credential)) strength.score += 15;
    if (/[^a-zA-Z0-9]/.test(credential)) strength.score += 20;

    // Additional length bonus
    if (credential.length >= 16) strength.score += 10;

    // Determine strength level
    if (strength.score >= 80) {
      strength.level = 'strong';
    } else if (strength.score >= 60) {
      strength.level = 'medium';
    } else {
      strength.level = 'weak';
      if (strength.feedback.length === 0) {
        strength.feedback.push('Add more complexity (uppercase, numbers, special characters)');
      }
    }

    return strength;
  }

  // Securely wipe sensitive data from memory
  secureWipe(buffer) {
    if (Buffer.isBuffer(buffer)) {
      crypto.randomFillSync(buffer);
    }
  }

  // Admin password management methods
  async setAdminPassword(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const { salt, hash } = this.hashPassword(password);
    const data = JSON.stringify({ salt, hash, timestamp: Date.now() });
    
    fs.writeFileSync(ADMIN_PASSWORD_FILE, data, { mode: 0o600 });
  }

  async verifyAdminPassword(password) {
    if (!this.isPasswordConfigured()) {
      // Check environment variable as fallback
      const envPassword = process.env.SYTRA_ADMIN_PASSWORD;
      if (envPassword) {
        return password === envPassword;
      }
      throw new Error('Admin password not configured');
    }

    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_PASSWORD_FILE, 'utf-8'));
      return this.verifyPassword(password, data.salt, data.hash);
    } catch (error) {
      throw new Error('Failed to verify admin password: ' + error.message);
    }
  }

  isPasswordConfigured() {
    return fs.existsSync(ADMIN_PASSWORD_FILE) || !!process.env.SYTRA_ADMIN_PASSWORD;
  }

  // Session token management
  storeSessionToken(token, context) {
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hour
    this.sessionTokens.set(token, { context, expiry });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
  }

  verifySessionToken(token) {
    const session = this.sessionTokens.get(token);
    if (!session) return false;
    
    if (Date.now() > session.expiry) {
      this.sessionTokens.delete(token);
      return false;
    }
    
    return true;
  }

  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, session] of this.sessionTokens.entries()) {
      if (now > session.expiry) {
        this.sessionTokens.delete(token);
      }
    }
  }
}

module.exports = CredentialVault;

// Made with Bob
