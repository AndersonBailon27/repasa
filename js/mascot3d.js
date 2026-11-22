// Repasa · Mascotas 3D hechas por código con Three.js
// create(container, key) -> { setMode, setTalking, look, dispose } o null si no hay WebGL
import * as THREE from 'three';

export const MASCOTS3D = {
  buho:     {name:'Bubo',    kind:'owl',     c:'#d9822b', b:'#f6d9a8', d:'#a85f1c', acc:'steth',   feet:'#f5a524'},
  castor:   {name:'Tito',    kind:'round',   c:'#8a5a3b', b:'#d9b48f', d:'#5e3b25', acc:'helmet',  teeth:1},
  zorra:    {name:'Lexa',    kind:'pointy',  c:'#e26a2c', b:'#fbe3cf', d:'#b2471a', acc:'glasses'},
  llama:    {name:'Lucas',   kind:'llama',   c:'#efe3cf', b:'#fff8ec', d:'#b89f7c', acc:'tie', snout:1, wool:1},
  tortuga:  {name:'Tula',    kind:'turtle',  c:'#7fc28a', b:'#e9f3c6', d:'#3f7d4c', acc:'book'},
  gata:     {name:'Mimi',    kind:'pointy',  c:'#9a90b8', b:'#ece8f6', d:'#6c628f', acc:'heart'},
  oso:      {name:'Bruno',   kind:'round',   c:'#5d7891', b:'#cfdbe6', d:'#3d5468', acc:'pencil'},
  loro:     {name:'Rocco',   kind:'parrot',  c:'#e23b3b', b:'#ffd84d', d:'#2a9d5c', acc:'mic',     feet:'#555555'},
  cuy:      {name:'Coco',    kind:'round',   c:'#c98a4b', b:'#f3dfc4', d:'#8a5a2e', acc:'cross'},
  conejo:   {name:'Toto',    kind:'llama',   c:'#ece7f2', b:'#ffffff', d:'#f2a7bd', acc:'tooth',   teeth:1},
  perro:    {name:'Rocky',   kind:'floppy',  c:'#c9a36b', b:'#f3e6cc', d:'#8b6a3e', acc:'helmet'},
  mapache:  {name:'Tuerca',  kind:'round',   c:'#8d96a0', b:'#e3e7eb', d:'#4a525c', acc:'gear',    mask:1},
  vicuna:   {name:'Vicky',   kind:'llama',   c:'#c98b4f', b:'#f6e6d2', d:'#8e5a2b', acc:'coin', snout:1, wool:1},
  mono:     {name:'Maxi',    kind:'round',   c:'#7b5136', b:'#e8c9a6', d:'#4f3221', acc:'tie'},
  condor:   {name:'Cóndi',   kind:'bird',    c:'#2e2e33', b:'#4a4a52', d:'#1c1c20', acc:'map',     feet:'#c9b07a'},
  panda:    {name:'Panchito',kind:'round',   c:'#f4f4f4', b:'#ffffff', d:'#262626', acc:'chef',    patches:1},
  rana:     {name:'Rita',    kind:'frog',    c:'#6cc04a', b:'#d9f2b4', d:'#3f8a2a', acc:'leaf'},
  firu:     {name:'Firu',    kind:'floppy',  c:'#e0a96d', b:'#fff1dc', d:'#9c6b3a', acc:'steth'},
  colibri:  {name:'Lila',    kind:'parrot',  c:'#7d5bd6', b:'#f5d0ff', d:'#2bb3a8', acc:'pencil',  feet:'#444444'},
  pinguino: {name:'Pepe',    kind:'penguin', c:'#23272e', b:'#ffffff', d:'#23272e', acc:'book',    feet:'#f5a524'}
};

const BODY_C = new THREE.Vector3(0, 1.15, 0);
const BODY_S = new THREE.Vector3(1, 1.12, 0.95);

