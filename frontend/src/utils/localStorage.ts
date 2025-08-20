// Session storage utilities for form data persistence and backup
export class SessionStorageService {
  private static readonly FORM_DATA_KEY = 'divasity_registration_form';
  private static readonly BACKUP_USERS_KEY = 'divasity_backup_users';

  // Save form data for persistence across page refreshes
  static saveFormData(formData: any): void {
    try {
      sessionStorage.setItem(this.FORM_DATA_KEY, JSON.stringify(formData));
    } catch (error) {
      console.warn('Failed to save form data to sessionStorage:', error);
    }
  }

  // Retrieve saved form data
  static getFormData(): any {
    try {
      const data = sessionStorage.getItem(this.FORM_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to retrieve form data from sessionStorage:', error);
      return null;
    }
  }

  // Clear saved form data
  static clearFormData(): void {
    try {
      sessionStorage.removeItem(this.FORM_DATA_KEY);
    } catch (error) {
      console.warn('Failed to clear form data from sessionStorage:', error);
    }
  }

  // Backup user data locally (fallback when backend is unavailable)
  static backupUserData(userData: any): void {
    try {
      const existingUsers = this.getBackupUsers();
      const userId = Date.now().toString();
      const userWithId = {
        ...userData,
        id: userId,
        createdAt: new Date().toISOString(),
        isBackup: true
      };
      
      existingUsers[userId] = userWithId;
      sessionStorage.setItem(this.BACKUP_USERS_KEY, JSON.stringify(existingUsers));
    } catch (error) {
      console.warn('Failed to backup user data:', error);
    }
  }

  // Get backup users
  static getBackupUsers(): any {
    try {
      const data = sessionStorage.getItem(this.BACKUP_USERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn('Failed to retrieve backup users:', error);
      return {};
    }
  }

  // Check if email exists in backup
  static emailExistsInBackup(email: string): boolean {
    try {
      const users = this.getBackupUsers();
      return Object.values(users).some((user: any) => user.email === email);
    } catch (error) {
      return false;
    }
  }

  // Check if username exists in backup
  static usernameExistsInBackup(username: string): boolean {
    try {
      const users = this.getBackupUsers();
      return Object.values(users).some((user: any) => user.userName === username);
    } catch (error) {
      return false;
    }
  }
}

// Keep LocalStorageService for backward compatibility
export const LocalStorageService = SessionStorageService;
