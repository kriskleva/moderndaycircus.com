# A Year of Becoming

Reader at `/journey/`, linked from the homepage. All 24 chapters are imported verbatim from the supplied manuscript. Forty-eight caption-selected reels and three companion stories/posts accompany the narrative. All 199 original reel captions are preserved in `web/journey/sources.json` and are available as a download. These exactly match the current public catalog.

Every chapter includes three optional, original workbook exercises: Notice, Write, and Try. Each prompt has its own browser-local answer. Exercises are editorial additions and do not modify the manuscript.

## Editable chapter files

Add one JSON file per chapter under `web/journey/chapters/`, using a stable, lowercase hyphenated ID as its filename. List chapters in reading order in `index.json`:

```json
{"id":"chapter-01","title":"Original chapter title"}
```

Each chapter uses this format (the example is a schema illustration, not manuscript copy):

```json
{
  "title":"Original chapter title",
  "period":"Original date or period",
  "passages":["Original manuscript paragraph.\n\nAnother paragraph.","Next reading panel."],
  "media":[{"contentId":"existing-public-library-id","assetIndex":0,"alt":"Accurate image description","note":"Optional editorial context"}],
  "reflections":[{"kind":"Notice","prompt":"A direct reflection question"},{"kind":"Write","prompt":"A journaling invitation"},{"kind":"Try","prompt":"A small action"}]
}
```

Keep passages short enough for relaxed reading; vertical scrolling remains available with large text. Preserve manuscript wording. Media is explicitly curated using public library IDs; original captions are displayed from the library without rewriting. Videos require a tap to play. Do not import private messages, account exports, or private file paths.

Progress, read status and reflection notes use `mdc-becoming-v1` in localStorage. These remain in the current browser, do not sync and are lost if browser data is cleared. Storage failures show a notice. No reflection content is sent to analytics. Stable IDs preserve progress when chapter order changes.

The homepage and main navigation link to `/journey/`. Build using `node build.mjs`. Validate with `node --test tests/journey.test.mjs` and the existing test suite. The manuscript wording/order checksum, all 199 caption matches, all selected media references and all 72 exercise prompts are checked. Browser verification covers desktop landing, mobile reading at 390×844, panel navigation, prompt switching, and saving answers through reload. Media selection is based on source captions; it is not a complete visual review of each video.
