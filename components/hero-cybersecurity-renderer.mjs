import * as T from 'three';
import {createIcon,createSignalClip} from './hero-cybersecurity-scene.mjs';

export function createHeroScene(canvas,context) {
  const renderer = new T.WebGLRenderer({canvas,context});
  renderer.setClearColor(0xffffff,0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .94;
  renderer.transmissionResolutionScale = 1.0;
  const scene = new T.Scene();
  const icon = createIcon();
  scene.add(icon);
  const mixer = new T.AnimationMixer(icon);
  mixer.clipAction(createSignalClip(icon)).play();
  function studioEnvironment(glassCards = false) {
    const width = glassCards ? 1024 : 512, height = width / 2;
    const data = new Float32Array(width * height * 4);
    function panel(center, w, h, power, tint) {
      const d = new T.Vector3(...center).normalize();
      const right = new T.Vector3(d.z, 0, -d.x).normalize();
      const up = new T.Vector3().crossVectors(d, right).normalize();
      return {d, right, up, w, h, power, tint};
    }
    const panels = [
      panel([-3,3.3,4], .55,.54, 6.2, [1,.956,.928]),
      panel([3.6,2.8,2.9], .119,.68, 8.4, [.92,.956,1]),
      panel([4.4,.8,-3.6], .17,.51, 4.0, [1,.968,.958]),
      panel([-1.1,4.8,-2.0], .52,.29, 5.9, [1,.981,.955]),
      panel([-.3,.48,5], .27,.16, 1.05, [.97,.988,1]),
      panel([-3.7,.78,-1.4], .29,.45, 2.1, [.91,.945,1]),
    ];
    if (glassCards) {
      // Narrow studio strips give the polished face and bevel distinct reflections.
      panels.push(
        panel([-.8,-2.4,5.0], .075,.38, 12, [.92,.965,1]),
        panel([4.8,-2.55,-3.1], .080,.42, 11, [.91,.96,1]),
        panel([3.7,-1.3,-1.25], .10,.22, 7.5, [1,.93,.91]),
        panel([-2.2,4.9,-4.7], .34,.077, 11, [.94,.97,1]),
      );
    }
    const ray = new T.Vector3();
    for (let y = 0; y < height; y++) {
      const elevation = (y + .5) / height * Math.PI - Math.PI / 2;
      const horizontal = Math.cos(elevation);
      for (let x = 0; x < width; x++) {
        const azimuth = ((x+.5)/width - .5) * Math.PI * 2;
        ray.set(Math.cos(azimuth)*horizontal,Math.sin(elevation),Math.sin(azimuth)*horizontal);
        const base = .16 + Math.max(0,ray.y)*.18 + Math.max(0,-ray.y)*.21;
        let r=base*1.016, g=base, b=base*1.024;
        for (const {d,right,up,w,h,power,tint} of panels) {
          const z = ray.dot(d);
          if (z <= 0) continue;
          const nx = Math.abs(ray.dot(right)/z/w), ny = Math.abs(ray.dot(up)/z/h);
          const edge = 1-T.MathUtils.smoothstep(Math.max(nx,ny),.86,1.06);
          const a = power * edge;
          r += a*tint[0]; g += a*tint[1]; b += a*tint[2];
        }
        const i = (width*y+x)*4;
        data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = 1;
      }
    }
    const input = new T.DataTexture(data,width,height,T.RGBAFormat,T.FloatType);
    input.mapping = T.EquirectangularReflectionMapping;
    input.needsUpdate = true;
    const pmrem = new T.PMREMGenerator(renderer);
    const environment = pmrem.fromEquirectangular(input);
    input.dispose();
    pmrem.dispose();
    return environment;
  }
  const env = studioEnvironment();
  scene.environment = env.texture;
  const glassEnvironment = studioEnvironment(true);
  const originalGlass = icon.getObjectByName('Литой стеклянный корпус').material;
  const glass = originalGlass.clone();
  glass.envMap = glassEnvironment.texture;
  icon.traverse(node => {
    if (node.material === originalGlass) node.material = glass;
  });
  scene.environmentIntensity = .76;
  scene.add(new T.HemisphereLight(0xebecfb,0xcebdbc,.78));
  function lamp(color, intensity, pos) {
    const light = new T.DirectionalLight(color,intensity);
    light.position.set(...pos);
    scene.add(light);
  }
  lamp(0xfff7f5,1.65,[-4,6,5]);
  lamp(0xe9eeff,.78,[4.5,2.8,1.4]);
  lamp(0xffffff,1.21,[-2,4,-4]);

  // Optional soft studio contact shadows are outside the exportable model.
  const shadowData = new Uint8Array(128*128*4);
  for(let y=0;y<128;y++) for(let x=0;x<128;x++){
    const d = Math.hypot((x-63.5)/63.5,(y-63.5)/63.5);
    const i = (y*128+x)*4;
    shadowData[i] = 73; shadowData[i+1] = 49; shadowData[i+2] = 52;
    shadowData[i+3] = Math.round(190*Math.exp(-d*d*4.1)*(1-T.MathUtils.smoothstep(d,.48,1)));
  }
  const shadowTexture = new T.DataTexture(shadowData,128,128);
  shadowTexture.needsUpdate=true;
  shadowTexture.colorSpace=T.SRGBColorSpace;
  shadowTexture.magFilter=T.LinearFilter;
  shadowTexture.minFilter=T.LinearFilter;
  const softShadows = new T.Group();
  const shadowGeometry = new T.PlaneGeometry(1,1);
  for (const [x,z,w,d,alpha] of [[0,0,5.65,5.0,.145],[-3.89,-2.41,3.48,3.2,.106],[.59,-3.23,3.15,3.0,.105],[-2.03,1.90,2.76,2.2,.099],[4.10,1.78,3.88,3.08,.122],[1.12,3.75,2.93,2.66,.11]]) {
    const shadow = new T.Mesh(shadowGeometry,new T.MeshBasicMaterial({color:0xffffff,map:shadowTexture,transparent:true,depthWrite:false,opacity:alpha,toneMapped:false}));
    shadow.position.set(x,-.037,z);
    shadow.rotation.x=-Math.PI/2;
    shadow.scale.set(w,d,1);
    shadow.renderOrder=-3;
    softShadows.add(shadow);
  }
  scene.add(softShadows);

  const look = new T.Vector3(.018,1.040,.043);
  const pitch = .566;
  const yaw = .545;
  const distance = 17;
  const span = 10.18;
  const camera = new T.OrthographicCamera(-span/2,span/2,span/2,-span/2,.1,95);
  camera.position.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch))
    .multiplyScalar(distance).add(look);
  camera.lookAt(look);

  return {
    resize() {
      const {clientWidth,clientHeight} = canvas;
      if (!clientWidth || !clientHeight) return;
      const aspect = clientWidth/clientHeight;
      const h = span/2*Math.max(1,1/aspect);
      Object.assign(camera,{left:-h*aspect,right:h*aspect,top:h,bottom:-h});
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
      renderer.setSize(clientWidth,clientHeight,false);
    },
    render(angle,time) {
      icon.rotation.y = angle;
      softShadows.rotation.y = angle;
      mixer.setTime(time);
      renderer.render(scene,camera);
    },
    dispose() {
      mixer.stopAllAction();
      mixer.uncacheRoot(icon);
      const geometries = new Set();
      const materials = new Set();
      scene.traverse(node=>{
        if (node.geometry) geometries.add(node.geometry);
        if (node.material) materials.add(node.material);
      });
      geometries.forEach(geometry=>geometry.dispose());
      materials.forEach(material=>material.dispose());
      env.dispose();
      glassEnvironment.dispose();
      shadowTexture.dispose();
      renderer.dispose();
    },
  };
}
