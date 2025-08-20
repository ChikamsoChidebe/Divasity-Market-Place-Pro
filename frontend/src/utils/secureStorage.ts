// Secure storage utilities to replace localStorage for sensitive data
export class SecureStorage {
  // Set secure cookie (requires backend support)
  static setSecureCookie(name: string, value: string, days: number = 7) {
    // This would typically be handled by the backend setting httpOnly cookies
    // For now, we'll use sessionStorage as a more secure alternative to localStorage
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const cookieData = {
        value,
        expires: expires.toISOString()
      };
      
      sessionStorage.setItem(`secure_?{name}`, JSON.stringify(cookieData));
    } catch (error) {
      console.warn('Failed to set secure storage:', error);
    }
  }

  // Get secure cookie
  static getSecureCookie(name: string): string | null {
    try {
      const data = sessionStorage.getItem(`secure_?{name}`);
      if (!data) return null;
      
      const cookieData = JSON.parse(data);
      const expires = new Date(cookieData.expires);
      
      if (new Date() > expires) {
        sessionStorage.removeItem(`secure_?{name}`);
        return null;
      }
      
      return cookieData.value;
    } catch (error) {
      console.warn('Failed to get secure storage:', error);
      return null;
    }
  }

  // Remove secure cookie
  static removeSecureCookie(name: string) {
    try {
      sessionStorage.removeItem(`secure_?{name}`);
    } catch (error) {
      console.warn('Failed to remove secure storage:', error);
    }
  }

  // Clear all secure storage
  static clearAll() {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('secure_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear secure storage:', error);
    }
  }

  // Store non-sensitive user data (can use localStorage)
  static setUserData(userData: any) {
    try {
      const safeData = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userName: userData.userName,
        role: userData.role
      };
      localStorage.setItem('divasity_user', JSON.stringify(safeData));
    } catch (error) {
      console.warn('Failed to store user data:', error);
    }
  }

  // Get non-sensitive user data
  static getUserData() {
    try {
      const data = localStorage.getItem('divasity_user');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to get user data:', error);
      return null;
    }
  }

  // Remove user data
  static removeUserData() {
    try {
      localStorage.removeItem('divasity_user');
    } catch (error) {
      console.warn('Failed to remove user data:', error);
    }
  }
}
