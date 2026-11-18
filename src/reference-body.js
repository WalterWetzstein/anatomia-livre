import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {skinMaterial,eyeMaterial} from './surface-style.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const base=import.meta.env.BASE_URL+'body/reference/';
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),atlases=new Map(),clothes=new Map();
const names={skin:'Pele',abdominal_muscles:'Músculos abdominais',back_muscles:'Músculos do dorso',calf:'Músculos da panturrilha',chest_muscles:'Músculos peitorais',deltoid:'Deltoide',diaphragm:'Diafragma',foot_muscles:'Músculos do pé',hand_muscles:'Músculos da mão',forearm_muscles:'Músculos do antebraço',gluteal:'Músculos glúteos',hamstrings:'Músculos posteriores da coxa',iliopsoas:'Iliopsoas',adductors:'Adutores da coxa',intercostals:'Músculos intercostais',neck_muscles:'Músculos do pescoço',pelvic_floor:'Assoalho pélvico',quadriceps:'Quadríceps femoral',rotator_cuff:'Manguito rotador',shin_muscles:'Músculos da perna',shoulder_muscles:'Músculos da cintura escapular',trapezius:'Trapézio',upper_arm_muscles:'Músculos do braço',adrenal:'Glândula suprarrenal',appendix:'Apêndice vermiforme',brain:'Cérebro',brainstem:'Tronco encefálico',breast:'Glândula mamária',bronchi:'Brônquios',cerebellum:'Cerebelo',esophagus:'Esôfago',eye:'Olho',fallopian_tubes:'Tubas uterinas',gallbladder:'Vesícula biliar e vias biliares',heart:'Coração',kidney:'Rim',colon:'Intestino grosso',larynx:'Laringe',liver:'Fígado',lung:'Pulmão',reproductive:'Órgãos genitais masculinos',ovary:'Ovário',pancreas:'Pâncreas',pharynx:'Faringe',pituitary:'Hipófise',prostate:'Próstata',salivary_glands:'Glândulas salivares',small_intestine:'Intestino delgado',spleen:'Baço',stomach:'Estômago',thymus:'Timo',tongue:'Língua',trachea:'Traqueia',ureter:'Ureter',bladder:'Bexiga urinária',uterus:'Útero',vagina:'Vagina',spine_cervical:'Coluna cervical',clavicle:'Clavícula',foot:'Ossos do pé',forearm:'Ossos do antebraço',hand:'Ossos da mão',mandible:'Mandíbula',patella:'Patela',spine_lumbar:'Coluna lombar',pelvis:'Pelve e sacro',ribs:'Costelas',lower_leg:'Tíbia e fíbula',scapula:'Escápula',skull:'Crânio',sternum:'Esterno',teeth:'Dentes e gengivas',femur:'Fêmur',spine_thoracic:'Coluna torácica',humerus:'Úmero'};
export function referenceLabel(key){return names[key.replace(/_[lr]$/,'')]||key;}
function regionFor(key,system){
 if(/brain|cerebellum|eye|skull|mandible|teeth|tongue|salivary|pituitary|pharynx|larynx|neck|spine_cervical/.test(key))return 'head';
 if(/clavicle|scapula|shoulder|humerus|forearm|hand|upper_arm|deltoid|rotator/.test(key))return 'upper';
 if(/femur|lower_leg|patella|foot|calf|shin|quadriceps|hamstrings|adductors/.test(key))return 'lower';
 return 'trunk';
}
function splitSurface(mesh,group){
 const geometry=mesh.geometry,position=geometry.getAttribute('position'),index=geometry.index;
 const fullBox=new THREE.Box3().setFromObject(mesh),height=fullBox.max.y-fullBox.min.y,center=fullBox.getCenter(new THREE.Vector3());
 const buckets=new Map(),v=new THREE.Vector3(),p=new THREE.Vector3();
 for(let i=0;i<(index?.count||position.count);i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);v.set(0,0,0);for(const id of ids)v.add(p.fromBufferAttribute(position,id).applyMatrix4(mesh.matrixWorld));v.multiplyScalar(1/3);
 const y=(v.y-fullBox.min.y)/height,x=(v.x-center.x)/height;
 const region=y>.82?'head':Math.abs(x)>.105&&y>.36?'upper':y<.47?'lower':'trunk';
 const side=['upper','lower'].includes(region)?(x<0?'r':'l'):'';const key=region+(side?'_'+side:'');
 if(!buckets.has(key))buckets.set(key,{indices:[],box:new THREE.Box3(),region,side});const item=buckets.get(key);item.indices.push(...ids);for(const id of ids)item.box.expandByPoint(p.fromBufferAttribute(position,id));
 }
 const labels={head:'Pele — cabeça e pescoço',trunk:'Pele — tronco e pelve',upper:'Pele — membro superior',lower:'Pele — membro inferior'},records=[];
 for(const[key,item]of buckets){const part=mesh.clone(false);part.geometry=geometry.clone();part.geometry.setIndex(item.indices);part.geometry.boundingBox=item.box;part.geometry.boundingSphere=item.box.getBoundingSphere(new THREE.Sphere());part.material=skinMaterial(part.geometry,mesh.matrixWorld);part.name='surface_'+key;part.visible=true;mesh.parent.add(part);
 const record={id:part.name,label:labels[item.region],side:item.side==='l'?'Lado esquerdo':item.side==='r'?'Lado direito':'',sources:['Pele',part.name],region:item.region,meshes:[part]};part.userData.record=record;records.push(record);
 }
 return records;
}
export async function loadReferenceBody(id,sex){
 if(!atlases.has(sex))atlases.set(sex,Promise.all([loader.loadAsync(base+sex+'.glb'),fetch(base+'catalog.json').then(r=>{if(!r.ok)throw Error('Catálogo indisponível');return r.json();})]).catch(error=>{atlases.delete(sex);throw error;}));
 const [gltf,catalog]=await atlases.get(sex),lookup=new Map(catalog.map(x=>[x.key,x]));
 const group=gltf.scene.clone(true),records=[],surfaceMeshes=[];group.updateMatrixWorld(true);
 group.traverse(mesh=>{if(!mesh.isMesh)return;const key=mesh.name.replace(/_\d+$/,''),data=lookup.get(key),system={surface:'skin',bones:'skeleton',muscles:'muscles',organs:'organs'}[id];
 mesh.visible=false;if(!data)return;
 if(id==='surface'&&data.system==='skin'){surfaceMeshes.push(mesh);return;}
 if(data.system!==system&&!(id==='surface'&&/^eye_[lr]$|^teeth$/.test(key)))return;
 mesh.visible=true;const skinContext=id==='surface',materialColor=skinContext?(/^eye_/.test(key)?0xc9c3b7:0xe8dfc8):id==='bones'?0xd6c5a7:id==='muscles'?0xb75445:data.color;
 mesh.material=skinContext&&/^eye_/.test(key)?eyeMaterial(mesh):new THREE.MeshStandardMaterial({color:materialColor,roughness:.65});
 const record={id:key,label:referenceLabel(key),side:key.endsWith('_l')?'Lado esquerdo':key.endsWith('_r')?'Lado direito':'',sources:[data.label,key],region:regionFor(key,data.system),meshes:[mesh]};mesh.userData.record=record;records.push(record);
 });
 for(const mesh of surfaceMeshes)records.push(...splitSurface(mesh,group));
 if(id==='surface'){
  if(!clothes.has(sex))clothes.set(sex,loader.loadAsync(base+'clothes-'+sex+'.glb').catch(error=>{clothes.delete(sex);throw error;}));
  const outfit=(await clothes.get(sex)).scene.clone(true);outfit.traverse(mesh=>{if(!mesh.isMesh)return;const record=records.find(r=>r.region===mesh.userData.clothingRegion&&r.side===mesh.userData.clothingSide);if(record){mesh.material=mesh.material.clone();mesh.userData.record=record;record.meshes.push(mesh);}});group.add(outfit);
 }
 if(!records.length)throw Error('Nenhuma estrutura neste sistema');
 return {group,groups:records.sort((a,b)=>a.label.localeCompare(b.label,'pt-BR')||a.side.localeCompare(b.side,'pt-BR'))};
}
