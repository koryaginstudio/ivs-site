"""Импорт полных материалов ivs-corp.ru в локальный снапшот и SQL-миграцию.

Запуск из корня проекта: python scripts/import-news.py
Скрипт не обращается к Supabase и не требует секретов. Полученную миграцию
нужно применить к проекту Supabase штатным способом.
"""

from __future__ import annotations

import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup, Tag
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SEED_PATH = ROOT / "lib" / "news-seed.ts"
CONTENT_PATH = ROOT / "lib" / "news-content.ts"
MIGRATION_PATH = ROOT / "supabase" / "migrations" / "0003_news_content.sql"
MEDIA_ROOT = ROOT / "public" / "news" / "articles"
BASE_URL = "https://ivs-corp.ru"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,image/avif,image/webp,image/*,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9",
}

ALLOWED_TAGS = {
    "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li",
    "a", "img", "figure", "figcaption", "blockquote", "h2", "h3", "h4",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td", "iframe",
    "video", "source", "div", "span",
}
VOID_TAGS = {"br", "img", "source"}


def read_sources() -> list[dict[str, str]]:
    text = SEED_PATH.read_text(encoding="utf-8")
    entries = re.findall(
        r'\{\s*slug:\s*"([^"]+)",.*?sourceUrl:\s*"([^"]+)",?\s*\}',
        text,
        flags=re.S,
    )
    if len(entries) != 18:
        raise RuntimeError(f"Ожидалось 18 материалов, найдено {len(entries)}")
    return [{"slug": slug, "sourceUrl": url} for slug, url in entries]


def extension_for(url: str, content_type: str) -> str:
    suffix = Path(urlparse(url).path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"}:
        return ".jpg" if suffix == ".jpeg" else suffix
    return {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
        "image/avif": ".avif",
    }.get(content_type.split(";")[0].lower(), ".jpg")


def download_media(session: requests.Session, url: str, slug: str, ordinal: int) -> tuple[str, tuple[int, int] | None]:
    response = session.get(url, timeout=60)
    response.raise_for_status()
    ext = extension_for(url, response.headers.get("Content-Type", ""))
    directory = MEDIA_ROOT / slug
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{ordinal:02d}{ext}"
    path.write_bytes(response.content)
    dimensions = None
    if ext != ".svg":
        try:
            with Image.open(path) as image:
                dimensions = image.size
        except Exception:
            dimensions = None
    return f"/news/articles/{slug}/{path.name}", dimensions


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def make_excerpt(content: Tag) -> str:
    text = clean_text(content.get_text(" ", strip=True))
    if len(text) <= 220:
        return text
    cut = text[:217]
    boundary = max(cut.rfind(". "), cut.rfind("! "), cut.rfind("? "))
    if boundary >= 100:
        return cut[: boundary + 1]
    return cut[: cut.rfind(" ")].rstrip(" ,;:-") + "…"


def sanitize_content(
    content: Tag,
    session: requests.Session,
    source_url: str,
    slug: str,
    media_start: int,
) -> tuple[str, int]:
    fragment = BeautifulSoup(content.decode_contents(), "html.parser")
    for tag in fragment.find_all(["script", "style", "form", "button", "input", "noscript"]):
        tag.decompose()

    media_ordinal = media_start
    for tag in list(fragment.find_all(True)):
        if tag.name not in ALLOWED_TAGS:
            tag.unwrap()
            continue
        if tag.name in {"div", "span"}:
            tag.unwrap()
            continue
        if tag.name == "b":
            tag.name = "strong"
        elif tag.name == "i":
            tag.name = "em"

        attrs: dict[str, object] = {}
        if tag.name == "a":
            href = tag.get("href")
            if href:
                attrs["href"] = urljoin(source_url, str(href))
                if urlparse(attrs["href"]).netloc not in {"", "ivs-corp.ru", "www.ivs-corp.ru"}:
                    attrs["target"] = "_blank"
                    attrs["rel"] = "noopener noreferrer"
        elif tag.name == "img":
            src = tag.get("src") or tag.get("data-src")
            if not src:
                tag.decompose()
                continue
            local_src, dimensions = download_media(session, urljoin(source_url, str(src)), slug, media_ordinal)
            media_ordinal += 1
            attrs = {
                "src": local_src,
                "alt": clean_text(str(tag.get("alt") or "")),
                "loading": "lazy",
            }
            if dimensions:
                attrs["width"], attrs["height"] = dimensions
        elif tag.name == "iframe":
            src = tag.get("src")
            if not src:
                tag.decompose()
                continue
            attrs = {
                "src": urljoin(source_url, str(src)),
                "title": clean_text(str(tag.get("title") or "Видео к новости")),
                "loading": "lazy",
                "allow": "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                "allowfullscreen": True,
            }
        elif tag.name == "video":
            attrs = {"controls": True, "preload": "metadata"}
            if tag.get("poster"):
                attrs["poster"] = urljoin(source_url, str(tag.get("poster")))
        elif tag.name == "source" and tag.get("src"):
            attrs = {"src": urljoin(source_url, str(tag.get("src")))}
            if tag.get("type"):
                attrs["type"] = str(tag.get("type"))
        elif tag.name in {"td", "th"}:
            if tag.get("colspan"):
                attrs["colspan"] = str(tag.get("colspan"))
            if tag.get("rowspan"):
                attrs["rowspan"] = str(tag.get("rowspan"))
        tag.attrs = attrs

    inline_only = all(
        child.name in {"br", "a", "strong", "b", "em", "i", "u", "s", "img"}
        for child in fragment.find_all(recursive=False)
    )
    html = fragment.decode_contents().strip().replace("</br>", "")
    if inline_only and re.search(r"(?:<br\s*/?>\s*){2,}", html):
        parts = re.split(r"(?:<br\s*/?>\s*){2,}", html)
        html = "".join(f"<p>{part.strip()}</p>" for part in parts if clean_text(BeautifulSoup(part, "html.parser").get_text()) or "<img" in part)
    elif inline_only and html:
        html = f"<p>{html}</p>"
    return html, media_ordinal


