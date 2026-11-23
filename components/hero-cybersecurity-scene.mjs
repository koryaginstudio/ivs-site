import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const material = (color, options = {}) => new T.MeshPhysicalMaterial({ color, ...options });
const porcelain = material(0xe7e8ec, { roughness: .26, metalness: .13, clearcoat: .52, clearcoatRoughness: .19 });
const silver = material(0xc4c9d0, { roughness: .25, metalness: .65, clearcoat: .4 });
const gunmetal = material(0x27292d, { roughness: .27, metalness: .49, clearcoat: .46 });
const chassis = material(0x8a8c94, { roughness: .31, metalness: .54, clearcoat: .48 });
const carbon = material(0x141519, { roughness: .35, metalness: .28, specularIntensity: .35, clearcoat: .21, clearcoatRoughness: .22 });
const bezel = material(0x38373b, { roughness: .24, metalness: .55, clearcoat: .4 });
const obsidian = material(0x101114, { roughness: .35, metalness: .31, clearcoat: .38 });
const dark = material(0x090a0c, { roughness: .42, metalness: .22 });
const officeGlass = material(0x22252a, { roughness: .13, metalness: .68, clearcoat: .85, clearcoatRoughness: .085 });
const mullion = material(0x494950, { roughness: .27, metalness: .7 });
const vermilion = material(0xc70108, { roughness: .23, metalness: .28, clearcoat: 1, clearcoatRoughness: .11 });
const wireMats = [0x9d0005, 0xe10308, 0xc90006].map(color => material(color, {
  roughness: .21, metalness: .24, clearcoat: .92, clearcoatRoughness: .12,
}));
const trace = material(0xff0706, { emissive: 0xff0303, emissiveIntensity: 8.2, roughness: .24, metalness: .05 });
const diode = material(0xf04c3b, { emissive: 0xff1006, emissiveIntensity: 8.0, roughness: .23 });
const diodeHousing = material(0x9f1614, { emissive: 0xb70904, emissiveIntensity: .27, roughness: .27, clearcoat: .52 });
const portLight = material(0xd6281c, { emissive: 0xef1108, emissiveIntensity: 5.7, roughness: .25 });
const beaconLens = material(0xd71711, {
  transmission:.35, thickness:.04, ior:1.46, roughness:.17, clearcoat:.74,
  emissive:0xe80a03, emissiveIntensity:1.35,
});
const glass = material(0xe0e5ed, {
  transmission: .941, thickness: .069, ior: 1.48,
  attenuationColor: new T.Color(0xe8edf4), attenuationDistance: .77,
  roughness: .009, clearcoat: .58, clearcoatRoughness: .014,
  specularIntensity: 1, envMapIntensity: .82,
});
const redGlass = material(0xeb0609, {
  transmission: .81, thickness: .28, ior: 1.51, attenuationColor: new T.Color(0xf41211),
  attenuationDistance: .67, roughness: .14, clearcoat: 1, clearcoatRoughness: .098, metalness: .08,
});
const redEdge = material(0xe00608, { transmission: .28, thickness: .15, ior: 1.48, roughness: .15, clearcoat: 1, metalness: .18 });
const redInside = material(0xb6070b, { roughness: .23, metalness: .37, clearcoat: .62 });
const rubyFacet = [
  [0x960208, .23], [0xe4050a, .14], [0xbf0306, .20], [0x750308, .22],
  [0x93020a, .21], [0xd5050a, .18], [0xf31617, .22], [0xad0305, .18],
].map(([color, roughness]) => material(color, { roughness, metalness: .39, clearcoat: .8 }));

