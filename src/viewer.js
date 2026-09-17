import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { translated, side } from './names.js';
import { organName } from './organ-names.js';
import { normalize, nodeNamesFor, matchesCard, materialColor } from './catalog.js';
const $=id=>document.getElementById(id);
let renderer,camera,scene,controls,manifest,atlasPromise,active=false,queued=false,selected=null,currentCard,wholeBox;
const all=[],skeleton=[],history=[];let meshes=[];
function draw(){if(queued||!active)return;queued=true;requestAnimationFrame(()=>{queued=false;if(!active)return;controls.update();renderer.render(scene,camera);});}
export function pause(){active=false;}
function renderList(){
 const q=normalize($('search').value), items=meshes.filter(m=>normalize(m.userData.label+' '+m.userData.sourceName).includes(q));$('count').textContent=`${items.length}`;
 $('list').replaceChildren(...items.map(m=>{const b=document.createElement('button');b.textContent=m.userData.label;b.dataset.structure=m.userData.anatomyId;b.classList.toggle('active',m===selected);b.classList.toggle('hidden-structure',!m.visible);b.setAttribute('aria-pressed',String(m===selected));const sub=document.createElement('small');sub.textContent=laterality(m.userData.sourceName)+(m.visible?'':' · Oculta');b.append(sub);b.onclick=()=>{select(m);frame(new THREE.Box3().setFromObject(m));};return b;}));
 if(!items.length){const p=document.createElement('p');p.textContent='Nenhuma estrutura encontrada neste modelo.';$('list').append(p);}
}
function laterality(source){return /\.[lr]$/.test(source)?side(source):'Estrutura anatômica';}
function select(m){if(selected)selected.material.emissive.set(0);selected=m;if(m){m.material.emissive.set(0x166d5f);$('selected-name').textContent=m.userData.label;$('selected-original').textContent=`${laterality(m.userData.sourceName)} · ${m.userData.sourceName}${m.visible?'':' · Oculta'}`;}else{$('selected-name').textContent='Toque em uma estrutura';$('selected-original').textContent='Ou escolha um nome na lista.';}
 for(const id of ['focus','isolate','hide'])$(id).disabled=!m;$('hide').textContent=m&&!m.visible?'Mostrar':'Ocultar';renderList();draw();
}
function snapshot(){history.push(meshes.map(m=>m.visible));if(history.length>40)history.shift();$('undo').disabled=false;}
function frame(bounds,direction){if(bounds.isEmpty())return;const center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());const v=camera.fov*Math.PI/180,h=2*Math.atan(Math.tan(v/2)*camera.aspect);const distance=Math.max(size.y/(2*Math.tan(v/2)),size.x/(2*Math.tan(h/2)),size.z/2)*1.4;const dir=direction||camera.position.clone().sub(controls.target).normalize();camera.position.copy(center).addScaledVector(dir,Math.max(distance,.025));controls.target.copy(center);controls.update();draw();}
function resize(){const el=$('canvas');if(!el.clientWidth||!el.clientHeight)return;renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();if(active&&wholeBox)frame(selected?new THREE.Box3().setFromObject(selected):wholeBox);draw();}
function updateSkeleton(){const set=new Set(meshes);for(const m of skeleton)if(!set.has(m))m.visible=$('bones').checked;draw();}
function reset(){if(meshes.some(m=>!m.visible))snapshot();meshes.forEach(m=>m.visible=true);$('search').value='';select(null);frame(wholeBox,new THREE.Vector3(0,0,1));$('view-label').textContent='Vista anterior';}
async function init(){
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.0005,100);renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;$('canvas').append(renderer.domElement);
 controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=.005;controls.maxDistance=8;controls.addEventListener('change',draw);
 scene.add(new THREE.HemisphereLight(0xffffff,0x526272,2.5));const key=new THREE.DirectionalLight(0xffeedb,3);key.position.set(2,3,4);scene.add(key);const fill=new THREE.DirectionalLight(0xc3f7ef,2);fill.position.set(-2,1,-3);scene.add(fill);
 new ResizeObserver(resize).observe($('canvas'));resize();
 const [model,data]=await Promise.all([new GLTFLoader().loadAsync('/models/z-anatomy-1.4.0-full-body.glb'),fetch('/models/z-anatomy-1.4.0-manifest.json').then(r=>{if(!r.ok)throw Error('Manifesto indisponível');return r.json();})]);manifest=data;
 model.scene.traverse(m=>{if(!m.isMesh)return;m.visible=false;const source=m.userData.sourceName||m.name;m.userData.sourceName=source;m.userData.label=organName(source)||translated(source);m.material=new THREE.MeshStandardMaterial({color:materialColor(m),roughness:.7});all.push(m);if(m.userData.anatomySystem==='skeletal')skeleton.push(m);});scene.add(model.scene);
 const ray=new THREE.Raycaster(),pointers=new Map();let moved=false;
 renderer.domElement.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=pointers.size>1;});
 renderer.domElement.addEventListener('pointermove',e=>{const p=pointers.get(e.pointerId);if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>7)moved=true;});
 renderer.domElement.addEventListener('pointercancel',e=>pointers.delete(e.pointerId));
 renderer.domElement.addEventListener('pointerup',e=>{const start=pointers.get(e.pointerId);pointers.delete(e.pointerId);if(!start||moved||pointers.size)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);select(ray.intersectObjects(meshes.filter(m=>m.visible),false)[0]?.object||null);});
 for(const [id,dir,label]of [['front',[0,0,1],'Vista anterior'],['back',[0,0,-1],'Vista posterior'],['lateral',[1,0,0],'Vista lateral']])$(id).onclick=()=>{frame(wholeBox,new THREE.Vector3(...dir));$('view-label').textContent=label;};
 $('reset').onclick=reset;$('focus').onclick=()=>selected&&frame(new THREE.Box3().setFromObject(selected));
 $('hide').onclick=()=>{if(!selected)return;snapshot();selected.visible=!selected.visible;select(selected);};
 $('isolate').onclick=()=>{if(!selected)return;snapshot();meshes.forEach(m=>m.visible=m===selected);select(selected);frame(new THREE.Box3().setFromObject(selected));};
 $('undo').onclick=()=>{const last=history.pop();if(!last)return;meshes.forEach((m,i)=>m.visible=last[i]);$('undo').disabled=!history.length;select(selected);};
 $('bones').onchange=updateSkeleton;$('search').oninput=renderList;
}
export async function open(card,isCurrent=()=>true){
 currentCard=card;active=true;delete document.body.dataset.ready;$('loading').hidden=false;$('loading').replaceChildren();const title=document.createElement('strong');title.textContent='Preparando seu modelo';const hint=document.createElement('span');hint.textContent='O primeiro acesso carrega o atlas 3D (32 MB).';$('loading').append(title,hint);
 try{
  atlasPromise??=init();await atlasPromise;if(!isCurrent())return;active=true;all.forEach(m=>m.visible=false);history.length=0;$('undo').disabled=true;
  const names=nodeNamesFor(card,manifest);meshes=all.filter(m=>matchesCard(m,card,names));if(!meshes.length)throw Error('Sem estruturas para este modelo');meshes.sort((a,b)=>a.userData.label.localeCompare(b.userData.label,'pt-BR'));
  meshes.forEach(m=>m.visible=true);$('bones').checked=false;$('bones').disabled=card.id==='positions';wholeBox=new THREE.Box3();meshes.forEach(m=>wholeBox.expandByObject(m));resize();reset();$('loading').hidden=true;document.body.dataset.ready=card.id;draw();
 }catch(error){if(!isCurrent())return;console.error(error);$('loading').replaceChildren();const p=document.createElement('p');p.textContent='Não foi possível carregar o 3D. Verifique a conexão e tente atualizar a página.';const b=document.createElement('button');b.textContent='Tentar novamente';b.onclick=()=>location.reload();$('loading').append(p,b);}
}
