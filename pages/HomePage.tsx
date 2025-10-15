import React, { useRef, useEffect, useState } from 'react';
import './HomePage.css';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useCursor } from '../context/CursorContext';
import { AnimatedText } from '../components/AnimatedText';
import { TrustedByLogo, FeaturedWorkUGC } from '../data/content';

// Define the shape of the config object
interface LocationConfig {
  city: string;
  countryCode: string;
}

interface HomePageProps {
  setActivePage: (page: string) => void;
  locationConfig: LocationConfig;
  trustedByLogos: TrustedByLogo[];
  featuredWorkDataUGC: FeaturedWorkUGC[];
  siteSingletonAssets: { [key: string]: string; };
}

const getImageUrl = (src: string) => {
    if (!src || src.startsWith('data:image') || src.startsWith('/assets/')) {
        return src;
    }
    // Assume it's a blob key
    return `/.netlify/functions/get-blob?key=${src}`;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    },
  },
};

// Component to handle logo image loading and errors
const LogoImage = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state if the image source changes
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div className="custom-placeholder trusted-logo-placeholder">
        <span>Not Found</span>
        {alt}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="trusted-logo-img"
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

export const HomePage: React.FC<HomePageProps> = ({ setActivePage, locationConfig, trustedByLogos, featuredWorkDataUGC, siteSingletonAssets }) => {
  const { setIsHovering } = useCursor();
  const feedRef = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<FeaturedWorkUGC | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target.querySelector('video');
          if (videoElement) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
              videoElement.play().catch(error => console.log("Autoplay was prevented:", error));
            } else {
              videoElement.pause();
            }
          }
        });
      },
      {
        root: feedRef.current,
        threshold: 0.7,
      }
    );

    const items = feedRef.current?.querySelectorAll('.ugc-phone-item');
    if (items) {
      items.forEach(item => observer.observe(item));
    }

    return () => {
      if (items) {
        items.forEach(item => observer.unobserve(item));
      }
    };
  }, [featuredWorkDataUGC]);
  
  // Effect for handling body scroll and Escape key for lightbox
  useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
         if (event.key === 'Escape') {
            setSelectedVideo(null);
         }
      };

      if (selectedVideo) {
          document.body.style.overflow = 'hidden';
          window.addEventListener('keydown', handleEsc);
      } else {
          document.body.style.overflow = 'auto';
      }

      return () => {
          window.removeEventListener('keydown', handleEsc);
          document.body.style.overflow = 'auto'; // Cleanup on component unmount
      };
  }, [selectedVideo]);


  const handleNavClick = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      className="homepage"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="hero-section">
        <div className="hero-video-container">
          <video autoPlay loop muted playsInline src={getImageUrl(siteSingletonAssets.heroBackgroundVideo)} className="hero-video-bg" key={siteSingletonAssets.heroBackgroundVideo}></video>
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <motion.div variants={itemVariants}>
            <AnimatedText 
              text="Performance-Driven Content for Modern Brands." 
              el="h1"
            />
          </motion.div>
          
          <motion.p variants={itemVariants}>
            Hi, I'm Olesya Stepaniuk. A professional actress and model creating authentic UGC for brands worldwide. Based in {locationConfig.city}.
          </motion.p>
          <motion.div 
            variants={itemVariants}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
             <a href="#" onClick={(e) => handleNavClick(e, 'portfolio')} className="button">View My Work</a>
          </motion.div>
        </div>
        <div className="hero-bg-text">UGC</div>
      </section>
      
      <section className="trusted-by-section">
        <div className="trusted-by-container">
            <h4>Trusted By</h4>
            <div 
                className="logos-container"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div className="logos-scroll">
                    {[...trustedByLogos, ...trustedByLogos].map((logo, index) => (
                        <a 
                          href={logo.url} 
                          key={`${logo.name}-${index}`}
                          className="logo-link"
                          target="_blank" 
                          rel="noopener noreferrer"
                          aria-label={`Visit website for ${logo.alt}`}
                        >
                          <LogoImage src={`/assets/logos/${logo.name}`} alt={logo.alt} />
                        </a>
                    ))}
                </div>
            </div>
        </div>
      </section>

      <motion.section 
        className="intro-section container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div className="intro-image" variants={itemVariants}>
          <img src={getImageUrl(siteSingletonAssets.homeIntroImage)} alt="Headshot of Olesya Stepaniuk" />
        </motion.div>
        <motion.div className="intro-text" variants={itemVariants}>
            <AnimatedText text="I'm not just a creator. I'm a performer." el="h2" />
            <p>I blend professional acting with the authenticity of UGC to create content that doesn't just get views, but gets results.</p>
             <div className="cta-buttons-container">
                <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                    <a href="#" onClick={(e) => handleNavClick(e, 'about')} className="button">More About Me</a>
                </div>
                <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                    <a href="#" onClick={(e) => handleNavClick(e, 'contact')} className="button button-secondary">Book a Call</a>
                </div>
            </div>
        </motion.div>
      </motion.section>

      <motion.section 
        className="featured-work-section-ugc container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.div className="featured-work-header" variants={itemVariants}>
          <AnimatedText text="Featured Work" el="h2" />
          <p>A glimpse into the high-performing vertical content I create for leading brands on social media.</p>
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a href="#" onClick={(e) => handleNavClick(e, 'portfolio')} className="button">View All Projects</a>
          </div>
        </motion.div>

        <div className="featured-work-feed-container">
            <div className="featured-work-feed" ref={feedRef}>
                {featuredWorkDataUGC.map(item => (
                    <motion.div
                        key={item.id}
                        className="ugc-phone-item"
                        variants={itemVariants}
                        onClick={() => setSelectedVideo(item)}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <div className="phone-mockup-ugc">
                            <div className="phone-screen">
                                <video
                                    src={`/assets/videos/${item.videoSrc}`}
                                    muted
                                    loop
                                    playsInline
                                    className="ugc-video"
                                >
                                    Your browser does not support the video tag.
                                </video>
                                 <div className="social-ui-overlay">
                                    <div className="social-info">
                                        <p className="username">{item.username}</p>
                                        <p className="description">{item.description}</p>
                                    </div>
                                    <div className="social-actions">
                                        <div className="action-item">
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                                            <span>{item.likes}</span>
                                        </div>
                                        <div className="action-item">
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"></path></svg>
                                            <span>{item.comments}</span>
                                        </div>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedVideo && (
            <motion.div
                className="ugc-lightbox-backdrop"
                onClick={() => setSelectedVideo(null)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-modal="true"
                role="dialog"
            >
                <motion.div
                    className="ugc-lightbox-content"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <button
                        className="ugc-lightbox-close"
                        onClick={() => setSelectedVideo(null)}
                        aria-label="Close video"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        &times;
                    </button>
                    <div className="ugc-lightbox-video-container">
                        <video
                            src={`/assets/videos/${selectedVideo.videoSrc}`}
                            autoPlay
                            controls
                            loop
                            playsInline
                            className="ugc-lightbox-video"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="ugc-lightbox-details">
                        <div className="social-info">
                            <p className="username">{selectedVideo.username}</p>
                            <p className="description">{selectedVideo.description}</p>
                        </div>
                        <div className="social-actions">
                            <div className="action-item">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
                                <span>{selectedVideo.likes}</span>
                            </div>
                            <div className="action-item">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"></path></svg>
                                <span>{selectedVideo.comments}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};