import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, User, Menu, X, Plus } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useStore from '../store/useStore';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const notifications = useStore(state => state.notifications);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const unreadCount = notifications.length;

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TrackIt
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/browse" 
              className={`transition-colors ${location.pathname === '/browse' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Browse Items
            </Link>
            {isAuthenticated && (
              <Link 
                to="/report/new" 
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Report Item</span>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button 
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* BoltPatch: Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button 
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.name || 'User'}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 glass-card border border-white/20 rounded-lg shadow-lg"
                    >
                      <Link
                        to="/me"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/10 rounded-t-lg"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/me/reports"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/10"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Reports
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-white/10 rounded-b-lg"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/auth/register" className="btn-primary">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-white/20 py-4"
          >
            <div className="flex flex-col space-y-4">
              <Link 
                to="/browse" 
                className="text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Items
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/report/new" 
                  className="text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Report Item
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}