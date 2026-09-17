"""Extract licensed head-only subsets; preserve source transforms and Draco payloads."""
import json,struct,re,copy,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(path):
 b=pathlib.Path(path).read_bytes();size=struct.unpack_from('<I',b,12)[0];return json.loads(b[20:20+size]),b[28+size:]
def clean(name):return re.sub(r'\.\d+$','',name).strip()
def base(name):return re.sub(r'\.[lr]$','',clean(name))
def export(path,out,predicate,decorate=lambda n:None):
 d,b=load(path);nodes=[copy.deepcopy(n) for n in d['nodes'] if 'mesh'in n and predicate(n)]
 assert nodes and all('children'not in n for n in nodes)
 mids=list(dict.fromkeys(n['mesh']for n in nodes));meshes=[copy.deepcopy(d['meshes'][i])for i in mids];mm={v:i for i,v in enumerate(mids)}
 aids=set();views=set()
 for mesh in meshes:
  for p in mesh['primitives']:
   aids.update(p.get('attributes',{}).values())
   if 'indices'in p:aids.add(p['indices'])
   for target in p.get('targets',[]):aids.update(target.values())
   dr=p.get('extensions',{}).get('KHR_draco_mesh_compression')
   if dr:views.add(dr['bufferView'])
 aids=sorted(aids);am={v:i for i,v in enumerate(aids)};accessors=[copy.deepcopy(d['accessors'][i])for i in aids]
 for a in accessors:
  assert 'sparse'not in a
  if 'bufferView'in a:views.add(a['bufferView'])
 views=sorted(views);vm={v:i for i,v in enumerate(views)};binary=bytearray();bviews=[]
 for v in views:
  old=d['bufferViews'][v];assert old.get('buffer',0)==0
  while len(binary)%4:binary.append(0)
  new=copy.deepcopy(old);new['byteOffset']=len(binary);start=old.get('byteOffset',0);binary.extend(b[start:start+old['byteLength']]);bviews.append(new)
 for a in accessors:
  if 'bufferView'in a:a['bufferView']=vm[a['bufferView']]
 for mesh in meshes:
  for p in mesh['primitives']:
   p['attributes']={k:am[v]for k,v in p.get('attributes',{}).items()}
   if 'indices'in p:p['indices']=am[p['indices']]
   for target in p.get('targets',[]):
    for k,v in list(target.items()):target[k]=am[v]
   dr=p.get('extensions',{}).get('KHR_draco_mesh_compression')
   if dr:dr['bufferView']=vm[dr['bufferView']]
 for n in nodes:
  n['mesh']=mm[n['mesh']];n['extras']={'sourceName':clean(n.get('extras',{}).get('sourceName',n['name']))};decorate(n)
 while len(binary)%4:binary.append(0)
 result={'asset':{'version':'2.0','generator':'Anatomia Livre — head subset; Z-Anatomy / BodyParts3D, CC BY-SA 4.0'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'accessors':accessors,'bufferViews':bviews,'buffers':[{'byteLength':len(binary)}],'materials':d.get('materials',[])}
 for k in ['extensionsUsed','extensionsRequired']:
  if k in d:result[k]=d[k]
 encoded=json.dumps(result,separators=(',',':'),ensure_ascii=False).encode();encoded+=b' '*((-len(encoded))%4)
 glb=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary
 dest=ROOT/'public/head'/out;dest.write_bytes(glb);print(out,len(nodes),'structures',len(glb),'bytes')
 return nodes
bones={'Parietal bone','Frontal bone','Occipital bone','Sphenoid bone','Temporal bone','Ethmoid bone','Inferior nasal concha bone','Lacrimal bone','Nasal bone','Maxilla','Palatine bone','Zygomatic bone','Mandible','Vomer','Malleus','Incus','Stapes'}
bone_nodes=export('/tmp/anatomia-source-skeleton.glb','bones.glb',lambda n:base(n['name'])in bones or bool(re.match(r'^(Upper|Lower) .*(incisor|canine|premolar|molar tooth)',base(n['name']))))
md,_=load('/tmp/anatomia-source-muscular.glb');muscles=[base(n['name'])for n in md['nodes'] if 'mesh'in n];muscles=set(muscles[1:muscles.index('Hyoglossus muscle')])
muscle_nodes=export('/tmp/anatomia-source-muscular.glb','muscles.glb',lambda n:base(n['name'])in muscles)
senses={'Sclera','Cornea','Iris','Lens','Retina','Cochlea','Vestibule','Tympanic membrane','Lacrimal gland'}
sense_nodes=export('/tmp/anatomia-source-nervous.glb','senses.glb',lambda n:base(n['name'])in senses)
viscera={'Tongue','Parotid gland','Sublingual gland','Submandibular gland','Adenohypophysis','Neurohypophysis','Pineal gland'}
viscera_nodes=export('/tmp/anatomia-source-visceral.glb','viscera.glb',lambda n:base(n['name'])in viscera)
manifest=json.loads((ROOT/'public/models/z-anatomy-1.4.0-manifest.json').read_text());lookup={}
for gid,label in [('cerebrum','Cérebro'),('cerebellum','Cerebelo'),('brainstem','Tronco encefálico')]:
 for name in manifest['groups'][gid]['nodes']:lookup[name.split('__')[0]]=label
raw,_=load(ROOT/'public/models/z-anatomy-1.4.0-full-body.glb');source_groups={n['name']:lookup[n['extras']['anatomyId']]for n in raw['nodes']if n.get('extras',{}).get('anatomyId')in lookup}
def brain_extras(n):n['extras']['organLabel']=source_groups[n['name']]
brain_nodes=export(ROOT/'public/models/z-anatomy-1.4.0-full-body.glb','brain.glb',lambda n:n['name']in source_groups,brain_extras)
(ROOT/'public/head/manifest.json').write_text(json.dumps({k:[n['extras']for n in nodes]for k,nodes in [('bones',bone_nodes),('muscles',muscle_nodes),('senses',sense_nodes),('viscera',viscera_nodes),('brain',brain_nodes)]},ensure_ascii=False,indent=2))

# Surface regions of the adult head; no neck or trunk geometry is included.
face_bases={'Angle of mouth','Anterior notch of auricle','Antihelix','Antitragus','Apex of auricle','Auricular region','Auricular tubercle','Buccal region','Cavity of concha','Concha of auricle','Crura of antihelix','Cymba conchae','Eminentia conchae','Eminentia fossae triangularis','Eminentia scaphae','Eyelashes','Fossa antihelica','Frontal region','Hairs of eyebrow','Hairs of head','Helix','Infra-orbital region','Intertragic incisure','Labial commissure','Lobule of auricle','Mastoid region','Mental region','Mentolabial sulcus','Nasal region','Nasolabial sulcus','Occipital region','Oral region','Orbital region','Parietal region','Parotideomasseteric region','Posterior auricular groove','Scapha','Temporal region','Tragus','Triangular fossa','Zygomatic region'}
face_nodes=export(ROOT/'public/models/z-anatomy-1.4.0-full-body.glb','face.glb',lambda n:base(n.get('extras',{}).get('sourceName',''))in face_bases)
manifest_path=ROOT/'public/head/manifest.json'
head_manifest=json.loads(manifest_path.read_text());head_manifest['face']=[n['extras']for n in face_nodes];manifest_path.write_text(json.dumps(head_manifest,ensure_ascii=False,indent=2))
