'use strict';
(() => {
 const main=document.querySelector('#journey'),key='mdc-becoming-v1';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let state={chapters:{}},manifest,library,panels,active=0,generation=0,cleanup=()=>{};
 let sound=false,textVisible=true,sourceIndices={};
 try{const value=JSON.parse(localStorage.getItem(key));if(value?.chapters&&typeof value.chapters==='object'&&!Array.isArray(value.chapters))state=value;}catch{}
 function save(){try{localStorage.setItem(key,JSON.stringify(state));document.querySelector('#storage-status').textContent='Your place and reflections stay in this browser.';return true;}catch{document.querySelector('#storage-status').textContent='Storage unavailable. Keep a copy of your reflections before leaving.';return false;}}
 async function get(url){const response=await fetch(url);if(!response.ok)throw Error('This part of the journey could not be opened.');return response.json();}
 const url=(id,scene='')=>`/journey/?chapter=${encodeURIComponent(id)}${scene?`&scene=${encodeURIComponent(scene)}`:''}`;
 const record=id=>library.find(r=>r.id===id);
 const preview=m=>m?.preview_url||m?.thumbnail_url||m?.media_url;
 const cover=id=>preview(record(id)?.media[0]);
 function go(id,scene=''){history.pushState({},'',url(id,scene));render();window.scrollTo(0,0);}
 function landing(){
  document.body.classList.remove('reading');document.body.classList.add('seasonal-page');
  main.innerHTML=window.MDCBecoming.markup(manifest,library,{state});window.MDCBecoming.bind(main);
 }
 function sourceMedia(source,sourceIndex){
  const r=record(source.contentId),m=r.media[source.assetIndex];
  return `<div class="scene-media" data-source-index="${sourceIndex}" ${sourceIndex?'hidden':''}><div class="media-backdrop" aria-hidden="true"><img src="${esc(preview(m))}" alt="" loading="lazy"></div>${m.kind==='video'?`<video class="original-media" playsinline muted loop preload="none" poster="${esc(preview(m))}" src="${esc(m.media_url)}" aria-label="Archive ${esc(r.format)} background"></video>`:`<img class="original-media" src="${esc(preview(m))}" alt="${esc(source.alt||'Archive photograph from this period of the journey')}" loading="lazy">`}<p class="media-error" hidden>Media couldn’t load. <a href="/?asset=${encodeURIComponent(r.id)}">Open the original ↗</a></p></div>`;
 }
 function scenePanel(scene,index){
  return `<section class="scene" data-scene="${esc(scene.id)}" aria-label="Passage ${scene.passageIndex+1}, moment ${index+1}">${sourceMedia(scene.background,0)}<div class="scene-shade" aria-hidden="true"></div><div class="scene-copy"><button class="source-link" data-open-source="${index}">${scene.sources.length>1?`Sources · ${scene.sources.length}`:'Source'} ↗</button><p>${esc(scene.text)}</p></div></section>`;
 }
 function reflectionMarkup(chapter,saved){
  return `<p class="eyebrow">Your turn · Always optional</p><h2>Pause here.</h2><div class="prompt-tabs" role="group" aria-label="Reflection prompts">${chapter.reflections.map((p,n)=>`<button data-prompt="${n}" aria-pressed="${n===0}">${esc(p.kind)}</button>`).join('')}</div>${chapter.reflections.map((p,n)=>`<div data-exercise="${n}" ${n?'hidden':''}><label for="reflection-${n}" class="prompt-text">${esc(p.prompt)}</label><textarea id="reflection-${n}" data-answer="${n}" maxlength="20000" placeholder="Just for you…">${esc(saved.answers?.[n]||(n===0?saved.reflection||'':''))}</textarea></div>`).join('')}<p id="reflection-status" class="quiet" role="status">Your words stay in this browser.</p><button class="secondary" id="complete" aria-pressed="${!!saved.complete}">${saved.complete?'Chapter read ✓':'Mark chapter as read'}</button>`;
 }
 async function render(){
  const version=++generation;cleanup();panels=null;sourceIndices={};
  const params=new URLSearchParams(location.search),id=params.get('chapter'),entry=manifest.chapters.find(c=>c.id===id);
  if(!id){landing();return;}
  if(!entry){document.body.classList.remove('reading');main.innerHTML='<p class="notice">This chapter is unavailable.</p><a href="/journey/">Return to the journey</a>';return;}
  document.body.classList.remove('seasonal-page');document.body.classList.add('reading');main.innerHTML='<p class="notice">Opening this chapter…</p>';
  try{
   const chapter=await get(`/journey/chapters/${encodeURIComponent(entry.id)}.json`);if(version!==generation)return;
   const chapterIndex=manifest.chapters.indexOf(entry),saved=state.chapters[id]||{},scenes=chapter.scenes;
   main.innerHTML=`<div class="reader-shell"><div id="panels" tabindex="0" aria-label="Swipe to read the story">${scenes.map(scenePanel).join('')}</div><div class="reader-progress" aria-hidden="true"><span id="progress-fill"></span></div><nav class="reader-top" aria-label="Journey navigation"><a href="/journey/" aria-label="All chapters">←</a><button id="chapter-picker" aria-label="Choose a chapter"><small>${String(chapterIndex+1).padStart(2,'0')} / ${manifest.chapters.length}</small><h1>${esc(chapter.title)}</h1></button><button id="reflect" aria-label="Open reflection exercises">✧</button></nav><div class="playback-controls"><button id="play" aria-label="Pause video">Ⅱ</button><button id="sound" aria-label="Turn sound on" aria-pressed="false">Sound off</button></div><nav class="reader-controls" aria-label="Reading controls"><button id="previous" aria-label="Previous moment">←</button><span id="position" role="status"></span><button id="text-toggle" aria-label="Hide story text" aria-pressed="${textVisible}">Aa</button><button id="next" aria-label="Next moment">→</button></nav><div id="chapter-end" hidden><button id="end-reflect">Pause & reflect</button>${chapterIndex<manifest.chapters.length-1?`<a href="${url(manifest.chapters[chapterIndex+1].id)}">Next chapter ↗</a>`:'<a href="/journey/">The journey ↗</a>'}</div></div><dialog class="journey-sheet" id="source-sheet" aria-label="Original source"><button class="close-sheet" aria-label="Close source">×</button><div id="source-body"></div></dialog><dialog class="journey-sheet" id="reflection-sheet" aria-label="Chapter reflections"><button class="close-sheet" aria-label="Close reflections">×</button>${reflectionMarkup(chapter,saved)}</dialog><dialog class="journey-sheet" id="chapters-sheet" aria-label="Choose a chapter"><button class="close-sheet" aria-label="Close chapter navigation">×</button><p class="eyebrow">A year of becoming</p><ol class="sheet-chapters">${manifest.chapters.map((c,n)=>`<li>${n===0||c.season!==manifest.chapters[n-1].season?`<p class="sheet-season"><span aria-hidden="true">${esc(c.moon)}</span> ${esc(c.season)} · ${esc(c.phase)}</p>`:''}<a href="${url(c.id)}" ${c.id===id?'aria-current="page"':''}><small>${String(n+1).padStart(2,'0')}</small>${esc(c.title)}</a></li>`).join('')}</ol></dialog>`;
   state.chapters[id]={...saved};state.last=id;
   panels=document.querySelector('#panels');const rail=panels;
   const requestedId=params.get('scene'),oldPanel=Number(params.get('panel')||0);
   active=requestedId?scenes.findIndex(s=>s.id===requestedId):params.has('panel')?scenes.findIndex(s=>s.passageIndex===oldPanel):0;
   active=Math.max(0,active);
   let timer,resizeFrame,pausedByUser=false;
   const sheets=[...main.querySelectorAll('dialog')];
   const currentMedia=()=>rail.children[active]?.querySelector('.scene-media');
   const currentVideo=()=>currentMedia()?.querySelector('video');
   const syncPlayback=()=>{
    if(version!==generation)return;
    const video=currentVideo(),blocked=sheets.some(s=>s.open)||document.hidden;
    rail.querySelectorAll('video').forEach(v=>{if(v!==video||blocked)v.pause();});
    document.querySelector('.playback-controls').hidden=!video;
    if(video){video.muted=!sound;document.querySelector('#play').textContent=video.paused?'▶':'Ⅱ';document.querySelector('#play').setAttribute('aria-label',video.paused?'Play video':'Pause video');document.querySelector('#sound').textContent=sound?'Sound on':'Sound off';document.querySelector('#sound').setAttribute('aria-pressed',String(sound));document.querySelector('#sound').setAttribute('aria-label',sound?'Turn sound off':'Turn sound on');}
   };
   function startVideo(){
    if(version!==generation)return;
    syncPlayback();const video=currentVideo();
    if(video&&!pausedByUser&&!sheets.some(s=>s.open)&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)video.play().then(()=>{if(version===generation)syncPlayback();}).catch(()=>syncPlayback());
   }
   function update(){
    if(version!==generation||rail.clientWidth<=0)return;
    const next=Math.max(0,Math.min(scenes.length-1,Math.round(rail.scrollLeft/rail.clientWidth))),changed=next!==active;
    active=next;const scene=scenes[active];
    state.chapters[id].sceneId=scene.id;state.chapters[id].panel=active;save();history.replaceState({},'',url(id,scene.id));
    document.querySelector('#position').textContent=`${active+1} / ${scenes.length}`;
    document.querySelector('#progress-fill').style.width=`${(active+1)/scenes.length*100}%`;
    document.querySelector('#previous').disabled=active===0&&chapterIndex===0;
    document.querySelector('#next').disabled=active===scenes.length-1&&chapterIndex===manifest.chapters.length-1;
    document.querySelector('#chapter-end').hidden=active!==scenes.length-1;
    rail.classList.toggle('text-hidden',!textVisible);
    [...rail.children].forEach((panel,n)=>{panel.inert=n!==active;panel.setAttribute('aria-hidden',String(n!==active));});
    if(changed){pausedByUser=false;startVideo();}else syncPlayback();
   }
   function move(delta){
    const target=active+delta;
    if(target<0&&chapterIndex>0){go(manifest.chapters[chapterIndex-1].id);return;}
    if(target>=scenes.length&&chapterIndex<manifest.chapters.length-1){go(manifest.chapters[chapterIndex+1].id);return;}
    rail.scrollTo({left:Math.max(0,Math.min(scenes.length-1,target))*rail.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
   }
   function showSheet(sheet){sheet.showModal();syncPlayback();}
   sheets.forEach(sheet=>{sheet.querySelector('.close-sheet').onclick=()=>sheet.close();sheet.addEventListener('close',startVideo);sheet.addEventListener('click',e=>{if(e.target===sheet){const r=sheet.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)sheet.close();}});});
   function showSource(index){
    const scene=scenes[index],selected=sourceIndices[index]||0,source=scene.sources[selected],r=record(source.contentId),background=record(scene.background.contentId),date=r.date?new Date(r.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}):'';
    document.querySelector('#source-body').innerHTML=`<p class="eyebrow">${esc(r.format)} · ${esc(date)}</p><h2>The original.</h2>${scene.sources.length>1?`<p class="quiet">This moment draws on ${scene.sources.length} source captions. Choose one to read its original caption.</p><div class="source-options">${scene.sources.map((s,n)=>`<button data-source-choice="${n}" aria-pressed="${n===selected}"><img src="${esc(cover(s.contentId))}" alt="" loading="lazy"><span>Reel ${String(s.sourceReel).padStart(3,'0')}</span></button>`).join('')}</div>`:''}<p class="quiet">${esc(scene.attribution)}.</p><p class="original-caption">${esc(r.caption)}</p><a href="/?asset=${encodeURIComponent(r.id)}">Open the original in the library ↗</a><details><summary>Background credit</summary><p>${scene.background.role==='source'?'Original source media.':'An archive companion from the same period, selected for visual variety. The passage’s source captions are listed above.'} ${esc(background.format)} · ${esc(scene.background.date.slice(0,10))}.</p><p class="original-caption">${esc(background.caption)}</p><a href="/?asset=${encodeURIComponent(background.id)}&index=${scene.background.assetIndex}">Open this background in the library ↗</a></details><details><summary>Full manuscript passage</summary><p class="manuscript-passage">${esc(chapter.passages[scene.passageIndex])}</p></details>`;
    document.querySelectorAll('[data-source-choice]').forEach(button=>button.onclick=()=>{sourceIndices[index]=Number(button.dataset.sourceChoice);showSource(index);});
    const sheet=document.querySelector('#source-sheet');if(!sheet.open)showSheet(sheet);else syncPlayback();
   }
   rail.scrollLeft=active*rail.clientWidth;update();startVideo();
   rail.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(update,110);},{passive:true});
   document.querySelector('#previous').onclick=()=>move(-1);document.querySelector('#next').onclick=()=>move(1);
   rail.onkeydown=e=>{if(e.target!==rail)return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}};
   document.querySelectorAll('[data-open-source]').forEach(button=>button.onclick=()=>showSource(Number(button.dataset.openSource)));
   document.querySelector('#chapter-picker').onclick=()=>showSheet(document.querySelector('#chapters-sheet'));
   const reflect=()=>showSheet(document.querySelector('#reflection-sheet'));
   document.querySelector('#reflect').onclick=reflect;document.querySelector('#end-reflect').onclick=reflect;
   document.querySelector('#text-toggle').onclick=e=>{textVisible=!textVisible;rail.classList.toggle('text-hidden',!textVisible);e.currentTarget.setAttribute('aria-pressed',String(textVisible));e.currentTarget.setAttribute('aria-label',textVisible?'Hide story text':'Show story text');};
   document.querySelector('#play').onclick=()=>{const video=currentVideo();if(video){if(video.paused){pausedByUser=false;video.play().then(syncPlayback).catch(syncPlayback);}else{pausedByUser=true;video.pause();}}};
   document.querySelector('#sound').onclick=()=>{sound=!sound;syncPlayback();};
   rail.querySelectorAll('video').forEach(video=>{video.addEventListener('play',syncPlayback);video.addEventListener('pause',syncPlayback);video.addEventListener('error',()=>{video.parentElement.querySelector('.media-error').hidden=false;});});
   document.querySelectorAll('[data-prompt]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-prompt]').forEach(t=>t.setAttribute('aria-pressed',String(t===button)));document.querySelectorAll('[data-exercise]').forEach(p=>p.hidden=p.dataset.exercise!==button.dataset.prompt);});
   document.querySelectorAll('[data-answer]').forEach(t=>t.oninput=()=>{state.chapters[id].answers??={};state.chapters[id].answers[t.dataset.answer]=t.value;document.querySelector('#reflection-status').textContent=save()?'Saved in this browser.':'Unable to save. Keep a copy before leaving.';});
   document.querySelector('#complete').onclick=e=>{state.chapters[id].complete=!state.chapters[id].complete;save();e.currentTarget.setAttribute('aria-pressed',String(state.chapters[id].complete));e.currentTarget.textContent=state.chapters[id].complete?'Chapter read ✓':'Mark chapter as read';};
   const resize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(rail.clientWidth>0)rail.scrollLeft=active*rail.clientWidth;});};
   const visibility=()=>{if(document.hidden)syncPlayback();else startVideo();};window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
   cleanup=()=>{clearTimeout(timer);cancelAnimationFrame(resizeFrame);rail.querySelectorAll('video').forEach(v=>v.pause());window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);};
  }catch(e){if(version===generation){document.body.classList.remove('reading');main.innerHTML=`<p class="notice">${esc(e.message)}</p><a href="/journey/">Return to the journey</a>`;}}
 }
 window.addEventListener('popstate',()=>manifest&&render());
 Promise.all([get('/journey/chapters/index.json'),get('/library.json')]).then(([m,l])=>{manifest=m;library=Array.isArray(l)?l:l.items;return render();}).catch(()=>{document.body.classList.remove('reading');main.innerHTML='<p class="notice">The journey could not be opened. Please try again.</p>';});
})();
