import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import type { Plugin } from "vite";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "..");
const reviewDir = path.join(repoRoot, "review");

/**
 * The URL path the site is served from. GitHub Pages serves a project site
 * from /<repo-name>/, so builds in GitHub Actions use that. Set BASE_PATH to
 * override it (the Pages workflow does). Local builds use "/".
 */
const getBasePath = () => {
  let base = process.env.BASE_PATH?.trim();

  // Git Bash on Windows turns "/name/" into "C:/Program Files/Git/name/"
  if (base && /^[A-Za-z]:[\\/]/.test(base)) {
    base = path.basename(base);
  }

  if (!base) {
    const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
    if (process.env.GITHUB_ACTIONS === "true" && repo) {
      base = repo.toLowerCase().endsWith(".github.io") ? "/" : repo;
    }
  }

  if (!base || base === "/") {
    return "/";
  }
  return `/${base.replace(/^\/+|\/+$/g, "")}/`;
};

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".vtt": "text/vtt; charset=utf-8",
};

/**
 * The page for everyone lives in the top-level review/ folder. This serves it
 * at /review/ while you develop and copies it into the build.
 */
const reviewPage = (): Plugin => ({
  name: "workshop-review-page",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url || "/", "http://localhost");
      if (url.pathname === "/review") {
        res.statusCode = 301;
        res.setHeader("Location", `/review/${url.search}`);
        res.end();
        return;
      }
      if (!url.pathname.startsWith("/review/")) {
        next();
        return;
      }
      let file = path.join(
        reviewDir,
        decodeURIComponent(url.pathname.slice("/review/".length)),
      );
      if (!file.startsWith(reviewDir)) {
        res.statusCode = 403;
        res.end();
        return;
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, "index.html");
      }
      if (!fs.existsSync(file)) {
        next();
        return;
      }
      res.setHeader(
        "Content-Type",
        CONTENT_TYPES[path.extname(file).toLowerCase()] ||
          "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-store");
      fs.createReadStream(file).pipe(res);
    });
  },
  writeBundle(options) {
    if (options.dir && fs.existsSync(reviewDir)) {
      fs.cpSync(reviewDir, path.join(options.dir, "review"), {
        recursive: true,
      });
    }
  },
});

/**
 * Vite only watches files it has already loaded from outside the app folder.
 * Watch src/ too, so a new variation file shows up without a restart.
 */
const watchWorkshopFolder = (): Plugin => ({
  name: "workshop-watch-src",
  configureServer(server) {
    server.watcher.add(path.join(repoRoot, "src"));
  },
});

/** In a git worktree, node_modules may be a link to the main checkout. */
const realNodeModules = () => {
  try {
    return fs.realpathSync(path.join(repoRoot, "node_modules"));
  } catch {
    return path.join(repoRoot, "node_modules");
  }
};

const alias = (name: string, target: string) => [
  {
    find: new RegExp(`^@excalidraw/${name}$`),
    replacement: path.resolve(repoRoot, target),
  },
  {
    find: new RegExp(`^@excalidraw/${name}/(.*?)`),
    replacement: path.resolve(repoRoot, path.dirname(target), "$1"),
  },
];

export default defineConfig(({ command, isPreview }) => ({
  root: appDir,
  base: command === "build" || isPreview ? getBasePath() : "/",
  publicDir: path.join(repoRoot, "public"),
  // one cache per checkout, so several worktrees can run at once
  cacheDir: path.join(repoRoot, ".workshop", "vite"),
  envDir: repoRoot,
  server: {
    host: "127.0.0.1",
    open: false,
    fs: {
      allow: [repoRoot, realNodeModules()],
    },
  },
  preview: {
    host: "127.0.0.1",
    open: false,
  },
  resolve: {
    alias: [
      ...alias("common", "packages/common/src/index.ts"),
      ...alias("element", "packages/element/src/index.ts"),
      ...alias("excalidraw", "packages/excalidraw/index.tsx"),
      ...alias("math", "packages/math/src/index.ts"),
      ...alias("utils", "packages/utils/src/index.ts"),
      ...alias("fractional-indexing", "packages/fractional-indexing/src/index.ts"),
      ...alias("laser-pointer", "packages/laser-pointer/src/index.ts"),
    ],
  },
  build: {
    outDir: path.join(repoRoot, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    // don't inline small assets, so fonts stay files on this site
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        assetFileNames(chunkInfo) {
          if (chunkInfo?.name?.endsWith(".woff2")) {
            const family = chunkInfo.name.split("-")[0];
            return `fonts/${family}/[name][extname]`;
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  plugins: [
    // skip Vite's pre-bundled packages in .workshop/vite (they'd otherwise go
    // through Babel, since the cache isn't under node_modules)
    react({ exclude: /[\\/]\.workshop[\\/]/ }),
    reviewPage(),
    watchWorkshopFolder(),
  ],
}));
