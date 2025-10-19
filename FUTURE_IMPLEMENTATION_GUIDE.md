# Future Implementation Guide: Handling Large File Uploads

This document outlines the plan to upgrade the file upload functionality in the admin panel to support files larger than the current ~5MB limit.

## The Problem: Current Limitation

The current implementation routes all file uploads through a Netlify Function before saving them to Netlify Blobs. Netlify Functions (and the underlying AWS Lambda) have a strict request payload size limit of approximately **6 MB**.

When a file is uploaded from the browser, it is first converted to a Base64 string, which increases its size by about 33%. This means a 5 MB video file becomes ~6.65 MB when encoded, exceeding the function's limit. This is why uploads are currently failing for larger files.

**The bottleneck is not Netlify Blobs, but the Netlify Function acting as a middleman.**

## The Solution: Direct Uploads with Signed URLs

The industry-standard solution to this problem is to bypass the serverless function for the actual file transfer. This is achieved using **Signed URLs**.

The process will be as follows:

1.  **Choose an External Storage Service:** Select a dedicated object storage service.
    *   **Cloudinary:** Excellent for media manipulation (resizing, optimization, transformations on-the-fly) and has a generous free tier. A strong choice for this project.
    *   **Amazon S3:** The industry standard, highly scalable and reliable.
    *   **Google Cloud Storage:** Another major cloud provider with similar capabilities to S3.

2.  **Architectural Flow:**
    *   **Client (Admin Panel):** When a user selects a file to upload, the client will **not** read the file data. Instead, it will make an API call to a new Netlify Function (e.g., `generate-upload-url`) with the file's metadata (name, type, size).
    *   **Netlify Function (`generate-upload-url`):** This function will act as a secure authorizer. It will use the external storage service's SDK and secret API keys (stored securely as environment variables on Netlify) to generate a unique, time-limited, pre-signed URL. This URL grants temporary permission to upload a specific file directly to the storage bucket.
    *   **Client (Admin Panel):** The function returns the signed URL to the client.
    *   **Direct Upload:** The client then uses this URL to perform a `PUT` request, sending the raw file data **directly** to the external storage service, completely bypassing the Netlify Function.
    *   **Confirmation:** Upon successful upload, the client will save the resulting file URL/key to the `content.json` draft.

### Advantages of This Approach

*   **Scalability:** Files of virtually any size can be uploaded, limited only by the storage provider's policies.
*   **Performance:** Direct uploads are faster as they remove the "middleman" serverless function.
*   **Cost-Effectiveness:** Reduces the execution time and memory usage of Netlify Functions.
*   **Security:** API keys for the storage service remain secure on the backend and are never exposed to the client.

## Implementation Steps

1.  **Setup External Service:**
    *   Create an account with the chosen provider (e.g., Cloudinary).
    *   Create a storage bucket/folder for uploads.
    *   Obtain API Key, API Secret, and Cloud Name/Bucket Name.

2.  **Configure Netlify:**
    *   Add the new credentials as environment variables in the Netlify project settings (e.g., `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

3.  **Backend Development:**
    *   Create a new Netlify Function: `netlify/functions/generate-upload-url.ts`.
    *   Install the necessary SDK (e.g., `cloudinary`).
    *   Write the function logic to:
        *   Authenticate with the service using environment variables.
        *   Generate a signed URL for uploading.
        *   Return the URL to the client.

4.  **Frontend Development:**
    *   Modify the file upload components in `pages/AdminPage.tsx`.
    *   Change the logic to first call `/.netlify/functions/generate-upload-url`.
    *   Use the returned URL to perform a `fetch` `PUT` request with the file as the body.
    *   Handle success and error states.
    *   Update the content state with the final URL of the uploaded file, not a blob key.
    *   Update the `getMediaUrl` helper function to handle both Netlify Blob keys and full external URLs.
