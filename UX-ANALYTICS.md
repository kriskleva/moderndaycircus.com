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

Created event-scoped custom dimensions: UI version (`ui_version`), Journey chapter (`chapter_id`), and Experience surface (`surface`), Media display mode (`media_mode`), and Media kind (`media_kind`). Added Active foreground seconds (`active_seconds`, standard numeric unit). Optional numeric custom metrics: `scene_number`, `scene_count`, `active_seconds` (seconds). Verified browser-history pageviews, automatic form interactions and site search are off. Disabled automatic outbound-click collection to keep raw link URLs out of UX telemetry. Scroll measurement remains enabled. The existing manual pageview implementation remains authoritative.

Configured `ux_chapter_complete` as a key event with no default monetary value. Do not mark every navigation or scene view as success.

## Review each UI release

In Explore, create a funnel: page_view (page location exactly https://moderndaycircus.com/) → ux_chapter_open → ux_scene_engaged → ux_chapter_end → ux_chapter_complete. Use an open funnel separately for readers entering chapters directly. Break down by UI version; compare device category and session source/medium using identical windows and weekdays. Use users reaching each step, not raw event counts, for conversion rates. Scene engagement and chapter completion should be analyzed within matching chapter IDs.

Track homepage-to-reader rate, engaged readers / chapter openers, end reach / chapter openers, explicit completion / chapter openers, reflection use / engaged readers, and users with media/storage errors / chapter openers. Monitor library discovery separately so promoting the journey does not make the archive harder to find.

A rise in completion and engagement with stable error rates is encouraging. A drop alongside media errors suggests a technical issue. More pauses, source opens, sound toggles or reflection use are ambiguous: they may indicate curiosity, deliberate reading or confusion. Short sessions alone do not establish dissatisfaction. Analytics cannot capture sentiment directly; use occasional observed reading sessions and voluntary feedback to investigate friction.

Start with a full two-week baseline and record numerator/denominator, device and acquisition mix with each comparison. With low traffic, extend the observation period and avoid declaring a winner from a few visits. Before/after is observational; use a randomized experiment for a causal claim. Do not add random assignment until a specific hypothesis and sufficient traffic justify it.

Release log: 2026-10-16 — journey-first seasonal homepage measurement begins. Annotation: “UX baseline: journey tracking and UI version introduced.”

## Content breadth, retention and responsiveness

`browsing-analytics.js` observes actual media across desktop grids, detail/carousels, mobile feeds/fullscreen and the journey. `ux_media_impression` requires at least half of the media visible for two continuous seconds; `ux_media_engaged` requires five seconds with media loaded, tab visible, no blocking sheet, and recent activity. Deduplication is by physical Lightroom asset and display mode within a document. Only internal sets use asset IDs/URLs; neither is sent to GA. Grid thumbnail engagement is distinct from reviewing the expanded content.

`seen_count` counts distinct physical assets exposed in this document. `reviewed_count` counts distinct assets with qualified engagement outside the grid. The same image reused across feed and fullscreen does not inflate breadth. `ux_browse_depth` marks 5/10/20/40/80 reviewed assets. Counts reset on a full page load; they are document breadth, not cross-session unique totals. Journey and library document counts must not be summed as session uniques.

`ux_active_time` sends incremental foreground seconds at about 30 active seconds and on exit, pausing after 60 seconds without pointer, keyboard, touch or wheel activity. Idle/background time is excluded. It includes deliberate reading between inputs within that window. `ux_content_open`, `ux_fullscreen_open`, `ux_carousel_change`, `ux_load_more`, `ux_bookmark_use`, `ux_search_use` measure control intent; they do not imply save or navigation success. Native swipe breadth is captured through qualified media visibility, including carousel assets.

`ux_performance` sends bounded numeric LCP (ms), cumulative layout shift (value multiplied by 1000), and worst observed interaction latency (ms). Interaction latency is diagnostic, not the standardized INP percentile. Browser support and visibility affect these observations; they are not a substitute for a dedicated Core Web Vitals library. No exception text, titles, captions, draft/reflection content, search terms or raw links are sent. There is no session replay or keystroke recording.

Recommended scorecard by UI version/device/source: users with qualified media engagement; proportion reaching 5/10/20 reviewed assets; active seconds per engaged visit; content opens after thumbnail exposure; expanded image/video engagement; carousel exploration; returning users (GA built-in); media-error rate; LCP/layout stability/interaction latency. Evaluate depth and active time together with reading/reflection outcomes, not time alone. Automatic recommendations or UI personalization have not been introduced; first collect a stable baseline.

Deployment status: the first UX release was blocked by Netlify account credit allowance on 2026-10-16. GA4 baseline annotation and definitions are saved; collection begins only after a successful analytics deploy. Treat the first verified successful collection date as the measurement baseline start, while the current design remains the design baseline.
