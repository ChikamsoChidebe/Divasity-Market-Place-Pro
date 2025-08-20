import { db } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Create news article
export const createNews = asyncHandler(async (req, res) => {
  const { Newstitle, Newscontent, Newsimage, links, categories } = req.body;
  const UserId = req.user.id;

  const newsData = {
    UserId,
    Newstitle,
    Newscontent,
    Newsimage: Newsimage || '',
    links: links || '',
    categories: Array.isArray(categories) ? categories : [categories],
  };

  const news = db.create('news', newsData);

  logger.info(`News article created: ${Newstitle}`, {
    newsId: news.Newsid || news.id,
    userId: UserId,
    categories,
  });

  // Rename id to Newsid for consistency with API docs
  const response = {
    ...news,
    Newsid: news.id,
  };
  delete response.id;

  res.status(201).json({
    error: false,
    data: response,
  });
});

// Get all news articles
export const getAllNews = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 20, search } = req.query;

  let newsArticles = db.findMany('news');

  // Apply filters
  if (category) {
    newsArticles = newsArticles.filter(article => 
      article.categories.some(cat => 
        cat.toLowerCase().includes(category.toLowerCase())
      )
    );
  }

  if (search) {
    const searchTerm = search.toLowerCase();
    newsArticles = newsArticles.filter(article => 
      article.Newstitle.toLowerCase().includes(searchTerm) ||
      article.Newscontent.toLowerCase().includes(searchTerm)
    );
  }

  // Sort by creation date (newest first)
  newsArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedNews = newsArticles.slice(startIndex, endIndex);

  // Enrich news with author data and rename id to Newsid
  const enrichedNews = paginatedNews.map(article => {
    const author = db.findById('users', article.UserId);
    
    const response = {
      ...article,
      Newsid: article.id,
      author: author ? {
        id: author.id,
        firstName: author.firstName,
        lastName: author.lastName,
        userName: author.userName,
      } : null,
    };
    delete response.id;
    
    return response;
  });

  res.status(200).json({
    error: false,
    message: 'News retrieved successfully',
    data: enrichedNews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: newsArticles.length,
      pages: Math.ceil(newsArticles.length / parseInt(limit)),
    },
  });
});

// Get news article by ID
export const getNewsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = db.findById('news', id);
  if (!article) {
    return res.status(404).json({
      error: true,
      message: 'News article not found',
      errorMessage: 'The specified news article does not exist',
    });
  }

  // Enrich news with author data
  const author = db.findById('users', article.UserId);
  
  const response = {
    ...article,
    Newsid: article.id,
    author: author ? {
      id: author.id,
      firstName: author.firstName,
      lastName: author.lastName,
      userName: author.userName,
      email: author.email,
    } : null,
  };
  delete response.id;

  res.status(200).json({
    error: false,
    message: 'News article retrieved successfully',
    data: response,
  });
});

// Update news article
export const updateNews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Newstitle, Newscontent, Newsimage, links, categories } = req.body;

  const article = db.findById('news', id);
  if (!article) {
    return res.status(404).json({
      error: true,
      message: 'News article not found',
      errorMessage: 'The specified news article does not exist',
    });
  }

  // Check if user is the author or admin
  const isAuthor = article.UserId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({
      error: true,
      message: 'Access denied',
      errorMessage: 'You can only update your own articles or need admin privileges',
    });
  }

  const updateData = {};
  if (Newstitle) updateData.Newstitle = Newstitle;
  if (Newscontent) updateData.Newscontent = Newscontent;
  if (Newsimage !== undefined) updateData.Newsimage = Newsimage;
  if (links !== undefined) updateData.links = links;
  if (categories) updateData.categories = Array.isArray(categories) ? categories : [categories];

  const updatedArticle = db.update('news', id, updateData);

  logger.info(`News article updated: ${updatedArticle.Newstitle}`, {
    newsId: id,
    userId: req.user.id,
    changes: Object.keys(updateData),
  });

  // Rename id to Newsid for consistency
  const response = {
    ...updatedArticle,
    Newsid: updatedArticle.id,
  };
  delete response.id;

  res.status(200).json({
    error: false,
    message: 'News article updated successfully',
    data: response,
  });
});

