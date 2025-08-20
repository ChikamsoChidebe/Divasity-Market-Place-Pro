import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  DollarSign, 
  Users, 
  Clock, 
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Image as ImageIcon,
  MessageCircle,
  Star,
  Shield
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { toast } from 'react-hot-toast';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { balance } = useWalletStore();
  const { currentProject, fetchProject, investInProject, isLoading } = useProjectStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const handleInvest = async () => {
    if (!user) {
      toast.error('Please login to invest');
      navigate('/login');
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await investInProject(id!, amount);
      toast.success('Investment successful!');
      setShowInvestModal(false);
      setInvestmentAmount('');
    } catch (error) {
      toast.error('Investment failed');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentProject?.title,
        text: currentProject?.shortDescription,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-orange-600';
      case 'in-progress': return 'text-purple-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/projects')} className="btn-primary">
            Browse Projects
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = (parseFloat(currentProject.totalMoneyInvested || '0') / parseFloat(currentProject.expectedRaiseAmount || '1')) * 100;
  const tabs = [
    { id: 'overview', name: 'Overview' }
    // Updates, milestones, and comments removed as requested
    // { id: 'updates', name: 'Updates', count: currentProject.updates?.length || 0 },
    // { id: 'milestones', name: 'Milestones', count: currentProject.milestones?.length || 0 },
    // { id: 'comments', name: 'Comments', count: 24 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => {
              const referrer = location.state?.from;
              if (referrer === '/creator/my-projects') {
                navigate('/creator/my-projects');
              } else {
                navigate('/projects');
              }
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center space-x-3">
            {/* Like button removed as requested */}
            {/* <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Heart className={`w-5 h-5 ?{isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
            </button> */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Hero */}
            <motion.div
              className="card p-0 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Project Image */}
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Risk badge removed as requested */}
                      {/* <span className={`px-3 py-1 text-sm font-medium rounded-full ?{getRiskColor(currentProject.riskLevel)}`}>
                        {currentProject.riskLevel.toUpperCase()} RISK
                      </span> */}
                      <span className="bg-white/90 text-gray-900 px-3 py-1 text-sm font-medium rounded-full">
                        {currentProject.category}
                      </span>
                    </div>
                    {/* Video button removed as requested */}
                    {/* <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Play className="w-6 h-6 text-gray-900" />
                    </button> */}
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentProject.name}
                    </h1>
                    <p className="text-gray-600">
                      by <span className="font-medium text-gray-900">{currentProject.creatorName || 'Project Creator'}</span>
                    </p>
                  </div>
                  {/* ROI removed as requested */}
                  {/* <div className="flex items-center space-x-1 text-orange-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-lg font-bold">{currentProject.expectedROI}% ROI</span>
                  </div> */}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">
                  {currentProject.description}
                </p>

                {/* Tags - Removed as not in API */}
                {/* <div className="flex flex-wrap gap-2">
                  {currentProject.tags?.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div> */}
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              className="card p-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                      {tab.count && (
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {currentProject.description}
                      </p>
                    </div>
                    

                  </div>
                )}

                {/* Updates, milestones, and comments tabs removed as requested */}
                {/* {activeTab === 'updates' && (
                  <div className="space-y-6">
                    {currentProject.updates?.length > 0 ? (
                      currentProject.updates.map(update => (
                        <div key={update.id} className="border-l-4 border-primary-500 pl-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{update.title}</h4>
                          <p className="text-sm text-gray-500 mb-2">
                            {new Date(update.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-700">{update.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No updates yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'milestones' && (
                  <div className="space-y-4">
                    {currentProject.milestones?.length > 0 ? (
                      currentProject.milestones.map(milestone => (
                        <div key={milestone.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                          <div className={`p-2 rounded-full ?{
                            milestone.status === 'completed' ? 'bg-orange-100' :
                            milestone.status === 'in-progress' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            {milestone.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-orange-600" />
                            ) : milestone.status === 'in-progress' ? (
                              <Clock className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Target className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                            <p className="text-gray-600 text-sm mb-2">{milestone.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className={`font-medium ?{getStatusColor(milestone.status)}`}>
                                {milestone.status.replace('-', ' ').toUpperCase()}
                              </span>
                              <div className="flex items-center space-x-4 text-gray-500">
                                <span>₦{milestone.amount.toLocaleString()}</span>
                                <span>{new Date(milestone.targetDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No milestones defined</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Comments feature coming soon</p>
                  </div>
                )} */}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Card */}
            <motion.div
              className="card p-6 sticky top-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Funding Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats - Backers removed, currency changed to Naira */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{parseFloat(currentProject.totalMoneyInvested || '0').toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Raised</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{parseFloat(currentProject.expectedRaiseAmount || '0').toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Goal</p>
                </div>
                {/* Backers removed as requested */}
                {/* <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {currentProject.backers}
                  </p>
                  <p className="text-sm text-gray-600">Backers</p>
                </div> */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.max(0, Math.ceil((new Date(currentProject.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </p>
                  <p className="text-sm text-gray-600">Days Left</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {currentProject.status.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>

              {/* Investment Button */}
              <button
                onClick={() => setShowInvestModal(true)}
                className="btn-primary w-full mb-4"
                disabled={currentProject.status !== 'OPEN'}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                Invest Now
              </button>

              {/* Quick Stats - ROI and Risk Level removed as requested */}
              <div className="space-y-3 text-sm">
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Expected ROI</span>
                  <span className="font-medium text-orange-600">{currentProject.expectedROI}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk Level</span>
                  <span className={`font-medium capitalize ?{
                    currentProject.riskLevel === 'low' ? 'text-orange-600' :
                    currentProject.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {currentProject.riskLevel}
                  </span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-purple-600 capitalize">{currentProject.status}</span>
                </div>
              </div>
            </motion.div>

            {/* Creator Info */}
            <motion.div
              className="card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Project Creator</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {currentProject.userId?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentProject.creatorName || 'Project Creator'}</p>
                  <p className="text-sm text-gray-600">Project Creator</p>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Invest in {currentProject.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Available balance: ₦{balance.toLocaleString()}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowInvestModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                className="btn-primary flex-1"
                disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
              >
                Invest
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
