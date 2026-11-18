import type { StorageDisplayOptions, StorageProvider } from '@/src/storage/types';
import type { ImageItem } from '@/src/types/image';

const CLOUDINARY_CLOUD_NAME = (
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
).trim();

function sanitizeAttachmentName(slug: string): string {
  return (slug || 'qyopic-image')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractCloudNameFromUrl(url: string): string {
  const match = url.match(/https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  return match ? match[1] : '';
}

function injectTransform(baseUrl: string, transform: string): string {
  const marker = '/image/upload/';
  const index = baseUrl.indexOf(marker);
  if (index === -1) return baseUrl;

  const prefix = baseUrl.slice(0, index + marker.length);
  const rest = baseUrl.slice(index + marker.length);

  // Strip existing transformation segment if one precedes version/publicId
  const segments = rest.split('/');
  const first = segments[0] || '';
  const hasVersion = /^v\d+$/.test(first);
  const hasTransform =
    !hasVersion &&
    (first.includes(',') ||
      /^(f_|q_|w_|h_|c_|fl_)/.test(first));

  const cleanRest = hasTransform ? segments.slice(1).join('/') : rest;
  return transform ? `${prefix}${transform}/${cleanRest}` : `${prefix}${cleanRest}`;
}

export const cloudinaryProvider: StorageProvider = {
  id: 'cloudinary',
  label: 'Cloudinary CDN',

  canHandle(item: ImageItem): boolean {
    if (item.storageProvider === 'cloudinary') return true;
    if (item.publicId) return true;
    if (item.url && /res\.cloudinary\.com/i.test(item.url)) return true;
    return false;
  },

  getDisplayUrl(item: ImageItem, options?: StorageDisplayOptions): string {
    const baseUrl = this.getDirectUrl(item);
    if (!baseUrl) return '';

    if (options?.quality === 'original') {
      return injectTransform(baseUrl, 'f_auto,q_auto:best');
    }

    const transforms = ['f_auto', 'q_auto'];
    if (options?.width) {
      transforms.push(`w_${options.width}`, 'c_limit');
    }

    return injectTransform(baseUrl, transforms.join(','));
  },

  getOriginalDownloadUrl(item: ImageItem): string {
    const baseUrl = this.getDirectUrl(item);
    if (!baseUrl) return '';

    const attachmentName = sanitizeAttachmentName(item.slug || item.title);
    // Use fl_attachment without quality compression or resizing to preserve original file quality
    return injectTransform(baseUrl, `fl_attachment:${attachmentName}`);
  },

  getDirectUrl(item: ImageItem): string {
    if (item.url && /^https?:\/\//i.test(item.url)) {
      return item.url;
    }

    const cloudName =
      CLOUDINARY_CLOUD_NAME ||
      (item.url ? extractCloudNameFromUrl(item.url) : '');

    if (cloudName && item.publicId) {
      const ext = item.format ? `.${item.format.toLowerCase()}` : '';
      const hasExt = /\.[a-z0-9]+$/i.test(item.publicId);
      return `https://res.cloudinary.com/${cloudName}/image/upload/${item.publicId}${
        hasExt ? '' : ext
      }`;
    }

    return item.url || '';
  },
};
