"""Preserve source labels as extras before Three.js sanitizes GLTF node names."""
import json,struct,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
for name in ('bones','muscles','organs'):
 path=root/'public/body'/f'{name}.glb'
 raw=path.read_bytes();size=struct.unpack_from('<I',raw,12)[0]
 data=json.loads(raw[20:20+size]);rest=raw[20+size:]
 for node in data['nodes']:
  if 'mesh' in node:node.setdefault('extras',{})['sourceName']=node['name']
 data['asset']['generator']='Anatomia Livre — source labels preserved; Z-Anatomy / BodyParts3D, CC BY-SA 4.0'
 encoded=json.dumps(data,separators=(',',':'),ensure_ascii=False).encode();encoded+=b' '*(-len(encoded)%4)
 path.write_bytes(struct.pack('<III',0x46546c67,2,20+len(encoded)+len(rest))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+rest)