const boxes = new Map();
const cylinders = new Map();
const v3 = (x, y, z) => new T.Vector3(x, y, z);
function group(parent, name, x = 0, y = 0, z = 0) {
  const node = new T.Group();
  node.name = name;
  node.position.set(x, y, z);
  parent.add(node);
  return node;
}
function mesh(parent, geometry, mat, x = 0, y = 0, z = 0, name = '') {
  const node = new T.Mesh(geometry, mat);
  node.position.set(x, y, z);
  node.name = name;
  parent.add(node);
  return node;
}
function box(parent, size, pos, radius, mat, name) {
  const key = [...size, radius].join('/');
  if (!boxes.has(key)) boxes.set(key, new RoundedBoxGeometry(...size, radius > .065 ? 3 : 2, radius));
  return mesh(parent, boxes.get(key), mat, ...pos, name);
}
function cylinder(parent, radius, length, center, axis, mat) {
  const key = [radius, length].join('/');
  if (!cylinders.has(key)) cylinders.set(key, new T.CylinderGeometry(radius, radius, length, radius > .09 ? 24 : 12));
  const node = mesh(parent, cylinders.get(key), mat, ...center);
  if (axis === 'z') node.rotation.x = Math.PI / 2;
  if (axis === 'x') node.rotation.z = Math.PI / 2;
  return node;
}
const glowSize = 64;
const glowData = new Uint8Array(glowSize * glowSize * 4);
for (let y = 0; y < glowSize; y++) {
  for (let x = 0; x < glowSize; x++) {
    const r = Math.hypot((x+.5)/glowSize-.5,(y+.5)/glowSize-.5)*2;
    const i = (y*glowSize+x)*4;
    glowData[i]=glowData[i+1]=glowData[i+2]=255;
    glowData[i+3]=Math.round(247*Math.exp(-2.62*r*r)*(1-T.MathUtils.smoothstep(r,.66,.99)));
  }
}
const glowTexture = new T.DataTexture(glowData,glowSize,glowSize,T.RGBAFormat);
glowTexture.name = 'Мягкий ореол красного индикатора';
glowTexture.needsUpdate = true;
glowTexture.magFilter = T.LinearFilter;
glowTexture.minFilter = T.LinearFilter;
const glowMaterial = new T.MeshBasicMaterial({
  color:0xff230b,map:glowTexture,transparent:true,opacity:.90,depthWrite:false,
  toneMapped:false,side:T.DoubleSide,forceSinglePass:true,
});
const glowPlane = new T.PlaneGeometry(1,1);
function glow(parent, position, size, phase) {
  const node = mesh(parent,glowPlane,glowMaterial,...position,'Ореол индикатора');
  node.scale.set(size[0],size[1],1);
  if (phase !== undefined) node.userData.signalPhase = phase;
  return node;
}

const Y = v3(0, 1, 0);
function bar(parent, from, to, r, mat) {
  const a = v3(...from), b = v3(...to);
  const direction = b.clone().sub(a);
  const node = cylinder(parent, r, direction.length(), a.clone().lerp(b, .5).toArray(), 'y', mat);
  node.quaternion.setFromUnitVectors(Y, direction.normalize());
  return node;
}
function tube(parent, path, r, mat, segments = 38, sides = 9) {
  return mesh(parent, new T.TubeGeometry(path, segments, r, sides, false), mat);
}
function jack(parent, pos, axis, onGlass = false, radius = .16) {
  const adjust = d => pos.map((p, i) => p + (i === (axis === 'z' ? 2 : 0) ? d : 0));
  const sign = pos[axis === 'z' ? 2 : 0] < 0 ? -1 : 1;
  cylinder(parent, radius + .060, .090, adjust(0), axis, onGlass ? glass : porcelain);
  cylinder(parent, radius + .020, .066, adjust(.052 * sign), axis, silver);
  cylinder(parent, radius - .003, .069, adjust(.076 * sign), axis, vermilion);
  cylinder(parent, radius - .035, .056, adjust(.107 * sign), axis, bezel);
  cylinder(parent, radius - .052, .093, adjust(.128 * sign), axis, vermilion);
  // Cable begins inside the rubber sleeve.
  parent.updateWorldMatrix(true, false);
  const direction = (axis === 'z' ? v3(0, 0, sign) : v3(sign, 0, 0)).transformDirection(parent.matrixWorld);
  return {position:parent.localToWorld(v3(...adjust(.154 * sign))), direction};
}

