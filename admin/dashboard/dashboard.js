document.addEventListener('DOMContentLoaded', () => {
  const m = AdminManager,
    u = AdminUI,
    e = u.esc,
    fmt = HobbyHubService.money;
  const route = (key, tab) => buildUrl(key, tab ? '?tab=' + tab : '');
  const overview = (s) => {
    const r = s.summary,
      earnings =
        r.commissionFils + r.advertisingRevenueFils + r.featuredRevenueFils + r.otherServiceRevenueFils;
    const paidCount = s.enrollments.filter(x => s.payments.some(p => p.enrollmentId === x.id && p.status === 'paid')).length;
    const freeCount = s.enrollments.filter(x => s.activities.some(a => a.id === x.activityId && Number(a.priceJod) === 0)).length;
    const waitingCount = Math.max(0, s.enrollments.length - paidCount - freeCount);
    const total = s.enrollments.length || 1;
    const chart = `<section class="adminPanel dashboardBookingChart"><div><h2>Bookings at a glance</h2><p class="adminMuted">Current booking records</p><div class="dashboardChartLegend">${[['Paid',paidCount,'#ED7052'],['Free',freeCount,'#7DA477'],['Awaiting payment',waitingCount,'#F6A15A']].map(([label,count,color]) => `<p><i style="background:${color}"></i><span>${label}</span><strong>${count}</strong></p>`).join('')}</div></div><div class="dashboardDonut" role="img" aria-label="${paidCount} paid, ${freeCount} free, ${waitingCount} awaiting payment" style="background:conic-gradient(#ED7052 0 ${paidCount/total*100}%, #7DA477 ${paidCount/total*100}% ${(paidCount+freeCount)/total*100}%, #F6A15A ${(paidCount+freeCount)/total*100}% 100%)"><span><strong>${s.enrollments.length}</strong>bookings</span></div></section>`;
    const unbilled = s.serviceFees.filter((f) => f.status === 'unbilled'),
      drafts = s.activities.filter((a) => a.status === 'draft');
    const income = [
        ['Booking commission', r.commissionFils, 'coral'],
        ['Advertising', r.advertisingRevenueFils, 'gold'],
        ['Listing & other services', r.otherServiceRevenueFils, 'sage'],
        ['Featured placement', r.featuredRevenueFils, 'peach'],
      ],
      max = Math.max(1, ...income.map((i) => i[1]));
    return `<section class="adminWelcome"><div><p class="adminEyebrow">YOUR HOBBYHUB OVERVIEW</p><h2>A clear view.<br><span>A little less busy.</span></h2><p>See what needs your attention, then keep things moving.</p></div><a class="adminBtn" href="${route('adminActivities', 'activities')}">Manage activities ↗</a><div class="adminWelcomeArt" aria-hidden="true">✦<i>↗</i></div></section>
  <div class="dashboardMoneyGrid"><a class="dashboardMoneyCard income" href="${route('adminPayments', 'payments')}"><span class="dashboardMoneyIcon">＋</span><p>HobbyHub earnings</p><strong>${e(fmt(earnings))}</strong><small>Commission + collected service fees</small></a><a class="dashboardMoneyCard payable" href="${route('adminPayments', 'payouts')}"><span class="dashboardMoneyIcon">↗</span><p>To pay organizers</p><strong>${e(fmt(r.pendingPayableFils))}</strong><small>Review recipients and settle payouts</small></a><a class="dashboardMoneyCard receivable" href="${route('adminPayments', 'invoices')}"><span class="dashboardMoneyIcon">▤</span><p>Awaiting organizer payment</p><strong>${e(fmt(r.outstandingInvoiceFils))}</strong><small>Issued invoices still unpaid</small></a></div>
  ${chart}<div class="dashboardMainGrid"><section class="adminPanel dashboardTasks"><div class="dashboardSectionTitle"><h2>What needs attention?</h2><span class="adminBadge">Today</span></div><a class="dashboardTask" href="${route('adminDashboard', 'inbox')}"><span class="dashboardTaskIcon">✉</span><span><strong>Contact inbox</strong><small>Questions, listings and advertising requests</small></span><b>${r.unreadMessages}</b><i>→</i></a><a class="dashboardTask" href="${route('adminPayments', 'payouts')}"><span class="dashboardTaskIcon sage">↗</span><span><strong>Organizer settlements</strong><small>Review booking proceeds before payout</small></span><b>${s.payouts.filter((p) => p.status === 'pending').length}</b><i>→</i></a><a class="dashboardTask" href="${route('adminPayments', 'payouts')}"><span class="dashboardTaskIcon gold">▤</span><span><strong>Charges to invoice</strong><small>Agreed listing and featured-placement fees</small></span><b>${unbilled.length}</b><i>→</i></a><a class="dashboardTask" href="${route('adminActivities', 'activities')}"><span class="dashboardTaskIcon">▧</span><span><strong>Activities in draft</strong><small>Finish details and publish when ready</small></span><b>${drafts.length}</b><i>→</i></a></section>
  <section class="adminPanel dashboardIncome"><div class="dashboardSectionTitle"><h2>Where earnings come from</h2></div>${income.map(([label, value, color]) => `<div class="dashboardIncomeItem"><div><span>${e(label)}</span><strong>${e(fmt(value))}</strong></div><div class="dashboardIncomeTrack"><span class="${color}" style="width:${(value / max) * 100}%"></span></div></div>`).join('')}<a class="adminBtn secondary" href="${route('adminPayments', 'payments')}">View payments & invoices →</a></section></div>
  <section class="dashboardQuickCreate"><h2>Create something new</h2><div>${m.action('＋ Activity', 'add', 'activities')}${m.action('＋ Organizer', 'add', 'organizers')}${m.action('＋ Invoice', 'add', 'invoices')}${m.action('＋ Community', 'add', 'communities')}</div></section>
  <div class="dashboardBottomGrid"><section class="adminPanel"><h2>Platform at a glance</h2><div class="dashboardPlatformStats"><a href="${route('adminUsers')}"><strong>${r.totalUsers}</strong><span>Users</span></a><a href="${route('adminActivities')}"><strong>${r.publishedActivities}</strong><span>Published activities</span></a><a href="${route('adminCatalog')}"><strong>${r.activeHobbies}</strong><span>Hobbies</span></a><a href="${route('adminPayments')}"><strong>${r.totalEnrollments}</strong><span>Enrollments</span></a></div></section><section class="adminPanel"><h2>Latest updates</h2><ol class="dashboardTimeline">${[
    ...s.recent,
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)
    .map(
      (x) =>
        `<li><span></span><div><strong>${e(x.kind)}</strong><p>${e(x.detail)}</p></div><time>${e(x.createdAt.slice(5, 10))}</time></li>`,
    )
    .join('')}</ol></section></div>`;
  };
  u.start({
    page: 'dashboard',
    bind: m.bind,
    tabs: [
      { id: 'overview', label: 'Overview', render: overview },
      {
        id: 'inbox',
        label: 'Contact inbox',
        render: (s) =>
          u.panel(
            'Contact messages',
            u.table(
              s.contactMessages,
              [
                { key: 'name', label: 'From' },
                { key: 'email', label: 'Email' },
                { key: 'topic', label: 'Topic' },
                { key: 'businessName', label: 'Business' },
                { key: 'phone', label: 'Phone' },
                { key: 'createdAt', label: 'Received' },
                { label: 'Status', render: (r) => u.badge(r.status) },
                {
                  label: 'Actions',
                  render: (r) =>
                    (r.businessName
                      ? m.action(
                          r.organizerId ? 'Organizer details' : 'Add organizer',
                          'requestOrganizer',
                          'contacts',
                          r.id,
                        )
                      : '') +
                    m.action('Mark read', 'read', 'contacts', r.id) +
                    m.action(
                      r.status === 'archived' ? 'Restore' : 'Archive',
                      r.status === 'archived' ? 'restoreMessage' : 'archiveMessage',
                      'contacts',
                      r.id,
                    ),
                },
              ],
              { status: true, label: 'messages', title: 'Contact request' },
            ),
          ),
      },
    ],
  });
});
