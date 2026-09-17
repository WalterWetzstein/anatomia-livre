import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog, hasModel, nodeNamesFor, matchesCard } from '../src/catalog.js';
import { organName } from '../src/organ-names.js';
import { translated } from '../src/names.js';
const manifest=JSON.parse(await readFile('public/models/z-anatomy-1.4.0-manifest.json','utf8'));
const bytes=await readFile('public/models/z-anatomy-1.4.0-full-body.glb');
const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
for(const c of catalog.filter(hasModel)){
 const names=nodeNamesFor(c,manifest);const nodes=gltf.nodes.filter(n=>matchesCard({name:n.name,userData:n.extras||{}},c,names));assert(nodes.length>0,c.id+' lacks geometry');
 for(const n of nodes){const source=n.extras.sourceName;const label=organName(source)||translated(source);assert(organName(source)!==null||label!==source.replace(/\.[lr]$/,'' ),`Untranslated: ${source}`);}
}
console.log('PASS: todos os 22 cartões 3D têm geometria e rótulos em português.');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000},hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5173/catalog.html');await page.waitForSelector('body[data-catalog-ready="true"]');
 assert.equal(await page.locator('.anatomy-card').count(),33);
 assert.equal(await page.locator('.anatomy-card.unavailable').count(),11);
 await page.locator('#catalog-search').fill('epifise');assert.equal(await page.locator('.anatomy-card').count(),1);assert.equal(await page.locator('.anatomy-card').getAttribute('data-card'),'pineal');
 await page.locator('#catalog-search').fill('');await page.locator('[data-filter="urinary"]').click();assert.equal(await page.locator('.anatomy-card').count(),3);
 await page.locator('[data-filter="all"]').click();await page.locator('#all-names').click();
 assert.equal(await page.locator('#names-content li').count(),33);assert.match(await page.locator('#names-content').textContent(),/Glândula pituitária/);
 const downloaded=page.waitForEvent('download');await page.locator('#download-names').click();const download=await downloaded;const text=await readFile(await download.path(),'utf8');assert.match(text,/Sistema genital feminino/);assert.match(text,/Movimentos articulares/);
 await page.getByRole('button',{name:'Fechar lista de nomes',exact:true}).click();
 await page.locator('[data-card="genital-female"]').click();assert.equal(await page.locator('#unavailable-dialog').isVisible(),true);await page.getByRole('button',{name:'Voltar ao catálogo',exact:true}).click();
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/anatomia-v2-desktop.png'});
 for(const [width,height]of [[800,1280],[390,844],[320,740]]){await page.setViewportSize({width,height});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow at ${width}`);if(width===390)await page.screenshot({path:'/tmp/anatomia-v2-phone.png'});}
 await page.setViewportSize({width:1280,height:900});
 for(const card of catalog.filter(hasModel)){
  await page.evaluate(id=>location.hash=`modelo/${id}`,card.id);
  await page.waitForSelector(`body[data-ready="${card.id}"]`,{timeout:60000});
  assert((await page.locator('#list button').count())>0,card.id);
  if(card.id==='thyroid'){
   await page.locator('#list button').first().click();assert.equal(await page.locator('#selected-name').textContent(),'Glândula tireoide');
   await page.locator('#hide').click();assert.equal(await page.locator('#hide').textContent(),'Mostrar');await page.locator('#undo').click();assert.equal(await page.locator('#hide').textContent(),'Ocultar');
   await page.locator('#back').click();assert.equal(await page.locator('#view-label').textContent(),'Vista posterior');await page.locator('#lateral').click();assert.equal(await page.locator('#view-label').textContent(),'Vista lateral');
   await page.locator('#reset').click();const canvas=page.locator('#canvas canvas');const bounds=await canvas.boundingBox();for(const [x,y] of [[.5,.5],[.4,.5],[.6,.5],[.4,.4],[.6,.4]]){await page.mouse.click(bounds.x+bounds.width*x,bounds.y+bounds.height*y);if((await page.locator('#selected-name').textContent())==='Glândula tireoide')break;}assert.equal(await page.locator('#selected-name').textContent(),'Glândula tireoide');
   await page.screenshot({path:'/tmp/anatomia-v2-viewer.png'});
  }
  if(card.id==='muscles-lower'){
   await page.locator('#search').fill('gluteo maximo');assert.equal(await page.locator('#list button').count(),2);await page.locator('#list button').first().click();await page.locator('#isolate').click();assert.equal(await page.locator('#list .hidden-structure').count(),1);await page.locator('#undo').click();assert.equal(await page.locator('#list .hidden-structure').count(),0);
   await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'/tmp/anatomia-v2-phone-viewer.png'});await page.setViewportSize({width:1280,height:900});
  }
  console.log('PASS: viewer',card.id);
 }
 await page.locator('#back-catalog').click();await page.locator('#catalog-page').waitFor({state:'visible'});assert.equal(await page.locator('#catalog-page').isVisible(),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: catálogo, sinônimos, filtros, lista/download, disponibilidade, 22 modelos, seleção por toque, ocultar/desfazer, isolar e layouts de 320 a 1440px.');
}finally{await browser.close();}
