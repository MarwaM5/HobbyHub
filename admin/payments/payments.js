document.addEventListener('DOMContentLoaded', () => {
  const u = AdminUI,
    m = AdminManager,
    fmt = HobbyHubService.money,
    e = u.esc;
  u.start({
    page: 'payments',
    bind: m.bind,
    tabs: [
      {
        id: 'payments',
        label: 'Student bookings',
        render: (s) =>
          u.panel(
            'Student bookings',
            u.table(
              s.enrollments.map((row) => {
                const a = s.activities.find((a) => a.id === row.activityId),
                  pay = s.payments.find((p) => p.enrollmentId === row.id),
                  split =
                    pay?.status === 'paid'
                      ? HobbyHubService.split(pay.amountFils, pay.commissionPercent)
                      : null;
                return {
                  ...row,
                  user: s.users.find((u) => u.id === row.userId)?.name,
                  activity: a?.title,
                  paid:
                    pay?.status === 'paid'
                      ? fmt(pay.amountFils)
                      : a?.priceJod === 0
                        ? 'Free'
                        : 'Awaiting payment',
                  commission: split ? fmt(split.commissionFils) : '—',
                  organizerShare: split ? fmt(split.payableFils) : '—',
                };
              }),
              [
                { key: 'user', label: 'Student' },
                { key: 'activity', label: 'Activity', wrap: true },
                { key: 'paid', label: 'Payment' },
                { key: 'commission', label: 'HobbyHub share' },
                { key: 'organizerShare', label: 'Organizer share' },
              ],
              { label: 'bookings' },
            ),
            'These are student ticket payments. Publication/homepage fees are separate.',
          ),
      },
      {
        id: 'receipts',
        label: 'Fees paid to HobbyHub',
        render: (s) =>
          u.panel(
            'Organizer publication payments',
            u.table(
              s.contactMessages
                .filter((r) => r.activityRequest && r.agreement)
                .map((r) => ({
                  ...r,
                  title: r.activityRequest.title,
                  amount: fmt(r.agreement.totalFils),
                  receipt: r.publicationReceipt
                    ? 'Received'
                    : r.agreement.totalFils === 0
                      ? 'Not required'
                      : r.agreement.status === 'accepted'
                        ? 'Awaiting payment'
                        : 'Awaiting approval',
                })),
              [
                { key: 'businessName', label: 'Organizer' },
                { key: 'title', label: 'Activity', wrap: true },
                { key: 'amount', label: 'Agreed display fees' },
                { key: 'receipt', label: 'Status' },
                {
                  label: 'Next step',
                  render: (r) => m.action('Open request', 'reviewActivityRequest', 'contacts', r.id),
                },
              ],
              { label: 'organizer payments' },
            ),
            'Verify incoming funds inside the request. The invoice and reference are kept with that receipt; no separate invoice creation is needed.',
          ),
      },
      {
        id: 'payouts',
        label: 'Pay organizers',
        render: (s) =>
          u.panel(
            'Organizer booking proceeds',
            u.table(
              s.payouts.map((row) => ({
                ...row,
                organizer: s.organizers.find((o) => o.id === row.organizerId)?.name,
                ready: payoutReady(payouts.find((p) => p.id === row.id)),
              })),
              [
                { key: 'organizer', label: 'Organizer' },
                { label: 'Student payments', render: (r) => fmt(r.grossFils) },
                { label: 'HobbyHub commission', render: (r) => fmt(r.commissionFils) },
                { label: 'To organizer', render: (r) => fmt(r.payableFils) },
                {
                  label: 'Next step',
                  render: (r) =>
                    r.status === 'paidOut'
                      ? m.action('View receipt', 'payoutReceipt', 'payouts', r.id)
                      : r.ready
                        ? m.action('Review & settle', 'payoutPaid', 'payouts', r.id)
                        : '<span class="adminMuted">Available after the activity ends</span>',
                },
              ],
              { label: 'settlements' },
            ),
            'Review the recipient, cancellations and refunds before recording a payout. The frontend preview does not transfer real money.',
          ),
      },
    ],
  });
});
