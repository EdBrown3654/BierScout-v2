import fs from "node:fs";
import { spawn } from "node:child_process";

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
    });
  });

const main = async () => {
  const hasNodeModules = fs.existsSync("node_modules");
  if (!hasNodeModules) {
    await run("npm", ["install"]);
  }

  await run("npm", ["run", "ai:check-specialization"]);
  await run("npm", ["run", "dev"]);
};

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
