import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemedWalletBalance from '../../components/wallet/ThemedWalletBalance';

const InvestorWallet = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/investor/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Wallet</h1>
          <p className="text-gray-600">Fund your wallet to invest in projects</p>
        </div>
      </div>

      {/* Wallet Balance Component */}
      <ThemedWalletBalance theme="orange" />

      {/* Investment Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Investment Ready</h3>
              <p className="text-gray-600">Fund your wallet to start investing</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Available for Investment</span>
              <span className="text-lg font-bold text-green-600">₦0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Invested</span>
              <span className="text-lg font-medium text-blue-600">₦0</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Returns</h3>
              <p className="text-gray-600">Track your investment returns</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Returns</span>
              <span className="text-lg font-bold text-green-600">₦0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expected Returns</span>
              <span className="text-lg font-medium text-orange-600">₦0</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Investment Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How Investment Works</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <div className="font-medium mb-1">1. Fund Wallet</div>
            <div>Add money to your wallet using Flutterwave</div>
          </div>
          <div>
            <div className="font-medium mb-1">2. Browse Projects</div>
            <div>Find projects that match your investment goals</div>
          </div>
          <div>
            <div className="font-medium mb-1">3. Invest & Earn</div>
            <div>Invest in projects and earn returns</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InvestorWallet;
