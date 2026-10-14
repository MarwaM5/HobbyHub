# Explore by Category — open hobby landscape

The existing six category anchors retain their IDs, destinations, names and hobby previews. Existing diorama and object artwork is reused. No new data model, storage or backend behavior is introduced.

`category-world.css` replaces rectangular cards with an open landscape. Large screens use six staggered islands in intrinsic rows that reserve the full height of artwork, text and links; tablets use staggered pairs; small screens alternate the artwork and text along a vertical journey. Paths are measured from the actual scene positions and updated after layout changes.

`category-world.js` decorates the existing nodes and manages pointer/keyboard focus, arrival effects, route drawing and cleanup. The original data service and Home rendering code are unchanged. Existing category tilt/reveal decorators are replaced to avoid competing transformations.

Each category has a distinct actor: drawing brush, guitar/music notes, compass, soccer ball, coffee steam, or chess piece. The illustrations float gently while visible. Actors animate continuously while visible, with additional lift on pointer or keyboard focus. No extra control/button is added. Offscreen and hidden scenes pause; reduced-motion users receive static art and visible paths.

Verification: DOM/timeline simulation covers all six destinations, content preservation, six distinct actors, desktop/tablet/mobile path coordinates, focus, visibility, fallbacks and cleanup. Fixed vertical placements and the decorative map sentence have been removed to prevent text overlap. Integration simulation also checks the approved Hero/How It Works and existing auth validation. CSS/JS parsing and local resources are checked. Browser appearance and device frame rate have not been measured.
