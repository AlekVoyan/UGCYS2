import { getStore } from "@netlify/blobs";
import type { Store } from "@netlify/blobs";

/**
 * A helper to get the blob store, configured exclusively for the deployed Netlify environment.
 * This version removes local development logic to prevent bundling issues that cause runtime errors.
 */
export const getUploadsStore = (): Store => {
  // In any deployed environment (production, deploy-preview, etc.),
  // getStore() must be called with only the store name.
  // Netlify's infrastructure automatically provides the necessary site context and token.
  return getStore("uploads");
};
