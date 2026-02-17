import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { spawn, spawnSync } from "node:child_process";
import { stdin as input, stdout as output } from "node:process";

const root = path.resolve(".");
const specializationPath = path.join(root, ".docs/project/specialization.md");
const brandPath = path.join(root, ".docs/project/brand.md");

if (!fs.existsSync(specializationPath)) {
  console.error("Missing file: .docs/project/specialization.md");
  process.exit(1);
}

const rl = readline.createInterface({ input, output });

const ask = async (label, example) => {
  const suffix = example ? ` (e.g. ${example})` : "";
  while (true) {
    const answer = (await rl.question(`${label}${suffix}: `)).trim();
    if (answer.length > 0) return answer;
    console.log("Please provide a value.");
  }
};

const askYesNo = async (label) => {
  while (true) {
    const answer = (await rl.question(`${label} (y/N): `)).trim().toLowerCase();
    if (answer === "" || answer === "n" || answer === "no") return false;
    if (answer === "y" || answer === "yes") return true;
    console.log("Please answer with y or n.");
  }
};

const replacePlaceholder = (content, placeholder, value) => {
  const token = `<${placeholder}>`;
  if (!content.includes(token)) return content;
  return content.split(token).join(value);
};

const runCommand = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
    });
  });

const run = async () => {
  console.log("\nProject specialization setup\n");

  const answers = {
    PROJECT_NAME: await ask("Project name", "Acme Ops"),
    PROJECT_DOMAIN: await ask("Domain", "b2b SaaS for operations"),
    PRIMARY_BUSINESS_GOAL: await ask("Primary business goal", "reduce onboarding time"),
    TARGET_USERS: await ask("Target users", "operations managers at mid-size companies"),
    PRIMARY_API_OR_BACKEND: await ask("Data/API source", "existing REST API"),
    AUTH_MODEL: await ask("Authentication model", "email/password + SSO"),
    DEPLOYMENT_TARGET: await ask("Deployment target", "Vercel"),
    ENV_STRATEGY: await ask("Environment strategy", "dev/stage/prod with feature flags"),
    CORE_ENTITIES: await ask("Core entities", "User, Workspace, Task"),
    CORE_USER_FLOWS: await ask("Core user flows", "signup -> create workspace -> add tasks"),
    NON_GOALS: await ask("Non-goals (initial)", "mobile app, offline mode"),
    PERFORMANCE_TARGETS: await ask("Performance targets", "P95 < 2s for core pages"),
    SECURITY_REQUIREMENTS: await ask("Security constraints", "SOC2 alignment, audit logs"),
    QA_SCOPE: await ask("QA scope", "unit + e2e for core flows"),
    RELEASE_POLICY: await ask("Release policy", "weekly on Wednesdays"),
    NAMING_CONVENTIONS: await ask("Naming conventions", "camelCase for JS, kebab-case for files"),
    BRANCH_STRATEGY: await ask("Branch strategy", "trunk-based with short-lived branches"),
    COMMIT_RULES: await ask("Commit rules", "conventional commits"),
  };

  let specialization = fs.readFileSync(specializationPath, "utf8");
  for (const [key, value] of Object.entries(answers)) {
    specialization = replacePlaceholder(specialization, key, value);
  }
  fs.writeFileSync(specializationPath, specialization, "utf8");

  const fillBrand = fs.existsSync(brandPath)
    ? await askYesNo("Fill brand brief now")
    : false;

  if (fillBrand) {
    const brandAnswers = {
      BRAND_NAME: await ask("Brand name", answers.PROJECT_NAME),
      BRAND_PROMISE: await ask("Brand promise", "faster team operations"),
      BRAND_PERSONALITY: await ask("Brand personality", "calm, confident, pragmatic"),
      COLOR_DIRECTION: await ask("Color direction", "earth tones with high contrast accents"),
      TYPOGRAPHY_DIRECTION: await ask("Typography direction", "serif headlines, sans body"),
      SHAPE_LANGUAGE: await ask("Shape language", "rounded rectangles, simple geometry"),
      VISUAL_DONTs: await ask("Do-not-use rules", "no neon gradients"),
      LOGO_STYLE: await ask("Preferred logo style", "wordmark + simple symbol"),
      LOGO_SYMBOL_IDEAS: await ask("Symbol ideas", "signal, compass"),
      LOGO_TEXT_TREATMENT: await ask("Text treatment", "uppercase with tight tracking"),
      HERO_STYLE: await ask("Hero image style", "editorial photography"),
      SOCIAL_STYLE: await ask("Social image style", "bold text overlays"),
      BACKGROUND_DIRECTION: await ask("Background direction", "subtle paper texture"),
      OUTPUT_FORMATS: await ask("Preferred output formats", "svg, png"),
      OUTPUT_DIMENSIONS: await ask("Preferred dimensions", "logo: 1024px, hero: 1600x900"),
      ACCESSIBILITY_CONSTRAINTS: await ask("Accessibility constraints", "contrast AA"),
    };

    let brand = fs.readFileSync(brandPath, "utf8");
    for (const [key, value] of Object.entries(brandAnswers)) {
      brand = replacePlaceholder(brand, key, value);
    }
    fs.writeFileSync(brandPath, brand, "utf8");
  }

  {
    const skipDirs = new Set([
      ".git",
      "node_modules",
      ".next",
      "dist",
      "build",
      "out",
      "coverage",
      "public/assets/img",
    ]);

    const replaceInFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        if (!content.includes("AI Coding Boilerplate")) return;
        const updated = content
          .split("AI Coding Boilerplate")
          .join(answers.PROJECT_NAME);
        fs.writeFileSync(filePath, updated, "utf8");
      } catch {
        // Ignore non-text or unreadable files.
      }
    };

    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (skipDirs.has(entry.name)) continue;
          const relPath = path.relative(root, fullPath).replace(/\\/g, "/");
          if (relPath === "public/assets/img" || relPath.startsWith("public/assets/img/")) {
            continue;
          }
          walk(fullPath);
        } else if (entry.isFile()) {
          replaceInFile(fullPath);
        }
      }
    };

    walk(root);

    const gitDir = path.join(root, ".git");
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }

    const hasGit = spawnSync("git", ["--version"], { stdio: "ignore" }).status === 0;
    if (hasGit) {
      await runCommand("git", ["init"]);
    } else {
      console.log("\nGit not found. Skipping git init.");
    }
  }

  console.log("\nDone.");
  console.log("- Updated .docs/project/specialization.md");
  if (fillBrand) console.log("- Updated .docs/project/brand.md");
  console.log("\nNext steps:");
  console.log("- npm run ai:check-specialization");
  console.log("- npm run ai:start");
  console.log("- Add first spec in .features/");

  rl.close();
};

run().catch((err) => {
  console.error(err);
  rl.close();
  process.exit(1);
});
