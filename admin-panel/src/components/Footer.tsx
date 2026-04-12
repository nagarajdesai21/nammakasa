import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-karnataka-secondary text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">About Nammakasa</h3>
            <p className="text-gray-300 text-sm">
              A comprehensive waste management tracking system for efficient collection and accountability
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/visual-mapping" className="text-gray-300 hover:text-white transition-colors">
                  Visual Mapping
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-karnataka-accent mt-1 flex-shrink-0" />
                <span className="text-gray-300">+91 080-2293 5001</span>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 text-karnataka-accent mt-1 flex-shrink-0" />
                <span className="text-gray-300">admin@nammakasa.gov.in</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-karnataka-accent mt-1 flex-shrink-0" />
                <span className="text-gray-300">BBMP, Bengaluru</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-800 pt-8">
          {/* Social Links */}
          <div className="flex justify-center space-x-4 mb-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <span>Facebook</span>
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <span>Twitter</span>
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <span>LinkedIn</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-400 text-sm">
            <p className="flex items-center justify-center space-x-2">
              <span>© {currentYear} Nammakasa. Built with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for BBMP</span>
            </p>
            <p className="mt-2 text-xs">Government of Karnataka | Bengaluru Bruhat Mahanagara Palike</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
