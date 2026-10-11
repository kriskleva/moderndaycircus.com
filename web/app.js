'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const portfolioMode=location.pathname==='/portfolio';
let library=[],revision=0,format='all',view='all',visible=48,selected=new Set(),active=null,activeMedia=0,platform='Instagram',drafts={},destinations={},baseEdit=null,portfolioFilter='all';
const platforms=['Instagram','Facebook','TikTok','YouTube','LinkedIn'];
const guidance={
 Instagram:{text:'Keep your opening line clear, preserve creator credits, and choose hashtags that actually describe the work. Review whether this is a Reel, feed post or Story before uploading.',url:'https://help.instagram.com/'},
 Facebook:{text:'Give the scene or project enough context to stand on its own. Keep the original credits and add only a question or invitation you actually want to ask.',url:'https://www.facebook.com/help/'},
 TikTok:{text:'Use a concise opening suited to the video. Check the text overlay and audio in the app; an exported soundtrack does not establish reuse rights.',url:'https://support.tiktok.com/en/using-tiktok/creating-videos/editing-posting-and-deleting'},
 YouTube:{text:'Add a working title and a useful description with credits. YouTube categorizes square or vertical uploads up to three minutes as Shorts; this package does not recrop or shorten your video.',url:'https://support.google.com/youtube/answer/15424877'},
 LinkedIn:{text:'Connect the work to a specific process, design decision or implementation lesson you can substantiate. Keep key on-screen content away from edges that the app may cover.',url:'https://www.linkedin.com/help/linkedin/answer/a7174587'}
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>s?new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(s)):'Date unavailable';
const title=r=>r.edit?.title||r.title||r.caption?.split('\n').find(x=>x.trim())||'Untitled content';
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,5500);}
async function api(path,body){if(window.mdcHostedAPI)return window.mdcHostedAPI(path,body);const res=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});const data=await res.json();if(!res.ok){if(res.status===401){$('#application').hidden=true;$('#pairing').hidden=false;}const e=new Error(data.error||'Request failed');e.status=res.status;throw e;}return data;}
async function load(){
 const data=await api(portfolioMode?'/api/portfolio':'/api/library');library=data.items;revision=data.revision??0;
 $('#pairing').hidden=true;$('#application').hidden=false;$('#library-view').hidden=portfolioMode;$('#portfolio-view').hidden=!portfolioMode;
 $(portfolioMode?'#portfolio-link':'#library-link').classList.add('active');
 if(portfolioMode){renderPortfolio();return;}
 $('#library-summary').textContent=`${library.length.toLocaleString()} content groups · ${library.flatMap(r=>r.media).filter(m=>m.source==='Lightroom public URL').length.toLocaleString()} assets from public Lightroom URLs`;
 renderFormats();updateCollections();render();
}
function renderFormats(){
 const counts={all:library.length};for(const r of library)counts[r.format]=(counts[r.format]||0)+1;
 $('#format-filters').innerHTML=[['all','All formats'],['post','Single posts'],['carousel','Carousels'],['reel','Reels'],['story','Stories']].map(([key,label])=>`<button data-format="${key}" class="${format===key?'active':''}">${label}<span>${(counts[key]||0).toLocaleString()}</span></button>`).join('');
 $$('#format-filters button').forEach(b=>b.onclick=()=>{format=b.dataset.format;visible=48;renderFormats();render();});
}
function updateCollections(){
 const old=$('#collection-filter').value;const names=[...new Set(library.flatMap(r=>r.edit.collections||[]))].sort();$('#collection-filter').innerHTML='<option value="">Every collection</option>'+names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');$('#collection-filter').value=names.includes(old)?old:'';
 if($('#category-filter').options.length===1)for(const c of ['Art and collaborations','Lifestyle and products','API and app work'])$('#category-filter').add(new Option(c,c));
}
function shares(r){const s=[...r.snapshots].sort((a,b)=>b.export_date.localeCompare(a.export_date)).find(s=>'Instagram Shares'in s.metrics);return s?.metrics['Instagram Shares'].value??-1;}
function filtered(){
 const q=$('#search').value.toLowerCase().trim(),collection=$('#collection-filter').value,category=$('#category-filter').value;
 let rows=library.filter(r=>(format==='all'||r.format===format)&&(view==='all'||view==='favorites'&&r.edit.favorite||view==='ready'&&r.edit.status==='ready'||view==='portfolio'&&r.edit.portfolio)&&(!collection||r.edit.collections.includes(collection))&&(!category||r.edit.category===category)&&(!q||[r.caption,r.edit.title,r.id,...r.themes,...r.mentions,...r.edit.collections].join(' ').toLowerCase().includes(q)));
 const sort=$('#sort').value;
 if(sort==='shares')rows=rows.filter(r=>r.format==='reel').sort((a,b)=>shares(b)-shares(a));else rows.sort((a,b)=>(sort==='old'?1:-1)*(a.date||'').localeCompare(b.date||''));
 return rows;
}
function card(r,portfolio=false){
 const count=r.media.length;return `<article class="card" data-id="${esc(r.id)}"><div class="card-media"><button class="card-open" aria-label="View ${esc(title(r))}"><img loading="lazy" decoding="async" src="${esc(r.media[0].thumbnail_url||`/api/thumb/${r.id}/0`)}" alt="Preview of ${esc(title(r))}"></button>${portfolio?'':`<input type="checkbox" class="select-item" ${selected.has(r.id)?'checked':''} aria-label="Select ${esc(title(r))}"><button class="favorite-button ${r.edit.favorite?'on':''}" aria-label="${r.edit.favorite?'Remove favorite':'Mark favorite'}">${r.edit.favorite?'♥':'♡'}</button>`}<span class="format-badge">${esc(r.format)}${count>1?' · '+count:''}</span>${r.media[0]?.kind==='video'?'<span class="play-icon">▷</span>':''}</div><button class="card-title">${esc(title(r))}</button>${portfolio?`<div class="card-meta">${esc(r.category)}</div><p class="portfolio-description">${esc(r.description)}</p>`:`<div class="card-meta"><span>${esc(date(r.date))}</span>${r.edit.status==='ready'?'<span class="status-dot"></span><span>Ready</span>':''}${r.edit.portfolio?'<span>◈ Portfolio</span>':''}</div>`}</article>`;
}
function bindCards(container,portfolio=false){
 container.querySelectorAll('.card').forEach(el=>{
  const r=library.find(r=>r.id===el.dataset.id);el.querySelector('.card-open').onclick=()=>openDetail(r);el.querySelector('.card-title').onclick=()=>openDetail(r);
  const image=el.querySelector('.card-media img');image.onerror=()=>{image.hidden=true;const failed=document.createElement('span');failed.className='thumb-failed';failed.textContent='Preview unavailable · open content';el.querySelector('.card-media').append(failed);};
  if(!portfolio){el.querySelector('.select-item').onchange=e=>{e.target.checked?selected.add(r.id):selected.delete(r.id);renderSelection();};el.querySelector('.favorite-button').onclick=async()=>{try{const data=await api('/api/item',{id:r.id,revision,patch:{favorite:!r.edit.favorite}});revision=data.revision;r.edit=data.edit;render();}catch(e){toast(e.message);if(e.status===409)await load();}};}
 });
}
function render(){const rows=filtered();$('#gallery-grid').innerHTML=rows.slice(0,visible).map(r=>card(r)).join('');bindCards($('#gallery-grid'));$('#results-count').textContent=`${rows.length.toLocaleString()} items`;$('#filter-context').textContent=$('#sort').value==='shares'?'Exact export Instagram Shares · mixed ages':'';$('#empty').hidden=rows.length>0;$('#load-more').hidden=rows.length<=visible;$('#page-status').textContent=rows.length?`Showing ${Math.min(visible,rows.length)} of ${rows.length.toLocaleString()}`:'';renderSelection();}
function renderSelection(){$('#selection-bar').hidden=selected.size===0;$('#selection-count').textContent=`${selected.size} selected`;}
function renderPortfolio(){
 const categories=['all','Art and collaborations','Lifestyle and products','API and app work'];$('#portfolio-categories').innerHTML=categories.map(c=>`<button data-category="${esc(c)}" class="${c===portfolioFilter?'active':''}">${c==='all'?'All selected work':esc(c)}</button>`).join('');
 $$('#portfolio-categories button').forEach(b=>b.onclick=()=>{portfolioFilter=b.dataset.category;renderPortfolio();});
 const rows=library.filter(r=>portfolioFilter==='all'||r.category===portfolioFilter);$('#portfolio-grid').innerHTML=rows.map(r=>card(r,true)).join('');bindCards($('#portfolio-grid'),true);$('#portfolio-empty').hidden=rows.length>0;
}
function switchMedia(index){activeMedia=index;const asset=active.media[index],stage=$('#media-stage');stage.replaceChildren();const media=document.createElement(asset.kind==='video'?'video':'img');media.src=asset.media_url||`/api/media/${active.id}/${index}`;if(asset.kind==='video'){media.controls=true;media.playsInline=true;media.preload='metadata';media.poster=asset.thumbnail_url||`/api/thumb/${active.id}/${index}`;}else media.alt=title(active);media.onerror=()=>{const p=document.createElement('p');p.className='panel-copy';p.textContent='Hosted media could not load. Open the Lightroom album or refresh its URL mapping.';stage.replaceChildren(p);if(asset.album_url){const a=document.createElement('a');a.href=asset.album_url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open in Lightroom ↗';stage.append(a);}};stage.append(media);$$('#media-strip button').forEach(b=>b.classList.toggle('active',Number(b.dataset.index)===index));}
function syncDraft(){if(!active||portfolioMode)return;drafts[platform]=$('#edit-caption').value;destinations[platform]=$('#edit-published').value;}
function showDraft(next){platform=next;$('#draft-platform').value=next;$('#edit-caption').value=drafts[next]??active.caption;$('#edit-published').value=destinations[next]??'';$('#platform-guidance').textContent=guidance[next].text;$('#platform-source').href=guidance[next].url;$('#youtube-title-field').hidden=next!=='YouTube';$('#character-count').textContent=`${$('#edit-caption').value.length.toLocaleString()} characters`;}
function openDetail(r){
 $('#lightroom-source')?.remove();
 active=r;$('#detail-heading').textContent=title(r);$('#detail-meta').textContent=`${r.format} · ${date(r.date)}`;$('#media-strip').innerHTML=r.media.length>1?r.media.map(m=>`<button data-index="${m.index}" aria-label="View asset ${m.index+1}"><img loading="lazy" src="${esc(m.thumbnail_url||`/api/thumb/${r.id}/${m.index}`)}" alt="Asset ${m.index+1}"></button>`).join(''):'';$$('#media-strip button').forEach(b=>b.onclick=()=>switchMedia(Number(b.dataset.index)));switchMedia(0);
 $('#detail-dialog .detail-tabs').hidden=portfolioMode;$('#edit-form').hidden=portfolioMode;
 if(portfolioMode){$('#detail-heading').textContent=r.title;const p=document.createElement('p');p.className='portfolio-description';p.textContent=r.description;$('#detail-info-description')?.remove();p.id='detail-info-description';$('.detail-info').append(p);}
 else{
  $('#lightroom-source')?.remove();if(r.lightroom){const p=document.createElement('p');p.id='lightroom-source';p.className='panel-copy';const a=document.createElement('a');a.className='source-link';a.href=r.lightroom.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open '+r.lightroom.name+' ↗';p.append(a,document.createElement('br'),document.createTextNode(r.lightroom.media_source));$('.detail-info').append(p);}
  baseEdit=structuredClone(r.edit);drafts={...r.edit.drafts};destinations={...r.edit.destinations};$('#edit-title').value=r.edit.title;$('#edit-status').value=r.edit.status;$('#edit-category').value=r.edit.category;$('#edit-collections').value=r.edit.collections.join(', ');$('#edit-description').value=r.edit.portfolio_description;$('#edit-rights').checked=r.edit.rights_confirmed;$('#edit-portfolio').checked=r.edit.portfolio;$('#edit-notes').value=r.edit.notes;$('#edit-youtube-title').value=r.edit.youtube_title;$('#original-caption').textContent=r.caption||'No caption in the source export.';$('#save-message').textContent='';showTab('organize');showDraft('Instagram');
  const review=r.review;$('#review-evidence').innerHTML=`<div class="evidence-box"><h3>Creative evidence</h3><p>${typeof review==='object'?esc(review.method)+'<br>'+esc(review.observation):'Media not visually reviewed during the audit. Caption themes are inferences.'}</p>${r.archived?`<p>${esc(r.archived)}</p>`:''}<p>Content ID: ${esc(r.id)}</p></div>`;
  $('#metric-evidence').innerHTML=r.snapshots.length?r.snapshots.map(s=>`<div class="evidence-box"><h3>Export snapshot · ${esc(s.export_date)}</h3><p>${esc(s.period_scope)}<br>Source: ${esc(s.source.split('/').slice(-2).join('/'))} · record ${s.record_index}</p><table>${Object.entries(s.metrics).filter(([k])=>!['Caption','Upload Timestamp','Creation Timestamp'].includes(k)).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v.raw_value??'Unavailable')||'Unavailable'}</td></tr>`).join('')}</table></div>`).join(''):'<div class="evidence-box"><p>Performance metrics stay in the private Mac workspace.</p></div>';
 }
 $('#detail-dialog').showModal();
}
function showTab(tab){$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==tab);$$('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===tab);b.setAttribute('aria-selected',String(b.dataset.tab===tab));});}
async function saveEdit(e){
 e.preventDefault();syncDraft();const fields={title:$('#edit-title').value,status:$('#edit-status').value,category:$('#edit-category').value,collections:[...new Set($('#edit-collections').value.split(',').map(s=>s.trim()).filter(Boolean))],portfolio_description:$('#edit-description').value,rights_confirmed:$('#edit-rights').checked,portfolio:$('#edit-portfolio').checked,notes:$('#edit-notes').value,youtube_title:$('#edit-youtube-title').value};
 const patch={};for(const [k,v]of Object.entries(fields))if(JSON.stringify(v)!==JSON.stringify(baseEdit[k]))patch[k]=v;
 patch.drafts=Object.fromEntries(Object.entries(drafts).filter(([k,v])=>v!==baseEdit.drafts[k]));patch.destinations=Object.fromEntries(Object.entries(destinations).filter(([k,v])=>v!==baseEdit.destinations[k]));
 $('#save-edit').disabled=true;
 try{const data=await api('/api/item',{id:active.id,revision,patch});revision=data.revision;active.edit=data.edit;baseEdit=structuredClone(data.edit);$('#detail-heading').textContent=title(active);$('#save-message').textContent='Saved on this browser';updateCollections();render();}
 catch(error){$('#save-message').textContent=error.message;if(error.status===409){const data=await api('/api/library');revision=data.revision;$('#save-message').textContent='Another device made changes. Your draft is still here. Review it, then save again.';}}
 finally{$('#save-edit').disabled=false;}
}
$('#pair-form').onsubmit=async e=>{e.preventDefault();$('#pair-error').textContent='';try{await api('/api/login',{code:$('#pair-code').value});await load();}catch(error){$('#pair-error').textContent=error.message;}};
$('#logout').onclick=async()=>{await api('/api/logout',{});location.reload();};
$('#backup').onclick=async()=>{try{const data=await api('/api/backup');const a=document.createElement('a');a.href=data.download_url;a.download=data.filename;document.body.append(a);a.click();a.remove();toast('Browser draft backup downloaded. Keep it private.');}catch(e){toast(e.message);}};
$('#search').oninput=()=>{visible=48;render();};$('#sort').onchange=()=>{visible=48;render();};$('#collection-filter').onchange=$('#category-filter').onchange=()=>{visible=48;render();};
$$('.side-filter').forEach(b=>b.onclick=()=>{view=b.dataset.view;visible=48;$$('.side-filter').forEach(x=>x.classList.toggle('active',x===b));render();});
$('#load-more').onclick=()=>{visible+=48;render();};$('#clear-filters').onclick=()=>{format='all';view='all';$('#search').value='';$('#collection-filter').value='';$('#category-filter').value='';renderFormats();render();};
$('#select-visible').onclick=()=>{const rows=filtered().slice(0,visible);if(rows.length>30){toast('Select up to 30 items for a publishing package. The first 30 displayed are selected.');}for(const r of rows.slice(0,30))selected.add(r.id);render();};
$('#clear-selection').onclick=()=>{selected.clear();render();};
$('#detail-close').onclick=()=>$('#detail-dialog').close();$('#detail-dialog').onclose=()=>{$$('#media-stage video').forEach(v=>v.pause());$('#media-stage').replaceChildren();active=null;};
$$('[data-tab]').forEach(b=>b.onclick=()=>{syncDraft();showTab(b.dataset.tab);});$('#draft-platform').onchange=e=>{syncDraft();showDraft(e.target.value);};
$('#edit-caption').oninput=()=>{$('#character-count').textContent=`${$('#edit-caption').value.length.toLocaleString()} characters`;};$('#use-original').onclick=()=>{$('#edit-caption').value=active.caption;$('#edit-caption').oninput();};
$('#copy-caption').onclick=async()=>{try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText($('#edit-caption').value);toast('Draft copied');}else{$('#edit-caption').focus();$('#edit-caption').select();toast('Draft selected. Use Copy on your device.');}}catch(e){toast('Select the draft and use Copy on your device.');}};
$('#edit-form').onsubmit=saveEdit;
$('#package-open').onclick=()=>{$('#package-summary').textContent=`${selected.size} selected content ${selected.size===1?'group':'groups'}. Your saved caption drafts will be included.`;$('#package-message').textContent='';$('#package-dialog').showModal();};$('#package-close').onclick=()=>$('#package-dialog').close();
$('#package-download').onclick=async()=>{const chosen=$$('#package-platforms input:checked').map(x=>x.value);if(!chosen.length||selected.size>30){$('#package-message').textContent='Choose destinations and no more than 30 items.';return;}$('#package-download').disabled=true;$('#package-message').textContent='Preparing Lightroom links and your saved drafts…';try{const data=await api('/api/package',{ids:[...selected],platforms:chosen});$('#package-message').textContent='Package ready. ';const a=document.createElement('a');a.href=data.download_url;a.download=data.filename;a.className='source-link';a.textContent='Download ZIP ↓';$('#package-message').append(a);const note=document.createElement('p');note.className='panel-copy';note.textContent='The download link stays available for 15 minutes in this browser.';$('#package-message').append(note);}catch(e){$('#package-message').textContent=e.message;}finally{$('#package-download').disabled=false;}};
for(const p of platforms){$('#draft-platform').add(new Option(p,p));const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.value=p;input.checked=true;label.append(input,document.createTextNode(p));$('#package-platforms').append(label);}
for(const c of ['Art and collaborations','Lifestyle and products','API and app work'])$('#edit-category').add(new Option(c,c));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!portfolioMode){e.preventDefault();$('#search').focus();}});
setInterval(async()=>{if(document.visibilityState==='visible'&&!$('#detail-dialog').open&&!$('#package-dialog').open&&!$('#application').hidden){try{await load();}catch(e){toast('Could not refresh the shared library. Check your connection.');}}},30000);
(async()=>{try{const s=await api('/api/session');if(s.paired)await load();else $('#pairing').hidden=false;}catch(e){$('#pairing').hidden=false;$('#pair-error').textContent='The library could not be reached. Check the server terminal.';}})();
