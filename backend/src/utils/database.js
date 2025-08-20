import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InMemoryDatabase {
  constructor() {
    this.data = {
      users: new Map(),
      projects: new Map(),
      investments: new Map(),
      news: new Map(),
      otps: new Map(),
      wallets: new Map(),
      wallet_transactions: new Map(),
    };
    
    this.dataPath = path.join(__dirname, '../../data');
    this.ensureDataDirectory();
    this.loadData();
    this.initializeAdminUser();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  loadData() {
    try {
      const files = ['users.json', 'projects.json', 'investments.json', 'news.json', 'wallets.json', 'wallet_transactions.json'];
      
      files.forEach(file => {
        const filePath = path.join(this.dataPath, file);
        const collection = file.replace('.json', '');
        
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.data[collection] = new Map(Object.entries(data));
          logger.info(`Loaded ${Object.keys(data).length} ${collection} from storage`);
        }
      });
    } catch (error) {
      logger.error('Error loading data:', error);
    }
  }

  saveData() {
    try {
      Object.keys(this.data).forEach(collection => {
        if (collection === 'otps') return; // Don't persist OTPs
        
        const filePath = path.join(this.dataPath, `${collection}.json`);
        const data = Object.fromEntries(this.data[collection]);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      });
    } catch (error) {
      logger.error('Error saving data:', error);
    }
  }

  initializeAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@divasity.com';
    const existingAdmin = Array.from(this.data.users.values()).find(user => user.email === adminEmail);
    
    if (!existingAdmin) {
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      if (!adminPasswordHash) {
        logger.warn('ADMIN_PASSWORD_HASH not set in environment variables. Admin user not created.');
        return;
      }
      
      const adminUser = {
        id: uuidv4(),
        email: adminEmail,
        userName: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        password: adminPasswordHash,
        telephone: '+1234567890',
        address: 'System Address',
        role: 'admin',
        IsVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      this.data.users.set(adminUser.id, adminUser);
      this.saveData();
      logger.info('Admin user initialized');
    }
  }

  // Generic CRUD operations
  create(collection, data) {
    const id = data.id || uuidv4();
    const timestamp = new Date().toISOString();
    
    const record = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    this.data[collection].set(id, record);
    this.saveData();
    return record;
  }

  findById(collection, id) {
    return this.data[collection].get(id) || null;
  }

  findOne(collection, query) {
    for (const record of this.data[collection].values()) {
      const matches = Object.keys(query).every(key => record[key] === query[key]);
      if (matches) return record;
    }
    return null;
  }

  findMany(collection, query = {}) {
    const results = [];
    for (const record of this.data[collection].values()) {
      const matches = Object.keys(query).every(key => record[key] === query[key]);
      if (matches) results.push(record);
    }
    return results;
  }

  update(collection, id, updates) {
    const record = this.data[collection].get(id);
    if (!record) return null;
    
    const updatedRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.data[collection].set(id, updatedRecord);
    this.saveData();
    return updatedRecord;
  }

  delete(collection, id) {
    const deleted = this.data[collection].delete(id);
    if (deleted) this.saveData();
    return deleted;
  }

  // Specialized methods
  findUserByEmail(email) {
    return this.findOne('users', { email });
  }

  findUserByUsername(userName) {
    return this.findOne('users', { userName });
  }

  findProjectsByUserId(userId) {
    return this.findMany('projects', { userId });
  }

  findInvestmentsByUserId(userId) {
    return this.findMany('investments', { userId });
  }

  findInvestmentsByProjectId(projectId) {
    return this.findMany('investments', { projectId });
  }

  // OTP methods (temporary storage)
  storeOTP(email, otp) {
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_IN) || 10) * 60 * 1000);
    this.data.otps.set(email, { otp, expiresAt });
  }

  verifyOTP(email, otp) {
    const stored = this.data.otps.get(email);
    if (!stored) return false;
    
    if (new Date() > stored.expiresAt) {
      this.data.otps.delete(email);
      return false;
    }
    
    if (stored.otp === otp) {
      this.data.otps.delete(email);
      return true;
    }
    
    return false;
  }

  // Statistics methods
  getProjectStats() {
    const projects = Array.from(this.data.projects.values());
    const investments = Array.from(this.data.investments.values());
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'OPEN').length,
      totalFunding: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      totalInvestors: new Set(investments.map(inv => inv.userId)).size,
    };
  }

  getUserInvestmentStats(userId) {
    const investments = this.findInvestmentsByUserId(userId);
    
    return {
      totalInvestments: investments.length,
      totalInvestedAmount: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      totalReturnAmount: investments.reduce((sum, inv) => sum + parseFloat(inv.returnAmount || 0), 0),
      averageSuccessRate: investments.length > 0 
        ? investments.reduce((sum, inv) => sum + inv.successRate, 0) / investments.length 
        : 0,
    };
  }
}

export const db = new InMemoryDatabase();
export default db;