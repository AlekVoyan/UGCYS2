import React from 'react';
import './SuccessPage.css';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useCursor } from '../context/CursorContext';

interface SuccessPageProps {
  setActivePage: (page: string) => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ setActivePage }) => {
  const { setIsHovering } = useCursor();

  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="success-page-container">
      <motion.div
        className="success-card"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle size={64} />
        </motion.div>
        <h1>Thank You!</h1>
        <p>Your message has been sent successfully. I'll get back to you as soon as possible.</p>
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <a href="#" onClick={handleGoHome} className="button button-secondary">
            Back to Homepage
          </a>
        </div>
      </motion.div>
    </div>
  );
};
