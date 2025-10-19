import React, { useState, useEffect, useCallback } from 'react';
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
import { EditModeBanner } from './components/EditModeBanner';

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

interface LocationConfig {
  city: string;
  countryCode: string;
}

// Fix: Added a trailing comma inside the generic type parameter `<T,>` to disambiguate it from a JSX tag in a .tsx file. This resolves a cascading parse error.
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const App = () => {
  const [activePage, setActivePage] = useState('home');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  const [liveContent, setLiveContent] = useState<SiteContent | null>(null);
  const [editableContent, setEditableContent] = useState<SiteContent | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isContentLoading, setIsContentLoading] = useState(true);

  // Initial content loading and auth handling
  useEffect(() => {
    const loadContentForUser = async (user: any) => {
      setIsContentLoading(true);
      try {
        const liveResponse = await fetch('/content.json');
        if (!liveResponse.ok) throw new Error('Failed to fetch live content');
        const liveData = await liveResponse.json();
        setLiveContent(liveData);

        if (user) {
          const token = await user.jwt();
          const draftResponse = await fetch('/.netlify/functions/get-draft', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (draftResponse.ok) {
            const draftData = await draftResponse.json();
            setEditableContent(draftData);
            console.log("Loaded draft from cloud.");
          } else {
            setEditableContent(JSON.parse(JSON.stringify(liveData)));
            console.log("No cloud draft found, using live content for editing.");
          }
        } else {
          setEditableContent(JSON.parse(JSON.stringify(liveData)));
        }
      } catch (error) {
        console.error("Failed to load content:", error);
        if (liveContent) setEditableContent(JSON.parse(JSON.stringify(liveContent)));
        else setEditableContent(null);
      } finally {
        setIsContentLoading(false);
      }
    };
    
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on('init', (user: any) => {
        setIsAdminAuthenticated(!!user);
        loadContentForUser(user);
      });
      
      window.netlifyIdentity.on('login', (user: any) => {
        setIsAdminAuthenticated(true);
        loadContentForUser(user);
        setActivePage('admin');
        window.netlifyIdentity.close();
      });

      window.netlifyIdentity.on('logout', () => {
        setIsAdminAuthenticated(false);
        setActivePage('home');
        if (liveContent) {
          setEditableContent(JSON.parse(JSON.stringify(liveContent)));
        }
      });
      
      window.netlifyIdentity.init();
    }
  }, []);

  // Dirty checking for UI feedback
  useEffect(() => {
    if (!isAdminAuthenticated || !liveContent || !editableContent || isContentLoading) {
      setIsDirty(false);
      return;
    }
    const isDifferent = JSON.stringify(liveContent) !== JSON.stringify(editableContent);
    setIsDirty(isDifferent);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDifferent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [liveContent, editableContent, isAdminAuthenticated, isContentLoading]);
  
  // Debounced auto-saving of drafts to cloud
  const debouncedEditableContent = useDebounce(editableContent, 1500);

  useEffect(() => {
    const isDifferent = liveContent && debouncedEditableContent ? JSON.stringify(liveContent) !== JSON.stringify(debouncedEditableContent) : false;

    if (!isDifferent || !isAdminAuthenticated || isContentLoading) return;

    const saveDraft = async () => {
        const user = window.netlifyIdentity?.currentUser();
        if (!user || !debouncedEditableContent) return;
        const token = await user.jwt();

        console.log("Auto-saving draft to cloud...");
        try {
            await fetch('/.netlify/functions/save-draft', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(debouncedEditableContent, null, 2)
            });
        } catch (error) {
            console.error("Failed to auto-save draft:", error);
        }
    };
    saveDraft();
  }, [debouncedEditableContent, liveContent, isAdminAuthenticated, isContentLoading]);
  
  const deleteDraft = useCallback(async () => {
    try {
        const user = window.netlifyIdentity?.currentUser();
        if (!user) return;
        const token = await user.jwt();
        await fetch('/.netlify/functions/delete-draft', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Cloud draft deleted.");
    } catch (error) {
        console.error("Failed to delete cloud draft:", error);
    }
  }, []);


  const handleSave = async () => {
    if (!editableContent) return;
    setSaveStatus('saving');
    try {
      const user = window.netlifyIdentity?.currentUser();
      if (!user) throw new Error('Not logged in.');
      const token = await user.jwt();

      const response = await fetch('/.netlify/functions/saveContent', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(editableContent, null, 2)
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (e) {
          const textError = await response.text();
          if (textError) errorMessage = textError;
        }
        throw new Error(errorMessage);
      }
      
      setLiveContent(JSON.parse(JSON.stringify(editableContent)));
      setSaveStatus('success');
      await deleteDraft();
      setTimeout(() => setSaveStatus('idle'), 5000);

    } catch (error: any) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      alert(`Error: ${(error as Error).message}`);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };
  
  const handleDiscard = async () => {
    if (confirm('Are you sure you want to discard all unsaved changes? This cannot be undone.')) {
      if(liveContent) {
        setEditableContent(JSON.parse(JSON.stringify(liveContent)));
      }
      await deleteDraft();
    }
  };

  const handleLogout = () => {
    const performLogout = async () => {
        try {
            await deleteDraft();
        } catch (e) {
            console.error("Could not delete draft on logout, proceeding anyway.", e);
        } finally {
            window.netlifyIdentity.logout();
        }
    };
    if (isDirty) {
        if (confirm('You have unsaved changes. Logging out will discard your draft. Are you sure?')) {
           performLogout();
        }
    } else {
       performLogout();
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
    // ... (rest of title logic is unchanged)
  }, [activePage, selectedPost]);
  
  useEffect(() => {
    // ... (schema logic is unchanged)
  }, [locationConfig]);


  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    setActivePage('blog-post');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contentToDisplay = (isAdminAuthenticated ? editableContent : liveContent)!;

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage 
            setActivePage={setActivePage} 
            locationConfig={locationConfig}
            trustedByLogos={contentToDisplay.trustedByLogos}
            featuredWorkDataUGC={contentToDisplay.featuredWorkDataUGC}
            siteSingletonAssets={contentToDisplay.siteSingletonAssets}
        />;
      case 'portfolio':
        return <PortfolioPage 
            setActivePage={setActivePage} 
            caseStudies={contentToDisplay.caseStudiesData}
            photos={contentToDisplay.photosData}
        />;
      case 'about':
        return <AboutPage 
            setActivePage={setActivePage} 
            powerCards={contentToDisplay.powerCardsData}
            keyStats={contentToDisplay.keyStats}
            siteSingletonAssets={contentToDisplay.siteSingletonAssets}
        />;
      case 'blog':
        return <BlogPage 
            onPostSelect={handleSelectPost} 
            setActivePage={setActivePage} 
            posts={contentToDisplay.blogPosts}
        />;
      case 'blog-post':
        return selectedPost && <BlogPostPage post={selectedPost} onBack={() => setActivePage('blog')} setActivePage={setActivePage} />;
      case 'services':
        return <ServicesPage setActivePage={setActivePage} />;
      case 'contact':
        return <ContactPage setActivePage={setActivePage} siteSingletonAssets={contentToDisplay.siteSingletonAssets} />;
      case 'success':
        return <SuccessPage setActivePage={setActivePage} />;
      case 'admin':
        return isAdminAuthenticated ? (
          <AdminPage 
            content={editableContent!} 
            setContent={setEditableContent} 
            onLogout={handleLogout} 
          />
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
            trustedByLogos={contentToDisplay.trustedByLogos}
            featuredWorkDataUGC={contentToDisplay.featuredWorkDataUGC}
            siteSingletonAssets={contentToDisplay.siteSingletonAssets}
        />;
    }
  };
  
  if (isContentLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background-color)', color: 'var(--heading-color)', fontFamily: 'var(--primary-font)' }}>
        <h2>Loading Content...</h2>
      </div>
    );
  }

  if (!liveContent || !editableContent) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--background-color)', color: 'var(--heading-color)', fontFamily: 'var(--primary-font)' }}>
        <h2>Error: Could not load site content.</h2>
      </div>
    );
  }

  return (
    <CursorProvider>
      <CustomCursor />
      <AnimatePresence>
        {isAdminAuthenticated && isDirty && 
          <EditModeBanner onSave={handleSave} onDiscard={handleDiscard} status={saveStatus} />
        }
      </AnimatePresence>
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