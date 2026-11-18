import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
try{
 await page.goto(process.env.ANATOMIA_URL||'http://localhost:5173/anatomia-livre/');
 await page.waitForSelector('body[data-scope="body"][data-ready="bones"]',{timeout:90000});
 assert.equal(await page.locator('[data-model=face]').isVisible(),false);
 assert((await page.locator('#structure-list button').count())>200);
 await page.screenshot({path:'/tmp/anatomia-body-bones.png'});
 await page.locator('#search').fill('femur');assert.equal(await page.locator('#structure-list button').count(),2);
 await page.locator('#structure-list button').first().click();await page.locator('#focus').click();await page.locator('#hide').click();assert.equal(await page.locator('#hide').textContent(),'Mostrar');await page.locator('#undo').click();assert.equal(await page.locator('#hide').textContent(),'Ocultar');
 await page.locator('#region').selectOption('lower');await page.locator('#search').fill('femur');assert.equal(await page.locator('#structure-list button').count(),2);
 await page.locator('#search').fill('');assert.equal(await page.locator('#structure-list button').filter({hasText:'Falange distal do 1º dedo da mão'}).count(),0);
 await page.locator('#region').selectOption('upper');await page.locator('#search').fill('umero');assert.equal(await page.locator('#structure-list button').count(),2);
 await page.locator('#search').fill('');assert.equal(await page.locator('#structure-list button').filter({hasText:'Falange distal do 1º dedo da mão'}).count(),2);
 await page.locator('[data-model=muscles]').click();await page.waitForSelector('body[data-ready="muscles"]',{timeout:90000});
 assert((await page.locator('#structure-list button').count())>500);
 for(const query of ['biceps','peitoral','tibial','soleo']){await page.locator('#search').fill(query);assert((await page.locator('#structure-list button').count())>=2,query);}
 await page.locator('#search').fill('');await page.screenshot({path:'/tmp/anatomia-body-muscles.png'});
 await page.locator('[data-model=organs]').click();await page.waitForSelector('body[data-ready="organs"]',{timeout:90000});
 for(const query of ['coracao','figado','bexiga','cerebro']){await page.locator('#search').fill(query);assert((await page.locator('#structure-list button').count())>0,query);await page.locator('#structure-list button').first().click();await page.locator('#focus').click();}
 await page.locator('#search').fill('');await page.locator('#restore').click();await page.screenshot({path:'/tmp/anatomia-body-organs.png'});
 await page.locator('#region').selectOption('lower');assert.equal(await page.locator('#structure-list button').count(),0);assert.match(await page.locator('#coverage').textContent(),/Nenhuma estrutura/);
 await page.locator('[data-model=bones]').click();await page.waitForSelector('body[data-ready="bones"]');
 for(const [width,height]of [[800,1280],[390,844],[320,740]]){await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${width}`);}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/anatomia-body-phone.png',fullPage:true});
 await page.locator('[data-scope=head]').click();await page.waitForSelector('body[data-scope="head"][data-ready="face"]',{timeout:90000});
 await page.locator('[data-scope=body]').click();await page.waitForSelector('body[data-scope="body"][data-ready="bones"]',{timeout:90000});
 assert.deepEqual(errors,[]);console.log('PASS: corpo inteiro, ossos dos membros, músculos, órgãos e coração, regiões, seleção, foco, ocultar/desfazer, troca de área e telas de 320 a 1440px.');
}finally{await browser.close();}
