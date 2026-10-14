# HobbyHub — the warm 3D hobby world

**Hero revision:** Home now uses the richer rendered-prop composition documented in [home/LIVING-HERO.md](home/LIVING-HERO.md). Its previous pale procedural hero meshes are no longer constructed. Native Three.js models remain in the unchanged book and authentication scenes. The notes below describe the original world architecture; the linked revision document takes precedence for the hero.

The rejected flat SVG animation has been removed. This implementation is isolated to Home, Login, and Signup. The shared navbar, footer, member pages, palette, and form business logic are unchanged.

## What is genuinely 3D, and what is artwork?

- The moving cameras, guitars, palettes, brushes, books, plants, pottery, yarn, headphones, photographs, and controllers are original **Three.js meshes**. They have geometry, material roughness, metallic highlights, world-space depth, and perspective. Pointer input is smoothed over time, and scroll paths move objects toward the camera as well as across the scene.
- The ornate portal landscape, tiny hobby islands, artist room, and richly illustrated magical book are **generated 3D-render-style artwork**. They are not live geometric environments. They provide the detailed art direction, layered with the live WebGL foreground.
- Category cards and the book/door cover use CSS perspective transforms. The category/island illustrations use the six-cell transparent diorama atlas. These are dimensional image layers, not interactive 3D models of whole islands.

This approach keeps the visual richness of the references while limiting GPU cost and preserving the existing static HTML architecture.

## Files and integration

- `home/`, `login/`, `signup/`: separate HTML scene sources, CSS, and JavaScript for each page.
- `shared/models.js`: original model factories and shared materials.
- `shared/world.js`: WebGL lighting/environment setup, frame scheduling, spring-smoothed input, visibility, reduced motion, resource disposal, and card tilt.
- `shared/auth-scene.*`: the two related artist-room scenes and focus feedback.
- `assets/`: four local WebP assets; genuine alpha preserved for the atlas and book. See `ASSET-PROMPTS.md` for their generation prompts.
- `vendor/three-r160.min.js`: locally bundled Three.js 0.160.1, with its MIT license alongside it.
- `sync-scenes.py`: **development-only** scene embedding. No Python, fetch, backend, or build step is needed to run the site.

Only four pre-existing files changed: `pages/home/home.html`, `pages/home/home.js`, `pages/login/login.html`, and `pages/signup/signup.html`. Home JavaScript adds one readiness event after its existing rendering finishes. The original auth scripts, field rules, toggle buttons, password-help dialog, category routes, featured activity information, and CTA routes remain in place.

Scene sources are embedded between `HH_SCENE:…:START/END` comments in the actual page HTML. To update embedded markup after editing a scene source:

```text
python animation/sync-scenes.py
```

The original empty `pages/home/animation/homeAnimation.*` placeholders are no longer loaded. There is no external model/image request at runtime. Bootstrap and fonts retain their existing setup.

## Behavior and fallback

The desktop hero has a short sticky scroll journey. Mobile/tablet scroll naturally and mobile creates fewer live models. The final book's WebGL layer initializes only as it approaches the viewport. Render loops pause outside the viewport and when the tab is hidden. GPU pixel ratio is capped; geometries/materials/listeners are released on navigation. BFCache navigation retains the scenes.

Reduced-motion users get complete static content without continuous animation. If WebGL is unavailable, the rich artwork, content, forms, and links remain available. Decorative canvases never intercept input. The native pointer remains recognizable; the small light aura is additive and is disabled for coarse pointers and reduced motion.

There are no existing verified testimonials in the project. The memory wall contains creative starting prompts, not fabricated people, ratings, success stories, or membership claims. Community labels come from the existing hobby data. Featured activities keep their original data and prices; the new illustrations are decorative, not purported class photographs.

## Dependencies

Three.js is the only new runtime library. It is bundled locally rather than loaded through an ES-module request, preserving compatibility with the project's classic scripts and local HTML workflow. The upstream r160 UMD build prints an informational deprecation warning; its license and source are preserved without edits. [Three.js documentation](https://threejs.org/docs/) and [pinned package](https://www.npmjs.com/package/three/v/0.160.1).

## Verification and limits

Verified: existing control/field attributes, IDs and routes; four-file scope; local HTML/CSS assets; JavaScript syntax and CSS block structure; repeatable source synchronization; removal of the rejected SVG implementation; finite real geometry/normals/bounds for all 14 factories; application/animation integration in a simulated DOM and renderer; scroll transforms at desktop/tablet/mobile settings; reduced-motion changes; no-WebGL fallback; cleanup; original Login and Signup validation/toggles/dialog/checklist; visual inspection of generated artwork and model shapes.

**Not verified in a real browser:** WebGL shader compilation/appearance, frame rate, computed responsive layout, live scroll timing, touch behavior, or browser console errors. Browser preview remains blocked by the session's local-file security policy. The renderer simulation and model-shape preview are not GPU/browser tests. No claim of completed browser visual QA is made.
