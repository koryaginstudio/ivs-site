"use client";

import { useEffect, useRef } from "react";
import s from "../app/home.module.css";
import styles from "./IndustryCards.module.css";

const frameCount = 72;
const columns = 9;
const rows = frameCount / columns;
const largeIcons = new Set(["government", "logistics", "forestry"]);

// Speed peaks halfway through the turn and falls gradually to zero at both ends.
function turnProgress(time: number) {
  return time ** 4 * (35 - 84 * time + 70 * time ** 2 - 20 * time ** 3);
}

export function IndustryCard({ icon, label, href }: { icon: string; label: string; href: string }) {
  const sprite = useRef<HTMLSpanElement>(null);
  const animation = useRef(0);
  const loading = useRef<Promise<void> | null>(null);
  const playing = useRef(false);
  const mounted = useRef(false);
  const directory = "/industry-icons";
  const duration = largeIcons.has(icon) ? 1640 : 1440;
  const assetVersion = icon === "energy" ? 3 : 2;
  const animationUrl = `${directory}/${icon}-spin.webp?v=${assetVersion}`;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelAnimationFrame(animation.current);
    };
  }, []);

  function loadSprite() {
    if (!loading.current) {
      const image = new Image();
      image.src = animationUrl;
      loading.current = image.decode().catch(error => {
        loading.current = null;
        throw error;
      });
    }
    return loading.current;
  }

  async function spin(trigger: HTMLElement) {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    if (playing.current || reducedMotion.matches) return;
    playing.current = true;

    try {
      await loadSprite();
    } catch {
      playing.current = false;
      return;
    }

    const layer = sprite.current;
    if (!mounted.current || !layer || reducedMotion.matches || !trigger.matches(":hover, :focus-visible")) {
      playing.current = false;
      return;
    }

    const start = performance.now();
    layer.style.backgroundImage = `url("${animationUrl}")`;
    layer.parentElement?.setAttribute("data-spinning", "true");
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      if (!layer) return;
      if (progress >= 1 || reducedMotion.matches) {
        layer.parentElement?.removeAttribute("data-spinning");
        playing.current = false;
        return;
      }
      const frame = Math.round(turnProgress(progress) * frameCount) % frameCount;
      layer.style.backgroundPosition = `${(frame % columns) / (columns - 1) * 100}% ${Math.floor(frame / columns) / (rows - 1) * 100}%`;
      animation.current = requestAnimationFrame(tick);
    }
    tick(start);
  }

  return (
    <a href={href} className={`${s.card} ${styles.industryCard}`}
      onPointerEnter={event => { if (event.pointerType !== "touch") void spin(event.currentTarget); }}
      onFocus={event => { if (event.currentTarget.matches(":focus-visible")) void spin(event.currentTarget); }}>
      <span className={`${s.cardMedia} ${styles.media}`} aria-hidden="true">
        <img src={`${directory}/${icon}.webp`} width={224} height={224} alt="" loading="lazy" />
        <span ref={sprite} className={styles.sprite} />
      </span>
      <span className={s.cardBody}>
        <span className={s.cardHead}>
          <span className={s.cardTitle}>{label}</span>
          <span className={`${s.cardArrow} ${styles.arrow}`} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </span>
    </a>
  );
}