def sql_string(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def main() -> None:
    sources = read_sources()
    session = requests.Session()
    session.headers.update(HEADERS)
    records: dict[str, dict[str, str]] = {}

    for index, item in enumerate(sources, start=1):
        slug = item["slug"]
        response = session.get(item["sourceUrl"], timeout=45)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        content = soup.select_one("div.detail.news .content")
        if content is None:
            raise RuntimeError(f"Не найден текст статьи: {item['sourceUrl']}")

        media_ordinal = 1
        image = None
        cover = soup.select_one("div.detail.news .detailimage img")
        if cover and cover.get("src"):
            image, _ = download_media(session, urljoin(item["sourceUrl"], str(cover["src"])), slug, media_ordinal)
            media_ordinal += 1

        content_html, media_ordinal = sanitize_content(
            content, session, item["sourceUrl"], slug, media_ordinal
        )
        if not content_html:
            raise RuntimeError(f"Пустой текст статьи: {item['sourceUrl']}")
        records[slug] = {
            "excerpt": make_excerpt(content),
            "contentHtml": content_html,
            **({"image": image} if image else {}),
        }
        print(
            f"[{index:02d}/{len(sources)}] {slug}: "
            f"{len(clean_text(content.get_text(' ', strip=True)))} знаков, медиа {media_ordinal - 1}"
        )
        time.sleep(0.15)

    payload = json.dumps(records, ensure_ascii=False, indent=2)
    CONTENT_PATH.write_text(
        "// Автоматически собрано из официальных материалов ivs-corp.ru скриптом scripts/import-news.py.\n"
        "// Это резервный снапшот для локального предпросмотра; на сайте данные читаются из Supabase.\n"
        "export const newsContent: Record<string, { excerpt: string; contentHtml: string; image?: string }> = "
        + payload
        + ";\n",
        encoding="utf-8",
    )

    updates = []
    for item in sources:
        slug = item["slug"]
        record = records[slug]
        assignments = [
            f"excerpt = {sql_string(record['excerpt'])}",
            f"content_html = {sql_string(record['contentHtml'])}",
        ]
        if record.get("image"):
            assignments.append(f"image_url = {sql_string(record['image'])}")
        updates.append(
            f"update news set {', '.join(assignments)} where slug = {sql_string(slug)};"
        )

    MIGRATION_PATH.write_text(
        "-- Полные тексты, анонсы и оригинальные изображения 18 материалов ivs-corp.ru.\n"
        "-- Импорт выполнен scripts/import-news.py; применять после 0001_news.sql.\n\n"
        "alter table news add column if not exists excerpt text not null default '';\n"
        "alter table news add column if not exists content_html text not null default '';\n\n"
        + "\n\n".join(updates)
        + "\n",
        encoding="utf-8",
    )
    print(f"Готово: {CONTENT_PATH.relative_to(ROO