import React, { useState, useEffect } from 'react';
import './Header.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from '../context/CursorContext';

interface HeaderProps {
  setActivePage: (page: string) => void;
  activePage: string;
}

const menuVariants = {
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren",
    },
  },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const Header: React.FC<HeaderProps> = ({ setActivePage, activePage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setIsHovering } = useCursor();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Prevent body scroll when menu is open
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    setActivePage(page);
    setIsMenuOpen(false); // Close menu on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { page: 'home', label: 'Home' },
    { page: 'portfolio', label: 'Portfolio' },
    { page: 'about', label: 'About' },
    { page: 'blog', label: 'Blog' },
    { page: 'services', label: 'Services' },
    { page: 'contact', label: 'Contact' },
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="header-container">
        <div 
          className="logo" 
          onClick={(e) => handleNavClick(e, 'home')}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          Olesya Stepaniuk
        </div>
        <nav className="nav-desktop">
          <ul>
            {navLinks.map(link => (
              <li key={link.page}>
                <a 
                  href="#" 
                  className={activePage === link.page ? 'active' : ''} 
                  onClick={(e) => handleNavClick(e, link.page)}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button 
          className="menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          aria-label="Toggle menu" 
          aria-expanded={isMenuOpen}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav 
            className="nav-mobile"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
          >
            <motion.ul>
              {navLinks.map(link => (
                <motion.li key={link.page} variants={linkVariants}>
                  <a 
                    href="#" 
                    className={activePage === link.page ? 'active' : ''} 
                    onClick={(e) => handleNavClick(e, link.page)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
