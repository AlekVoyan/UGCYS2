import React, { useState, useRef } from 'react';
import './Footer.css';
import { useCursor } from '../context/CursorContext';
import { Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

// Official-style TikTok icon as an inline SVG component
const TikTokIcon = () => (
    <svg
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 448 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
    </svg>
);

interface FooterProps {
    setActivePage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  const { setIsHovering } = useCursor();
  const [adminClickCount, setAdminClickCount] = useState(0);
  const clickTimeoutRef = useRef<number | null>(null);
  
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyrightClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
    }

    const newClickCount = adminClickCount + 1;
    setAdminClickCount(newClickCount);

    if (newClickCount >= 5) {
        if (window.netlifyIdentity) {
            if (window.netlifyIdentity.currentUser()) {
                setActivePage('admin');
            } else {
                window.netlifyIdentity.open();
            }
        }
        setAdminClickCount(0); // Reset count immediately
    } else {
        // Set a timeout to reset the count if the user stops clicking
        clickTimeoutRef.current = window.setTimeout(() => {
            setAdminClickCount(0);
        }, 1500);
    }
  };

  const socialLinks = [
    { name: 'Instagram', icon: <Instagram />, url: 'https://www.instagram.com/_l.e.s.y.a.n.a_/' },
    { name: 'TikTok', icon: <TikTokIcon />, url: 'https://www.tiktok.com/@_a.l.e_s.y.a_' },
    { name: 'YouTube', icon: <Youtube />, url: 'https://www.youtube.com/@OneSoulFilms/shorts' }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <a 
            href="#" 
            className="footer-logo" 
            onClick={handleLogoClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            Olesya Stepaniuk
          </a>
          <div 
            className="copyright"
            onClick={handleCopyrightClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            &copy; {new Date().getFullYear()} All Rights Reserved.
          </div>
        </div>
        <nav className="social-links" aria-label="Social media links">
          {socialLinks.map(link => (
            <motion.a 
              key={link.name}
              href={link.url} 
              aria-label={link.name}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {link.icon}
            </motion.a>
          ))}
        </nav>
      </div>
    </footer>
  );
};