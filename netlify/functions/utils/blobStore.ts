import { getStore } from "@netlify/blobs";
import type { Store } from "@netlify/blobs";

/**
 * A helper to get the blob store, dynamically handling local development and deployed environments.
 */
export const getUploadsStore = (): Store => {
  // Netlify automatically sets the CONTEXT environment variable.
  // 'dev' is for local development via `netlify dev`.
  // 'production', 'deploy-preview', 'branch-deploy' are for deployed environments.
  const isLocalDev = process.env.CONTEXT === 'dev';

  if (isLocalDev) {
    // For local development, we must manually provide siteID and a token.
    const siteID = process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_API_TOKEN;

    if (!siteID || !token) {
      throw new Error(
        "Required environment variables NETLIFY_SITE_ID and NETLIFY_API_TOKEN are not set. Make sure to run `netlify link` and `netlify dev`."
      );
    }
    
    return getStore({
      name: "uploads",
      siteID,
      token,
    });
  } else {
    // In any deployed environment, getStore("uploads") must be called without
    // parameters, as Netlify's infrastructure automatically provides context.
    return getStore("uploads");
  }
};
