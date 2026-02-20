#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const COUNTRY_COMPOUND_SECOND_LEVELS = new Set([
  "app",
  "biz",
  "co",
  "com",
  "edu",
  "fm",
  "gov",
  "info",
  "io",
  "me",
  "mil",
  "net",
  "org",
  "tv",
]);

const KNOWN_COMPOUND_COUNTRY_SUFFIXES = new Set([
  "co.ao",
  "co.id",
  "co.il",
  "co.jp",
  "co.ke",
  "co.kr",
  "co.me",
  "co.mz",
  "co.nz",
  "co.rw",
  "co.th",
  "co.tz",
  "co.ug",
  "co.uk",
  "co.za",
  "co.zw",
  "com.ar",
  "com.au",
  "com.br",
  "com.cn",
  "com.co",
  "com.cy",
  "com.do",
  "com.lb",
  "com.my",
  "com.ni",
  "com.sg",
  "com.tn",
  "com.tw",
  "com.uy",
  "com.vn",
]);

const ROOT_DIR = process.cwd();
const DOMAIN_SOURCE_FILE = path.join(ROOT_DIR, "src/lib/beer-domains.ts");
const OUTPUT_DIR = path.join(ROOT_DIR, "public/logos");
const MANIFEST_FILE = path.join(OUTPUT_DIR, "manifest.json");
const REQUEST_TIMEOUT_MS = 12_000;
const PROGRESS_EVERY = 25;

function normalizeDomain(domain) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function normalizeDoubleTldDomain(domain) {
  const parts = domain.split(".").filter(Boolean);
  if (parts.length < 3) return domain;

  const secondLevel = parts[parts.length - 2];
  const countryCode = parts[parts.length - 1];
  const compoundSuffix = `${secondLevel}.${countryCode}`;

  const hasCompoundCountrySuffix =
    /^[a-z]{2}$/.test(countryCode) &&
    COUNTRY_COMPOUND_SECOND_LEVELS.has(secondLevel);

  if (!hasCompoundCountrySuffix) return domain;
  if (KNOWN_COMPOUND_COUNTRY_SUFFIXES.has(compoundSuffix)) return domain;

  parts.pop();
  return parts.join(".");
}

function normalizeLogoDomain(domain) {
  return normalizeDoubleTldDomain(normalizeDomain(domain));
}

function normalizeLogoName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDomainSlug(domain) {
  return normalizeLogoDomain(domain).replace(/[^a-z0-9.-]/g, "-");
}

function getLogoDevUrl(domain, token) {
  const normalizedDomain = normalizeLogoDomain(domain);
  const params = new URLSearchParams({
    token,
    format: "png",
    size: "128",
  });
  return `https://img.logo.dev/${encodeURIComponent(normalizedDomain)}?${params.toString()}`;
}

function getLogoDevNameUrl(name, token) {
  const normalizedName = normalizeLogoName(name);
  const params = new URLSearchParams({
    token,
    format: "png",
    size: "128",
  });
  return `https://img.logo.dev/name/${encodeURIComponent(normalizedName)}?${params.toString()}`;
}

function getFaviconUrl(domain) {
  const normalizedDomain = normalizeLogoDomain(domain);
  const params = new URLSearchParams({
    client: "SOCIAL",
    type: "FAVICON",
    fallback_opts: "TYPE,SIZE,URL",
    url: `https://${normalizedDomain}`,
    size: "128",
  });
  return `https://t2.gstatic.com/faviconV2?${params.toString()}`;
}

function parseArgs(argv) {
  const options = {
    force: false,
    dryRun: false,
    limit: null,
    token: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--token") {
      options.token = argv[i + 1] ?? null;
      i += 1;
      continue;
    }

    if (arg === "--limit") {
      const raw = argv[i + 1] ?? "";
      const parsed = Number.parseInt(raw, 10);
      options.limit = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      i += 1;
      continue;
    }
  }

  return options;
}

function extractObjectBlock(source, objectName) {
  const startToken = `const ${objectName}: Record<string, string> = {`;
  const start = source.indexOf(startToken);
  if (start === -1) {
    throw new Error(`Could not find object declaration for ${objectName}`);
  }

  const openBraceIndex = source.indexOf("{", start);
  let depth = 0;

  for (let i = openBraceIndex; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(openBraceIndex + 1, i);
    }
  }

  throw new Error(`Could not parse object block for ${objectName}`);
}

