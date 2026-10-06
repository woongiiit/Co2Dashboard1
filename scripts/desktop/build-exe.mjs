#!/usr/bin/env node
/**
 * Next standalone + portable Node 페이로드를 만든 뒤
 * C# 단일 EXE 런처에 임베드하여 release/ 에 출력합니다.
 *
 * 사용: node scripts/desktop/build-exe.mjs
 * 결과: release/관광탄소발자국대시보드.exe
 *
 * 배포본에는 Hugging Face 토큰(.env / data/runtime)을 넣지 않습니다.
 */

import { execFileSync, execSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DESKTOP = path.join(ROOT, "desktop");
const PAYLOAD_DIR = path.join(DESKTOP, "payload");
const CACHE_DIR = path.join(DESKTOP, ".cache");
const RELEASE_DIR = path.join(ROOT, "release");
const LAUNCHER_DIR = path.join(DESKTOP, "Launcher");

const NODE_VERSION = "22.14.0";
const NODE_ZIP_NAME = `node-v${NODE_VERSION}-win-x64.zip`;
const NODE_ZIP_URL = `https://nodejs.org/dist/v${NODE_VERSION}/${NODE_ZIP_NAME}`;

function log(msg) {
  console.log(`[desktop] ${msg}`);
}

function mustExist(p, label) {
  if (!existsSync(p)) throw new Error(`${label} 없음: ${p}`);
}

function rmrf(p) {
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

async function download(url, dest) {
  ensureDir(path.dirname(dest));
  if (existsSync(dest) && statSync(dest).size > 1_000_000) {
    log(`캐시 사용: ${path.basename(dest)}`);
    return;
  }
  log(`다운로드: ${url}`);
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`다운로드 실패 (${res.status}): ${url}`);
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

function expandNodeZip(zipPath, destDir) {
  ensureDir(destDir);
  const extractRoot = mkdtempSync(path.join(tmpdir(), "node-zip-"));
  try {
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${extractRoot.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: "inherit" },
    );
    const entries = readdirSync(extractRoot);
    const folder = entries.find((name) => name.startsWith("node-v"));
    if (!folder) throw new Error("Node zip 구조가 예상과 다릅니다.");
    const nodeExe = path.join(extractRoot, folder, "node.exe");
    mustExist(nodeExe, "node.exe");
    ensureDir(destDir);
    copyFileSync(nodeExe, path.join(destDir, "node.exe"));
  } finally {
    rmrf(extractRoot);
  }
}

function copyJsonTree(srcDir, destDir) {
  ensureDir(destDir);
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const from = path.join(srcDir, entry.name);
    const to = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "archive") continue;
      copyJsonTree(from, to);
      continue;
    }
    // 런타임에 JSON만 필요. 대용량 xlsx는 제외.
    if (entry.name.endsWith(".json") || entry.name === ".gitkeep") {
      copyFileSync(from, to);
    }
  }
}

function writeStartScript(appDir) {
  // Windows CMD — C# 런처가 이 파일을 호출
  const content = `@echo off
setlocal
cd /d "%~dp0"
set HUGGINGFACE_API_KEY=
set TAVILY_API_KEY=
set SERPER_API_KEY=
set PORT=3000
set HOSTNAME=127.0.0.1
".\\runtime\\node.exe" "server.js"
`;
  writeFileSync(path.join(appDir, "start-server.cmd"), content, "utf8");
}

function assemblePayload() {
  log("페이로드 조립…");
  rmrf(PAYLOAD_DIR);
  ensureDir(PAYLOAD_DIR);

  const standalone = path.join(ROOT, ".next", "standalone");
  mustExist(standalone, "Next standalone 출력");

  cpSync(standalone, PAYLOAD_DIR, { recursive: true });

  const staticSrc = path.join(ROOT, ".next", "static");
  const staticDest = path.join(PAYLOAD_DIR, ".next", "static");
  mustExist(staticSrc, ".next/static");
  ensureDir(path.dirname(staticDest));
  cpSync(staticSrc, staticDest, { recursive: true });

  const publicSrc = path.join(ROOT, "public");
  if (existsSync(publicSrc)) {
    cpSync(publicSrc, path.join(PAYLOAD_DIR, "public"), { recursive: true });
  }

  // 데이터 (토큰/런타임 설정·xlsx 제외)
  copyJsonTree(
    path.join(ROOT, "data", "excel"),
    path.join(PAYLOAD_DIR, "data", "excel"),
  );
  // admin-boundary는 번들에 포함되지만 원본도 유지
  const adminJson = path.join(ROOT, "data", "admin-boundary-revisions.json");
  if (existsSync(adminJson)) {
    ensureDir(path.join(PAYLOAD_DIR, "data"));
    copyFileSync(adminJson, path.join(PAYLOAD_DIR, "data", "admin-boundary-revisions.json"));
  }

  // 배포본에 시크릿이 섞이지 않도록 삭제
  for (const name of [".env", ".env.local", ".env.production"]) {
    const p = path.join(PAYLOAD_DIR, name);
    if (existsSync(p)) rmSync(p);
  }
  rmrf(path.join(PAYLOAD_DIR, "data", "runtime"));

  const nodeZip = path.join(CACHE_DIR, NODE_ZIP_NAME);
  return { nodeZip };
}

