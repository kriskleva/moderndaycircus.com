import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const window={};
vm.runInNewContext(readFileSync('web/journey/seasons.js','utf8'),{window,URLSearchParams});
const home=window.MDCBecoming;
const manifest=JSON.parse(readFileSync('web/journey/chapters/index.json','utf8'));
const library=JSON.parse(readFileSync('web/library.json','utf8')).items;
test('the default homepage highlights becoming without intercepting library destinations',()=>{
 for(const query of ['','?utm_source=instagram','?view=home'])assert.equal(home.isHome(query),true);
 for(const query of ['?view=results','?view=feed','?view=reels','?view=stories','?view=manifesto','?view=bundles','?asset=mdc-example','?q=movement','?type=photo','?theme=body'])assert.equal(home.isHome(query),false);
});
test('the seasonal theme keeps all 24 chapters in their original order without a new starting point',()=>{
 const ids=manifest.calendar.groups.flatMap(g=>g.chapterIds);
 assert.deepEqual(ids,manifest.chapters.map(c=>c.id));assert.equal(new Set(ids).size,24);
 const html=home.markup(manifest,library,{state:{chapters:{}}});
 const timelineIds=[...html.matchAll(/class="season-chapter" href="\/journey\/\?chapter=(chapter-\d+)"/g)].map(m=>m[1]);
 assert.deepEqual(timelineIds,ids);assert.ok(html.includes('href="/journey/?chapter=chapter-01">Enter the journey'));
 assert.equal((html.match(/class="season-marker"/g)||[]).length,7);
 assert.ok(!html.toLowerCase().includes('prologue'));
 const visible=html.split('<details class="becoming-about">')[0];
 for(const chapter of manifest.chapters)assert.ok(!visible.includes(`>${chapter.period}<`),'No date labels on the timeline');
 for(const destination of ['results','ring','reels','stories','collections','favorites','bundles','manifesto','insights'])assert.ok(html.includes(`/?view=${destination}`));
 assert.ok(html.includes('<details id="world">'),'Other sections are expandable');
});
test('the central action resumes the existing saved scene',()=>{
 const html=home.markup(manifest,library,{state:{last:'chapter-14',chapters:{'chapter-14':{sceneId:'p2-s1',complete:true}}}});
 assert.ok(html.includes('/journey/?chapter=chapter-14&scene=p2-s1">Return to your place'));
 assert.ok(html.includes('1 of 24 chapters read'));
});
