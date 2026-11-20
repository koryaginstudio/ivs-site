"""Синхронизация вендоров и логотипов с https://ivs-corp.ru/company/partners/.

Первые 15 логотипов не перекачиваются: среди них есть качественные SVG/PNG,
которые заменяют слабые исходники ИВС. Новые вендоры сохраняются как обрезанные PNG.
"""
from io import BytesIO
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

from bs4 import BeautifulSoup
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "partners"
SOURCE = "https://ivs-corp.ru/company/partners/"
FIRST = [
    ("MicroSoft", "Microsoft", "microsoft"),
    ("Acer", "Acer", "acer"),
    ("Adobe", "Adobe", "adobe"),
    ("МойОфис", "МойОфис", "myoffice"),
    ("Лаборатория Касперского", "Лаборатория Касперского", "kaspersky"),
    ("1С", "1С", "1c"),
    ("Dr.Web", "Dr.Web", "drweb"),
    ("D-Link", "D-Link", "dlink"),
    ("Positive Technologies", "Positive Technologies", "positive"),
    ("КриптоПро", "КриптоПро", "kriptopro"),
    ("Рутокен", "Рутокен", "rutoken"),
    ("Код безопасности", "Код безопасности", "securitycode"),
    ("BaseAlt", "BaseAlt", "basealt"),
    ("Астра", "Astra Linux", "astra"),
    ("ELTEX", "ELTEX", "eltex"),
]
FIRST_BY_SOURCE = {source: (display, slug) for source, display, slug in FIRST}
TRANSLIT = str.maketrans({
    "а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"j",
    "к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f",
    "х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya",
})


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (IVS website design)"})
    with urllib.request.urlopen(request, timeout=40) as response:
        return response.read()


def slugify(name: str) -> str:
    value = name.lower().translate(TRANSLIT)
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def trim(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A").point(lambda value: 255 if value > 12 else 0)
    if alpha.getextrema()[0] >= 250:
        rgb = image.convert("RGB")
        diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, "white")).convert("L")
        alpha = diff.point(lambda value: 255 if value > 18 else 0)
    bbox = alpha.getbbox()
    return image.crop(bbox) if bbox else image


def svg_ratio(path: Path) -> float:
    root = ET.fromstring(path.read_bytes())
    view_box = root.attrib.get("viewBox", "").replace(",", " ").split()
    if len(view_box) == 4 and float(view_box[3]):
        return float(view_box[2]) / float(view_box[3])
    return 1.0


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    soup = BeautifulSoup(fetch(SOURCE), "html.parser")
    vendors = []
    seen = set()
    for image in soup.find_all("img"):
        name = (image.get("alt") or "").strip()
        src = image.get("src") or ""
        if not name or not src.startswith("/upload/iblock/") or name == "Пермцентрсервис":
            continue
        if name in FIRST_BY_SOURCE:
            display, slug = FIRST_BY_SOURCE[name]
        else:
            display, slug = ("VMware" if name == "WMware" else name), slugify(name)
        if slug in seen:
            continue
        seen.add(slug)
        vendors.append({"source": name, "name": display, "slug": slug, "url": urllib.parse.urljoin(SOURCE, src)})

    order = {slug: index for index, (_, _, slug) in enumerate(FIRST)}
    vendors.sort(key=lambda item: order.get(item["slug"], len(order)))
    if len(vendors) != 61:
        raise RuntimeError(f"Ожидалось 61 вендоров, получено: {len(vendors)}")

    entries = []
    for item in vendors:
        slug = item["slug"]
        if slug not in order and not (OUT / f"{slug}.png").exists():
            original = Image.open(BytesIO(fetch(item["url"])))
            logo = trim(original)
            logo.save(OUT / f"{slug}.png", optimize=True)
            print("DOWNLOADED", slug, logo.size)

        candidates = [OUT / f"{slug}{extension}" for extension in (".svg", ".png", ".jpg", ".jpeg")]
        path = next((candidate for candidate in candidates if candidate.exists()), None)
        if path is None:
            raise RuntimeError(f"Нет локального логотипа: {slug}")
        if path.suffix == ".svg":
            ratio = svg_ratio(path)
        else:
            with Image.open(path) as logo:
                if slug in {"drweb", "positive"}:
                    trimmed = trim(logo)
                    if trimmed.size != logo.size:
                        trimmed.save(path, optimize=True)
                        print("TRIMMED", slug, logo.size, "->", trimmed.size)
                ratio = trimmed.width / trimmed.height if slug in {"drweb", "positive"} else logo.width / logo.height
        entries.append({"name": item["name"], "logo": f"/partners/{path.name}", "compact": ratio < 2.1})

    lines = [
        "// Сгенерировано scripts/sync-partners.py по официальному списку ИВС.",
        "export type PartnerLogo = { name: string; logo: string; compact?: boolean };",
        "",
        "export const partnerLogos: PartnerLogo[] = [",
    ]
    for entry in entries:
        compact = ", compact: true" if entry["compact"] else ""
        lines.append(f"  {{ name: {json.dumps(entry['name'], ensure_ascii=False)}, logo: {json.dumps(entry['logo'])}{compact} }},")
    lines += ["];", ""]
    (ROOT / "components" / "partners-data.ts").write_text("\n".join(lines), encoding="utf-8")
    print(f"READY: {len(entries)} вендоров")


if __name__ == "__main__":
    main()