function extractEntriesFromBlock(block) {
  const entries = [];
  const valueRegex = /"([^"\n]+)"\s*:\s*"([^"\n]+)"/g;

  let match = valueRegex.exec(block);
  while (match) {
    const name = normalizeLogoName(match[1].trim());
    const normalized = normalizeLogoDomain(match[2].trim());

    if (name && normalized.includes(".")) {
      entries.push({ name, domain: normalized });
    }

    match = valueRegex.exec(block);
  }

  return entries;
}

async function listExistingSlugs() {
  try {
    const files = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
    return new Set(
      files
        .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
        .map((entry) => entry.name.replace(/\.png$/, ""))
    );
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return new Set();
    }
    throw error;
  }
}

async function downloadImage(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      contentType,
      reason: `HTTP ${response.status}`,
      bytes: 0,
      buffer: null,
      url,
    };
  }

  if (!contentType.startsWith("image/")) {
    return {
      ok: false,
      status: response.status,
      contentType,
      reason: `Non-image response (${contentType || "unknown content-type"})`,
      bytes: 0,
      buffer: null,
      url,
    };
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) {
    return {
      ok: false,
      status: response.status,
      contentType,
      reason: "Empty image body",
      bytes: 0,
      buffer: null,
      url,
    };
  }

  return {
    ok: true,
    status: response.status,
    contentType,
    reason: null,
    bytes: buffer.length,
    buffer,
    url,
  };
}

async function downloadByDomain(domain, token) {
  const url = getLogoDevUrl(domain, token);
  return downloadImage(url);
}

async function downloadByName(name, token) {
  const url = getLogoDevNameUrl(name, token);
  return downloadImage(url);
}