function mat(color, rough = 0.55, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
}
function sphere(r, m, seg = 40) { return new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), m); }
function at(o, x, y, z) { o.position.set(x, y, z); return o; }
function sc(o, x, y, z) { o.scale.set(x, y, z); return o; }
// punto sobre la superficie frontal del cuerpo (elipsoide)
function surfZ(x, y) {
  const v = 1 - (x / BODY_S.x) ** 2 - ((y - BODY_C.y) / BODY_S.y) ** 2;
  return v > 0 ? Math.sqrt(v) * BODY_S.z : 0;
}
function extrude(shape, depth, m) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.4, bevelSize: depth * 0.4, bevelSegments: 3, curveSegments: 18 });
  g.center();
  return new THREE.Mesh(g, m);
}
function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.9);
  s.bezierCurveTo(-0.2, -0.6, -1, -0.3, -1, 0.25);
  s.bezierCurveTo(-1, 0.75, -0.4, 0.95, 0, 0.5);
  s.bezierCurveTo(0.4, 0.95, 1, 0.75, 1, 0.25);
  s.bezierCurveTo(1, -0.3, 0.2, -0.6, 0, -0.9);
  return s;
}
function gearShape() {
  const s = new THREE.Shape(), n = 8;
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2, r = i % 2 ? 0.75 : 1;
    const p0 = [Math.cos(a0) * r, Math.sin(a0) * r], p1 = [Math.cos(a1) * r, Math.sin(a1) * r];
    i === 0 ? s.moveTo(...p0) : s.lineTo(...p0);
    s.lineTo(...p1);
  }
  const h = new THREE.Path(); h.absarc(0, 0, 0.32, 0, Math.PI * 2, true); s.holes.push(h);
  return s;
}
function toothShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.8, 0.5);
  s.bezierCurveTo(-0.9, 1.1, -0.2, 1.1, 0, 0.85);
  s.bezierCurveTo(0.2, 1.1, 0.9, 1.1, 0.8, 0.5);
  s.bezierCurveTo(0.75, 0, 0.6, -0.2, 0.5, -1);
  s.bezierCurveTo(0.4, -1.2, 0.2, -1.1, 0.15, -0.6);
  s.lineTo(-0.15, -0.6);
  s.bezierCurveTo(-0.2, -1.1, -0.4, -1.2, -0.5, -1);
  s.bezierCurveTo(-0.6, -0.2, -0.75, 0, -0.8, 0.5);
  return s;
}
function leafShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -1);
  s.bezierCurveTo(0.9, -0.5, 0.8, 0.6, 0, 1);
  s.bezierCurveTo(-0.8, 0.6, -0.9, -0.5, 0, -1);
  return s;
}

