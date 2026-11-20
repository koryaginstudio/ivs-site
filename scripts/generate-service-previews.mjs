// Создаёт фирменные WebM-preview из реальных проектных фото ИВС.
// Нужен установленный Google Chrome; внешние npm-зависимости и ffmpeg не используются.
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outputDir = path.join(root, "public", "services");
const tempDir = path.join(root, ".service-previews-chrome");
const generatorPath = path.join(root, ".service-previews.html");

const sources = [
  ["complex-projects", "proj-02.jpg"],
  ["software", "proj-19.jpg"],
  ["infrastructure", "proj-03.png"],
  ["security", "proj-07.jpeg"],
  ["telecom", "proj-06.jpg"],
  ["engineering", "proj-12.jpeg"],
  ["support", "proj-14.jpg"],
  ["supply", "proj-04.jpg"],
];

const mimeByExtension = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

async function makeGenerator() {
  const items = [];
  for (const [name, file] of sources) {
    const extension = path.extname(file);
    const bytes = await readFile(path.join(root, "public", "projects", file));
    items.push({ name, image: `data:${mimeByExtension[extension]};base64,${bytes.toString("base64")}` });
  }

  return `<!doctype html><meta charset="utf-8"><title>IVS preview generator</title><body><script>
const items = ${JSON.stringify(items)};
const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});
const blobToDataUrl = (blob) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.readAsDataURL(blob);
});
async function renderOne(item, index) {
  const image = await loadImage(item.image);
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 600;
  const context = canvas.getContext("2d", { alpha: false });
  const stream = canvas.captureStream(24);
  const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
    .find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new Error("WebM MediaRecorder is not supported");
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1800000 });
  const chunks = [];
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
  recorder.start(250);
  const duration = 4800;
  const startedAt = performance.now();
  await new Promise((resolve) => {
    function frame(now) {
      const time = Math.min(1, (now - startedAt) / duration);
      const eased = 0.5 - 0.5 * Math.cos(time * Math.PI);
      const cover = Math.max(canvas.width / image.width, canvas.height / image.height);
      const scale = cover * (1.045 + 0.055 * eased);
      const width = image.width * scale;
      const height = image.height * scale;
      const direction = index % 2 === 0 ? 1 : -1;
      const x = (canvas.width - width) / 2 + direction * (eased - 0.5) * 22;
      const y = (canvas.height - height) / 2 + (0.5 - eased) * 14;
      context.fillStyle = "#1f1e1e";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, x, y, width, height);
      if (time < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
  recorder.stop();
  await stopped;
  stream.getTracks().forEach((track) => track.stop());
  const blob = new Blob(chunks, { type: mimeType });
  return { name: item.name, data: await blobToDataUrl(blob) };
}
window.renderAll = async () => {
  const results = [];
  for (let index = 0; index < items.length; index += 1) {
    results.push(await renderOne(items[index], index));
  }
  return results;
};
document.body.dataset.ready = "true";
</script></body>`;
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.onopen = () => resolve(socket);
    socket.onerror = () => reject(new Error(`Cannot connect to Chrome: ${url}`));
  });
}

function makeClient(socket) {
  let nextId = 1;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  };
  return (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function waitForDebugger(chrome) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const timeout = setTimeout(() => reject(new Error(`Chrome did not start: ${stderr}`)), 15000);
    chrome.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      const match = stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (match) {
        clearTimeout(timeout);
        resolve(Number(match[1]));
      }
    });
    chrome.once("error", reject);
    chrome.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chrome exited with ${code}: ${stderr}`));
    });
  });
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  await rm(tempDir, { recursive: true, force: true });
  await writeFile(generatorPath, await makeGenerator());

  const chrome = spawn(chromePath, [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${tempDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-component-update",
    "--allow-file-access-from-files",
    pathToFileURL(generatorPath).href,
  ], { stdio: ["ignore", "ignore", "pipe"] });

  let socket;
  try {
    const port = await waitForDebugger(chrome);
    let pages;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      if (pages.some((page) => page.url === pathToFileURL(generatorPath).href)) break;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    const page = pages.find((candidate) => candidate.url === pathToFileURL(generatorPath).href);
    if (!page) throw new Error("Generator page was not found");
    socket = await connect(page.webSocketDebuggerUrl);
    const send = makeClient(socket);
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const ready = await send("Runtime.evaluate", { expression: "document.body?.dataset.ready === 'true'", returnByValue: true });
      if (ready.result.value) break;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    const evaluation = await send("Runtime.evaluate", {
      expression: "window.renderAll()",
      awaitPromise: true,
      returnByValue: true,
    });
    if (evaluation.exceptionDetails) throw new Error(JSON.stringify(evaluation.exceptionDetails));
    for (const result of evaluation.result.value) {
      const base64 = result.data.slice(result.data.indexOf(",") + 1);
      const bytes = Buffer.from(base64, "base64");
      await writeFile(path.join(outputDir, `${result.name}.webm`), bytes);
      console.log(`${result.name}.webm - ${(bytes.length / 1024).toFixed(0)} KB`);
    }
  } finally {
    if (socket) socket.close();
    chrome.kill("SIGTERM");
    await rm(tempDir, { recursive: true, force: true });
    await rm(generatorPath, { force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
