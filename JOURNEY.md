# A Year of Becoming

The journey at `/journey/` uses 112 globally unique Lightroom backgrounds: 34 still photos and 78 videos. Fifty-four repeated source backgrounds have been replaced with visually reviewed archive companions from the same period. All 49 manuscript paragraphs are preserved verbatim and divided into 112 short overlays. Every overlay explicitly identifies the reel caption it draws on; 61 source reels are used. When a sentence connects several captions, its Source sheet identifies the synthesis and lets readers switch between the supporting captions and open the original entries in the library. Background credits are shown separately, so companion media is never presented as the narrative’s evidence. All 199 original captions remain in `web/journey/sources.json`.

The reader fills the viewport with source media, preserving the full image/video frame over a blurred backdrop made from the same asset. Text appears over the lower edge. Source captions, chapter navigation and the 72 reflection exercises open in optional sheets. Active-scene videos play muted, pause offscreen and while sheets are open, and respect reduced-motion preferences. Play/pause, sound and text visibility are controllable.

## Editable chapters and attribution

Chapter files live in `web/journey/chapters/`. `index.json` controls chapter order. Keep chapter and scene IDs stable so saved progress remains meaningful.

```json
{
  "id": "chapter-01",
  "number": 1,
  "title": "Original chapter title",
  "period": "Original date or period",
  "passages": ["Original manuscript paragraph."],
  "scenes": [{
    "id": "p1-s1",
    "passageIndex": 0,
    "text": "Original manuscript paragraph.",
    "sources": [{"contentId":"existing-public-library-id","assetIndex":0,"sourceReel":1}],
    "attribution": "Adapted from the original caption",
    "background": {"contentId":"unique-public-library-id","assetIndex":0,"role":"period-companion","date":"2026-01-01T00:00:00+00:00","note":"Archive companion from this period; original caption sources are listed separately."}
  }],
  "reflections": [
    {"kind":"Notice","prompt":"A direct reflection question"},
    {"kind":"Write","prompt":"A journaling invitation"},
    {"kind":"Try","prompt":"A small action"}
  ]
}
```

Joining each paragraph's scenes with spaces must exactly reconstruct its passage. Keep scenes to a few sentences, usually fewer than 35 words. `background` supplies the scene media. Its Lightroom asset ID must be unique across the entire journey, including different carousel assets and rendition URLs. Prefer still photos for repeated sources, then other relevant content from the same period. Keep each replacement within three weeks of the source timestamp, using the closing chapter’s own period for its retrospective synthesis. `role` is `source` for original evidence media or `period-companion` for an editorial background. The Source sheet lists evidence captions and background credits separately. Caption selection never changes the scene background. Cite the actual source caption, rather than a visually or thematically similar entry. Each `sourceReel` corresponds to a preserved caption in `sources.json`. Media URLs resolve from the same public `library.json` used by the main site. Only existing public Lightroom assets are used; no stock or generated imagery is introduced.

The narrative contains editorial connecting prose and synthesis. Source sheets preserve that distinction. Reflection prompts are separate editorial additions. Do not import private messages, account exports, or private file paths.

## Progress and verification

Progress, read status and reflections retain the `mdc-becoming-v1` localStorage key. Each prompt has its own answer. Progress now uses stable scene IDs; legacy panel links remain supported. Notes stay in the current browser, do not sync and are lost if browser data is cleared. Storage failures show a notice. Reflection content is not sent to analytics.

Build with `node build.mjs`. Run `node --test tests/journey.test.mjs` plus the existing suite. Checks cover manuscript fidelity/order, every original caption, scene-to-passage reconstruction, source/media resolution, global uniqueness by physical Lightroom asset ID, period proximity, mixed-source examples, and all reflection prompts. Browser checks cover desktop and 390×844 mobile media coverage, source sheets, horizontal snapping, and reflection/progress persistence. Attribution is reviewed against captions; this is not a full visual/audio audit of all 61 reels.
