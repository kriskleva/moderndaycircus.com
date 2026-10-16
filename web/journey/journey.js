'use strict';
(() => {
 const main=document.querySelector('#journey'),key='mdc-becoming-v1';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let state={chapters:{}},manifest,library,panels,active=0,generation=0,cleanup=()=>{};
 try { const value=JSON.parse(localStorage.getItem(key));if(value&&value.chapters&&typeof value.chapters==='object'&&!Array.isArray(value.chapters))state=value; } catch {}
 function save(){
  try { localStorage.setItem(key,JSON.stringify(state));document.querySelector('#storage-status').textContent='Your place and reflections stay in this browser.';return true; }
  catch { document.querySelector('#storage-status').textContent='Storage unavailable. Your place and reflections will be lost when you leave.';return false; }
 }
 async function get(url){const response=await fetch(url);if(!response.ok)throw Error('This part of the journey could not be opened.');return response.json();}
 const url=(id,panel=0)=>`/journey/?chapter=${encodeURIComponent(id)}&panel=${panel}`;
 const go=id=>{history.pushState({},'',url(id));render();window.scrollTo(0,0);};
 function cover(id){const m=library.find(r=>r.id===id)?.media[0];return m?.preview_url||m?.thumbnail_url||m?.media_url;}
 function landing(){
  const chapters=manifest.chapters,resume=chapters.find(c=>c.id===state.last),count=chapters.filter(c=>state.chapters[c.id]?.complete).length;
  main.innerHTML=`<section class="landing"><div class="landing-intro"><p class="eyebrow">A personal story · An invitation to reflect</p><h1>A year of<br><em>becoming.</em></h1><p class="intro">${esc(manifest.description)}</p><div class="actions"><a class="primary" href="${url(resume?.id||chapters[0].id,resume?state.chapters[resume.id]?.panel||0:0)}">${resume?'Return to your place':'Begin the journey'} ↗</a><a class="secondary" href="#chapters">The 24 chapters ↓</a></div><p class="quiet">Read a little. Reflect if you like. Come back to yourself.</p></div><figure class="landing-image"><img src="${esc(cover('mdc-b5ab377bf069b762d97e'))}" alt="Studio portrait in a red ensemble"><figcaption>Body. Identity. Maker.</figcaption></figure></section><section class="timeline" id="chapters"><div class="timeline-heading"><p class="eyebrow">November 2025 — October 2026</p><p class="quiet">${count} of 24 chapters read</p></div><ol class="chapter-list">${chapters.map((c,i)=>`<li><a href="${url(c.id)}"><small>${String(i+1).padStart(2,'0')}</small><span><strong>${esc(c.title)}</strong><small>${esc(c.period)}</small></span><small>${state.chapters[c.id]?.complete?'Read ✓':'↗'}</small></a></li>`).join('')}</ol><details class="source-note"><summary>About the story & original sources</summary><p>${esc(manifest.sourceNote)}</p><p>Reflection exercises are new editorial invitations. They are optional and are separate from the original narrative and captions.</p><a href="/journey/sources.json" download="a-year-of-becoming-original-captions.json">Download all 199 original reel captions ↓</a></details></section>`;
 }
 function mediaPanel(item){
  const record=library.find(r=>r.id===item.contentId),m=record?.media[item.assetIndex||0];if(!m)return '';
  const source=m.media_url,preview=m.preview_url||m.thumbnail_url||source;
  return `<section class="panel media-panel"><p class="eyebrow">From the archive · ${esc(record.format)}${item.sourceReel?` ${String(item.sourceReel).padStart(3,'0')}`:''}</p>${m.kind==='video'?`<video controls playsinline preload="none" poster="${esc(preview)}" src="${esc(source)}" aria-label="Companion ${esc(record.format)}"></video>`:`<img loading="lazy" src="${esc(preview)}" alt="${esc(item.alt||'Companion image from the chapter’s source archive')}">`}${item.note?`<p class="quiet">${esc(item.note)}</p>`:''}<details><summary>Read the original caption</summary><p>${esc(record.caption)}</p><a href="/?asset=${encodeURIComponent(record.id)}">Open in the library ↗</a></details></section>`;
 }
 function reflectionPanel(chapter,saved){
  return `<section class="panel reflection-panel"><p class="eyebrow">Your turn · Always optional</p><h2>Pause here.</h2><p class="quiet">A question. A little space. One small step.</p><div class="prompt-tabs" role="group" aria-label="Reflection prompts">${chapter.reflections.map((p,n)=>`<button data-prompt="${n}" class="secondary" aria-pressed="${n===0}">${esc(p.kind)}</button>`).join('')}</div>${chapter.reflections.map((p,n)=>`<div data-exercise="${n}" ${n?'hidden':''}><label for="reflection-${n}" class="prompt-text">${esc(p.prompt)}</label><textarea id="reflection-${n}" data-answer="${n}" maxlength="20000" placeholder="Just for you…">${esc(saved.answers?.[n]||(n===0?saved.reflection||'':''))}</textarea></div>`).join('')}<p id="reflection-status" class="quiet" role="status">Your words stay in this browser.</p><button class="secondary" id="complete" aria-pressed="${!!saved.complete}">${saved.complete?'Chapter read ✓':'Mark chapter as read'}</button></section>`;
 }
 async function render(){
  const version=++generation;cleanup();panels=null;
  const id=new URLSearchParams(location.search).get('chapter'),entry=manifest.chapters.find(c=>c.id===id);
  if(!id){landing();return;}
  if(!entry){main.innerHTML='<p class="notice">This chapter is unavailable.</p><a href="/journey/">Return to the journey</a>';return;}
  main.innerHTML='<p class="notice">Opening this chapter…</p>';
  try {
   const chapter=await get(`/journey/chapters/${encodeURIComponent(entry.id)}.json`);if(version!==generation)return;
   const i=manifest.chapters.indexOf(entry),saved=state.chapters[id]||{};
   main.innerHTML=`<div class="reader-top"><a href="/journey/">← The journey</a><select aria-label="Choose a chapter">${manifest.chapters.map((c,n)=>`<option value="${esc(c.id)}" ${c.id===id?'selected':''}>${String(n+1).padStart(2,'0')} · ${esc(c.title)}</option>`).join('')}</select></div><div class="chapter-meta"><span>Chapter ${String(i+1).padStart(2,'0')} / 24</span><span>${esc(chapter.period)}</span></div><div id="panels" tabindex="0" aria-label="Chapter reading panels. Swipe or use previous and next.">${chapter.passages.map((p,n)=>`<section class="panel story-panel">${n===0?`<h2>${esc(chapter.title)}</h2>`:'<p class="eyebrow">A year of becoming</p>'}<p>${esc(p)}</p></section>`).join('')}${(chapter.media||[]).map(mediaPanel).join('')}${reflectionPanel(chapter,saved)}</div><div class="reader-controls"><button id="previous" aria-label="Previous reading panel">← Back</button><span id="position" role="status"></span><button id="next" aria-label="Next reading panel">Next →</button></div><nav class="end-nav" aria-label="Chapter navigation">${i?`<a href="${url(manifest.chapters[i-1].id)}">← Previous chapter</a>`:'<a href="/journey/">All chapters</a>'}<button id="pause-link">Pause & reflect</button>${i<manifest.chapters.length-1?`<a href="${url(manifest.chapters[i+1].id)}">Next chapter →</a>`:'<a href="/journey/">Return to the journey →</a>'}</nav>`;
   state.chapters[id]={...saved};state.last=id;
   panels=document.querySelector('#panels');const rail=panels;
   const requested=Number(new URLSearchParams(location.search).get('panel')||0);
   active=Number.isFinite(requested)?Math.max(0,Math.min(rail.children.length-1,Math.floor(requested))):0;
   let timer;
   const update=()=>{
    if(version!==generation||rail.clientWidth<=0)return;
    active=Math.max(0,Math.min(rail.children.length-1,Math.round(rail.scrollLeft/rail.clientWidth)));
    state.chapters[id].panel=active;save();history.replaceState({},'',url(id,active));
    document.querySelector('#position').textContent=`${active+1} / ${rail.children.length}`;
    document.querySelector('#previous').disabled=active===0;document.querySelector('#next').disabled=active===rail.children.length-1;
    [...rail.children].forEach((panel,n)=>{panel.inert=n!==active;panel.setAttribute('aria-hidden',String(n!==active));if(n!==active)panel.querySelectorAll('video').forEach(v=>v.pause());});
   };
   const moveTo=n=>{const target=Math.max(0,Math.min(rail.children.length-1,n));rail.scrollTo({left:target*rail.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});};
   rail.scrollLeft=active*rail.clientWidth;update();
   rail.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(update,120);},{passive:true});
   document.querySelector('#previous').onclick=()=>moveTo(active-1);document.querySelector('#next').onclick=()=>moveTo(active+1);
   document.querySelector('#pause-link').onclick=()=>moveTo(rail.children.length-1);
   rail.onkeydown=e=>{if(e.target!==rail)return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();moveTo(active+(e.key==='ArrowRight'?1:-1));}};
   document.querySelector('select').onchange=e=>go(e.target.value);
   document.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-prompt]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));document.querySelectorAll('[data-exercise]').forEach(p=>p.hidden=p.dataset.exercise!==b.dataset.prompt);});
   document.querySelectorAll('[data-answer]').forEach(t=>t.oninput=()=>{state.chapters[id].answers??={};state.chapters[id].answers[t.dataset.answer]=t.value;document.querySelector('#reflection-status').textContent=save()?'Saved in this browser.':'Unable to save. Keep a copy before leaving.';});
   document.querySelector('#complete').onclick=e=>{state.chapters[id].complete=!state.chapters[id].complete;save();e.target.setAttribute('aria-pressed',String(state.chapters[id].complete));e.target.textContent=state.chapters[id].complete?'Chapter read ✓':'Mark chapter as read';};
   cleanup=()=>{clearTimeout(timer);rail.querySelectorAll('video').forEach(v=>v.pause());};
  } catch(e){if(version===generation)main.innerHTML=`<p class="notice">${esc(e.message)}</p><a href="/journey/">Return to the journey</a>`;}
 }
 window.addEventListener('popstate',()=>manifest&&render());
 window.addEventListener('resize',()=>{if(panels?.isConnected&&panels.clientWidth>0)panels.scrollLeft=active*panels.clientWidth;});
 Promise.all([get('/journey/chapters/index.json'),get('/library.json')]).then(([m,l])=>{manifest=m;library=Array.isArray(l)?l:l.items;return render();}).catch(()=>{main.innerHTML='<p class="notice">The journey could not be opened. Please try again.</p>';});
})();
