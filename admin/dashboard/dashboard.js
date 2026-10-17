document.addEventListener('DOMContentLoaded', () => {
  const m = AdminManager,
    u = AdminUI,
    e = u.esc,
    fmt = HobbyHubService.money;
  const route = (key, tab) => buildUrl(key, tab ? '?tab=' + tab : '');
  const overview = (s) => {
    const r = s.summary;
    const earnings = r.commissionFils + r.advertisingRevenueFils + r.featuredRevenueFils + r.otherServiceRevenueFils;
    const pendingFees = s.contactMessages.filter(x => x.agreement?.status === 'accepted' && x.agreement.totalFils > 0 && !x.publicationReceipt);
    const proposals = s.contactMessages.filter(x => x.activityRequest && !['published', 'declined'].includes(requestStage(x)));
    const ready = s.payouts.filter(x => x.status === 'pending' && payoutReady(x));
    const paid = s.enrollments.filter(x => s.payments.some(p => p.enrollmentId === x.id && p.status === 'paid')).length;
    const free = s.enrollments.filter(x => s.activities.some(a => a.id === x.activityId && Number(a.priceJod) === 0)).length;
    const waiting = Math.max(0, s.enrollments.length - paid - free);
    const listed = s.activities.filter(a => a.status === 'published' && isActivityListed(a)).length;
    const draft = s.activities.filter(a => a.status === 'draft').length;
    const moneyCard = (label, value, note, tab, icon) => `<a class="dbMetric dbMoney" href="${route('adminPayments', tab)}"><span class="dbMetricIcon" aria-hidden="true">${icon}</span><p>${label}</p><strong>${e(fmt(value))}</strong><small>${note}</small></a>`;
    const stat = (label,value,key,tab) => `<a class="dbMetric" href="${route(key,tab)}"><p>${label}</p><strong>${value}</strong><small>View ${label.toLowerCase()} ↗</small></a>`;
    const breakdown = [ ['Paid bookings',paid,'coral'], ['Free bookings',free,'sage'], ['Awaiting payment',waiting,'gold'] ];
    const income = [ ['Booking commissions',r.commissionFils], ['Homepage placement',r.featuredRevenueFils], ['Advertising',r.advertisingRevenueFils], ['Listing & other services',r.otherServiceRevenueFils] ];
    const incomeTotal = Math.max(1,...income.map(x=>x[1]));
    const task = (label,count,note,key,tab) => `<a class="dbTask" href="${route(key,tab)}"><span><strong>${label}</strong><small>${note}</small></span><b>${count}</b><span aria-hidden="true">→</span></a>`;
    return `<header class="dbHeading"><div><p class="adminEyebrow">PLATFORM OVERVIEW</p><h2>Your HobbyHub dashboard</h2><p class="adminMuted">Current totals and the work waiting for you.</p></div><div class="dbTopActions">${m.action('＋ Activity','add','activities')}${m.action('＋ Community','add','communities')}</div></header>
      <section aria-label="Platform statistics" class="dbStats">${stat('Users',r.totalUsers,'adminUsers')}${stat('Listed activities',listed,'adminActivities','activities')}${stat('Bookings',s.enrollments.length,'adminPayments','payments')}${stat('Communities',s.communities.length,'adminCommunities')}</section>
      <section aria-label="Money overview" class="dbMoneyGrid">${moneyCard('HobbyHub earnings',earnings,'Commission and collected service fees','payments','＋')}${moneyCard('Organizer shares to pay',r.pendingPayableFils,'All outstanding shares; payable after activity ends','payouts','↗')}${moneyCard('Display fees to collect',pendingFees.reduce((t,x)=>t+x.agreement.totalFils,0),'Accepted offers awaiting payment','receipts','▤')}</section>
      <div class="dbMainGrid"><section class="adminPanel"><div class="dashboardSectionTitle"><h2>Needs your attention</h2><a href="${route('adminDashboard','inbox')}">Open inbox →</a></div>${task('Activity requests',proposals.length,'Requests still being reviewed or prepared','adminDashboard','inbox')}${task('Unread messages',r.unreadMessages,'Organizer requests and general enquiries','adminDashboard','inbox')}${task('Display payments to verify',pendingFees.length,'Confirm incoming fees before publication','adminPayments','receipts')}${task('Organizer payments ready',ready.length,'Activities ended; ready to review and settle','adminPayments','payouts')}${task('Draft activities',draft,'Activities not published yet','adminActivities','activities')}</section>
      <section class="adminPanel"><div class="dashboardSectionTitle"><h2>Booking statistics</h2><a href="${route('adminPayments','payments')}">View bookings →</a></div><p class="adminMuted">${s.enrollments.length} total bookings</p><div class="dbBookingBars">${breakdown.map(([label,count,color])=>`<div class="dbBarRow"><div><span>${label}</span><strong>${count}</strong></div><div class="dashboardIncomeTrack"><span class="${color}" style="width:${s.enrollments.length ? count/s.enrollments.length*100 : 0}%"></span></div></div>`).join('')}</div><h3 class="dbIncomeTitle">Earnings breakdown</h3><p class="adminMuted">Collected income belonging to HobbyHub.</p>${income.map(([label,value])=>`<div class="dbBarRow"><div><span>${label}</span><strong>${e(fmt(value))}</strong></div><div class="dashboardIncomeTrack"><span class="coral" style="width:${value/incomeTotal*100}%"></span></div></div>`).join('')}</section></div>`;
  };
  u.start({
    page: 'dashboard',
    bind: (host, s, refresh) => {
      m.bind(host, s, refresh);
      AdminRequestFlow.bind(host, s, refresh);
    },
    tabs: [
      { id: 'overview', label: 'Overview', render: overview },
      {
        id: 'inbox',
        label: 'Activity requests & messages',
        render: (s) => AdminRequestFlow.inbox(s),
      },
    ],
  });
});
