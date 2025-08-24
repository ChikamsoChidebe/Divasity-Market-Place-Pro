import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Users, 
  Banknote,
  Heart,
  Eye,
  Star,
  ArrowRight,
  Grid,
  List
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { dashboardService } from '../services/dashboardService';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await dashboardService.getAllProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories from projects
  const uniqueCategories = [...new Set(projects.map(p => p.category).filter(Boolean))];
  
  const categories = [
    { id: 'all', name: 'All Projects', count: projects.length },
    ...uniqueCategories.map(cat => ({
      id: cat.toLowerCase(),
      name: cat,
      count: projects.filter(p => p.category === cat).length
    }))
  ];

  const sortOptions = [
    { id: 'trending', name: 'Trending' },
    { id: 'newest', name: 'Newest' },
    { id: 'ending-soon', name: 'Ending Soon' },
    { id: 'most-funded', name: 'Most Funded' }
    // { id: 'highest-roi', name: 'Highest ROI' } // Removed as requested
  ];

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             (project.category || '').toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'ending-soon':
          const aDaysLeft = dashboardService.calculateDaysRemaining(a.endDate);
          const bDaysLeft = dashboardService.calculateDaysRemaining(b.endDate);
          return aDaysLeft - bDaysLeft;
        case 'most-funded':
          return (parseFloat(b.totalMoneyInvested || '0')) - (parseFloat(a.totalMoneyInvested || '0'));
        default:
          return new Date(b.startDate || '').getTime() - new Date(a.startDate || '').getTime(); // trending by recent
      }
    });

  const handleFavorite = (projectId: string) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleInvest = async (projectId: string) => {
    if (!user) {
      toast.error('Please login to invest');
      navigate('/login');
      return;
    }
    
    // This would open an investment modal in a real app
    navigate(`/projects/${projectId}`);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-orange-500';
    if (percentage >= 75) return 'bg-purple-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center sm:text-left"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Discover Amazing Projects
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Explore innovative projects and invest in the future
            </p>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <motion.div
            className="relative w-full max-w-2xl mx-auto sm:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </motion.div>

          {/* Filters and Controls */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field text-sm w-full sm:w-auto"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field text-sm w-full sm:w-auto"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode and Results */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
              <span className="text-sm text-gray-600 text-center sm:text-left">
                {filteredProjects.length} projects found
              </span>
              
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors touch-manipulation ${
                    viewMode === 'grid' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors touch-manipulation ${
                    viewMode === 'list' 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-4 sm:p-6 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
              : 'space-y-4 sm:space-y-6'
          }>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className={`card group hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6' : 'p-4 sm:p-6'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Project Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-full sm:w-48 h-32' : 'aspect-video'} bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg ${viewMode === 'grid' ? 'mb-4' : 'mb-0'} overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                      <span className="text-2xl font-bold text-purple-600">
                        {project.name?.charAt(0)?.toUpperCase() || 'P'}
                      </span>
                    </div>
                  </div>
                  


                  {/* Risk Badge - Removed as requested */}
                  {/* <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ?{getRiskColor(project.riskLevel)}`}>
                      {(project.riskLevel || 'medium').toUpperCase()} RISK
                    </span>
                  </div> */}

                  {/* Days Left Badge */}
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                    <span className="bg-white/90 text-gray-900 px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{dashboardService.calculateDaysRemaining(project.endDate)} days left</span>
                    </span>
                  </div>
                </div>

                {/* Project Content */}
                <div className="flex-1">
                  {/* Category - ROI removed as requested */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-2">
                    <span className="text-xs sm:text-sm text-primary-600 font-medium">
                      {project.category}
                    </span>
                    {/* <div className="flex items-center space-x-1 text-orange-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs sm:text-sm font-medium">{project.expectedROI}% ROI</span>
                    </div> */}
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {project.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Progress Bar - Calculate from API data */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{dashboardService.formatPercentage(dashboardService.calculateProjectProgress(project))}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getProgressColor(dashboardService.calculateProjectProgress(project))
                        }`}
                        style={{ width: `${Math.min(dashboardService.calculateProjectProgress(project), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats - Using API data */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{dashboardService.formatCurrency(project.totalMoneyInvested || '0')}</span>
                      <span>raised</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{dashboardService.formatCurrency(project.expectedRaiseAmount || '0')}</span>
                      <span>goal</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Tags - Removed as not in API */}
                  {/* <div className="flex flex-wrap gap-1 mb-4">
                    {(project.tags || []).slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {(project.tags || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{(project.tags || []).length - 3} more
                      </span>
                    )}
                  </div> */}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <motion.button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="flex-1 btn-secondary text-xs sm:text-sm flex items-center justify-center space-x-2 py-2 sm:py-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>View Details</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleInvest(project.id)}
                      className="flex-1 btn-primary text-xs sm:text-sm flex items-center justify-center space-x-2 py-2 sm:py-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Banknote className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Invest Now</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProjects.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or browse all projects
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Load More Button */}
        {!isLoading && filteredProjects.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <button className="btn-secondary flex items-center space-x-2 mx-auto">
              <span>Load More Projects</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
