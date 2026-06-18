# Contributing to NexusMark

Thanks for your interest in contributing! NexusMark is a small, focused project — contributions that keep it lean and purposeful are most welcome.

---

## Getting Started

### Prerequisites

- Google Chrome (latest stable)
- Basic knowledge of Chrome Extension APIs
- No build tools needed — it's plain HTML, CSS, and ES Module JavaScript

### Local Setup

```bash
git clone https://github.com/yourusername/nexusmark.git
cd nexusmark
```

Then load the extension in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked** → select the `nexusmark/` folder
4. Any file changes are picked up by clicking the reload icon on the extensions page

---

## Project Layout

```
nexusmark/
├── background.js      ← Service worker (hotkey listener)
├── popup/             ← Home screen + capture/annotate screen
├── library/           ← Full-page library view
└── utils/             ← Shared capture + storage helpers
```

Each area is self-contained. Most changes will live entirely within one folder.

---

## How to Contribute

### Reporting Bugs

Open an issue with:
- Chrome version
- What you did, what you expected, what happened
- Console errors if any (right-click extension icon → Inspect popup)

### Suggesting Features

Open an issue with the `enhancement` label. Describe the use case, not just the solution.

### Submitting a Pull Request

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/descriptive-name
   ```
3. Make your changes — keep them focused on one thing
4. Test manually in Chrome with Developer Mode
5. Commit using conventional commits:
   ```
   feat: add tag filter sidebar
   fix: preview modal not closing on Escape
   style: increase card thumbnail height
   docs: update installation steps
   ```
6. Push and open a PR against `main`

---

## Code Style

- **No frameworks, no bundlers.** Vanilla JS with ES Modules only.
- Keep CSS variables in `:root` — don't hardcode colors inline.
- Prefer `async/await` over `.then()` chains.
- Comment non-obvious Chrome API usage with a short explanation.
- Keep files small and single-purpose — follow the existing structure.

---

## What's In Scope

✅ Bug fixes  
✅ Accessibility improvements  
✅ Performance improvements  
✅ Features listed in the Roadmap  
✅ Firefox / cross-browser compatibility  

## What's Out of Scope

❌ External API calls or user accounts  
❌ Build systems / bundlers / frameworks  
❌ Features that require storing data off-device  

---

## Questions?

Open a discussion or issue — happy to help.
