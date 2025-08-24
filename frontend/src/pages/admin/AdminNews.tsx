import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Calendar, Tag } from 'lucide-react';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminNews() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newsData, setNewsData] = useState({
    Newstitle: '',
    Newscontent: '',
    Newsimage: '',
    links: '',
    categories: [] as string[]
  });

  const availableCategories = [
    'Technology', 'Finance', 'Healthcare', 'Education', 
    'Sustainability', 'Innovation', 'Investment', 'Startup'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsData.Newstitle || !newsData.Newscontent) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.createNews({
        ...newsData,
        Newsimage: newsData.Newsimage || 'https://via.placeholder.com/600x400?text=News+Image',
        categories: newsData.categories.length > 0 ? newsData.categories : ['General']
      });

      if (!response.error) {
        toast.success('News article created successfully!');
        setNewsData({
          Newstitle: '',
          Newscontent: '',
          Newsimage: '',
          links: '',
          categories: []
        });
        setShowCreateForm(false);
      } else {
        toast.error(response.message || 'Failed to create news article');
      }
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error('Failed to create news article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setNewsData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
          <p className="text-gray-600">Create and manage news articles</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create News</span>
        </button>
      </div>

      {/* Create News Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create News Article</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newsData.Newstitle}
                onChange={(e) => setNewsData(prev => ({ ...prev, Newstitle: e.target.value }))}
                className="input-field"
                placeholder="Enter news title"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={newsData.Newscontent}
                onChange={(e) => setNewsData(prev => ({ ...prev, Newscontent: e.target.value }))}
                className="input-field h-32"
                placeholder="Enter news content"
                required
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={newsData.Newsimage}
                onChange={(e) => setNewsData(prev => ({ ...prev, Newsimage: e.target.value }))}
                className="input-field"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Links
              </label>
              <input
                type="url"
                value={newsData.links}
                onChange={(e) => setNewsData(prev => ({ ...prev, links: e.target.value }))}
                className="input-field"
                placeholder="https://example.com/related-link"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      newsData.categories.includes(category)
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Article</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* News List Placeholder */}
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">News Articles</h3>
        <p className="text-gray-600 mb-4">
          Created news articles will appear here. You can view, edit, and manage them.
        </p>
      </div>
    </div>
  );
}