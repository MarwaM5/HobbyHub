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
