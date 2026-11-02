# Hobby Discovery frontend contract

## Files

- `shared/js/discovery-data.js`: the approved question and hobby fixtures, including stable question/answer/hobby IDs and editable practical characteristics.
- `shared/js/discovery-engine.js`: pure answer validation and individual recommendation rules. No DOM, storage or network access.
- `shared/js/discovery-service.js`: defensive copies and validated in-memory changes; filters archived hobbies and unlinked question drafts.
- `pages/hobbyDiscovery/discoveryFlow/quiz/quiz.js`: the authenticated quiz controller, also mountable inside the admin preview. Existing shared navigation and profile handoff remain in use.
- `admin/catalog/discovery-editor.js`: question content, fixed answer meanings, interest/hobby mappings and first-try descriptions. Linked questions cannot be deleted until reassigned. Context question IDs/types remain stable because the practical rules depend on them.

## Frontend boundaries

Answers, new discovery edits and preview saves use memory only. The existing profile URL handoff carries saved canonical hobby IDs between user pages, without localStorage or sessionStorage. Reloading resets in-memory edits.

The quiz and catalog pages do not load the unrelated temporary booking/payment demo adapter. Elsewhere the earlier booking/payment demo remains unchanged, except that its saved arrays no longer include the retired quiz questions. New discovery configuration is never written to that adapter.

Admin **Preview quiz** uses the same controller and current in-memory model as the user quiz. It allows immediate review of edits without pretending that frontend changes publish to another document. Cross-page publishing requires the future backend. Never use query-string preview data as authentication or trusted payment state.

## Rules and scope

- 17 interest prompts, two per screen, then six practical questions in the baseline fixtures. Counts are derived from the active model.
- Up to three individual hobbies. No percentage, scientific validation or accuracy claim. Unknown is not rejection. Strong candidates are not padded with weaker ones just to fill three slots.
- Equal support is explicitly described; stable ID order does not imply measured preference.
- Budget currently changes practical advice and displays tools/access for no-spend starts; verified complete local prices are not available for budget ranking.
- Canonical IDs are preserved, including `modernDance` and `accessoriesHandicrafts`. Their current discovery scopes are **Freestyle dance** and **Beaded accessories**. Existing activity or historical goal descriptions are not rewritten.
- Added hobbies require a description, first step, required tools/access, main interest question and practice schedule. Additional related interests are optional.
- Categories remain managed by the existing catalog editor. A new category alone does not imply new quiz scoring; map its hobbies explicitly.

## Future MVC integration

Replace fixture reads and memory-only commands with server endpoints/service calls while preserving stable IDs and schema version. Load one validated discovery model for user and admin. Save canonical hobby IDs into the authenticated user's profile server-side; do not trust the frontend login marker or preview URL.

Retired `hobbyQuizQuestions` is an empty compatibility array for legacy shared service calls. It contains no old questions and is not used by the new quiz/editor. The old numeric `quizProfile` fixture properties have been removed. Hobby View shows human-readable discovery details instead.

## Verification

Automated verification covers pure rule consistency (including 2,000 seeded answer sets), integrated quiz progression/review, save toggles, profile ID handoff, admin edits, new question/hobby mapping and live preview in a DOM simulation. This does not replace visual browser checks or establish real-user recommendation accuracy.
