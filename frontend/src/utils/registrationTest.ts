// Registration functionality test utilities
import { LocalStorageService } from './localStorage';

export class RegistrationTest {
  // Test data storage functionality
  static testDataStorage(): boolean {
    try {
      const testData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userName: 'testuser',
        role: 'user'
      };

      // Test form data persistence
      LocalStorageService.saveFormData(testData);
      const retrievedData = LocalStorageService.getFormData();
      
      if (!retrievedData || retrievedData.email !== testData.email) {
        console.error('Form data persistence test failed');
        return false;
      }

      // Test backup functionality
      LocalStorageService.backupUserData(testData);
      const backupUsers = LocalStorageService.getBackupUsers();
      
      if (!backupUsers || Object.keys(backupUsers).length === 0) {
        console.error('Backup functionality test failed');
        return false;
      }

      // Test duplicate checking
      const emailExists = LocalStorageService.emailExistsInBackup(testData.email);
      const usernameExists = LocalStorageService.usernameExistsInBackup(testData.userName);
      
      if (!emailExists || !usernameExists) {
        console.error('Duplicate checking test failed');
        return false;
      }

      // Cleanup test data
      LocalStorageService.clearFormData();
      
      console.log('✅ All data storage tests passed');
      return true;
    } catch (error) {
      console.error('Data storage test error:', error);
      return false;
    }
  }

  // Test form validation
  static testValidation(): boolean {
    try {
      // Email validation tests
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'test123@test-domain.com'];
      const invalidEmails = ['invalid-email', '@domain.com', 'test@', 'test.domain.com'];
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+?/;
      
      for (const email of validEmails) {
        if (!emailRegex.test(email)) {
          console.error(`Valid email failed validation: ?{email}`);
          return false;
        }
      }
      
      for (const email of invalidEmails) {
        if (emailRegex.test(email)) {
          console.error(`Invalid email passed validation: ?{email}`);
          return false;
        }
      }

      // Phone validation tests
      const validPhones = ['+1234567890', '1234567890', '+44 20 7946 0958', '09039220171'];
      const invalidPhones = ['123', 'abc123', '++1234567890', ''];
      
      const phoneRegex = /^[\+]?[1-9][\d]{0,2}[\s]?[\d]{3,14}?/;
      
      for (const phone of validPhones) {
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
          console.error(`Valid phone failed validation: ?{phone}`);
          return false;
        }
      }
      
      for (const phone of invalidPhones) {
        if (phoneRegex.test(phone.replace(/\s/g, ''))) {
          console.error(`Invalid phone passed validation: ?{phone}`);
          return false;
        }
      }

      console.log('✅ All validation tests passed');
      return true;
    } catch (error) {
      console.error('Validation test error:', error);
      return false;
    }
  }

  // Run all tests
  static runAllTests(): boolean {
    console.log('🧪 Running registration functionality tests...');
    
    const dataStorageTest = this.testDataStorage();
    const validationTest = this.testValidation();
    
    const allTestsPassed = dataStorageTest && validationTest;
    
    if (allTestsPassed) {
      console.log('🎉 All registration tests passed successfully!');
    } else {
      console.error('❌ Some registration tests failed');
    }
    
    return allTestsPassed;
  }
}
