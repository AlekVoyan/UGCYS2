# Content & Asset Guide for Your Website

This guide provides a complete checklist of all the media files required to fully populate your website. To ensure everything displays correctly, please follow the file paths and naming conventions precisely.

---

## ★ Key Requirement: Folder Structure

Before you begin, ensure your folder structure is correct. The entire `assets` folder (containing `videos`, `images`, and `logos`) **must be placed inside the `public` folder**.

**Correct Structure:**
```
your-project/
├── public/
│   ├── assets/
│   │   ├── videos/
│   │   │   ├── hero-bg.mp4
│   │   │   └── ... (and all other videos)
│   │   ├── images/
│   │   │   ├── about-headshot.jpg
│   │   │   └── ... (and all other images)
│   │   └── logos/
│   │       ├── logo1.png
│   │       └── ... (and all other logos)
│   └── content.json
├── src/
└── package.json
```

---

## 1. Video Files

**Path for all videos:** `public/assets/videos/`

**Pro Tip:** All videos **must be compressed for the web!** Use online tools or software like HandBrake. Aim for the smallest possible file size while maintaining good quality. Resolutions listed below are recommendations for a good balance of quality and performance.

| Filename                   | Recommended Resolution | Description & Page Usage                                  |
| -------------------------- | ---------------------- | --------------------------------------------------------- |
| `hero-bg.mp4`              | 1920x1080 (16:9)       | **Homepage:** Main background video in the hero section.  |
| `ugc-video-1.mp4`          | 1080x1920 (9:16)       | **Homepage:** Short UGC clip for the featured work feed.    |
| `ugc-video-2.mp4`          | 1080x1920 (9:16)       | **Homepage:** Short UGC clip for the featured work feed.    |
| `ugc-video-3.mp4`          | 1080x1920 (9:16)       | **Homepage:** Short UGC clip for the featured work feed.    |
| `ugc-video-4.mp4`          | 1080x1920 (9:16)       | **Homepage:** Short UGC clip for the featured work feed.    |
| `ugc-video-5.mp4`          | 1080x1920 (9:16)       | **Homepage:** Short UGC clip for the featured work feed.    |
| `ugc-video-6.mp4`          | 1080x1920 (9:16)       | **Homepage:** Short UGC clip for the featured work feed.    |
| `ugc-video-7.mp4`          | 1080x1920 (9:16)       | **Homepage:** Short UGC clip for the featured work feed.    |
| `videographer-preview.mp4` | 1280x720 (16:9)        | **About Page:** Short preview for the "Videographer" card.  |
| `editor-preview.mp4`       | 1280x720 (16:9)        | **About Page:** Short preview for the "Editor" card.        |
| `equipment-preview.mp4`    | 1280x720 (16:9)        | **About Page:** Short preview for the "Equipment" card.     |

---

## 2. Image Files

**Path for all images:** `public/assets/images/`

**Pro Tip:** Optimize all images for the web using tools like TinyPNG/JPG. Aim for file sizes under **500 KB** for photos.

| Filename                                  | Recommended Resolution | Description & Page Usage                                       |
| ------------------------------------------| ---------------------- | -------------------------------------------------------------- |
| `about-headshot.jpg`                      | ~1200px width          | **Homepage:** Photo in the "I'm not just a creator" section.    |
| `about-headshot.png`                      | ~1200px width          | **About Page:** Main photo in the hero section.                |
| `academic-visual.jpg`                     | ~1600px width          | **About Page:** Photo in "The Academic Edge" section.           |
| `contact-visual.jpg`                      | ~1200px width          | **Contact Page:** Photo next to the contact form.              |
| `tiktok-ads-not-converting.jpg`           | ~1000px width          | **Blog Page:** Thumbnail for "5 Reasons Your TikTok Ads..."      |
| `ugc-vs-influencer-marketing-2025.jpg`    | ~1000px width          | **Blog Page:** Thumbnail for "UGC vs. Influencer Marketing..."   |
| `how-to-write-ugc-brief.jpg`              | ~1000px width          | **Blog Page:** Thumbnail for "How to Write a UGC Brief..."       |
| `psychology-of-scroll-stopping-video.jpg` | ~1000px width          | **Blog Page:** Thumbnail for "The Psychology of a Scroll-Stopping..." |
| `photo-1.jpg` to `photo-21.jpg` (21 files)| ~1500px longest side   | **Portfolio Page:** All photos for the main photo gallery.     |

---

## 3. Logo Files

**Path for all logos:** `public/assets/logos/`

**Pro Tip:** Use a high-resolution **PNG** with a transparent background for best results. SVG is also a good alternative for scalability.

| Filename    | Format | Description & Page Usage                           |
| ----------- | ------ | -------------------------------------------------- |
| `logo1.png` | PNG    | **Homepage:** Client logo in the "Trusted By" section. |
| `logo2.png` | PNG    | **Homepage:** Client logo in the "Trusted By" section. |
| `logo3.png` | PNG    | **Homepage:** Client logo in the "Trusted By" section. |
| `logo4.png` | PNG    | **Homepage:** Client logo in the "Trusted By" section. |
| `logo5.png` | PNG    | **Homepage:** Client logo in the "Trusted By" section. |