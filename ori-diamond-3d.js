/* ===== Diamant chromé 3D (Three.js) — icône de l'offre "Site sur-mesure" =====
   Calque : le bloc de l'icône porte l'attribut data-diamond (l'image à l'intérieur sert de secours).
   - Taille brillant calculée en code (table, couronne, rondiste, pavillon) : facettes parfaitement nettes
   - Chrome miroir (même studio noir et blanc que le logo), légère touche irisée bleutée
   - Tourne lentement en continu, accélère au survol de la carte, pause hors écran */
import * as THREE from 'three';

// ---- Réglages ----
const SPEED = 0.45;        // vitesse de rotation au repos (tours de radian / s)
const HOVER_SPEED = 1.6;   // vitesse au survol de la carte
const TILT = 0.3;          // inclinaison vers l'avant (on voit la table du dessus)
const SIZE = 0.98;         // taille du diamant dans son bloc (1 = toute la largeur)
const IRIS = 0.15; 
const EDGES = 0.55;        // arêtes blanches entre les facettes (0 = aucune)
        // reflets irisés bleutés (0 = chrome pur)

const host = document.querySelector('[data-diamond]');
if (host) try { init(); } catch (e) { console.warn('Diamant 3D :', e); }

function brilliant() {
  // proportions d'une taille brillant (rayon du rondiste = 1)
  const N = 8, TABLE = 0.58, CROWN = 0.46, STAR = 0.82, STAR_Y = 0.27, GIRDLE = 0.035, PAV = 0.98, PAV_R = 0.52, PAV_Y = 0.45;
  const pt = (r, a, y) => new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a));
  const step = (Math.PI * 2) / N;
  const T = [], C = [], G = [], B = [], P = [];
  for (let k = 0; k < N; k++) {
    T.push(pt(TABLE, k * step, CROWN));
    C.push(pt(STAR, k * step + step / 2, STAR_Y));
    P.push(pt(PAV_R, k * step, -GIRDLE - PAV_Y));
  }
  for (let j = 0; j < N * 2; j++) { G.push(pt(1, (j * step) / 2, 0)); B.push(pt(1, (j * step) / 2, -GIRDLE)); }
  const top = new THREE.Vector3(0, CROWN, 0), apex = new THREE.Vector3(0, -GIRDLE - PAV, 0);
  const tris = [];
  const tri = (a, b, c) => tris.push(a, b, c);
  const quad = (a, b, c, d) => { tri(a, b, c); tri(a, c, d); };
  const g = (j) => G[(j + 2 * N) % (2 * N)], b = (j) => B[(j + 2 * N) % (2 * N)];
  for (let k = 0; k < N; k++) {
    const k1 = (k + 1) % N, km = (k + N - 1) % N;
    tri(top, T[k], T[k1]);                          // table
    tri(T[k], C[k], T[k1]);                          // étoiles
    quad(T[k], C[km], g(2 * k), C[k]);               // bézels (cerfs-volants)
    tri(C[k], g(2 * k), g(2 * k + 1));               // haléfis supérieurs
    tri(C[k], g(2 * k + 1), g(2 * k + 2));
    tri(b(2 * k), P[k], b(2 * k + 1));               // haléfis inférieurs
    tri(b(2 * k + 1), P[k1], b(2 * k + 2));
    tri(b(2 * k + 1), P[k], P[k1]);
    tri(P[k], apex, P[k1]);                          // pavillon
  }
  for (let j = 0; j < 2 * N; j++) quad(g(j), b(j), b(j + 1), g(j + 1)); // rondiste
  // faces orientées vers l'extérieur
  const pos = [];
  for (let i = 0; i < tris.length; i += 3) {
    let [a, bb, c] = [tris[i], tris[i + 1], tris[i + 2]];
    const n = new THREE.Vector3().subVectors(bb, a).cross(new THREE.Vector3().subVectors(c, a));
    const m = new THREE.Vector3().add(a).add(bb).add(c).divideScalar(3);
    if (n.dot(m) < 0) [bb, c] = [c, bb];
    pos.push(a.x, a.y, a.z, bb.x, bb.y, bb.z, c.x, c.y, c.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals(); // non indexé = facettes plates, bien nettes
  geo.translate(0, (GIRDLE + PAV - CROWN) / 2, 0); // centré en hauteur
  return geo;
}

function studioEnv(renderer) {
  // même "studio chrome" que le logo : ciel blanc, horizon noir, sol gris, boîtes à lumière
  const studio = new THREE.Scene();
  const dome = new THREE.SphereGeometry(50, 64, 64), col = [], p = dome.attributes.position;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 50, az = Math.atan2(p.getZ(i), p.getX(i));
    const sky = y > 0.12 ? 0.06 + 0.72 * sm(0.18, 0.75, y) : 0.05 + 0.6 * sm(-0.12, -0.8, y); // sol plus clair : le pavillon reste argenté
    // bandes claires / sombres tout autour : chaque facette reflète une bande différente,
    // et ça change en tournant -> le scintillement du diamant
    const band = 0.06 + 0.94 * sm(-0.45, 0.45, Math.sin(az * 5 + 0.6) + 0.35 * Math.sin(az * 11 + y * 4));
    const top = sm(0.7, 0.95, y), dx = (p.getX(i) + p.getZ(i) * 0.6) / 50;
    const sheen = Math.exp(-Math.pow(dx * 3.2 - 0.4, 2)); // reflet en biais sur la table, comme sur le visuel
    const v = sky * band * (1 - top * 0.45) + top * (0.35 + 0.9 * sheen);
    const blue = sm(0.6, 0.98, Math.sin(az * 3 - 1.2)) * sm(-0.3, 0.4, y) * 0.5; // reflets bleutés comme sur le visuel
    col.push(v * (1 - blue * 0.22), v * (1 - blue * 0.04), v * (1 + blue * 0.35)); // bleu acier léger, seulement sur les reflets clairs
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  studio.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const strip = (w, h, x, y, z, v) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v * 1.05), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); studio.add(m);
  };
  strip(4, 30, -24, 6, 16, 4); strip(4, 30, 24, 6, 16, 4); strip(26, 1.6, 0, 9, 32, 6); strip(10, 10, 0, 10, -32, 2);
  strip(3, 3, -14, 20, 26, 9); strip(3, 3, 16, -4, 28, 7); // petites sources : les éclats sur les facettes
  return new THREE.PMREMGenerator(renderer).fromScene(studio, 0.005).texture;
}

