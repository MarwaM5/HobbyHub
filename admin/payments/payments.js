document.addEventListener('DOMContentLoaded', () => {
  const m = AdminManager,
    u = AdminUI,
    fmt = HobbyHubService.money,
    org = (s, id) => s.organizers.find((o) => o.id === id)?.name;
  u.start({
    page: 'payments',
    bind: m.bind,
    tabs: [
      {
        id: 'payments',
        label: 'User payments',
        render: (s) =>
          u.stats([
            ['Total enrollments', s.summary.totalEnrollments],
            ['Paid enrollments', s.summary.paidEnrollments],
          ]) +
          u.panel(
            'User payments',
            u.table(
              s.enrollments.map((x) => {
                const a = s.activities.find((a) => a.id === x.activityId),
                  p = s.payments.find((p) => p.enrollmentId === x.id),
                  split =
                    p?.status === 'paid' ? HobbyHubService.split(p.amountFils, p.commissionPercent) : null;
                return {
                  ...x,
                  user: s.users.find((u) => u.id === x.userId)?.name,
                  activity: a?.title,
                  type: a?.type,
                  amount:
                    a?.priceJod === 0
                      ? 'Free'
                      : fmt(p?.amountFils || HobbyHubService.toFils(a?.priceJod || 0)),
                  fee: split ? fmt(split.commissionFils) : '—',
                  payable: split ? fmt(split.payableFils) : '—',
                  payment: p?.status || (a?.priceJod === 0 ? 'free' : 'unpaid'),
                  paymentType: a?.priceJod === 0 ? 'Free booking' : 'Activity booking',
                };
              }),
              [
                { key: 'user', label: 'User' },
                { key: 'activity', label: 'Activity', wrap: true },
                { key: 'type', label: 'Type' },
                { key: 'amount', label: 'Amount' },
                { key: 'fee', label: 'Platform fee' },
                { key: 'payable', label: 'Organizer payout' },
                { key: 'payment', label: 'Payment' },
                { label: 'Enrollment', render: (r) => u.badge(r.status) },
              ],
              { status: true, title: 'Payment details' },
            ),
            'Platform fee = commission set per activity (default 15% of the paid amount).',
          ),
      },
      {
        id: 'payouts',
        label: 'Payouts & service fees',
        render: (s) =>
          u.panel(
            'Payouts — owed to organizers',
            u.table(
              s.payouts.map((p) => ({ ...p, organizer: org(s, p.organizerId) })),
              [
                { key: 'organizer', label: 'Organizer' },
                { label: 'Gross bookings', render: (r) => fmt(r.grossFils) },
                { label: 'Commission', render: (r) => fmt(r.commissionFils) },
                { label: 'Payable', render: (r) => fmt(r.payableFils) },
                { label: 'Status', render: (r) => u.badge(r.status) },
                {
                  label: 'Action',
                  render: (r) =>
                    r.status === 'pending'
                      ? m.action('Review & settle', 'payoutPaid', 'payouts', r.id)
                      : m.action('Receipt', 'payoutReceipt', 'payouts', r.id),
                },
              ],
              { status: true },
            ),
          ) +
          u.panel(
            'Charges to organizers',
            `<div class="adminSectionActions">${m.action('Create invoice', 'add', 'invoices')}</div>` +
              u.table(
                s.serviceFees.map((f) => ({
                  ...f,
                  organizer: org(s, f.organizerId),
                  invoice: s.invoices.find((i) => i.id === f.invoiceId)?.number,
                })),
                [
                  { key: 'organizer', label: 'Organizer' },
                  { key: 'description', label: 'Service', wrap: true },
                  { label: 'Amount', render: (r) => fmt(r.amountFils) },
                  { key: 'invoice', label: 'Invoice #' },
                  { label: 'Status', render: (r) => u.badge(r.status) },
                  {
                    label: 'Action',
                    render: (r) =>
                      r.status === 'invoiced'
                        ? m.action('Record payment', 'feePaid', 'fees', r.id)
                        : r.status === 'unbilled'
                          ? m.action('Create invoice', 'invoiceFee', 'fees', r.id)
                          : '—',
                  },
                ],
                { status: true },
              ),
            'Listing, featured placement and advertising charges are separate from ticket commission.',
          ),
      },
      {
        id: 'advertising',
        label: 'Homepage advertising',
        render: (s) =>
          m.managed(
            'campaigns',
            'Homepage advertising',
            s.campaigns.map((c) => ({
              ...c,
              organizer: org(s, c.organizerId),
              payment: s.invoices.find((i) => i.id === c.invoiceId)?.status || 'Not invoiced',
            })),
            [
              { key: 'name', label: 'Campaign' },
              { key: 'organizer', label: 'Advertiser' },
              { key: 'type', label: 'Package' },
              { key: 'startsOn', label: 'Start' },
              { key: 'endsOn', label: 'End' },
              { label: 'Agreed fee', render: (r) => fmt(r.agreedFeeFils) },
              { key: 'payment', label: 'Payment' },
              { label: 'Status', render: (r) => u.badge(r.status) },
            ],
          ),
      },
      {
        id: 'invoices',
        label: 'Invoices',
        render: (s) =>
          `<div class="invoiceJourney"><div><b>1</b><span><strong>Agree a charge</strong><small>Listing, featured placement or advertising</small></span></div><div><b>2</b><span><strong>Create the invoice</strong><small>Who owes what, and when it is due</small></span></div><div><b>3</b><span><strong>Record the receipt</strong><small>Match the actual payment to the invoice</small></span></div></div>` +
          m.managed(
            'invoices',
            'Invoices',
            s.invoices.map((i) => ({
              ...i,
              billedTo: org(s, i.organizerId),
              description: s.serviceFees
                .filter((f) => i.feeIds.includes(f.id))
                .map((f) => f.description)
                .join('; '),
            })),
            [
              { key: 'number', label: 'Invoice #' },
              { key: 'billedTo', label: 'Billed party' },
              { key: 'issuedOn', label: 'Invoice date' },
              { key: 'dueOn', label: 'Due date' },
              { label: 'Total due', render: (r) => fmt(r.amountFils) },
              { label: 'Status', render: (r) => u.badge(r.status) },
            ],
            {
              title: 'Organizer invoice',
              details: (r) => ({
                invoiceNumber: r.number,
                billedTo: r.billedTo,
                service: r.description,
                invoiceDate: r.issuedOn,
                dueDate: r.dueOn,
                totalDue: fmt(r.amountFils),
                status: r.status,
                paymentReference: r.paymentReference || 'Not yet recorded',
                receivedOn: r.receivedOn || '—',
                paymentNotes: r.paymentNotes || '—',
              }),
            },
          ),
      },
    ],
  });
});
