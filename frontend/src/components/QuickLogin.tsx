import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const QuickLogin: React.FC = () => {
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email: 'chikamsofavoured@gmail.com',
        password: 'Chikamso@123'
      });

      console.log('Login response:', response.data);
      
      if (response.data && !response.data.error) {
        const { user, token } = response.data.data || response.data;
        login(user, token);
        alert('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data);
      alert('Login failed: ' + (error.response?.data?.errorMessage || error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleQuickLogin}
        disabled={loading}
        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Quick Login'}
      </button>
    </div>
  );
};

export default QuickLogin;
