import { useState } from 'react';
import { Pencil, Trash2, Calendar, Tag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EditGarmentForm } from './EditGarmentForm';
import type { Garment, GarmentUpdateInput } from '../../types';
import {
  STYLE_LABELS,
  SEASON_LABELS,
  OCCASION_LABELS,
  COLOR_LABELS,
  COLOR_HEX,
} from '../../types';

interface GarmentDetailProps {
  garment: Garment;
  onClose: () => void;
  onUpdate: (id: string, input: GarmentUpdateInput) => Promise<Garment>;
  onDelete: (id: string) => Promise<void>;
}

export function GarmentDetail({
  garment,
  onClose,
  onUpdate,
  onDelete,
}: GarmentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(garment.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <Modal
        isOpen
        onClose={() => setIsEditing(false)}
        title={`Edit — ${garment.name}`}
        maxWidth="max-w-2xl"
      >
        <EditGarmentForm
          garment={garment}
          onSave={async (input) => {
            await onUpdate(garment.id, input);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} maxWidth="max-w-3xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="md:w-2/5 shrink-0">
          <div className="aspect-[3/4] bg-ivory-warm rounded-xl overflow-hidden">
            <img
              src={garment.imageUrl}
              alt={garment.name}
              className="garment-image w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,' +
                  encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" fill="none"><rect width="300" height="400" fill="#FAF8F5"/><text x="150" y="200" text-anchor="middle" font-family="serif" font-size="14" fill="#B0B0B0">${garment.name}</text></svg>`
                  );
              }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-5">
          <div>
            <h2 className="heading-editorial text-2xl text-ink">
              {garment.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="sage">{STYLE_LABELS[garment.style]}</Badge>
              <Badge>{garment.subcategory.replace(/-/g, ' ')}</Badge>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-label block mb-0.5">Category</span>
              <span className="text-ink capitalize">
                {garment.category.replace(/-/g, ' ')}
              </span>
            </div>
            <div>
              <span className="text-label block mb-0.5">Colour</span>
              <span className="flex items-center gap-1.5 text-ink">
                <span
                  className="w-3 h-3 rounded-full border border-border-strong/50 inline-block"
                  style={{ background: COLOR_HEX[garment.color] || '#ccc' }}
                />
                {COLOR_LABELS[garment.color]}
              </span>
            </div>
            <div>
              <span className="text-label block mb-0.5">Season</span>
              <span className="text-ink">{SEASON_LABELS[garment.season]}</span>
            </div>
            <div>
              <span className="text-label block mb-0.5">Style</span>
              <span className="text-ink">
                {STYLE_LABELS[garment.style]}
              </span>
            </div>
          </div>

          {/* Occasions */}
          <div>
            <span className="text-label block mb-1.5">Occasions</span>
            <div className="flex flex-wrap gap-1.5">
              {garment.occasions.map((occ) => (
                <Badge key={occ} variant="warm">
                  {OCCASION_LABELS[occ]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          {garment.tags.length > 0 && (
            <div>
              <span className="text-label block mb-1.5">
                <Tag size={12} className="inline mr-1" />
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {garment.tags.map((tag) => (
                  <Badge key={tag} variant="muted">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {garment.notes && (
            <div>
              <span className="text-label block mb-1">Notes</span>
              <p className="text-sm text-ink-light">{garment.notes}</p>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Calendar size={12} />
            Added{' '}
            {new Date(garment.dateAdded).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border-light">
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              <Pencil size={14} />
              Edit
            </Button>
            {!showDeleteConfirm ? (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-danger hover:bg-danger-light"
              >
                <Trash2 size={14} />
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-danger">Are you sure?</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  loading={deleting}
                >
                  Confirm Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