async function downloadFavicon(domain) {
  const url = getFaviconUrl(domain);
  return downloadImage(url);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const token =
    options.token ||
    process.env.LOGO_DEV_TOKEN ||
    process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN ||
    "";

  if (!token) {
    console.error(
      "Missing token. Set LOGO_DEV_TOKEN (or NEXT_PUBLIC_LOGO_DEV_TOKEN) or pass --token <value>."
    );
    process.exit(1);
  }

  const source = await fs.readFile(DOMAIN_SOURCE_FILE, "utf8");
  const breweryBlock = extractObjectBlock(source, "breweryMap");
  const brandBlock = extractObjectBlock(source, "brandMap");
  const parsedEntries = [
    ...extractEntriesFromBlock(breweryBlock),
    ...extractEntriesFromBlock(brandBlock),
  ];

  const domainToNames = new Map();
  for (const entry of parsedEntries) {
    if (!domainToNames.has(entry.domain)) {
      domainToNames.set(entry.domain, new Set());
    }
    domainToNames.get(entry.domain).add(entry.name);
  }

  const domains = Array.from(domainToNames.keys()).sort();

  const limitedDomains =
    options.limit && options.limit > 0 ? domains.slice(0, options.limit) : domains;

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const existingSlugs = await listExistingSlugs();
  const summary = {
    generatedAt: new Date().toISOString(),
    provider: "logo.dev",
    totalDiscoveredDomains: domains.length,
    processedDomains: limitedDomains.length,
    downloaded: 0,
    skipped: 0,
    failed: 0,
    downloadedBySource: {
      logoDevDomain: 0,
      logoDevName: 0,
      favicon: 0,
    },
    dryRun: options.dryRun,
    force: options.force,
  };

  const failures = [];
  const outputs = [];
  let processedCounter = 0;

  for (const domain of limitedDomains) {
    processedCounter += 1;
    const shouldLogProgress =
      processedCounter % PROGRESS_EVERY === 0 ||
      processedCounter === limitedDomains.length;
    const slug = toDomainSlug(domain);
    const relativePath = `logos/${slug}.png`;
    const filePath = path.join(OUTPUT_DIR, `${slug}.png`);

    if (!options.force && existingSlugs.has(slug)) {
      summary.skipped += 1;
      outputs.push({ domain, path: relativePath, status: "skipped-existing" });
      if (shouldLogProgress) {
        console.log(
          `[${processedCounter}/${limitedDomains.length}] downloaded=${summary.downloaded} skipped=${summary.skipped} failed=${summary.failed}`
        );
      }
      continue;
    }

    if (options.dryRun) {
      summary.downloaded += 1;
      outputs.push({ domain, path: relativePath, status: "dry-run" });
      if (shouldLogProgress) {
        console.log(
          `[${processedCounter}/${limitedDomains.length}] downloaded=${summary.downloaded} skipped=${summary.skipped} failed=${summary.failed}`
        );
      }
      continue;
    }

    try {
      const nameCandidates = Array.from(domainToNames.get(domain) ?? [])
        .map((name) => normalizeLogoName(name))
        .filter((name) => name.length > 0);

      const attempts = [];
      let result = await downloadByDomain(domain, token);
      attempts.push({
        source: "logo.dev/domain",
        status: result.status,
        contentType: result.contentType,
        reason: result.reason,
      });
      let selectedSource = "logo.dev/domain";
      let selectedName = null;

      if (!result.ok || !result.buffer) {
        for (const name of nameCandidates) {
          const nameResult = await downloadByName(name, token);
          attempts.push({
            source: "logo.dev/name",
            name,
            status: nameResult.status,
            contentType: nameResult.contentType,
            reason: nameResult.reason,
          });
          if (nameResult.ok && nameResult.buffer) {
            result = nameResult;
            selectedSource = "logo.dev/name";
            selectedName = name;
            break;
          }
        }
      }

      if (!result.ok || !result.buffer) {
        const faviconResult = await downloadFavicon(domain);
        attempts.push({
          source: "google-favicon",
          status: faviconResult.status,
          contentType: faviconResult.contentType,
          reason: faviconResult.reason,
        });
        if (faviconResult.ok && faviconResult.buffer) {
          result = faviconResult;
          selectedSource = "google-favicon";
        }
      }

      if (!result.ok || !result.buffer) {
        summary.failed += 1;
        failures.push({
          domain,
          status: result.status,
          contentType: result.contentType,
          reason: result.reason,
          attempts,
        });
        outputs.push({ domain, path: relativePath, status: "failed" });
        continue;
      }

      await fs.writeFile(filePath, result.buffer);
      summary.downloaded += 1;
      if (selectedSource === "logo.dev/domain") {
        summary.downloadedBySource.logoDevDomain += 1;
      } else if (selectedSource === "logo.dev/name") {
        summary.downloadedBySource.logoDevName += 1;
      } else if (selectedSource === "google-favicon") {
        summary.downloadedBySource.favicon += 1;
      }

      outputs.push({
        domain,
        path: relativePath,
        status: "downloaded",
        source: selectedSource,
        name: selectedName,
        bytes: result.bytes,
        contentType: result.contentType,
      });
    } catch (error) {
      summary.failed += 1;
      failures.push({
        domain,
        status: 0,
        contentType: "",
        reason: error instanceof Error ? error.message : String(error),
      });
      outputs.push({ domain, path: relativePath, status: "failed" });
    }

    if (shouldLogProgress) {
      console.log(
        `[${processedCounter}/${limitedDomains.length}] downloaded=${summary.downloaded} skipped=${summary.skipped} failed=${summary.failed}`
      );
    }
  }

  const manifest = {
    ...summary,
    failures,
    outputs,
  };

  await fs.writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log("Logo sync finished.");
  console.log(`Domains discovered: ${summary.totalDiscoveredDomains}`);
  console.log(`Domains processed:  ${summary.processedDomains}`);
  console.log(`Downloaded:         ${summary.downloaded}`);
  console.log(
    `  - by source: domain=${summary.downloadedBySource.logoDevDomain}, name=${summary.downloadedBySource.logoDevName}, favicon=${summary.downloadedBySource.favicon}`
  );
  console.log(`Skipped existing:   ${summary.skipped}`);
  console.log(`Failed:             ${summary.failed}`);
  console.log(`Manifest:           ${path.relative(ROOT_DIR, MANIFEST_FILE)}`);

  if (failures.length > 0) {
    console.log("\nTop failures:");
    for (const failure of failures.slice(0, 15)) {
      console.log(
        `- ${failure.domain}: ${failure.reason} (${failure.status}, ${failure.contentType || "n/a"})`
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
