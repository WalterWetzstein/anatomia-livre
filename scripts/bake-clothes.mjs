import fs from 'node:fs/promises';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {addStudyClothes} from '../src/surface-style.js';
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();});}};
for(const sex of ['male','female']){
 const bytes=await fs.readFile(new URL(`../public/body/reference/${sex}.glb`,import.meta.url));
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
 let skin;gltf.scene.traverse(m=>{if(!m.isMesh)return;m.visible=false;if(m.name.replace(/_\d+$/,'')==='skin')skin=m;});
 if(!skin)throw Error('Missing skin');
 const records=[{region:'trunk',side:'',meshes:[]},{region:'lower',side:'Lado direito',meshes:[]},{region:'lower',side:'Lado esquerdo',meshes:[]}];
 addStudyClothes(skin,records);
 for(const record of records)for(const m of record.meshes){m.userData={clothingRegion:record.region,clothingSide:record.side};}
 const result=await new GLTFExporter().parseAsync(gltf.scene,{binary:true,onlyVisible:true});
 await fs.writeFile(new URL(`../public/body/reference/clothes-${sex}.glb`,import.meta.url),new Uint8Array(result));console.log(sex,result.byteLength);
}
