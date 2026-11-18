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
 result={'asset':{'version':'2.0','generator':'Anatomia Livre — heart subset; Z-Anatomy / BodyParts3D, CC BY-SA 4.0'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'accessors':accessors,'bufferViews':bviews,'buffers':[{'byteLength':len(binary)}],'materials':d.get('materials',[])}
 for k in ['extensionsUsed','extensionsRequired']:
  if k in d:result[k]=d[k]
 encoded=json.dumps(result,separators=(',',':'),ensure_ascii=False).encode();encoded+=b' '*((-len(encoded))%4)
 glb=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary
 dest=ROOT/'public/body'/out;dest.write_bytes(glb);print(out,len(nodes),'structures',len(glb),'bytes')
 return nodes

# Chambers and valve leaflets from the licensed cardiovascular export.
export('/tmp/anatomia-body-cardiovascular.glb','heart.glb',lambda n:bool(re.search(r'atrium|ventricle|leaflet',n['name'])),lambda n:n['extras'].update(organLabel='Coração'))
