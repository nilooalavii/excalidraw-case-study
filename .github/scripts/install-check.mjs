// Used by .github/workflows/check.yml. Measures a clean install, then checks
// that the type check, the build, the dev server and the preview all work.
// Writes install-check.json and a summary for the Actions run page.
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const isWindows = process.platform === "win32";
const npm = isWindows ? "npm.cmd" : "npm";
const label = process.env.CHECK_LABEL || `${process.platform}-node${process.version}`;
const cacheDir = path.join(root, ".workshop", "check-npm-cache");
const result = {
  label,
  os: process.platform,
  arch: process.arch,
  node: process.version,
  npm: spawnSync(npm, ["--version"], { shell: isWindows, encoding: "utf8" }).stdout.trim(),
  steps: {},
  ok: false,
};

const mb = (bytes) => Math.round((bytes / 1e6) * 10) / 10;

const dirSize = (dir) => {
  let bytes = 0;
  let files = 0;
  const walk = (current) => {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        continue;
      }
      if (entry.isDirectory()) {
        walk(full);
      } else {
        bytes += fs.statSync(full).size;
        files += 1;
      }
    }
  };
  walk(dir);
  return { mb: mb(bytes), files };
};

const timed = (name, args) => {
  const started = Date.now();
  const run = spawnSync(npm, args, { cwd: root, stdio: "inherit", shell: isWindows });
  const seconds = Math.round((Date.now() - started) / 100) / 10;
  result.steps[name] = { seconds, ok: run.status === 0 };
  if (run.status !== 0) {
    throw new Error(`npm ${args.join(" ")} failed`);
  }
  return seconds;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchText = async (url) => {
  const response = await fetch(url);
  return { status: response.status, text: await response.text() };
};

const stopProcess = (child) => {
  if (isWindows) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
  } else {
    child.kill("SIGTERM");
  }
};

const smoke = async (name, args, infoName, checks) => {
  const infoFile = path.join(root, ".workshop", infoName);
  fs.rmSync(infoFile, { force: true });
  const started = Date.now();
  const child = spawn(process.execPath, ["scripts/serve.mjs", ...args], {
    cwd: root,
    stdio: "inherit",
  });
  try {
    let info = null;
    for (let i = 0; i < 120 && !info; i++) {
      await sleep(500);
      if (fs.existsSync(infoFile)) {
        info = JSON.parse(fs.readFileSync(infoFile, "utf8"));
      }
    }
    if (!info) {
      throw new Error(`${name}: no ${infoName} after 60 seconds`);
    }
    const outcomes = {};
    for (const [checkName, [urlPath, expected]] of Object.entries(checks)) {
      const { status, text } = await fetchText(new URL(urlPath, info.url).href);
      outcomes[checkName] = status === 200 && text.includes(expected);
    }
    result.steps[name] = {
      seconds: Math.round((Date.now() - started) / 100) / 10,
      url: info.url,
      checks: outcomes,
      ok: Object.values(outcomes).every(Boolean),
    };
    if (!result.steps[name].ok) {
      throw new Error(`${name}: ${JSON.stringify(outcomes)}`);
    }
  } finally {
    stopProcess(child);
  }
};

const main = async () => {
  result.cloneMB = dirSize(path.join(root, ".git")).mb;
  result.repoMB = dirSize(root).mb;

  fs.rmSync(cacheDir, { recursive: true, force: true });
  result.installSeconds = timed("npm ci", ["ci", "--cache", cacheDir, "--prefer-online"]);
  result.downloadMB = dirSize(cacheDir).mb;
  const nodeModules = dirSize(path.join(root, "node_modules"));
  result.nodeModulesMB = nodeModules.mb;
  result.nodeModulesFiles = nodeModules.files;
  fs.rmSync(cacheDir, { recursive: true, force: true });

  timed("typecheck", ["run", "typecheck"]);
  result.buildSeconds = timed("build", ["run", "build"]);
  result.distMB = dirSize(path.join(root, "dist")).mb;

  await smoke("dev server", [], "server.json", {
    page: ["./", '<div id="root">'],
    "app code compiles": ["./index.tsx", "ExcalidrawApp"],
    "review page": ["./review/", "review.js"],
    "review data": ["./review/review.json", "variations"],
  });
  await smoke("preview", ["--preview"], "preview.json", {
    page: ["./", '<div id="root">'],
    "review page": ["./review/", "review.js"],
  });

  result.diskMB = mb((result.repoMB + result.nodeModulesMB) * 1e6);
  result.ok = true;
};

try {
  await main();
} catch (error) {
  result.error = String(error?.message || error);
  console.error(error);
}

fs.writeFileSync(path.join(root, "install-check.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = [
    ["Result", result.ok ? "passed" : `failed: ${result.error}`],
    ["Node / npm", `${result.node} / ${result.npm}`],
    ["Clone (.git)", `${result.cloneMB} MB`],
    ["Download (npm cache)", `${result.downloadMB} MB`],
    ["node_modules", `${result.nodeModulesMB} MB, ${result.nodeModulesFiles} files`],
    ["Install time", `${result.installSeconds} s`],
    ["Build time", `${result.buildSeconds} s`],
  ];
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### ${label}\n\n| | |\n| --- | --- |\n${rows.map(([a, b]) => `| ${a} | ${b} |`).join("\n")}\n\n`,
  );
}

process.exit(result.ok ? 0 : 1);
