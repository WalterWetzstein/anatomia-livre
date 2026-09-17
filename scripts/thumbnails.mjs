import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5173');
 await page.evaluate(async()=>{
  const THREE=await import('/node_modules/three/build/three.module.js');
  const {GLTFLoader}=await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');
  const {catalog,hasModel,nodeNamesFor,matchesCard,materialColor}=await import('/src/catalog.js');
  const [gltf,manifest]=await Promise.all([new GLTFLoader().loadAsync('/models/z-anatomy-1.4.0-full-body.glb'),fetch('/models/z-anatomy-1.4.0-manifest.json').then(r=>r.json())]);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(480,340);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
  const scene=new THREE.Scene();scene.add(gltf.scene);scene.add(new THREE.HemisphereLight(0xffffff,0x526272,2.5));const key=new THREE.DirectionalLight(0xffeedb,3);key.position.set(2,3,4);scene.add(key);const fill=new THREE.DirectionalLight(0xc3f7ef,2);fill.position.set(-2,1,-3);scene.add(fill);
  const all=[];gltf.scene.traverse(m=>{if(m.isMesh){m.visible=false;m.material=new THREE.MeshStandardMaterial({color:materialColor(m),roughness:.7});all.push(m);}});
  const camera=new THREE.PerspectiveCamera(35,480/340,.0001,100);
  window.makeThumb=id=>{const card=catalog.find(c=>c.id===id);const names=nodeNamesFor(card,manifest);all.forEach(m=>m.visible=matchesCard(m,card,names));const visible=all.filter(m=>m.visible);if(!visible.length)throw Error('Empty: '+id);const box=new THREE.Box3();visible.forEach(m=>box.expandByObject(m));const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());const vfov=camera.fov*Math.PI/180,hfov=2*Math.atan(Math.tan(vfov/2)*camera.aspect);const distance=Math.max(size.y/(2*Math.tan(vfov/2)),size.x/(2*Math.tan(hfov/2)),size.z)*1.25;camera.position.copy(center).add(new THREE.Vector3(.12,.02,1).normalize().multiplyScalar(distance));camera.lookAt(center);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/webp',.9);};
  window.thumbIds=catalog.filter(hasModel).map(c=>c.id);
 });
 for(const id of await page.evaluate(()=>window.thumbIds)){if(process.argv[2]&&id!==process.argv[2])continue;const data=await page.evaluate(id=>window.makeThumb(id),id);await writeFile(`public/thumbnails/${id}.webp`,Buffer.from(data.split(',')[1],'base64'));console.log('Created',id);}
}finally{await browser.close();}
