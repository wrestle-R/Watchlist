import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clapperboard } from 'lucide-react';
import { auth } from '../firebase.config';

// Simple utility function for classNames
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const Navbar = ({ user }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Movies", link: "/movies" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    auth.signOut();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Initial full-width navbar */}
      {!scrolled && (
        <motion.nav
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 bg-black bg-opacity-80 backdrop-blur-sm border-b border-gray-800"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Logo/Name */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="flex items-center gap-2"
              >
                <Clapperboard size={24} className="text-red-600" />
                <Link to="/" className="text-xl font-bold text-white tracking-tighter">
                  Watchlist
                </Link>
              </motion.div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-4">
                {navItems.map((item, index) => (
                  <Link key={index} to={item.link}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        "px-4 py-2 rounded-full text-white",
                        isActive(item.link) && "bg-gray-800"
                      )}
                    >
                      {item.name}
                    </motion.button>
                  </Link>
                ))}
                {user ? (
                  <motion.button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-full text-white bg-transparent border border-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Out
                  </motion.button>
                ) : (
                  <Link to="/auth">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-full bg-red-600 text-white"
                    >
                      Sign In
                    </motion.button>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white p-2"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div 
                  className="md:hidden pt-4 pb-2 mt-2 space-y-3"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {navItems.map((item, index) => (
                    <Link to={item.link} key={index} className="block">
                      <motion.div whileHover={{ x: 5 }}>
                        <button className={cn(
                          "block w-full px-4 py-2 rounded-md text-center text-white",
                          isActive(item.link) ? "bg-gray-900" : "hover:bg-gray-900"
                        )}>
                          {item.name}
                        </button>
                      </motion.div>
                    </Link>
                  ))}
                  {user ? (
                    <motion.button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full mt-4 px-4 py-2 rounded-md text-center text-white border border-gray-700"
                      whileHover={{ scale: 1.02 }}
                    >
                      Sign Out
                    </motion.button>
                  ) : (
                    <Link to="/auth" className="block">
                      <motion.div whileHover={{ scale: 1.02 }}>
                        <button className="block w-full mt-4 px-4 py-2 rounded-md text-center text-white bg-red-600 font-medium">
                          Sign In
                        </button>
                      </motion.div>
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      )}

      {/* Centered, rounded navbar that appears on scroll */}
      <AnimatePresence>
        {scrolled && (
          <motion.div 
            className="fixed top-6 left-0 right-0 z-50 flex justify-center"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.nav 
              className="bg-black/90 backdrop-blur-sm shadow-lg rounded-full py-3 px-6 max-w-3xl mx-auto border border-gray-800"
              initial={{ width: "50%" }}
              animate={{ width: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between gap-6">
                {/* Logo */}
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link to="/" className="text-base font-bold text-white tracking-tighter whitespace-nowrap flex items-center">
                    <Clapperboard size={22} strokeWidth={2} className="text-red-600" />
                  </Link>
                </motion.div>

                {/* Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                  {navItems.map((item, index) => (
                    <Link key={index} to={item.link}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium text-white rounded-full",
                          isActive(item.link) ? "bg-gray-800" : "hover:bg-gray-800"
                        )}
                      >
                        {item.name}
                      </motion.button>
                    </Link>
                  ))}
                </div>

                {/* User Menu */}
                <div className="hidden md:block">
                  {user ? (
                    <motion.button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 text-sm font-medium text-white rounded-full hover:bg-gray-800"
                      whileHover={{ scale: 1.05 }}
                    >
                      Sign Out
                    </motion.button>
                  ) : (
                    <Link to="/auth">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-full"
                      >
                        Sign In
                      </motion.button>
                    </Link>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-white"
                >
                  {isMobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Mobile Menu - Scrolled version */}
              <AnimatePresence>
                {isMobileMenuOpen && scrolled && (
                  <motion.div 
                    className="md:hidden absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black border border-gray-800 rounded-lg shadow-lg p-3 w-48"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {navItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.link}
                        className="block"
                      >
                        <button className={cn(
                          "block w-full px-3 py-2 rounded-md text-center text-white text-sm mt-1",
                          isActive(item.link) ? "bg-gray-800" : "hover:bg-gray-800"
                        )}>
                          {item.name}
                        </button>
                      </Link>
                    ))}
                    {user ? (
                      <button
                        onClick={handleSignOut}
                        className="block w-full mt-2 px-3 py-2 rounded-md text-center text-white border border-gray-700 text-sm"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <Link to="/auth" className="block">
                        <button className="block w-full mt-2 px-3 py-2 rounded-md text-center text-white bg-red-600 text-sm font-medium">
                          Sign In
                        </button>
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;