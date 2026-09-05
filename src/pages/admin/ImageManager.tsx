import { useRef, useState } from 'react';
import { ImagePlus, Star, Trash2, GripVertical, Loader2 } from 'lucide-react';
import type { VehicleImage } from '../../lib/types';
import { uploadVehicleImage, deleteVehicleImage } from '../../lib/storage';

/**
 * Multi-image manager: upload (auto-compressed to WebP), drag-to-reorder, set a
 * primary image, remove. Uploads happen immediately into the vehicle's storage
 * folder so `vehicleId` must be stable before the first upload.
 */
export function ImageManager({
  vehicleId,
  images,
  onChange,
}: {
  vehicleId: string;
  images: VehicleImage[];
  onChange: (images: VehicleImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const normalise = (list: VehicleImage[]): VehicleImage[] => {
    const ensured = list.length && !list.some((i) => i.isPrimary)
      ? list.map((i, idx) => ({ ...i, isPrimary: idx === 0 }))
      : list;
    return ensured.map((i, idx) => ({ ...i, sortOrder: idx }));
  };

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const start = images.length;
      const uploaded: VehicleImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const img = await uploadVehicleImage(
          vehicleId,
          files[i],
          start + i,
          start === 0 && i === 0
        );
        uploaded.push(img);
      }
      onChange(normalise([...images, ...uploaded]));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (index: number) => {
    const img = images[index];
    if (img.storagePath) await deleteVehicleImage(img.storagePath);
    onChange(normalise(images.filter((_, i) => i !== index)));
  };

  const setPrimary = (index: number) =>
    onChange(normalise(images.map((img, i) => ({ ...img, isPrimary: i === index }))));

  const onDrop = (index: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onChange(normalise(next));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="field-label mb-0">Photos</span>
        <span className="text-xs text-brand-white/40">Drag to reorder · click the star to set the main photo</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, index) => (
          <div
            key={img.storagePath || index}
            draggable
            onDragStart={() => (dragIndex.current = index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(index)}
            className={`group relative aspect-[4/3] overflow-hidden rounded-lg border ${
              img.isPrimary ? 'border-brand-cyan' : 'border-white/15'
            }`}
          >
            <img src={img.url} alt={`Vehicle photo ${index + 1}`} className="h-full w-full object-cover" />
            <span className="absolute left-1 top-1 rounded bg-brand-black/70 p-1 text-white/70">
              <GripVertical size={14} aria-hidden />
            </span>
            {img.isPrimary && (
              <span className="absolute bottom-1 left-1 rounded bg-brand-cyan px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-brand-black">
                Main
              </span>
            )}
            <div className="absolute right-1 top-1 flex gap-1">
              <button
                type="button"
                onClick={() => setPrimary(index)}
                aria-label="Set as main photo"
                className="rounded bg-brand-black/70 p-1 text-white hover:text-brand-cyan"
              >
                <Star size={14} className={img.isPrimary ? 'fill-brand-cyan text-brand-cyan' : ''} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remove photo"
                className="rounded bg-brand-black/70 p-1 text-white hover:text-red-400"
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/25 text-brand-white/50 hover:border-brand-cyan hover:text-brand-cyan"
        >
          {uploading ? <Loader2 className="animate-spin" size={22} aria-hidden /> : <ImagePlus size={22} aria-hidden />}
          <span className="text-xs">{uploading ? 'Uploading…' : 'Add photos'}</span>
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}
