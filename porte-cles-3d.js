/* ============================================================
   PORTE-CLÉS 3D (Three.js) : attribut data-charms sur le calque du hero
   - breloques en volume : silhouette exacte de chaque image, épaisseur + tranche chromée
   - vraie physique : gravité, inertie, chaînes de longueur fixe, collisions
   - au survol : on effleure doucement ; on peut attraper et lâcher une breloque
   - tiré vers le haut au scroll, redescend avec rebond
   Images : window.ORI_CHARM_DATA (images intégrées) sinon les fichiers du CDN
   ============================================================ */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// contours d'images (d3-contour, MIT) — intégré pour éviter une dépendance de plus
const { contours } = (() => { var Q=$(C),dr=$(T);function $(r){return function(e,o,i=o){if(!((o=+o)>=0))throw new RangeError("invalid rx");if(!((i=+i)>=0))throw new RangeError("invalid ry");let{data:t,width:a,height:f}=e;if(!((a=Math.floor(a))>=0))throw new RangeError("invalid width");if(!((f=Math.floor(f!==void 0?f:t.length/a))>=0))throw new RangeError("invalid height");if(!a||!f||!o&&!i)return e;let h=o&&r(o),l=i&&r(i),n=t.slice();return h&&l?(j(h,n,t,a,f),j(h,t,n,a,f),j(h,n,t,a,f),D(l,t,n,a,f),D(l,n,t,a,f),D(l,t,n,a,f)):h?(j(h,t,n,a,f),j(h,n,t,a,f),j(h,t,n,a,f)):l&&(D(l,t,n,a,f),D(l,n,t,a,f),D(l,t,n,a,f)),e}}function j(r,e,o,i,t){for(let a=0,f=i*t;a<f;)r(e,o,a,a+=i,1)}function D(r,e,o,i,t){for(let a=0,f=i*t;a<i;++a)r(e,o,a,a+f,i)}function T(r){let e=C(r);return(o,i,t,a,f)=>{t<<=2,a<<=2,f<<=2,e(o,i,t+0,a+0,f),e(o,i,t+1,a+1,f),e(o,i,t+2,a+2,f),e(o,i,t+3,a+3,f)}}function C(r){let e=Math.floor(r);if(e===r)return W(r);let o=r-e,i=2*r+1;return(t,a,f,h,l)=>{if(!((h-=l)>=f))return;let n=e*a[f],c=l*e,M=c+l;for(let s=f,d=f+c;s<d;s+=l)n+=a[Math.min(h,s)];for(let s=f,d=h;s<=d;s+=l)n+=a[Math.min(h,s+c)],t[s]=(n+o*(a[Math.max(f,s-M)]+a[Math.min(h,s+M)]))/i,n-=a[Math.max(f,s-c)]}}function W(r){let e=2*r+1;return(o,i,t,a,f)=>{if(!((a-=f)>=t))return;let h=r*i[t],l=f*r;for(let n=t,c=t+l;n<c;n+=f)h+=i[Math.min(a,n)];for(let n=t,c=a;n<=c;n+=f)h+=i[Math.min(a,n+l)],o[n]=h/e,h-=i[Math.max(t,n-l)]}}function X(r,e){let o=0;if(e===void 0)for(let i of r)i!=null&&(i=+i)>=i&&++o;else{let i=-1;for(let t of r)(t=e(t,++i,r))!=null&&(t=+t)>=t&&++o}return o}function Y(r,e){let o,i;if(e===void 0)for(let t of r)t!=null&&(o===void 0?t>=t&&(o=i=t):(o>t&&(o=t),i<t&&(i=t)));else{let t=-1;for(let a of r)(a=e(a,++t,r))!=null&&(o===void 0?a>=a&&(o=i=a):(o>a&&(o=a),i<a&&(i=a)))}return[o,i]}var Z=Math.sqrt(50),k=Math.sqrt(10),b=Math.sqrt(2);function S(r,e,o){let i=(e-r)/Math.max(0,o),t=Math.floor(Math.log10(i)),a=i/Math.pow(10,t),f=a>=Z?10:a>=k?5:a>=b?2:1,h,l,n;return t<0?(n=Math.pow(10,-t)/f,h=Math.round(r*n),l=Math.round(e*n),h/n<r&&++h,l/n>e&&--l,n=-n):(n=Math.pow(10,t)*f,h=Math.round(r/n),l=Math.round(e/n),h*n<r&&++h,l*n>e&&--l),l<h&&.5<=o&&o<2?S(r,e,o*2):[h,l,n]}function G(r,e,o){if(e=+e,r=+r,o=+o,!(o>0))return[];if(r===e)return[r];let i=e<r,[t,a,f]=i?S(e,r,o):S(r,e,o);if(!(a>=t))return[];let h=a-t+1,l=new Array(h);if(i)if(f<0)for(let n=0;n<h;++n)l[n]=(a-n)/-f;else for(let n=0;n<h;++n)l[n]=(a-n)*f;else if(f<0)for(let n=0;n<h;++n)l[n]=(t+n)/-f;else for(let n=0;n<h;++n)l[n]=(t+n)*f;return l}function I(r,e,o){return e=+e,r=+r,o=+o,S(r,e,o)[2]}function B(r,e,o){let i;for(;;){let t=I(r,e,o);if(t===i||t===0||!isFinite(t))return[r,e];t>0?(r=Math.floor(r/t)*t,e=Math.ceil(e/t)*t):t<0&&(r=Math.ceil(r*t)/t,e=Math.floor(e*t)/t),i=t}}function rr(r){return Math.max(1,Math.ceil(Math.log(X(r))/Math.LN2)+1)}function H(r,e){let o;if(e===void 0)for(let i of r)i!=null&&(o<i||o===void 0&&i>=i)&&(o=i);else{let i=-1;for(let t of r)(t=e(t,++i,r))!=null&&(o<t||o===void 0&&t>=t)&&(o=t)}return o}var tr=Array.prototype,J=tr.slice;function nr(r,e){return r-e}function er(r){for(var e=0,o=r.length,i=r[o-1][1]*r[0][0]-r[o-1][0]*r[0][1];++e<o;)i+=r[e-1][1]*r[e][0]-r[e-1][0]*r[e][1];return i}var L=r=>()=>r;function or(r,e){for(var o=-1,i=e.length,t;++o<i;)if(t=ir(r,e[o]))return t;return 0}function ir(r,e){for(var o=e[0],i=e[1],t=-1,a=0,f=r.length,h=f-1;a<f;h=a++){var l=r[a],n=l[0],c=l[1],M=r[h],s=M[0],d=M[1];if(ar(l,M,e))return 0;c>i!=d>i&&o<(s-n)*(i-c)/(d-c)+n&&(t=-t)}return t}function ar(r,e,o){var i;return fr(r,e,o)&&ur(r[i=+(r[0]===e[0])],o[i],e[i])}function fr(r,e,o){return(e[0]-r[0])*(o[1]-r[1])===(o[0]-r[0])*(e[1]-r[1])}function ur(r,e,o){return r<=e&&e<=o||o<=e&&e<=r}function lr(){}var R=[[],[[[1,1.5],[.5,1]]],[[[1.5,1],[1,1.5]]],[[[1.5,1],[.5,1]]],[[[1,.5],[1.5,1]]],[[[1,1.5],[.5,1]],[[1,.5],[1.5,1]]],[[[1,.5],[1,1.5]]],[[[1,.5],[.5,1]]],[[[.5,1],[1,.5]]],[[[1,1.5],[1,.5]]],[[[.5,1],[1,.5]],[[1.5,1],[1,1.5]]],[[[1.5,1],[1,.5]]],[[[.5,1],[1.5,1]]],[[[1,1.5],[1.5,1]]],[[[.5,1],[1,1.5]]],[]];function V(){var r=1,e=1,o=rr,i=l;function t(n){var c=o(n);if(Array.isArray(c))c=c.slice().sort(nr);else{let M=Y(n,hr);for(c=G(...B(M[0],M[1],c),c);c[c.length-1]>=M[1];)c.pop();for(;c[1]<M[0];)c.shift()}return c.map(M=>a(n,M))}function a(n,c){let M=c==null?NaN:+c;if(isNaN(M))throw new Error(`invalid value: ${c}`);var s=[],d=[];return f(n,M,function(v){i(v,n,M),er(v)>0?s.push([v]):d.push(v)}),d.forEach(function(v){for(var p=0,q=s.length,E;p<q;++p)if(or((E=s[p])[0],v)!==-1){E.push(v);return}}),{type:"MultiPolygon",value:c,coordinates:s}}function f(n,c,M){var s=new Array,d=new Array,v,p,q,E,u,m;for(v=p=-1,E=P(n[0],c),R[E<<1].forEach(w);++v<r-1;)q=E,E=P(n[v+1],c),R[q|E<<1].forEach(w);for(R[E<<0].forEach(w);++p<e-1;){for(v=-1,E=P(n[p*r+r],c),u=P(n[p*r],c),R[E<<1|u<<2].forEach(w);++v<r-1;)q=E,E=P(n[p*r+r+v+1],c),m=u,u=P(n[p*r+v+1],c),R[q|E<<1|u<<2|m<<3].forEach(w);R[E|u<<3].forEach(w)}for(v=-1,u=n[p*r]>=c,R[u<<2].forEach(w);++v<r-1;)m=u,u=P(n[p*r+v+1],c),R[u<<2|m<<3].forEach(w);R[u<<3].forEach(w);function w(N){var x=[N[0][0]+v,N[0][1]+p],y=[N[1][0]+v,N[1][1]+p],z=h(x),F=h(y),g,A;(g=d[z])?(A=s[F])?(delete d[g.end],delete s[A.start],g===A?(g.ring.push(y),M(g.ring)):s[g.start]=d[A.end]={start:g.start,end:A.end,ring:g.ring.concat(A.ring)}):(delete d[g.end],g.ring.push(y),d[g.end=F]=g):(g=s[F])?(A=d[z])?(delete s[g.start],delete d[A.end],g===A?(g.ring.push(y),M(g.ring)):s[A.start]=d[g.end]={start:A.start,end:g.end,ring:A.ring.concat(g.ring)}):(delete s[g.start],g.ring.unshift(x),s[g.start=z]=g):s[z]=d[F]={start:z,end:F,ring:[x,y]}}}function h(n){return n[0]*2+n[1]*(r+1)*4}function l(n,c,M){n.forEach(function(s){var d=s[0],v=s[1],p=d|0,q=v|0,E=_(c[q*r+p]);d>0&&d<r&&p===d&&(s[0]=K(d,_(c[q*r+p-1]),E,M)),v>0&&v<e&&q===v&&(s[1]=K(v,_(c[(q-1)*r+p]),E,M))})}return t.contour=a,t.size=function(n){if(!arguments.length)return[r,e];var c=Math.floor(n[0]),M=Math.floor(n[1]);if(!(c>=0&&M>=0))throw new Error("invalid size");return r=c,e=M,t},t.thresholds=function(n){return arguments.length?(o=typeof n=="function"?n:Array.isArray(n)?L(J.call(n)):L(n),t):o},t.smooth=function(n){return arguments.length?(i=n?l:lr,t):i===l},t}function hr(r){return isFinite(r)?r:NaN}function P(r,e){return r==null?!1:+r>=e}function _(r){return r==null||isNaN(r=+r)?-1/0:r}function K(r,e,o,i){let t=i-e,a=o-e,f=isFinite(t)||isFinite(a)?t/a:Math.sign(t)/Math.sign(a);return isNaN(f)?r:r+f-.5}function cr(r){return r[0]}function sr(r){return r[1]}function gr(){return 1}function Mr(){var r=cr,e=sr,o=gr,i=960,t=500,a=20,f=2,h=a*3,l=i+h*2>>f,n=t+h*2>>f,c=L(20);function M(u){var m=new Float32Array(l*n),w=Math.pow(2,-f),N=-1;for(let U of u){var x=(r(U,++N,u)+h)*w,y=(e(U,N,u)+h)*w,z=+o(U,N,u);if(z&&x>=0&&x<l&&y>=0&&y<n){var F=Math.floor(x),g=Math.floor(y),A=x-F-.5,O=y-g-.5;m[F+g*l]+=(1-A)*(1-O)*z,m[F+1+g*l]+=A*(1-O)*z,m[F+1+(g+1)*l]+=A*O*z,m[F+(g+1)*l]+=(1-A)*O*z}}return Q({data:m,width:l,height:n},a*w),m}function s(u){var m=M(u),w=c(m),N=Math.pow(2,2*f);return Array.isArray(w)||(w=G(Number.MIN_VALUE,H(m)/N,w)),V().size([l,n]).thresholds(w.map(x=>x*N))(m).map((x,y)=>(x.value=+w[y],d(x)))}s.contours=function(u){var m=M(u),w=V().size([l,n]),N=Math.pow(2,2*f),x=y=>{y=+y;var z=d(w.contour(m,y*N));return z.value=y,z};return Object.defineProperty(x,"max",{get:()=>H(m)/N}),x};function d(u){return u.coordinates.forEach(v),u}function v(u){u.forEach(p)}function p(u){u.forEach(q)}function q(u){u[0]=u[0]*Math.pow(2,f)-h,u[1]=u[1]*Math.pow(2,f)-h}function E(){return h=a*3,l=i+h*2>>f,n=t+h*2>>f,s}return s.x=function(u){return arguments.length?(r=typeof u=="function"?u:L(+u),s):r},s.y=function(u){return arguments.length?(e=typeof u=="function"?u:L(+u),s):e},s.weight=function(u){return arguments.length?(o=typeof u=="function"?u:L(+u),s):o},s.size=function(u){if(!arguments.length)return[i,t];var m=+u[0],w=+u[1];if(!(m>=0&&w>=0))throw new Error("invalid size");return i=m,t=w,E()},s.cellSize=function(u){if(!arguments.length)return 1<<f;if(!((u=+u)>=1))throw new Error("invalid cell size");return f=Math.floor(Math.log(u)/Math.LN2),E()},s.thresholds=function(u){return arguments.length?(c=typeof u=="function"?u:Array.isArray(u)?L(J.call(u)):L(u),s):c},s.bandwidth=function(u){if(!arguments.length)return Math.sqrt(a*(a+1));if(!((u=+u)>=0))throw new Error("invalid bandwidth");return a=(Math.sqrt(4*u*u+1)-1)/2,E()},s} return { contours: V }; })();