function build(key) {
  const M = MASCOTS3D[key] || MASCOTS3D.buho;
  const C = mat(M.c), B = mat(M.b), D = mat(M.d);
  const root = new THREE.Group();      // salta y se inclina
  const body = new THREE.Group();      // respira
  root.add(body);
  const P = { root, body, beakLow: null, mouth: null, ears: [], floppy: [] };

  // cuerpo
  const frog = M.kind === 'frog';
  const bodyMesh = sc(at(sphere(1, C, 64), BODY_C.x, BODY_C.y, BODY_C.z), frog ? 1.12 : BODY_S.x, frog ? 1.0 : BODY_S.y, BODY_S.z);
  body.add(bodyMesh);
  // panza
  const bellyR = M.kind === 'penguin' ? 0.86 : 0.76;
  body.add(sc(at(sphere(bellyR, B), 0, 0.86, 0.42), 1, 1.05, 0.62));

  // ojos
  const eyeY = frog ? 1.98 : 1.47, eyeX = frog ? 0.42 : 0.36;
  const eyeZ = frog ? 0.42 : surfZ(eyeX, eyeY) - 0.07;
  if (frog) [-1, 1].forEach(sx => body.add(at(sphere(0.37, C), sx * eyeX, eyeY - 0.04, eyeZ - 0.12)));
  if (M.kind === 'penguin') body.add(sc(at(sphere(0.7, B), 0, 1.42, 0.38), 1.05, 0.8, 0.7));
  if (M.mask) body.add(sc(at(sphere(0.52, D), 0, eyeY, eyeZ - 0.12), 1.55, 0.55, 0.55));
  const lidMat = M.mask || M.patches ? D : M.kind === 'penguin' ? B : C;
  P.eyes = []; P.pupils = []; P.lids = [];
  [-1, 1].forEach(sx => {
    const g = at(new THREE.Group(), sx * eyeX, eyeY, eyeZ);
    if (M.patches) g.add(sc(at(new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 24), D), 0, -0.04, -0.12), 1, 1.2, 0.6).rotateZ(sx * 0.4));
    g.add(sphere(0.27, mat('#ffffff', 0.25)));
    const pupil = new THREE.Group();
    pupil.add(at(sphere(0.135, mat('#141b24', 0.15)), 0, 0, 0.2));
    pupil.add(at(sphere(0.045, mat('#ffffff', 0.1, { emissive: '#ffffff', emissiveIntensity: 0.6 })), 0.05, 0.06, 0.31));
    g.add(pupil);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.295, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), lidMat);
    g.add(lid);
    body.add(g);
    P.eyes.push(g); P.pupils.push(pupil); P.lids.push(lid);
  });

  // mejillas
  [-1, 1].forEach(sx => {
    const ch = sc(at(sphere(0.11, mat('#ff7a8a', 0.6, { transparent: true, opacity: 0.55 })), sx * 0.6, 1.16, surfZ(0.6, 1.16) + 0.0), 1.3, 0.8, 0.4);
    if (!frog) body.add(ch);
  });

  // boca o pico
  const beak = ['owl', 'parrot', 'bird', 'penguin'].includes(M.kind);
  const mouthY = frog ? 1.3 : 1.17;
  const mz = frog ? 0.98 : surfZ(0, mouthY);
  if (beak) {
    const bc = M.kind === 'parrot' ? '#2b2b2b' : M.kind === 'bird' ? '#e8c66a' : '#f5a524';
    const up = new THREE.Mesh(new THREE.ConeGeometry(0.15, M.kind === 'bird' || M.kind === 'parrot' ? 0.42 : 0.34, 24), mat(bc, 0.35));
    up.rotation.x = Math.PI / 2 + (M.kind === 'parrot' || M.kind === 'bird' ? 0.45 : 0.2);
    body.add(at(up, 0, mouthY + 0.07, mz + 0.1));
    const lowPivot = at(new THREE.Group(), 0, mouthY - 0.02, mz - 0.02);
    const low = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 20), mat(bc, 0.4));
    low.rotation.x = Math.PI / 2 - 0.25; low.position.set(0, -0.02, 0.1);
    lowPivot.add(low); body.add(lowPivot); P.beakLow = lowPivot;
  } else {
    const sn = M.snout ? 0.16 : 0;
    if (M.snout) body.add(sc(at(sphere(0.34, B), 0, mouthY + 0.02, surfZ(0, mouthY) - 0.12), 1.15, 0.78, 0.75));
    if (M.wool) [[0, 2.22, 0.1, 0.2], [-0.2, 2.15, 0.12, 0.16], [0.2, 2.15, 0.12, 0.16], [0, 2.1, 0.3, 0.15]].forEach(([x, y, z, r]) => body.add(at(sphere(r, B), x, y, z)));
    if (!frog) body.add(at(sc(sphere(0.085, mat('#2a1f1f', 0.25)), 1.25, 0.9, 0.9), 0, mouthY + 0.12, mz + 0.02 + sn));
    const mouth = at(sc(sphere(0.13, mat('#7a1f2e', 0.5)), frog ? 2.6 : 1.3, 0.35, 0.45), 0, mouthY - 0.05, (frog ? mz : surfZ(0, mouthY - 0.05)) - 0.02 + sn);
    body.add(mouth); P.mouth = mouth; P.mouthBase = mouth.scale.clone();
    if (M.teeth) body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.05), mat('#ffffff', 0.3)), 0, mouthY - 0.12, surfZ(0, mouthY - 0.12) + 0.02));
  }

  // orejas
  const K = M.kind;
  if (K === 'round') [-1, 1].forEach(sx => {
    const e = at(new THREE.Group(), sx * 0.66, 2.0, 0);
    e.add(sc(sphere(0.3, D), 1, 1, 0.6));
    e.add(at(sc(sphere(0.17, B), 1, 1, 0.4), 0, 0, 0.1));
    body.add(e); P.ears.push(e);
  });
  if (K === 'pointy') [-1, 1].forEach(sx => {
    const e = at(new THREE.Group(), sx * 0.56, 2.08, 0); e.rotation.z = -sx * 0.32;
    e.add(sc(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 32), C), 1, 1, 0.55));
    e.add(at(sc(new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.45, 24), B), 1, 1, 0.4), 0, -0.05, 0.08));
    body.add(e); P.ears.push(e);
  });
  if (K === 'owl') [-1, 1].forEach(sx => {
    const e = at(new THREE.Group(), sx * 0.62, 2.0, 0); e.rotation.z = -sx * 0.55;
    e.add(sc(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 24), D), 1, 1, 0.6));
    body.add(e); P.ears.push(e);
  });
  if (K === 'llama') [-1, 1].forEach(sx => {
    const e = at(new THREE.Group(), sx * 0.38, 2.15, 0); e.rotation.z = -sx * 0.18;
    const L = M.snout ? 0.3 : 0.62;
    e.add(at(sc(new THREE.Mesh(new THREE.CapsuleGeometry(0.14, L, 8, 20), C), 1, 1, 0.7), 0, 0.22 + L / 2.6, 0));
    e.add(at(sc(new THREE.Mesh(new THREE.CapsuleGeometry(0.07, L * 0.75, 8, 16), D), 1, 1, 0.4), 0, 0.22 + L / 2.6, 0.06));
    if (M.snout) { e.rotation.z = -sx * 0.55; e.position.x = sx * 0.5; e.position.y = 2.02; }
    body.add(e); P.ears.push(e);
  });
  if (K === 'floppy') [-1, 1].forEach(sx => {
    const e = at(new THREE.Group(), sx * 0.74, 1.88, 0);
    e.add(at(sc(new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.5, 8, 20), D), 1, 1, 0.55), 0, -0.36, 0));
    e.rotation.z = sx * 0.28;
    body.add(e); P.floppy.push(e);
  });
  if (K === 'parrot') [-0.35, 0, 0.35].forEach((a, i) => {
    const f = at(new THREE.Group(), 0, 2.15, -0.05 - i * 0.04); f.rotation.z = a; f.rotation.x = -0.35;
    f.add(at(sc(new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.55, 16), D), 1, 1, 0.6), 0, 0.25, 0));
    body.add(f); P.ears.push(f);
  });
  if (K === 'bird') {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.93, 0.17, 20, 64), mat('#f2f2f2', 0.85));
    t.rotation.x = Math.PI / 2; t.scale.set(1, 0.95, 1); body.add(at(t, 0, 0.88, 0));
  }
  if (K === 'turtle') {
    body.add(sc(at(sphere(1.02, D), 0, 1.0, -0.3), 1.2, 1.08, 0.75));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      body.add(sc(at(sphere(0.24, mat('#5a9a63')), Math.cos(a) * 0.45, 1.05 + Math.sin(a) * 0.5, -1.02), 1, 1, 0.3));
    }
  }

  // brazos
  P.arms = [-1, 1].map(sx => {
    const a = at(new THREE.Group(), sx * 0.9, 1.02, 0.05);
    const limb = at(sc(sphere(0.2, K === 'penguin' || K === 'bird' || K === 'owl' || K === 'parrot' ? D : C), 1, 1.9, 0.8), 0, -0.3, 0);
    a.add(limb);
    a.userData.sx = sx;
    body.add(a);
    return a;
  });
  const hand = at(new THREE.Group(), 0, -0.62, 0.12);
  P.arms[1].add(hand);

  // patas
  const footM = mat(M.feet || M.d, 0.5);
  [-1, 1].forEach(sx => root.add(sc(at(sphere(0.22, footM), sx * 0.38, 0.08, 0.32), 1.25, 0.5, 1.5)));

  // accesorios
  const A = M.acc, gold = mat('#f5c518', 0.35, { metalness: 0.3 });
  if (A === 'steth') {
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 12, 48, Math.PI), mat('#2b4459', 0.4));
    t.rotation.z = Math.PI; body.add(at(t, 0, 1.0, 0.82));
    body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32), mat('#c7d3de', 0.2, { metalness: 0.6 })).rotateX(Math.PI / 2), 0.32, 0.55, 0.9));
  }
  if (A === 'helmet') {
    const cap = sc(at(new THREE.Mesh(new THREE.SphereGeometry(1.04, 48, 24, 0, Math.PI * 2, 0, 1.0), mat('#f5c518', 0.35)), 0, BODY_C.y, 0), BODY_S.x, BODY_S.y, BODY_S.z);
    body.add(cap);
    const brimY = BODY_C.y + Math.cos(1.0) * 1.04 * BODY_S.y;
    body.add(sc(at(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.06, 48), mat('#e0a800', 0.4)), 0, brimY, 0.06), 1, 1, 1));
    if (P.ears.length) P.ears.forEach(e => e.position.y -= 0.05);
  }
  if (A === 'glasses') {
    const gm = mat('#1b2430', 0.3);
    P.eyes.forEach(e => body.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 12, 40), gm), e.position.x, e.position.y, e.position.z + 0.2)));
    body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 8), gm).rotateZ(Math.PI / 2), 0, eyeY + 0.03, eyeZ + 0.26));
  }
  if (A === 'tie') {
    const tm = mat('#c62f3f', 0.45);
    body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.08), tm), 0, 0.98, surfZ(0, 0.98) + 0.02));
    const ts = new THREE.Shape(); ts.moveTo(-0.08, 0.2); ts.lineTo(0.08, 0.2); ts.lineTo(0.15, -0.18); ts.lineTo(0, -0.3); ts.lineTo(-0.15, -0.18); ts.closePath();
    const c = extrude(ts, 0.03, tm); c.rotation.x = -0.25;
    body.add(at(c, 0, 0.74, surfZ(0, 0.74) + 0.06));
  }
  if (A === 'book') {
    const bk = new THREE.Group();
    bk.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.46, 0.12), mat('#2f6fd6', 0.5)));
    bk.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.4, 0.13), mat('#fffaf0', 0.8)), 0.03, 0, 0));
    bk.rotation.x = -0.25; body.add(at(bk, 0, 0.55, 0.98));
  }
  if (A === 'heart') body.add(at(sc(extrude(heartShape(), 0.2, mat('#ff5b7f', 0.35)), 0.2, 0.2, 0.2), 0, 0.82, surfZ(0, 0.82) + 0.08));
  if (A === 'pencil') {
    const pc = new THREE.Group();
    pc.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.62, 6), mat('#f5c518', 0.4)));
    pc.add(at(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), mat('#f2d2a6', 0.6)), 0, -0.39, 0).rotateX(Math.PI));
    pc.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.1, 12), mat('#ff7a8a', 0.6)), 0, 0.36, 0));
    pc.rotation.x = 0.4; hand.add(pc);
  }
  if (A === 'mic') {
    const mc = new THREE.Group();
    mc.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.42, 16), mat('#444', 0.4)));
    mc.add(at(sphere(0.12, mat('#2a2a2a', 0.6)), 0, 0.27, 0));
    mc.rotation.x = 0.3; hand.add(at(mc, 0, 0.1, 0));
  }
  if (A === 'cross') {
    const cap = sc(at(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.36, 40), mat('#ffffff', 0.5)), 0, 2.2, 0.12), 1, 1, 0.62);
    cap.rotation.x = -0.25; body.add(cap);
    const rm = mat('#e5273f', 0.4);
    body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.04), rm), 0, 2.22, 0.45));
    body.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.04), rm), 0, 2.22, 0.45));
  }
  if (A === 'tooth') hand.add(sc(extrude(toothShape(), 0.3, mat('#ffffff', 0.25)), 0.22, 0.22, 0.22));
  if (A === 'gear') { const g = sc(extrude(gearShape(), 0.25, gold), 0.24, 0.24, 0.24); hand.add(g); P.spin = g; }
  if (A === 'coin') {
    const cn = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 40), gold);
    cn.rotation.x = Math.PI / 2; hand.add(cn); P.spin = cn;
  }
  if (A === 'map') {
    const mp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.42, 0.02), mat('#f2e3b3', 0.8));
    mp.rotation.x = -0.4; hand.add(at(mp, -0.1, 0, 0.05));
    hand.add(at(sphere(0.04, mat('#e5273f', 0.4)), 0.05, 0.05, 0.08));
  }
  if (A === 'chef') {
    const wm = mat('#ffffff', 0.7);
    body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.42, 40), wm), 0, 2.2, 0));
    [[0, 2.6, 0, 0.42], [-0.3, 2.52, 0.05, 0.28], [0.3, 2.52, 0.05, 0.28], [0, 2.55, 0.25, 0.26]].forEach(([x, y, z, r]) => body.add(at(sphere(r, wm), x, y, z)));
    P.ears.forEach(e => e.visible = false);
  }
  if (A === 'leaf') { const lf = sc(extrude(leafShape(), 0.08, mat('#2fa84f', 0.45)), 0.3, 0.3, 0.3); lf.rotation.z = 0.5; hand.add(lf); }

  // sombras falsas debajo
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const cx = cv.getContext('2d'), gr = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.005; sh.scale.set(1, 0.7, 1);
  P.shadow = sh;
  return P;
}

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

