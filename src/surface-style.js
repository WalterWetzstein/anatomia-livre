import * as THREE from 'three';

// Quiet, matte skin with subtle colour variation; no photographic texture.
export function skinMaterial(geometry,matrix){
 const position=geometry.getAttribute('position'),colours=new Float32Array(position.count*3),point=new THREE.Vector3(),base=new THREE.Color('#bf967f');
 for(let i=0;i<position.count;i++){
  point.fromBufferAttribute(position,i).applyMatrix4(matrix);
  const variation=Math.sin(point.x*42+point.y*31)*Math.cos(point.z*35)*.012;
  const colour=base.clone().offsetHSL(variation*.12,variation*.25,variation);
  colour.toArray(colours,i*3);
 }
 geometry.setAttribute('color',new THREE.BufferAttribute(colours,3));
 return new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.88,metalness:0,clearcoat:0,sheen:.08,sheenColor:new THREE.Color('#d9b39b')});
}

export function eyeMaterial(mesh){
 const geometry=mesh.geometry.clone(),position=geometry.getAttribute('position'),box=new THREE.Box3().setFromObject(mesh),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),colours=new Float32Array(position.count*3),point=new THREE.Vector3();
 for(let i=0;i<position.count;i++){
  point.fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld);
  const radius=Math.hypot(point.x-center.x,point.y-center.y),iris=size.x*.23;
  const colour=new THREE.Color(point.z>center.z&&radius<iris?(radius<iris*.47?'#201b19':'#644c37'):'#d8d4c8');
  colour.toArray(colours,i*3);
 }
 geometry.setAttribute('color',new THREE.BufferAttribute(colours,3));mesh.geometry=geometry;
 return new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.48});
}

function tube(rings,colour){
 const positions=[],indices=[],segments=80;
 for(const ring of rings)for(let j=0;j<=segments;j++){
  const angle=j/segments*Math.PI*2;
  if(ring.points){positions.push(...ring.points[j%segments]);}else positions.push(ring.x+Math.cos(angle)*ring.rx,ring.y,ring.z+Math.sin(angle)*ring.rz);
 }
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<segments;j++){
  const a=i*(segments+1)+j,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({color:colour,roughness:1,metalness:0,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(geometry,material);mesh.name='clothing';return mesh;
}

export function addStudyClothes(skin,records){
 const position=skin.geometry.getAttribute('position'),box=new THREE.Box3().setFromObject(skin),height=box.max.y-box.min.y,center=box.getCenter(new THREE.Vector3()),point=new THREE.Vector3(),samples=[];
 for(let i=0;i<position.count;i++){
  point.fromBufferAttribute(position,i).applyMatrix4(skin.matrixWorld);
  samples.push({x:point.x,y:(point.y-box.min.y)/height,z:point.z});
 }
 const ring=(y,{side=0,leg=false,extra=1}={})=>{
  const row=samples.filter(p=>Math.abs(p.y-y)<.012&&(leg?(side<0?(p.x<center.x&&p.x>center.x-height*.10):(p.x>center.x&&p.x<center.x+height*.10)):true)&&Math.abs(p.x-center.x)<height*.12);
  const bounds=new THREE.Box3();row.forEach(p=>bounds.expandByPoint(new THREE.Vector3(p.x,p.y,p.z)));
  const c=bounds.isEmpty()?center:bounds.getCenter(new THREE.Vector3()),size=bounds.isEmpty()?new THREE.Vector3(height*.18,0,height*.12):bounds.getSize(new THREE.Vector3());
  return {x:leg?c.x:center.x,y:box.min.y+y*height,z:c.z,rx:size.x/2*extra+.008,rz:size.z/2*extra+.012};
 };
 // An opaque sleeveless shirt and knee-length athletic shorts. Cross-sections
 // are conservative envelopes, so intimate anatomy is covered from every view.
 const ray=new THREE.Raycaster(),origin=new THREE.Vector3(),direction=new THREE.Vector3();
 const oldSide=skin.material.side;skin.material.side=THREE.DoubleSide;
 const shirtRings=Array.from({length:52},(_,i)=>.585+i*.005).map(y=>{
  const central=samples.filter(p=>Math.abs(p.y-y)<.012&&Math.abs(p.x-center.x)<height*.025);
  const low=Math.min(...central.map(p=>p.z)),high=Math.max(...central.map(p=>p.z));
  const z=central.length?(low+high)/2:center.z,points=[];
  for(let j=0;j<80;j++){
   const angle=j/80*Math.PI*2;origin.set(center.x,box.min.y+y*height,z);direction.set(Math.cos(angle),0,Math.sin(angle));ray.set(origin,direction);
   const hit=ray.intersectObject(skin,false)[0];const distance=hit?hit.distance:height*.075;
   points.push([origin.x+direction.x*(distance+.018),origin.y,origin.z+direction.z*(distance+.018)]);
  }
  // Smooth small surface details into fabric instead of tracing them.
  for(let pass=0;pass<2;pass++){
   const previous=points.map(p=>[...p]);for(let j=0;j<80;j++)for(const axis of [0,2])points[j][axis]=(previous[(j+79)%80][axis]+2*previous[j][axis]+previous[(j+1)%80][axis])/4;
  }
  return {points};
 });skin.material.side=oldSide;
 const shirt=tube(shirtRings,0x405e67);
 const waistRings=[.425,.445,.465,.485,.505,.525,.545,.565,.585,.595].map(y=>{
  const r=ring(y,{extra:1.03});r.rx=Math.min(r.rx,height*(y>.56?.10:y>.50?.112:.118))*1.08;r.rz*=1.15;return r;
 });
 const waist=tube(waistRings,0x263e48);
 const garments=[{mesh:shirt,region:'trunk',side:''},{mesh:waist,region:'trunk',side:''}];
 for(const side of [-1,1]){
  const leg=tube([.34,.37,.40,.43,.46,.49].map(y=>ring(y,{side,leg:true,extra:1.1})),0x263e48);
  garments.push({mesh:leg,region:'lower',side:side<0?'Lado direito':'Lado esquerdo'});
 }
 const inverseParent=skin.parent.matrixWorld.clone().invert();
 for(const {mesh,region,side}of garments){
  mesh.applyMatrix4(inverseParent);skin.parent.add(mesh);
  const record=records.find(r=>r.region===region&&r.side===side);
  if(record){mesh.userData.record=record;record.meshes.push(mesh);}
 }
}
