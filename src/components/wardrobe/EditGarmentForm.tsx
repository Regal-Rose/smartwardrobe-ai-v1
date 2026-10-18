import { useState, type FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import type { Garment, GarmentUpdateInput, GarmentCategory, GarmentSubcategory, StyleType, GarmentColor, Season, Occasion } from '../../types';
import { CATEGORIES, STYLE_LABELS, COLOR_LABELS, SEASON_LABELS, OCCASION_LABELS } from '../../types';

interface EditGarmentFormProps {
  garment: Garment;
  onSave: (input: GarmentUpdateInput) => Promise<void>;
  onCancel: () => void;
}

export function EditGarmentForm({ garment, onSave, onCancel }: EditGarmentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(garment.name);
  const [category, setCategory] = useState<GarmentCategory>(garment.category);
  const [subcategory, setSubcategory] = useState<GarmentSubcategory>(garment.subcategory);
  const [style, setStyle] = useState<StyleType>(garment.style);
  const [color, setColor] = useState<GarmentColor>(garment.color);
  const [season, setSeason] = useState<Season>(garment.season);
  const [occasions, setOccasions] = useState<Occasion[]>(garment.occasions);
  const [tags, setTags] = useState(garment.tags.join(', '));
  const [notes, setNotes] = useState(garment.notes);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentCategory = CATEGORIES.find((c) => c.value === category);
  const subcategoryOptions = currentCategory?.subcategories || [];

  const toggleOccasion = (occ: Occasion) => {
    setOccasions((prev) =>
      prev.includes(occ) ? prev.filter((o) => o !== occ) : [...prev, occ]
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (occasions.length === 0) errs.occasions = 'Select at least one occasion.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSave({
        id: garment.id,
        name: name.trim(),
        category,
        subcategory,
        style,
        color,
        season,
        occasions,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: notes.trim(),
      });
    } catch {
      setErrors({ name: 'Failed to save changes. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Garment Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
        id="edit-garment-name"
      />

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
            setSubcategory('' as GarmentSubcategory);
          }}
          id="edit-garment-category"
        />
        <Select
          label="Subcategory"
          options={subcategoryOptions.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value as GarmentSubcategory)}
          disabled={!category}
          id="edit-garment-subcategory"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Style"
          options={Object.entries(STYLE_LABELS).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
          value={style}
          onChange={(e) => setStyle(e.target.value as StyleType)}
          id="edit-garment-style"
        />
        <Select
          label="Primary Colour"
          options={Object.entries(COLOR_LABELS).map(([k, v]) => ({
            value: k,
            label: v,
          }))}
          value={color}
          onChange={(e) => setColor(e.target.value as GarmentColor)}
          id="edit-garment-color"
        />
      </div>

      <Select
        label="Season"
        options={Object.entries(SEASON_LABELS).map(([k, v]) => ({
          value: k,
          label: v,
        }))}
        value={season}
        onChange={(e) => setSeason(e.target.value as Season)}
        id="edit-garment-season"
      />

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

      <Input
        label="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="e.g. casual, cotton, summer"
        id="edit-garment-tags"
      />

      <div className="space-y-1.5">
        <label htmlFor="edit-garment-notes" className="block text-sm font-medium text-ink-light">
          Notes
        </label>
        <textarea
          id="edit-garment-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm text-ink bg-surface border border-border rounded-lg placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-border-light">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