export function create(container, key) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  cam.position.set(0, 1.55, 8.2); cam.lookAt(0, 1.2, 0);
  scene.add(new THREE.HemisphereLight('#ffffff', '#8a7f74', 1.5));
  const key1 = new THREE.DirectionalLight('#fff4e6', 2.4); key1.position.set(3, 5, 5); scene.add(key1);
  const rim = new THREE.DirectionalLight('#cfe4ff', 1.6); rim.position.set(-4, 3, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight('#ffffff', 0.5); fill.position.set(-3, 1, 4); scene.add(fill);

  let P = build(key);
  scene.add(P.root); scene.add(P.shadow);

  const st = { mode: 'idle', talking: false, look: 0, t: 0, blinkAt: 2, blinkT: 0, modeT: 0, lidC: 0.05, mouthO: 0, jump: 0,
    armZ: [0, 0], armX: [0, 0], tiltZ: 0, lean: 0, rotY: 0, pupX: 0, pupY: 0 };

  function resize() {
    const w = container.clientWidth || 300, h = container.clientHeight || 300;
    renderer.setSize(w, h, false); cam.aspect = w / h;
    cam.fov = w / h < 0.9 ? 34 : 28; cam.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(container); resize();

  const clock = new THREE.Clock();
  let raf = 0, alive = true;
  function frame() {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    st.t += dt; st.modeT += dt;
    const t = st.t, m = st.mode;

    // respiración
    const br = Math.sin(t * 2.2) * 0.018;
    P.body.scale.set(1 - br * 0.5, 1 + br, 1 - br * 0.5);

    // parpadeo
    if (t > st.blinkAt) { st.blinkT = 0.14; st.blinkAt = t + 2.2 + Math.random() * 3; }
    st.blinkT -= dt;
    const baseLid = { idle: 0.08, happy: 0.5, sad: 0.45, think: 0.3, wave: 0.12 }[m] ?? 0.08;
    st.lidC = damp(st.lidC, st.blinkT > 0 ? 1 : baseLid, 22, dt);
    P.lids.forEach((l, i) => {
      l.rotation.x = -1.25 + st.lidC * 2.8;
      l.rotation.z = m === 'sad' ? (i ? -0.35 : 0.35) : m === 'think' ? (i ? 0.15 : -0.15) : 0;
    });

    // boca
    let mo = 0;
    if (st.talking) mo = 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 3.7));
    else if (m === 'happy') mo = 0.75;
    else if (m === 'sad') mo = 0.15;
    st.mouthO = damp(st.mouthO, mo, 25, dt);
    if (P.mouth) P.mouth.scale.set(P.mouthBase.x * (m === 'sad' ? 0.7 : 1), P.mouthBase.y * (0.6 + st.mouthO * 3.2), P.mouthBase.z);
    if (P.beakLow) P.beakLow.rotation.x = st.mouthO * 0.55;

    // pupilas
    let px = st.look * 0.07, py = 0;
    if (m === 'think') { px = -0.06; py = 0.08; }
    if (m === 'sad') py = -0.07;
    st.pupX = damp(st.pupX, px, 8, dt); st.pupY = damp(st.pupY, py, 8, dt);
    P.pupils.forEach(p => p.position.set(st.pupX, st.pupY, 0));

    // cuerpo
    let rotY = st.look * 0.35 + Math.sin(t * 0.7) * 0.05, tilt = Math.sin(t * 0.9) * 0.03, lean = 0, jumpT = 0;
    let az = [-0.15 + Math.sin(t * 1.6) * 0.05, 0.15 - Math.sin(t * 1.6) * 0.05], ax = [0, 0];
    if (st.talking) { az[1] = 0.35 + Math.abs(Math.sin(t * 2.6)) * 0.55; ax[1] = -0.4; tilt += Math.sin(t * 2.1) * 0.05; }
    if (m === 'happy') {
      jumpT = Math.abs(Math.sin(st.modeT * 7)) * 0.32 * Math.max(0, 1 - st.modeT / 2.2);
      az = [-2.5 - Math.sin(t * 14) * 0.25, 2.5 + Math.sin(t * 14) * 0.25]; tilt = Math.sin(t * 6) * 0.07;
    }
    if (m === 'sad') { lean = 0.14; tilt = -0.08; az = [-0.05, -0.5]; ax = [0, -2.35]; rotY *= 0.3; }
    if (m === 'think') { tilt = 0.12; az = [-0.15, -0.35]; ax = [0, -1.85]; }
    if (m === 'wave') { az = [-0.15, 2.4 + Math.sin(t * 10) * 0.35]; tilt = 0.06; }
    st.rotY = damp(st.rotY, rotY, 6, dt); st.tiltZ = damp(st.tiltZ, tilt, 6, dt); st.lean = damp(st.lean, lean, 6, dt);
    st.jump = damp(st.jump, jumpT, 30, dt);
    P.root.rotation.set(st.lean, st.rotY, st.tiltZ);
    P.root.position.y = st.jump;
    P.shadow.scale.set(1 - st.jump * 0.8, 0.7 - st.jump * 0.5, 1);
    P.arms.forEach((a, i) => {
      st.armZ[i] = damp(st.armZ[i], az[i], 9, dt); st.armX[i] = damp(st.armX[i], ax[i], 9, dt);
      a.rotation.set(st.armX[i], 0, st.armZ[i]);
    });
    P.floppy.forEach((e, i) => e.rotation.z = (i ? -1 : 1) * -0.28 + Math.sin(t * 3 + i) * (m === 'happy' ? 0.25 : 0.06));
    P.ears.forEach((e, i) => e.rotation.x = Math.sin(t * 2.5 + i) * 0.04);
    if (P.spin) P.spin.rotation.z += dt * (m === 'happy' ? 6 : 1.2);
    if (m === 'happy' && st.modeT > 2.6) setMode('idle');
    if (m === 'wave' && st.modeT > 2.2) setMode('idle');

    renderer.render(scene, cam);
  }
  frame();

  function setMode(mode) { if (st.mode !== mode) { st.mode = mode; st.modeT = 0; } }
  return {
    setMode,
    setTalking(on) { st.talking = !!on; },
    look(x) { st.look = Math.max(-1, Math.min(1, x || 0)); },
    setMascot(k) {
      scene.remove(P.root); scene.remove(P.shadow);
      P.root.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      P = build(k); scene.add(P.root); scene.add(P.shadow);
    },
    dispose() {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      renderer.dispose(); renderer.domElement.remove();
    }
  };
}

