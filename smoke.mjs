import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {headLabel} from './src/head-names.js';
import {toothInfo,permanentTeeth} from './src/teeth.js';
const manifest=JSON.parse(await readFile('public/head/manifest.json','utf8'));
for(const records of Object.values(manifest))for(const data of records){const label=headLabel(data);assert(label&&label!==undefined);if(!data.organLabel)assert(label!==data.sourceName.replace(/\.[lr]$/,'')||['Retina'].includes(label),`Untranslated: ${data.sourceName}`);}
assert.equal(permanentTeeth.length,32);assert.equal(new Set(permanentTeeth.map(t=>t.number)).size,32);
for(const[source,number]of [['Upper medial incisor.r',11],['Upper medial incisor.l',21],['Lower medial incisor.l',31],['Lower medial incisor.r',41],['Upper third molar tooth.r',18],['Upper third molar tooth.l',28],['Lower third molar tooth.l',38],['Lower third molar tooth.r',48],['Lower first molar tooth.l',36],['Upper first premolar.r',14]])assert.equal(toothInfo(source).number,number);
assert.equal(toothInfo('Mandible'),null);const modeled=manifest.bones.map(d=>toothInfo(d.sourceName)).filter(Boolean);assert.equal(modeled.length,28);assert.deepEqual(permanentTeeth.filter(t=>!modeled.some(m=>m.number===t.number)).map(t=>t.number),[18,28,38,48]);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://localhost:5173');await page.waitForSelector('body[data-ready="face"]',{timeout:60000});await page.screenshot({path:'/tmp/head-adult-face.png'});await page.locator('[data-model="bones"]').click();await page.waitForSelector('body[data-ready="bones"]',{timeout:60000});
 assert.equal(await page.locator('[data-model]').count(),4);assert.equal(await page.locator('#structure-list button').count(),56);
 await page.screenshot({path:'/tmp/head-bones.png'});
 const canvas=page.locator('canvas'),bounds=await canvas.boundingBox();
 let picked=false;for(const[x,y]of [[.5,.3],[.5,.4],[.6,.45],[.4,.45]]){await page.mouse.click(bounds.x+bounds.width*x,bounds.y+bounds.height*y);if((await page.locator('#selected-name').textContent())!=='Toque no modelo'){picked=true;break;}}assert(picked,'Picking skull should select a bone');
 await page.locator('#back').click();assert.equal(await page.locator('#orientation').textContent(),'Vista de trás');await page.screenshot({path:'/tmp/head-back.png'});
 await page.locator('#right').click();assert.equal(await page.locator('#orientation').textContent(),'Lado direito');await page.locator('#left').click();assert.equal(await page.locator('#orientation').textContent(),'Lado esquerdo');await page.locator('#front').click();
 await page.mouse.move(bounds.x+bounds.width*.55,bounds.y+bounds.height*.4);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.7,bounds.y+bounds.height*.45,{steps:8});await page.mouse.up();assert.equal(await page.locator('#orientation').textContent(),'Vista livre');
 await page.locator('#search').fill('mandibula');assert.equal(await page.locator('#structure-list button').count(),1);await page.locator('#structure-list button').click();assert.equal(await page.locator('#selected-name').textContent(),'Mandíbula');await page.locator('#hide').click();assert.equal(await page.locator('#hide').textContent(),'Mostrar');await page.locator('#undo').click();assert.equal(await page.locator('#hide').textContent(),'Ocultar');await page.locator('#isolate').click();await page.locator('#restore').click();assert.equal(await page.locator('#structure-list button').count(),56);
 for(const id of ['muscles','organs']){await page.locator(`[data-model="${id}"]`).click();await page.waitForSelector(`body[data-ready="${id}"]`,{timeout:60000});assert((await page.locator('#structure-list button').count())>10);await page.screenshot({path:`/tmp/head-${id}.png`});console.log('PASS: head model',id);}
 await page.locator('[data-model="bones"]').click();await page.waitForSelector('body[data-ready="bones"]');
 await page.locator('#search').fill('11');assert.equal(await page.locator('#structure-list button').count(),1);await page.locator('#structure-list button').click();assert.match(await page.locator('#selected-name').textContent(),/11.*Incisivo central superior direito/);
 await page.locator('#teeth-only').check();await page.locator('#search').fill('');assert.equal(await page.locator('#structure-list .hidden-structure').count(),28);await page.locator('#open-dental-chart').click();assert.equal(await page.locator('[data-tooth]').count(),32);await page.locator('[data-tooth="36"]').click();assert.match(await page.locator('#selected-name').textContent(),/36.*Primeiro molar inferior esquerdo/);await page.locator('#selected-tooth-marker').waitFor({state:'visible'});await page.screenshot({path:'/tmp/head-teeth-fdi.png'});
 await page.locator('[data-tooth="18"]').click();assert.match(await page.locator('#selected-name').textContent(),/18.*siso/);assert.equal(await page.locator('#isolate').isDisabled(),true);assert.match(await page.locator('#dental-feedback').textContent(),/sem geometria/);await page.locator('#restore').click();
 
 for(const [width,height]of [[800,1280],[390,844],[320,740]]){await page.setViewportSize({width,height});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow ${width}`);if(width===390)await page.screenshot({path:'/tmp/head-phone.png'});}
 await page.locator('[data-model="muscles"]').tap();await page.waitForSelector('body[data-ready="muscles"]');await page.locator('#back').tap();assert.equal(await page.locator('#orientation').textContent(),'Vista de trás');
 assert.deepEqual(errors,[]);console.log('PASS: nomes, 4 modelos da cabeça e dentes FDI, seleção no 3D, frente/trás/lados, rotação por arraste, ocultar/desfazer/isolar e telas de 320 a 1440px.');
}finally{await browser.close();}
