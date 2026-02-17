import fs from "node:fs";
import path from "node:path";

const specializationPath = path.join(
  process.cwd(),
  ".docs/project/specialization.md"
);

if (!fs.existsSync(specializationPath)) {
  console.error("Missing file: .docs/project/specialization.md");
  process.exit(1);
}

const content = fs.readFileSync(specializationPath, "utf8");
const placeholders = [...content.matchAll(/<[^>\n]+>/g)].map((m) => m[0]);
const uniquePlaceholders = [...new Set(placeholders)].sort();

if (uniquePlaceholders.length > 0) {
  console.error(
    "Unresolved placeholders found in .docs/project/specialization.md:"
  );

  for (const placeholder of uniquePlaceholders) {
    console.error(`- ${placeholder}`);
  }

  process.exit(1);
}

console.log("Specialization check passed: no placeholders found.");
