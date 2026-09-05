import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

/** Simple multi-photo picker with previews (client-side only until submit). */
export function PhotoUpload({
  files,
  onChange,
  max = 6,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith('image/'));
    onChange([...files, ...incoming].slice(0, max));
  };

  const remove = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <span className="field-label">Photos (up to {max})</span>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {files.map((f, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-white/15">
            <img src={URL.createObjectURL(f)} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1 top-1 rounded-full bg-brand-black/80 p-1 text-white hover:text-brand-cyan"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        ))}
        {files.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-white/25 text-brand-white/50 hover:border-brand-cyan hover:text-brand-cyan"
          >
            <ImagePlus size={22} aria-hidden />
            <span className="text-[0.65rem]">Add photo</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => add(e.target.files)}
      />
      <p className="mt-2 text-xs text-brand-white/45">
        Photos are optional but help us value your car faster. Large images are compressed automatically.
      </p>
    </div>
  );
}
