import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { apiService } from '../../services/api';
import type { Project } from '../../types';
import { 
  normalizeProjects, 
  parseMonetaryValue, 
  calculateFundingPercentage,
  getStatusColorClasses,
  formatCurrency,
  type RawApiProject 
} from '../../utils/projectUtils';

const MyProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchUserProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/projects');
      
      let rawProjects: RawApiProject[] = [];
      if (response?.error) {
        rawProjects = [];
      } else if (Array.isArray(response)) {
        rawProjects = response;
      } else if (response?.data && Array.isArray(response.data)) {
        rawProjects = response.data;
      }
      
      const normalizedProjects = normalizeProjects(rawProjects);
      const userProjects = normalizedProjects.filter(project => project.userId === user?.id);
      setProjects(userProjects);
    } catch (error) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserProjects();
    }
  }, [user?.id]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track your crowdfunding campaigns</p>
        </div>
        <button
          onClick={() => navigate('/creator/projects/create')}
          className="mt-4 lg:mt-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="funded">Funded</option>
          </select>
          
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first project to get started'}
          </p>
          <button
            onClick={() => navigate('/creator/projects/create')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredProjects.map((project, index) => {
            const fundingPercentage = calculateFundingPercentage(
              project.totalMoneyInvested,
              project.expectedRaiseAmount
            );
            const investedAmount = parseMonetaryValue(project.totalMoneyInvested);
            const targetAmount = parseMonetaryValue(project.expectedRaiseAmount);
            const statusColor = getStatusColorClasses(project.status);

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                }`}
                onClick={() => navigate(`/projects/${project.id}`, { state: { from: '/creator/my-projects' } })}
              >
                {viewMode === 'grid' ? (
                  <div>
                    <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg mb-4 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-2xl font-bold text-purple-600">
                          {project.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${statusColor}`}>
                        {project.status}
                      </span>
                      <span className="text-sm text-gray-500">{project.category}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{fundingPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {formatCurrency(investedAmount)} raised
                        </span>
                        <span className="text-gray-600">
                          {formatCurrency(targetAmount)} goal
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-xl font-bold text-purple-600">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColor}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">{project.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{project.category}</span>
                        <span>{formatCurrency(investedAmount)} / {formatCurrency(targetAmount)}</span>
                        <span>{fundingPercentage}% funded</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-600">{fundingPercentage}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProjects;