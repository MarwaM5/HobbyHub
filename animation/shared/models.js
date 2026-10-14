/* Original procedural meshes. No SVG stand-ins or external model/texture requests. */
(() => {
  'use strict';
  if (!window.THREE) return;
  const T = window.THREE;
  const colors = {
    coral: 0xed7052,
    gold: 0xf6a15a,
    cream: 0xfff8f1,
    green: 0x7da477,
    brown: 0x332e2a,
  };
  const materials = new Map();
  function material(color, roughness = 0.42, metalness = 0) {
    const key = `${color}/${roughness}/${metalness}`;
    if (!materials.has(key))
      materials.set(key, new T.MeshStandardMaterial({ color, roughness, metalness }));
    return materials.get(key);
  }
  const m = {
    coral: material(colors.coral),
    brass: material(0xd6a25b, 0.24, 0.72),
    orange: material(colors.gold),
    cream: material(colors.cream, 0.7),
    paper: material(0xfff4dd, 0.82),
    green: material(colors.green, 0.36),
    dark: material(colors.brown, 0.42),
    leather: material(0x463d34, 0.72),
    wood: material(0xb47742, 0.42),
    pale: material(0xe4ba83, 0.56),
    black: material(0x202522, 0.24, 0.15),
    glass: material(0x345c55, 0.14, 0.62),
  };
  function mesh(group, geometry, mat, x = 0, y = 0, z = 0) {
    const item = new T.Mesh(geometry, mat);
    item.position.set(x, y, z);
    item.castShadow = true;
    item.receiveShadow = true;
    group.add(item);
    return item;
  }
  function box(group, w, h, d, mat, x = 0, y = 0, z = 0, r = 0.05) {
    const s = new T.Shape(),
      a = -w / 2,
      b = -h / 2,
      radius = Math.min(r, w / 4, h / 4);
    s.moveTo(a + radius, b);
    s.lineTo(a + w - radius, b);
    s.quadraticCurveTo(a + w, b, a + w, b + radius);
    s.lineTo(a + w, b + h - radius);
    s.quadraticCurveTo(a + w, b + h, a + w - radius, b + h);
    s.lineTo(a + radius, b + h);
    s.quadraticCurveTo(a, b + h, a, b + h - radius);
    s.lineTo(a, b + radius);
    s.quadraticCurveTo(a, b, a + radius, b);
    const bevel = Math.min(0.025, d / 5);
    const geo = new T.ExtrudeGeometry(s, {
      depth: d,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 5,
    });
    geo.translate(0, 0, -d / 2);
    return mesh(group, geo, mat, x, y, z);
  }
  function cylinder(g, r1, r2, h, mat, x = 0, y = 0, z = 0) {
    return mesh(g, new T.CylinderGeometry(r1, r2, h, 32), mat, x, y, z);
  }
  function sphere(g, r, mat, x = 0, y = 0, z = 0) {
    return mesh(g, new T.SphereGeometry(r, 24, 16), mat, x, y, z);
  }
  function ring(g, r, t, mat, x = 0, y = 0, z = 0) {
    return mesh(g, new T.TorusGeometry(r, t, 10, 48), mat, x, y, z);
  }
  function tube(g, points, r, mat) {
    return mesh(
      g,
      new T.TubeGeometry(
        new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p))),
        30,
        r,
        6,
        false
      ),
      mat
    );
  }
  function extrude(g, shape, depth, mat) {
    const geo = new T.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      bevelSegments: 3,
      curveSegments: 14,
    });
    geo.translate(0, 0, -depth / 2);
    return mesh(g, geo, mat);
  }
  function camera() {
    const g = new T.Group();
    box(g, 1.65, 1.04, 0.65, m.leather);
    box(g, 1.73, 0.22, 0.7, m.brass, 0, 0.49, 0);
    box(g, 1.7, 0.13, 0.71, m.brass, 0, -0.47, 0);
    box(g, 0.65, 0.27, 0.5, m.dark, 0.05, 0.72, 0);
    box(g, 0.38, 0.12, 0.08, m.glass, 0.05, 0.72, 0.31);
    box(g, 0.26, 0.18, 0.12, m.cream, -0.59, 0.48, 0.39);
    [
      [0.47, 0.32, 0.48, m.black],
      [0.42, 0.37, 0.62, m.brass],
      [0.37, 0.3, 0.8, m.dark],
      [0.31, 0.09, 1, m.glass],
    ].forEach(([r, h, z, mat]) => {
      const lens = cylinder(g, r, r, h, mat, 0, -0.04, z);
      lens.rotation.x = Math.PI / 2;
    });
    ring(g, 0.37, 0.027, m.brass, 0, -0.04, 0.98);
    ring(g, 0.27, 0.015, m.cream, 0, -0.04, 1.055);
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12;
      box(
        g,
        0.022,
        0.09,
        0.08,
        m.pale,
        Math.cos(a) * 0.43,
        -0.04 + Math.sin(a) * 0.43,
        0.83,
        0.005
      ).rotation.z = -a;
    }
    cylinder(g, 0.19, 0.19, 0.1, m.dark, 0.53, 0.67, 0);
    cylinder(g, 0.11, 0.11, 0.13, m.brass, -0.55, 0.65, 0);
    box(g, 0.17, 0.3, 0.03, m.coral, 0.63, 0.06, 0.36);
    tube(
      g,
      [
        [-0.83, 0.32, 0],
        [-1.12, 0.15, -0.15],
        [-1.18, -0.44, -0.2],
        [-0.81, -0.43, 0],
      ],
      0.045,
      m.leather
    );
    g.rotation.set(0.08, -0.2, -0.12);
    return g;
  }
  function guitar() {
    const g = new T.Group(),
      s = new T.Shape();
    s.moveTo(0, -1.2);
    s.bezierCurveTo(-1, -1.2, -1, -0.25, -0.52, -0.04);
    s.bezierCurveTo(-0.25, 0.1, -0.8, 0.5, -0.42, 0.79);
    s.bezierCurveTo(-0.2, 0.97, 0.2, 0.97, 0.42, 0.79);
    s.bezierCurveTo(0.8, 0.5, 0.25, 0.1, 0.52, -0.04);
    s.bezierCurveTo(1, -0.25, 1, -1.2, 0, -1.2);
    extrude(g, s, 0.32, m.wood);
    const face = extrude(g, s, 0.035, m.pale);
    face.position.z = 0.19;
    box(g, 0.22, 1.5, 0.14, m.dark, 0, 1.37, 0.06, 0.01);
    box(g, 0.35, 0.51, 0.17, m.wood, 0, 2.23, 0.03);
    const hole = cylinder(g, 0.19, 0.19, 0.012, m.dark, 0, 0.18, 0.223);
    hole.rotation.x = Math.PI / 2;
    ring(g, 0.22, 0.015, m.brass, 0, 0.18, 0.235);
    box(g, 0.42, 0.1, 0.1, m.dark, 0, -0.75, 0.26, 0.02);
    for (let i = 0; i < 6; i++) {
      tube(
        g,
        [
          [(i - 2.5) * 0.027, -0.8, 0.33],
          [(i - 2.5) * 0.025, 2.33, 0.2],
        ],
        0.003,
        m.brass
      );
      const tuner = cylinder(
        g,
        0.055,
        0.055,
        0.11,
        m.brass,
        i % 2 ? 0.23 : -0.23,
        2.08 + Math.floor(i / 2) * 0.14,
        0.02
      );
      tuner.rotation.z = Math.PI / 2;
    }
    for (let i = 0; i < 11; i++)
      box(g, 0.23, 0.012, 0.018, m.brass, 0, 0.69 + i * 0.12, 0.143, 0.002);
    g.rotation.set(0.14, -0.3, -0.22);
    g.scale.setScalar(0.75);
    return g;
  }
  function brush() {
    const g = new T.Group();
    cylinder(g, 0.055, 0.12, 1.7, m.coral, 0, 0.25, 0);
    cylinder(g, 0.13, 0.13, 0.35, m.brass, 0, -0.77, 0);
    const tip = mesh(g, new T.ConeGeometry(0.15, 0.65, 24), m.green, 0, -1.22, 0);
    tip.rotation.z = Math.PI;
    for (let i = 0; i < 8; i++)
      tube(
        g,
        [
          [Math.cos(i) * 0.11, -0.95, Math.sin(i) * 0.11],
          [Math.cos(i) * 0.08, -1.25, Math.sin(i) * 0.08],
          [0, -1.55, 0],
        ],
        0.009,
        m.dark
      );
    g.rotation.z = -0.35;
    return g;
  }
  function palette() {
    const g = new T.Group(),
      s = new T.Shape();
    s.moveTo(0.2, -0.8);
    s.bezierCurveTo(-0.7, -1.05, -1.1, -0.25, -0.85, 0.35);
    s.bezierCurveTo(-0.65, 0.97, 0.2, 1.02, 0.72, 0.6);
    s.bezierCurveTo(1, 0.33, 0.72, 0.01, 0.38, 0.03);
    s.bezierCurveTo(0.02, 0.05, 0.74, -0.64, 0.2, -0.8);
    const hole = new T.Path();
    hole.absellipse(0.23, -0.4, 0.16, 0.12, 0, Math.PI * 2, true);
    s.holes.push(hole);
    extrude(g, s, 0.15, m.pale);
    [
      [-0.5, 0.35, m.coral],
      [-0.15, 0.65, m.orange],
      [0.29, 0.58, m.green],
      [-0.62, -0.13, material(0xc68b62)],
      [-0.33, -0.57, material(0x658c62)],
    ].forEach(([x, y, mat]) => sphere(g, 0.13, mat, x, y, 0.14).scale.set(1, 1, 0.45));
    const b = brush();
    b.scale.setScalar(0.55);
    b.position.set(0.35, 0.1, 0.22);
    b.rotation.z = -0.6;
    g.add(b);
    g.rotation.set(-0.1, -0.25, -0.17);
    return g;
  }
  function plant() {
    const g = new T.Group(),
      points = [
        [0.28, -0.75],
        [0.38, -0.72],
        [0.47, -0.07],
        [0.48, 0],
        [0.4, 0.015],
      ].map((p) => new T.Vector2(...p));
    mesh(g, new T.LatheGeometry(points, 36), m.coral);
    const rim = ring(g, 0.46, 0.047, m.orange, 0, 0, 0);
    rim.rotation.x = Math.PI / 2;
    const soil = cylinder(g, 0.4, 0.4, 0.07, m.dark, 0, -0.01, 0);
    tube(
      g,
      [
        [0, 0, 0],
        [0.04, 0.5, 0],
        [-0.03, 1.2, 0],
      ],
      0.025,
      m.green
    );
    for (let i = 0; i < 9; i++) {
      const leafShape = new T.Shape();
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(-0.3, 0.15, -0.34, 0.65, 0, 0.95);
      leafShape.bezierCurveTo(0.34, 0.65, 0.3, 0.15, 0, 0);
      const leaf = extrude(g, leafShape, 0.02, i % 3 ? m.green : material(0xa5bc8d, 0.46));
      leaf.position.set(0.01, 0.07 + i * 0.105, 0);
      leaf.rotation.set(0.55 + i * 0.18, i * 2.399, 0.6 * (i % 2 ? 1 : -1));
      leaf.scale.setScalar(0.65 + (i % 3) * 0.1);
      const vein = tube(
        new T.Group(),
        [
          [0, 0, 0.035],
          [0, 0.47, 0.04],
          [0, 0.86, 0.02],
        ],
        0.008,
        m.pale
      );
      leaf.add(vein);
    }
    g.rotation.y = 0.25;
    return g;
  }
  function book() {
    const g = new T.Group(),
      hinges = [];
    for (const side of [-1, 1]) {
      const page = new T.Group();
      g.add(page);
      hinges.push(page);
      box(page, 0.83, 1.15, 0.1, m.coral, side * 0.42, 0, -0.1, 0.02);
      for (let i = 0; i < 9; i++)
        box(
          page,
          0.78,
          1.09,
          0.014,
          i % 2 ? m.cream : m.paper,
          side * 0.405,
          0,
          -0.03 + i * 0.014,
          0.012
        );
      for (let i = 0; i < 8; i++)
        box(
          page,
          0.52 - (i % 3) * 0.04,
          0.013,
          0.002,
          material(0xd2b697),
          side * 0.405,
          0.39 - i * 0.106,
          0.108,
          0.001
        );
      page.rotation.y = side * 0.24;
    }
    const spine = cylinder(g, 0.07, 0.07, 1.15, m.brass, 0, 0, -0.08);
    g.userData.hinges = hinges;
    g.rotation.set(0.25, 0.1, -0.15);
    return g;
  }
  function pottery() {
    const g = new T.Group(),
      p = [
        [0.22, -0.65],
        [0.42, -0.61],
        [0.56, -0.4],
        [0.58, -0.12],
        [0.44, 0.16],
        [0.22, 0.38],
        [0.19, 0.62],
        [0.25, 0.66],
      ].map((v) => new T.Vector2(...v));
    mesh(g, new T.LatheGeometry(p, 48), material(0xe6a87e, 0.2));
    for (const y of [-0.26, -0.35]) {
      const r = ring(g, 0.57, 0.012, m.cream, 0, y, 0);
      r.rotation.x = Math.PI / 2;
    }
    const rim = ring(g, 0.24, 0.025, m.pale, 0, 0.66, 0);
    rim.rotation.x = Math.PI / 2;
    return g;
  }
  function yarn() {
    const g = new T.Group();
    sphere(g, 0.62, m.coral);
    for (let i = 0; i < 23; i++) {
      const r = ring(g, 0.62, 0.014, i % 2 ? m.orange : m.coral);
      r.rotation.set(i * 0.16, i * 0.32, i * 0.25);
    }
    tube(
      g,
      [
        [0.1, -0.57, 0],
        [0.9, -0.67, 0.15],
        [0.99, -0.85, 0.2],
        [0.55, -0.9, 0.25],
      ],
      0.025,
      m.coral
    );
    for (const side of [-1, 1]) {
      const n = cylinder(g, 0.022, 0.022, 1.9, m.pale, side * 0.19, 0.25, -0.1);
      n.rotation.z = side * 0.35;
      sphere(g, 0.065, m.brass, side * 0.5, 1.13, -0.1);
    }
    return g;
  }
  function headphones() {
    const g = new T.Group();
    const points = Array.from({ length: 32 }, (_, i) => {
      const a = (Math.PI * i) / 31;
      return [Math.cos(a) * 0.68, Math.sin(a) * 0.85, 0];
    });
    tube(g, points, 0.085, m.coral);
    for (const s of [-1, 1]) {
      box(g, 0.33, 0.57, 0.38, m.coral, s * 0.69, -0.15, 0, 0.12);
      box(g, 0.18, 0.46, 0.45, m.leather, s * 0.5, -0.15, 0, 0.08);
    }
    return g;
  }
  function photo() {
    const g = new T.Group();
    box(g, 0.84, 1.05, 0.03, m.cream);
    box(g, 0.7, 0.7, 0.025, material(0xb9caa7), 0, 0.08, 0.025, 0.001);
    sphere(g, 0.085, m.orange, 0.18, 0.28, 0.065).scale.z = 0.15;
    const a = mesh(g, new T.ConeGeometry(0.25, 0.48, 3), m.green, -0.13, -0.04, 0.07);
    a.scale.z = 0.08;
    const b = mesh(g, new T.ConeGeometry(0.18, 0.3, 3), material(0x54774e), 0.15, -0.13, 0.08);
    b.scale.z = 0.08;
    g.rotation.z = 0.12;
    return g;
  }
  function game() {
    const g = new T.Group();
    box(g, 1.3, 0.64, 0.33, m.green, 0, 0, 0, 0.25);
    for (const s of [-1, 1]) sphere(g, 0.34, m.green, s * 0.47, -0.25, 0).scale.set(0.8, 1.2, 0.7);
    box(g, 0.37, 0.1, 0.1, m.dark, -0.35, 0.07, 0.22, 0.01);
    box(g, 0.1, 0.37, 0.1, m.dark, -0.35, 0.07, 0.22, 0.01);
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      sphere(
        g,
        0.065,
        i % 2 ? m.orange : m.coral,
        0.37 + Math.cos(a) * 0.12,
        0.04 + Math.sin(a) * 0.12,
        0.24
      );
    }
    tube(
      g,
      [
        [0, 0.32, 0],
        [0.15, 0.65, 0],
        [0.4, 0.72, -0.05],
      ],
      0.025,
      m.dark
    );
    return g;
  }
  function tent() {
    const g = new T.Group();
    const geo = new T.ConeGeometry(0.75, 1.2, 4);
    const a = mesh(g, geo, m.green, 0, 0, 0);
    a.rotation.y = Math.PI / 4;
    const entrance = mesh(g, new T.ConeGeometry(0.28, 0.6, 3), m.dark, 0, -0.25, 0.55);
    entrance.scale.z = 0.08;
    box(g, 1.22, 0.06, 1.22, m.pale, 0, -0.6, 0);
    tube(
      g,
      [
        [-0.7, -0.55, 0.63],
        [0, 0.62, 0],
        [0.7, -0.55, 0.63],
      ],
      0.017,
      m.brass
    );
    return g;
  }
  function compass() {
    const g = new T.Group();
    const face = cylinder(g, 0.61, 0.61, 0.15, m.brass);
    face.rotation.x = Math.PI / 2;
    const dial = cylinder(g, 0.54, 0.54, 0.015, m.cream, 0, 0, 0.085);
    dial.rotation.x = Math.PI / 2;
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const tick = box(
        g,
        0.012,
        i % 4 ? 0.065 : 0.13,
        0.012,
        m.dark,
        Math.sin(a) * 0.47,
        Math.cos(a) * 0.47,
        0.1,
        0.001
      );
      tick.rotation.z = -a;
    }
    const needle = new T.Group();
    g.add(needle);
    for (const s of [-1, 1]) {
      const tip = mesh(
        needle,
        new T.ConeGeometry(0.085, 0.36, 3),
        s < 0 ? m.green : m.coral,
        0,
        s * 0.17,
        0.14
      );
      tip.rotation.z = s < 0 ? Math.PI : 0;
      tip.scale.z = 0.2;
    }
    sphere(g, 0.045, m.brass, 0, 0, 0.17);
    g.userData.needle = needle;
    return g;
  }
  function portal() {
    const g = new T.Group();
    for (const side of [-1, 1]) {
      for (let i = 0; i < 7; i++) {
        box(g, 0.45, 0.51, 0.42, i % 2 ? m.pale : m.cream, side * 1.4, -1.2 + i * 0.49, 0, 0.03);
        box(g, 0.48, 0.05, 0.47, m.brass, side * 1.4, -1.47 + i * 0.49, 0, 0.008);
      }
      box(g, 0.72, 0.24, 0.7, m.pale, side * 1.4, -1.75, 0);
      box(g, 0.65, 0.12, 0.58, m.cream, side * 1.4, 1.96, 0);
    }
    for (let i = 0; i < 14; i++) {
      const a = (i * Math.PI) / 13;
      const stone = box(
        g,
        0.36,
        0.43,
        0.42,
        i % 2 ? m.pale : m.cream,
        Math.cos(a) * 1.4,
        1.78 + Math.sin(a) * 1.4,
        0,
        0.025
      );
      stone.rotation.z = a - Math.PI / 2;
    }
    for (let i = 0; i < 3; i++)
      box(
        g,
        3.1 + i * 0.4,
        0.14,
        0.7 + i * 0.35,
        m.pale,
        0,
        -1.82 - i * 0.15,
        0.35 + i * 0.22,
        0.04
      );
    const haloMat = new T.MeshBasicMaterial({ color: 0xffd18c, transparent: true, opacity: 0.8 });
    const path = [
      [-1.14, -1.5, 0.23],
      [-1.14, 1.7, 0.23],
      [-0.81, 2.52, 0.23],
      [0, 2.87, 0.23],
      [0.81, 2.52, 0.23],
      [1.14, 1.7, 0.23],
      [1.14, -1.5, 0.23],
    ];
    const glow = tube(g, path, 0.026, haloMat);
    glow.castShadow = false;
    for (let i = 0; i < 20; i++) {
      const side = i % 2 ? -1 : 1,
        a = i * 0.65;
      const leaf = sphere(
        g,
        0.16,
        m.green,
        side * (1.4 + Math.sin(a) * 0.13),
        -1.2 + i * 0.18,
        0.3
      );
      leaf.scale.set(0.5, 1.5, 0.2);
      leaf.rotation.z = side * 0.55;
      sphere(g, 0.065, m.coral, side * 1.46, -0.95 + i * 0.18, 0.4);
    }
    g.userData.glow = glow;
    return g;
  }
  const factories = {
    camera,
    guitar,
    brush,
    palette,
    plant,
    book,
    pottery,
    yarn,
    headphones,
    photo,
    game,
    tent,
    compass,
    portal,
  };
  window.HobbyModels = Object.freeze({
    make(name) {
      return (factories[name] || palette)();
    },
    materials,
    colors,
  });
})();
