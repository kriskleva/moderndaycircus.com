'use strict';
// Change this release label whenever a user-facing UI change ships.
(() => {
 const revision='becoming-seasonal-2026-10-16-v1';
 const production=['moderndaycircus.com','www.moderndaycircus.com'].includes(location.hostname);
 const actions=new Set(['chapter_open','scene_view','scene_engaged','chapter_end','chapter_complete','chapter_reset','reflection_open','reflection_saved','source_open','chapter_navigation','text_hide','text_show','sound_on','sound_off','video_play','video_pause','media_error','storage_error','chapter_error','journey_error','journey_enter','journey_resume','timeline_open','world_open','library_open']);
 const seen=new Set();
 window.mdcUX=(action,values={})=>{
  if(!production||!actions.has(action)||typeof window.gtag!=='function')return;
  const data={ui_version:revision,surface:location.pathname.startsWith('/journey')?'journey':'site'};
  if(/^chapter-(0[1-9]|1[0-9]|2[0-4])$/.test(values.chapter_id||''))data.chapter_id=values.chapter_id;
  for(const field of ['scene_number','scene_count','active_seconds'])if(Number.isInteger(values[field])&&values[field]>=0&&values[field]<=86400)data[field]=values[field];
  if(['next','previous','swipe'].includes(values.method))data.method=values.method;
  window.gtag('event','ux_'+action,data);
 };
 window.mdcUXOnce=(action,values={})=>{const key=JSON.stringify([action,values.chapter_id,values.scene_number]);if(seen.has(key))return;seen.add(key);window.mdcUX(action,values);};
 if(production&&window.gtag)window.gtag('set',{ui_version:revision});
 document.addEventListener('click',event=>{
  const link=event.target.closest('a');if(!link)return;
  const href=link.getAttribute('href')||'';
  if(link.matches('.becoming-primary'))window.mdcUX(href.includes('scene=')?'journey_resume':'journey_enter');
  else if(href==='#seasons')window.mdcUX('timeline_open');
  else if(link.matches('[data-open-world]'))window.mdcUX('world_open');
  else if(link.matches('.world-library'))window.mdcUX('library_open');
 });
 document.addEventListener('toggle',event=>{if(event.target.id==='world'&&event.target.open)window.mdcUXOnce('world_open');},true);
 window.mdcAnalyticsPage?.();
})();
