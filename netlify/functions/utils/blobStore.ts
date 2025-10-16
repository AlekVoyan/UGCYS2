import { getStore } from "@netlify/blobs";
import type { Store } from "@netlify/blobs";

/**
 * A robust helper to get the blob store.
 * It uses environment variables for local development (e.g., via `netlify dev`)
 * and relies on the injected context when deployed on Netlify.
 */
export const getUploadsStore = (): Store => {
  const { NETLIFY_SITE_ID, NETLIFY_API_TOKEN } = process.env;

  // If essential local dev variables are present, use them.
  if (NETLIFY_SITE_ID && NETLIFY_API_TOKEN) {
    return getStore({
      name: "uploads",
      siteID: NETLIFY_SITE_ID,
      token: NETLIFY_API_TOKEN,
    });
  }

  // Otherwise, rely on the Netlify environment's automatic context injection.
  // This is the standard for deployed functions.
  return getStore("uploads");
};
