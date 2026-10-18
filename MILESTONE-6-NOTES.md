# SmartWardrobe AI — Milestone 6

## Wardrobe and image-upload polish

- Added click-to-upload and drag-and-drop support for garment photos.
- Accepted JPEG, PNG and WebP source images up to 10 MB.
- Client-side image processing resizes large photos to a maximum 1400 px edge and stores a compressed JPEG to reduce data-URL/database payload size.
- Preview uses a temporary object URL; removing/resetting the photo revokes it.
- Wardrobe search now checks garment name, category, subcategory, style, colour, season, notes, tags and occasions (including hyphenated values such as `denim-jacket`).
- Added a backend regression test for metadata-based search.
- Kept existing authenticated HTTP repository, SQLite persistence and account-scoped garment CRUD.

## Verification

- `python -m pytest -q backend/tests`: **4 passed**.
- `npm run build`: could not be verified in this environment because the ZIP does not contain installed npm dependencies and `npm ci` did not complete within the environment timeout. Run `npm install` then `npm run build` locally before merging/deploying.

## Manual acceptance checklist

1. Add a garment with a JPEG, PNG or WebP photo, including by dragging the file into the upload area.
2. Confirm the preview appears and can be removed before saving.
3. Save the garment, refresh the page, and confirm the photo and metadata remain.
4. Search by garment name, colour, category, subcategory, tag and occasion.
5. Edit the garment/photo, then refresh and confirm the updated data persists.
6. Log into a second account and confirm the first account's garments are not visible.
