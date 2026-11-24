/* ===== Logo Ori studio en 3D chromé (Three.js) =====
   Lettres extrudées depuis le SVG, une par une, bombées comme des tubes, en chrome miroir (studio photo noir et blanc).
   - Au chargement : exactement l'animation d'origine (GSAP : montée 40 px + fondu + flou 12 px, lettre par lettre)
   - Au survol : les lettres restent de face, seul un reflet de lumière glisse sur le chrome en suivant la souris
   Si WebGL ne démarre pas, les images .ori-letter + l'animation GSAP prennent le relais. */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

// ---- Réglages ----
const USE_HDR = false;     // true = reflets de studio_ori.hdr (plus doux, plus gris)
const HDR = window.ORI_LOGO_HDR || 'https://cdn.jsdelivr.net/gh/AlissaHon/ori-3d@main/studio_ori.hdr';
const FIT = 0.96;          // largeur du texte / largeur du bloc .ori-logo
const DEPTH = 26;          // épaisseur des lettres (unités SVG, hauteur du logo = 352)
const BEVEL = 2;           // arrondi des arêtes
const ROUND = 26;          // épaisseur max prise en compte pour le bombé (unités SVG)
const BUMP = 1;            // force du bombé dans les reflets
const TILT = 0;            // inclinaison vers la souris (0 = lettres toujours de face)
const EASE = 0.045;        // inertie du suivi souris (plus petit = plus doux)
const SWEEP = 0.55;        // amplitude du glissement des reflets au survol (0 = aucun)
const GLINT = 1.6;         // petit éclat de lumière qui suit la souris (0 = aucun)
const IDLE = 0;            // léger balancement au repos (0 = immobile)

