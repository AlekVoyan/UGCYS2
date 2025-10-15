import React, { useState, useEffect } from 'react';
import './ContactPage.css';
import { motion } from 'framer-motion';
import { useCursor } from '../context/CursorContext';
import { AnimatedText } from '../components/AnimatedText';

interface ContactPageProps {
  setActivePage: (page: string) => void;
  siteSingletonAssets: { [key: string]: string; };
}

const getImageUrl = (src: string) => {
    if (!src || src.startsWith('data:image') || src.startsWith('/assets/')) {
        return src;
    }
    // Assume it's a blob key
    return `/.netlify/functions/get-blob?key=${src}`;
};

export const ContactPage: React.FC<ContactPageProps> = ({ setActivePage, siteSingletonAssets }) => {
  const { setIsHovering } = useCursor();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    message: '',
  });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'error'>('idle');

  useEffect(() => {
    const preselectedService = sessionStorage.getItem('selectedService');
    if (preselectedService) {
      setFormData(prev => ({ ...prev, service: preselectedService }));
      sessionStorage.removeItem('selectedService');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const encode = (data: { [key: string]: string }) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('submitting');
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ "form-name": "contact", ...formData })
    })
    .then(() => {
        setActivePage('success');
    })
    .catch(error => {
        console.error("Form submission error:", error);
        setSubmissionStatus('error');
        // Optionally reset status after a few seconds
        setTimeout(() => setSubmissionStatus('idle'), 3000);
    });
  };

  const getButtonText = () => {
    if (submissionStatus === 'submitting') return 'Sending...';
    if (submissionStatus === 'error') return 'Error, Try Again';
    return 'Send Message';
  };

  return (
    <div className="contact-page container">
       <div className="page-header">
        <div className="page-title-bg">CONTACT</div>
        <AnimatedText text="Let's Connect" el="h1" />
        <p>Have a project in mind? Fill out the form, and we'll be in touch to schedule your strategy call.</p>
      </div>

      <motion.div 
        className="contact-content"
        initial={{opacity: 0}}
        whileInView={{opacity: 1}}
        viewport={{once: true, amount: 0.3}}
        transition={{duration: 0.8}}
      >
        <div className="contact-visual">
          <img src={getImageUrl(siteSingletonAssets.contactVisualImage)} alt="A creative and professional visual for the contact section" />
        </div>
        <form 
          name="contact"
          className="contact-form" 
          onSubmit={handleSubmit}
          data-netlify="true"
          data-netlify-honeypot="bot-field"
        >
          <input type="hidden" name="form-name" value="contact" />
          <p className="hidden">
            <label>Don’t fill this out if you’re human: <input name="bot-field" /></label>
          </p>
          <div className="form-group" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Name" />
          </div>
          <div className="form-group" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email" />
          </div>
          <div className="form-group full-width" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <select 
              id="service" 
              name="service" 
              required
              value={formData.service}
              onChange={handleChange}
            >
                <option value="">Select a service of interest...</option>
                <option value="ugc-starter-pack">Package: UGC Starter Pack</option>
                <option value="content-growth-pack">Package: Content Growth Pack</option>
                <option value="monthly-retainer">Package: Monthly Retainer</option>
                <option value="single-ugc-video">A La Carte: Single UGC Video</option>
                <option value="product-photography">A La Carte: Product Photography</option>
                <option value="unboxing-video">A La Carte: Unboxing Video</option>
                <option value="acting-for-commercials">A La Carte: Acting for Commercials</option>
                <option value="other">Other / Not Sure</option>
            </select>
          </div>
          <div className="form-group full-width" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} required placeholder="Tell us about your project"></textarea>
          </div>
          <button 
            type="submit" 
            className={`button full-width ${submissionStatus === 'error' ? 'error' : ''}`} 
            onMouseEnter={() => setIsHovering(true)} 
            onMouseLeave={() => setIsHovering(false)}
            disabled={submissionStatus === 'submitting'}
          >
            {getButtonText()}
          </button>
        </form>
      </motion.div>
    </div>
  );
};