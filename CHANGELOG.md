# Changelog

All notable changes to NexusMark are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.1.0] — 2026-06-19

### Added
- **Interactive home popup** — clicking the toolbar icon now opens a dashboard instead of auto-capturing
- **Manual Capture button** — trigger a screenshot on demand from the popup
- **Set Hotkey tile** — one-click shortcut to `chrome://extensions/shortcuts`
- **Live hotkey display** — the current shortcut is read from the Chrome commands API and shown in the popup
- **Save Folder setting** — set a custom subfolder name within Downloads, persisted across sessions
- **Open Library tile** — quick-access button in the home popup
- **Screenshot preview modal** in the library — click any card thumbnail to open a full-resolution lightbox
- **Thumbnail hover overlay** with "⊕ PREVIEW" hint on card images
- **Keyboard shortcut** to close the preview modal (`Escape`)
- **Catppuccin Mocha** inspired library theme — vastly improved color contrast and readability
- Extension icons (`icon16.png`, `icon48.png`, `icon128.png`) wired into `manifest.json`

### Changed
- Capture/annotate UI moved to `capture.html` / `capture.js` (separated from the home popup)
- Library card thumbnails increased from `110px` to `160px` height
- Library card grid minimum column width increased from `220px` to `280px`
- Base font size bumped from `13px` to `14px`
- URL color changed to `#89b4fa` (blue) — matches browser link conventions
- Timestamp color changed to `#94e2d5` (teal) — visually distinct
- Tag pill color changed to `#f9e2af` (yellow) — matches code-editor label conventions
- Delete button now uses red (`#f38ba8`) on hover — clearer destructive action signal
- Added `downloads` permission to manifest (reserved for future export feature)

### Fixed
- Library no longer shows a blank screen when opened from the capture flow

---

## [1.0.0] — 2026-06-18

### Added
- Initial release
- `Ctrl+Shift+S` / `Cmd+Shift+S` keyboard shortcut to capture active tab
- Annotate captures with title, note, and tags before saving
- Local library stored in `chrome.storage.local`
- Search across title, URL, note, and tags
- Visit and delete actions per entry
- Service worker background script for hotkey handling
- Dark UI theme with `Share Tech Mono` + `Inter` fonts
