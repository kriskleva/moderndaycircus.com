# A Year of Becoming

The journey at `/journey/` uses the original Lightroom media behind each passage. All 49 manuscript paragraphs are preserved verbatim and divided into 112 short overlays. Every overlay explicitly identifies the reel caption it draws on; 61 source reels are used. When a sentence connects several captions, its Source sheet identifies the synthesis and lets readers switch between the supporting entries and their original media. All 199 original captions remain in `web/journey/sources.json`.

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
    "attribution": "Adapted from the original caption"
  }],
  "reflections": [
    {"kind":"Notice","prompt":"A direct reflection question"},
    {"kind":"Write","prompt":"A journaling invitation"},
    {"kind":"Try","prompt":"A small action"}
  ]
}
```

Joining each paragraph's scenes with spaces must exactly reconstruct its passage. Keep scenes to a few sentences, usually fewer than 35 words. `sources[0]` supplies the initial media; additional sources are selectable in the Source sheet. Cite the actual source caption, rather than a visually or thematically similar entry. Each `sourceReel` corresponds to a preserved caption in `sources.json`. Media URLs resolve from the same public `library.json` used by the main site. No replacement imagery or generated assets are introduced.

The narrative contains editorial connecting prose and synthesis. Source sheets preserve that distinction. Reflection prompts are separate editorial additions. Do not import private messages, account exports, or private file paths.

## Progress and verification

Progress, read status and reflections retain the `mdc-becoming-v1` localStorage key. Each prompt has its own answer. Progress now uses stable scene IDs; legacy panel links remain supported. Notes stay in the current browser, do not sync and are lost if browser data is cleared. Storage failures show a notice. Reflection content is not sent to analytics.

Build with `node build.mjs`. Run `node --test tests/journey.test.mjs` plus the existing suite. Checks cover manuscript fidelity/order, every original caption, scene-to-passage reconstruction, source/media resolution, mixed-source examples, and all reflection prompts. Browser checks cover desktop and 390×844 mobile media coverage, source sheets, horizontal snapping, and reflection/progress persistence. Attribution is reviewed against captions; this is not a full visual/audio audit of all 61 reels.