const P = {"O":"M108.0 345.4C86.6 342.7 73.8 339.3 60.6 332.8C3.1 304.5 -12.6 233.6 22.7 163.7C56.7 96.5 128.3 43.2 200.0 31.6C285.2 17.8 331.7 65.0 327.1 160.5C326.7 167.2 326.9 168.4 328.2 168.2C329.3 168.0 329.9 169.2 330.3 172.6C331.3 179.5 331.2 179.6 327.6 181.3C324.4 182.8 324.0 183.6 321.1 194.4C301.7 264.7 247.0 318.4 173.7 338.9C156.3 343.8 122.2 347.1 108.0 345.4ZM140.1 322.5C153.7 319.9 168.0 312.5 181.6 301.1C204.6 281.7 236.1 230.7 252.8 185.8C278.1 117.7 274.4 68.3 242.8 52.7C225.6 44.2 210.0 44.3 189.9 52.9C127.8 79.5 62.9 199.4 74.0 266.9C76.7 283.2 82.8 295.7 93.6 307.0C107.7 321.7 121.1 326.2 140.1 322.5Z","r":"M312.6 344.5C298.4 339.3 296.3 323.1 306.6 297.5C307.9 294.2 309.5 290.6 310.1 289.6C310.7 288.5 313.1 283.1 315.5 277.6C317.8 272.0 322.7 260.7 326.4 252.5C333.7 236.0 346.6 204.0 349.9 194.2C355.1 178.8 350.0 172.5 336.1 177.4C331.4 179.1 331.1 178.8 330.3 172.2C329.7 167.0 329.4 167.3 347.0 153.6C360.2 143.2 378.2 134.0 386.9 133.2C403.6 131.7 407.3 138.4 400.9 158.5C399.2 163.8 398.0 168.5 398.2 169.1C398.4 169.7 400.9 167.3 403.8 163.8C409.4 157.1 423.2 144.1 428.7 140.1C433.1 137.0 433.1 137.0 432.7 159.5C432.5 178.5 432.5 178.5 428.6 178.8C426.4 178.9 424.2 178.6 423.6 178.0C422.1 176.5 415.3 176.7 412.0 178.4C403.0 183.1 384.3 213.7 372.2 243.5C355.0 285.9 353.0 293.3 356.3 301.3C358.6 306.7 362.7 309.0 370.4 309.0C377.4 309.0 379.4 310.4 377.3 313.8C375.6 316.5 360.8 328.8 356.0 331.6C353.5 333.0 348.8 335.6 345.5 337.5C333.9 344.1 319.7 347.1 312.6 344.5Z","i-stem":"M438.0 345.3C428.2 342.3 422.9 334.6 423.0 323.3C423.0 313.6 425.8 305.9 439.3 279.0C446.6 264.4 454.5 248.2 456.9 243.0C459.3 237.7 463.4 229.0 465.9 223.5C468.5 218.0 471.9 210.3 473.4 206.5C474.9 202.6 476.5 199.0 477.0 198.5C477.4 197.9 478.9 193.7 480.3 189.2C483.9 177.9 482.7 175.0 474.5 175.0C466.6 175.0 456.6 180.9 445.8 192.2C440.8 197.3 437.5 200.0 436.4 199.8C435.1 199.5 426.0 181.6 426.0 179.3C426.0 179.2 427.4 178.9 429.2 178.8C432.5 178.5 432.5 178.5 432.7 157.8C433.0 137.2 433.0 137.2 438.8 134.6C445.0 131.8 454.4 131.0 459.3 132.9C465.7 135.3 468.2 145.3 465.1 156.4C463.5 162.2 464.4 162.3 471.4 157.0C493.7 140.1 507.7 132.9 519.6 132.2C536.6 131.2 541.2 138.5 535.0 156.8C531.7 166.6 528.5 174.4 497.7 244.5C476.5 293.0 474.6 301.4 484.4 305.5C491.6 308.5 509.3 299.4 534.1 279.9C551.1 266.6 556.0 264.1 556.0 268.9C556.0 272.8 526.0 302.3 504.5 319.6C477.5 341.3 454.3 350.2 438.0 345.3Z","i-dot":"M509.1 117.9C488.4 108.5 483.8 82.7 500.1 67.0C516.3 51.2 542.4 55.1 552.1 74.7C555.6 82.0 555.4 94.5 551.7 102.0C544.5 116.5 523.4 124.4 509.1 117.9Z","s":"M593.4 344.5C580.7 341.7 571.5 334.6 566.3 324.0C561.0 313.2 561.7 293.7 568.1 271.1C571.8 258.3 574.2 253.2 577.5 251.8C581.4 250.0 583.0 252.1 583.0 259.3C583.0 289.2 596.5 317.6 615.0 326.6C631.5 334.8 653.2 324.0 664.0 302.5C669.4 291.5 670.1 285.0 666.7 275.1C663.0 264.6 657.8 258.6 638.2 242.3C614.8 222.7 609.5 215.2 608.3 200.0C606.8 182.4 622.4 154.9 639.9 144.2C641.3 143.3 644.8 141.1 647.7 139.2C675.0 121.7 713.7 121.5 726.4 138.9C730.1 144.0 731.5 148.9 730.2 151.6C729.7 152.6 728.1 158.3 726.6 164.1C722.7 179.9 719.7 186.2 716.3 185.8C713.7 185.5 713.3 184.9 711.3 177.0C707.9 163.5 705.3 157.9 699.9 151.8C682.9 132.4 654.8 143.8 650.4 171.8C648.5 183.6 656.1 195.2 675.3 210.0C699.9 228.8 708.8 239.4 712.9 254.5C715.6 264.4 713.4 280.3 707.7 291.5C697.4 311.9 665.3 335.1 637.0 342.6C625.1 345.8 603.1 346.8 593.4 344.5Z","t":"M720.2 345.1C710.7 341.8 706.2 335.3 705.3 324.1C704.4 312.8 705.5 309.2 726.2 259.0C744.7 214.1 756.9 180.6 757.6 172.4C758.7 160.9 754.2 155.6 741.3 153.3C730.9 151.4 731.2 151.6 730.4 146.4C729.8 142.4 729.8 142.4 740.1 138.0C780.0 121.2 789.3 112.9 813.5 72.7C822.4 57.9 824.5 55.8 828.5 57.3C830.8 58.2 830.3 63.1 825.9 81.0C816.4 119.1 819.0 125.9 842.9 127.3C849.3 127.7 854.8 128.4 855.2 128.8C855.7 129.3 855.9 133.2 855.7 137.5C855.5 145.4 855.5 145.4 843.5 147.0C816.4 150.8 812.7 153.1 803.2 171.6C796.9 184.0 780.3 223.7 768.9 254.0C767.3 258.1 764.7 265.1 762.9 269.5C755.4 288.8 754.2 297.7 758.4 302.6C763.5 308.6 774.9 304.7 790.9 291.5C799.1 284.6 799.1 284.6 802.7 288.2C806.3 291.8 806.3 291.8 803.4 295.6C801.8 297.7 794.2 305.8 786.5 313.5C759.3 340.6 737.1 351.2 720.2 345.1Z","u":"M817.7 344.4C804.5 339.6 800.1 323.1 805.8 300.5C807.8 292.5 807.8 292.5 803.9 289.2C801.7 287.3 800.0 285.3 800.0 284.6C800.0 283.7 805.0 278.9 817.0 268.7C819.2 266.8 839.2 221.4 848.0 198.2C856.4 176.2 852.3 172.7 831.0 183.8C818.3 190.4 816.9 190.8 815.0 188.5C813.2 186.4 814.5 183.9 819.3 180.1C821.6 178.3 825.7 174.8 828.5 172.4C831.2 170.0 837.5 164.8 842.4 160.9C857.0 149.3 859.5 146.9 857.6 145.8C855.8 144.8 855.1 129.6 856.7 128.6C858.0 127.8 879.7 129.9 886.2 131.4C892.9 133.0 895.3 134.8 898.2 140.4C904.1 151.9 900.3 167.6 880.9 213.5C853.0 279.4 849.0 291.4 852.3 299.2C858.2 313.3 882.5 292.6 907.4 252.5C911.1 246.4 916.1 238.5 918.4 235.0C920.7 231.4 924.6 224.9 927.0 220.5C929.3 216.1 931.8 211.8 932.5 211.0C933.2 210.1 936.4 204.3 939.7 198.0C961.4 156.2 964.9 150.2 971.7 142.3C979.5 133.3 991.4 129.0 1000.3 131.9C1005.1 133.5 1007.0 136.4 1007.0 142.2C1007.0 149.5 1004.2 156.4 974.7 224.5C967.2 241.8 952.4 276.7 949.0 285.4C942.5 301.6 947.8 309.0 959.6 300.4C966.8 295.3 966.7 295.3 971.2 299.7C976.1 304.6 976.1 304.7 960.3 320.4C934.8 345.7 912.8 352.7 901.1 339.4C893.1 330.4 895.7 315.5 910.4 284.5C916.8 271.0 918.6 266.2 917.5 265.2C916.6 264.3 913.9 267.5 902.2 283.0C862.9 335.1 839.2 352.3 817.7 344.4Z","d":"M1069.6 346.3C1068.2 344.9 1069.1 340.2 1073.4 326.9C1079.2 308.8 1079.8 306.0 1077.3 306.0C1076.3 306.0 1070.1 310.9 1063.5 317.0C1051.0 328.4 1036.7 338.0 1028.0 340.7C1006.4 347.4 986.2 334.5 980.0 310.0C978.7 304.9 977.9 303.4 976.3 303.2C975.2 303.0 972.5 301.1 970.4 298.9C966.6 295.0 966.6 295.0 968.7 292.7C972.8 288.2 976.8 280.3 977.9 274.5C979.4 266.8 984.7 247.4 986.5 243.5C987.2 241.8 989.6 236.2 991.9 231.0C1012.2 184.5 1047.7 147.8 1085.5 134.4C1094.8 131.1 1113.4 130.3 1122.2 132.8C1126.4 134.1 1127.2 134.0 1129.5 132.5C1132.7 130.4 1133.0 129.7 1139.7 104.0C1149.6 65.7 1147.5 54.3 1129.0 46.3C1119.8 42.3 1119.0 41.7 1119.0 39.4C1119.0 36.0 1120.0 35.5 1143.5 27.9C1168.6 19.7 1175.9 16.9 1190.7 9.9C1197.0 6.9 1202.3 5.0 1203.9 5.2C1208.3 5.7 1207.2 11.5 1196.5 46.0C1191.1 63.3 1185.9 80.6 1184.8 84.3C1183.8 88.1 1181.0 97.6 1178.5 105.3C1176.1 113.1 1171.6 128.0 1168.5 138.5C1165.3 148.9 1161.1 163.3 1158.9 170.5C1152.6 191.8 1140.1 233.0 1134.4 251.5C1128.8 269.7 1123.9 288.9 1123.3 295.0C1121.7 312.3 1132.9 315.8 1150.1 303.4C1156.0 299.2 1156.5 299.2 1157.3 303.1C1158.6 309.2 1158.1 310.5 1153.2 314.6C1141.4 324.5 1132.0 329.2 1111.1 335.6C1074.2 346.9 1071.1 347.7 1069.6 346.3ZM1046.0 305.2C1060.1 299.7 1074.0 285.7 1085.5 265.1C1094.5 248.9 1106.1 219.0 1113.7 192.5C1118.3 176.2 1119.1 159.3 1115.4 154.3C1101.3 135.5 1075.2 154.1 1049.3 201.5C1031.6 233.7 1021.5 275.8 1026.8 294.5C1029.7 304.8 1036.7 308.7 1046.0 305.2Z","i-2-stem":"M1173.2 344.5C1162.5 341.1 1158.5 334.3 1159.2 321.0C1159.5 316.3 1160.0 311.7 1160.4 310.7C1160.9 309.5 1160.7 309.0 1159.7 309.0C1158.6 309.0 1157.9 307.4 1157.4 303.8C1156.7 298.7 1156.7 298.7 1161.1 294.8C1163.5 292.7 1166.5 290.5 1167.7 289.9C1173.8 287.4 1212.8 197.9 1213.7 184.4C1214.3 176.7 1213.0 175.4 1204.8 175.5C1199.5 175.5 1197.5 176.2 1186.9 181.7C1173.5 188.7 1173.0 188.8 1170.4 185.9C1168.5 183.8 1168.5 183.7 1173.5 179.1C1184.7 168.8 1186.6 167.2 1189.5 165.7C1191.1 164.9 1193.4 163.1 1194.5 161.9C1197.4 158.6 1225.0 140.5 1233.8 136.2C1242.8 131.7 1255.1 130.8 1260.3 134.3C1272.7 142.4 1268.7 158.2 1232.5 243.0C1228.5 252.4 1217.4 279.2 1215.0 285.4C1207.3 304.9 1215.2 310.6 1231.6 297.3C1233.9 295.5 1236.8 294.0 1238.1 294.0C1240.5 294.0 1246.0 298.5 1246.0 300.5C1246.0 303.0 1219.6 328.1 1210.8 334.1C1196.1 344.0 1182.7 347.7 1173.2 344.5Z","i-2-dot":"M1245.0 118.4C1240.8 116.5 1233.4 110.6 1231.3 107.4C1230.4 106.0 1228.9 101.7 1227.8 97.7C1223.8 82.5 1230.7 68.9 1246.4 60.9C1257.1 55.5 1270.7 57.3 1279.6 65.3C1296.5 80.6 1293.4 104.5 1273.0 116.7C1267.3 120.1 1250.9 121.1 1245.0 118.4Z","o":"M1296.0 345.4C1273.1 339.3 1254.0 321.8 1250.1 303.2C1249.6 300.5 1248.8 299.4 1247.3 299.2C1246.1 299.0 1244.2 297.7 1242.9 296.4C1241.6 295.1 1239.8 294.0 1238.8 294.0C1236.3 294.0 1236.3 294.1 1242.0 285.4C1244.7 281.1 1247.0 276.5 1247.0 275.1C1247.0 269.5 1253.0 244.0 1256.3 234.8C1279.3 172.0 1333.1 128.0 1382.9 131.3C1428.0 134.3 1452.9 180.2 1442.4 241.0C1435.8 278.9 1417.7 307.0 1386.5 327.6C1359.9 345.1 1322.8 352.4 1296.0 345.4ZM1333.9 326.5C1345.7 322.3 1362.5 303.9 1373.8 282.9C1398.8 236.1 1407.2 182.6 1393.3 158.8C1392.3 157.1 1388.8 153.8 1385.7 151.6C1373.2 142.8 1357.7 146.2 1342.9 161.1C1314.5 189.8 1292.7 242.2 1292.6 282.0C1292.5 297.3 1294.0 303.8 1299.5 313.0C1307.8 326.6 1319.9 331.4 1333.9 326.5Z"};
const LETTERS = [['O'], ['r'], ['i-stem', 'i-dot'], ['s'], ['t'], ['u'], ['d'], ['i-2-stem', 'i-2-dot'], ['o']];

