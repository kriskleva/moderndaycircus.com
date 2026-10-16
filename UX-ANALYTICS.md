# UX measurement

GA4 property: ModernDayCircus (558463694), measurement ID G-RY0NMHYXT8.

The shared `web/ux.js` sets `ui_version` on events. Update its release label for every meaningful UI release, keeping event definitions stable. This release establishes `becoming-seasonal-2026-10-16-v1`; all earlier designs are prototypes and are excluded from the baseline. The current published design is the starting point for future improvements.

## Signals

- Discovery: `ux_journey_enter`, `ux_journey_resume`, `ux_timeline_open`, `ux_world_open`, `ux_library_open`.
- Reading: `ux_chapter_open`, `ux_scene_view`, `ux_scene_engaged`, `ux_chapter_end`. Engagement means the scene stayed visible for ten uninterrupted seconds, with no sheet open. It is a proxy for attention, not proof of reading. Each chapter/scene engagement is emitted once per page lifetime. Reaching the end does not mark a chapter read.
- Intent: `ux_source_open`, `ux_reflection_open`, `ux_reflection_saved`, `ux_chapter_complete`, `ux_chapter_reset`. Reflection saved means a nonempty answer successfully saved locally; no text, prompt answer length or content is sent. A completed chapter is an explicit user action.
- Controls: `ux_chapter_navigation`, `ux_text_hide`, `ux_text_show`, `ux_sound_on`, `ux_sound_off`, `ux_video_play`, `ux_video_pause` (manual control use).
- Friction: `ux_media_error`, `ux_storage_error`, `ux_chapter_error`, `ux_journey_error`. Errors contain no raw exception, URL, user text or asset ID.

Only allowlisted event names and parameters are accepted. `chapter_id` is chapter-01 through chapter-24; scene numbers/counts are numeric. Preview/local hosts send nothing. Journey pageviews are chapter-level, deduplicated across scene/hash changes. The reader does not wrap browser history with analytics hooks.

## GA4 setup

Created event-scoped custom dimensions: UI version (`ui_version`), Journey chapter (`chapter_id`), and Experience surface (`surface`). Optional numeric custom metrics: `scene_number`, `scene_count`, `active_seconds` (seconds). Verified browser-history pageviews, automatic form interactions and site search are off. Disabled automatic outbound-click collection to keep raw link URLs out of UX telemetry. Scroll measurement remains enabled. The existing manual pageview implementation remains authoritative.

Mark only `ux_chapter_complete` as a key event to start. Do not mark every navigation or scene view as success.

## Review each UI release

In Explore, create a funnel: page_view (page location exactly https://moderndaycircus.com/) → ux_chapter_open → ux_scene_engaged → ux_chapter_end → ux_chapter_complete. Use an open funnel separately for readers entering chapters directly. Break down by UI version; compare device category and session source/medium using identical windows and weekdays. Use users reaching each step, not raw event counts, for conversion rates. Scene engagement and chapter completion should be analyzed within matching chapter IDs.

Track homepage-to-reader rate, engaged readers / chapter openers, end reach / chapter openers, explicit completion / chapter openers, reflection use / engaged readers, and users with media/storage errors / chapter openers. Monitor library discovery separately so promoting the journey does not make the archive harder to find.

A rise in completion and engagement with stable error rates is encouraging. A drop alongside media errors suggests a technical issue. More pauses, source opens, sound toggles or reflection use are ambiguous: they may indicate curiosity, deliberate reading or confusion. Short sessions alone do not establish dissatisfaction. Analytics cannot capture sentiment directly; use occasional observed reading sessions and voluntary feedback to investigate friction.

Start with a full two-week baseline and record numerator/denominator, device and acquisition mix with each comparison. With low traffic, extend the observation period and avoid declaring a winner from a few visits. Before/after is observational; use a randomized experiment for a causal claim. Do not add random assignment until a specific hypothesis and sufficient traffic justify it.

Release log: 2026-10-16 — journey-first seasonal homepage measurement begins. Annotation: “UX baseline: journey tracking and UI version introduced.”
