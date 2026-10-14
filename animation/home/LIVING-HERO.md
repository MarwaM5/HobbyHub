# Living Hero revision

Scope: the Home hero only. The existing ornate portal/world artwork is retained. All lower Home sections, Login, Signup, shared theme, navigation, links and form behavior remain as before this revision.

The previous pale procedural meshes were removed from the hero construction. The replacement props are detailed, colorful **rendered 3D cutouts** on perspective-transformed layers. These are image-based VFX layers, not volumetric interactive models. This intentional change matches the provided camera/guitar/plant art direction more closely than the simple geometry did.

## Story

- On each page load, the gilded double door is initially closed. From roughly 0.6 seconds, its leaves swing open in perspective and a warm flare reveals the moving spiral.
- From roughly 1.05 seconds, tools emerge in staggered curved paths; the scene settles at approximately 3.3 seconds. Fast scrolling completes the entrance without holding up navigation.
- Ambient motion runs without pointer input: the portal breathes and glows; the vortex flows; props drift; the camera gets a moving lens reflection; the guitar gets a subtle string shimmer. The motion amplitude and speed have been softened.
- Scroll adds a small second wave of distinct props and moves them outward along curved paths. Desktop has 16 main props plus 4 scroll props; mobile has 10 plus 2. Flying plants and repeated tiles are removed. Pointer parallax is optional.
- Reduced motion shows the open portal and settled props without continuous movement. Visibility and navigation cleanup stop the frame loop.

`living-hero.js` owns this timeline and the canvas spiral. `living-hero.css` owns its styles. The shared WebGL engine remains in use by the existing book and auth scenes. `home-animation.js` retains all lower-section behavior and mounts this hero controller instead of the former mesh scene.

The door/vortex share the measured source-art opening centered at (1250, 372), sized 264 × 470 in the 1672 × 941 image. Object-fit cropping is included in the mapping. The leaf backgrounds compensate for transparent image margins, and disappear once fully opened so no backward-facing red strips remain beside the stone pillars.

Assets generated with the built-in ImageGen tool and encoded locally as WebP with alpha preserved:

- `animation/assets/living-hobby-atlas.webp`: 6 × 4 cutout atlas: camera, guitar, palette, plant, book, yarn, vase, headphones, controller, compass, tent, cooking pot, coffee, chess, sports ball, embroidery, oud, photo, brush, notebook, botanical sprig, star, cupcake, dumbbell. The generated sports ball is an American football, so its tile is excluded from the hero because HobbyHub's football data refers to soccer.
- `animation/assets/living-door.webp`: carved coral/gold double leaves, split into halves by CSS. The original stone portal remains unchanged behind them.

The atlas prompt requested separate square cells, authentic transparent backgrounds, realistic leather/wood/glass/ceramic materials, rich coral/orange/sage colors and golden rim lighting matching the supplied fantasy moodboard, with no humans. The door prompt requested an isolated, front-facing, closed, arched pair of carved coral-oak leaves with botanical gold inlays and brass fittings, with no surrounding stone frame. Original generated PNGs remain in Codex's generated-images folder; the website consumes these two project-local WebP files.

## Checks

The supplied 27.97-second recording was inspected through twelve evenly distributed frames. It confirmed the original washed-out left overlay, oversized pale props, and static portal.

Automated checks cover the new automatic opening, no-input ambient life, vortex drawing calls, second-wave release, finite transforms, mobile object counts, live reduced-motion preference changes, cleanup, preserved controls/routes, local assets, and unchanged files outside the hero scope. These are DOM/canvas simulations and static checks. **The revised page has not been visually tested in a real browser**; frame rate, computed positioning and the final composited appearance still require browser inspection. No new-site screenshot or browser QA is claimed.