const root = document.documentElement;
const host = document.querySelector('.ori-logo');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fail = (e) => { if (e) console.warn('Logo 3D :', e); window.__ori3d = 'fail'; window.dispatchEvent(new Event('ori3d:fail')); };

async function init() {
  if (!host) return fail();
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;left:-6%;top:-14%;width:112%;height:128%;display:block;pointer-events:none;';
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return fail(e); }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  // Studio photo "chrome" : fond noir + bandes de lumière blanches très franches.
  // C'est le contraste noir/blanc reflété qui fait un vrai chrome (et pas un métal gris)
  const studio = new THREE.Scene(), rig = new THREE.Group();
  studio.add(rig);
  // dôme dégradé : ciel blanc en haut, ligne d'horizon sombre, sol gris (le "look chrome" classique)
  const dome = new THREE.SphereGeometry(50, 64, 64), col = [];
  const pos = dome.attributes.position, sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 50; // -1 bas, +1 haut
    let v = y > 0.12 ? 0.03 + 1.6 * sm(0.18, 0.7, y) : 0.02 + 0.3 * sm(-0.1, -0.75, y); // bande noire large autour de l'horizon
    col.push(v, v, v * 1.02);
  }
  dome.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  rig.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const strip = (w, h, x, y, z, v) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(v, v, v), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); rig.add(m);
  };
  strip(4, 30, -24, 6, 16, 4);   // boîte à lumière gauche
  strip(4, 30, 24, 6, 16, 4);    // boîte à lumière droite
  strip(26, 1.6, 0, 9, 32, 6);   // fine ligne face caméra : l'éclat sur les arrondis
  strip(10, 10, 0, 10, -32, 2);  // contre-jour
  // le studio tourne doucement avec la souris : les reflets glissent sur les lettres, qui restent de face
  let envRT = pmrem.fromScene(studio, 0.01), envX = 0, envY = 0;
  scene.environment = envRT.texture;
  const updateEnv = (rx, ry) => {
    if (Math.abs(rx - envX) < 0.002 && Math.abs(ry - envY) < 0.002) return;
    envX = rx; envY = ry; rig.rotation.set(rx, ry, 0);
    const next = pmrem.fromScene(studio, 0.01);
    if (!USE_HDR) scene.environment = next.texture;
    envRT.dispose(); envRT = next;
  };
  if (USE_HDR) try {
    const tex = await new RGBELoader().loadAsync(HDR);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = tex;
  } catch (e) { console.warn('Logo 3D HDR :', e); }

  // Reflet doux qui suit la souris (pas de halo, juste un éclat sur le métal)
  const glint = new THREE.PointLight(0xffffff, 0, 0, 2);
  glint.position.set(0, 0, 420);
  scene.add(glint);

  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xf2f3f6, metalness: 1, roughness: 0.045, envMapIntensity: 1 });

  // ---- Volume bombé : carte de normales calculée depuis la forme des lettres ----
  // Chaque lettre devient "gonflée" comme un tube de métal : c'est ce qui fait vivre les reflets
  const normalMap = (() => {
    const S = 1600 / 1449, w = 1600, h = Math.ceil(352 * S) + 2, R = ROUND * S;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d');
    cx.setTransform(S, 0, 0, S, 0, 0);
    cx.fillStyle = '#fff';
    Object.values(P).forEach((d) => cx.fill(new Path2D(d), 'evenodd'));
    // petite séparation entre lettres qui se touchent : chacune garde ses bords arrondis
    cx.strokeStyle = '#000'; cx.lineWidth = 1.2 / S;
    Object.values(P).forEach((d) => cx.stroke(new Path2D(d)));
    const px = cx.getImageData(0, 0, w, h).data;
    // distance au bord (transformée de distance exacte, 2 passes)
    const INF = 1e12, f = new Float64Array(Math.max(w, h)), v = new Int32Array(Math.max(w, h)), z = new Float64Array(Math.max(w, h) + 1);
    const D = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) D[i] = px[i * 4] > 127 ? INF : 0;
    const edt1 = (get, set, n) => {
      for (let q = 0; q < n; q++) f[q] = get(q);
      let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (let q = 1; q < n; q++) {
        let s2 = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s2 <= z[k]) { k--; s2 = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s2; z[k + 1] = INF;
      }
      k = 0;
      for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; set(q, (q - v[k]) * (q - v[k]) + f[v[k]]); }
    };
    for (let x = 0; x < w; x++) edt1((y) => D[y * w + x], (y, val) => { D[y * w + x] = val; }, h);
    for (let y = 0; y < h; y++) edt1((x) => D[y * w + x], (x, val) => { D[y * w + x] = val; }, w);
    // profil arrondi (quart de cercle) puis normales
    // épaisseur locale du trait (max de la distance aux alentours) : chaque trait devient un tube bien rond
    const dist = new Float32Array(w * h); for (let i = 0; i < w * h; i++) dist[i] = Math.sqrt(D[i]);
    const r = Math.ceil(R), tmp = new Float32Array(w * h), loc = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; const a = Math.max(0, x - r), b = Math.min(w - 1, x + r); for (let k = a; k <= b; k++) { const q = dist[y * w + k]; if (q > m) m = q; } tmp[y * w + x] = m; }
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) { let m = 0; const a = Math.max(0, y - r), b = Math.min(h - 1, y + r); for (let k = a; k <= b; k++) { const q = tmp[k * w + x]; if (q > m) m = q; } loc[y * w + x] = m; }
    const blur = (A, rad) => { // flou boîte séparable x2 ≈ gaussien
      const B = new Float32Array(w * h);
      for (let pass = 0; pass < 2; pass++) {
        for (let y = 0; y < h; y++) { let acc = 0, n = 0; for (let x = -rad; x < w + rad; x++) { const i1 = x + rad, i0 = x - rad - 1; if (i1 < w) { acc += A[y * w + i1]; n++; } if (i0 >= 0) { acc -= A[y * w + i0]; n--; } if (x >= 0 && x < w) B[y * w + x] = acc / n; } }
        for (let x = 0; x < w; x++) { let acc = 0, n = 0; for (let y = -rad; y < h + rad; y++) { const i1 = y + rad, i0 = y - rad - 1; if (i1 < h) { acc += B[i1 * w + x]; n++; } if (i0 >= 0) { acc -= B[i0 * w + x]; n--; } if (y >= 0 && y < h) A[y * w + x] = acc / n; } }
      }
      return A;
    };
    blur(loc, Math.ceil(r / 2));
    const Hh = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) { if (dist[i] <= 0) continue; const L = Math.max(loc[i], 1); const t = Math.min(dist[i] / L, 1); Hh[i] = L * Math.sqrt(1 - (1 - t) * (1 - t)); }
    blur(Hh, 2);
    const out = cx.createImageData(w, h), o = out.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const gx = (Hh[y * w + Math.min(w - 1, x + 1)] - Hh[y * w + Math.max(0, x - 1)]) / 2;
      const gy = (Hh[Math.min(h - 1, y + 1) * w + x] - Hh[Math.max(0, y - 1) * w + x]) / 2;
      let nx = -gx, ny = -gy, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
      o[i * 4] = (nx * 0.5 + 0.5) * 255; o[i * 4 + 1] = (ny * 0.5 + 0.5) * 255; o[i * 4 + 2] = (nz * 0.5 + 0.5) * 255; o[i * 4 + 3] = 255;
    }
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.putImageData(out, 0, 0);
    const tex = new THREE.CanvasTexture(cv);
    tex.flipY = false; tex.colorSpace = THREE.NoColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(S / w, S / h); // les UV des faces = coordonnées SVG
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.generateMipmaps = true;
    return tex;
  })();

  // ---- Géométrie : SVG -> lettres extrudées ----
  const loader = new SVGLoader();
  const shapesOf = (d) => {
    const data = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${d}"/></svg>`);
    return data.paths.flatMap((p) => SVGLoader.createShapes(p));
  };
  const W = 1449, H = 352;
  // SVG : y vers le bas -> on retourne la géométrie en gardant des faces bien orientées
  const flipY = (geo) => {
    geo.scale(1, -1, 1);
    if (geo.index) {
      const a = geo.index.array;
      for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; }
    } else {
      Object.values(geo.attributes).forEach((at) => {
        const n = at.itemSize, a = at.array;
        for (let i = 0; i < a.length; i += 3 * n) for (let j = 0; j < n; j++) { const t = a[i + n + j]; a[i + n + j] = a[i + 2 * n + j]; a[i + 2 * n + j] = t; }
      });
    }
    return geo;
  };
  const logo = new THREE.Group();
  scene.add(logo);
  const letters = LETTERS.map((ids) => {
    const g = new THREE.Group();
    const mat = chrome.clone();
    const cap = chrome.clone();
    cap.normalMap = normalMap; cap.normalScale.set(BUMP, BUMP);
    const box = new THREE.Box3();
    const meshes = ids.map((id) => {
      let geo;
      if (id.endsWith('-dot')) {
        // point du i : vraie bille chromée
        const b = new THREE.ShapeGeometry(shapesOf(P[id])); b.computeBoundingBox();
        const bb = b.boundingBox, r = (bb.max.x - bb.min.x + bb.max.y - bb.min.y) / 4;
        geo = new THREE.SphereGeometry(r, 48, 32);
        geo.scale(1, 1, 0.75);
        geo.translate((bb.min.x + bb.max.x) / 2, (bb.min.y + bb.max.y) / 2, DEPTH / 2);
        b.dispose();
      } else {
        geo = new THREE.ExtrudeGeometry(shapesOf(P[id]), {
          depth: DEPTH, curveSegments: 18, bevelEnabled: true,
          bevelThickness: BEVEL * 1.6, bevelSize: BEVEL, bevelOffset: -BEVEL * 0.6, bevelSegments: 5
        });
        // faces lisses sur les courbes, arêtes nettes : indispensable pour un reflet chromé propre
        geo = toCreasedNormals(flipY(geo), 0.55);
      }
      if (id.endsWith('-dot')) flipY(geo);
      geo.computeBoundingBox(); box.union(geo.boundingBox);
      return geo;
    });
    // chaque lettre pivote autour de son propre centre
    const c = box.getCenter(new THREE.Vector3());
    meshes.forEach((geo) => {
      geo.translate(-c.x, -c.y, -DEPTH / 2);
      g.add(new THREE.Mesh(geo, geo.groups.length > 1 ? [cap, mat] : mat));
    });
    g.position.set(c.x - W / 2, c.y + H / 2, 0);
    logo.add(g);
    return { g, mat, cap, home: g.position.clone(), cx: (c.x - W / 2) / W, rx: 0, ry: 0, t: 0, a: reduce ? 1 : 0 };
  });

  // ---- Caméra : le texte occupe FIT de la largeur du bloc ----
  const camera = new THREE.PerspectiveCamera(16, 1, 10, 20000);
  let cw = 1, ch = 1, unitsPerPx = 1;
  function layout() {
    const r = host.getBoundingClientRect();
    cw = Math.max(1, canvas.clientWidth); ch = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(cw, ch, false);
    unitsPerPx = (W / FIT) / Math.max(1, r.width);
    const visH = ch * unitsPerPx;
    camera.aspect = cw / ch;
    camera.position.set(0, 0, (visH / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.updateProjectionMatrix();
    // le canvas déborde du bloc : on recentre le logo sur le bloc
    const cr = canvas.getBoundingClientRect();
    logo.position.x = ((r.left + r.width / 2) - (cr.left + cr.width / 2)) * unitsPerPx;
    logo.position.y = -((r.top + r.height / 2) - (cr.top + cr.height / 2)) * unitsPerPx;
  }

  // ---- Souris ----
  const zone = host.closest('section') || host;
  let px = 0, py = 0, hover = 0, hoverT = 0, gx = 0, gy = 0;
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const r = host.getBoundingClientRect();
    px = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.4, 1.4);
    py = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.6, 1.6);
    hoverT = 1;
  });
  zone.addEventListener('pointerleave', () => { hoverT = 0; });

  // ---- Boucle ----
  host.appendChild(canvas);
  layout();
  let visible = true, running = false, t0 = performance.now(), last = t0;
  function frame(now) {
    if (!visible) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const k = 1 - Math.pow(1 - EASE, dt * 60); // inertie indépendante du nombre d'images/s
    const time = (now - t0) / 1000;
    hover += (hoverT - hover) * k;
    gx += (px - gx) * k; gy += (py - gy) * k;
    if (!reduce) updateEnv(-gy * SWEEP * 0.45 * hover, gx * SWEEP * hover);
    glint.intensity = GLINT * hover * 160000;
    glint.position.set(gx * (W / 2) * 1.1, -gy * (H / 2) * 1.3, 420);

    letters.forEach((L, i) => {
      // survol : les lettres proches de la souris s'inclinent plus
      const near = Math.exp(-Math.pow((gx * 0.5 - L.cx) * 2.6, 2));
      const amt = TILT * hover * (0.35 + 0.65 * near);
      const sway = reduce ? 0 : IDLE * 0.06 * Math.sin(time * 0.7 + i * 0.55);
      const ty = gx * amt + sway * (1 - hover);
      const tx = gy * amt * 0.7 + sway * 0.4 * (1 - hover);
      L.ry += (ty - L.ry) * k; L.rx += (tx - L.rx) * k;
      L.g.rotation.set(L.rx, L.ry, 0);
    });
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  const start = () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } };

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (!running) renderer.render(scene, camera); }, 100); });

  // ---- Entrée : exactement l'animation d'origine (GSAP) ----
  // Chaque lettre est rendue une fois sur son propre calque, puis animée comme les anciennes images :
  // montée de 40 px, fondu et flou 12 px -> net, 1,1 s, expo.out, 0,11 s entre les lettres, 0,3 s après le chargement.
  // À la fin, le logo 3D vivant (reflets au survol) prend la place des calques, au pixel près.
  const go = () => {
    if (!('IntersectionObserver' in window)) return start();
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) start(); }).observe(host);
  };
  renderer.render(scene, camera);
  if (reduce) {
    root.classList.add('is--ori-3d'); root.classList.remove('is--ori-anim');
    window.__ori3d = 'ready'; window.dispatchEvent(new Event('ori3d:ready'));
    return go();
  }
  const layers = letters.map((L) => {
    letters.forEach((M) => { M.g.visible = M === L; });
    renderer.render(scene, camera);
    const c2 = document.createElement('canvas');
    c2.width = canvas.width; c2.height = canvas.height;
    c2.getContext('2d').drawImage(canvas, 0, 0);
    c2.setAttribute('aria-hidden', 'true');
    c2.style.cssText = canvas.style.cssText + 'opacity:0;will-change:transform,opacity,filter;';
    host.appendChild(c2);
    return c2;
  });
  letters.forEach((M) => { M.g.visible = true; });
  renderer.render(scene, camera);
  canvas.style.opacity = '0';
  root.classList.add('is--ori-3d');
  root.classList.remove('is--ori-anim');
  window.__ori3d = 'ready';
  window.dispatchEvent(new Event('ori3d:ready'));

  const finish = () => {
    canvas.style.opacity = '';
    layers.forEach((c2) => c2.remove());
    go();
  };
  const play = () => {
    const g = window.gsap;
    if (g) {
      g.fromTo(layers, { y: 40, opacity: 0, filter: 'blur(12px)' }, {
        y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out', stagger: 0.11, delay: 0.3,
        onComplete: finish
      });
    } else {
      // sans GSAP : même mouvement en CSS
      layers.forEach((c2, i) => {
        c2.style.transform = 'translateY(40px)'; c2.style.filter = 'blur(12px)';
        c2.style.transition = `opacity 1.1s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.11}s, transform 1.1s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.11}s, filter 1.1s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.11}s`;
        requestAnimationFrame(() => requestAnimationFrame(() => { c2.style.opacity = '1'; c2.style.transform = 'none'; c2.style.filter = 'blur(0)'; }));
      });
      setTimeout(finish, (0.3 + (layers.length - 1) * 0.11 + 1.1) * 1000 + 50);
    }
  };
  if (document.readyState === 'complete') play(); else window.addEventListener('load', play, { once: true });
}

init().catch(fail);
