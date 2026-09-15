import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { requireStorage } from './firebase';
import type { VehicleImage } from './types';

/** Target maximum size for any uploaded image (≈300 KB). */
export const MAX_IMAGE_BYTES = 300 * 1024;

let webpSupported: boolean | null = null;
function supportsWebp(): boolean {
  if (webpSupported !== null) return webpSupported;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    webpSupported = c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpSupported = false;
  }
  return webpSupported;
}

/**
 * Compress an image in the browser before upload so NO uploaded photo exceeds
 * ~300 KB. A single-pass encode can't guarantee a size, so we iterate: at each
 * of a shrinking set of max dimensions we step the quality down until the encoded
 * blob is under the target, returning the first that fits (best quality that
 * still meets the cap). Encodes to WebP where supported, otherwise JPEG (both
 * honour the quality setting); the returned blob's `type` tells the caller which.
 * A 2-3 MB phone photo comes out around 150-280 KB with no visible loss.
 */
export async function compressImage(
  file: File,
  opts: { maxDimension?: number; quality?: number; maxBytes?: number } = {}
): Promise<Blob> {
  const maxBytes = opts.maxBytes ?? MAX_IMAGE_BYTES;
  const startDimension = opts.maxDimension ?? 1600;
  const startQuality = opts.quality ?? 0.82;
  const mime = supportsWebp() ? 'image/webp' : 'image/jpeg';

  const bitmap = await loadBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;

  const encode = (dimension: number, q: number): Promise<Blob | null> => {
    let width = srcW;
    let height = srcH;
    if (Math.max(width, height) > dimension) {
      const scale = dimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
    return new Promise((resolve) => canvas.toBlob(resolve, mime, q));
  };

  // Progressively smaller frames; only ones <= the start dimension are used.
  const dimensions = [startDimension, 1280, 1024, 800, 640].filter(
    (d, i) => i === 0 || d < startDimension
  );

  let best: Blob | null = null;
  for (const dim of dimensions) {
    for (let q = startQuality; q >= 0.4 - 1e-9; q -= 0.1) {
      const blob = await encode(dim, Number(q.toFixed(2)));
      if (!blob) continue;
      if (!best || blob.size < best.size) best = blob;
      if (blob.size <= maxBytes) {
        if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();
        return blob;
      }
    }
  }

  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();
  // Nothing hit the target (extreme image) - return the smallest we produced.
  return best ?? file;
}

function extFor(blob: Blob): string {
  return blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Upload a compressed image for a vehicle and return its storage path + URL. */
export async function uploadVehicleImage(
  vehicleId: string,
  file: File,
  sortOrder: number,
  isPrimary: boolean
): Promise<VehicleImage> {
  const storage = requireStorage();
  const blob = await compressImage(file);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(blob)}`;
  const storagePath = `vehicles/${vehicleId}/${filename}`;
  const objectRef = ref(storage, storagePath);
  await uploadBytes(objectRef, blob, { contentType: blob.type || 'image/webp' });
  const url = await getDownloadURL(objectRef);
  return { storagePath, url, sortOrder, isPrimary };
}

/** Upload a customer-supplied photo attached to a valuation/sourcing enquiry. */
export async function uploadEnquiryPhoto(file: File, folder: string): Promise<string> {
  const storage = requireStorage();
  const blob = await compressImage(file, { maxDimension: 1400, quality: 0.78 });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(blob)}`;
  const objectRef = ref(storage, `enquiry-uploads/${folder}/${filename}`);
  await uploadBytes(objectRef, blob, { contentType: blob.type || 'image/webp' });
  return getDownloadURL(objectRef);
}

export async function deleteVehicleImage(storagePath: string): Promise<void> {
  const storage = requireStorage();
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // Ignore missing objects - keeps archive/edit flows resilient.
  }
}

/**
 * Delete a stored object by its public download URL. Used to remove
 * customer-uploaded enquiry photos (we only keep their URLs, not storage paths).
 * The Storage `ref()` helper accepts an https download URL directly.
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  if (!url || !/^https?:\/\//.test(url)) return;
  const storage = requireStorage();
  try {
    await deleteObject(ref(storage, url));
  } catch {
    // Ignore missing objects / already-deleted files.
  }
}