function rackFront(parent, width, y, z, scale, name, signalPhase) {
  const panel = group(parent, name, 0, y, z);
  panel.scale.setScalar(scale);
  box(panel, [width, .477, .135], [0, 0, 0], .073, bezel);
  box(panel, [width - .073, .413, .095], [0, 0, .048], .056, obsidian);
  box(panel, [width - .145, .343, .059], [0, 0, .098], .045, gunmetal);
  box(panel, [width - .196, .294, .025], [0, 0, .137], .036, obsidian);
  const vent = group(panel, 'Перфорация', -.325, 0, .151);
  const holeGeometry = new T.CircleGeometry(.017, 7);
  const holes = new T.InstancedMesh(holeGeometry, dark, 42);
  const matrix = new T.Matrix4();
  let index = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < (row % 2 ? 10 : 11); col++) {
      matrix.makeTranslation((col - 5) * .045 + (row % 2) * .0225, (row - 1.5) * .054, .001);
      holes.setMatrixAt(index++, matrix);
    }
  }
  // Expanded at export, with one indexed geometry for all perforations.
  const positions = [], normals = [], indices = [];
  const attr = holeGeometry.attributes.position;
  for (let i = 0; i < index; i++) {
    holes.getMatrixAt(i, matrix);
    const offset = positions.length / 3;
    for (let j = 0; j < attr.count; j++) {
      const p = new T.Vector3().fromBufferAttribute(attr, j).applyMatrix4(matrix);
      positions.push(p.x, p.y, p.z);
      normals.push(0, 0, 1);
    }
    for (const vertex of holeGeometry.index.array) indices.push(offset + vertex);
  }
  const perforations = new T.BufferGeometry();
  perforations.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  perforations.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  perforations.setIndex(indices);
  mesh(vent, perforations, dark);
  box(panel, [.29, .065, .035], [.311, 0, .145], .024, dark);
  box(panel,[.249,.028,.018],[.311,0,.170],.01,trace);
  glow(panel,[.311,0,.176],[.49,.174]);
  cylinder(panel, .046, .027, [.605, .071, .156], 'z', redEdge);
  cylinder(panel, .028, .020, [.605, .071, .176], 'z', diodeHousing);
  const led = cylinder(panel, .023, .018, [.605, .071, .186], 'z', diode);
  if (signalPhase !== undefined) led.userData.signalPhase = signalPhase;
  glow(panel,[.605,.071,.191],[.251,.251],signalPhase);
  box(panel, [.14, .017, .022], [-.292, -.163, .146], .006, bezel);
}

