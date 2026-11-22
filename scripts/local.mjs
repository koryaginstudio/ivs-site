// Запуск проекта одной командой на macOS, Linux и Windows:
// npm run local
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const forwarded = args.filter((arg) => arg !== "--check");

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  console.error(`Нужен Node.js 20.9 или новее. Сейчас установлен ${process.version}.`);
  process.exit(1);
}

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
if (!existsSync(path.join(root, "node_modules", "next", "package.json"))) {
  console.log("Устанавливаю зависимости при первом запуске...");
  const installed = spawnSync(npm, ["install"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (installed.error || installed.status !== 0) {
    console.error("Не удалось установить зависимости. Проверьте доступ к npm и повторите команду.");
    process.exit(installed.status || 1);
  }
}

const envPath = path.join(root, ".env.local");
if (!existsSync(envPath)) {
  copyFileSync(path.join(root, ".env.example"), envPath);
  console.log("Создан .env.local. Без ключей Supabase сайт использует локальные данные.");
}

if (checkOnly) {
  console.log(`Проект готов к запуску. Node.js ${process.version}, зависимости установлены.`);
  process.exit(0);
}

const hasPort = forwarded.some((arg) => arg === "--port" || arg === "-p" || arg.startsWith("--port="));
const hasHost = forwarded.some((arg) =>
  ["--host", "--hostname"].includes(arg) || arg.startsWith("--host=") || arg.startsWith("--hostname="),
);
const devArgs = [
  path.join(root, "scripts", "dev.mjs"),
  ...(hasHost ? [] : ["--hostname", "0.0.0.0"]),
  ...(hasPort ? [] : ["--port", "7100"]),
  ...forwarded,
];

const portIndex = devArgs.findIndex((arg) => arg === "--port" || arg === "-p");
const portArg = devArgs.find((arg) => arg.startsWith("--port="));
const port = portArg?.split("=")[1] || (portIndex >= 0 ? devArgs[portIndex + 1] : "7100");
console.log(`Запускаю ИВС-СЕТИ: http://localhost:${port}/`);
console.log("Для остановки нажмите Ctrl+C.");

const child = spawn(process.execPath, devArgs, {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}

child.on("error", (error) => {
  console.error("Не удалось запустить Next.js:", error.message);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
