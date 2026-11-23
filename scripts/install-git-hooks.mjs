// Подключает версионируемые Git-хуки после клонирования и установки зависимостей.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

if (!existsSync(path.join(root, ".git"))) {
  console.log("Папка .git не найдена, настройка Git-хуков пропущена.");
  process.exit(0);
}

const configured = spawnSync("git", ["config", "core.hooksPath", ".githooks"], {
  cwd: root,
  stdio: "inherit",
});

if (configured.error || configured.status !== 0) {
  console.error("Не удалось подключить Git-хуки. Проверьте, что Git установлен и доступен в PATH.");
  process.exit(configured.status || 1);
}

console.log("Git-хуки подключены: коммиты будут автоматически отправляться на GitHub.");