const SETTINGS = {
  SCALE: 1.0,        // taille de l'ensemble
  DEPTH: 0.09,       // épaisseur des breloques (part de leur largeur)
  TOUCH: 1.0,        // force du survol (plus bas = plus doux)
  PULL_START: 100,   // px de scroll avant la traction
  PULL: 1.3,         // vitesse de remontée par rapport au scroll
  BOUNCE: 1.0        // élasticité à la redescente
};
// modèles Blender (.glb Draco, origine = anneau) et environnement de reflets : URL publiques (CDN)
const ASSETS = window.ORI_CHARM_ASSETS || {
  hdr: 'https://cdn.jsdelivr.net/gh/AlissaHon/ori-3d@main/studio_ori.hdr',
  cat: 'https://cdn.jsdelivr.net/gh/AlissaHon/ori-3d@main/cat.glb'
};
// nom, largeur (unités maquette), position de l'anneau par rapport au fermoir ; l'ordre = ordre de superposition
const CHARMS = [
  { name: 'w', w: 64, at: [-14, 22], src: 'https://cdn.prod.website-files.com/687f4e88f603e683a50043dc/6ad91a757730fb3eb5f637a6_chr-w.webp' },
  { name: 'cat', w: 52, at: [27, 26], src: 'https://cdn.prod.website-files.com/687f4e88f603e683a50043dc/6ad91a7590f3ec7ae7c2efb1_chr-cat.webp' },
  { name: 'star', w: 48, at: [-20, 64], src: 'https://cdn.prod.website-files.com/687f4e88f603e683a50043dc/6ad91a7936ea00cc9deb9f3d_chr-star.webp' },
  { name: 'badge', w: 52, at: [3, 84], src: 'https://cdn.prod.website-files.com/687f4e88f603e683a50043dc/6ad91a7af5f541685a031519_chr-badge.webp' }
];

