# Login / Signup — the studio companion

Both authentication pages use the original form controls, IDs, names, autocomplete, ARIA references, validation scripts, submit behavior, password toggles, Forgot password dialog and routes. No credentials are stored or sent by this decorative feature. The Home page and all other pages are unchanged.

## Layout

`hobby-studio.css` loads last and scopes its compact layout to Login and Signup. Desktop panels use reduced padding, 44px fields, a two-column Signup field layout and a full-width password guide. The guide's existing nodes are moved below the password/confirm pair without changing their IDs or attributes. Empty error nodes do not reserve blank height. The shell has an intrinsic height and a viewport-aware minimum, so errors can expand naturally rather than being clipped. Normal desktop layouts target a complete default form at 100% zoom. The footer remains below the main viewport. Narrow/mobile layouts use a short illustrated header and keep normal document scrolling, including when a keyboard is open.

## Interaction

`hobby-studio.js` reacts to the original form's focus, input, type/ARIA/error changes and existing notices. It does not reproduce or replace the validators:

- Public-field typing turns the cat and camera slightly toward the form.
- Password and confirm-password focus show both paws over the eyes.
- The existing Show password toggle selects the one-eye peek pose.
- Existing validation errors select the confused pose and a brief gentle head motion. Password privacy takes priority while a password field is focused.
- The four existing Signup rule indicators control four warm glints.
- Existing valid submit notices select the happy pose; this is not a claim that backend authentication succeeded.
- Idle blink, breathing, light and brush motion pause offscreen or while the page is hidden. Reduced motion preserves meaningful privacy/error poses with no continuous motion.

The decorative controller never reads password content. Public input length is used only for a local look direction; no value is echoed into the scene. All speech is fixed text. The art consists of six matching rendered cat poses with brief crossfades, not a skeletal 3D model.

The old procedural WebGL scene scripts are no longer loaded by these two pages. Their files remain available; the Home's dependencies are unchanged.

## Artwork

- `animation/assets/studio-cat-poses.webp`: 1536 × 1024, 3 × 2 pose atlas, alpha preserved.
- `animation/assets/studio-login-room.webp`: 1086 × 1448, sunset window studio.
- `animation/assets/studio-signup-room.webp`: 1086 × 1448, open creative courtyard door.

Generated with the built-in ImageGen tool. Original PNGs retained in Codex; WebP conversion changes format only. Full prompts are in `STUDIO-ART-PROMPTS.md`.

## Validation

Static checks compare every original input/button/form/link attribute and ID, confirm both validation scripts are byte-for-byte unchanged, verify local resources and enforce auth-only scope. DOM simulations execute the real validators, password toggles, Forgot password flow and submit notices. Studio tests cover curiosity/error/privacy/peek/happy poses, a brief blink, no decorative password reads, four rule glints, hidden/reduced-motion behavior and cleanup. CSS/JS parsing passes. Actual browser layout/animation rendering has not been measured and should be reviewed at 100% zoom.
