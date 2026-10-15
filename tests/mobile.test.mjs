import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const window={};vm.runInNewContext(readFileSync('web/mobile.js','utf8'),{window});
const library=JSON.parse(readFileSync('web/library.json','utf8')).items;
const select=mode=>window.MDCMobile.selectRows({library,mode,title:r=>r.caption||r.id,ringFor:()=>null});
assert.equal(select('feed').length,1074);
const reels=select('reels');assert.equal(reels.length,199);assert(reels.every(r=>r.format==='reel'));
const stories=select('stories');assert.equal(stories.length,776);assert(stories.every(r=>r.format==='story'));
let stillSeen=false;for(const r of stories){const video=r.assets.some(m=>m.kind==='video');if(!video)stillSeen=true;assert(!(stillSeen&&video),'Story video priority must keep videos ahead of stills');}
for(const r of select('feed'))assert.equal(r.assets,library.find(x=>x.id===r.id).media,'Preserve all source assets and their order');
console.log('Passed: full mobile catalog coverage, exact format selection, video-first Stories and unchanged carousel asset order.');
