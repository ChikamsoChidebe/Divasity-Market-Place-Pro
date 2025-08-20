import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data storage paths
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const INVESTMENTS_FILE = path.join(DATA_DIR, 'investments.json');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const OTPS_FILE = path.join(DATA_DIR, 'otps.json');

// Ensure data directory exists
try {
  await fs.mkdir(DATA_DIR, { recursive: true });
} catch (error) {
  logger.error('Failed to create data directory:', error);
}

// Initialize data files if they don't exist
const initializeDataFiles = async () => {
  const files = [
    { path: USERS_FILE, data: [] },
    { path: PROJECTS_FILE, data: [] },
    { path: INVESTMENTS_FILE, data: [] },
    { path: NEWS_FILE, data: [] },
    { path: OTPS_FILE, data: [] },
  ];

  for (const file of files) {
    try {
      await fs.access(file.path);
    } catch {
      await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
      logger.info(`Initialized ${path.basename(file.path)}`);
    }
  }
};

// Initialize files
await initializeDataFiles();

// Generic data store class
class DataStore {
  constructor(filePath) {
    // Validate and normalize the file path to prevent path traversal
    const normalizedPath = path.normalize(filePath);
    const resolvedPath = path.resolve(normalizedPath);
    const dataDir = path.resolve(DATA_DIR);
    
    // Ensure the file path is within the data directory
    if (!resolvedPath.startsWith(dataDir)) {
      throw new Error('Invalid file path: Path traversal detected');
    }
    
    this.filePath = resolvedPath;
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error reading ${this.filePath}:`, error);
      return [];
    }
  }

  async write(data) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      logger.error(`Error writing ${this.filePath}:`, error);
      return false;
    }
  }

  async findAll() {
    return await this.read();
  }

  async findById(id) {
    const data = await this.read();
    return data.find(item => item.id === id);
  }

  async findOne(query) {
    const data = await this.read();
    return data.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async findMany(query) {
    const data = await this.read();
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  async create(itemData) {
    const data = await this.read();
    const newItem = {
      id: uuidv4(),
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.push(newItem);
    const success = await this.write(data);
    return success ? newItem : null;
  }

  async update(id, updateData) {
    const data = await this.read();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    data[index] = {
      ...data[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    const success = await this.write(data);
    return success ? data[index] : null;
  }

  async delete(id) {
    const data = await this.read();
    const filteredData = data.filter(item => item.id !== id);
    
    if (filteredData.length === data.length) return false;
    
    return await this.write(filteredData);
  }

  async count(query = {}) {
    const data = await this.read();
    if (Object.keys(query).length === 0) return data.length;
    
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    }).length;
  }
}

// Export data store instances
export const usersStore = new DataStore(USERS_FILE);
export const projectsStore = new DataStore(PROJECTS_FILE);
export const investmentsStore = new DataStore(INVESTMENTS_FILE);
export const newsStore = new DataStore(NEWS_FILE);
export const otpsStore = new DataStore(OTPS_FILE);

// Utility functions
export const generateId = () => uuidv4();

export const getCurrentTimestamp = () => new Date().toISOString();

// Clean up expired OTPs periodically
setInterval(async () => {
  try {
    const otps = await otpsStore.findAll();
    const now = new Date();
    const validOtps = otps.filter(otp => {
      const expiryTime = new Date(otp.expiresAt);
      return expiryTime > now;
    });
    
    if (validOtps.length !== otps.length) {
      await otpsStore.write(validOtps);
      logger.info(`Cleaned up ${otps.length - validOtps.length} expired OTPs`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired OTPs:', error);
  }
}, 60000); // Run every minute

export default {
  usersStore,
  projectsStore,
  investmentsStore,
  newsStore,
  otpsStore,
  generateId,
  getCurrentTimestamp,
};