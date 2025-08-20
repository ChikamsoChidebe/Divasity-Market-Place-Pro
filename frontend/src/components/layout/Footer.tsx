import { MessageCircle, Share2, Globe, Heart } from 'lucide-react';
import divasityLogo from '../../assets/divasityIcon.png';

export default function Footer() {
  return (
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
            &copy; {new Date().getFullYear()} Divasity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
