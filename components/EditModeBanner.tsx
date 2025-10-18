import React from 'react';
import './EditModeBanner.css';
import { motion } from 'framer-motion';

interface EditModeBannerProps {
  onSave: () => void;
  onDiscard: () => void;
  status: 'idle' | 'saving' | 'success' | 'error';
}

export const EditModeBanner: React.FC<EditModeBannerProps> = ({ onSave, onDiscard, status }) => {
  
  const getSaveButtonText = () => {
    switch (status) {
      case 'saving': return 'Publishing...';
      case 'success': return 'Published!';
      case 'error': return 'Error, Retry?';
      default: return 'Publish Changes';
    }
  };

  return (
    <motion.div 
      className="edit-mode-banner"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="banner-content">
        <div className="banner-info">
          <span className="live-indicator"></span>
          <p>
            You are in edit mode. 
            {status !== 'success' && <strong> You have unsaved changes.</strong>}
            {status === 'success' && <strong> Changes are publishing and will be live in a few minutes.</strong>}
          </p>
        </div>
        <div className="banner-actions">
          <button 
            onClick={onDiscard} 
            className="button button-secondary"
            disabled={status === 'saving'}
          >
            Discard
          </button>
          <button 
            onClick={onSave} 
            className={`button ${status === 'success' ? 'success' : ''} ${status === 'error' ? 'error' : ''}`}
            disabled={status === 'saving' || status === 'success'}
          >
            {getSaveButtonText()}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
