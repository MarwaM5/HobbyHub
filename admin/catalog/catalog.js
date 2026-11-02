document.addEventListener('DOMContentLoaded', () => {
  const m = AdminManager,
    u = AdminUI;
  u.start({
    page: 'catalog',
    bind: (host, state, render) => {
      m.bind(host, state, render);
      DiscoveryEditor.bind(host, render);
    },
    tabs: [
      {
        id: 'hobbies',
        label: 'Hobbies',
        render: (s) =>
          m.managed(
            'hobbies',
            'Hobby catalog',
            s.hobbies.map((h) => ({ ...h, category: s.categories.find((c) => c.id === h.categoryId)?.name })),
            [
              { key: 'emoji', label: 'Icon' },
              { key: 'name', label: 'Hobby' },
              { key: 'category', label: 'Category' },
            ],
            { details: row => DiscoveryEditor.hobbyDetails(row) },
          ),
      },
      {
        id: 'categories',
        label: 'Categories',
        render: (s) =>
          m.managed(
            'categories',
            'Categories',
            s.categories.map((c) => ({ ...c, count: s.hobbies.filter((h) => h.categoryId === c.id).length })),
            [
              { key: 'name', label: 'Category' },
              { key: 'count', label: 'Hobbies' },
            ],
          ),
      },
      {
        id: 'quiz',
        label: 'Quiz questions',
        render: () => DiscoveryEditor.render(),
      },
    ],
  });
});
