'use strict';
// Existing business pixel. Do not initialize the second, unused dataset.
(() => {
 const production=['moderndaycircus.com','www.moderndaycircus.com'].includes(location.hostname);
 if(!production)return;
 const pixelId='1626165732856491',key='mdc-ad-consent-v1';
 let consent='unset',loaded=false,loading=false,lastPage='',currentPage='',qualified=false;
 try{const saved=localStorage.getItem(key);if(['granted','denied'].includes(saved))consent=saved;}catch{}
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
 window.gtag('consent','default',{ad_storage:consent==='granted'?'granted':'denied',ad_user_data:consent==='granted'?'granted':'denied',ad_personalization:consent==='granted'?'granted':'denied',analytics_storage:'granted'});
 // Suppress ad beacons on free-text/search/draft/bundle URLs. Meta's library
 // supplies its own document URL, so a sanitized custom parameter is insufficient.
 function safeRoute(){
  const p=new URLSearchParams(location.search),rules={view:/^(home|feed|reels|stories|results|ring|manifesto|collections|collection|favorites|insights|campaigns|campaign)$/,ring:/^(body|identity|maker)$/,type:/^(all|photo|reel|story)$/,orientation:/^(all|portrait|landscape|square)$/,chapter:/^chapter-(0[1-9]|1[0-9]|2[0-4])$/,scene:/^p\d{1,2}-s\d{1,2}$/,panel:/^\d{1,2}$/,asset:/^mdc-[a-f0-9]{20}$/,index:/^\d{1,3}$/,collection:/^[a-z0-9-]{1,60}$/,theme:/^[a-z0-9-]{1,60}$/,campaign:/^(weekly|look|seven-days|making|tools|together)$/,utm_source:/^(instagram|facebook|google|meta)$/,utm_medium:/^(social|paid|cpc|paid_social|organic)$/,utm_campaign:/^mdc_[a-z0-9_]{1,70}$/,fbclid:/^[A-Za-z0-9_-]{1,600}$/,gclid:/^[A-Za-z0-9_-]{1,300}$/,gbraid:/^[A-Za-z0-9_-]{1,300}$/,wbraid:/^[A-Za-z0-9_-]{1,300}$/};
  if(!['/','/journey/','/journey/index.html','/index.html'].includes(location.pathname))return false;
  for(const [name,value]of p)if(!rules[name]?.test(value))return false;
  return true;
 }
 function page(){
  if(consent!=='granted'||!loaded||!safeRoute()||!currentPage||lastPage===currentPage)return;
  lastPage=currentPage;window.fbq('trackSingle',pixelId,'PageView');
 }
 function load(){
  if(consent!=='granted'||loading||loaded||!safeRoute())return;
  loading=true;
  const f=window.fbq=window.fbq||function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments);};
  if(!window._fbq)window._fbq=f;f.push=f;f.loaded=true;f.version='2.0';f.queue=f.queue||[];
  f('consent','grant');f('set','autoConfig',false,pixelId);f('init',pixelId);
  const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';
  script.onload=()=>{loading=false;loaded=true;if(consent==='granted')page();else f('consent','revoke');};
  script.onerror=()=>{loading=false;};document.head.append(script);
 }
 function choose(value){consent=value;try{localStorage.setItem(key,value);}catch{}
  window.gtag('consent','update',{ad_storage:value==='granted'?'granted':'denied',ad_user_data:value==='granted'?'granted':'denied',ad_personalization:value==='granted'?'granted':'denied'});
  if(window.fbq)window.fbq('consent',value==='granted'?'grant':'revoke');
  document.querySelector('#ad-choice-panel').hidden=true;if(value==='granted'){load();page();}
 }
 window.mdcAdsPage=info=>{currentPage=info.page_location;load();page();};
 window.mdcAdsEvent=(action,data={})=>{
  if(consent!=='granted'||!loaded||!safeRoute())return;
  const payload={};if(/^becoming-[a-z0-9-]{1,80}$/.test(data.ui_version||''))payload.ui_version=data.ui_version;
  if(/^chapter-(0[1-9]|1[0-9]|2[0-4])$/.test(data.chapter_id||''))payload.chapter_id=data.chapter_id;
  if((action==='scene_engaged'||action==='media_engaged'&&data.media_mode!=='grid')&&!qualified){qualified=true;window.fbq('trackSingleCustom',pixelId,'EngagedVisit',payload);}
  if(action==='chapter_complete')window.fbq('trackSingleCustom',pixelId,'ChapterComplete',payload);
 };
 const box=document.createElement('section');box.id='ad-choices';box.setAttribute('aria-label','Ad measurement preferences');
 box.innerHTML='<button class="ad-choice-link" id="ad-choice-open">Ad privacy</button><div id="ad-choice-panel" '+(consent==='unset'?'':'hidden')+'><strong>Optional ad measurement</strong><p>Allow Meta and Google advertising cookies to help us understand which ads bring engaged visitors? Page addresses and device data may be shared. Your reflection text stays in this browser.</p><div class="ad-choice-actions"><button id="ad-allow">Allow ad measurement</button><button id="ad-decline">No thanks</button></div></div>';
 document.body.append(box);document.querySelector('#ad-choice-open').onclick=()=>document.querySelector('#ad-choice-panel').hidden=!document.querySelector('#ad-choice-panel').hidden;
 document.querySelector('#ad-allow').onclick=()=>choose('granted');document.querySelector('#ad-decline').onclick=()=>choose('denied');
 load();
})();
