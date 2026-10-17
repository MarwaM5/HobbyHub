# HobbyHub Admin — frontend cycle

Open `admin/dashboard/dashboard.html` directly. No special email/password is needed. The public Login retains its form validation and navigates to the existing member Dashboard; a future server response will choose the authenticated role. Public demo credentials and the repeated preview/demo banners were removed at the owner's request.

## Seven modules

- Dashboard: operational/financial metrics derived from shared records, recent activity, quick-create actions and Contact inbox with read/archive/restore.
- Users: search/status filtering, add/edit, suspend/reactivate and related enrollment/payment/community/post/journey summaries.
- Hobbies & Quiz: category/hobby CRUD with dependency checks, all existing profile dimensions, question/option editing and reordering, shared recommendation helper.
- Activities: Classes/Events/Training CRUD, draft/publish/archive, image reference/local preview, Featured selection/fee field, commission override, Jitsi/Zoom/in-person details; Organizers tab with related activity/campaign/invoice/fee summaries.
- Communities: create/edit/archive/delete, related membership/post counts and hide/restore moderation. No reporting feature was invented.
- Enrollments & Payments: user payment details; manual payout/service-fee status; advertising campaign management; draft/edit/issue/paid/cancel invoice lifecycle. No real payments or transfers.
- Settings: eight theme tokens with reset, category tints, default commission, configurable ad packages, supported website copy/hero image, Featured selection, FAQ CRUD, contact information and static idea-template editing.

Each page has its own HTML, CSS and JS. The scoped shell handles navigation, tables, tabs, dialogs, confirmations, focus restoration and feedback. The manager handles reusable forms. Shared data remains in `shared/js/data.js`; commands and queries are in `shared/js/dataService.js`. The quiz calculation is in `shared/js/hobby-matching.js`.

Load order: Bootstrap → data → dataService → utils → components → admin-shell → admin-manager → page controller. No new storage, fetch or module loading was added.

## Prototype boundaries / future MVC work

All edits are in memory in the current document and reset on navigation/refresh. Contact submits through a shared service contract and the Admin has an Inbox over that same model. It cannot actually deliver a newly submitted message to a separate Admin document/session without the backend. This is documented here rather than repeated as large interface notices.

Admin pages intentionally have direct URL access. They are not secure authorization. The future .NET MVC backend must enforce identity, account roles, validation, sessions, authorization, database integrity, uploads and financial transactions.

Activity images use imageUrl references. Local-file selection is a temporary preview, not an upload; object URLs are revoked when the editor closes. A backend should return the final saved image URL.

Existing Jitsi is retained; Zoom opens its configured meeting link for an enrolled user. Enrollment URLs are not authorization. Shared enrollment records gate the session view. Because the frontend has no persistence, a new paid booking cannot become a durable enrollment on another document until the backend exists.

## Financial model

JOD amounts use integer fils and one shared formatter. Default commission is 15%; a per-activity override may be zero. Existing payment records retain rate/amount snapshots. Free enrollments produce no payment/commission/payable. Organizer payables are never reduced by separate service/advertising/Featured fees. Paying an invoice reconciles its linked fee records so revenue is not counted twice. Paid invoices cannot be edited or cancelled. Taxes, refunds and payment-processing charges were not invented.

Only published activities appear publicly; Featured requires published + isFeatured. A campaign appears only when approved, Active, in its date range and assigned to a supported placement. Payment or Featured status never automatically makes an advertisement active.

## Verification performed

- CRUD/dependency checks, status transitions, publication, user suspension and duplicate emails.
- Default/overridden commission, enrollment idempotency, free/paid record behavior, payment snapshots, invoice issue/payment locking and fee reconciliation.
- All seven Admin pages/fifteen tabs, navigation/search/filter/empty states/details, editor opening, user add/edit, activity form publication, invoice form/issue confirmation, conditional Zoom controls, settings reset and content save (DOM simulation).
- Quiz parity across 50 complete answer sets: same ordering, scores and percentages as the original twelve-question quiz. Option reorder uses stable mappings.
- Twelve User-flow initializations using current data/services, and Home/Login/Signup application/animation lifecycle simulations.
- Syntax checks, local script/CSS dependencies, rendered/static IDs and unchanged approved animation assets.

