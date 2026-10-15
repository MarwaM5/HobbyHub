document.addEventListener('DOMContentLoaded', () => {
  const m = AdminManager,
    u = AdminUI;
  u.start({
    page: 'communities',
    bind: m.bind,
    tabs: [
      {
        label: 'Communities',
        render: (s) =>
          m.managed(
            'communities',
            'Community management',
            s.communities.map((c) => ({
              ...c,
              category: s.categories.find((x) => x.id === c.categoryId)?.name,
              members: s.memberships.filter((x) => x.communityId === c.id).length,
              posts: s.posts.filter((p) => p.communityId === c.id).length,
            })),
            [
              { key: 'name', label: 'Community' },
              { key: 'category', label: 'Category' },
              { key: 'members', label: 'Members' },
              { key: 'posts', label: 'Posts' },
              { label: 'Status', render: (r) => u.badge(r.status) },
            ],
          ),
      },
    ],
  });
});
