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
 chapters.forEach(c=>{assert.ok(c.media.length>0);c.media.forEach(m=>{const r=library.get(m.contentId);assert.ok(r?.media[m.assetIndex]);if(m.sourceReel)assert.equal(m.contentId,sources[m.sourceReel-1].contentId);});});
});
test('every chapter offers three distinct optional workbook exercises',()=>{
 const prompts=chapters.flatMap(c=>{assert.deepEqual(c.reflections.map(r=>r.kind),['Notice','Write','Try']);return c.reflections.map(r=>r.prompt);});
 assert.equal(new Set(prompts).size,72);assert.ok(prompts.every(p=>typeof p==='string'&&p.length>20));
});