Real browser layout, native-dialog keyboard behavior and GPU appearance were not verified by these simulations. Review the pages at desktop/mobile sizes in a browser before treating their visual presentation as final.


## Settlement and billing refinement

The Dashboard now uses three financial summaries (HobbyHub earnings, organizer payables, unpaid issued invoices), four attention links, a compact income breakdown and platform counts. Action buttons throughout Admin have visible backgrounds/borders and consistent sizes.

Outgoing payouts use Review & settle in Payments → Payouts & service fees. The recipient form captures account-holder name, bank/wallet provider and an IBAN, Jordanian wallet phone or CliQ identifier. Recipient details can also be entered in Organizers. A manual check with the organizer is required. Format validation is not bank-side account verification.

The next step reviews the immutable booking/commission/payable breakdown. Two completion modes are deliberately separate: a clearly marked frontend transfer preview, and recording an external transfer already completed with its reference/date/confirmation. Neither mode initiates a real financial transfer. Both create a receipt snapshot; preview receipts explicitly say that no money was sent. Incomplete data, stale amounts, reused references and repeated settlement are rejected. Real outgoing transfer initiation/confirmation requires a provider-supported backend integration.

A free ticket still generates no booking commission or organizer payable. An independently agreed listing fee can be entered per activity. Publishing an activity with a listing/Featured fee creates an unbilled organizer charge; it does not create another ticket payment. Charges have Create invoice actions that prefill the billed party, service, linked activity and amount, reusing the same charge rather than duplicating it. Campaigns can likewise create prefilled advertising invoices.

An invoice records an agreed amount owed by an organizer, its service and due date. Finalizing it makes the charge payable; recording the incoming bank/wallet payment requires a reference/date and confirmation of receipt. The linked invoice and fee update together. No email is sent and no incoming payment is initiated by those actions.

Contact Us now has advertising and activity-listing topics with conditional business-name/phone fields. Initial enquiries do not request bank details. Admin can convert a business request into an organizer without retyping contact information. Settlement destination details are managed in the organizer record and payout review after agreement. Contact transport across separate documents still requires the future backend.

