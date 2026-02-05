# No Russian Search Results

A lightweight Chrome/Chromium extension (Manifest V3) that hides Russian-language content and known Russian domains on Google Search result pages.

## What it does

On Google Search pages, the extension scans individual result cards and removes items that match either of these rules:

### 1) Language filter (Russian-specific)
A result card is hidden if its visible text contains Russian-specific Cyrillic letters that are not used in Ukrainian:

- `ы`, `э`, `ё`, `ъ` (including uppercase variants)

This approach avoids hiding Ukrainian content (it does not block generic Cyrillic).

### 2) Domain filter (extra safety)
A result card is hidden if its main destination URL points to:

- blocked TLDs: `.ru`, `.su`, `.by`, `.рф`
- blocked hosts (examples): `vk.com`, `ok.ru`, `mail.ru`, `yandex.ru`, `ria.ru`, `sputniknews.com`, `habr.com`, etc.

The extension also correctly resolves Google redirect links like `/url?q=...` to detect the real destination domain.

### Widgets / suggestion blocks
The same Russian-language detection is applied to common search widgets and suggestion links (e.g., related searches).

## Installation (Load unpacked)

1. Download / clone this repository.
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the folder that contains `manifest.json`.

Open a new Google search page and the filtering will work automatically.

## Files

- `manifest.json` — Manifest V3 config (content script injection)
- `content.js` — Filtering logic (DOM scan + MutationObserver)

## Notes

- This extension is designed for desktop Chrome/Chromium browsers.
- Google changes its DOM structure sometimes. If something stops filtering correctly, update the selectors in `content.js` and reload the extension.

