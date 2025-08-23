import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Users, 
  Zap, 
  Star,
  Target,
  Award,
  BarChart3,
  Globe,
  Wallet,
  Rocket,
  DollarSign,
  MessageCircle,
  Share2,
  Heart,
  CheckCircle,
  Eye,
  Lightbulb
} from 'lucide-react';
import Header from '../components/layout/Header';
import divasityLogo from '../assets/divasityIcon.png';

export function LandingPage() {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({
    funded: 0,
    users: 0,
    projects: 0,
    rate: 0
  });

  // Counter animation effect
  useEffect(() => {
    const targets = { funded: 50000000, users: 10000, projects: 500, rate: 98 };
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounters({
        funded: Math.floor(targets.funded * progress),
        users: Math.floor(targets.users * progress),
        projects: Math.floor(targets.projects * progress),
        rate: Math.floor(targets.rate * progress)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: CheckCircle,
      title: 'Guaranteed Funding',
      description: '100% proven approach to fund raising',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect and grow with a supportive community of successful entrepreneurs, investors and supportive users.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Lightbulb,
      title: 'Innovative Solutions',
      description: 'Use our innovative technology tools to guarantee business success and profitable investments.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Eye,
      title: 'Wide Reach',
      description: 'Enjoy visibility from our strong presence and partnerships.',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { value: `₦${(counters.funded / 1000000).toFixed(0)}M+`, label: 'Total Funded', icon: DollarSign, color: 'text-purple-500' },
    { value: `${(counters.users / 1000).toFixed(0)}K+`, label: 'Active Users', icon: Users, color: 'text-orange-600' },
    { value: `${counters.projects}+`, label: 'Successful Projects', icon: Award, color: 'text-purple-500' },
    { value: `${counters.rate}%`, label: 'Success Rate', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const recognitionLogos = [
    { name: 'WTO', logo: '/api/placeholder/120/60' },
    { name: 'ICC', logo: '/api/placeholder/120/60' },
    { name: 'ITC', logo: '/api/placeholder/120/60' },
    { name: 'AWS Activate', logo: '/api/placeholder/120/60' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 overflow-x-hidden">
      <Header />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>



      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/divapic.jpg)', backgroundAttachment: 'fixed' }}
          />
          {/* <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white/70"></div> */}
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >


              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-purple-100 px-4 py-2 rounded-full mb-6">
                <Rocket className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Launch Your Dreams Today</span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Fund | Build | Sell | Scale Your Dreams,{' '}
                <span className="bg-gradient-to-r from-purple-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                  Invest in Tomorrow
                </span>
              </h1>
              
              <p className="text-xl text-white mb-8 leading-relaxed max-w-3xl mx-auto">
                Join the future of funding where innovative ideas meet innovative tools.
              </p>
              
              <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                Build, Fund, Sell, Scale with our AI-Powered and Blockchain-Integrated platform that's already helped fund millions in projects.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <motion.button
                  onClick={() => navigate('/register?role=user')}
                  className="bg-gradient-to-r from-purple-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket className="w-5 h-5" />
                  <span>Start a Project</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  onClick={() => navigate('/register?role=investor')}
                  className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 hover:shadow-xl hover:border-purple-300 transform hover:scale-105 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span>Become an Investor</span>
                </motion.button>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-white font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Why Choose Divasity?</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with human expertise to deliver 
              the best crowdfunding experience for both creators and investors.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center group hover:shadow-2xl bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Internationally Recognized by:
            </h2>
            
            <div className="relative overflow-hidden">
              <motion.div
                className="flex items-center justify-center space-x-12"
                animate={{ x: [0, -100, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[...recognitionLogos, ...recognitionLogos].map((org, index) => (
                  <div key={index} className="flex-shrink-0">
                    <div className="w-32 h-16 bg-white rounded-lg shadow-md flex items-center justify-center border border-gray-200">
                      <span className="text-gray-600 font-semibold text-sm">{org.name}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-4">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">How Divasity Works</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to start your funding journey and turn your dreams into reality
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Project',
                description: 'Share your innovative idea with detailed descriptions, goals, and milestones. Our AI helps optimize your work.',
                icon: <Zap className="w-12 h-12 text-white" />,
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: '02', 
                title: 'Get Discovered',
                description: 'Our AI-powered platform matches your project with interested investors and customers and promotes it to the right audience.',
                icon: <Target className="w-12 h-12 text-white" />,
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: '03',
                title: 'Receive Funding',
                description: 'Secure investments and bring your vision to life with our support, mentorship, and community backing.',
                icon: <Wallet className="w-12 h-12 text-white" />,
                color: 'from-orange-500 to-orange-600'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-gray-900">{step.step}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-purple-300 mx-auto" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Success Stories</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our successful creators and investors who've transformed their dreams into reality
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ola Abayomi',
                role: 'Tech Entrepreneur',
                content: 'Divasity helped me raise ₦150K for my IoT startup in just 30 days. The platform is intuitive and the investor network is incredible. Best decision I ever made!',
                avatar: <Users className="w-12 h-12 text-purple-600" />,
                rating: 5,
                raised: '₦150K'
              },
              {
                name: 'Emeka Henry',
                role: 'Angel Investor', 
                content: 'I\'ve found amazing investment opportunities on Divasity. The due diligence tools and analytics are top-notch. My portfolio has grown 300% this year.',
                avatar: <BarChart3 className="w-12 h-12 text-orange-600" />,
                rating: 5,
                raised: '300% ROI'
              },
              {
                name: 'Frank Odumeje',
                role: 'Social Impact Founder',
                content: 'The community support and mentorship I received through Divasity was invaluable for my sustainable packaging project. We\'re now in 50+ stores!',
                avatar: <Globe className="w-12 h-12 text-purple-600" />,
                rating: 5,
                raised: '50+ Stores'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 border border-purple-100 hover:shadow-2xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">{testimonial.avatar}</div>
                  <div className="flex justify-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold inline-block">
                    {testimonial.raised}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-lg">{testimonial.name}</p>
                  <p className="text-purple-600 font-medium">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-purple-600 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Users className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Join thousands of entrepreneurs and investors</span>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6">
              Divasity: Accelerating Startups for a Sustainable Future
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of entrepreneurs and investors building the future together. 
              Your next big breakthrough is just one click away.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/register?role=user')}
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-5 h-5" />
                <span>Start Your Project</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/register?role=investor')}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Start Investing</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src={divasityLogo} 
                  alt="Divasity" 
                  className="w-10 h-10 rounded-xl object-contain"
                />
                <span className="text-2xl font-bold">Divasity</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                Empowering innovation through smart crowdfunding and investment solutions. 
                Building the future, one project at a time.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:underline">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Webinars</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:underline">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Divasity. All rights reserved. Built for innovators worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
