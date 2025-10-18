import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HomePage } from './pages/HomePage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PortfolioPage } from './pages/PortfolioPage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage, BlogPost } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AdminPage } from './pages/AdminPage';
import { SuccessPage } from './pages/SuccessPage';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import { CursorProvider } from './context/CursorContext';
import { CustomCursor } from './components/CustomCursor';
import { SiteContent } from './data/content';

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

interface LocationConfig {
  city: string;
  countryCode: string;
}

const App = () => {
  const [activePage, setActivePage] = useState('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    fetch('/content.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setContent(data))
      .catch(error => console.error("Failed to fetch content.json:", error));
  }, []);
  
  useEffect(() => {
    // Simplified Netlify Identity setup for external OAuth providers.
    // All complex race-condition fixes for invite tokens have been removed.
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('init', (user: any) => {
        setIsAdminAuthenticated(!!user);
      });
      
      window.netlifyIdentity.on('login', (user: any) => {
        setIsAdminAuthenticated(true);
        setActivePage('admin');
        window.netlifyIdentity.close();
      });

      window.netlifyIdentity.on('logout', () => {
        setIsAdminAuthenticated(false);
        setActivePage('home');
      });
      
      // Initialize the widget. The "Admin" button in the footer will now
      // correctly open the modal to show the configured external providers.
      window.netlifyIdentity.init();
    }
  }, []);


  const updateContent = (newContent: SiteContent) => {
    setContent(newContent);
  };
  
  const handleLogout = () => {
    if (window.netlifyIdentity) {
      localStorage.removeItem('adminEditableContent');
      window.netlifyIdentity.logout();
    }
  };


  const locationConfig: LocationConfig = {
    city: 'Budapest',
    countryCode: 'HU',
  };

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const baseTitle = 'Olesya Stepaniuk | Performance-Driven UGC Creator';
    switch (activePage) {
      case 'home':
        document.title = baseTitle;
        break;
      case 'portfolio':
        document.title = `Portfolio | ${baseTitle}`;
        break;
      case 'about':
        document.title = `About Me | ${baseTitle}`;
        break;
      case 'blog':
        document.title = `Blog | SEO & UGC Strategy | ${baseTitle}`;
        break;
      case 'blog-post':
        document.title = `${selectedPost?.title || 'Blog Post'} | ${baseTitle}`;
        break;
      case 'services':
        document.title = `Services | ${baseTitle}`;
        break;
      case 'contact':
        document.title = `Contact | ${baseTitle}`;
        break;
      case 'success':
        document.title = `Success! | ${baseTitle}`;
        break;
      case 'admin':
        document.title = `Admin Panel | ${baseTitle}`;
        break;
      default:
        document.title = baseTitle;
    }
  }, [activePage, selectedPost]);
  
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "Olesya Stepaniuk | UGC Creator",
          "url": "https://your-website-url.com/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://your-website-url.com/?s={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@id": "#person"
          }
        },
        {
          "@type": "Person",
          "@id": "#person",
          "name": "Olesya Stepaniuk",
          "jobTitle": "UGC Creator",
          "additionalName": "Performer",
          "description": "A professional actress and model creating authentic, performance-driven UGC for brands worldwide.",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": locationConfig.city,
            "addressCountry": locationConfig.countryCode
          },
          "url": "https://your-website-url.com/",
          "sameAs": [
            "https://www.instagram.com/_l.e.s.y.a.n.a_/",
            "https://www.tiktok.com/@_a.l.e_s.y.a_",
            "https://www.youtube.com/@OneSoulFilms/shorts"
          ]
        }
      ]
    };

    const existingScript = document.getElementById('main-json-ld-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'main-json-ld-schema';
    script.innerHTML = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('main-json-ld-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [locationConfig]);


  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    setActivePage('blog-post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage 
            setActivePage={setActivePage} 
            locationConfig={locationConfig}
            trustedByLogos={content!.trustedByLogos}
            featuredWorkDataUGC={content!.featuredWorkDataUGC}
            siteSingletonAssets={content!.siteSingletonAssets}
        />;
      case 'portfolio':
        return <PortfolioPage 
            setActivePage={setActivePage} 
            caseStudies={content!.caseStudiesData}
            photos={content!.photosData}
        />;
      case 'about':
        return <AboutPage 
            setActivePage={setActivePage} 
            powerCards={content!.powerCardsData}
            keyStats={content!.keyStats}
            siteSingletonAssets={content!.siteSingletonAssets}
        />;
      case 'blog':
        return <BlogPage 
            onPostSelect={handleSelectPost} 
            setActivePage={setActivePage} 
            posts={content!.blogPosts}
        />;
      case 'blog-post':
        return selectedPost && <BlogPostPage post={selectedPost} onBack={() => setActivePage('blog')} setActivePage={setActivePage} />;
      case 'services':
        return <ServicesPage setActivePage={setActivePage} />;
      case 'contact':
        return <ContactPage setActivePage={setActivePage} siteSingletonAssets={content!.siteSingletonAssets} />;
      case 'success':
        return <SuccessPage setActivePage={setActivePage} />;
      case 'admin':
        return isAdminAuthenticated ? (
          <AdminPage content={content!} updateContent={updateContent} onLogout={handleLogout} />
        ) : (
          <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
            <h2>Access Denied</h2>
            <p>You must be logged in to view the admin panel. Please use the 'Admin' link in the footer.</p>
          </div>
        );
      default:
        return <HomePage 
            setActivePage={setActivePage} 
            locationConfig={locationConfig}
            trustedByLogos={content!.trustedByLogos}
            featuredWorkDataUGC={content!.featuredWorkDataUGC}
            siteSingletonAssets={content!.siteSingletonAssets}
        />;
    }
  };
  
  if (!content) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background-color)', color: 'var(--heading-color)', fontFamily: 'var(--primary-font)' }}>
        <h2>Loading Content...</h2>
      </div>
    );
  }

  return (
    <CursorProvider>
      <CustomCursor />
      <Header setActivePage={setActivePage} activePage={activePage} />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer setActivePage={setActivePage}/>
    </CursorProvider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);