import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* */}
          <div>
            <Link to="/" className="text-lg sm:text-xl font-bold">Cool<span className="text-primary-light">Garmi</span></Link>
            <p className="mt-4 text-sm sm:text-base text-gray-300">
              Your one-stop shop for premium cooling solutions. We provide high-quality air conditioners and fans for homes and offices.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">Products</Link></li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=Air+Conditioner" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">Air Conditioners</Link></li>
              <li><Link to="/products?category=Ceiling+Fan" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">Ceiling Fans</Link></li>
              <li><Link to="/products?category=Tower+Fan" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">Tower Fans</Link></li>
              <li><Link to="/products?category=Table+Fan" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors">Table Fans</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm sm:text-base text-gray-300">
              <li>123 Cooling Street</li>
              <li>Chill City, CA 90210</li>
              <li>Phone: (555) 123-4567</li>
              <li>Email: support@CoolGarmi.com</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs sm:text-sm text-gray-400">© 2025 CoolGarmi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
