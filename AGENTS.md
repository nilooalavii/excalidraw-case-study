# AGENTS.md

This is a person's own copy of a trimmed Excalidraw, made for the AI-First Design Workshop (UXPA Seattle). They use it to practice designing with agents. Read this before you change anything.

## Ground rules

- **This repo belongs to the person you're working with.** Branches, commits, pull requests and GitHub Pages all go to their repo (`origin`). Never push to, open issues or pull requests on, or comment on `excalidraw/excalidraw` or any other repo.
- **Keep the MIT license** (`LICENSE`) and the credit line in `README.md`.
- **No analytics, tracking, error reporting or calls to outside services.** Fonts and images ship with the app.
- **Small, reviewable commits** with plain messages. Don't add dependencies unless the person asks.
- **Commit before starting parallel sessions.** New worktrees start from the last commit, not from uncommitted changes.

## Run it

- **Windows PowerShell:** type `npm.cmd` wherever this file says `npm`: `npm.cmd ci`, `npm.cmd start`, `npm.cmd run build`. PowerShell may block `npm.ps1`.
- Install: `npm ci`.
- Start: `npm start`. It uses the first free port from 3000 up, prints the URL and writes it to `.workshop/server.json` (`url`, `reviewUrl`, `port`, `pid`). Read that file to find the running app, and open the URL in the integrated browser. Leave the server running; it updates the page when you save.
- After a hard stop, `.workshop/server.json` can point to a server that's gone. Check that its URL answers before you use it. If it doesn't, run `npm start` again: it replaces the stale file, and if the server in it is still running, it just prints that URL.
- If `node_modules` is missing, `npm start` sets it up first: in a worktree it links the main checkout's packages, otherwise it runs `npm ci`. Never run `npm ci` or `npm install` in a worktree.
- Check types: `npm run typecheck`. There are no unit tests. Test in the browser.
- Build: `npm run build` writes `dist/`. Serve it: `npm run preview` (URL in `.workshop/preview.json`).

## Test in the browser

- Pick a tool with its key (R rectangle, D diamond, O ellipse, A arrow, L line, P draw, T text, N sticky note, V select), then press, drag and release on the canvas.
- The scene is saved in the browser's localStorage. The `excalidraw` key holds the elements as JSON, which is handy for checking what got drawn.
- Check the browser console for errors after each change.

## Where things are

| What | Where |
| --- | --- |
| The toolbar at the top | `packages/excalidraw/components/Toolbar.tsx` |
| Tool buttons, names, icons and shortcuts | `packages/excalidraw/components/Tools.tsx` |
| The phone toolbar | `packages/excalidraw/components/MobileToolbar.tsx` |
| The editor itself (pointer events, drawing) | `packages/excalidraw/components/App.tsx` |
| Icons | `packages/excalidraw/components/icons.tsx` |
| Words in the UI | `packages/excalidraw/locales/en.json` |
| Menu, welcome screen and saving | `excalidraw-app/` |
| Toolbar variations | `src/workshop/toolbars/` |
| The page for everyone | `review/` |
| Fictional practice docs (brief, PM follow-up, research) | `workshop/` |

## Toolbar variations

Each variation is one file: `src/workshop/toolbars/<slug>.tsx`. The slug is the file name, lowercase with dashes (for example `minimal`, `playful`, `dense`, `touch`). New files are picked up on their own, even while the server runs.

- Export `meta` (`{ name, idea }`) and a default React component. The component gets `ToolbarProps` from `../types`:
  - `tools`: every tool, with `label`, `icon`, `shortcut` (like "R or 2"), `keyHint`, `active`, `disabled`, `group` ("main" or "more") and `select()`
  - `locked` and `toggleLock()`: keep the tool picked after drawing
  - `renderHint()`: the hint Excalidraw shows while drawing
  - `renderDefault()`: Excalidraw's own toolbar
  - `openLibrary()`, `openCommandPalette()`, `undo()`, `redo()`
  - `formFactor`, `app` and `appState`, for anything else