// Delete news article
export const deleteNews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = db.findById('news', id);
  if (!article) {
    return res.status(404).json({
      error: true,
      message: 'News article not found',
      errorMessage: 'The specified news article does not exist',
    });
  }

  // Check if user is the author or admin
  const isAuthor = article.UserId === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({
      error: true,
      message: 'Access denied',
      errorMessage: 'You can only delete your own articles or need admin privileges',
    });
  }

  const deleted = db.delete('news', id);
  if (!deleted) {
    return res.status(500).json({
      error: true,
      message: 'Failed to delete news article',
      errorMessage: 'An error occurred while deleting the article',
    });
  }

  logger.info(`News article deleted: ${article.Newstitle}`, {
    newsId: id,
    userId: req.user.id,
  });

  res.status(204).send();
});

// Get news by category
export const getNewsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;

  let newsArticles = db.findMany('news').filter(article => 
    article.categories.some(cat => 
      cat.toLowerCase() === category.toLowerCase()
    )
  );

  // Sort by creation date (newest first)
  newsArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedNews = newsArticles.slice(startIndex, endIndex);

  // Enrich news with author data
  const enrichedNews = paginatedNews.map(article => {
    const author = db.findById('users', article.UserId);
    
    const response = {
      ...article,
      Newsid: article.id,
      author: author ? {
        id: author.id,
        firstName: author.firstName,
        lastName: author.lastName,
        userName: author.userName,
      } : null,
    };
    delete response.id;
    
    return response;
  });

  res.status(200).json({
    error: false,
    message: `News articles in category '${category}' retrieved successfully`,
    data: enrichedNews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: newsArticles.length,
      pages: Math.ceil(newsArticles.length / parseInt(limit)),
    },
  });
});

// Get news by user ID
export const getNewsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  let newsArticles = db.findMany('news').filter(article => article.UserId === userId);

  // Sort by creation date (newest first)
  newsArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedNews = newsArticles.slice(startIndex, endIndex);

  // Rename id to Newsid for consistency
  const enrichedNews = paginatedNews.map(article => {
    const response = {
      ...article,
      Newsid: article.id,
    };
    delete response.id;
    return response;
  });

  res.status(200).json({
    error: false,
    message: 'User news articles retrieved successfully',
    data: enrichedNews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: newsArticles.length,
      pages: Math.ceil(newsArticles.length / parseInt(limit)),
    },
  });
});

// Get news categories
export const getNewsCategories = asyncHandler(async (req, res) => {
  const newsArticles = db.findMany('news');
  
  const categoriesSet = new Set();
  newsArticles.forEach(article => {
    article.categories.forEach(category => {
      categoriesSet.add(category);
    });
  });

  const categories = Array.from(categoriesSet).sort();

  res.status(200).json({
    error: false,
    message: 'News categories retrieved successfully',
    data: categories,
  });
});

// Get news statistics (admin only)
export const getNewsStatistics = asyncHandler(async (req, res) => {
  const newsArticles = db.findMany('news');

  const stats = {
    totalArticles: newsArticles.length,
    totalAuthors: new Set(newsArticles.map(article => article.UserId)).size,
    categoriesDistribution: {},
    monthlyPublications: {},
    recentArticles: newsArticles
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(article => {
        const author = db.findById('users', article.UserId);
        return {
          Newsid: article.id,
          Newstitle: article.Newstitle,
          categories: article.categories,
          createdAt: article.createdAt,
          author: author ? {
            firstName: author.firstName,
            lastName: author.lastName,
            userName: author.userName,
          } : null,
        };
      }),
  };

  // Calculate category distribution
  newsArticles.forEach(article => {
    article.categories.forEach(category => {
      stats.categoriesDistribution[category] = 
        (stats.categoriesDistribution[category] || 0) + 1;
    });
  });

  // Calculate monthly publications
  newsArticles.forEach(article => {
    const month = new Date(article.createdAt).toISOString().slice(0, 7); // YYYY-MM
    stats.monthlyPublications[month] = 
      (stats.monthlyPublications[month] || 0) + 1;
  });

  res.status(200).json({
    error: false,
    message: 'News statistics retrieved successfully',
    data: stats,
  });
});