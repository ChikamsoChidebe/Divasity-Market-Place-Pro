import { apiService } from './api';
import { ToastService } from './toastService';

interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
  errorMessage?: string;
}

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

interface NewsForm {
  Newstitle: string;
  Newscontent: string;
  Newsimage?: string;
  links?: string;
  categories: string[];
}

export class NewsService {
  // Get all news articles
  static async getAllNews(): Promise<ApiResponse<News[]>> {
    return apiService.get('/news/getnews');
  }

  // Create news article (admin only)
  static async createNews(newsData: NewsForm): Promise<ApiResponse<News>> {
    try {
      const response = await apiService.post('/news/createNews', newsData);
      if (!response.error) {
        ToastService.success('News article created successfully!');
      } else {
        ToastService.error(response.errorMessage || response.message || 'Failed to create news article');
      }
      return response;
    } catch (error: any) {
      ToastService.error('Failed to create news article. Please try again.');
      throw error;
    }
  }

  // Get news by category
  static async getNewsByCategory(category: string): Promise<ApiResponse<News[]>> {
    const allNewsResponse = await this.getAllNews();
    
    if (allNewsResponse.error || !allNewsResponse.data) {
      return allNewsResponse;
    }

    const filteredNews = allNewsResponse.data.filter(news =>
      news.categories.some(cat => 
        cat.toLowerCase() === category.toLowerCase()
      )
    );

    return {
      error: false,
      message: 'Category news retrieved successfully',
      data: filteredNews
    };
  }

  // Search news articles
  static async searchNews(query: string): Promise<ApiResponse<News[]>> {
    const allNewsResponse = await this.getAllNews();
    
    if (allNewsResponse.error || !allNewsResponse.data) {
      return allNewsResponse;
    }

    const filteredNews = allNewsResponse.data.filter(news =>
      news.Newstitle.toLowerCase().includes(query.toLowerCase()) ||
      news.Newscontent.toLowerCase().includes(query.toLowerCase()) ||
      news.categories.some(cat => 
        cat.toLowerCase().includes(query.toLowerCase())
      )
    );

    return {
      error: false,
      message: 'Search results retrieved successfully',
      data: filteredNews
    };
  }

  // Get latest news
  static async getLatestNews(limit: number = 10): Promise<ApiResponse<News[]>> {
    const allNewsResponse = await this.getAllNews();
    
    if (allNewsResponse.error || !allNewsResponse.data) {
      return allNewsResponse;
    }

    const sortedNews = allNewsResponse.data
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, limit);

    return {
      error: false,
      message: 'Latest news retrieved successfully',
      data: sortedNews
    };
  }

  // Get trending news (most viewed/liked)
  static async getTrendingNews(limit: number = 5): Promise<ApiResponse<News[]>> {
    const allNewsResponse = await this.getAllNews();
    
    if (allNewsResponse.error || !allNewsResponse.data) {
      return allNewsResponse;
    }

    // For now, just return recent news as trending
    // In a real app, this would be based on views/likes
    const trendingNews = allNewsResponse.data
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, limit);

    return {
      error: false,
      message: 'Trending news retrieved successfully',
      data: trendingNews
    };
  }

  // Get news categories
  static async getNewsCategories(): Promise<ApiResponse<string[]>> {
    const allNewsResponse = await this.getAllNews();
    
    if (allNewsResponse.error || !allNewsResponse.data) {
      return allNewsResponse as any;
    }

    const allCategories = allNewsResponse.data.flatMap(news => news.categories);
    const uniqueCategories = [...new Set(allCategories)];

    return {
      error: false,
      message: 'News categories retrieved successfully',
      data: uniqueCategories
    };
  }

  // Format news date
  static formatNewsDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `?{diffDays} days ago`;
    if (diffDays < 30) return `?{Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `?{Math.ceil(diffDays / 30)} months ago`;
    return `?{Math.ceil(diffDays / 365)} years ago`;
  }

  // Extract excerpt from news content
  static extractExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) return content;
    
    const truncated = content.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    return lastSpaceIndex > 0 
      ? truncated.substring(0, lastSpaceIndex) + '...'
      : truncated + '...';
  }
}

export default NewsService;
