# The Curiosity Trail

Four decorative scenes enhance the original How It Works links and descriptions. The existing data service, routes, step copy, Hero, forms and other sections are preserved.

- Discover: brass magnifier searches camera, guitar and palette with a matching hobby label.
- Learn: a separate brush traces a small landscape onto the easel canvas.
- Connect: the complete three-island illustration settles gently; three warm curved bridges connect every island.
- Grow: a small plant gives way to a creative tree with hanging achievements.

All visible scenes begin together without a stagger. Narrow layouts reveal each scene on entry. The timeline pauses when the page is hidden or scenes are offscreen and stops after completion. Reduced motion shows the completed scenes. No database, storage, remote animation library or new functional route is used.

Scene controller: `trail-story.js`; scoped styles: `trail-story.css`. Raster artwork: `../assets/curiosity-trail.webp` (1536 × 1024, alpha-preserving WebP). The imagery is a rendered illustration with separately animated layers, rather than volumetric 3D models.

Validation uses DOM/timeline simulations and static resource checks. Browser rendering and device frame rate have not been measured.

The Connect sprite includes its 12% overhang at unchanged image scale; Grow excludes that same strip so the island cannot reappear with the tree. No replay control is displayed.
