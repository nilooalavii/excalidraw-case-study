# Excalidraw case study

A trimmed copy of Excalidraw for the AI-First Design Workshop (UXPA Seattle).

People make their own copy of this repo, run it on their laptop, redesign its toolbar with agents, build four toolbar variations at once and ship their favorite with a pull request, a demo video and a live page on GitHub Pages.

Based on Excalidraw (MIT). Not affiliated with the Excalidraw team.

## Run it

You need Node.js 22 or newer and Git.

```sh
npm ci
npm start
```

`npm start` prints the local URL (the first free port from 3000 up) and saves it in `.workshop/server.json`. On Windows PowerShell, type `npm.cmd` instead of `npm`.

Other scripts:

- `npm run build` builds the site into `dist/`
- `npm run preview` serves that build
- `npm run typecheck` checks the TypeScript

## What's different from Excalidraw

Removed:

- live collaboration
- AI features (text to diagram, wireframe to code and the magic frame)
- share links and cloud storage (Firebase)
- Excalidraw+ links, promos and sign-in
- error reporting and analytics
- Mermaid
- the offline app install (PWA and service worker)
- other languages (English only) and the large Chinese, Japanese and Korean hand-drawn font
- the upstream tests, lint, build and release tooling, and Yarn

Kept: the drawing tools and shapes, undo and redo, the command palette, the shape library, saving in your browser, opening and saving files, and PNG and SVG export. Fonts ship with the app, so it makes no requests to outside services.

Added for the workshop:

- `src/workshop/`: a slot for toolbar variations, picked with `?toolbar=<name>`
- `review/`: a page for everyone with the variations, a demo video and the pull request
- `workshop/`: fictional practice material (a user testing brief, a PM follow-up and practice research)
- `.github/workflows/pages.yml`: publishes the app to GitHub Pages
- `AGENTS.md`: how agents should work in this repo

## Upstream

This is a snapshot of [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) at commit [`d732d4f3d50e6ac092ec6e86a4e04a40546a9395`](https://github.com/excalidraw/excalidraw/commit/d732d4f3d50e6ac092ec6e86a4e04a40546a9395) (November 18, 2026), with the changes above. It doesn't track upstream.

## License

MIT, like Excalidraw. See [LICENSE](LICENSE). The fonts in `packages/excalidraw/fonts` keep their own licenses.