- `src/workshop/toolbars/original.tsx` is Excalidraw's toolbar. Copy it as a starting point, or build your own buttons from `tools`.
- Put styles in `src/workshop/toolbars/<slug>.css`, import it from your file, and scope every rule under a class named after the slug (like `.toolbar-playful`) so variations don't affect each other.
- **Only add your own files:** `src/workshop/toolbars/<slug>.tsx`, an optional `<slug>.css` next to it, and the screenshot `review/shots/<slug>.png`. In a variation branch, don't edit `src/workshop/index.tsx`, `types.ts`, `default-toolbar.ts`, `review/review.json`, other variations or Excalidraw's toolbar code. That way the branches merge without conflicts.
- Try one: add `?toolbar=<slug>` to the app's URL. With more than one variation, a switcher pill shows at the bottom, and `[` and `]` switch too. `?lab=0` hides the pill.
- Check each variation at 1280 by 800 and at 1440 by 900. It should fit without wrapping and not cover the canvas, the welcome screen's hints or the lab pill.
- The default is one line in `src/workshop/default-toolbar.ts`.
- If a variation crashes, the app shows Excalidraw's toolbar instead and logs the error in the console.
- Variations replace the toolbar on desktop and tablet layouts. Phones keep Excalidraw's phone toolbar.

## Parallel sessions

- **Commit first.** New worktrees start from the last commit, so commit the quick change and any fixes before the sessions start.
- **One worktree and branch per session.** Each one adds only its own files (see above).
- **No second install.** Worktrees share the main checkout's `node_modules` through a link:
  - VS Code makes the link when it creates a worktree (`git.worktreeSymlinkFolders` in `.vscode/settings.json`).
  - If there's no `node_modules`, `npm start` makes the link on its first run (a symlink on Mac and Linux, a junction on Windows).
  - Never run `npm ci` or `npm install` in a worktree.
- **Each session runs its own server.** `npm start` in a worktree takes the next free port and writes that worktree's `.workshop/server.json`. Open its URL with `?toolbar=<slug>`.
- **The lab.** When they're done, merge every variation branch into the orchestrator's branch, for example `git merge <branch-1> <branch-2> <branch-3> <branch-4>`. Each one added only its own files, so nothing conflicts. The main checkout's server picks up the new files without a restart: open it and press `[` and `]`, or use the pill. Then stop the variations' servers (Ctrl+C) to free memory.
- Fill in `review/review.json` once, on the orchestrator's branch, after the merge.

## The page for everyone

`review/index.html` shows what's in `review/review.json`. Fill in the JSON; you don't need to touch the HTML, CSS or script. `review/review.example.json` has every field filled in:

- `title`, `summary`, `updated`
- `favorite`: the slug of the pick
- `variations`: `slug`, `name`, `idea`, `screenshot`, and optional `why` and `link`. Links default to `../?toolbar=<slug>`.
- `video`: `src`, and optional `captions`, `poster` and `title`
- `pr`: `url`, `title`, `number`, `status`

- **Screenshots:** one per variation, saved as `review/shots/<slug>.png`. Take every shot at 1280 by 800 in the same state, so they compare side by side: a fresh page with an empty canvas, the welcome screen showing and the selection tool picked. Each variation's `screenshot` in `review/review.json` is that path relative to `review/`, like `shots/minimal.png`, and the page reads it from there.
- **Video:** `review/demo.mp4` (under 25 MB), with captions in `review/demo.vtt`.
- The page is at `/review/` on the dev server and on the live site. Its look is in `review/theme.css`.

## GitHub Pages

- `.github/workflows/pages.yml` builds the app and publishes it on every push to `main`, and on manual runs (`gh workflow run pages.yml`).
- Pages has to be set to GitHub Actions once per repo (the workflow can't do it):
  `gh api -X POST repos/{owner}/{repo}/pages -f build_type=workflow`
  If Pages already exists, use `-X PUT` instead. Check it with `gh api repos/{owner}/{repo}/pages`.
- The live app is at `https://<owner>.github.io/<repo>/` and the page for everyone at `.../review/`. The first deploy takes a minute or two.
- The build uses `/<repo>/` as its base path in GitHub Actions on its own. To try that locally, set `BASE_PATH` for the build and the preview:
  - Mac and Linux: `BASE_PATH=/excalidraw-case-study/ npm run build`, then `BASE_PATH=/excalidraw-case-study/ npm run preview`
  - Windows PowerShell: `$env:BASE_PATH='/excalidraw-case-study/'; npm.cmd run build`, then `npm.cmd run preview`. Clear it afterward with `Remove-Item Env:BASE_PATH`.
  - Not in Git Bash on Windows, which rewrites the path.
- `.github/workflows/check.yml` is a manual install check on Mac, Windows and Linux. You don't need it.

## Code conventions from Excalidraw

- For new DOM or browser APIs, use `app.ownerDocument` and `app.ownerWindow` instead of globals.
- When overriding properties of an existing type, prefer `Merge<Base, Overrides>` from `@excalidraw/common/utility-types`.
