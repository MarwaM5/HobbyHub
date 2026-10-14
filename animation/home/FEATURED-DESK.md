# Featured activities — The Creator's Desk

Four individual generated cover images replace repeated islands. Class cards use polaroid paper, Event cards use ticket edges and Training cards use notebook binding. Existing names, prices, featured selection and activity destinations remain intact. Covers load lazily. Paper/light interactions work with any image rather than assuming a particular hobby or a hardcoded activity ID.

## Future administrator image flow

The frontend consumes the existing activity fields plus optional `imageUrl`:

```json
{
  "id": "advertiser-class-42",
  "title": "A class added by the administrator",
  "type": "Class",
  "priceJod": 15,
  "isFeatured": true,
  "imageUrl": "/uploads/activities/cover-42.webp"
}
```

Later, the MVC administrator form can accept an image upload and a show-on-Home selection. The server saves the image file, stores its URL with the activity and returns the fields above. `getFeaturedActivities()` currently uses mock records; replacing its source with backend data should preserve this presentation contract. Upload handling, permissions, paid promotion/commission records and any featured scheduling belong to the later backend work and are not implemented here.

`shared/js/activity-media.js` accepts project-relative local assets, server-root upload paths and HTTP(S) cover URLs. Missing/rejected sources and load failures receive a neutral room cover; a failed fallback hides the broken image while the activity name and link remain usable. `pages/home/home.js` renders the cover from the returned record. The decorative scene does not search the global mock activity array to replace it.

## Assets and modules

- `animation/assets/featured-photography.webp`
- `animation/assets/featured-watercolor.webp`
- `animation/assets/featured-nature.webp`
- `animation/assets/featured-weekend.webp`
- `animation/home/featured-desk.js` and `featured-desk.css`
- Full built-in ImageGen prompts: `FEATURED-ART-PROMPTS.md`

Images are original generated illustrative promotional covers, not photographs of real scheduled classes. Original PNGs are retained in the Codex generated-images folder; project WebP versions preserve the composition. No existing artwork is overwritten.

## Validation

DOM simulations cover a new advertiser record, local/upload/CDN covers, missing or broken images, preservation of titles/prices/routes, three paper styles, keyboard/pointer interactions, reduced-motion styles, viewport/hidden-page pause and cleanup. Full application simulation also checks the approved Hero, How It Works, categories and auth validation. Static scope/resource checks confirm that other pages and approved scenes are unchanged. Browser appearance and GPU performance have not been measured.
