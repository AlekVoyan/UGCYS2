import { getStore } from "@netlify/blobs";
import type { Store } from "@netlify/blobs";

/**
 * A robust helper to get the blob store.
 * It explicitly checks for the Netlify production environment versus a local environment.
 */
export const getUploadsStore = (): Store => {
  const context = process.env.CONTEXT;

  // Check if running in a deployed Netlify environment (production, deploy previews, or branch deploys)
  if (context === 'production' || context === 'deploy-preview' || context === 'branch-deploy') {
    // In the deployed Netlify environment, call getStore without parameters.
    // Netlify automatically injects the siteID and a scoped token.
    return getStore("uploads");
  }

  // --- LOCAL DEVELOPMENT ---
  // If the context is anything else (like 'dev' or undefined), assume local development.
  const { NETLIFY_SITE_ID, NETLIFY_API_TOKEN } = process.env;

  // For local dev, these variables are required.
  if (!NETLIFY_SITE_ID || !NETLIFY_API_TOKEN) {
    throw new Error(
      "Missing required environment variables for local development: NETLIFY_SITE_ID and NETLIFY_API_TOKEN. Please check your .env file or Netlify Dev configuration."
    );
  }

  return getStore({
    name: "uploads",
    siteID: NETLIFY_SITE_ID,
    token: NETLIFY_API_TOKEN,
  });
};
