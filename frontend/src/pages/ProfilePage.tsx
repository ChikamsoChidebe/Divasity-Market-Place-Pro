import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X,
  Camera,
  Shield,
  Bell,
  CreditCard,
  Key,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    linkedin: '',
    twitter: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    projectUpdates: true,
    investmentAlerts: true,
    marketingEmails: false,
    smsNotifications: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || ''
      });
    }
  }, [user]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // In a real app, this would make an API call
    toast.success('Notification preferences updated');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'investor': return 'bg-orange-100 text-orange-800';
      case 'user': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security settings</p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Profile Summary */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Camera className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role || 'user')}`}>
                  {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                </span>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              className="card p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                      <p className="text-gray-600">Update your personal information and bio</p>
                    </div>
                    <button
                      onClick={() => isEditing ? handleProfileSave() : setIsEditing(true)}
                      disabled={isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          <span>Edit Profile</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={!isEditing}
                            className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                            disabled={!isEditing}
                            className="input-field pl-10 disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder="City, Country"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        className="input-field h-24 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Twitter
                        </label>
                        <input
                          type="text"
                          value={profileData.twitter}
                          onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                          disabled={!isEditing}
                          className="input-field disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            // Reset form data
                            if (user) {
                              setProfileData({
                                firstName: user.firstName || '',
                                lastName: user.lastName || '',
                                email: user.email || '',
                                phone: user.phone || '',
                                location: user.location || '',
                                bio: user.bio || '',
                                website: user.website || '',
                                linkedin: user.linkedin || '',
                                twitter: user.twitter || ''
                              });
                            }
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleProfileSave}
                          disabled={isLoading}
                          className="btn-primary"
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h2>
                    <p className="text-gray-600">Manage your password and security preferences</p>
                  </div>

                  <div className="space-y-6">
                    {/* Password Section */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">Password</h3>
                          <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordForm(!showPasswordForm)}
                          className="btn-secondary flex items-center space-x-2"
                        >
                          <Key className="w-4 h-4" />
                          <span>Change Password</span>
                        </button>
                      </div>

                      {showPasswordForm && (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="input-field pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="input-field pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="input-field pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => {
                                setShowPasswordForm(false);
                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              }}
                              className="btn-secondary"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handlePasswordChange}
                              disabled={isLoading}
                              className="btn-primary"
                            >
                              {isLoading ? 'Changing...' : 'Change Password'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="btn-secondary">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    {/* Login Sessions */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">Active Sessions</h3>
                          <p className="text-sm text-gray-600">Manage your active login sessions</p>
                        </div>
                        <button className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
                          Sign Out All Devices
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Current Session</p>
                            <p className="text-sm text-gray-600">Chrome on Windows • New York, NY</p>
                          </div>
                          <span className="text-sm text-orange-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Preferences</h2>
                    <p className="text-gray-600">Choose how you want to be notified about updates</p>
                  </div>

                  <div className="space-y-6">
                    {Object.entries({
                      emailUpdates: 'Email Updates',
                      projectUpdates: 'Project Updates',
                      investmentAlerts: 'Investment Alerts',
                      marketingEmails: 'Marketing Emails',
                      smsNotifications: 'SMS Notifications'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between py-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{label}</h3>
                          <p className="text-sm text-gray-600">
                            {key === 'emailUpdates' && 'Receive important account and security updates'}
                            {key === 'projectUpdates' && 'Get notified about project milestones and updates'}
                            {key === 'investmentAlerts' && 'Alerts about investment opportunities and performance'}
                            {key === 'marketingEmails' && 'Promotional emails and platform news'}
                            {key === 'smsNotifications' && 'Text message notifications for urgent updates'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[key as keyof typeof notifications]}
                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}


            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