async function main() {
  ensureDir(CACHE_DIR);
  ensureDir(RELEASE_DIR);

  log("Next.js production 빌드…");
  execSync("npm run build", { cwd: ROOT, stdio: "inherit", env: process.env });

  const { nodeZip } = assemblePayload();
  await download(NODE_ZIP_URL, nodeZip);
  expandNodeZip(nodeZip, path.join(PAYLOAD_DIR, "runtime"));

  writeStartScript(PAYLOAD_DIR);

  // README for extracted folder (users rarely see it)
  writeFileSync(
    path.join(PAYLOAD_DIR, "README.txt"),
    [
      "관광행동 기반 탄소발자국 대시보드 (배포 런타임)",
      "",
      "이 폴더는 실행 파일에 의해 자동으로 사용됩니다.",
      "AI 기능은 메인 화면 우측 상단 [환경 설정]에서",
      "본인 Hugging Face 토큰을 등록한 뒤 사용할 수 있습니다.",
      "",
    ].join("\r\n"),
    "utf8",
  );

  const zipPath = path.join(DESKTOP, "payload.zip");
  rmrf(zipPath);
  log("페이로드 압축…");
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${PAYLOAD_DIR.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: "inherit" },
  );
  mustExist(zipPath, "payload.zip");

  const version = new Date().toISOString();
  writeFileSync(path.join(LAUNCHER_DIR, "payload.version"), version, "utf8");
  const embeddedZip = path.join(LAUNCHER_DIR, "payload.zip");
  copyFileSync(zipPath, embeddedZip);

  log("C# 단일 EXE 게시…");
  const publishDir = path.join(DESKTOP, "publish");
  rmrf(publishDir);
  execSync(
    [
      "dotnet",
      "publish",
      `"${path.join(LAUNCHER_DIR, "Launcher.csproj")}"`,
      "-c",
      "Release",
      "-r",
      "win-x64",
      "--self-contained",
      "true",
      `-p:PublishSingleFile=true`,
      `-p:IncludeNativeLibrariesForSelfExtract=true`,
      `-p:EnableCompressionInSingleFile=true`,
      `-o`,
      `"${publishDir}"`,
    ].join(" "),
    { stdio: "inherit", cwd: ROOT },
  );

  const builtExe = path.join(publishDir, "TourismCarbonDashboard.exe");
  mustExist(builtExe, "게시된 EXE");
  const outExe = path.join(RELEASE_DIR, "관광탄소발자국대시보드.exe");
  copyFileSync(builtExe, outExe);

  writeFileSync(
    path.join(RELEASE_DIR, "사용방법.txt"),
    [
      "관광행동 기반 탄소발자국 대시보드 — 실행 방법",
      "",
      "1. 관광탄소발자국대시보드.exe 를 더블클릭합니다.",
      "2. 잠시 후 브라우저가 열리며 대시보드가 표시됩니다.",
      "3. AI 요약·인사이트를 쓰려면 우측 상단 [환경 설정]에서",
      "   Hugging Face 토큰(hf_…)을 등록하세요.",
      "   토큰 발급: https://huggingface.co/settings/tokens",
      "4. 검은 콘솔 창을 닫으면 대시보드가 종료됩니다.",
      "",
      "※ 인터넷 연결이 필요합니다. (지도·AI)",
      "※ Node.js / Docker 설치는 필요 없습니다.",
      "",
    ].join("\r\n"),
    "utf8",
  );

  const mb = (statSync(outExe).size / (1024 * 1024)).toFixed(1);
  log(`완료: ${outExe} (${mb} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