function mainServer(scene) {
  const node = group(scene, '01 · Центральный сервер');
  box(node, [2.58, 2.26, 2.39], [0, 1.13, 0], .36, glass, 'Литой стеклянный корпус');
  box(node, [1.98, 1.67, 1.85], [0, 1.07, -.034], .242, chassis, 'Внутреннее шасси');
  box(node, [1.77, 1.61, .138], [-.01, 1.07, .887], .115, porcelain, 'Рамка стоек');
  const front = group(node,'Чёрная лицевая кассета с дисками перед стеклом',0,0,.320);
  box(front,[1.61,1.49,.162],[-.01,1.06,.957],.081,bezel,'Лицевая крышка');
  for (let i = 0; i < 3; i++) {
    rackFront(front,1.53,.57+.481*i,.996,.965,'Серверный модуль '+(i+1),i===1 ? 1.8 : undefined);
  }
  const corner = .277, xMax = 1.136, bottom = .142, top = 2.08;
  const edge = new T.Path();
  edge.moveTo(-xMax+corner,bottom);
  edge.lineTo(xMax-corner,bottom);
  edge.quadraticCurveTo(xMax,bottom,xMax,bottom+corner);
  edge.lineTo(xMax,top-corner);
  edge.quadraticCurveTo(xMax,top,xMax-corner,top);
  edge.lineTo(-xMax+corner,top);
  edge.quadraticCurveTo(-xMax,top,-xMax,top-corner);
  edge.lineTo(-xMax,bottom+corner);
  edge.quadraticCurveTo(-xMax,bottom,-xMax+corner,bottom);
  for (const z of [.995,-.995]) {
    const gasket = edge.getPoints(9);
    gasket.pop();
    const curve = new T.CatmullRomCurve3(gasket.map(p => v3(p.x,p.y,z)),true,'centripetal');
    mesh(node,new T.TubeGeometry(curve,76,.027,9,true),silver,0,0,0,'Внутренний кант корпуса');
  }
  const side = group(node, 'Боковое охлаждение', 1.018, 1.36, -.42);
  side.rotation.y = Math.PI / 2;
  box(side, [.58, .54, .10], [0, 0, 0], .073, gunmetal);
  for (let i = 0; i < 4; i++) box(side, [.434, .053, .032], [0, -.145 + i * .094, .059], .015, dark);
  for (const [x,z] of [[-.875,-.73],[.875,-.73],[-.875,.73],[.875,.73]]) {
    box(node,[.23,1.86,.23],[x,1.11,z],.09,silver);
  }
  box(node, [1.65, .135, 1.31], [0, 2.222, 0], .12, vermilion);
  box(node, [1.46, .16, 1.16], [0, 2.30, 0], .104, porcelain);
  box(node, [1.23, .063, .948], [0, 2.392, .02], .053, silver);
  box(node, [1.137, .075, .862], [0, 2.42, .02], .062, carbon);
  for (const x of [-.48, .48]) box(node, [.078, .025, .18], [x, 2.418, .292], .01, trace);
  const backplane = group(node, 'Задняя панель и вводы под стеклом');
  box(backplane,[1.73,.97,.11],[0,.83,-.938],.084,gunmetal,'Панель ввода внутреннего шасси');
  const ports = {};
  const layout = [
    ['routerOne',-.63,.53], ['shield',-.21,.53], ['tower',.21,.53], ['office',.63,.53],
    ['routerTwo',-.63,1.13], ['routerSide',-.21,1.13], ['remoteSide',.21,1.13], ['remoteRear',.63,1.13],
  ];
  for (const [name,x,y] of layout) {
    // Coaxial metal collar and red sleeve bridge the glass wall and the backplane.
    cylinder(backplane,.143,.11,[x,y,-.973],'z',silver);
    cylinder(backplane,.088,.225,[x,y,-1.069],'z',vermilion);
    cylinder(backplane,.109,.055,[x,y,-1.056],'z',gunmetal);
    cylinder(backplane,.100,.038,[x,y,-1.123],'z',silver);
    ports[name] = jack(backplane,[x,y,-1.173],'z',true,.135);
  }
  return ports;
}

function router(scene, x, z) {
  const node = group(scene, '02 · Роутер', x, 0, z);
  box(node, [1.81, .106, 1.15], [0, .061, 0], .051, gunmetal);
  box(node, [1.98, .503, 1.27], [0, .295, 0], .18, porcelain);
  box(node, [1.73, .074, 1.07], [0, .549, -.022], .043, porcelain);
  box(node, [1.60, .337, .083], [-.055, .267, .590], .061, silver);
  box(node, [1.53, .293, .075], [-.055, .269, .624], .05, obsidian);
  for (let j = 0; j < 5; j++) {
    const px = -.55 + j * .234;
    box(node, [.202, .175, .068], [px, .261, .668], .025, bezel);
    box(node, [.148, .119, .042], [px, .262, .709], .016, dark);
    box(node,[.120,.033,.043],[px,.208,.706],.011,diodeHousing);
    const lightBar = box(node,[.107,.018,.017],[px,.209,.730],.007,portLight);
    const phase = j === 1 ? 2.5 : j === 4 ? 4.3 : undefined;
    if (phase !== undefined) lightBar.userData.signalPhase = phase;
    glow(node,[px,.209,.736],[.194,.115],phase);
    for (let pin = 0; pin < 3; pin++) box(node, [.012, .045, .013], [px - .036 + pin * .036, .297, .735], .004, silver);
  }
  for (let j = 0; j < 3; j++) {
    const y = .207 + j * .063;
    cylinder(node,.028,.020,[-.758,y,.669],'z',diodeHousing);
    const led = cylinder(node,.022,.013,[-.758,y,.683],'z',diode);
    if (j === 1) led.userData.signalPhase = 3.1;
    glow(node,[-.758,y,.687],[.151,.143],j === 1 ? 3.1 : undefined);
  }
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      cylinder(node, .019, .012, [.983, .203 + row * .06, -.264 + col * .069], 'x', dark);
    }
  }
  return {
    front1: jack(node, [.39, .261, .704], 'z', false, .095),
    front2: jack(node, [.137, .261, .704], 'z', false, .086),
    side: jack(node, [.988, .28, .29], 'x', false, .114),
  };
}

