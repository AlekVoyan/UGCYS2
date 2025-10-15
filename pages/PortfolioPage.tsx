import React, { useState, useEffect } from 'react';
import './PortfolioPage.css';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCursor } from '../context/CursorContext';
import { AnimatedText } from '../components/AnimatedText';
import { CaseStudyData, PhotoData } from '../data/content';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PortfolioPageProps {
  setActivePage: (page: string) => void;
  caseStudies: CaseStudyData[];
  photos: PhotoData[];
}

const INITIAL_VISIBLE_CASE_STUDIES = 3;
const INITIAL_VISIBLE_PHOTOS = 9;
const PHOTOS_TO_LOAD_INCREMENT = 6;

const getImageUrl = (src: string) => {
    if (!src || src.startsWith('data:image') || src.startsWith('/assets/images/')) {
        return src;
    }
    // Assume it's a blob key
    return `/.netlify/functions/get-blob?key=${src}`;
};

// A new hook to determine if the view is desktop
const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 992);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 992);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isDesktop;
};


export const PortfolioPage: React.FC<PortfolioPageProps> = ({ setActivePage, caseStudies, photos }) => {
  const { setIsHovering } = useCursor();
  const [visibleCaseStudies, setVisibleCaseStudies] = useState(INITIAL_VISIBLE_CASE_STUDIES);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [visiblePhotosCount, setVisiblePhotosCount] = useState(INITIAL_VISIBLE_PHOTOS);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const isDesktop = useIsDesktop();
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null);

  const handleNextImage = () => {
    if (lightboxImageIndex !== null) {
        setLightboxImageIndex((prevIndex) => (prevIndex! + 1) % photos.length);
    }
  };

  const handlePrevImage = () => {
      if (lightboxImageIndex !== null) {
          setLightboxImageIndex((prevIndex) => (prevIndex! - 1 + photos.length) % photos.length);
      }
  };
  
  const handleShowMorePhotos = () => {
    setVisiblePhotosCount(prevCount => Math.min(prevCount + PHOTOS_TO_LOAD_INCREMENT, photos.length));
  };


  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (lightboxImageIndex === null) return;
          if (e.key === 'ArrowRight') handleNextImage();
          if (e.key === 'ArrowLeft') handlePrevImage();
          if (e.key === 'Escape') setLightboxImageIndex(null);
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImageIndex]);
  
  // If window resizes to mobile, close any active 3D animation
  useEffect(() => {
    if (!isDesktop) {
        setActiveStudyId(null);
    }
  }, [isDesktop]);

  const textVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut', delay: 0.2 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  const handleShowMoreCaseStudies = () => {
    setVisibleCaseStudies(caseStudies.length);
  };

  const videoObjects = caseStudies.flatMap(study => {
      if (study.type === 'phone-carousel' && study.items) {
          return study.items.map(video => ({
              "@type": "VideoObject",
              name: video.name,
              description: video.description,
              thumbnailUrl: `https://your-website.com/assets/images/${video.thumbnailUrl}`,
              uploadDate: video.uploadDate,
              duration: video.duration,
              embedUrl: video.embedUrl,
              interactionStatistic: video.interactionStatistic,
              "author": { "@type": "Person", "name": "Olesya Stepaniuk" }
          }));
      }
      if (study.name && study.description && study.thumbnailUrl && study.uploadDate && study.duration && study.embedUrl) {
          return [{
              "@type": "VideoObject",
              name: study.name,
              description: study.description,
              thumbnailUrl: `https://your-website.com/assets/images/${study.thumbnailUrl}`,
              uploadDate: study.uploadDate,
              duration: study.duration,
              embedUrl: study.embedUrl,
              interactionStatistic: study.interactionStatistic,
              "author": { "@type": "Person", "name": "Olesya Stepaniuk" }
          }];
      }
      return [];
  });

  const imageObjects = photos.map((photo, index) => ({
    "@type": "ImageObject",
    "contentUrl": `/assets/images/${photo.src}`,
    "name": photo.name,
    "description": photo.alt,
    "author": { "@type": "Person", "name": "Olesya Stepaniuk" },
    "position": index + 1
  }));

  const pageSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": "Portfolio - Olesya Stepaniuk",
        "description": "Portfolio of performance-driven UGC, video case studies, and photography by Olesya Stepaniuk.",
        "hasPart": [
            ...videoObjects.map(v => ({ "@type": "VideoObject", "name": v.name })),
            ...imageObjects.map(i => ({ "@type": "ImageObject", "name": i.name }))
        ]
      },
      ...videoObjects,
      ...imageObjects
    ]
  };


  return (
    <div className="portfolio-page container">
      <script type="application/ld+json">
        {JSON.stringify(pageSchema)}
      </script>

      <div className="page-header">
        <div className="page-title-bg">WORK</div>
        <AnimatedText text="My Work" el="h1" />
        <p>I solve business problems by creating beautiful, high-performing content that resonates with audiences and drives results.</p>
      </div>

      <motion.div 
        className="case-studies"
        initial="hidden"
        animate="visible"
        variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.4 } }
        }}
      >
        <AnimatePresence>
            {caseStudies.slice(0, visibleCaseStudies).map((study, index) => {
               if (study.type === 'phone-carousel' && study.items) {
                const currentItem = study.items[activeItemIndex];
                const numItems = study.items.length;

                const goToNext = () => setActiveItemIndex(prev => (prev + 1) % numItems);
                const goToPrev = () => setActiveItemIndex(prev => (prev - 1 + numItems) % numItems);
            
                const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold) {
                        goToNext();
                    } else if (info.offset.x > swipeThreshold) {
                        goToPrev();
                    }
                };

                return (
                  <motion.article 
                    key={study.title}
                    className={`case-study ${index % 2 !== 0 ? 'reverse' : ''}`}
                    variants={{hidden: {opacity:0, y: 50}, visible: {opacity:1, y: 0}}}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    layout
                  >
                    <div className="case-study-image">
                        <div className="phone-carousel-wrapper">
                            <button className="carousel-nav prev" onClick={goToPrev} aria-label="Previous story"><ChevronLeft size={32}/></button>
                            <motion.div
                                className="phone-carousel-track"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                                animate={{ x: `-${activeItemIndex * 100}%` }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            >
                                {study.items.map((item, idx) => (
                                    <div key={idx} className="phone-container-slide">
                                        <div className="phone-mockup">
                                            <div className="video-embed-container ratio-portrait">
                                                <iframe src={item.embedUrl} title={`YouTube video player for ${item.brand}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                            <button className="carousel-nav next" onClick={goToNext} aria-label="Next story"><ChevronRight size={32}/></button>
                        </div>
                        <div className="carousel-dots">
                            {study.items.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`dot ${activeItemIndex === idx ? 'active' : ''}`}
                                    onClick={() => setActiveItemIndex(idx)}
                                    aria-label={`Go to story ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="case-study-content">
                      <div className="case-study-title">
                        <AnimatedText text={study.title} el="h2" />
                        <AnimatePresence mode="wait">
                          <motion.h3 key={activeItemIndex} variants={textVariants} initial="initial" animate="animate" exit="exit">
                              {currentItem.brand}
                          </motion.h3>
                        </AnimatePresence>
                      </div>
                      <AnimatePresence mode="wait">
                          <motion.p key={activeItemIndex} variants={textVariants} initial="initial" animate="animate" exit="exit">
                              <strong>Goal:</strong> {currentItem.goal}
                          </motion.p>
                      </AnimatePresence>
                      <div className="case-study-results">
                        {currentItem.results.map(result => (
                          <div className="result-item" key={result.label}>
                              <AnimatePresence mode="wait">
                                  <motion.span key={activeItemIndex + result.value} variants={textVariants} initial="initial" animate="animate" exit="exit">
                                      {result.value}
                                  </motion.span>
                              </AnimatePresence>
                              {' '}{result.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                );
              }

              const isStandard = study.type === 'standard';
              const isReversed = index % 2 !== 0 && isStandard;
              const studyId = study.brand || study.title;
              const isActive = activeStudyId === studyId;

              return (
              <motion.article 
                key={study.brand || study.title}
                className={`case-study ${isReversed ? 'reverse' : ''}`} 
                variants={{hidden: {opacity:0, y: 50}, visible: {opacity:1, y: 0}}}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
              >
                <div 
                  className="case-study-image"
                  onClick={() => isDesktop && isStandard && setActiveStudyId(studyId!)}
                  onMouseEnter={() => isDesktop && isStandard && setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {study.type === 'phone' ? (
                    <div className="phone-container">
                        <div className="phone-mockup">
                            <div className="video-embed-container ratio-portrait">
                                <iframe src={study.embedUrl} title={`YouTube video player for ${study.brand}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                            </div>
                        </div>
                    </div>
                  ) : (
                    <div className="video-embed-container">
                        <iframe src={study.embedUrl} title={`YouTube video player for ${study.brand}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
                    </div>
                  )}
                </div>
                <motion.div 
                    className="case-study-content"
                    onClick={() => isDesktop && isStandard && isActive && setActiveStudyId(null)}
                    onMouseEnter={() => isDesktop && isStandard && setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    animate={ isDesktop && isStandard ? {
                        x: isActive ? (isReversed ? "60%" : "-60%") : "0%",
                        rotateY: isActive ? (isReversed ? -45 : 45) : 0,
                        z: isActive ? -150 : 0,
                        scale: isActive ? 0.95 : 1
                      } : {} }
                    transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                >
                  <div className="case-study-title">
                    <AnimatedText text={study.title} el="h2" />
                    <h3>{study.brand}</h3>
                  </div>
                  <p><strong>Goal:</strong> {study.goal}</p>
                  <div className="case-study-results">
                    {study.results && study.results.map(result => (
                      <div className="result-item" key={result.label}>
                        <span>{result.value}</span> {result.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.article>
            )})}
        </AnimatePresence>
      </motion.div>
      
      {visibleCaseStudies < caseStudies.length && (
        <motion.div 
            className="show-more-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
          <button 
            onClick={handleShowMoreCaseStudies} 
            className="button"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            Show More Projects
          </button>
        </motion.div>
      )}

      <motion.section 
        className="photo-gallery-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="photo-gallery-header">
            <AnimatedText text="Photo Gallery" el="h2" />
            <p>A collection of high-resolution stills from various brand collaborations, showcasing versatility in beauty, tech, and lifestyle.</p>
        </div>
        <motion.div className="photo-grid" layout>
          <AnimatePresence>
            {photos.slice(0, visiblePhotosCount).map((photo, index) => (
                <motion.div
                    key={index}
                    className="photo-grid-item"
                    onClick={() => setLightboxImageIndex(index)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                >
                    <img 
                        src={getImageUrl(photo.src)} 
                        alt={photo.alt}
                        loading="lazy"
                    />
                    <div className="photo-overlay">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </div>
                </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {visiblePhotosCount < photos.length && (
            <div className="show-more-container">
                <button
                    onClick={handleShowMorePhotos}
                    className="button"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    Show More Photos
                </button>
            </div>
        )}
      </motion.section>

      <AnimatePresence>
        {lightboxImageIndex !== null && (
            <motion.div
                className="lightbox-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxImageIndex(null)}
            >
                <button className="lightbox-close" onClick={() => setLightboxImageIndex(null)} aria-label="Close image viewer">&times;</button>
                <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} aria-label="Previous image">&#10094;</button>
                <motion.div
                    className="lightbox-content"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                >
                    <img 
                        src={getImageUrl(photos[lightboxImageIndex].src)} 
                        alt={photos[lightboxImageIndex].alt} 
                    />
                </motion.div>
                <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); handleNextImage(); }} aria-label="Next image">&#10095;</button>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="cta-section">
          <AnimatedText text="Ready to create results like these?" el="h2" />
          <p>Let's discuss how my content can help your brand achieve its goals.</p>
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('contact'); }} className="button">Get In Touch</a>
          </div>
      </div>

    </div>
  );
};