Sources checked for future integration context, not as a claim that a gateway has been implemented: Orange Money business-wallet/API services (https://orange.jo/en/orange-money) and JoPACC CliQ transfer/recipient-confirmation guidance (https://www.jopacc.com/faqs/cliq-faqs?page=0).

Additional executable tests passed for recipient and amount validation, no mutation on failure, distinct preview/external settlement records, immutable recipient snapshots, duplicate settlement protection, free events with listing fees, invoice prefill without duplicate fees, incoming receipt reconciliation, the two-step settlement UI, Contact conditional fields and request-to-organizer conversion. Source/DOM checks passed; actual browser layout and GPU appearance remain unverified.


### Activity proposals and dated publication

Contact Us offers general enquiries or an activity proposal. Proposals contain organizer/contact details, hobby/activity details, session schedule, requested publication and booking timestamps, optional homepage dates, and explicit acceptance of the 15% paid-booking commission plus a separate fixed homepage fee. All proposal timestamps use Amman UTC+03:00. There is no extra standard listing charge in the new editor.

`AdminService.submitContact` validates a proposal and adds it only to this document's in-memory inbox. It does not create an activity or send email. Files are local object-URL previews; only filename/type/size metadata is included in the preview request. Real uploads, request persistence, authenticated access, notifications and delivery need server endpoints. Do not use URL payloads or browser storage to transmit organizer requests to admin.

The Dashboard inbox includes a representative structured proposal. Review → add/link organizer → prepare populated activity editor → Save draft or Publish. A request is linked only after a successful activity save, and a request can have only one linked activity. Read status is separate from follow-up state (new, followUp, draftPrepared, closed). Closing a request does not unpublish its activity.

`publicationWindow` validates publication < booking deadline <= first session; homepage start/end must be inside that interval. Durations are calculated as elapsed days/hours/minutes. The admin confirms one total homepage fee; no per-day price is invented. Publishing a scheduled homepage placement requires a positive fee. The fee enters the existing service-fee/invoice contract, independently of ticket price. Request-sourced activities retain a 15% commission; free tickets produce no booking commission.

`isActivityListed` and `isActivityFeatured` evaluate visibility at render time. Enrollment service independently checks the booking window. Already enrolled users retain activity details and online-session access after bookings close. Backend must enforce these windows, authentication and financial verification using authoritative server time; client-side date checks are previews.


### Demo refinement: guided proposals, tariffs and organizer approval

The approved demo tariff is 15% per paid booking, JOD 1/day for listing a free activity, plus JOD 1/day for optional homepage placement of any activity. `platformSettings.requestPricing` is editable in Settings. Publication hours are prorated against 24-hour days and rounded to whole fils. Homepage and inside-listing periods now match exactly; there are no extra homepage date inputs in the proposal or editor. Prepared offers retain their rate snapshots when tariffs change.

Proposal phone fields normalize Jordanian mobile numbers while typing. Calendar span and session count derive from first/last dates and weekday checkboxes. Zoom remains an external meeting link, with meeting ID and optional passcode; Jitsi room names are prefilled on the admin's linked draft. Meeting access continues through the existing enrollment flow. Real server authorization and meeting-provider controls are still required.

Paid proposals collect recipient name, method, provider and identifier. This is receiving information for the organizer's booking share, never card credentials. Format validation does not verify ownership. Copied recipient details remain unverified until checked with the organizer. No bank identifiers, file contents or proposals are sent through URL state or browser storage.

Settings includes HobbyHub's receiving account for publication/homepage fees. It starts empty; do not fabricate payable account numbers. Prepared offers contain the configured account snapshot, or a clear missing-instructions message. The admin copies an offer and contacts the organizer manually via their selected email/phone/WhatsApp. No email or WhatsApp message is sent by this frontend. The admin records an actual accepted/declined reply with channel, reference and acknowledgment. Source-request activities cannot be published without recorded acceptance. Changed offer dates, price or homepage choice require a new offer/approval. This is a workflow preview, not legally verified electronic consent or proof of money transfer.

Free-activity listing and homepage charges feed the existing service-fee/invoice contracts when the approved activity is published; booking commission and organizer payouts remain separate. Publishing does not pretend the invoice has been paid. All mutations, account configuration, quotes and replies remain document-local until backend persistence is implemented.


### Current demo override: local persistence and guided lifecycle

The user has explicitly authorized temporary localStorage. The current implementation supersedes previous no-storage notes for this demo. `shared/js/demo-store.js` hydrates whitelisted mock arrays/settings after dataService and before page initialization. It writes only hobbyhub-demo-v1, supports cross-tab refresh, compact image previews, a clearly labeled demo clock and project-only reset. Use the same HTTP origin through Live Server; file URL storage sharing is not guaranteed. Payment card fields and login passwords are not included in storage.

The guided request controller is admin/shared/js/request-workflow.js. It replaces the crowded request modal, and finance exposes only student bookings, incoming organizer display fees, and organizer settlements. Request publication requires accepted terms and a verified recorded receipt when fixed fees are due. An internal paid invoice links the receipt to service-fee records without duplicate revenue. Payout requires the activity end time and a confirmed cancellation/refund review. The optional clock exists only for testing these boundaries and never changes the operating-system clock. See DEMO.md for a full walkthrough.
