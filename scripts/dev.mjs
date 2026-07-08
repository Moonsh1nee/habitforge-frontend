import { readFileSync } from "fs";
import { spawn } from "child_process";
import { resolve } from "path";

function readEnvPort(file) {
  try {
    const content = readFileSync(file, "utf-8");
    const match = content.match(/^\s*PORT\s*=\s*(\d+)/m);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// process.env.PORT (Docker / CLI) beats .env files
const port = process.env.PORT ?? readEnvPort(".env.local") ?? readEnvPort(".env") ?? "3200";
const nextBin = resolve("node_modules", "next", "dist", "bin", "next");
const [, , ...extraArgs] = process.argv;

const child = spawn(process.execPath, [nextBin, "dev", "--port", port, ...extraArgs], {
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 0));
