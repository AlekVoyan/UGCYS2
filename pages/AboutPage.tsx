import React, { useState } from 'react';
import './AboutPage.css';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { AnimatedText } from '../components/AnimatedText';
import { useCursor } from '../context/CursorContext';
import { Globe, Languages, Calendar, Sparkles, Smile, Waves, Shirt, Dog, ChevronDown } from 'lucide-react';
import { PowerCardData, KeyStat } from '../data/content';


interface AboutPageProps {
  setActivePage: (page: string) => void;
  powerCards: PowerCardData[];
  keyStats: KeyStat[];
  siteSingletonAssets: { [key: string]: string; };
}

const getMediaUrl = (src: string) => {
    if (!src || src.startsWith('data:') || src.startsWith('/')) {
        return src;
    }
    // Assume it's a blob key
    return `/.netlify/functions/get-blob?key=${src}`;
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    },
  },
};

const statIcons: { [key: string]: React.ReactNode } = {
    'Location': <Globe />,
    'Languages': <Languages />,
    'Age': <Calendar />,
    'Primary Niches': <Sparkles />,
    'Skin Type': <Smile />,
    'Hair Type': <Waves />,
    'Apparel Size': <Shirt />,
    'Pets': <Dog />,
};

export const AboutPage: React.FC<AboutPageProps> = ({ setActivePage, powerCards, keyStats, siteSingletonAssets }) => {
    const { setIsHovering } = useCursor();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [isSpoilerOpen, setIsSpoilerOpen] = useState(false);

    const handlePowerCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { width, height } = rect;

      const rotateX = (y / height - 0.5) * -25; // Tilt intensity
      const rotateY = (x / width - 0.5) * 25;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      card.style.zIndex = '10';
    };

    const handlePowerCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      e.currentTarget.style.zIndex = '1';
      setHoveredCard(null);
      setIsHovering(false);
    };

    const handleStatCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseEnter = (cardTitle: string) => {
        setHoveredCard(cardTitle);
        setIsHovering(true);
    }

    const handleNavClick = (e: React.MouseEvent, page: string) => {
      e.preventDefault();
      setActivePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  return (
    <motion.div 
      className="about-page container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.section className="about-hero">
        <motion.div className="about-hero-text" variants={itemVariants}>
          <AnimatedText text="More Than a Creator — A Performer." el="h1" />
          <p>I blend formal training in Theatre and Film Arts with a deep understanding of digital culture. This academic foundation is my secret weapon in creating content that doesn’t just get seen—it gets felt.</p>
        </motion.div>
        <motion.div className="about-hero-image" variants={itemVariants}>
          <img src={getMediaUrl(siteSingletonAssets.aboutHeroImage)} alt="A professional headshot of Olesya Stepaniuk" />
        </motion.div>
        <div className="page-title-bg about-title-bg">ABOUT</div>
      </motion.section>

      <motion.section 
        className="at-a-glance-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="at-a-glance-accordion">
            <motion.div 
                className={`accordion-header ${isSpoilerOpen ? 'open' : ''}`}
                onClick={() => setIsSpoilerOpen(!isSpoilerOpen)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                variants={itemVariants}
            >
                <div className="accordion-title-wrapper">
                    <AnimatedText text="Creator DNA: The Quick Facts" el="h2" className="accordion-title" />
                    <motion.p 
                        className="accordion-subtitle"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isSpoilerOpen ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        (Click to expand)
                    </motion.p>
                </div>
                <motion.div 
                    className="accordion-chevron"
                    animate={{ rotate: isSpoilerOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={32} />
                </motion.div>
            </motion.div>
            <AnimatePresence>
                {isSpoilerOpen && (
                    <motion.div
                        className="accordion-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="stats-grid">
                            {keyStats.map((stat, index) => (
                                <motion.div 
                                    key={index} 
                                    className="stat-card"
                                    onMouseMove={handleStatCardMouseMove}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
                                >
                                    <div className="stat-icon">{statIcons[stat.key]}</div>
                                    <span className="stat-value">{stat.value}</span>
                                    <span className="stat-key">{stat.key}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.section>

      <motion.section 
        className="academic-edge-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div className="academic-edge-image" variants={itemVariants}>
            <img src={getMediaUrl(siteSingletonAssets.aboutAcademicImage)} alt="A visual representing academic study and creativity." />
        </motion.div>
        <motion.div className="academic-edge-text" variants={itemVariants}>
            <AnimatedText text="The Academic Edge" el="h2" />
            <p className="degree-title">Bachelor's Degree in Theatre and Film Arts</p>
            <p>My formal training wasn't just about acting; it was a deep dive into script analysis, character psychology, and the art of holding an audience's attention. This academic foundation is my secret weapon in creating content that feels real and compelling.</p>
        </motion.div>
      </motion.section>

       <motion.section 
        className="production-power-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
       >
        <div className="production-power-header">
          <AnimatedText text="More Than Just a Face: My Production Power" el="h2" />
          <p>While I am the creative force and face of the projects, I don't work alone. To ensure the highest quality, I collaborate with a professional team and use high-end equipment. This means you get the best of both worlds: the authentic connection of a creator and the polished quality of a professional production house.</p>
        </div>
        <div className="power-grid">
            {powerCards.map((card, index) => (
              <motion.div 
                key={index}
                className="power-card" 
                variants={itemVariants}
                onMouseEnter={() => handleMouseEnter(card.title)}
                onMouseMove={handlePowerCardMouseMove}
                onMouseLeave={handlePowerCardMouseLeave}
              >
                <div className="power-card-content">
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
                <motion.div
                  className="video-preview-3d"
                  initial={false}
                  animate={{
                    opacity: hoveredCard === card.title ? 1 : 0,
                    x: hoveredCard === card.title ? 0 : -20,
                    scale: hoveredCard === card.title ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    src={getMediaUrl(card.videoSrc)}
                    preload="auto"
                    key={card.videoSrc}
                  ></video>
                </motion.div>
              </motion.div>
            ))}
        </div>
       </motion.section>

      <motion.section 
        className="about-cta-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={itemVariants}
    >
        <AnimatedText text="Ready to See This Expertise in Action?" el="h2" />
        <div className="cta-buttons">
            <div
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <a href="#" onClick={(e) => handleNavClick(e, 'portfolio')} className="button">View My Work</a>
            </div>
            <div
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <a href="#" onClick={(e) => handleNavClick(e, 'contact')} className="button">Let's Discuss Your Project</a>
            </div>
        </div>
    </motion.section>
        
    </motion.div>
  );
};