function remoteServer(scene, x, z) {
  const node = group(scene, '03 · Удалённый сервер', x, 0, z);
  box(node, [1.65, 2.54, 1.26], [0, 1.27, 0], .20, porcelain);
  box(node, [1.418, 2.265, .092], [0, 1.268, .596], .105, silver);
  box(node, [1.344, 2.18, .112], [0, 1.268, .640], .089, obsidian);
  for (let i = 0; i < 3; i++) {
    rackFront(node, 1.51, .56 + i * .603, .671, .777, 'Серверный модуль ' + (i + 1), i === 0 ? 1.1 : undefined);
  }
  box(node, [1.244, .038, .66], [0, 2.531, -.052], .028, gunmetal);
  for (let i = 0; i < 8; i++) box(node, [1.005, .018, .019], [0, 2.556, -.28 + .061 * i], .007, dark);
  box(node, [.070, 1.78, .76], [.813, 1.26, -.038], .032, gunmetal);
  for (let i = 0; i < 6; i++) box(node, [.023, 1.58, .032], [.854, 1.26, -.32 + .112 * i], .009, dark);
  box(node, [.040, .052, .77], [.855, 1.27, -.038], .014, bezel);
  return {
    left: jack(node, [-.807, 1.23, .148], 'x', false, .118),
    rear: jack(node, [0,.58,-.618],'z',false,.123),
  };
}

function shieldShape() {
  const s = new T.Shape();
  s.moveTo(0, .93);
  s.bezierCurveTo(.245, .704, .576, .618, .779, .595);
  s.quadraticCurveTo(.815, .586, .815, .507);
  s.bezierCurveTo(.83, -.186, .617, -.652, .046, -.952);
  s.quadraticCurveTo(0, -.976, -.046, -.952);
  s.bezierCurveTo(-.617, -.652, -.83, -.186, -.815, .507);
  s.quadraticCurveTo(-.815, .586, -.779, .595);
  s.bezierCurveTo(-.576, .618, -.245, .704, 0, .93);
  return s;
}

function shield(scene, x, z) {
  const node = group(scene, '04 · Щит кибербезопасности', x, 1.026, z);
  node.scale.y = 1.061;
  node.rotation.y = -.07;
  const shape = shieldShape();
  const profile = [
    [0,.238],[.19,.235],[.42,.223],[.66,.198],[.86,.158],[.957,.118],
    [.992,.083],[1,.043],[.994,-.092],[.968,-.147],[.895,-.17],[.50,-.181],[0,-.183],
  ];
  const contour = shape.getSpacedPoints(104);
  contour.pop();
  if (T.ShapeUtils.isClockWise(contour)) contour.reverse();
  const vertices = [], triangles = [];
  for (const [radius, depth] of profile) {
    for (const p of contour) vertices.push(p.x*radius, p.y*radius,depth);
  }
  const count = contour.length;
  for (let r = 0; r < profile.length-1; r++) {
    for (let i = 0; i < count; i++) {
      const a=r*count+i, b=r*count+(i+1)%count;
      const c=a+count, d=b+count;
      if (profile[r][0] > 0) triangles.push(a,c,b);
      if (profile[r+1][0] > 0) triangles.push(b,c,d);
    }
  }
  const molded = new T.BufferGeometry();
  molded.setAttribute('position', new T.Float32BufferAttribute(vertices,3));
  molded.setIndex(triangles);
  molded.computeVertexNormals();
  const normals = molded.attributes.normal;
  for (let i=0;i<count;i++) {
    normals.setXYZ(i,0,0,1);
    normals.setXYZ((profile.length-1)*count+i,0,0,-1);
  }
  mesh(node, molded, redGlass, 0, 0, 0, 'Красное литое стекло');
  const core = new T.ExtrudeGeometry(shape, {
    depth:.089, bevelEnabled:true, bevelSegments:4, steps:1, curveSegments:15, bevelSize:.043, bevelThickness:.032,
  });
  mesh(node, core, redInside, 0, 0, -.100).scale.set(.895,.898,1);
  const edge = shape.getPoints(14);
  edge.pop();
  const rim = new T.CatmullRomCurve3(edge.map(p => v3(p.x * .984,p.y * .988,.084)), true, 'centripetal');
  const seal = new T.TubeGeometry(rim, 110, .019, 9, true);
  mesh(node, seal, redEdge, 0, 0, .004, 'Полированная кромка');
  const jewel = [[0,.808],[.665,.488],[.604,-.186],[.35,-.582],[0,-.839],[-.35,-.582],[-.604,-.186],[-.665,.488]];
  for (let i = 0; i < jewel.length; i++) {
    const a = jewel[i], b = jewel[(i+1)%jewel.length];
    const facet = new T.BufferGeometry();
    facet.setAttribute('position', new T.Float32BufferAttribute([.03,.067,.113,b[0],b[1],.033,a[0],a[1],.033],3));
    facet.computeVertexNormals();
    mesh(node, facet, rubyFacet[i]);
  }
  return jack(node,[0,.22,-.167],'z',false,.132);
}

