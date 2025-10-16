import { getStore } from "@netlify/blobs";
import type { Store } from "@netlify/blobs";

/**
 * A helper to get the blob store, intended for use only within a deployed Netlify environment.
 */
export const getUploadsStore = (): Store => {
  // In any deployed environment (production, deploy-preview, etc.),
  // getStore("uploads") must be called without parameters, and Netlify's
  // infrastructure automatically provides the necessary context.
  return getStore("uploads");
};
