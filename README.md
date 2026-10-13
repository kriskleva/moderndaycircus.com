# Modern Day Circus

Public publishing gallery with 1,074 content groups and 1,211 media assets hosted by Lightroom. No media copies, Instagram export archives, private messages, account-level analytics, private Mac state or credentials are committed or deployed.

## Build and publish

Run `node build.mjs`. Netlify builds the same command and publishes `dist/`. The project is connected to this repository's `main` branch; pushes rebuild the deployment.

## Working drafts

Named bundles, bundle order, notes and platform caption drafts are stored only in the current browser's local storage. They do not sync across devices or go to GitHub/Netlify. Use **Back up** to save them as JSON; clearing browser storage removes them. The private Mac gallery remains a separate shared workspace.

Publishing packages are generated in the browser. ZIPs contain platform captions and ordered public Lightroom media links, not media copies. Nothing is posted to social platforms. Bundle URLs refer to this browser's saved state; they are not shared links for other people. Existing caption drafts remain compatible with the previous storage format.

## Refresh Lightroom content

From the private Modern Day Circus workspace, run `python3 scripts/map_lightroom_public.py --verify`, then `python3 scripts/build_gallery_visual_index.py` (requires ffmpeg and ffprobe), then `python3 scripts/prepare_netlify_gallery.py`. The preparation script updates only `web/library.json` and preserves the hosted design. Review the generated changes in `deployment/netlify/`, commit and push to `main`. Metadata is an explicit dated snapshot; refresh after Lightroom edits to update revision-based rendition URLs. Public viewer endpoints may change.

## Files

- `web/library.json`: allowlisted public captions, publication dates and Lightroom URLs.
- `web/hosted.js`: browser-local workspace and ZIP packages.
- `web/app.js`, `index.html`, `style.css`: gallery interface.
- `build.mjs`, `netlify.toml`: portable build, routing and response security settings.

No dependencies or API keys are required. Media loads directly from `lightroom.adobe.com`.

## Using the gallery

1. Search source captions and mentions, or browse Photos, Reels and Stories. Filters are caption-based and do not claim a complete visual review.
2. Open a card to view full media and ordered carousel assets directly from Lightroom.
3. Choose **Add to bundle**, then select an existing bundle or name a new one. No account is needed.
4. Open **Bundles** to reorder content, remove selections, rename a bundle and save notes.
5. In a content detail view, select a destination, edit its caption and choose **Save draft**. Instagram, Facebook, TikTok, YouTube and LinkedIn are supported. YouTube has a separate title field.
6. Choose **Prepare package** in a bundle. The ZIP contains original captions, destination drafts, ordered media links and a manifest with bundle notes. It does not publish anything or contain media copies.
7. **Back up bundles & drafts** downloads browser-local state as JSON. Keep the backup private. Automatic device synchronization and in-app backup restoration are not implemented. The private Mac workspace remains separate.

## Validation

Run `node --test tests/hosted.test.mjs` from this directory. Tests cover public catalog coverage, private-data exclusion, legacy draft persistence, conflicting saves, guest bundles, deduplication, reordering and ZIP packages. Preview with `python3 -m http.server 8766 --directory dist` after building.

## Google Analytics

GA4 measurement ID: `G-RY0NMHYXT8`, property `558463694`, stream `16109373680`. The production custom domain loads `web/analytics.js`; localhost, Netlify previews and the Netlify alternate hostname do not send traffic. No API secret is needed.

Pageviews are manually sent once per route change with generic titles and virtual paths (`/`, `/gallery/search`, `/gallery/content`, `/gallery/photo`, `/gallery/reel`, `/gallery/story`, `/bundles`, `/bundles/detail`). Raw query strings, search terms, content IDs, bundle IDs, captions, notes and bundle names are excluded. Referrers are reduced to their origin. Google Signals and ad personalization are disabled in the tag. This setup does not preserve UTM campaign parameters.

Events: `bundle_create` and `bundle_add` carry only `item_count`; `publishing_package_download` carries `item_count` and `destination_count`. The download event means the browser generated a package, not that it was published or resulted in a sale.

In Analytics stream Enhanced Measurement, keep **Page changes based on browser history events** off to prevent duplicate pageviews. Site search, form interactions, automatic file downloads and YouTube engagement are off; scroll and outbound clicks remain on. Native Lightroom videos are not automatically measured by YouTube engagement.

Check **Reports → Realtime** after visiting the production homepage. Standard report processing and the stream's collection-status banner may lag behind Realtime. Run `node --test tests/analytics.test.mjs tests/hosted.test.mjs` before deploying analytics changes.

