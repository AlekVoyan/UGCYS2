import React, { useState, useRef, useEffect } from 'react';
import './AdminPage.css';
import { SiteContent, CaseStudyData, BlogPost, PhotoData, newCaseStudyTemplate, newBlogPostTemplate, CarouselItem, newCarouselItemTemplate, PowerCardData, newPowerCardTemplate, FeaturedWorkUGC, newFeaturedWorkUGCTemplate, TrustedByLogo, newTrustedByLogoTemplate } from '../data/content';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LayoutGrid, FileText, Image as ImageIcon, Trash2, PlusCircle, GripVertical, UploadCloud, Search, ChevronLeft, Menu, Loader, Palette, HelpCircle, Film, Star, Award } from 'lucide-react';

interface AdminPageProps {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => void;
  onLogout: () => void;
}

const MAX_VIDEO_SIZE_BYTES = 20 * 1024 * 1024; // 20MB for videos
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit for images pre-compression

const getMediaUrl = (src: string) => {
    if (!src || src.startsWith('data:') || src.startsWith('/')) {
        return src;
    }
    // Assume it's a blob key
    return `/.netlify/functions/get-blob?key=${src}`;
};

// Deep cloning and path-based updates to avoid state mutation issues
const get = (obj: any, path: (string | number)[]) => path.reduce((acc, part) => acc && acc[part], obj);
const set = (obj: any, path: (string | number)[], value: any) => {
    const newObj = JSON.parse(JSON.stringify(obj));
    let current = newObj;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    return newObj;
};

const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) return reject(new Error("Could not read file."));
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const MAX_WIDTH = 1280;
                const MAX_HEIGHT = 1280;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8); 
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

const Tooltip = ({ text }: { text: string }) => (
    <div className="tooltip-container">
        <HelpCircle size={16} className="tooltip-icon" />
        <div className="tooltip-text">{text}</div>
    </div>
);

// --- NEW UPLOAD HELPERS for Direct Upload Flow ---

const dataURLtoBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

// Helper to read blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // remove the prefix e.g. "data:image/jpeg;base64,"
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read blob as base64 string."));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};

const uploadFile = async (file: File | Blob, filename: string): Promise<{ key: string }> => {
    const user = window.netlifyIdentity?.currentUser();
    if (!user) {
        throw new Error("User not authenticated.");
    }
    const token = await user.jwt();

    // Convert file to base64
    const base64Data = await blobToBase64(file);

    // Send the base64 data to our function for direct upload
    const response = await fetch('/.netlify/functions/upload-blob', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileData: base64Data, mimeType: file.type })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Could not upload file.');
    }
    
    const { key } = await response.json();
    return { key };
};


