'use strict';
// Visibility is a behavioral proxy, never a claim that a person read an image.
(() => {
 if(!['moderndaycircus.com','www.moderndaycircus.com'].includes(location.hostname)||!window.mdcUX)return;
 const selector='.card .open img,.full-stage>.viewer,#content .slide>img,#content .slide>video,#full-stage>img,#full-stage>video,.scene .original-media';
 const nodes=new Map(),seen=new Set(),engaged=new Set(),modeSeen=new Set(),modeEngaged=new Set();let lastInput=Date.now(),activeSeconds=0,lastBeat=0,frame;
 const send=(name,data={})=>window.mdcUX(name,data);
 const mode=node=>node.closest('.scene')?'journey':node.closest('#full-stage')?'fullscreen':node.closest('.full-stage')?'detail':node.closest('.card')?'grid':'feed';
 const identity=node=>(node.currentSrc||node.src||'').match(/\/assets\/([a-f0-9]{32})\//)?.[1]||(node.currentSrc||node.src);
 function eligible(node){return !document.hidden&&Date.now()-lastInput<60000&&node.isConnected&&!node.closest('[hidden],[inert],[aria-hidden="true"]')&&!((document.querySelector('dialog[open]')||document.querySelector('#immersive:not([hidden])'))&&!node.closest('dialog,#immersive'))&&(node.tagName==='VIDEO'?node.readyState>=2:node.complete&&node.naturalWidth>0);}
 function stop(record){clearTimeout(record.impression);clearTimeout(record.engagement);record.impression=record.engagement=null;}
 function start(node,record){stop(record);if(record.ratio<.5||!eligible(node))return;const key=identity(node),media_mode=mode(node),media_kind=node.tagName==='VIDEO'?'video':'image';
  const emit=(event,set)=>{const scoped=media_mode+':'+key;if(!eligible(node)||record.ratio<.5||set.has(scoped))return;set.add(scoped);if(event==='media_impression')seen.add(key);const newlyReviewed=event==='media_engaged'&&media_mode!=='grid'&&!engaged.has(key);if(newlyReviewed)engaged.add(key);send(event,{media_mode,media_kind,reviewed_count:engaged.size,seen_count:seen.size});if(newlyReviewed&&[5,10,20,40,80].includes(engaged.size))send('browse_depth',{reviewed_count:engaged.size});};
  record.impression=setTimeout(()=>emit('media_impression',modeSeen),2000);
  record.engagement=setTimeout(()=>emit('media_engaged',modeEngaged),5000);
 }
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const r=nodes.get(e.target);if(!r)continue;r.ratio=e.intersectionRatio;start(e.target,r);}},{threshold:[0,.5,1]});
 function scan(){frame=null;for(const [node,r] of nodes)if(!node.isConnected){stop(r);observer.unobserve(node);nodes.delete(node);}document.querySelectorAll(selector).forEach(node=>{if(nodes.has(node))return;const r={ratio:0};nodes.set(node,r);observer.observe(node);node.addEventListener('loadeddata',()=>start(node,r));node.addEventListener('load',()=>start(node,r));node.addEventListener('error',()=>{if(mode(node)!=='journey')send('media_error',{media_mode:mode(node),media_kind:node.tagName==='VIDEO'?'video':'image'});},{once:true});});for(const [node,r]of nodes){const key=identity(node);if(!eligible(node))stop(r);else if(!r.engagement&&!modeEngaged.has(mode(node)+':'+key))start(node,r);}}
 new MutationObserver(()=>{if(!frame)frame=requestAnimationFrame(scan);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','inert','aria-hidden','src','open']});scan();
 function activity(){const idle=Date.now()-lastInput>=60000;lastInput=Date.now();if(idle)for(const [n,r]of nodes)start(n,r);}
 for(const name of ['pointerdown','keydown','touchstart','wheel'])document.addEventListener(name,activity,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)lastInput=Date.now();for(const [n,r]of nodes)start(n,r);});
 document.addEventListener('click',e=>{const b=e.target.closest('button,a');if(!b)return;let action;if(b.matches('[data-open]'))action='content_open';else if(b.matches('[data-favorite],.saved-button'))action='bookmark_use';else if(b.matches('#feed-more,#more'))action='load_more';else if(b.matches('[data-asset-index],.dots button'))action='carousel_change';else if(b.matches('[aria-label^="Fullscreen"]'))action='fullscreen_open';if(action)send(action);});
 document.addEventListener('submit',e=>{if(e.target.matches('.search'))send('search_use');});
 const beat=()=>{const total=Math.floor(activeSeconds);if(total>lastBeat){send('active_time',{active_seconds:total-lastBeat,reviewed_count:engaged.size,seen_count:seen.size});lastBeat=total;}};
 let tick=Date.now();setInterval(()=>{const now=Date.now(),elapsed=Math.min(5,(now-tick)/1000);tick=now;if(!document.hidden&&now-lastInput<60000)activeSeconds+=elapsed;if(activeSeconds-lastBeat>=30)beat();},5000);window.addEventListener('pagehide',beat);
 // Report bounded numeric browser diagnostics. These are LCP, CLS and worst
 // observed interaction duration; the latter is deliberately not named INP.
 if(window.PerformanceObserver){for(const [type,metric]of [['largest-contentful-paint','lcp'],['layout-shift','cls'],['event','interaction_latency']]){let value=0,timer;try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='layout-shift'){if(!e.hadRecentInput)value+=e.value;}else value=Math.max(value,type==='event'?e.duration:e.startTime);}clearTimeout(timer);timer=setTimeout(()=>send('performance',{metric,value:Math.round(value*(metric==='cls'?1000:1))}),3000);}).observe({type,buffered:true,...(type==='event'?{durationThreshold:40}:{})});}catch{}}}
})();
