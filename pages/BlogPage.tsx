import React, { useState } from 'react';
import './BlogPage.css';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useCursor } from '../context/CursorContext';
import { AnimatedText } from '../components/AnimatedText';
import { BlogPost } from '../data/content';

export type { BlogPost };

interface BlogPageProps {
  onPostSelect: (post: BlogPost) => void;
  setActivePage: (page: string) => void;
  posts: BlogPost[];
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const getImageUrl = (src: string) => {
    if (!src || src.startsWith('data:image') || src.startsWith('/assets/images/')) {
        return src;
    }
    // Assume it's a blob key
    return `/.netlify/functions/get-blob?key=${src}`;
};

const INITIAL_VISIBLE_POSTS = 3;
const POSTS_TO_LOAD_INCREMENT = 3;

export const BlogPage: React.FC<BlogPageProps> = ({ onPostSelect, setActivePage, posts }) => {
    const { setIsHovering } = useCursor();
    const [visiblePostsCount, setVisiblePostsCount] = useState(INITIAL_VISIBLE_POSTS);

    const blogSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Blog",
                "name": "Olesya Stepaniuk's Blog on UGC and Performance Marketing",
                "url": "https://your-website-url.com/blog",
                "description": "Strategies, tactics, and creative insights on User-Generated Content for modern brands.",
                "publisher": {
                    "@id": "#person"
                }
            },
            ...posts.map((post) => ({
                "@type": "BlogPosting",
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": `https://your-website-url.com/blog/${post.slug}`
                },
                "headline": post.title,
                "description": post.excerpt,
                "author": {
                    "@id": "#person"
                },
                "publisher": {
                    "@id": "#person"
                },
                "datePublished": `2024-06-15`, // Simplified date
                "image": post.featuredImage || `https://your-website-url.com/assets/images/${post.slug}.jpg`
            }))
        ]
    };

    const handleShowMore = () => {
        setVisiblePostsCount(prevCount => Math.min(prevCount + POSTS_TO_LOAD_INCREMENT, posts.length));
    };
    
    return (
        <div className="blog-page container">
            <script type="application/ld+json">
                {JSON.stringify(blogSchema)}
            </script>
            <div className="page-header">
                <div className="page-title-bg">BLOG</div>
                <AnimatedText text="Insights & Strategy" el="h1" />
                <p>My "Trojan Horse": Answering the questions brand managers are Googling right now, turning this portfolio into a resource.</p>
            </div>

            <motion.div 
                className="blog-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                layout
            >
                <AnimatePresence>
                    {posts.slice(0, visiblePostsCount).map((post) => (
                        <motion.article 
                            key={post.slug}
                            className="blog-card"
                            variants={itemVariants}
                            layout
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            onClick={() => onPostSelect(post)}
                        >
                            <div className="blog-card-image">
                                <img src={getImageUrl(post.featuredImage || `/assets/images/${post.slug}.jpg`)} alt={`Featured image for blog post titled: ${post.title}`} />
                                <div className="blog-card-category">{post.category}</div>
                            </div>
                            <div className="blog-card-content">
                                <h3>{post.title}</h3>
                                <p>{post.excerpt}</p>
                                <div className="read-more">Read More &rarr;</div>
                            </div>
                        </motion.article>
                    ))}
                </AnimatePresence>
            </motion.div>

            {visiblePostsCount < posts.length && (
                <motion.div 
                    className="show-more-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <button 
                        onClick={handleShowMore} 
                        className="button"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        Show More
                    </button>
                </motion.div>
            )}

            <motion.section 
                className="cta-section blog-cta"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
            >
                <AnimatedText text="Ready to put these insights into action?" el="h2" />
                <p>Let's create content that not only informs but also converts.</p>
                <div className="cta-buttons-container">
                    <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('portfolio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="button">View My Work</a>
                    </div>
                    <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="button button-secondary">Let's Talk</a>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};