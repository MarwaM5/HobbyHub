# Community Village and living memories

`community-village.js` wraps the existing four community dioramas without changing their names or destinations. The scene uses a connected three-bridge graph and lights the paths adjacent to the selected community on pointer or keyboard focus. Each home has a small warm lamp, with music notes, garden leaves or reading light. The artwork and labels use intrinsic layout so signs stay outside the houses and adapt to wrapped names. Tablet uses pairs; mobile uses a vertical trail.

No new images are generated. The approved diorama atlas and plant sprite are reused. The old frontend-demo footnote is removed from the public scene.

The original memory markup, imagery, copy, paper angles and spacing are preserved. Added perspective and a slow pin-origin sway give the paper a small forward/backward movement. Both scenes pause while hidden or offscreen and show static artwork for reduced motion. No new buttons, stored state, backend behavior or routes are added.

The Hero, How It Works, Explore by Category, Featured Desk, FAQ and final book remain unchanged. Validation covers the connected bridge graph, desktop/tablet/mobile geometry, focus/hover, community links/captions, memory-content preservation, visibility, fallbacks and cleanup in DOM simulations. Full application simulation also checks previous scenes and auth behavior. Browser appearance and GPU performance have not been measured.