const host = document.querySelector('[data-charms]');
if (host) init().catch((e) => { console.warn('Porte-clés 3D :', e); if (window.ORI_KEYCHAIN_2D) window.ORI_KEYCHAIN_2D(); });

async function init() {
  const hero = host.closest('section') || host.parentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- rendu ---------- */
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const cv = renderer.domElement;
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;   // secours
  if (ASSETS.hdr) await new RGBELoader().loadAsync(ASSETS.hdr).then((tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping; scene.environment = tex;
  }).catch((e) => console.warn('HDR :', e));
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-0.6, 1, 1.2); scene.add(key);

  const FOV = 22;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 20000);
  let W = 1, H = 1, U = 1, LS = 60;
  const layout = () => {
    W = hero.clientWidth; H = hero.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.position.set(0, 0, (H / 2) / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));  // 1 unité = 1 px au plan z = 0
    camera.updateProjectionMatrix();
    U = Math.max(0.9, Math.min(Math.min(W, 1440) / 1000 * SETTINGS.SCALE * 1.44 * (W < 768 ? 1.25 : 1), H * 0.0021 * SETTINGS.SCALE));
    LS = 55 * U * (W < 768 ? 1.1 : 1);
  };
  layout();

  /* ---------- matériaux ---------- */
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xe2e2e8, metalness: 1, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.08 });
  const chromeBack = new THREE.MeshPhysicalMaterial({ color: 0xcfcfd6, metalness: 1, roughness: 0.22 });
  const chromeDark = new THREE.MeshPhysicalMaterial({ color: 0xc4c4cb, metalness: 1, roughness: 0.18 });

  /* ---------- breloques : silhouette de l'image -> volume ---------- */
  const data = window.ORI_CHARM_DATA || {};
  const loadImg = (src) => new Promise((ok, ko) => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => ok(im); im.onerror = ko; im.src = src;
  });
  const draco = new DRACOLoader().setDecoderPath(ASSETS.draco || 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  const gltf = new GLTFLoader().setDRACOLoader(draco);
  const buildGLB = async (o, url) => {
    const obj = (await gltf.loadAsync(url)).scene;          // origine = centre de l'anneau, pend vers -Y
    const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
    const f = U * o.w / size.x;                              // même échelle que la maquette (largeur en unités)
    obj.scale.setScalar(f);
    const cvec = new THREE.Vector3(mid.x * f, mid.y * f, 0);
    const w = size.x * f, h = size.y * f;
    return { o, mesh: obj, w, h, cvec, d: cvec.length(), r: Math.min(w, h) * 0.4 };
  };
  const buildCharm = async (o) => {
    if (ASSETS[o.name]) { try { return await buildGLB(o, ASSETS[o.name]); } catch (e) { console.warn(o.name + '.glb :', e); } }
    const im = await (data[o.name] ? loadImg(data[o.name]).catch(() => loadImg(o.src)) : loadImg(o.src));   // image intégrée, sinon CDN
    const iw = im.naturalWidth, ih = im.naturalHeight;
    const G = 200 / Math.max(iw, ih), gw = Math.round(iw * G), gh = Math.round(ih * G);
    const cnv = document.createElement('canvas'); cnv.width = gw; cnv.height = gh;
    const x = cnv.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, 0, 0, gw, gh);
    const a = x.getImageData(0, 0, gw, gh).data;                                   // lève une erreur si l'image n'est pas lisible
    const vals = new Float64Array((gw + 2) * (gh + 2));                             // marge d'1 px pour fermer les contours
    let mx = 0, my = 0, mass = 0;
    for (let yy = 0; yy < gh; yy++) for (let xx = 0; xx < gw; xx++) {
      const v = a[(yy * gw + xx) * 4 + 3];
      vals[(yy + 1) * (gw + 2) + xx + 1] = v;
      if (v > 110) { mx += xx; my += yy; mass++; }
    }
    mx /= mass; my /= mass;                                                         // centre de gravité de la breloque
    const mp = contours().size([gw + 2, gh + 2]).smooth(true).thresholds([110])(vals)[0];
    // anneau d'accroche = le trou le plus haut de la silhouette
    let ring = null;
    mp.coordinates.forEach((poly) => poly.slice(1).forEach((hole) => {
      if (hole.length < 6) return;
      let cx = 0, cy = 0; hole.forEach((p) => { cx += p[0]; cy += p[1]; }); cx /= hole.length; cy /= hole.length;
      if (!ring || cy < ring[1]) ring = [cx - 1, cy - 1];
    }));
    if (!ring) ring = [gw / 2, 4];
    const w = o.w * U, f = w / gw, h = gh * f;
    const rx = ring[0] + 1, ry = ring[1] + 1;
    const P = (p) => new THREE.Vector2((p[0] - rx) * f, -(p[1] - ry) * f);                // origine = l'anneau
    const clean = (pts0) => {                                                       // allège puis adoucit le contour
      let pts = []; let last = null;
      pts0.forEach((p) => { const v = P(p); if (!last || v.distanceTo(last) > 1.1 * f) { pts.push(v); last = v; } });
      for (let k = 0; k < 2; k++) {
        const sm = [];
        pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; sm.push(p.clone().lerp(q, 0.25), p.clone().lerp(q, 0.75)); });
        pts = sm;
      }
      return pts;
    };
    const shapes = [];
    mp.coordinates.forEach((poly) => {
      const outer = clean(poly[0]); if (outer.length < 4 || Math.abs(THREE.ShapeUtils.area(outer)) < (4 * f) ** 2) return;
      const s = new THREE.Shape(outer);
      poly.slice(1).forEach((hole) => { const hh = clean(hole); if (hh.length > 3 && Math.abs(THREE.ShapeUtils.area(hh)) > (2 * f) ** 2) s.holes.push(new THREE.Path(hh)); });
      shapes.push(s);
    });
    const depth = w * SETTINGS.DEPTH;
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth, bevelEnabled: true, bevelThickness: depth * 0.45, bevelSize: w * 0.016, bevelSegments: 4, curveSegments: 2
    });
    geo.translate(0, 0, -depth / 2);
    const pos = geo.attributes.position, uv = geo.attributes.uv;                      // l'image est plaquée sur la face avant
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) / f + rx - 1) / gw, 1 - (-pos.getY(i) / f + ry - 1) / gh);
    // faces : avant (image) / arrière (métal) / tranche (chrome)
    const lid = geo.groups[0], half = lid.count / 2;
    const frontFirst = pos.getZ(lid.start) > 0;
    const groups = [
      { start: lid.start, count: half, materialIndex: frontFirst ? 0 : 1 },
      { start: lid.start + half, count: half, materialIndex: frontFirst ? 1 : 0 },
      ...geo.groups.slice(1).map((g) => ({ start: g.start, count: g.count, materialIndex: 2 }))
    ];
    geo.clearGroups(); groups.forEach((g) => geo.addGroup(g.start, g.count, g.materialIndex));
    const sm = mergeVertices(geo, 1e-3);                                           // normales lissées : tranche bien ronde
    if (!sm.groups.length) groups.forEach((g) => sm.addGroup(g.start, g.count, g.materialIndex));
    sm.computeVertexNormals();
    const tex = new THREE.Texture(im); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
    const face = new THREE.MeshPhysicalMaterial({ map: tex, metalness: 0.35, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.05 });
    const mesh = new THREE.Mesh(sm, [face, chromeBack, chrome]);
    // centre de gravité par rapport à l'anneau (la breloque pend naturellement)
    const cvec = new THREE.Vector3((mx - ring[0]) * f, -(my - ring[1]) * f, 0);
    return { o, mesh, w, h, cvec, d: cvec.length(), r: Math.min(w, h) * 0.4 };
  };
  const charms = await Promise.all(CHARMS.map(buildCharm));
  charms.forEach((c) => scene.add(c.mesh));

  /* ---------- maillons, fil et fermoir ---------- */
  const linkGeo = new THREE.TorusGeometry(1, 0.28, 8, 18);
  const LINKS = 40;
  const links = new THREE.InstancedMesh(linkGeo, chromeDark, charms.length * LINKS);
  scene.add(links);
  const threadMat = new THREE.MeshStandardMaterial({ color: 0xd8d8dc, metalness: 0.4, roughness: 0.4 });
  const thread = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 6), threadMat), thread2 = thread.clone();
  const claspMesh = new THREE.Mesh(new THREE.CapsuleGeometry(1, 2.2, 4, 12), chrome);
  scene.add(thread, thread2, claspMesh);

  /* ---------- physique (verlet, en px, y vers le haut) ---------- */
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const pt = (p) => ({ p: p.clone(), q: p.clone() });
  const anchorY = () => H / 2 + 10;
  let lift = 0, liftV = 0, liftT = 0;
  const readScroll = () => { liftT = reduce ? 0 : Math.max(0, -hero.getBoundingClientRect().top - SETTINGS.PULL_START) * SETTINGS.PULL; };
  readScroll(); lift = liftT;
  const A = V(0, anchorY() + lift, 0);
  const C = pt(V(0, A.y - LS, 0));
  charms.forEach((c) => {
    c.rest = V(c.o.at[0] * U, -c.o.at[1] * U, 0);
    c.len = c.rest.length();                                       // longueur fixe de la chaînette
    c.R = pt(C.p.clone().add(c.rest));
    c.G = pt(c.R.p.clone().add(V(0, -c.d, 0)));
    c.spin = 0; c.spinV = 0;
  });
  const GRAV = 2400;
  const integrate = (o, dt, damp) => {
    const v = o.p.clone().sub(o.q).multiplyScalar(damp);
    o.q.copy(o.p); o.p.add(v).add(V(0, -GRAV * dt * dt, 0));
  };
  const rope = (a, b, len, wa) => {                               // ne peut pas dépasser sa longueur (peut se détendre)
    const d = b.p.clone().sub(a.p || a), L = d.length();
    if (L <= len) return;
    const corr = d.multiplyScalar((L - len) / L);
    if (a.p) { a.p.addScaledVector(corr, wa); b.p.addScaledVector(corr, -(1 - wa)); } else b.p.sub(corr);
  };
  const rigid = (a, b, len) => {
    const d = b.p.clone().sub(a.p), L = d.length() || 1;
    const corr = d.multiplyScalar((L - len) / L * 0.5);
    a.p.add(corr); b.p.sub(corr);
  };

  /* ---------- souris : effleurer, attraper, lâcher ---------- */
  const mouse = { x: 1e5, y: 1e5, vx: 0, vy: 0, t: 0, on: false };
  let grab = null;
  const toWorld = (e) => { const r = hero.getBoundingClientRect(); return [e.clientX - r.left - W / 2, H / 2 - (e.clientY - r.top)]; };
  const hitCharm = (x, y) => charms.find((c) => Math.hypot(c.G.p.x - x, c.G.p.y - y) < c.r * 1.1);
  hero.addEventListener('pointermove', (e) => {
    const [x, y] = toWorld(e), t = performance.now();
    if (mouse.on) { const dt = Math.max(8, t - mouse.t) / 1000; mouse.vx = mouse.vx * 0.6 + 0.4 * (x - mouse.x) / dt; mouse.vy = mouse.vy * 0.6 + 0.4 * (y - mouse.y) / dt; }
    mouse.x = x; mouse.y = y; mouse.t = t; mouse.on = true;
    hero.style.cursor = grab ? 'grabbing' : hitCharm(x, y) ? 'grab' : '';
    wake();
  });
  hero.addEventListener('pointerleave', () => { mouse.on = false; mouse.vx = mouse.vy = 0; });
  hero.addEventListener('pointerdown', (e) => {
    const [x, y] = toWorld(e), c = hitCharm(x, y);
    if (c) { grab = c; e.preventDefault(); hero.style.cursor = 'grabbing'; }
  });
  addEventListener('pointerup', () => { if (grab) { grab = null; hero.style.cursor = ''; } });

  /* ---------- un pas de simulation ---------- */
  const step = (dt) => {
    // haut du fil : suit le scroll avec un ressort légèrement élastique
    liftV += ((liftT - lift) * 70 - liftV * 8 / SETTINGS.BOUNCE) * dt; lift += liftV * dt;
    A.set(0, anchorY() + lift, 0);
    integrate(C, dt, 0.985);
    const sp = Math.hypot(mouse.vx, mouse.vy);
    charms.forEach((c) => {
      integrate(c.R, dt, 0.99); integrate(c.G, dt, 0.99);
      // ressort doux qui garde la composition (l'anneau les tient groupées)
      const tgt = C.p.clone().add(c.rest);
      c.R.p.x += (tgt.x - c.R.p.x) * 0.015; c.R.p.z *= 0.99; c.G.p.z *= 0.995;
      // survol : on effleure, la breloque suit un peu le geste et pivote lentement
      if (mouse.on && !grab && sp > 40) {
        const d = Math.hypot(c.G.p.x - mouse.x, c.G.p.y - mouse.y), rad = c.r * 1.5;
        if (d < rad) {
          const k = (1 - d / rad) ** 2 * SETTINGS.TOUCH, v = Math.min(sp, 1400) / sp;
          c.G.p.x += mouse.vx * v * dt * k * 0.16; c.G.p.y += mouse.vy * v * dt * k * 0.06;
          c.spinV += mouse.vx * v * k * 0.0009;
        }
      }
      // rotation sur l'axe de suspension, qui revient lentement face caméra
      c.spinV += (-c.spin * 5 - c.spinV * 2.2) * dt; c.spin += c.spinV * dt;
    });
    if (grab) { const g = grab.G.p; g.x += (mouse.x - g.x) * 0.25; g.y += (mouse.y - g.y) * 0.25; g.z *= 0.9; }
    for (let it = 0; it < 8; it++) {
      rope(A, C, LS, 0);
      charms.forEach((c) => { rope(C, c.R, c.len, 0.1); rigid(c.R, c.G, c.d); });
      for (let i = 0; i < charms.length; i++) for (let j = i + 1; j < charms.length; j++) {   // les breloques se poussent sans se traverser
        const a = charms[i], b = charms[j], dv = b.G.p.clone().sub(a.G.p), L = dv.length(), min = (a.r + b.r) * 0.8;
        if (L >= min || L === 0) continue;
        const push = dv.multiplyScalar((min - L) / L * 0.5);
        a.G.p.sub(push); b.G.p.add(push);
      }
    }
  };

  /* ---------- placement des objets 3D ---------- */
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), q2 = new THREE.Quaternion(), sc = new THREE.Vector3(), up = V(0, 1, 0);
  const place = () => {
    charms.forEach((c) => {
      const down = c.G.p.clone().sub(c.R.p).normalize(), axis = c.cvec.clone().normalize();
      qq.setFromUnitVectors(axis, down); q2.setFromAxisAngle(axis, c.spin);
      c.mesh.quaternion.copy(qq).multiply(q2);
      c.mesh.position.copy(c.R.p);
    });
    // chaînettes : maillons alternés à 90°, toujours jointifs
    let k = 0;
    charms.forEach((c) => {
      const a = C.p, d = c.R.p.clone().sub(a), L = d.length(), lk = 3 * U;
      const n = Math.min(LINKS, Math.max(2, Math.ceil(L / (lk * 1.15))));
      qq.setFromUnitVectors(up, d.clone().normalize());
      for (let i = 0; i < LINKS; i++) {
        if (i < n) {
          q2.setFromAxisAngle(up, i % 2 ? Math.PI / 2 : 0);
          sc.set(lk * 0.45, lk * 0.75, lk * 0.45);
          m4.compose(a.clone().addScaledVector(d, (i + 0.5) / n), qq.clone().multiply(q2), sc);
        } else m4.makeScale(0, 0, 0);
        links.setMatrixAt(k++, m4);
      }
    });
    links.instanceMatrix.needsUpdate = true;
    [[thread, -1.2], [thread2, 1.2]].forEach(([m, off]) => {
      const top = V(off * U, H / 2 + 40 + Math.max(lift, 0), 0), bot = C.p.clone().add(V(off * 0.4 * U, 4 * U, 0));
      const d = bot.clone().sub(top);
      m.position.copy(top).addScaledVector(d, 0.5);
      m.quaternion.setFromUnitVectors(up, d.clone().normalize());
      m.scale.set(0.35 * U, d.length(), 0.35 * U);
    });
    claspMesh.position.copy(C.p).add(V(0, 2 * U, 0));
    claspMesh.scale.setScalar(1.5 * U);
  };

  /* ---------- boucle (s'arrête quand tout est immobile ou hors écran) ---------- */
  let last = performance.now(), visible = true, raf = 0, calm = 0;
  const energy = () => charms.reduce((s, c) => s + c.G.p.distanceTo(c.G.q) + c.R.p.distanceTo(c.R.q) + Math.abs(c.spinV), C.p.distanceTo(C.q) + Math.abs(liftT - lift));
  const loop = () => {
    raf = 0;
    if (!visible) return;
    const now = performance.now(), dt = Math.min(0.033, (now - last) / 1000); last = now;
    readScroll();                                   // lu à chaque image : compatible Lenis
    for (let s = 0; s < 4; s++) step(dt / 4);
    place(); renderer.render(scene, camera);
    calm = energy() < 0.02 && !grab && !mouse.on ? calm + 1 : 0;
    if (calm < 90) raf = requestAnimationFrame(loop);
  };
  const wake = () => { calm = 0; if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  for (let s = 0; s < 300; s++) step(1 / 240);     // la chaîne se pose avant le premier affichage
  if (window.__ori2d) return;                     // la version 2D a déjà pris le relais
  host.appendChild(cv);
  place(); renderer.render(scene, camera);
  document.documentElement.classList.add('is--charms-3d');
  if (!reduce) {
    wake();
    addEventListener('scroll', wake, { passive: true });
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) wake(); }).observe(hero);
  }
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); place(); renderer.render(scene, camera); wake(); }, 150); });
}
