import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
async function ready(model,sex){await page.waitForSelector(`body[data-ready="${model}"][data-sex="${sex}"]`,{timeout:120000});}
try{
 await page.goto(process.env.ANATOMIA_URL||'http://localhost:5173/anatomia-livre/');await ready('surface','male');
 assert.match(await page.locator('#model-title').textContent(),/masculino/);assert((await page.locator('#structure-list button').count())>=6);await page.screenshot({path:'/tmp/anatomia-surface-male.png'});
 await page.locator('#back').click();assert.equal(await page.locator('#orientation').textContent(),'Vista de trás');await page.screenshot({path:'/tmp/anatomia-surface-male-back.png'});
 await page.locator('#region').selectOption('lower');assert.equal(await page.locator('#structure-list button').count(),2);await page.locator('#structure-list button').first().click();await page.locator('#isolate').click();await page.locator('#undo').click();await page.locator('#region').selectOption('all');
 await page.locator('[data-sex=female]').click();await ready('surface','female');assert.match(await page.locator('#model-title').textContent(),/feminino/);await page.screenshot({path:'/tmp/anatomia-surface-female.png'});
 await page.locator('#back').click();await page.screenshot({path:'/tmp/anatomia-surface-female-back.png'});await page.locator('#front').click();
 await page.locator('[data-model=organs]').click();await ready('organs','female');
 for(const query of ['utero','ovario','tubas','vagina','mamaria']){await page.locator('#search').fill(query);assert((await page.locator('#structure-list button').count())>0,query);await page.locator('#structure-list button').first().click();await page.locator('#focus').click();}
 await page.locator('#search').fill('prostata');assert.equal(await page.locator('#structure-list button').count(),0);await page.locator('#search').fill('');await page.locator('#restore').click();await page.screenshot({path:'/tmp/anatomia-female-organs.png'});
 for(const id of ['bones','muscles']){await page.locator(`[data-model=${id}]`).click();await ready(id,'female');assert((await page.locator('#structure-list button').count())>20);await page.screenshot({path:`/tmp/anatomia-female-${id}.png`});}
 await page.locator('[data-model=organs]').click();await ready('organs','female');await page.locator('[data-sex=male]').click();await ready('organs','male');await page.locator('#search').fill('utero');assert.equal(await page.locator('#structure-list button').count(),0);
 await page.locator('[data-model=surface]').click();await ready('surface','male');
 for(const [width,height]of [[800,1280],[390,844],[320,740]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${width}`);}
 await page.locator('[data-sex=female]').click();await ready('surface','female');await page.screenshot({path:'/tmp/anatomia-surface-phone.png',fullPage:true});const coverage=await page.locator('#coverage').boundingBox(),aside=await page.locator('aside').boundingBox();assert(coverage.y+coverage.height<=aside.y+aside.height,'Coverage must remain inside panel');
 await page.locator('[data-scope=head]').click();await page.waitForSelector('body[data-ready=face]',{timeout:90000});assert.equal(await page.locator('#sex-selector').isVisible(),false);assert.equal(await page.locator('[data-model=surface]').isVisible(),false);
 await page.locator('[data-scope=body]').click();await ready('surface','female');assert.deepEqual(errors,[]);console.log('PASS: superfície masculina e feminina, costas e regiões, órgãos femininos, ossos e músculos femininos, alternância de sexo, cabeça e telas de 320 a 1440px.');
}finally{await browser.close();}
