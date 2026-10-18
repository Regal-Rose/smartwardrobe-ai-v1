# SmartWardrobe AI — Editorial UI Refresh (Frontend)

This refresh keeps the existing React/Vite app structure and current auth/routes/repository integration. It focuses on a more considered editorial fashion direction rather than generic AI-dashboard styling.

## Changes
- Redesigned app sidebar navigation with a quieter warm-neutral treatment and clearer hierarchy.
- Redesigned top bar typography and page context.
- Updated garment cards to a magazine-like grid with cleaner labels, photo-first hierarchy, and subtle hover affordance.
- Updated wardrobe category filters, search styling, page heading, and colour tokens to warm chalk, deep pine, and terracotta.
- Kept existing data and interaction logic intact.

## Files changed
- `src/index.css`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Header.tsx`
- `src/components/wardrobe/GarmentGrid.tsx`
- `src/pages/WardrobePage.tsx`

## Run locally
1. Unzip the folder.
2. Open a terminal in `smartwardrobe-ai`.
3. Run `npm install`.
4. Ensure your `.env` values are preserved, especially `VITE_API_BASE_URL` and `VITE_DATA_MODE` according to your teammate's backend/API setup.
5. Run `npm run dev`.

## Important
This is a frontend visual refresh only. No backend/API contract or authentication behavior was intentionally changed. Build verification in this environment could not complete because the existing local `node_modules` is missing `vite/client` and Node type definitions and reports a TypeScript `ignoreDeprecations` configuration error. Reinstall dependencies with `npm install` and run `npm run build` locally; share any resulting error if it remains.
