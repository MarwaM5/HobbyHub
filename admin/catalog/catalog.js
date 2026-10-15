document.addEventListener('DOMContentLoaded', () => {
  const m = AdminManager,
    u = AdminUI;
  u.start({
    page: 'catalog',
    bind: m.bind,
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
        render: (s) =>
          m.managed(
            'questions',
            'Quiz questions',
            s.questions.map((q, i) => ({ ...q, order: i + 1, count: q.options.length })),
            [
              { key: 'order', label: 'Order' },
              { key: 'question', label: 'Question', wrap: true },
              { key: 'dimension', label: 'Dimension' },
              { key: 'count', label: 'Options' },
            ],
          ),
      },
    ],
  });
});
