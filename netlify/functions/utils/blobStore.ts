import { getStore } from "@netlify/blobs";
import type { Store } from "@netlify/blobs";

/**
 * A robust helper to get the blob store.
 * It differentiates between local development and deployed environments by checking for the presence of specific local-only environment variables.
 */
export const getUploadsStore = (): Store => {
  const { NETLIFY_SITE_ID, NETLIFY_API_TOKEN } = process.env;

  // The presence of NETLIFY_SITE_ID and NETLIFY_API_TOKEN indicates a local development environment
  // where these are explicitly set by the user (e.g., via `netlify dev` and a .env file).
  const isLocalDevWithVars = NETLIFY_SITE_ID && NETLIFY_API_TOKEN;

  if (isLocalDevWithVars) {
    // --- LOCAL DEVELOPMENT ---
    // Use the provided environment variables to connect to the blob store.
    return getStore({
      name: "uploads",
      siteID: NETLIFY_SITE_ID,
      token: NETLIFY_API_TOKEN,
    });
  } else {
    // --- DEPLOYED ON NETLIFY ---
    // In any deployed environment (production, deploy-preview, etc.), these environment variables
    // are not exposed to the function. Instead, getStore("uploads") must be called without parameters,
    // and Netlify's infrastructure automatically provides the necessary context.
    return getStore("uploads");
  }
};
