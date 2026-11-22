"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const SESSION_KEY = "ivs-intro-seen";
const MIN_SHOW = 900; // минимальное время показа, чтобы экран не мигал
const FADE = 500; // длительность затухания, синхронизирована с globals.css

// Загрузочный экран входа на сайт: знак ИВС и заполняющаяся линия под ним.
// Показывается один раз за сессию, после полной загрузки мягко гаснет,
// открывая уже собранную страницу. При prefers-reduced-motion - без анимации.
export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const start = useRef(0);

  // Если заход уже был в этой сессии - экран не показываем вовсе.
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) setVisible(false);
      else sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* приватный режим: просто показываем экран */
    }
    start.current = performance.now();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad);

    let raf = 0;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let removeTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const waited = now - start.current;
      // До загрузки ползём к 88%, после - добегаем до 100, но не раньше MIN_SHOW.
      const ready = loaded && waited >= MIN_SHOW;
      const target = ready ? 100 : loaded ? 96 : 88;
      setProgress((p) => {
        const next = p + (target - p) * 0.08;
        if (ready && next > 99.2 && !hideTimer) {
          hideTimer = setTimeout(() => setFading(true), 120);
          removeTimer = setTimeout(() => setVisible(false), 120 + FADE);
        }
        return Math.min(next, 100);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("load", onLoad);
      cancelAnimationFrame(raf);
      if (hideTimer) clearTimeout(hideTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="preloader" data-fading={fading || undefined} aria-hidden="true">
      <div className="preloaderInner">
        {/* актуальный знак компании - тот же, что в шапке */}
        <img src="/ivs-mark-v2.svg" width={72} height={72} alt="" className="preloaderLogo" />
        <div className="preloaderTrack">
          <div className="preloaderFill" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>
    </div>
  );
}
