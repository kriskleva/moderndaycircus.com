# Advertising measurement

The site uses the existing ModernDayCircus Pixel, ID `1626165732856491`. Do not initialize the second unused dataset. `web/advertising.js` loads on the homepage and journey before Google Analytics. It sets Google advertising consent to denied until the visitor chooses Allow ad measurement. Existing first-party site analytics remains separate. Visitors can reopen Ad privacy and withdraw advertising consent.

Meta loads only on the production domain, after affirmative advertising consent and on allowlisted public routes. No search terms, private bundle IDs, drafts, reflection answers or arbitrary query strings are passed as event parameters. Advertising beacons are suppressed on search/private/unrecognized URLs because the Meta library supplies the actual document URL. Automatic Meta page-detail collection was turned off in Events Manager; automatic events and advanced matching remain off. The client also disables automatic configuration. Do not re-enable automatic page extraction on this manuscript/reflection site.

Events:

- `PageView`: one per sanitized logical page/chapter, not per scene or hash change.
- `EngagedVisit`: once per document, on a qualified non-grid media engagement or a ten-second story engagement. This is an attention proxy, not a purchase or lead.
- `ChapterComplete`: when a reader explicitly marks a chapter read. This is a content goal; do not label it Purchase or Lead.

Google Analytics uses the existing G-RY0NMHYXT8 tag. No Google Ads conversion destination is invented: an existing Ads account and its actual destination/conversion IDs are required. The currently signed-in kris@moderndaycircus.com account showed no Google Ads accounts; the owner reported the Ads account is under another login and will handle switching manually. Account linking/importing GA4 key events must be verified in that account before Ads conversions are described as active.

The static `facebook-domain-verification` meta tag belongs to ModernDayCircus.com's entry in the existing Modern Day Circus business portfolio. Verification must be confirmed in Meta after publishing. CSP allows the Meta script and collection endpoints explicitly; no wildcard script source, inline execution or evaluation exception is added.

Validate with `node --test tests/advertising.test.mjs tests/analytics.test.mjs tests/ux.test.mjs`. Then confirm live CSP, static verification tag, Meta Test Events after accepting advertising, no pre-consent collection, and no duplicate events on scene changes. Cookie-blocking browsers/ad blockers can prevent Meta delivery; a successful deployment alone is not delivery verification. No Conversions API token or server integration is created by this browser-pixel setup.

The ad-choice interface is release `becoming-seasonal-2026-10-16-v2-ad-choice`. The original journey design remains baseline v1; compare this small UI addition separately.
