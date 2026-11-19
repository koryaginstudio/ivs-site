import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // без плавающего значка «N» в режиме разработки — не мешает показу и скриншотам
  devIndicators: false,
  // корень проекта — эта папка (рядом лежит старый репозиторий прототипов со своим lockfile)
  turbopack: { root: __dirname },
};

export default nextConfig;
