"use client";

import { useEffect, useRef, useState } from "react";
import type { Office } from "@/components/contacts-data";
import s from "@/app/contacts/contacts.module.css";

type YMap = {
  behaviors: { disable: (name: string) => void };
  controls: { add: (name: string) => void };
  geoObjects: { add: (object: unknown) => void };
  setBounds: (bounds: number[][], options?: { checkZoomRange?: boolean; zoomMargin?: number }) => void;
  destroy: () => void;
};

type YMaps = {
  ready: (callback: () => void) => void;
  Map: new (
    element: HTMLElement,
    state: { center: number[]; zoom: number; type: string; controls: string[] },
  ) => YMap;
  Placemark: new (
    coordinates: number[],
    properties: { balloonContent: string; hintContent: string },
    options: { preset: string },
  ) => unknown;
};

type YandexWindow = Window & { ymaps?: YMaps };

const SCRIPT_ID = "ivs-yandex-maps";
let mapsPromise: Promise<YMaps> | undefined;

function loadYandexMaps(): Promise<YMaps> {
  const ymaps = (window as YandexWindow).ymaps;
  if (ymaps) return Promise.resolve(ymaps);
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<YMaps>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => {
      const loaded = (window as YandexWindow).ymaps;
      if (loaded) resolve(loaded);
      else reject(new Error("Yandex Maps API is unavailable"));
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("Yandex Maps failed to load")), { once: true });

    if (!existing) {
      script.id = SCRIPT_ID;
      script.async = true;
      // Та же версия API Яндекс Карт, что используется на актуальном сайте ИВС.
      script.src = "https://api-maps.yandex.ru/2.0/?load=package.full&mode=release&lang=ru-RU";
      document.head.appendChild(script);
    }
  });

  return mapsPromise;
}

function balloonContent(office: Office) {
  const email = office.emails[0];
  return `<div style="font:14px/1.5 Inter,Arial,sans-serif;color:#1f1e1e;max-width:280px">` +
    `<strong style="display:block;margin-bottom:8px;font-size:15px">${office.address}</strong>` +
    `<a style="display:block;color:#1f1e1e;text-decoration:none" href="${office.phoneHref}">${office.phone}</a>` +
    `<a style="display:block;color:#d83437" href="mailto:${email}">${email}</a>` +
    `</div>`;
}

export function YandexOfficesMap({ offices }: { offices: Office[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let map: YMap | undefined;

    loadYandexMaps()
      .then((ymaps) => {
        ymaps.ready(() => {
          if (cancelled || !container.current) return;

          map = new ymaps.Map(container.current, {
            center: [58.667915, 54.251566],
            zoom: 6,
            type: "yandex#map",
            controls: [],
          });

          map.behaviors.disable("scrollZoom");
          map.controls.add("zoomControl");
          map.controls.add("typeSelector");
          map.controls.add("scaleLine");

          offices.forEach((office) => {
            map?.geoObjects.add(new ymaps.Placemark(
              office.coordinates,
              { balloonContent: balloonContent(office), hintContent: office.city },
              { preset: "islands#redDotIcon" },
            ));
          });

          map.setBounds(offices.map((office) => office.coordinates), {
            checkZoomRange: true,
            zoomMargin: 32,
          });
          setStatus("ready");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, [offices]);

  return (
    <div className={s.mapShell}>
      <div ref={container} className={s.map} role="region" aria-label="Офисы ИВС-СЕТИ на Яндекс Карте" />
      {status === "loading" ? <div className={s.mapStatus}>Загружаем Яндекс Карту…</div> : null}
      {status === "error" ? (
        <div className={s.mapStatus}>
          <span>Карта временно недоступна.</span>
          <a
            href="https://yandex.ru/maps/?text=%D0%98%D0%92%D0%A1-%D0%A1%D0%95%D0%A2%D0%98%20%D0%9F%D0%B5%D1%80%D0%BC%D1%8C%20%D0%A2%D0%B8%D0%BC%D0%B8%D1%80%D1%8F%D0%B7%D0%B5%D0%B2%D0%B0%2024"
            target="_blank"
            rel="noopener noreferrer"
          >
            Открыть в Яндекс Картах
          </a>
        </div>
      ) : null}
    </div>
  );
}