function office(scene, x, z) {
  const node = group(scene, '05 · Офис', x, 0, z);
  node.scale.set(1.09, 1.10, 1.08);
  box(node, [2.00, .164, 1.46], [0, .082, 0], .081, porcelain);
  box(node, [1.66, 1.83, 1.14], [0, 1.052, 0], .158, officeGlass);
  box(node, [1.71, .133, 1.175], [0, .227, 0], .073, gunmetal);
  for (let i = 0; i < 4; i++) {
    const y = .428 + .409 * i;
    box(node, [1.75, .115, 1.24], [0, y, 0], .075, i === 0 ? vermilion : porcelain);
    const height = i === 3 ? .31 : .308;
    for (let j = 0; j < 8; j++) {
      const px = -.62 + j * .174;
      box(node, [.019, height, .019], [px, y + .199, .572], .006, mullion);
    }
    for (let j = 0; j < 5; j++) box(node, [.025, height, .020], [.826, y + .199, -.42 + j * .191], .007, mullion);
  }
  const columns = group(node, 'Стойки от цоколя до крыши');
  for (const x of [-.768,.768]) {
    for (const z of [-.488,.488]) {
      box(columns,[.166,1.835,.155],[x,1.067,z],.048,porcelain,'Угловая стойка');
    }
  }
  box(node, [1.759, .152, 1.228], [0, 1.979, 0], .075, porcelain);
  box(node, [1.58, .052, 1.052], [0, 2.062, 0], .03, chassis);
  // Raised parapets leave the flat roof readable between the mechanical units.
  for (const z of [-.573, .573]) box(node, [1.72, .117, .084], [0, 2.101, z], .03, porcelain);
  for (const x of [-.818, .818]) box(node, [.084, .117, 1.08], [x, 2.101, 0], .03, porcelain);
  box(node, [.703, .168, .45], [.22, 2.149, -.20], .045, porcelain);
  box(node, [.54, .031, .291], [.22, 2.239, -.20], .019, carbon);
  for (let i = 0; i < 4; i++) box(node, [.42, .017, .017], [.22, 2.256, -.283 + i * .055], .005, mullion);
  box(node, [.251, .086, .322], [-.476, 2.127, -.254], .029, silver);
  // Glazed doors, a slim canopy and shallow entry steps define the ground floor.
  box(node, [.67, .272, .047], [0, .287, .584], .02, silver);
  box(node, [.576, .220, .039], [0, .284, .611], .016, officeGlass);
  box(node, [.025, .22, .029], [0, .284, .637], .005, silver);
  for (const x of [-.069, .069]) box(node, [.016, .061, .022], [x, .282, .651], .006, porcelain);
  box(node, [.85, .051, .255], [0, .431, .641], .022, porcelain);
  box(node, [.74, .03, .185], [0, .401, .649], .013, carbon);
  box(node, [.76, .056, .133], [0, .108, .756], .021, porcelain);
  return jack(node,[0,1.16,-.566],'z',false,.128);
}

