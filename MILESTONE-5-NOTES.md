# Milestone 5 — Outfit Studio + Discover

## Added
- Outfit cards in Discover now include an Edit action.
- Outfit Studio lets a user rename a generated/saved outfit and replace each existing piece with another garment from their own wardrobe.
- Saving from the editor persists through the configured outfit repository; in HTTP mode this uses the authenticated API.
- Saved Outfits detail modal now includes “Edit in Outfit Studio”, passing the selected saved outfit to Discover.
- After saving an edit, the updated outfit appears in the Discover results and is stored as saved.

## How to test manually
1. Start the backend and frontend using the commands in README.
2. Log in and add a few garments (Western and/or Indian ethnic).
3. Open Discover, select an occasion/style, and generate combinations.
4. Click the pencil icon on an outfit, change its name and swap one or more pieces, then click Save outfit.
5. Open Saved Outfits; confirm the outfit is there after refresh.
6. Open its details, click Edit in Outfit Studio, make another change, save, refresh, and reopen.
7. Log in with another account and confirm the saved outfits and wardrobe are account-specific.

## Notes / limitations
- Outfit suggestions remain deterministic category/occasion compatibility rules, not a trained AI model.
- This editor replaces existing pieces; adding/removing slots and image-based virtual try-on are not included in this milestone.
- The frontend production build could not be confirmed in this environment because dependency installation did not complete (the local `node_modules` lacked `vite/client` and `@types/node`). Backend tests were run separately and passed.
