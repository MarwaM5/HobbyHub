document.addEventListener('DOMContentLoaded', () => {
  const m = AdminManager,
    u = AdminUI;
  u.start({
    page: 'users',
    bind: m.bind,
    tabs: [
      {
        label: 'Users',
        render: (s) =>
          m.managed(
            'users',
            'Users',
            s.users.filter((r) => r.role === 'user'),
            [
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'joinedAt', label: 'Join date' },
              { label: 'Status', render: (r) => u.badge(r.status) },
            ],
            {
              details: (r) => ({
                ...r,
                enrollments: s.enrollments
                  .filter((x) => x.userId === r.id)
                  .map((x) => s.activities.find((a) => a.id === x.activityId)?.title),
                payments: s.payments
                  .filter((p) => s.enrollments.some((x) => x.id === p.enrollmentId && x.userId === r.id))
                  .map((p) => p.status + ' · ' + HobbyHubService.money(p.amountFils)),
                communities: s.memberships
                  .filter((x) => x.userId === r.id)
                  .map((x) => s.communities.find((c) => c.id === x.communityId)?.name),
                posts: s.posts.filter((x) => x.userId === r.id).map((x) => x.text),
                journey: r.id === 'userMarwa' ? (s.journeyGoals || []).map((g) => g.title) : [],
              }),
            },
          ),
      },
    ],
  });
});