Netlify Git builds explicitly use `netlify.toml` as their configuration file. This avoids the previously inherited security policy that blocked Google scripts. Keep this configuration path set when changing build settings.


## Discovery revision

The gallery retains the existing fonts and blush/purple palette. Flow, Gallery and Stack collection carousels accompany a default masonry feed. Source aspect ratios are preserved; the largest available Lightroom preview is used without thumbnail substitution or browser-side recompression. Native video and image quality remains limited by the rendition Adobe supplies.

Search suggestions and theme counts come from source captions. Orientation filters use archive dimensions. Bookmarks, named bundles and platform drafts require no sign-in and stay in the current browser. Download actions link to Lightroom media; publishing packages contain captions and source links.

The public catalog includes 1,017 content-linked performance snapshots from the October 7, 2026 Meta export. Exact labels, raw values, export date and source are preserved. Missing metrics remain unavailable. Account demographics and messages are excluded. Comparisons use the same format, export date and publication-age band; the cohort median distinguishes typical results from a breakout (at least five examples and ten times a nonzero median). Measurement periods are unverified. Theme membership and caption mentions do not verify collaborations, authorship, sales or trending searches.

Visual search compares coarse color and spatial layout across all 1,211 archive assets. Videos use the first frame; this is not semantic AI search or a complete visual audit. Uploaded references are processed inside the browser and never uploaded. URL matching supports indexed public Lightroom rendition URLs; other references can be supplied as a local image. Lightroom edits can differ from archive descriptors. The reusable index script caches by source-file signature and preserves the original archives.

Validate with `node --test tests/analytics.test.mjs tests/hosted.test.mjs tests/discovery.test.mjs`, then `node build.mjs`.

## Manifesto homepage — local review revision

The root route introduces Body, Identity and Maker before leading into the existing library at `/?view=results`. The primary hero action scrolls to `#three-rings`. Explicit ring selections live in `web/manifesto.js`; they do not classify the full catalog. Ring routes reuse the existing content cards, asset viewer and bundle tools.

Selected photos (zero-based asset index 0): hero `mdc-b5ab377bf069b762d97e`; Body `mdc-ee8fcf880bd9adaef623`; Identity `mdc-3dbdb2e7f13046f25124`; Maker `mdc-177f9ef4afd6ff16dbae`; garment detail `mdc-12d007ef5f2d350c2d6e`. All still images in these records were visually reviewed; the Body video's poster and loaded native player were reviewed. The hero keeps the full portrait inside a wide blush composition. Ring photography uses a restrained 3:4 treatment on desktop and natural proportions on mobile. Library default views remain uncropped. Sources remain the catalog's Lightroom URLs, with no new stock or generated artwork.

Fontuna Bold, Inter and Revive 80 Signature files and web-use licenses are not present. No PDF fonts were extracted. Display typography uses Arial Narrow, then Helvetica Neue, then Arial; readable UI/body copy retains Arial/Helvetica. The short handwritten accent uses locally installed Apple Chancery, Segoe Print or cursive. Rendering may differ between operating systems until licensed webfonts are supplied. Existing white/charcoal/blush/purple values are preserved.

The broader program remains a vision. Body's photograph documents personal practice, not a Modern Day Circus facility or partnership. Maker's current selection documents DJ tools and creative practice, not software development or fabrication. Verified visual examples of API/app work would strengthen that collection later.

Preview locally after `node build.mjs`, using the existing static server at `http://localhost:8766/`. No deployment or push is part of this revision. Storage keys and catalog data are unchanged. Existing checks: `node --test tests/analytics.test.mjs tests/hosted.test.mjs tests/discovery.test.mjs`.

### Expanded visual ring curation — October 13, 2026

Collections now contain 5 Body, 8 Identity and 4 Maker groups. The source of truth is the private workspace's `catalog/ring-selections.json`: explicit membership, chosen asset index, editorial title, visual observation, caption attribution, modeling relevance, review scope and exact Lightroom filename/asset ID. Run `python3 scripts/apply_ring_selections.py` from the workspace root to validate and regenerate `web/ring-selections.js`; rebuild here with `node build.mjs`.

No storage or catalog keys changed. Selected previews open the chosen asset while preserving all original carousel media and their order. Editorial card titles do not overwrite saved titles or captions. These selections do not create or modify Adobe albums. Lightroom sources remain the existing public URLs.

This pass reviewed 48 previews from 17 candidates, with additional spaced-frame samples from six video assets. It is a partial visual audit with no audio or continuous motion review. Modeling-goal graphics explain intention, not bookings. The Maker collection shows creative practice, with caption-based authorship/tool context; API/app visual proof remains a gap.
