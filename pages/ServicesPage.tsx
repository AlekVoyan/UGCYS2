import React, { useState } from 'react';
import './ServicesPage.css';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useCursor } from '../context/CursorContext';
import { AnimatedText } from '../components/AnimatedText';

interface ServicesPageProps {
  setActivePage: (page: string) => void;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
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

const nicheDetailVariants: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { 
    opacity: 1, 
    height: 'auto', 
    marginTop: '2rem',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "#person",
  "name": "Olesya Stepaniuk",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "UGC Content Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "UGC Starter Pack",
          "description": "Ideal for brands testing creators or needing fast, authentic content. Includes 3 UGC Videos and 15 High-Res Photos."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Content Growth Pack",
          "description": "Perfect for scaling your content strategy with variety and quality. Includes 5 UGC Videos (with script variations), 25 High-Res Photos, and 1 Edited Reel."
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Monthly Retainer",
          "description": "Your outsourced content partner. A constant flow of high-quality content, including 10 New Videos Per Month, strategy, and priority booking."
        }
      }
    ]
  }
};

export const ServicesPage: React.FC<ServicesPageProps> = ({ setActivePage }) => {
  const { setIsHovering } = useCursor();
  const [expandedNiche, setExpandedNiche] = useState<string | null>(null);
  
  const handleServiceSelection = (e: React.MouseEvent, serviceValue: string) => {
    e.preventDefault();
    sessionStorage.setItem('selectedService', serviceValue);
    setActivePage('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleNicheToggle = (niche: string) => {
    setExpandedNiche(expandedNiche === niche ? null : niche);
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLLIElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="services-page container">
      {/* SEO: Inject Service Schema */}
      <script type="application/ld+json">
        {JSON.stringify(servicesSchema)}
      </script>

      <div className="page-header">
        <div className="page-title-bg">OFFER</div>
        <AnimatedText text="The Offer" el="h1" />
        <p>From authentic UGC to full-scale production, I offer content solutions that drive real business results.</p>
      </div>
      
      <motion.section 
        className="packages-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <motion.article className="package-item" variants={itemVariants}>
          <div className="package-header">
            <h3>UGC Starter Pack</h3>
            <p>Ideal for brands testing creators or needing fast, authentic content.</p>
          </div>
          <ul className="package-features">
            <li>3 UGC Videos</li>
            <li>15 High-Res Photos</li>
          </ul>
          <div
            className="package-action"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a href="#" onClick={(e) => handleServiceSelection(e, 'ugc-starter-pack')} className="button">Get a Quote</a>
          </div>
        </motion.article>
        
        <motion.article className="package-item featured" variants={itemVariants}>
          <div className="package-header">
            <h3>Content Growth Pack</h3>
            <p>Perfect for scaling your content strategy with variety and quality.</p>
          </div>
          <ul className="package-features">
            <li>5 UGC Videos (with script variations)</li>
            <li>25 High-Res Photos</li>
            <li>1 Edited Reel</li>
          </ul>
          <div
            className="package-action"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a href="#" onClick={(e) => handleServiceSelection(e, 'content-growth-pack')} className="button">Get a Quote</a>
          </div>
        </motion.article>
        
        <motion.article className="package-item" variants={itemVariants}>
          <div className="package-header">
            <h3>Monthly Retainer</h3>
            <p>Your outsourced content partner. A constant flow of high-quality content.</p>
          </div>
          <ul className="package-features">
            <li>10 New Videos Per Month</li>
            <li>Strategy & Priority Booking</li>
          </ul>
           <div
            className="package-action"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a href="#" onClick={(e) => handleServiceSelection(e, 'monthly-retainer')} className="button">Get a Quote</a>
          </div>
        </motion.article>
      </motion.section>
      
      {/* SEO STRATEGY: Niche Dominator Section */}
      <motion.section 
        className="niche-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <AnimatedText text="Industry Expertise" el="h2" />
        <p className="niche-intro">Targeted content solutions designed to dominate specific niches. I speak your customer's language.</p>
        <div className="niche-grid">
            {['Beauty & Skincare', 'Tech & Gadgets', 'Fashion & Apparel'].map((niche, i) => (
                <motion.div key={niche} variants={itemVariants}>
                    <div className="niche-card" onClick={() => handleNicheToggle(niche)}>
                        <h3>{niche}</h3>
                        <p>Click to see my strategy</p>
                        <div className={`niche-toggle ${expandedNiche === niche ? 'open' : ''}`}>+</div>
                    </div>
                    <AnimatePresence>
                    {expandedNiche === niche && (
                        <motion.div
                            className="niche-detail"
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={nicheDetailVariants}
                        >
                            <h4>Strategy for {niche}</h4>
                            <p>My approach for this niche focuses on authenticity and relatability, using targeted LSI keywords to capture high-intent audiences.</p>
                            <h5>Key Content Types:</h5>
                            <ul>
                                {i === 0 && <><li>GRWM (Get Ready With Me)</li><li>Skincare Routine</li><li>Unboxing & First Impressions</li></>}
                                {i === 1 && <><li>Product Demo & How-To</li><li>"Life Hack" integrations</li><li>Testimonial-style reviews</li></>}
                                {i === 2 && <><li>Try-On Hauls</li><li>Styling Videos</li><li>Aesthetic "Day in the life"</li></>}
                            </ul>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
      </motion.section>


      <motion.section 
        className="process-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <AnimatedText text="How I Work" el="h2" />
        <ol className="process-steps">
            <motion.li 
                className="process-step" 
                variants={itemVariants}
                onMouseMove={handleMouseMove}
            >
                <div className="process-number">01</div>
                <div className="process-text">
                    <h4>Briefing & Strategy</h4>
                    <p>We'll start with a call to align on your brand, goals, and creative vision.</p>
                </div>
            </motion.li>
            <motion.li 
                className="process-step" 
                variants={itemVariants}
                onMouseMove={handleMouseMove}
            >
                <div className="process-number">02</div>
                <div className="process-text">
                    <h4>Content Creation</h4>
                    <p>This is where the magic happens. I script, shoot, and produce your content.</p>
                </div>
            </motion.li>
            <motion.li 
                className="process-step" 
                variants={itemVariants}
                onMouseMove={handleMouseMove}
            >
                <div className="process-number">03</div>
                <div className="process-text">
                    <h4>Review & Revisions</h4>
                    <p>You'll get to review the content and request any tweaks to ensure it's perfect.</p>
                </div>
            </motion.li>
            <motion.li 
                className="process-step" 
                variants={itemVariants}
                onMouseMove={handleMouseMove}
            >
                <div className="process-number">04</div>
                <div className="process-text">
                    <h4>Final Delivery</h4>
                    <p>I'll deliver the high-resolution, ready-to-post files in your preferred format.</p>
                </div>
            </motion.li>
        </ol>
      </motion.section>

      <motion.section 
          className="cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
      >
          <AnimatedText text="Ready to grow your brand?" el="h2" />
          <p>Let's discuss how my content can help your brand achieve its goals.</p>
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="button">Get In Touch</a>
          </div>
      </motion.section>
    </div>
  );
};