function tower(scene, x, z) {
  const node = group(scene, '06 · Телекоммуникационная вышка', x, 0, z);
  node.scale.set(1.16,1.19,1.16);
  box(node, [1.49, .202, 1.20], [0, .101, 0], .100, porcelain);
  box(node, [1.208, .070, .943], [0, .220, 0], .066, bezel);
  box(node, [.853, .093, .648], [0, .261, 0], .066, porcelain);
  const verts = [[-.208,.145],[.208,.145],[0,-.231]];
  const xy = (i, y) => {
    const s = 1 - .60 * ((y - .29) / 1.54);
    return [verts[i][0] * s, y, verts[i][1] * s];
  };
  for (let i = 0; i < 3; i++) bar(node, xy(i,.295), xy(i,1.80), .038, vermilion);
  for (let tier = 0; tier < 4; tier++) {
    const low = .333 + tier * .328;
    const high = low + .328;
    for (let i = 0; i < 3; i++) {
      const next = (i + 1) % 3;
      bar(node, xy(i,low), xy(next,low), .025, vermilion);
      bar(node, xy(i,low), xy(next,high), .024, vermilion);
      bar(node, xy(next,low), xy(i,high), .019, vermilion);
    }
  }
  cylinder(node, .119, .30, [0, 1.627, 0], 'y', porcelain);
  cylinder(node, .068, .182, [0, 1.852, 0], 'y', porcelain);
  cylinder(node,.031,.222,[0,2.021,0],'y',vermilion);
  cylinder(node,.067,.066,[0,2.156,0],'y',gunmetal);
  cylinder(node,.062,.029,[0,2.189,0],'y',silver);
  const lens = new T.LatheGeometry([
    [0,0],[.060,0],[.069,.024],[.069,.072],[.062,.103],[.045,.131],[.022,.145],[0,.148],
  ].map(([radius,height])=>new T.Vector2(radius,height)),32);
  mesh(node,lens,beaconLens,0,2.20,0,'Красный сигнальный фонарь');
  const beacon = mesh(node,new T.SphereGeometry(1,20,12),diode,0,2.274,0);
  beacon.scale.set(.052,.061,.052);
  beacon.userData.signalPhase = .8;
  for (const angle of [0,Math.PI/3,Math.PI*2/3]) {
    glow(node,[0,2.274,0],[.37,.384],.8).rotation.y = angle;
  }
  const dishes = [
    [-.428,1.55,.063,-.27], [.434,1.29,.074,.76],
    [-.467,.879,.068,-.20], [.386,1.73,-.079,.88],
  ];
  const dishDome = new T.SphereGeometry(1,26,14);
  for (const [px,py,pz,angle] of dishes) {
    const normal = v3(Math.sin(angle),0,Math.cos(angle));
    const back = v3(px,py,pz).addScaledVector(normal,-.086);
    bar(node,[Math.sign(px)*.080,py,back.z],back.toArray(),.031,silver);
    const dish = group(node,'Вынесенная круглая антенна',px,py,pz);
    dish.rotation.y = angle;
    cylinder(dish,.129,.102,[0,0,-.038],'z',vermilion);
    cylinder(dish,.168,.078,[0,0,.006],'z',porcelain);
    cylinder(dish,.160,.032,[0,0,.032],'z',silver);
    mesh(dish,dishDome,porcelain,0,0,.047).scale.set(.148,.148,.045);
  }
  box(node,[.66,.098,.499],[0,.236,-.479],.040,porcelain,'Площадка кабельного ввода');
  box(node,[.462,.436,.211],[0,.431,-.539],.053,gunmetal,'Выносной блок кабельного ввода');
  box(node,[.407,.350,.029],[0,.458,-.648],.042,silver,'Задняя стенка блока ввода');
  return jack(node,[0,.465,-.660],'z',false,.136);
}

