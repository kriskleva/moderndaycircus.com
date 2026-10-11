# Modern Day Circus

Public publishing gallery with 1,074 content groups and 1,211 media assets hosted by Lightroom. No media copies, Instagram export archives, private messages, performance snapshots, private Mac state or credentials are committed or deployed.

## Build and publish

Run `node build.mjs`. Netlify builds the same command and publishes `dist/`. The project is connected to this repository's `main` branch; pushes rebuild the deployment.

## Working drafts

Favorites, collections, notes, caption drafts and portfolio preview selections are stored only in the current browser's local storage. They do not sync across devices or go to GitHub/Netlify. Use **Back up** to save them as JSON; clearing browser storage removes them. The private Mac gallery remains a separate shared workspace.

Publishing packages are generated in the browser. ZIPs contain platform captions and ordered public Lightroom media links, not media copies. Nothing is posted to social platforms. The portfolio route previews this browser's selections; it does not publish your edits as a shared portfolio.

## Refresh Lightroom content

From the private Modern Day Circus workspace, run `python3 scripts/map_lightroom_public.py --verify`, then `python3 scripts/prepare_netlify_gallery.py`. Review the generated changes in `deployment/netlify/`, commit and push to `main`. Metadata is an explicit dated snapshot; refresh after Lightroom edits to update revision-based rendition URLs. Public viewer endpoints may change.

## Files

- `web/library.json`: allowlisted public captions, publication dates and Lightroom URLs.
- `web/hosted.js`: browser-local workspace and ZIP packages.
- `web/app.js`, `index.html`, `style.css`: gallery interface.
- `build.mjs`, `netlify.toml`: portable build and hosting settings.

No dependencies or API keys are required. Media loads directly from `lightroom.adobe.com`.
