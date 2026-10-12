'use strict';
(() => {
  const themes=[{id:'fashion/portrait',name:'Style & portraits',description:'Fashion, portraiture and personal expression.'},{id:'water/outdoors',name:'Water & outdoors',description:'Time by the sea, on the water and outside.'},{id:'arts/community',name:'Art & community',description:'Creative moments and the people around them.'},{id:'technology',name:'Technology',description:'Technology mentioned in source captions.'}];
  const snapshot=r=>r.snapshots?.slice().sort((a,b)=>b.export_date.localeCompare(a.export_date))[0]||null;
  const metric=(r,label)=>{const v=snapshot(r)?.metrics?.[label]?.value;return typeof v==='number'&&Number.isFinite(v)?v:null;};
  const age=r=>{const s=snapshot(r);return s&&r.date?Math.floor((Date.parse(s.export_date+'T23:59:59Z')-Date.parse(r.date))/86400000):null;};
  const ageBand=r=>{const n=age(r);return n===null?'unknown':n<=7?'0–7 days':n<=30?'8–30 days':n<=90?'31–90 days':'91+ days';};
  const cohort=(r,rows,label)=>rows.filter(x=>x.format===r.format&&snapshot(x)?.export_date===snapshot(r)?.export_date&&ageBand(x)===ageBand(r)&&metric(x,label)!==null);
  const median=a=>{const s=a.slice().sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length?(s.length%2?s[m]:(s[m-1]+s[m])/2):null;};
  function comparison(r,rows,label){const c=cohort(r,rows,label),mid=median(c.map(x=>metric(x,label))),value=metric(r,label);return {n:c.length,median:mid,value,age_band:ageBand(r),breakout:c.length>=5&&mid>0&&value>=10*mid};}
  function words(rows){const counts=new Map();for(const r of rows){const terms=new Set((r.caption.toLowerCase().match(/[a-z]{4,}/g)||[]).filter(w=>!['this','that','with','have','your','from','what','when','just','about','there','they','them','been','more','some','will','into','like','only','here','than','know','would','could','were','these','their','make','time','really','because','always','other'].includes(w)));for(const w of terms)counts.set(w,(counts.get(w)||0)+1);}return [...counts].filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]);}
  const orientation=r=>r.media?.[r.visual_match_asset_index||0]?.orientation||'unknown';
  function match(r,q){return !q||[r.caption,r.edit?.title,...r.themes,...r.mentions].join(' ').toLowerCase().includes(q.toLowerCase());}
  function distance(a,b){if(!a?.length||!b?.length||a.length!==b.length)return Infinity;return a.reduce((sum,v,i)=>sum+((v-b[i])/255)**2,0)/a.length;}
  function visualMatches(rows,descriptor){return rows.map(r=>{let score=Infinity,index=0;r.media.forEach((m,i)=>{const value=distance(descriptor,m.descriptor);if(value<score){score=value;index=i;}});return {r,score,index};}).filter(x=>Number.isFinite(x.score)).sort((a,b)=>a.score-b.score).slice(0,60).map(x=>({...x.r,visual_match_asset_index:x.index}));}
  function descriptorForURL(rows,url){for(const r of rows)for(const m of r.media){if([m.media_url,m.preview_url,m.thumbnail_url,...Object.values(m.image_renditions||{})].includes(url)&&m.descriptor)return m.descriptor;}return null;}
  window.MDCDiscovery={themes,snapshot,metric,age,ageBand,cohort,comparison,median,words,orientation,match,distance,visualMatches,descriptorForURL};
})();