function init() {
  const img = host.querySelector('img');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = studioEnv(renderer);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xeef0f6, metalness: 1, roughness: 0.1, flatShading: true,
    iridescence: IRIS, iridescenceIOR: 1.6, iridescenceThicknessRange: [250, 450]
  });
  const gem = new THREE.Mesh(brilliant(), mat);
  // arêtes fines et claires entre les facettes : le côté "taillé" net du visuel
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(gem.geometry, 1),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: EDGES }));
  gem.add(edges);
  const pivot = new THREE.Group();
  pivot.add(gem); pivot.rotation.x = TILT; scene.add(pivot);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  function layout() {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // le diamant (largeur 2) occupe SIZE de la largeur du bloc
    const visW = 2 / SIZE;
    camera.position.set(0, 0, (visW / 2 / camera.aspect) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) + 1);
    camera.updateProjectionMatrix();
  }
  host.appendChild(canvas);
  layout();
  gem.rotation.y = 0.35;
  renderer.render(scene, camera);
  if (img) img.style.opacity = '0'; // l'image reste là en secours, invisible

  const card = host.closest('.c_offre_card') || host;
  let target = SPEED, speed = SPEED, visible = true, running = false, last = 0;
  card.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') target = HOVER_SPEED; });
  card.addEventListener('pointerleave', () => { target = SPEED; });

  function frame(now) {
    if (!visible || reduce) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    speed += (target - speed) * (1 - Math.pow(0.04, dt)); // accélère / ralentit en douceur
    gem.rotation.y += speed * dt;
    pivot.rotation.z = Math.sin(now / 2400) * 0.04;      // très léger balancement
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  const start = () => { if (!running && !reduce) { running = true; last = performance.now(); requestAnimationFrame(frame); } };
  if ('IntersectionObserver' in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) start(); }).observe(host);
  else start();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); renderer.render(scene, camera); }, 100); });
}
