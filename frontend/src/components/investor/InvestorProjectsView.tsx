import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign,
  Heart,
  Eye,
  Grid,
  List
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

export default function InvestorProjectsView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const categories = [
    { id: 'all', name: 'All Projects', count: projects.length },
    { id: 'technology', name: 'Technology', count: projects.filter(p => p.category === 'Technology').length },
    { id: 'healthcare', name: 'Healthcare', count: projects.filter(p => p.category === 'Healthcare').length },
    { id: 'sustainability', name: 'Sustainability', count: projects.filter(p => p.category === 'Sustainability').length },
    { id: 'education', name: 'Education', count: projects.filter(p => p.category === 'Education').length },
    { id: 'finance', name: 'Finance', count: projects.filter(p => p.category === 'Finance').length }
  ];

  const sortOptions = [
    { id: 'trending', name: 'Trending' },
    { id: 'newest', name: 'Newest' },
    { id: 'ending-soon', name: 'Ending Soon' },
    { id: 'most-funded', name: 'Most Funded' },
    { id: 'highest-roi', name: 'Highest ROI' }
  ];

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = (project.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (project.tags || []).some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || 
                             (project.category || '').toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'ending-soon':
          return a.daysLeft - b.daysLeft;
        case 'most-funded':
          return b.currentAmount - a.currentAmount;
        case 'highest-roi':
          return b.expectedROI - a.expectedROI;
        default:
          return b.backers - a.backers;
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
      return;
    }
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Investment Opportunities
        </h1>
        <p className="text-gray-600">
          Discover and invest in innovative projects
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-gray-600">
              {filteredProjects.length} projects
            </span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
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
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
        }>
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 ${
                viewMode === 'list' ? 'flex items-center space-x-6 p-6' : 'p-6'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              {/* Project Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'aspect-video'} bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg ${viewMode === 'grid' ? 'mb-4' : ''} overflow-hidden`}>
                {project.images && project.images.length > 0 && project.images[0] ? (
                  <img 
                    src={project.images[0]} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white/80 text-sm font-medium">{project.category}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => handleFavorite(project.id)}
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favorites.includes(project.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-600'
                    }`} 
                  />
                </button>

                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(project.riskLevel)}`}>
                    {(project.riskLevel || 'medium').toUpperCase()} RISK
                  </span>
                </div>

                <div className="absolute bottom-2 left-2">
                  <span className="bg-white/90 text-gray-900 px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{project.daysLeft || 0} days left</span>
                  </span>
                </div>
              </div>

              {/* Project Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-orange-600 font-medium">
                    {project.category}
                  </span>
                  <div className="flex items-center space-x-1 text-orange-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-sm font-medium">{project.expectedROI}% ROI</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.shortDescription}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((project.currentAmount / project.goalAmount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getProgressColor((project.currentAmount / project.goalAmount) * 100)
                      }`}
                      style={{ width: `${Math.min((project.currentAmount / project.goalAmount) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">₦{(project.currentAmount || 0).toLocaleString()}</span>
                    <span>raised</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{project.backers || 0}</span>
                    <span>backers</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/investor/projects/${project.id}`)}
                    className="flex-1 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  
                  <button
                    onClick={() => handleInvest(project.id)}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Invest Now</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
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
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
