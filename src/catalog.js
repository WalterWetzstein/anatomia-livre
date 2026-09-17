export const sections = [
 {id:'muscular',name:'Músculos · Sistema muscular',short:'Músculos',description:'Explore os grupos musculares por região do corpo.'},
 {id:'joints',name:'Articulações',short:'Articulações',description:'Nomes de referência. Os modelos articulares ainda não fazem parte desta coleção.'},
 {id:'digestive',name:'Sistema digestório',short:'Digestório',description:'Órgãos e estruturas do aparelho digestório.'},
 {id:'urinary',name:'Sistema urinário',short:'Urinário',description:'Rins e vias urinárias.'},
 {id:'reproductive',name:'Sistema genital',short:'Genital',description:'Organizado separadamente do sistema urinário para facilitar a busca.'},
 {id:'endocrine',name:'Glândulas endócrinas',short:'Glândulas',description:'Glândulas e seus nomes alternativos.'},
 {id:'cardiovascular',name:'Sistema cardiovascular',short:'Artérias',description:'Artérias disponíveis na coleção de referência.'},
 {id:'general',name:'Generalidades',short:'Generalidades',description:'Orientação espacial e estruturas ósseas de referência.'},
];
export const catalog = [
 {id:'muscles-head',section:'muscular',name:'Músculos da cabeça e do pescoço',groups:['facial-expression-muscles','neck-muscles'],partial:true,note:'Inclui músculos da expressão facial e do pescoço. A coleção não contém todos os músculos dessa região.'},
 {id:'muscles-trunk',section:'muscular',name:'Músculos do tronco',groups:['external-abdominal-obliques','internal-abdominal-obliques','transversus-abdominis','rectus-abdominis','pyramidalis-muscles','quadratus-lumborum','inguinal-ligaments','linea-alba'],partial:true,note:'Disponíveis: músculos abdominais, quadrado lombar e estruturas associadas. Ainda faltam músculos peitorais e das costas.'},
 {id:'muscles-upper',section:'muscular',name:'Músculos do membro superior',groups:['deltoid-muscles','rotator-cuff-muscles','hand-muscles'],partial:true,note:'Disponíveis: deltoide, manguito rotador e músculos da mão. Ainda faltam músculos do braço e do antebraço.'},
 {id:'muscles-lower',section:'muscular',name:'Músculos do membro inferior',groups:['superficial-gluteal-muscles','deep-gluteal-muscles'],partial:true,note:'Disponíveis: músculos glúteos e profundos do quadril. Ainda faltam os demais músculos da coxa, perna e pé.'},
 {id:'joint-types',section:'joints',name:'Tipos de articulações'},
 {id:'joint-movements',section:'joints',name:'Movimentos articulares'},
 {id:'joints-head',section:'joints',name:'Articulações da cabeça e do pescoço'},
 {id:'joints-trunk',section:'joints',name:'Articulações do tronco'},
 {id:'joints-upper',section:'joints',name:'Articulações do membro superior'},
 {id:'joints-lower',section:'joints',name:'Articulações do membro inferior'},
 {id:'oesophagus',section:'digestive',name:'Esôfago',groups:['oesophagus']},
 {id:'stomach',section:'digestive',name:'Estômago',groups:['stomach']},
 {id:'liver',section:'digestive',name:'Fígado',groups:['liver']},
 {id:'gallbladder',section:'digestive',name:'Vesícula biliar',groups:['gallbladder']},
 {id:'pancreas',section:'digestive',name:'Pâncreas',groups:['pancreas']},
 {id:'duodenum',section:'digestive',name:'Duodeno',sources:['Duodenum']},
 {id:'jejunum',section:'digestive',name:'Jejuno',sources:['Jejunum']},
 {id:'ileum',section:'digestive',name:'Íleo'},
 {id:'colon',section:'digestive',name:'Colo',aliases:['Cólon','Intestino grosso'],sources:['Ascending colon','Transverse colon','Descending colon','Sigmoid colon']},
 {id:'rectum',section:'digestive',name:'Reto'},
 {id:'peritoneum',section:'digestive',name:'Peritônio'},
 {id:'kidneys',section:'urinary',name:'Rim',aliases:['Rins'],groups:['kidneys']},
 {id:'ureter',section:'urinary',name:'Ureter',aliases:['Ureteres']},
 {id:'bladder',section:'urinary',name:'Bexiga urinária',groups:['bladder']},
 {id:'genital-male',section:'reproductive',name:'Sistema genital masculino',groups:['testes','epididymides','ductus-deferentes','ejaculatory-ducts','seminal-glands','prostate','penile-erectile-tissues'],partial:true,note:'Inclui testículos, epidídimos, ductos, glândulas seminais, próstata e tecidos eréteis. Coleção parcial.'},
 {id:'genital-female',section:'reproductive',name:'Sistema genital feminino'},
 {id:'pineal',section:'endocrine',name:'Glândula pineal',aliases:['Corpo pineal','Epífise'],groups:['pineal-gland']},
 {id:'thyroid',section:'endocrine',name:'Glândula tireoide',groups:['thyroid-gland']},
 {id:'parathyroid',section:'endocrine',name:'Glândula paratireoide',aliases:['Glândulas paratireoides'],groups:['parathyroid-glands']},
 {id:'pituitary',section:'endocrine',name:'Hipófise',aliases:['Glândula pituitária'],groups:['pituitary-gland']},
 {id:'adrenal',section:'endocrine',name:'Glândula suprarrenal',aliases:['Glândula supra-renal','Glândula adrenal'],groups:['adrenal-glands']},
 {id:'arteries',section:'cardiovascular',name:'Artérias',groups:['pulmonary-arteries'],partial:true,note:'Disponíveis: tronco pulmonar e artérias pulmonares. Ainda não inclui todas as artérias do corpo.'},
 {id:'positions',section:'general',name:'Posições',aliases:['Posição anatômica','Vista anterior','Vista posterior','Vista lateral'],groups:['skeleton','appendicular-skeleton'],partial:true,note:'Use Frente, Costas e Lateral para orientar a vista. O esqueleto disponível ainda não inclui o crânio.'},
];
export const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function hasModel(card){return !!(card.groups?.length||card.sources?.length);}
export function nodeNamesFor(card,manifest){return new Set((card.groups||[]).flatMap(g=>manifest.groups[g]?.nodes||[]).map(n=>n.split('__')[0]));}
export function matchesCard(mesh,card,names){return names.has(mesh.userData.anatomyId)||(card.sources||[]).includes(mesh.userData.sourceName);}
export function materialColor(mesh){
 const s=mesh.userData.sourceName||'',system=mesh.userData.anatomySystem;
 if(system==='skeletal')return 0xd9ceb2;
 if(system==='muscular')return /tendon|ligament|Linea alba/i.test(s)?0xe4d0b3:0xad5546;
 if(/Liver/.test(s))return 0x934631;
 if(/Gallbladder/.test(s))return 0x68865b;
 if(/Kidney/.test(s))return 0xb74e57;
 if(/Thyroid|parathyroid/.test(s))return 0xcd765c;
 if(/Suprarenal|Pancreas/.test(s))return 0xc9a060;
 if(system==='endocrine')return 0xdd998f;
 if(system==='cardiovascular')return 0x668bbc;
 if(system==='reproductive')return 0xbd7774;
 return 0xc8927c;
}