// Dibuja una mascota una vez y devuelve una imagen PNG (para las tarjetas del inicio)
let snapR = null;
export function snapshot(key, w = 280, h = 280) {
  try {
    if (!snapR) {
      snapR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      snapR.outputColorSpace = THREE.SRGBColorSpace; snapR.toneMapping = THREE.ACESFilmicToneMapping;
    }
    snapR.setPixelRatio(1); snapR.setSize(w, h, false);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(28, w / h, 0.1, 50);
    cam.position.set(1.2, 1.6, 8.0); cam.lookAt(0, 1.2, 0);
    scene.add(new THREE.HemisphereLight('#ffffff', '#8a7f74', 1.5));
    const k = new THREE.DirectionalLight('#fff4e6', 2.4); k.position.set(3, 5, 5); scene.add(k);
    const r = new THREE.DirectionalLight('#cfe4ff', 1.6); r.position.set(-4, 3, -4); scene.add(r);
    const P = build(key); P.root.rotation.y = 0.15; P.arms[0].rotation.z = -0.15; P.arms[1].rotation.z = 0.15;
    P.lids.forEach(l => l.rotation.x = -1.1);
    scene.add(P.root); scene.add(P.shadow);
    snapR.render(scene, cam);
    const url = snapR.domElement.toDataURL('image/png');
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    return url;
  } catch (e) { return null; }
}
