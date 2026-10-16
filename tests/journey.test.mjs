import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const read=path=>JSON.parse(readFileSync(new URL(`../web/${path}`,import.meta.url)));
const manifest=read('journey/chapters/index.json');
const library=new Map(read('library.json').items.map(r=>[r.id,r]));
const sources=read('journey/sources.json').reels;
const chapters=manifest.chapters.map(c=>read(`journey/chapters/${c.id}.json`));
test('the complete 24-chapter manuscript retains its wording and order',()=>{
 assert.equal(chapters.length,24);
 chapters.forEach((c,i)=>{assert.equal(c.number,i+1);assert.equal(c.id,`chapter-${String(i+1).padStart(2,'0')}`);assert.equal(c.title,manifest.chapters[i].title);assert.ok(c.passages.length>=2);});
 const narrative=chapters.map(c=>c.passages.join('\n\n')).join('\n\n');
 assert.equal(createHash('sha256').update(narrative).digest('hex'),'e6d1174b35afb548b72bcee2f366d255f415452ec853051119663e6cce932a75');
});
test('all 199 original captions and every selected asset resolve to the public archive',()=>{
 assert.equal(sources.length,199);assert.equal(new Set(sources.map(r=>r.contentId)).size,199);
 sources.forEach(s=>{assert.equal(s.caption.trim(),library.get(s.contentId).caption.trim());});
 chapters.forEach(c=>{assert.ok(c.scenes.length>0);});
});
test('every chapter offers three distinct optional workbook exercises',()=>{
 const prompts=chapters.flatMap(c=>{assert.deepEqual(c.reflections.map(r=>r.kind),['Notice','Write','Try']);return c.reflections.map(r=>r.prompt);});
 assert.equal(new Set(prompts).size,72);assert.ok(prompts.every(p=>typeof p==='string'&&p.length>20));
});
test('every overlaid scene preserves the passage and carries exact source media references',()=>{
 let count=0;
 for(const chapter of chapters){
  assert.equal(new Set(chapter.scenes.map(s=>s.id)).size,chapter.scenes.length);
  chapter.passages.forEach((passage,i)=>{
   const scenes=chapter.scenes.filter(s=>s.passageIndex===i);
   assert.ok(scenes.length>0);assert.equal(scenes.map(s=>s.text).join(' '),passage);
  });
  for(const scene of chapter.scenes){
   count++;assert.ok(scene.sources.length>0);assert.ok(scene.text.split(/\s+/).length<=36);
   for(const source of scene.sources){
    assert.equal(source.contentId,sources[source.sourceReel-1].contentId);
    const media=library.get(source.contentId).media[source.assetIndex];
    assert.ok(media);assert.match(media.media_url,/^https:\/\/lightroom\.adobe\.com\//);
   }
  }
 }
 assert.equal(count,112);
});
test('mixed-source moments change media at the relevant manuscript sentence',()=>{
 const christmas=chapters[5].scenes;
 assert.equal(christmas.find(s=>s.text==='There was fire.').sources[0].sourceReel,13);
 assert.equal(christmas.find(s=>s.text==='There was cold water.').sources[0].sourceReel,15);
 const joy=chapters[19].scenes;
 assert.equal(joy.find(s=>s.text.includes('lemon-party outfit')).sources[0].sourceReel,123);
 assert.equal(joy.find(s=>s.text.includes('Tamarack')).sources[0].sourceReel,125);
});
