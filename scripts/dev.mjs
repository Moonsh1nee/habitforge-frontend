import { readFileSync } from "fs";
import { spawn } from "child_process";

function readEnvPort(file) {
  try {
    const content = readFileSync(file, "utf-8");
    const match = content.match(/^\s*PORT\s*=\s*(\d+)/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const port = readEnvPort(".env.local") ?? readEnvPort(".env") ?? "3000";

const [, , ...extraArgs] = process.argv;
const child = spawn(
  "npx",
  ["next", "dev", "--port", port, ...extraArgs],
  { stdio: "inherit", shell: true }
);
child.on("exit", (code) => process.exit(code ?? 0));
