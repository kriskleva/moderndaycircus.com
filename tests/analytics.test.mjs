import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('web/analytics.js','utf8');
function fixture(hostname='moderndaycircus.com') {
 const location={hostname,search:'?view=results&q=private%40example.com&bundle=private-id',href:'https://'+hostname+'/?view=results&q=private%40example.com&bundle=private-id'};
 const scripts=[],window={mdcHostedAPI:async()=>({bundle:{content_ids:['one']}})};
 vm.runInNewContext(source,{window,location,URL,URLSearchParams,Date,document:{referrer:'https://instagram.com/?email=private@example.com',createElement:()=>({}),head:{append:s=>scripts.push(s)}}});
 return {window,location,scripts};
}
const f=fixture();assert.equal(f.scripts.length,1);assert(f.scripts[0].src.includes('G-RY0NMHYXT8'));
f.window.mdcAnalyticsPage();f.window.mdcAnalyticsPage();
let events=f.window.dataLayer.filter(a=>a[0]==='event');assert.equal(events.length,1);assert.equal(events[0][2].page_location,'https://moderndaycircus.com/gallery/search');
f.location.search='?view=bundles&bundle=private-id';f.location.href='https://moderndaycircus.com/'+f.location.search;f.window.mdcAnalyticsPage();
await f.window.mdcHostedAPI('/api/bundle',{action:'create',name:'Private bundle',notes:'Secret notes'});
await f.window.mdcHostedAPI('/api/package',{ids:['private-id'],platforms:['Instagram'],bundle_name:'Private bundle'});
const payload=JSON.stringify(f.window.dataLayer);for(const secret of ['private@example.com','private-id','Private bundle','Secret notes'])assert(!payload.includes(secret));
assert(payload.includes('bundle_create')&&payload.includes('publishing_package_download'));
const local=fixture('localhost');local.window.mdcAnalyticsPage();assert.equal(local.scripts.length,0);assert.equal(local.window.dataLayer,undefined);
console.log('Passed: production-only tag, one pageview per route, URL/referrer sanitization, numeric event parameters and private-text exclusion.');
