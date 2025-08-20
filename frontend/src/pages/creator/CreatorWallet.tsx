import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemedWalletBalance from '../../components/wallet/ThemedWalletBalance';

const CreatorWallet = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/creator/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600">Manage your funds and transactions</p>
        </div>
      </div>

      {/* Wallet Balance Component */}
      <ThemedWalletBalance theme="purple" />

      {/* Additional Wallet Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Secure payments powered by Flutterwave</p>
            <div className="flex justify-center space-x-4 text-sm text-gray-600">
              <span>• Cards</span>
              <span>• Bank Transfer</span>
              <span>• USSD</span>
              <span>• Mobile Money</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Secure Payments</span>
              <span className="text-sm text-green-600 font-medium">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transaction Alerts</span>
              <span className="text-sm text-green-600 font-medium">✓ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Encryption</span>
              <span className="text-sm text-green-600 font-medium">✓ 256-bit SSL</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatorWallet;
