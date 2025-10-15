// data/content.ts

// --- TYPE DEFINITIONS ---

export interface TrustedByLogo {
    src: string;
    alt: string;
    url: string;
}

export interface FeaturedWorkUGC {
    id: number;
    username: string;
    description: string;
    likes: string;
    comments: string;
    videoSrc: string;
}

export interface CarouselItem {
  brand: string;
  goal: string;
  results: { value: string; label: string }[];
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  embedUrl: string;
  interactionStatistic?: {
    "@type": string;
    "interactionType": { "@type": string; };
    "userInteractionCount": number;
  };
}

export interface CaseStudyData {
  type: 'standard' | 'phone' | 'phone-carousel';
  title: string;
  brand?: string;
  goal?: string;
  results?: { value: string; label: string }[];
  items?: CarouselItem[];
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
  embedUrl?: string;
  interactionStatistic?: {
    "@type": string;
    "interactionType": { "@type": string; };
    "userInteractionCount": number;
  };
}

export interface PhotoData {
    src: string;
    alt: string;
    name: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  fullContent: string;
  featuredImage?: string; // Optional: for base64 encoded image
}

export interface PowerCardData {
    title: string;
    description: string;
    videoSrc: string;
}

export interface KeyStat {
    key: string;
    value: string;
}

export interface SiteContent {
    trustedByLogos: TrustedByLogo[];
    featuredWorkDataUGC: FeaturedWorkUGC[];
    caseStudiesData: CaseStudyData[];
    photosData: PhotoData[];
    blogPosts: BlogPost[];
    powerCardsData: PowerCardData[];
    keyStats: KeyStat[];
    siteSingletonAssets: { [key: string]: string; };
}

// --- TEMPLATES FOR NEW ITEMS ---

export const newTrustedByLogoTemplate: TrustedByLogo = {
    src: "",
    alt: "New Brand Logo",
    url: "#"
};

export const newFeaturedWorkUGCTemplate: FeaturedWorkUGC = {
    id: Date.now(),
    username: "@new_brand",
    description: "A catchy description for the new UGC video.",
    likes: "0",
    comments: "0",
    videoSrc: ""
};

export const newPowerCardTemplate: PowerCardData = {
    title: "New Power Card",
    description: "A description of this production power.",
    videoSrc: ""
};

export const newCaseStudyTemplate: CaseStudyData = {
  type: "standard",
  title: "New Case Study",
  brand: "Brand Name",
  goal: "Project goal...",
  results: [
    { value: "0", label: "result metric" },
    { value: "0", label: "result metric" }
  ],
  embedUrl: "https://www.youtube.com/embed/...",
};

export const newCarouselItemTemplate: CarouselItem = {
    brand: "New Brand Story",
    goal: "Goal for this specific story...",
    results: [
        { value: "0", label: "result metric" }
    ],
    name: "New Brand Story Name",
    description: "Description for SEO...",
    thumbnailUrl: "thumbnail.jpg",
    uploadDate: "YYYY-MM-DDTHH:MM:SS+00:00",
    duration: "PT0M15S",
    embedUrl: "https://www.youtube.com/embed/..."
};


export const newBlogPostTemplate: BlogPost = {
    slug: "new-blog-post-slug",
    title: "New Blog Post Title",
    category: "Category",
    excerpt: "A short, compelling summary of the article.",
    fullContent: "Start writing the full content of the blog post here.\n\nUse a blank line to create a new paragraph.",
    featuredImage: ""
};