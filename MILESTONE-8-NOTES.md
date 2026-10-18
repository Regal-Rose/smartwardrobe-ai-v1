# Milestone 8 — Personalised Outfit Recommendation Engine

## What's new
- Recommendations are ranked instead of returning the first combinations encountered.
- Ranking considers requested occasion, season fit, colour-family harmony, garment tags, preferred styles, favourite colours, preferred categories, common occasions, and seasonal preferences.
- Results include an explainable match percentage and up to three human-readable reasons.
- Western, Indian ethnic, saree/lehenga/sherwani, and fusion combinations are supported by the deterministic rules engine.
- Duplicate garment combinations are removed and the top results preserve some style diversity.
- Discover reads saved user preferences and passes them to the recommendation engine.
- Existing HTTP authentication, backend persistence, garment CRUD/upload flow, and saved-outfit account isolation remain unchanged.

## Transparency
This is a deterministic, explainable recommendation engine, not a trained machine-learning model and it does not call an external AI API. The percentage is a heuristic ranking score, not a calibrated probability that an outfit is objectively correct.

## Run
Use the same commands and environment as Milestone 6. The API and app routes have not changed.

## Verification
- Backend account-isolation test suite: 4 passed.
- Frontend production build: not verified in this environment because dependency installation did not complete; run `npm ci` and `npm run build` locally before deployment.

## Quick manual check
1. Add a few tops, bottoms, footwear, and accessories, including different colours.
2. Set preferred styles, favourite colours, and common occasions in Style Preferences.
3. Open Discover, generate outfits for an occasion, and verify match scores/reasons appear.
4. Change preferences and regenerate; ranking should respond to the saved preferences.
5. Save an outfit, refresh, and confirm it remains in Saved Outfits.

### Fusion pairing fix
- Added explicit cross-category combinations for Indian kurtas/kurtis with Western bottoms (e.g. jeans/trousers), so the classic kurta + denim fusion look is generated even when the kurta is stored under `indian-ethnic` rather than `tops` or `fusion`.
