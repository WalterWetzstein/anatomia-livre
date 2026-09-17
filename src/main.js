import './style.css';
import { catalog, sections, normalize, hasModel } from './catalog.js';
const $=id=>document.getElementById(id);
let filter='all',viewerPromise,routeVersion=0,catalogScroll=0;
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;};
function status(card){return !hasModel(card)?'Sem modelo 3D':card.partial?'Coleção parcial':'Explorar em 3D';}
function renderCatalog(){
 const term=normalize($('catalog-search').value);
 const items=catalog.filter(c=>(filter==='all'||c.section===filter)&&normalize([c.name,...c.aliases||[],sections.find(s=>s.id===c.section).name].join(' ')).includes(term));
 $('catalog-count').textContent=`${items.length} tópicos · ${items.filter(hasModel).length} com visualização 3D`;
 $('no-results').hidden=!!items.length;
 $('catalog-content').replaceChildren();
 for(const section of sections){
  const cards=items.filter(c=>c.section===section.id);if(!cards.length)continue;
  const group=el('details','catalog-section');group.open=true;
  const summary=el('summary');const heading=el('div');heading.append(el('h2','',section.name),el('p','',section.description));summary.append(heading,el('span','section-count',`${cards.length} tópicos`));group.append(summary);
  const grid=el('div','card-grid');
  for(const card of cards){
   const b=el('button',`anatomy-card ${!hasModel(card)?'unavailable':''}`);b.dataset.card=card.id;b.setAttribute('aria-label',`${card.name} — ${status(card)}`);
   const visual=el('div','card-visual');
   if(hasModel(card)){const img=el('img');img.src=`${import.meta.env.BASE_URL}thumbnails/${card.id}.webp`;img.alt='';img.loading='lazy';img.width=480;img.height=340;visual.append(img);}else{visual.append(el('span','placeholder-symbol','◌'),el('span','placeholder-label','MODELO A INCLUIR'));}
   visual.append(el('span',`card-status ${!hasModel(card)?'pending':card.partial?'partial':''}`,status(card)));
   const copy=el('div','card-copy');copy.append(el('h3','',card.name));if(card.aliases?.length)copy.append(el('p','',card.aliases.join(' · ')));copy.append(el('span','card-arrow',hasModel(card)?'↗':'+'));b.append(visual,copy);
   b.onclick=()=>{if(hasModel(card)){catalogScroll=window.scrollY;location.hash=`modelo/${card.id}`;}else{$('unavailable-name').textContent=card.name;$('unavailable-aliases').textContent=(card.aliases||[]).join(' · ');$('unavailable-dialog').showModal();}};
   grid.append(b);
  }
  group.append(grid);$('catalog-content').append(group);
 }
 for(const b of $('tabs').children){const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));}
}
for(const s of [{id:'all',short:'Todos'},...sections]){const b=el('button','',s.short);b.dataset.filter=s.id;b.onclick=()=>{filter=s.id;renderCatalog();};$('tabs').append(b);}
$('catalog-search').oninput=renderCatalog;
const openNames=()=>{$('names-dialog').showModal();};
$('nav-names').onclick=openNames;$('all-names').onclick=openNames;
for(const section of sections){const container=el('section');container.append(el('h3','',section.name));const list=el('ul');for(const c of catalog.filter(c=>c.section===section.id)){const li=el('li');li.append(el('strong','',c.name));if(c.aliases?.length)li.append(el('span','',` — ${c.aliases.join('; ')}`));li.append(el('small','',status(c)));list.append(li);}container.append(list);$('names-content').append(container);}
$('download-names').onclick=()=>{const text=sections.map(s=>s.name.toUpperCase()+'\n'+catalog.filter(c=>c.section===s.id).map(c=>'• '+[c.name,...c.aliases||[]].join('; ')+' ['+status(c)+']').join('\n')).join('\n\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=el('a');a.href=url;a.download='anatomia-livre-nomes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
for(const button of document.querySelectorAll('.close-dialog'))button.onclick=()=>button.closest('dialog').close();
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('nav-catalog').onclick=$('back-catalog').onclick=()=>{location.hash='';};
async function route(){
 const version=++routeVersion;const id=decodeURIComponent(location.hash.replace(/^#modelo\//,''));const card=catalog.find(c=>c.id===id&&hasModel(c));
 $('catalog-page').hidden=!!card;$('viewer-page').hidden=!card;document.body.classList.toggle('studying',!!card);
 if(!card){if(viewerPromise){const viewer=await viewerPromise;if(version!==routeVersion)return;viewer.pause();}window.scrollTo(0,catalogScroll);return;}
 window.scrollTo(0,0);$('viewer-title').textContent=card.name;$('viewer-system').textContent=sections.find(s=>s.id===card.section).name;$('viewer-badge').textContent=status(card);$('viewer-note').textContent=card.note||'Toque em uma estrutura para ver o nome. Use os controles para explorar o modelo.';
 try{viewerPromise??=import('./viewer.js');const viewer=await viewerPromise;if(version!==routeVersion)return;await viewer.open(card,()=>version===routeVersion);}catch(error){console.error(error);$('loading').hidden=false;$('loading').textContent='Não foi possível iniciar o visualizador. Atualize a página para tentar novamente.';}
}
window.addEventListener('hashchange',route);
window.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();if(!$('catalog-page').hidden)$('catalog-search').focus();}});
renderCatalog();route();document.body.dataset.catalogReady='true';
