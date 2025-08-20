import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, TrendingUp, MessageCircle, Share2, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { dashboardService } from '../services/dashboardService';
import toast from 'react-hot-toast';

interface News {
  Newsid: string;
  UserId: string;
  Newstitle: string;
  Newscontent: string;
  Newsimage: string;
  links: string;
  categories: string[];
  createdAt?: string;
}

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed category filtering as requested
  // const [selectedCategory, setSelectedCategory] = useState('All');
  // const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    fetchNews();
    // fetchCategories(); // Commented out as filters are removed
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const newsData = await dashboardService.getAllNews();
      setNewsArticles(newsData);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  // const fetchCategories = async () => {
  //   try {
  //     const response = await NewsService.getNewsCategories();
  //     if (!response.error && response.data) {
  //       setCategories(['All', ...response.data]);
  //     }
  //   } catch (error) {
  //     console.error('Failed to fetch categories:', error);
  //   }
  // };

  // Removed filtering - show all news articles
  const featuredArticle = newsArticles[0];
  const regularArticles = newsArticles.slice(1);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const extractExcerpt = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Latest News & Updates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest developments, success stories, and insights from the Divasity platform
          </p>
        </motion.div>

        {/* Categories - Removed as requested */}
        {/* <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ?{
                selectedCategory === category
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div> */}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading news...</span>
          </div>
        )}

        {/* Featured Article */}
        {!loading && featuredArticle && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="card overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg overflow-hidden">
                  {featuredArticle.Newsimage && (
                    <img 
                      src={featuredArticle.Newsimage} 
                      alt={featuredArticle.Newstitle}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6 lg:p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {Array.isArray(featuredArticle.categories) ? featuredArticle.categories[0] : 'News'}
                    </span>
                    <span className="text-sm text-gray-500">Featured</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {featuredArticle.Newstitle}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {extractExcerpt(featuredArticle.Newscontent, 200)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Divasity Team</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(featuredArticle.createdAt || new Date().toISOString())}</span>
                        </div>
                      </div>
                    </div>
                    
                    {featuredArticle.links && (
                      <a 
                        href={featuredArticle.links} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary flex items-center space-x-2"
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* News Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article, index) => (
              <motion.div
                key={article.Newsid}
                className="card group hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-6 overflow-hidden">
                  {article.Newsimage && (
                    <img 
                      src={article.Newsimage} 
                      alt={article.Newstitle}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mb-3">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {Array.isArray(article.categories) ? article.categories[0] : 'News'}
                  </span>
                  {Array.isArray(article.categories) && article.categories.length > 1 && (
                    <span className="text-sm text-gray-500">+{article.categories.length - 1} more</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {article.Newstitle}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {extractExcerpt(article.Newscontent)}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Divasity Team</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(article.createdAt || new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {article.links && (
                      <a 
                        href={article.links} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-gray-100"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No News Message */}
        {!loading && newsArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No news articles found.</p>
          </div>
        )}

        {/* Load More */}
        {!loading && newsArticles.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button 
              onClick={fetchNews}
              className="btn-secondary flex items-center space-x-2 mx-auto"
            >
              <span>Refresh Articles</span>
              <TrendingUp className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          className="mt-16 card p-8 text-center bg-gradient-to-r from-purple-50 to-purple-50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Stay in the Loop
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and never miss important updates, success stories, and platform announcements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="input-field flex-1"
            />
            <button className="btn-primary">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
