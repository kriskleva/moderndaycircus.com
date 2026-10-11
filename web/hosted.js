'use strict';
// Public metadata comes from Git; private working edits remain in this browser.
const storageKey='mdc-publishing-workspace-v1';
const categories=['Art and collaborations','Lifestyle and products','API and app work'];
let publicLibraryPromise;
function browserState(){try{return JSON.parse(localStorage.getItem(storageKey))||{revision:0,items:{}};}catch(e){throw new Error('Browser storage is unavailable. Enable local storage to save drafts.');}}
const defaultEdit=()=>({title:'',favorite:false,status:'inbox',collections:[],category:'',portfolio:false,rights_confirmed:false,portfolio_description:'',drafts:{},youtube_title:'',notes:'',destinations:{}});
function saveBrowserState(state){localStorage.setItem(storageKey,JSON.stringify(state));}
async function publicLibrary(){if(!publicLibraryPromise)publicLibraryPromise=fetch('/library.json').then(r=>{if(!r.ok)throw new Error('Could not load the public library');return r.json();});return publicLibraryPromise;}
function downloadURL(blob){const url=URL.createObjectURL(blob);setTimeout(()=>URL.revokeObjectURL(url),15*60*1000);return url;}
// Store-only ZIP, UTF-8 filenames, CRC32. No media downloads or third-party code.
function zipFiles(files){
 const enc=new TextEncoder(),parts=[],central=[];let offset=0;
 const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 for(const [path,text] of files){
  const name=enc.encode(path),body=enc.encode(text);let crc=0xffffffff;for(const b of body)crc=table[(crc^b)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;
  const local=new Uint8Array(30+name.length),l=new DataView(local.buffer);l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,0x800,true);l.setUint32(14,crc,true);l.setUint32(18,body.length,true);l.setUint32(22,body.length,true);l.setUint16(26,name.length,true);local.set(name,30);
  const header=new Uint8Array(46+name.length),c=new DataView(header.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint32(16,crc,true);c.setUint32(20,body.length,true);c.setUint32(24,body.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);header.set(name,46);central.push(header);parts.push(local,body);offset+=local.length+body.length;
 }
 const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,central.reduce((n,p)=>n+p.length,0),true);v.setUint32(16,offset,true);
 return new Blob([...parts,...central,end],{type:'application/zip'});
}
window.mdcHostedAPI=async(path,body)=>{
 if(path==='/api/session')return {paired:true};
 const data=await publicLibrary(),state=browserState();
 const rows=data.items.map(r=>({...r,edit:{...defaultEdit(),...state.items[r.id]}}));
 if(path==='/api/library')return {items:rows,revision:state.revision,categories};
 if(path==='/api/portfolio')return {items:rows.filter(r=>r.edit.portfolio).map(r=>({id:r.id,title:r.edit.title,description:r.edit.portfolio_description,category:r.edit.category,format:r.format,date:r.date,media:r.media})),categories,preview:true};
 if(path==='/api/item'){
  if(body.revision!==state.revision){const e=new Error('Another tab saved changes. Reload and review your draft.');e.status=409;throw e;}
  if(!rows.some(r=>r.id===body.id))throw new Error('Unknown content');
  const old=state.items[body.id]||{},edit={...defaultEdit(),...old,...body.patch,drafts:{...old.drafts,...body.patch.drafts},destinations:{...old.destinations,...body.patch.destinations}};
  if(edit.portfolio&&(!edit.title||!edit.rights_confirmed||!categories.includes(edit.category)))throw new Error('Add a title, category and rights confirmation for the portfolio preview.');
  state.items[body.id]=edit;state.revision++;state.updated_at=new Date().toISOString();saveBrowserState(state);return {revision:state.revision,edit};
 }
 if(path==='/api/backup')return {download_url:downloadURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),filename:'mdc-browser-drafts-backup.json'};
 if(path==='/api/package'){
  if(!body.ids?.length||body.ids.length>30||!body.platforms?.length||body.platforms.some(p=>!['Instagram','Facebook','TikTok','YouTube','LinkedIn'].includes(p)))throw new Error('Choose up to 30 items and valid destinations.');
  const files=[],manifest={created_at:new Date().toISOString(),platforms:body.platforms,items:[],media_policy:'Ordered public Lightroom links; media stays on Adobe. Platforms may require actual files.'};
  for(const id of body.ids){
   const r=rows.find(r=>r.id===id);if(!r)throw new Error('Unknown content');const base=id+'/';files.push([base+'original-caption.txt',r.caption]);
   for(const platform of body.platforms){files.push([base+platform.toLowerCase()+'/caption.txt',r.edit.drafts[platform]??r.caption]);if(platform==='YouTube')files.push([base+'youtube/title.txt',r.edit.youtube_title]);}
   const links=r.media.map(m=>({asset_index:m.index,media_url:m.media_url,thumbnail_url:m.thumbnail_url,album_url:m.album_url,source:'Lightroom public URL'}));files.push([base+'media-links.json',JSON.stringify(links,null,2)]);manifest.items.push({content_id:id,title:r.edit.title,source_publication_utc:r.date,rights_confirmed:r.edit.rights_confirmed,media_links:links});
  }
  files.push(['manifest.json',JSON.stringify(manifest,null,2)],['READ-ME.txt','Captions and ordered Lightroom-hosted media links. No media files are copied. Obtain files from Lightroom when a destination requires uploads. Review credits, rights and ordering. This package does not publish anything.']);
  return {download_url:downloadURL(zipFiles(files)),filename:'mdc-publishing-package.zip'};
 }
 throw new Error('This action is not available in the hosted gallery.');
};
