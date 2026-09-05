import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { requireStorage } from './firebase';
import type { VehicleImage } from './types';

/**
 * Compress and convert an image to WebP in the browser before upload.
 * Keeps uploads small and fast, and avoids shipping multi-MB phone photos to
 * Storage. Falls back to the original file type if WebP encoding is unavailable.
 */
export async function compressToWebp(
  file: File,
  opts: { maxDimension?: number; quality?: number } = {}
): Promise<Blob> {
  const maxDimension = opts.maxDimension ?? 1600;
  const quality = opts.quality ?? 0.82;

  const bitmap = await loadBitmap(file);
  let { width, height } = bitmap;
  if (Math.max(width, height) > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality)
  );
  return blob ?? file;
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
  const blob = await compressToWebp(file);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const storagePath = `vehicles/${vehicleId}/${filename}`;
  const objectRef = ref(storage, storagePath);
  await uploadBytes(objectRef, blob, { contentType: 'image/webp' });
  const url = await getDownloadURL(objectRef);
  return { storagePath, url, sortOrder, isPrimary };
}

/** Upload a customer-supplied photo attached to a valuation/sourcing enquiry. */
export async function uploadEnquiryPhoto(file: File, folder: string): Promise<string> {
  const storage = requireStorage();
  const blob = await compressToWebp(file, { maxDimension: 1400, quality: 0.78 });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const objectRef = ref(storage, `enquiry-uploads/${folder}/${filename}`);
  await uploadBytes(objectRef, blob, { contentType: 'image/webp' });
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
