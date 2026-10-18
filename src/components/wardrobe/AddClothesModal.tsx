import { useState, useRef, type FormEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { GarmentCreateInput, GarmentCategory, GarmentSubcategory, StyleType, GarmentColor, Season, Occasion } from '../../types';
import { CATEGORIES, STYLE_LABELS, COLOR_LABELS, SEASON_LABELS, OCCASION_LABELS } from '../../types';

interface AddClothesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (input: GarmentCreateInput) => Promise<void>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface FormErrors {
  name?: string;
  category?: string;
  subcategory?: string;
  style?: string;
  color?: string;
  season?: string;
  occasions?: string;
  image?: string;
}

export function AddClothesModal({ isOpen, onClose, onAdd }: AddClothesModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GarmentCategory | ''>('');
  const [subcategory, setSubcategory] = useState<GarmentSubcategory | ''>('');
  const [style, setStyle] = useState<StyleType | ''>('');
  const [color, setColor] = useState<GarmentColor | ''>('');
  const [season, setSeason] = useState<Season | ''>('');
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  const currentCategory = CATEGORIES.find((c) => c.value === category);
  const subcategoryOptions = currentCategory?.subcategories || [];

  const handleFileSelect = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Please upload a JPEG, PNG or WebP image.' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, image: 'Image must be under 10 MB.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
    try {
      // Downsize photos before storing them in SQLite as a data URL. This keeps
      // uploads quick and avoids huge database payloads from modern phone photos.
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('Could not read this image.'));
        reader.readAsDataURL(file);
      });
      const compressed = await new Promise<File>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const maxSide = 1400;
          const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext('2d');
          if (!context) { reject(new Error('Could not process this image.')); return; }
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Could not process this image.')); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.82);
        };
        image.onerror = () => reject(new Error('This image could not be opened.'));
        image.src = dataUrl;
      });
      setImageFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      setErrors((prev) => ({ ...prev, image: 'Could not process this image. Please choose another photo.' }));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!category) errs.category = 'Select a category.';
    if (!subcategory) errs.subcategory = 'Select a subcategory.';
    if (!style) errs.style = 'Select a style.';
    if (!color) errs.color = 'Select a colour.';
    if (!season) errs.season = 'Select a season.';
    if (occasions.length === 0) errs.occasions = 'Select at least one occasion.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setSubcategory('');
    setStyle('');
    setColor('');
    setSeason('');
    setOccasions([]);
    setTags('');
    setNotes('');
    clearImage();
    setErrors({});
    setSuccessMessage('');
    setIsDragging(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onAdd({
        name: name.trim(),
        category: category as GarmentCategory,
        subcategory: subcategory as GarmentSubcategory,
        style: style as StyleType,
        color: color as GarmentColor,
        season: season as Season,
        occasions,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: notes.trim(),
        imageFile,
      });
      setSuccessMessage(`"${name}" has been added to your wardrobe!`);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch {
      setErrors((prev) => ({ ...prev, name: 'Failed to add garment. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleOccasion = (occ: Occasion) => {
    setOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add to Wardrobe" maxWidth="max-w-2xl">
      {successMessage ? (
        <div className="py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-ink">{successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Garment Photo
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-36 h-48 object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center hover:bg-danger transition-colors"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) void handleFileSelect(file); }}
                className={`w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition-colors ${isDragging ? 'border-[#3155D9] bg-[#3155D9]/5 text-[#3155D9]' : 'border-border text-ink-muted hover:border-sage hover:text-sage-deep'}`}
              >
                <Upload size={24} />
                <span className="text-sm">Click or drop a photo here</span>
                <span className="text-xs">JPEG, PNG, WebP · max 10 MB · resized automatically</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileSelect(file);
                e.currentTarget.value = ''; 
              }}
              aria-label="Upload garment image"
            />
            {errors.image && (
              <p className="text-xs text-danger mt-1">{errors.image}</p>
            )}
          </div>

          {/* Name */}
          <Input
            label="Garment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Blue Cotton Kurta"
            error={errors.name}
            required
            id="garment-name"
          />

          {/* Category + Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              options={CATEGORIES.filter((c) => c.value !== 'all').map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as GarmentCategory);
                setSubcategory('');
              }}
              placeholder="Select category"
              error={errors.category}
              id="garment-category"
            />
            <Select
              label="Subcategory"
              options={subcategoryOptions.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value as GarmentSubcategory)}
              placeholder="Select type"
              error={errors.subcategory}
              disabled={!category}
              id="garment-subcategory"
            />
          </div>

          {/* Style + Colour */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Style"
              options={Object.entries(STYLE_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
              value={style}
              onChange={(e) => setStyle(e.target.value as StyleType)}
              placeholder="Select style"
              error={errors.style}
              id="garment-style"
            />
            <Select
              label="Primary Colour"
              options={Object.entries(COLOR_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
              value={color}
              onChange={(e) => setColor(e.target.value as GarmentColor)}
              placeholder="Select colour"
              error={errors.color}
              id="garment-color"
            />
          </div>

          {/* Season */}
          <Select
            label="Season"
            options={Object.entries(SEASON_LABELS).map(([k, v]) => ({
              value: k,
              label: v,
            }))}
            value={season}
            onChange={(e) => setSeason(e.target.value as Season)}
            placeholder="Select season"
            error={errors.season}
            id="garment-season"
          />

          {/* Occasions */}
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1.5">
              Occasions
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(OCCASION_LABELS) as [Occasion, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleOccasion(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200
                      ${
                        occasions.includes(key)
                          ? 'bg-sage text-white border-sage'
                          : 'bg-surface text-ink-light border-border hover:border-sage hover:text-sage-deep'
                      }
                    `}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
            {errors.occasions && (
              <p className="text-xs text-danger mt-1">{errors.occasions}</p>
            )}
          </div>

          {/* Tags */}
          <Input
            label="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. casual, cotton, summer"
            hint="Optional — helps organise your wardrobe"
            id="garment-tags"
          />

          {/* Notes */}
          <div className="space-y-1.5">
            <label
              htmlFor="garment-notes"
              className="block text-sm font-medium text-ink-light"
            >
              Notes
            </label>
            <textarea
              id="garment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this garment..."
              rows={2}
              className="w-full px-3 py-2 text-sm text-ink bg-surface border border-border rounded-lg placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border-light">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              <ImageIcon size={14} />
              Add to Wardrobe
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