export const AdminPage: React.FC<AdminPageProps> = ({ content, updateContent, onLogout }) => {
  const [activeSection, setActiveSection] = useState('portfolio-case-studies');
  const [editableContent, setEditableContent] = useState<SiteContent>(() => JSON.parse(JSON.stringify(content)));
  const [openAccordion, setOpenAccordion] = useState<string | null>('cs-0');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [searchTerms, setSearchTerms] = useState({
    'portfolio-case-studies': '',
    'blog': '',
    'homepage-ugc-feed': '',
    'about-power-cards': '',
  });
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [uploadingSingletonAssets, setUploadingSingletonAssets] = useState<{ [key: string]: boolean }>({});


  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);


  const handleSave = async (contentToSave: SiteContent = editableContent) => {
    setSaveStatus('saving');
    try {
      const user = window.netlifyIdentity?.currentUser();
      if (!user) {
        throw new Error('Not logged in. Please refresh and try again.');
      }
      const token = await user.jwt();

      const response = await fetch('/.netlify/functions/saveContent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contentToSave, null, 2)
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (e) {
          // Response was not JSON, use plain text
          const textError = await response.text();
          if (textError) {
            errorMessage = textError;
          }
        }
        throw new Error(errorMessage);
      }
      
      updateContent(contentToSave);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);

    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      alert(`Error: ${(error as Error).message}`);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };
  
  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'success': return 'Success!';
      case 'error': return 'Error! Retry?';
      default: return 'Save All Changes';
    }
  };
  
  const getSaveButtonClass = () => {
    let base = "button";
    if (saveStatus === 'success') base += ' success';
    if (saveStatus === 'error') base += ' error';
    return base;
  };


  const handleSearchChange = (section: keyof typeof searchTerms, value: string) => {
      setSearchTerms(prev => ({ ...prev, [section]: value }));
  };

  const handleFieldChange = (path: (string | number)[], value: any, options = { shouldSave: false }) => {
    const newContent = set(editableContent, path, value);
    setEditableContent(newContent);
    if (options.shouldSave) {
        handleSave(newContent);
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // --- ADD/DELETE Functionality ---
  const addItem = (type: 'caseStudiesData' | 'blogPosts' | 'powerCardsData' | 'featuredWorkDataUGC' | 'trustedByLogos') => {
    let template;
    switch(type) {
        case 'caseStudiesData': template = newCaseStudyTemplate; break;
        case 'blogPosts': template = newBlogPostTemplate; break;
        case 'powerCardsData': template = newPowerCardTemplate; break;
        case 'featuredWorkDataUGC': template = newFeaturedWorkUGCTemplate; break;
        case 'trustedByLogos': template = newTrustedByLogoTemplate; break;
    }
    const currentArray = editableContent[type];
    const newArray = [JSON.parse(JSON.stringify(template)), ...currentArray];
    setEditableContent({ ...editableContent, [type]: newArray });
    if (type !== 'trustedByLogos') {
      setOpenAccordion(`${type.replace('Data', '').replace('s', '')}-0`);
    }
  };

  const deleteItem = async (type: 'caseStudiesData' | 'blogPosts' | 'photosData' | 'powerCardsData' | 'featuredWorkDataUGC' | 'trustedByLogos', index: number) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }

    const itemToDelete = (editableContent as any)[type][index];
    let keyToDelete = '';

    if (type === 'photosData') {
        keyToDelete = itemToDelete.src;
    } else if (type === 'trustedByLogos') {
        keyToDelete = itemToDelete.src;
    }

    if (keyToDelete && !keyToDelete.startsWith('data:image')) {
        try {
            const user = window.netlifyIdentity?.currentUser();
            if (!user) throw new Error("User not authenticated.");
            const token = await user.jwt();
            
            const response = await fetch('/.netlify/functions/delete-blob', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ key: keyToDelete })
            });
            if (!response.ok) throw new Error("Failed to delete from blob storage.");
        } catch (error) {
            console.error("Failed to delete blob:", error);
            alert("Could not delete image from storage. Please try again.");
            return;
        }
    }
    
    const currentArray = (editableContent as any)[type];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    const newContent = { ...editableContent, [type]: newArray };
    setEditableContent(newContent);
    await handleSave(newContent);
  };


  // --- Photo Management ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    const allFiles: File[] = Array.from(files);
    
    if (allFiles.some(file => file.size > MAX_IMAGE_SIZE_BYTES)) {
        alert(`One or more images are too large. Please ensure each file is under ${(MAX_IMAGE_SIZE_BYTES / 1024 / 1024).toFixed(1)}MB.`);
        e.target.value = ''; // Reset file input
        return;
    }
    
    setUploadingFiles(allFiles.map(f => f.name));
  
    const uploadPromises = allFiles.map(file => {
      return (async () => {
        try {
          const resizedDataUrl = await resizeImage(file);
          const imageBlob = dataURLtoBlob(resizedDataUrl);
          const { key } = await uploadFile(imageBlob, file.name);
          return { src: key, alt: file.name, name: file.name };
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          alert(`Upload failed for ${file.name}. Please check the console for details.`);
          return null;
        }
      })();
    });
  
    const results = await Promise.all(uploadPromises);
    const newPhotos = results.filter((p): p is PhotoData => p !== null);
  
    if (newPhotos.length > 0) {
      const newContent = {
        ...editableContent,
        photosData: [...newPhotos, ...editableContent.photosData],
      };
      setEditableContent(newContent);
      await handleSave(newContent);
    }
    setUploadingFiles([]);
  };

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newPhotos = [...editableContent.photosData];
    const draggedItemContent = newPhotos.splice(dragItem.current, 1)[0];
    newPhotos.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setEditableContent({ ...editableContent, photosData: newPhotos });
  };


  const renderSection = () => {
    switch (activeSection) {
        case 'portfolio-case-studies':
            return <ListEditor
                title="Portfolio Case Studies"
                items={editableContent.caseStudiesData}
                onAdd={() => addItem('caseStudiesData')}
                onDelete={(index) => deleteItem('caseStudiesData', index)}
                openAccordion={openAccordion}
                toggleAccordion={toggleAccordion}
                renderForm={(item, index) => <CaseStudyForm item={item} index={index} onChange={handleFieldChange} />}
                prefix="cs"
                searchTerm={searchTerms['portfolio-case-studies']}
                onSearchChange={(value) => handleSearchChange('portfolio-case-studies', value)}
            />;
        case 'portfolio-photos':
            return <PhotoEditor
                photos={editableContent.photosData}
                onUploadClick={() => fileInputRef.current?.click()}
                onDelete={(index) => deleteItem('photosData', index)}
                dragItem={dragItem}
                dragOverItem={dragOverItem}
                onDragSort={handleDragSort}
                uploadingFiles={uploadingFiles}
            />;
        case 'blog':
            return <ListEditor
                title="Blog Posts"
                items={editableContent.blogPosts}
                onAdd={() => addItem('blogPosts')}
                onDelete={(index) => deleteItem('blogPosts', index)}
                openAccordion={openAccordion}
                toggleAccordion={toggleAccordion}
                renderForm={(item, index) => <BlogPostForm item={item} index={index} onChange={handleFieldChange} />}
                prefix="blog"
                searchTerm={searchTerms['blog']}
                onSearchChange={(value) => handleSearchChange('blog', value)}
            />;
        case 'homepage-ugc-feed':
            return <ListEditor
                title="Homepage UGC Feed"
                items={editableContent.featuredWorkDataUGC}
                onAdd={() => addItem('featuredWorkDataUGC')}
                onDelete={(index) => deleteItem('featuredWorkDataUGC', index)}
                openAccordion={openAccordion}
                toggleAccordion={toggleAccordion}
                renderForm={(item, index) => <FeaturedWorkUGCForm item={item} index={index} onChange={handleFieldChange} />}
                prefix="ugc"
                searchTerm={searchTerms['homepage-ugc-feed']}
                onSearchChange={(value) => handleSearchChange('homepage-ugc-feed', value)}
            />;
        case 'trusted-by-logos':
            return <TrustedByLogosEditor
                logos={editableContent.trustedByLogos}
                onAdd={() => addItem('trustedByLogos')}
                onDelete={(index) => deleteItem('trustedByLogos', index)}
                onChange={handleFieldChange}
            />;
        case 'about-power-cards':
            return <ListEditor
                title="About Page Power Cards"
                items={editableContent.powerCardsData}
                onAdd={() => addItem('powerCardsData')}
                onDelete={(index) => deleteItem('powerCardsData', index)}
                openAccordion={openAccordion}
                toggleAccordion={toggleAccordion}
                renderForm={(item, index) => <PowerCardForm item={item} index={index} onChange={handleFieldChange} />}
                prefix="pc"
                searchTerm={searchTerms['about-power-cards']}
                onSearchChange={(value) => handleSearchChange('about-power-cards', value)}
            />;
        case 'page-visuals':
            return <PageVisualsEditor 
                assets={editableContent.siteSingletonAssets}
                onChange={handleFieldChange}
                uploadingStates={uploadingSingletonAssets}
                setUploadingState={(key, isUploading) => setUploadingSingletonAssets(prev => ({...prev, [key]: isUploading}))}
            />;
        default:
            return <p>Select a section to edit.</p>;
    }
  };

  return (
    <div className={`admin-page ${isSidebarMinimized ? 'sidebar-minimized' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div 
                    className="mobile-sidebar-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </AnimatePresence>
        <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
        <nav className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2><span>Admin Panel</span></h2>
            </div>
            <ul>
                <li className="nav-category">Portfolio</li>
                <li><button onClick={() => {setActiveSection('portfolio-case-studies'); setIsMobileMenuOpen(false);}} className={activeSection === 'portfolio-case-studies' ? 'active' : ''}><LayoutGrid size={18} /> <span>Case Studies</span></button></li>
                <li><button onClick={() => {setActiveSection('portfolio-photos'); setIsMobileMenuOpen(false);}} className={activeSection === 'portfolio-photos' ? 'active' : ''}><ImageIcon size={18} /> <span>Photos</span></button></li>
                <li className="nav-category">Content</li>
                <li><button onClick={() => {setActiveSection('blog'); setIsMobileMenuOpen(false);}} className={activeSection === 'blog' ? 'active' : ''}><FileText size={18} /> <span>Blog Posts</span></button></li>
                <li className="nav-category">Homepage</li>
                <li><button onClick={() => {setActiveSection('homepage-ugc-feed'); setIsMobileMenuOpen(false);}} className={activeSection === 'homepage-ugc-feed' ? 'active' : ''}><Film size={18} /> <span>UGC Feed</span></button></li>
                <li><button onClick={() => {setActiveSection('trusted-by-logos'); setIsMobileMenuOpen(false);}} className={activeSection === 'trusted-by-logos' ? 'active' : ''}><Award size={18} /> <span>Trusted By Logos</span></button></li>
                <li className="nav-category">About Page</li>
                <li><button onClick={() => {setActiveSection('about-power-cards'); setIsMobileMenuOpen(false);}} className={activeSection === 'about-power-cards' ? 'active' : ''}><Star size={18} /> <span>Power Cards</span></button></li>
                <li className="nav-category">Site Design</li>
                <li><button onClick={() => {setActiveSection('page-visuals'); setIsMobileMenuOpen(false);}} className={activeSection === 'page-visuals' ? 'active' : ''}><Palette size={18} /> <span>Page Visuals</span></button></li>
            </ul>
            <div className="admin-sidebar-footer">
                <button onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}>
                    <ChevronLeft />
                    <span>Collapse Menu</span>
                </button>
            </div>
        </nav>
        <main className="admin-main-content">
            <header className="admin-main-header">
                <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
                    <Menu size={24} />
                </button>
                <h1>{activeSection.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h1>
                <div className="admin-header-actions">
                    <button onClick={onLogout} className="button button-secondary">Logout</button>
                    <button onClick={() => handleSave()} className={getSaveButtonClass()} disabled={saveStatus === 'saving'}>
                        {getSaveButtonText()}
                    </button>
                </div>
            </header>
            <div className="admin-content-area">
                {renderSection()}
            </div>
        </main>
    </div>
  );
};


// --- Sub-components for better organization ---

interface ListEditorProps {
    title: string;
    items: any[];
    onAdd: () => void;
    onDelete: (index: number) => void;
    openAccordion: string | null;
    toggleAccordion: (id: string) => void;
    renderForm: (item: any, index: number) => React.ReactNode;
    prefix: string;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const ListEditor: React.FC<ListEditorProps> = ({ title, items, onAdd, onDelete, openAccordion, toggleAccordion, renderForm, prefix, searchTerm, onSearchChange }) => {
    const filteredItems = items
        .map((item, index) => ({ item, originalIndex: index }))
        .filter(({ item }) =>
            (item.title || item.brand || item.username || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

    return (
        <section>
            <div className="section-header">
                <h3>{title}</h3>
                <div className="section-header-actions">
                    <div className="search-bar">
                        <Search className="search-icon" size={18}/>
                        <input 
                            type="text" 
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <button className="add-button" onClick={onAdd}><PlusCircle size={16}/> Add New</button>
                </div>
            </div>
            {filteredItems.length > 0 ? (
                <div className="accordion-list">
                    {filteredItems.map(({ item, originalIndex }) => (
                        <div key={originalIndex} className="accordion-item">
                            <div className="accordion-header" onClick={() => toggleAccordion(`${prefix}-${originalIndex}`)}>
                                <span>{item.title || item.brand || item.username || 'Untitled'}</span>
                                <div className="accordion-actions">
                                    <button className="delete-button" onClick={(e) => { e.stopPropagation(); onDelete(originalIndex); }}><Trash2 size={16}/></button>
                                    <ChevronDown className={`accordion-chevron ${openAccordion === `${prefix}-${originalIndex}` ? 'open' : ''}`} />
                                </div>
                            </div>
                            <AnimatePresence>
                            {openAccordion === `${prefix}-${originalIndex}` && (
                                <motion.div
                                    className="accordion-content"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1, transition: { duration: 0.3 } }}
                                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                                >
                                {renderForm(item, originalIndex)}
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-results">
                    <p>No items found{searchTerm && ` matching "${searchTerm}"`}.</p>
                </div>
            )}
        </section>
    );
};

const CaseStudyForm = ({ item, index, onChange }: { item: CaseStudyData, index: number, onChange: (path: any[], val: any) => void }) => {
    
    // State for managing which carousel item accordion is open
    const [openCarouselItem, setOpenCarouselItem] = useState<number | null>(0);

    // Refs for drag and drop
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleCarouselDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newItems = [...(item.items || [])];
        const draggedItemContent = newItems.splice(dragItem.current, 1)[0];
        newItems.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        onChange(['caseStudiesData', index, 'items'], newItems);
    };

    const handleDeleteCarouselItem = (itemIndex: number) => {
        if (confirm('Are you sure you want to delete this story?')) {
            const newItems = [...(item.items || [])];
            newItems.splice(itemIndex, 1);
            onChange(['caseStudiesData', index, 'items'], newItems);
        }
    };

    const handleAddCarouselItem = () => {
        const newItems = [...(item.items || []), newCarouselItemTemplate];
        onChange(['caseStudiesData', index, 'items'], newItems);
        // Open the newly added item
        setOpenCarouselItem(newItems.length - 1);
    };

    if (item.type === 'phone-carousel') {
        return (
            <div className="admin-form">
                <label>Title</label>
                <input type="text" value={item.title} onChange={e => onChange(['caseStudiesData', index, 'title'], e.target.value)} />
                <div className="carousel-item-editor">
                    <h4>Brand Stories</h4>
                    {item.items && item.items.map((cItem, cIndex) => (
                        <div 
                            key={cIndex}
                            className="carousel-item-card"
                            draggable
                            onDragStart={() => dragItem.current = cIndex}
                            onDragEnter={() => dragOverItem.current = cIndex}
                            onDragEnd={handleCarouselDragSort}
                            onDragOver={e => e.preventDefault()}
                        >
                            <div className="carousel-item-header" onClick={() => setOpenCarouselItem(openCarouselItem === cIndex ? null : cIndex)}>
                                <GripVertical className="drag-handle" size={20} />
                                <span className="carousel-item-title">{cItem.brand || 'New Story'}</span>
                                <div className="carousel-item-actions">
                                    <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDeleteCarouselItem(cIndex); }}><Trash2 size={16} /></button>
                                    <ChevronDown className={`accordion-chevron ${openCarouselItem === cIndex ? 'open' : ''}`} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {openCarouselItem === cIndex && (
                                    <motion.div
                                        className="carousel-item-content"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        <label>Brand</label>
                                        <input type="text" value={cItem.brand} onChange={e => onChange(['caseStudiesData', index, 'items', cIndex, 'brand'], e.target.value)} />
                                        <label>Goal</label>
                                        <textarea value={cItem.goal} onChange={e => onChange(['caseStudiesData', index, 'items', cIndex, 'goal'], e.target.value)} />
                                        <label>Embed URL</label>
                                        <input type="text" value={cItem.embedUrl} onChange={e => onChange(['caseStudiesData', index, 'items', cIndex, 'embedUrl'], e.target.value)} />
                                        {cItem.results.map((res, rIndex) => (
                                            <div key={rIndex} className="form-row">
                                                <div>
                                                    <label>Result Value</label>
                                                    <input type="text" value={res.value} onChange={e => onChange(['caseStudiesData', index, 'items', cIndex, 'results', rIndex, 'value'], e.target.value)} />
                                                </div>
                                                <div>
                                                    <label>Result Label</label>
                                                    <input type="text" value={res.label} onChange={e => onChange(['caseStudiesData', index, 'items', cIndex, 'results', rIndex, 'label'], e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                    <button className="add-button" onClick={handleAddCarouselItem}><PlusCircle size={16} /> Add Story</button>
                </div>
            </div>
        )
    }

    return (
        <div className="admin-form">
            <label>Title</label>
            <input type="text" value={item.title} onChange={e => onChange(['caseStudiesData', index, 'title'], e.target.value)} />
            <label>Type</label>
            <select value={item.type} onChange={e => onChange(['caseStudiesData', index, 'type'], e.target.value)}>
                <option value="standard">Standard (16:9)</option>
                <option value="phone">Phone (9:16)</option>
                <option value="phone-carousel">Phone Carousel</option>
            </select>
            <label>Brand</label>
            <input type="text" value={item.brand || ''} onChange={e => onChange(['caseStudiesData', index, 'brand'], e.target.value)} />
            <label>Goal</label>
            <textarea value={item.goal || ''} onChange={e => onChange(['caseStudiesData', index, 'goal'], e.target.value)} />
            <label>Embed URL</label>
            <input type="text" value={item.embedUrl || ''} onChange={e => onChange(['caseStudiesData', index, 'embedUrl'], e.target.value)} />
            {item.results && item.results.map((result, rIndex) => (
                <div key={rIndex} className="form-row">
                    <div>
                        <label>Result Value</label>
                        <input type="text" value={result.value} onChange={e => onChange(['caseStudiesData', index, 'results', rIndex, 'value'], e.target.value)} />
                    </div>
                    <div>
                        <label>Result Label</label>
                        <input type="text" value={result.label} onChange={e => onChange(['caseStudiesData', index, 'results', rIndex, 'label'], e.target.value)} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const BlogPostForm = ({ item, index, onChange }: { item: BlogPost, index: number, onChange: (path: any[], val: any, options?: { shouldSave: boolean }) => void }) => {
    const blogPostFileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            alert(`Image is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Please use an image smaller than ${(MAX_IMAGE_SIZE_BYTES / 1024 / 1024).toFixed(1)} MB.`);
            e.target.value = '';
            return;
        }

        setIsUploading(true);
        try {
            const resizedDataUrl = await resizeImage(file);
            const imageBlob = dataURLtoBlob(resizedDataUrl);
            const { key } = await uploadFile(imageBlob, file.name);
            onChange(['blogPosts', index, 'featuredImage'], key, { shouldSave: true });

        } catch (error) {
            console.error("Image processing failed:", error);
            alert("Failed to process image. Please try a different file.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        const key = item.featuredImage;
        if (!key || key.startsWith('data:image')) {
            onChange(['blogPosts', index, 'featuredImage'], '');
            return;
        }

        if (!confirm("Are you sure you want to remove this image? This will delete it from storage.")) {
            return;
        }

        try {
            const user = window.netlifyIdentity?.currentUser();
            if (!user) throw new Error("User not authenticated.");
            const token = await user.jwt();

            const response = await fetch('/.netlify/functions/delete-blob', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ key })
            });
            if (!response.ok) throw new Error("Failed to delete from blob storage.");

            onChange(['blogPosts', index, 'featuredImage'], '', { shouldSave: true });
        } catch (error) {
            console.error("Failed to delete blob:", error);
            alert("Could not delete image from storage. Please try again.");
        }
    };

    return (
        <div className="admin-form">
            <div className="form-section">
                <label>Featured Image <Tooltip text="Recommended: 16:9 aspect ratio, optimized JPEG under 800KB." /></label>
                {item.featuredImage ? (
                    <div className="image-preview-container">
                        <img src={getMediaUrl(item.featuredImage)} alt="Featured" className="image-preview" />
                        <button onClick={handleRemoveImage} className="remove-image-button">Remove Image</button>
                    </div>
                ) : (
                    <>
                        <input type="file" accept="image/*" ref={blogPostFileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                        <button className="upload-button-styled" onClick={() => blogPostFileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <><Loader className="spinner" size={16}/> Uploading...</> : <><UploadCloud size={16} /> Upload Image</>}
                        </button>
                    </>
                )}
            </div>
            <label>Slug</label>
            <input type="text" value={item.slug} onChange={e => onChange(['blogPosts', index, 'slug'], e.target.value)} />
            <label>Title</label>
            <input type="text" value={item.title} onChange={e => onChange(['blogPosts', index, 'title'], e.target.value)} />
            <label>Category</label>
            <input type="text" value={item.category} onChange={e => onChange(['blogPosts', index, 'category'], e.target.value)} />
            <label>Excerpt</label>
            <textarea value={item.excerpt} onChange={e => onChange(['blogPosts', index, 'excerpt'], e.target.value)} />
            <label>Full Content (use a blank line for new paragraphs)</label>
            <textarea className="tall" value={item.fullContent} onChange={e => onChange(['blogPosts', index, 'fullContent'], e.target.value)} />
        </div>
    );
};


const PhotoEditor = ({ photos, onUploadClick, onDelete, dragItem, dragOverItem, onDragSort, uploadingFiles }: any) => (
    <section>
        <div className="section-header">
            <h3>Photo Gallery</h3>
            <div className="section-header-actions">
                <Tooltip text="Recommended: Square (1:1 aspect ratio), optimized JPEG under 500KB." />
                <button className="upload-button" onClick={onUploadClick} disabled={uploadingFiles.length > 0}>
                    {uploadingFiles.length > 0 ? <><Loader className="spinner" size={16}/> Uploading...</> : <><UploadCloud size={16}/> Upload Photos</>}
                </button>
            </div>
        </div>
        <p className="helper-text">Drag and drop photos to reorder them for the portfolio page.</p>
        <div className="photo-admin-grid">
            {uploadingFiles.map((name: string) => (
                <div key={name} className="photo-admin-item-loading">
                    <Loader className="spinner" />
                    <span>{name}</span>
                </div>
            ))}
            {photos.map((photo: PhotoData, index: number) => (
                <div
                    key={index}
                    className="photo-admin-item"
                    draggable
                    onDragStart={() => (dragItem.current = index)}
                    onDragEnter={() => (dragOverItem.current = index)}
                    onDragEnd={onDragSort}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <img src={getMediaUrl(photo.src)} alt={photo.alt} />
                    <div className="photo-admin-overlay">
                        <GripVertical className="drag-handle" size={20} />
                        <button className="delete-button" onClick={() => onDelete(index)}><Trash2 size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </section>
);

const assetLabels: { [key: string]: { label: string; type: 'image' | 'video', tip: string } } = {
  heroBackgroundVideo: { label: 'Homepage Hero Background', type: 'video', tip: '1920x1080 (16:9). Keep file size small (<20MB) for fast loading.' },
  homeIntroImage: { label: 'Homepage Intro Section Image', type: 'image', tip: 'Recommended: Portrait orientation, optimized JPEG < 500KB.' },
  aboutHeroImage: { label: 'About Page Hero Image', type: 'image', tip: 'Recommended: Portrait or square, optimized PNG for transparency if needed.' },
  aboutAcademicImage: { label: 'About Page "Academic Edge" Image', type: 'image', tip: 'Recommended: Landscape (4:5 ratio), optimized JPEG < 600KB.' },
  contactVisualImage: { label: 'Contact Page Visual', type: 'image', tip: 'Recommended: Portrait or square, optimized JPEG < 500KB.' },
};

const PageVisualsEditor = ({ assets, onChange, uploadingStates, setUploadingState }: any) => {
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: string, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const limit = type === 'video' ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
        const limitMB = (limit / 1024 / 1024).toFixed(1);

        if (file.size > limit) {
            alert(`File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Please upload a file smaller than ${limitMB} MB.`);
            e.target.value = '';
            return;
        }

        setUploadingState(key, true);
        try {
            let blobToUpload: Blob;
            if (type === 'image') {
                const resizedDataUrl = await resizeImage(file);
                blobToUpload = dataURLtoBlob(resizedDataUrl);
            } else {
                blobToUpload = file;
            }

            const { key: newKey } = await uploadFile(blobToUpload, file.name);
            onChange(['siteSingletonAssets', key], newKey, { shouldSave: true });

        } catch (error) {
            console.error(`Upload failed for ${key}:`, error);
            alert(`Upload failed: ${(error as Error).message}`);
        } finally {
            setUploadingState(key, false);
        }
    };

    return (
        <section>
            <div className="section-header">
                <h3>Site-Wide Page Visuals</h3>
            </div>
            <p className="helper-text">Manage the main images and videos that appear on key pages of your site. Uploading a new file will automatically replace the old one.</p>
            <div className="visuals-grid">
                {Object.keys(assetLabels).map(key => {
                    const { label, type, tip } = assetLabels[key];
                    const src = assets[key];
                    const isUploading = uploadingStates[key];

                    if (key === 'heroBackgroundVideo') {
                        return (
                            <div key={key} className="visual-card static-asset-card">
                                <h4>{label} <Tooltip text={tip} /></h4>
                                <div className="visual-preview">
                                    <video src={getMediaUrl(src)} muted autoPlay loop playsInline key={src}/>
                                </div>
                                <div className="static-asset-notice">
                                    <p><strong>This is a core site asset.</strong> To ensure optimal performance and streaming, this video must be managed directly in the project's Git repository.</p>
                                    <p>Update the file at:</p>
                                    <code>public{src}</code>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={key} className="visual-card">
                            <h4>{label} <Tooltip text={tip} /></h4>
                            <div className="visual-preview">
                                {isUploading ? (
                                    <div className="visual-loading-overlay">
                                        <Loader className="spinner" />
                                        <span>Uploading...</span>
                                    </div>
                                ) : (
                                    type === 'image' ?
                                        <img src={getMediaUrl(src)} alt={label} key={src} /> :
                                        <video src={getMediaUrl(src)} muted autoPlay loop playsInline key={src}/>
                                )}
                            </div>
                            <input
                                type="file"
                                accept={type === 'image' ? 'image/*' : 'video/*'}
                                style={{ display: 'none' }}
                                ref={(el) => { fileInputRefs.current[key] = el; }}
                                onChange={(e) => handleFileChange(e, key, type)}
                            />
                            <button 
                                className="upload-button-styled small"
                                onClick={() => fileInputRefs.current[key]?.click()}
                                disabled={isUploading}
                            >
                                <UploadCloud size={16} /> {isUploading ? 'Processing...' : 'Upload New'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const FeaturedWorkUGCForm = ({ item, index, onChange }: { item: FeaturedWorkUGC, index: number, onChange: (path: any[], val: any, options?: { shouldSave: boolean }) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_VIDEO_SIZE_BYTES) {
            alert(`Video is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Please upload a video smaller than 20 MB.`);
            e.target.value = '';
            return;
        }

        setIsUploading(true);
        try {
            const { key } = await uploadFile(file, file.name);
            onChange(['featuredWorkDataUGC', index, 'videoSrc'], key, { shouldSave: true });

        } catch (error) {
            console.error("Video upload failed:", error);
            alert("Failed to upload video. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="admin-form">
            <div className="form-section">
                <label>UGC Video <Tooltip text="9:16 vertical video. Compress for web. Max 20MB is ideal." /></label>
                {item.videoSrc && (
                    <div className="image-preview-container">
                        <video src={getMediaUrl(item.videoSrc)} controls loop muted className="image-preview" key={item.videoSrc}/>
                    </div>
                )}
                <input type="file" accept="video/*" ref={fileInputRef} onChange={handleVideoUpload} style={{ display: 'none' }} />
                <button className="upload-button-styled" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <><Loader className="spinner" size={16}/> Uploading...</> : <><UploadCloud size={16} /> {item.videoSrc ? 'Replace Video' : 'Upload Video'}</>}
                </button>
            </div>
            <label>Username</label>
            <input type="text" value={item.username} onChange={e => onChange(['featuredWorkDataUGC', index, 'username'], e.target.value)} />
            <label>Description</label>
            <textarea value={item.description} onChange={e => onChange(['featuredWorkDataUGC', index, 'description'], e.target.value)} />
            <div className="form-row">
                <div>
                    <label>Likes</label>
                    <input type="text" value={item.likes} onChange={e => onChange(['featuredWorkDataUGC', index, 'likes'], e.target.value)} />
                </div>
                <div>
                    <label>Comments</label>
                    <input type="text" value={item.comments} onChange={e => onChange(['featuredWorkDataUGC', index, 'comments'], e.target.value)} />
                </div>
            </div>
        </div>
    );
};

const PowerCardForm = ({ item, index, onChange }: { item: PowerCardData, index: number, onChange: (path: any[], val: any, options?: { shouldSave: boolean }) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_VIDEO_SIZE_BYTES) {
            alert(`Video is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Please upload a video smaller than 20 MB.`);
            e.target.value = '';
            return;
        }

        setIsUploading(true);
        try {
            const { key } = await uploadFile(file, file.name);
            onChange(['powerCardsData', index, 'videoSrc'], key, { shouldSave: true });
        } catch (error) {
            console.error("Video upload failed:", error);
            alert("Failed to upload video. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        <div className="admin-form">
            <div className="form-section">
                <label>Preview Video <Tooltip text="16:9 video. Short, looping clip. Compress for web. Max 20MB is ideal." /></label>
                {item.videoSrc && (
                    <div className="image-preview-container">
                        <video src={getMediaUrl(item.videoSrc)} controls loop muted className="image-preview" key={item.videoSrc}/>
                    </div>
                )}
                <input type="file" accept="video/*" ref={fileInputRef} onChange={handleVideoUpload} style={{ display: 'none' }} />
                <button className="upload-button-styled" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? <><Loader className="spinner" size={16}/> Uploading...</> : <><UploadCloud size={16} /> {item.videoSrc ? 'Replace Video' : 'Upload Video'}</>}
                </button>
            </div>
            <label>Title</label>
            <input type="text" value={item.title} onChange={e => onChange(['powerCardsData', index, 'title'], e.target.value)} />
            <label>Description</label>
            <textarea value={item.description} onChange={e => onChange(['powerCardsData', index, 'description'], e.target.value)} />
        </div>
    );
};

const TrustedByLogosEditor = ({ logos, onAdd, onDelete, onChange }: { logos: TrustedByLogo[], onAdd: () => void, onDelete: (index: number) => void, onChange: (path: any[], val: any, options?: { shouldSave: boolean }) => void }) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newLogos = [...logos];
        const draggedItemContent = newLogos.splice(dragItem.current, 1)[0];
        newLogos.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        onChange(['trustedByLogos'], newLogos);
    };

    return (
        <section>
            <div className="section-header">
                <h3>Trusted By Logos</h3>
                <div className="section-header-actions">
                    <Tooltip text="PNGs with transparent backgrounds work best. Images will be displayed at a height of 35px." />
                    <button className="add-button" onClick={onAdd}><PlusCircle size={16}/> Add Logo</button>
                </div>
            </div>
            <p className="helper-text">Manage the scrolling logos on the homepage. Drag and drop to reorder.</p>
            <div className="logos-admin-grid">
                {logos.map((logo, index) => (
                    <LogoCard 
                        key={index}
                        logo={logo}
                        index={index}
                        onDelete={() => onDelete(index)}
                        onChange={onChange}
                        onDragStart={() => dragItem.current = index}
                        onDragEnter={() => dragOverItem.current = index}
                        onDragEnd={handleDragSort}
                    />
                ))}
            </div>
        </section>
    );
};

const LogoCard = ({ logo, index, onDelete, onChange, ...dragProps }: { logo: TrustedByLogo, index: number, onDelete: () => void, onChange: (path: any[], val: any, options?: { shouldSave: boolean }) => void, [key: string]: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit for logos
            alert(`Image is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Please use an image smaller than 2 MB.`);
            e.target.value = '';
            return;
        }
        
        setIsUploading(true);
        try {
            const resizedDataUrl = await resizeImage(file);
            const imageBlob = dataURLtoBlob(resizedDataUrl);
            const { key } = await uploadFile(imageBlob, file.name);
            onChange(['trustedByLogos', index, 'src'], key, { shouldSave: true });
        } catch (error) {
            console.error("Image upload failed:", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        <div className="logo-admin-card" draggable {...dragProps} onDragOver={e => e.preventDefault()}>
            <GripVertical className="drag-handle" size={20} />
            <button className="delete-button" onClick={onDelete}><Trash2 size={16}/></button>
            <div className="logo-preview-wrapper">
                {logo.src ? <img src={getMediaUrl(logo.src)} alt={logo.alt} /> : <span>No Image</span>}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
            <button className="upload-button-styled small" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <><Loader className="spinner" size={16}/> Uploading...</> : <><UploadCloud size={16} /> {logo.src ? 'Replace' : 'Upload'}</>}
            </button>
            <div className="admin-form">
                <label>Alt Text (for SEO)</label>
                <input type="text" value={logo.alt} onChange={e => onChange(['trustedByLogos', index, 'alt'], e.target.value)} />
                <label>Brand URL (optional)</label>
                <input type="text" value={logo.url} onChange={e => onChange(['trustedByLogos', index, 'url'], e.target.value)} />
            </div>
        </div>
    );
};