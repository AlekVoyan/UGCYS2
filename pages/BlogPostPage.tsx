import React from 'react';
import './BlogPostPage.css';
import { motion } from 'framer-motion';
import { BlogPost } from './BlogPage';
import { useCursor } from '../context/CursorContext';
import { AnimatedText } from '../components/AnimatedText';

interface BlogPostPageProps {
    post: BlogPost;
    onBack: () => void;
    setActivePage: (page: string) => void;
}

const getMediaUrl = (src: string) => {
    if (!src || src.startsWith('data:') || src.startsWith('/')) {
        return src;
    }
    // Assume it's a blob key
    return `/.netlify/functions/get-blob?key=${src}`;
};

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, onBack, setActivePage }) => {
    const { setIsHovering } = useCursor();

    // Split content by newline to render as separate paragraphs
    const paragraphs = post.fullContent.split('\n').filter(p => p.trim() !== '');

    return (
        <motion.div 
            className="blog-post-page container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div 
                className="back-link" 
                onClick={onBack}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                &larr; Back to All Articles
            </div>

            <article className="blog-post-content">
                <header className="blog-post-header">
                    <p className="post-category">{post.category}</p>
                    <AnimatedText text={post.title} el="h1" />
                </header>
                
                <div className="post-image-container">
                    <img src={getMediaUrl(post.featuredImage || `/assets/images/${post.slug}.jpg`)} alt={`Featured image for blog post titled: ${post.title}`} />
                </div>

                <div className="post-body">
                    {paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </article>

            <motion.section 
                className="cta-section post-cta"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
            >
                <AnimatedText text="Liked this article? Let's work together." el="h2" />
                <p>Turn these strategies into tangible results for your brand.</p>
                <div className="cta-buttons-container">
                    <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('portfolio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="button">View My Work</a>
                    </div>
                    <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="button button-secondary">Contact Me</a>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
};