function bundle(parent, name, start, end, radius, startHandle, endHandle, bends = []) {
  const node = group(parent, name);
  const center = new T.CurvePath();
  const points = [{...start,handle:startHandle}, ...bends.map(([position,direction,handle])=>({
    position:v3(...position), direction:v3(...direction).normalize(), handle,
  })), {...end,direction:end.direction.clone().negate(),handle:endHandle}];
  for (let i = 1; i < points.length; i++) {
    const from = points[i-1], to = points[i];
    center.add(new T.CubicBezierCurve3(
      from.position, from.position.clone().addScaledVector(from.direction,from.handle),
      to.position.clone().addScaledVector(to.direction,-to.handle), to.position,
    ));
  }
  const stepCount = 62;
  const frames = center.computeFrenetFrames(stepCount, false);
  const length = center.getLength();
  for (let strand = 0; strand < 3; strand++) {
    const path = [];
    for (let step = 0; step <= stepCount; step++) {
      const t = step / stepCount;
      const phase = strand * Math.PI * 2 / 3 + t * length * .60;
      const separation = radius * 1.08;
      path.push(center.getPointAt(t)
        .addScaledVector(frames.normals[step], Math.cos(phase) * separation)
        .addScaledVector(frames.binormals[step], Math.sin(phase) * separation));
    }
    tube(node, new T.CatmullRomCurve3(path), radius, wireMats[strand], 82, 10);
  }
}

export function createIcon() {
  const scene = new T.Group();
  scene.name = 'ИВС-СЕТИ · Кибербезопасность';
  const main = mainServer(scene);
  const route = router(scene, -3.89, -2.41);
  const remote = remoteServer(scene, .59, -3.23);
  const shieldSocket = shield(scene, -2.03, 1.90);
  const officeSocket = office(scene, 4.10, 1.78);
  const towerSocket = tower(scene, 1.12, 3.75);
  const cables = group(scene, '07 · Кабельные косы');
  bundle(cables,'Роутер · порт 1',route.front1,main.routerOne,.035,.52,.43,[
    [[-2.92,.24,-.96],[1,0,-.29],.34],
    [[-1.62,.29,-1.77],[1,.24,-.18],.37],
  ]);
  bundle(cables,'Роутер · порт 2',route.front2,main.routerTwo,.029,.63,.43,[
    [[-3.08,.38,-.77],[1,.11,-.42],.42],
    [[-1.58,.65,-1.91],[1,.38,-.16],.37],
  ]);
  bundle(cables,'Роутер · боковой порт',route.side,main.routerSide,.034,.62,.44,[
    [[-1.22,.57,-2.23],[1,.36,.13],.49],
  ]);
  bundle(cables,'Удалённый сервер · боковой разъём',remote.left,main.remoteSide,.037,.49,.41,[
    [[-.72,1.08,-2.49],[.33,-.12,1],.46],
  ]);
  bundle(cables,'Удалённый сервер · задний разъём',remote.rear,main.remoteRear,.035,.59,.37,[
    [[1.50,.34,-4.26],[.72,0,.84],.45],
    [[1.60,.43,-2.24],[-.55,.26,1],.42],
  ]);
  bundle(cables,'Щит · защита',shieldSocket,main.shield,.039,.65,.37,[
    [[-1.88,.80,-.84],[.30,-.28,-1],.48],
    [[-1.06,.55,-1.95],[1,-.09,-.07],.38],
  ]);
  bundle(cables,'Офис · сеть',main.office,officeSocket,.041,.35,.54,[
    [[1.59,.79,-1.57],[1,.12,.27],.36],
    [[2.59,.90,-.77],[.78,.16,.78],.56],
    [[3.91,1.22,.03],[.87,.36,1],.28],
  ]);
  bundle(cables,'Вышка · связь',towerSocket,main.tower,.038,.61,.35,[
    [[1.84,.32,.87],[.11,-.02,-1],.63],
    [[1.71,.33,-1.18],[-.28,.05,-1],.54],
    [[1.10,.36,-1.90],[-1,.12,-.11],.42],
  ]);
  return scene;
}

export function createSignalClip(icon) {
  const duration = 7.2;
  const tracks = [];
  icon.traverse(node=>{
    const phase = node.userData.signalPhase;
    if (phase === undefined) return;
    const times = [0,phase,phase+.15,phase+.34,phase+.58,duration];
    const level = [1,1,.27,.27,1,1];
    const scales = level.flatMap(intensity=>node.scale.toArray().map(value=>value*intensity));
    tracks.push(new T.VectorKeyframeTrack(node.uuid+'.scale',times,scales));
  });
  return new T.AnimationClip('Красные индикаторы',duration,tracks);
}
