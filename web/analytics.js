'use strict';
// Production-only GA4. Never send free text, search queries or browser-local IDs.
(() => {
  const measurementId = 'G-RY0NMHYXT8';
  const production = ['moderndaycircus.com', 'www.moderndaycircus.com'].includes(location.hostname);
  const formats = ['all', 'photo', 'reel', 'story'];
  let lastRoute;
  let previousPage = '';
  function page() {
    const params = new URLSearchParams(location.search);
    const format = formats.includes(params.get('type')) ? params.get('type') : 'all';
    let path = '/';
    if(location.pathname==='/journey/'||location.pathname==='/journey/index.html'){const chapter=params.get('chapter');path='/journey'+(/^chapter-(0[1-9]|1[0-9]|2[0-4])$/.test(chapter||'')?'/'+chapter:'');}
    if(path.startsWith('/journey')){}
    else if (params.has('asset')) path = '/gallery/content';
    else if (params.get('view') === 'bundles') path = params.has('bundle') ? '/bundles/detail' : '/bundles';
    else if (['results','visual'].includes(params.get('view'))) path = params.get('view') === 'visual' ? '/gallery/visual-search' : '/gallery/search';
    else if (params.get('view') === 'ring') path = '/rings/' + (['body','identity','maker'].includes(params.get('ring')) ? params.get('ring') : 'all');
    else if (['collections','collection','insights','favorites'].includes(params.get('view'))) path = '/' + params.get('view');
    else if (['feed','reels','stories'].includes(params.get('view'))) path='/gallery/'+params.get('view');
    else if (params.get('view')==='manifesto')path='/manifesto';
    else if (format !== 'all') path = '/gallery/' + format;
    return {page_location: 'https://moderndaycircus.com' + path, page_title: 'Modern Day Circus | ' + ({'/':'Home','/gallery/content':'Content','/gallery/search':'Search','/bundles':'Bundles','/bundles/detail':'Bundle'}[path] || (path.startsWith('/journey')?'Journey'+(path.split('/')[2]?' | '+path.split('/')[2]:''):format))};
  }
  function referrer() {
    try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; }
    catch { return ''; }
  }
  if (production) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...page(), page_referrer: referrer()
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(script);
  }
  window.mdcAnalyticsPage = () => {
    if (!production || lastRoute === page().page_location) return;
    lastRoute = page().page_location;
    const current = page();
    window.gtag('set', {...current, page_referrer: previousPage || referrer()});
    window.gtag('event', 'page_view', {...current, page_referrer: previousPage || referrer()});
    previousPage = current.page_location;
  };
  const originalAPI = window.mdcHostedAPI;
  if(!originalAPI)return;
  window.mdcHostedAPI = async (path, body) => {
    const result = await originalAPI(path, body);
    if (!production) return result;
    if (path === '/api/bundle' && body.action === 'create')
      window.gtag('event', 'bundle_create', {item_count: result.bundle.content_ids.length});
    if (path === '/api/bundle' && body.action === 'add')
      window.gtag('event', 'bundle_add', {item_count: result.bundle.content_ids.length});
    if (path === '/api/package')
      window.gtag('event', 'publishing_package_download', {item_count: body.ids.length, destination_count: body.platforms.length});
    return result;
  };
})();
