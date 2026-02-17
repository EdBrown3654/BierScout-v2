import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));

const type = (args.type || "image").toLowerCase();
const size = args.size || "1024x1024";
const name = args.name || "asset";
const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const imgRoot = path.resolve(
  process.cwd(),
  process.env.DESIGN_OUTPUT_ROOT || "public/assets/img"
);
const dryRun = Boolean(args["dry-run"]);

const prompt = resolvePrompt(args);
if (!prompt) {
  console.error("Missing prompt. Use --prompt \"...\" or --prompt-file <path>.");
  process.exit(1);
}

const typeFolderCandidates = {
  logo: ["logos", "logo", "svg"],
  icon: ["icons", "icon", "svg"],
  image: ["images", "image", "b2b", "trust"],
  hero: ["heroes", "hero", "b2b"],
  social: ["social", "socials", "b2b"],
};

const typeFolderDefaults = {
  logo: "logos",
  icon: "icons",
  image: "images",
  hero: "heroes",
  social: "social",
};

if (!typeFolderDefaults[type]) {
  console.error(
    `Unsupported type \"${type}\". Use one of: ${Object.keys(typeFolderDefaults).join(", ")}`
  );
  process.exit(1);
}

ensureDirectory(imgRoot);

const resolvedFolder = resolveAssetFolder({
  type,
  imgRoot,
  preferredFolder: args.folder,
  typeFolderCandidates,
  typeFolderDefaults,
});

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const baseName = `${timestamp}-${slugify(name)}`;
const assetDirectory = path.join(imgRoot, resolvedFolder);
const imagePath = path.join(assetDirectory, `${baseName}.png`);
const promptPath = path.join(assetDirectory, `${baseName}.prompt.txt`);
const manifestPath = path.join(assetDirectory, `${baseName}.manifest.json`);

let imageBuffer;
if (dryRun) {
  // 1x1 PNG placeholder for pipeline checks without API calls.
  imageBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X3f0AAAAASUVORK5CYII=",
    "base64"
  );
} else {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY environment variable.");
    process.exit(1);
  }

  imageBuffer = await generateImageBuffer({ model, prompt, size, apiKey });
}

fs.writeFileSync(imagePath, imageBuffer);
fs.writeFileSync(promptPath, `${prompt.trim()}\n`);

const manifest = {
  generatedAt: new Date().toISOString(),
  type,
  model,
  size,
  name,
  dryRun,
  folder: resolvedFolder,
  prompt,
  output: {
    image: toPosixRelative(process.cwd(), imagePath),
    prompt: toPosixRelative(process.cwd(), promptPath),
    manifest: toPosixRelative(process.cwd(), manifestPath),
  },
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

process.stdout.write("Design asset generated.\n");
process.stdout.write(`- Folder: public/assets/img/${resolvedFolder}\n`);
process.stdout.write(`- Image: ${manifest.output.image}\n`);
process.stdout.write(`- Prompt: ${manifest.output.prompt}\n`);
process.stdout.write(`- Manifest: ${manifest.output.manifest}\n`);

async function generateImageBuffer({ model, prompt, size, apiKey }) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      size,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || "Image generation failed.";
    throw new Error(message);
  }

  const imageData = payload?.data?.[0];
  if (imageData?.b64_json) {
    return Buffer.from(imageData.b64_json, "base64");
  }

  if (imageData?.url) {
    const imageResponse = await fetch(imageData.url);
    if (!imageResponse.ok) {
      throw new Error("Failed to download generated image URL.");
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("No image data received from API.");
}

function resolvePrompt(parsedArgs) {
  if (parsedArgs.prompt) {
    return String(parsedArgs.prompt).trim();
  }

  if (parsedArgs["prompt-file"]) {
    const promptPath = path.resolve(process.cwd(), String(parsedArgs["prompt-file"]));
    if (!fs.existsSync(promptPath)) {
      console.error(`Prompt file not found: ${promptPath}`);
      process.exit(1);
    }

    return fs.readFileSync(promptPath, "utf8").trim();
  }

  return "";
}

function resolveAssetFolder({
  type,
  imgRoot,
  preferredFolder,
  typeFolderCandidates,
  typeFolderDefaults,
}) {
  if (preferredFolder) {
    const folder = sanitizeSingleLevelFolder(preferredFolder);
    const folderPath = path.join(imgRoot, folder);
    ensureDirectory(folderPath);
    return folder;
  }

  const candidates = typeFolderCandidates[type] || [];
  for (const candidate of candidates) {
    const folder = sanitizeSingleLevelFolder(candidate);
    const folderPath = path.join(imgRoot, folder);
    if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
      return folder;
    }
  }

  const fallbackFolder = sanitizeSingleLevelFolder(typeFolderDefaults[type]);
  ensureDirectory(path.join(imgRoot, fallbackFolder));
  return fallbackFolder;
}

function sanitizeSingleLevelFolder(value) {
  const normalized = String(value).trim().replace(/\\/g, "/");
  if (!normalized || normalized.includes("/")) {
    console.error(
      `Invalid folder \"${value}\". Use a single folder name like \"logos\".`
    );
    process.exit(1);
  }

  return slugify(normalized);
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "asset";
}

function parseArgs(rawArgs) {
  const parsed = {};

  for (let i = 0; i < rawArgs.length; i += 1) {
    const arg = rawArgs[i];

    if (!arg.startsWith("--")) {
      continue;
    }

    const key = arg.slice(2);
    const next = rawArgs[i + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    i += 1;
  }

  return parsed;
}

function toPosixRelative(baseDir, absolutePath) {
  const relative = path.relative(baseDir, absolutePath);
  return relative.split(path.sep).join(path.posix.sep);
}
