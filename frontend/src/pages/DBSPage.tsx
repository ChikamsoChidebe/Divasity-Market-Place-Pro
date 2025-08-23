import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Shield, 
  Lightbulb,
  Award,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Share2,
  Globe
} from 'lucide-react';
import Header from '../components/layout/Header';
import divasityLogo from '../assets/divasityIcon.png';

const DBSPage: React.FC = () => {
  const navigate = useNavigate();
  const services = [
    {
      icon: Target,
      title: 'Business Strategy',
      description: 'Comprehensive business planning and strategic guidance for startups and growing companies.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Growth Acceleration',
      description: 'Proven methodologies to scale your business and increase market penetration.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Users,
      title: 'Mentorship Program',
      description: 'Connect with experienced entrepreneurs and industry experts for personalized guidance.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Identify and mitigate business risks with our comprehensive assessment tools.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Lightbulb,
      title: 'Innovation Support',
      description: 'Transform your innovative ideas into viable business solutions with expert support.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Award,
      title: 'Success Tracking',
      description: 'Monitor your progress with detailed analytics and performance metrics.',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-orange-100 px-4 py-2 rounded-full mb-6">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Divasity Business Support</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Comprehensive Business{' '}
              <span className="bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                Support Services
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Accelerate your business growth with our comprehensive support ecosystem. 
              From strategy development to execution, we're here to help you succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-purple-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/contact')}
                className="bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 hover:shadow-xl hover:border-purple-300 transform hover:scale-105 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Learn More</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Support Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive business support designed to help you navigate challenges and achieve sustainable growth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                className="text-center group hover:shadow-2xl bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-purple-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Accelerate Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join hundreds of successful businesses that have transformed their operations with our support services.
            </p>
            
            <motion.button
              onClick={() => navigate('/contact')}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Contact Our Team</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
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
};

export default DBSPage;