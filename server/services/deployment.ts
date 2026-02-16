/**
 * One-Click Deployment Engine
 * Deploys generated websites to S3 storage with public URLs
 */

import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export interface DeploymentResult {
  success: boolean;
  deployUrl?: string;
  deploySlug?: string;
  error?: string;
}

/**
 * Deploy a generated website to hosting
 * Returns the public URL where the site is accessible
 */
export async function deployWebsite(
  projectId: number,
  html: string,
  customSlug?: string
): Promise<DeploymentResult> {
  try {
    // Generate unique slug for this deployment
    const slug = customSlug || `site-${nanoid(10)}`;
    const fileName = `deployed-sites/${slug}/index.html`;

    // Upload to S3 storage
    const { url } = await storagePut(fileName, html, "text/html");

    return {
      success: true,
      deployUrl: url,
      deploySlug: slug,
    };
  } catch (error: any) {
    console.error("[Deployment] Failed:", error);
    return {
      success: false,
      error: error.message || "Deployment failed",
    };
  }
}

/**
 * Deploy additional assets (CSS, JS, images) for a multi-file project
 */
export async function deployAsset(
  slug: string,
  fileName: string,
  content: string | Buffer,
  contentType: string
): Promise<string> {
  const filePath = `deployed-sites/${slug}/${fileName}`;
  const { url } = await storagePut(filePath, content, contentType);
  return url;
}

/**
 * Update an existing deployment
 */
export async function updateDeployment(
  slug: string,
  html: string
): Promise<DeploymentResult> {
  try {
    const fileName = `deployed-sites/${slug}/index.html`;
    const { url } = await storagePut(fileName, html, "text/html");

    return {
      success: true,
      deployUrl: url,
      deploySlug: slug,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Update failed",
    };
  }
}

/**
 * Generate a preview URL (non-deployed, temporary)
 */
export async function generatePreview(html: string): Promise<string> {
  const previewId = nanoid(12);
  const fileName = `previews/${previewId}.html`;
  const { url } = await storagePut(fileName, html, "text/html");
  return url;
}

/**
 * Validate custom domain format
 */
export function validateDomain(domain: string): boolean {
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * Get deployment status and metadata
 */
export async function getDeploymentInfo(slug: string): Promise<{
  exists: boolean;
  url?: string;
}> {
  // In a real implementation, this would check S3 or hosting provider
  // For now, we construct the expected URL
  const url = `https://storage.example.com/deployed-sites/${slug}/index.html`;
  
  return {
    exists: true, // Assume exists if we have the slug
    url,
  };
}
