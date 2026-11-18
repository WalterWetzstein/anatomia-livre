import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {loadReferenceBody,referenceLabel} from './reference-body.js';
import {cleanSource} from './body-names.js';
const base=import.meta.env.BASE_URL,draco=new DRACOLoader().setDecoderPath(base+'draco/').setWorkerLimit(2),loader=new GLTFLoader().setDRACOLoader(draco);
let sources;
// Bounding landmarks measured from the original skeleton and the female
// reference skeleton. Internal organ surfaces follow those bony references.
const landmarks={
 ribs:{source:[[-.141640145,1.056445781,-.097342175],[.141640139,1.446540763,.112813154]],target:[[-.128323572,1.046802640,-.073988158],[.133625294,1.351064801,.067199420]]},
 pelvis:{source:[[-.134894401,.797339715,-.095002562],[.134894401,1.011940278,.056068694]],target:[[-.129990354,.820081789,-.114126152],[.130514860,1.005083661,.029502718]]}
};
function alignment(kind){const {source,target}=landmarks[kind],scale=new THREE.Vector3(),offset=new THREE.Vector3();for(let axis=0;axis<3;axis++){scale.setComponent(axis,(target[1][axis]-target[0][axis])/(source[1][axis]-source[0][axis]));offset.setComponent(axis,target[0][axis]-source[0][axis]*scale.getComponent(axis));}return {scale,offset};}
const ribs=alignment('ribs'),pelvis=alignment('pelvis');
const labels={thyroid:'Glândula tireoide',parathyroid:'Glândulas paratireoides',pineal:'Glândula pineal',sublingual:'Glândula sublingual',submandibular:'Glândula submandibular',parotid:'Glândula parótida'};
const systems={lung:'respiratory',trachea:'respiratory',bronchi:'respiratory',larynx:'respiratory',pharynx:'respiratory',heart:'cardiovascular',liver:'digestive',gallbladder:'digestive',stomach:'digestive',pancreas:'digestive',colon:'digestive',small_intestine:'digestive',spleen:'lymphatic',appendix:'digestive',esophagus:'digestive',tongue:'digestive',parotid:'digestive',sublingual:'digestive',submandibular:'digestive',kidney:'urinary',ureter:'urinary',bladder:'urinary',uterus:'reproductive',ovary:'reproductive',fallopian_tubes:'reproductive',vagina:'reproductive',breast:'reproductive',prostate:'reproductive',reproductive:'reproductive',adrenal:'endocrine',pituitary:'endocrine',pineal:'endocrine',thyroid:'endocrine',parathyroid:'endocrine',thymus:'endocrine'};
function root(key){return key.replace(/_[lr]$/,'');}
export function organSystem(key){return systems[root(key)]||'head';}
function colour(key){const colours={lung:0xcc9291,heart:0xa84242,liver:0x825347,gallbladder:0x73905d,stomach:0xc89383,pancreas:0xd5b28a,kidney:0x94594d,ureter:0xcbb49c,bladder:0xc4a184,colon:0xbd8d79,small_intestine:0xcf9f8b,bronchi:0xe0c9ad,trachea:0xd5c2ac,brain:0xc99e99};return colours[root(key)]||0xc59991;}
function keyFor(source){
 const s=cleanSource(source),name=s.replace(/\.[lrij]$/,''),side=s.endsWith('.l')?'l':s.endsWith('.r')?'r':null;
 const single={'Liver':'liver','Gallbladder':'gallbladder','Bile duct':'gallbladder','Stomach':'stomach','Pancreas':'pancreas','Oesophagus':'esophagus','Trachea':'trachea','Urinary bladder':'bladder','Thyroid gland':'thyroid','Inferior parathyroid gland':'parathyroid','Superior parathyroid gland':'parathyroid','Adenohypophysis':'pituitary','Neurohypophysis':'pituitary','Pineal gland':'pineal','Tongue':'tongue','Parotid gland':'parotid','Sublingual gland':'sublingual','Submandibular gland':'submandibular','Prostate':'prostate','Ductus deferens':'reproductive','Ejaculatory duct':'reproductive','Seminal gland':'reproductive','Testis':'reproductive','Epididymis':'reproductive','Corpus cavernosum of penis':'reproductive','Corpus spongiosum of penis':'reproductive','Glans penis':'reproductive','Urethra':'reproductive','Pharynx':'pharynx','Nasopharynx':'pharynx','Oropharynx':'pharynx','Laryngopharynx':'pharynx','Epiglottis':'larynx'};
 if(single[name])return single[name];
 if(/^(Superior|Middle|Inferior) lobe of (left|right) lung$/.test(name))return 'lung_'+(name.includes('left')?'l':'r');
 if(/bronchus/.test(name))return 'bronchi';
 if(side&&{'Kidney':1,'Ureter':1,'Suprarenal gland':1}[name])return ({Kidney:'kidney',Ureter:'ureter','Suprarenal gland':'adrenal'})[name]+'_'+side;
 return null;
}
export async function loadOrganView(sex){
 sources??=Promise.all(['organs','heart'].map(file=>loader.loadAsync(base+'body/'+file+'.glb'))).catch(error=>{sources=null;throw error;});
 const [loaded,reference]=await Promise.all([sources,loadReferenceBody('organs',sex)]);
 const group=new THREE.Group(),records=new Map(),originals=new THREE.Group();
 for(let file=0;file<loaded.length;file++){
  const scene=loaded[file].scene.clone(true);scene.updateMatrixWorld(true);
  scene.traverse(mesh=>{if(!mesh.isMesh)return;const key=file===1?'heart':keyFor(mesh.userData.sourceName||mesh.name);mesh.visible=false;if(!key)return;
   if(sex==='female'&&['reproductive','prostate'].includes(key))return;
   if(sex==='female'){
    const y=new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3()).y,t=THREE.MathUtils.smoothstep(y,.95,1.10),scale=pelvis.scale.clone().lerp(ribs.scale,t),offset=pelvis.offset.clone().lerp(ribs.offset,t);
    mesh.applyMatrix4(new THREE.Matrix4().makeScale(scale.x,scale.y,scale.z).setPosition(offset));
   }
   mesh.visible=true;mesh.material=new THREE.MeshStandardMaterial({color:colour(key),roughness:.83,side:THREE.DoubleSide});
   if(!records.has(key))records.set(key,{id:key,label:labels[key]||referenceLabel(key),side:key.endsWith('_l')?'Lado esquerdo':key.endsWith('_r')?'Lado direito':'',sources:[],meshes:[],system:organSystem(key),region:['pituitary','pineal','tongue','parotid','sublingual','submandibular','pharynx','larynx','thyroid','parathyroid'].includes(key)?'head':'trunk'});
   const record=records.get(key);record.sources.push(mesh.userData.sourceName||mesh.name);record.meshes.push(mesh);mesh.userData.record=record;
  });originals.add(scene);
 }
 // Keep useful structures unavailable in the original visceral subset, including
 // bowel, spleen, brain, eyes and the female-specific HRA organs.
 for(const record of reference.groups){
  if(records.has(record.id)){record.meshes.forEach(mesh=>mesh.visible=false);continue;}
  record.system=organSystem(record.id);record.detail=/^breast_/.test(record.id);record.meshes.forEach(mesh=>{mesh.material=new THREE.MeshStandardMaterial({color:colour(record.id),roughness:.83,side:THREE.DoubleSide});});records.set(record.id,record);
 }
 group.add(originals,reference.group);return {group,groups:[...records.values()].sort((a,b)=>a.label.localeCompare(b.label,'pt-BR')||a.side.localeCompare(b.side,'pt-BR'))};
}
