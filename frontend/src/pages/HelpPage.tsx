import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Video, 
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Book },
    { id: 'projects', name: 'Projects', icon: Video },
    { id: 'investments', name: 'Investments', icon: MessageCircle },
    { id: 'account', name: 'Account', icon: Mail }
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I create an account on Divasity?',
      answer: 'To create an account, click the "Sign Up" button on the homepage, fill in your details, and verify your email address. You can then choose to be a creator or investor.'
    },
    {
      id: 2,
      category: 'projects',
      question: 'How do I create a project?',
      answer: 'Navigate to your creator dashboard and click "Create Project". Fill in all required details including project name, description, funding goal, and timeline.'
    },
    {
      id: 3,
      category: 'investments',
      question: 'How do I invest in a project?',
      answer: 'Browse projects in the "Explore Projects" section, click on a project you\'re interested in, and click "Invest Now". Make sure you have sufficient balance in your wallet.'
    },
    {
      id: 4,
      category: 'account',
      question: 'How do I add funds to my wallet?',
      answer: 'Go to your wallet section and click "Add Funds". You can add funds using various payment methods including bank transfer and card payments.'
    },
    {
      id: 5,
      category: 'projects',
      question: 'What happens after my project is funded?',
      answer: 'Once your project reaches its funding goal, the funds are released to you according to the milestone schedule you set up during project creation.'
    },
    {
      id: 6,
      category: 'investments',
      question: 'How do I track my investment returns?',
      answer: 'Visit your investor dashboard to see all your investments, their performance, and expected returns. You can also view detailed analytics in the Portfolio section.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and get the help you need
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="card p-6 sticky top-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Contact Support */}
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Need More Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Can't find what you're looking for? Contact our support team.
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:support@divasity.com"
                    className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Mail className="w-4 h-4" />
                    <span>support@divasity.com</span>
                  </a>
                  <a
                    href="tel:+2349051414444"
                    className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Phone className="w-4 h-4" />
                    <span>0905 141 4444</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>

              {filteredFaqs.length > 0 ? (
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      className="card overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-4 border-t border-gray-100"
                        >
                          <p className="text-gray-600 pt-4">{faq.answer}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or browse different categories
                  </p>
                </div>
              )}

              {/* Additional Resources */}
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Book className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">User Guide</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Comprehensive documentation to help you get the most out of Divasity
                  </p>
                  <button className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1">
                    <span>Read Guide</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                <div className="card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Video className="w-6 h-6 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Video Tutorials</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Step-by-step video guides for creating projects and investing
                  </p>
                  <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-1">
                    <span>Watch Videos</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}