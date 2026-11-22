"use client";

import { useCallback, useEffect, useRef } from "react";
import s from "../app/home.module.css";
import styles from "./IndustryCards.module.css";

const columns = 9;
const defaultFrameCount = 72;
const updatedAssets: Readonly<Record<string, { filename: string; frames: number }>> = {
  government: { filename: "government-large-flag", frames: 72 },
  logistics: { filename: "logistics-bed-cycle", frames: 39 },
  "chrome-question": { filename: "chrome-question", frames: 72 },
};
const glossIcons = new Set([
  "government", "oil-gas", "education", "logistics", "engineering", "medicine",
  "commercial", "energy", "metallurgy", "forestry", "chemistry",
]);
const fullTurnIcons = new Set(["oil-gas", "energy", "chrome-question"]);
const durations: Readonly<Record<string, number>> = {
  government: 1640,
  logistics: 1280,
  engineering: 2140,
  medicine: 1800,
  commercial: 1940,
  forestry: 1940,
  "chrome-question": 1600,
};

// Ease the ends while keeping the middle of the sprite close to its original timing.
function easedProgress(time: number) {
  const ramp = 0.1;
  if (time < ramp) return time ** 2 / (2 * ramp * (1 - ramp));
  if (time > 1 - ramp) return 1 - (1 - time) ** 2 / (2 * ramp * (1 - ramp));
  return (time - ramp / 2) / (1 - ramp);
}

export function IndustryCard({ icon, label, href, description }: {
  icon: string;
  label: string;
  href: string;
  description?: string;
}) {
  const sprite = useRef<HTMLSpanElement>(null);
  const animation = useRef(0);
  const loading = useRef<Promise<HTMLImageElement> | null>(null);
  const playing = useRef(false);
  const mounted = useRef(false);
  const usesGloss = glossIcons.has(icon);
  const directory = usesGloss ? "/industry-icons/gloss" : "/industry-icons";
  const asset = updatedAssets[icon];
  const filename = asset?.filename ?? icon;
  const frameCount = asset?.frames ?? defaultFrameCount;
  const rows = Math.ceil(frameCount / columns);
  const duration = durations[icon] ?? 1440;
  const version = asset || usesGloss ? "" : "?v=7";
  const stillUrl = `${directory}/${filename}.webp${version}`;
  const animationUrl = `${directory}/${filename}-spin.webp${version}`;

  const loadSprite = useCallback(() => {
    if (!loading.current) {
      const image = new Image();
      image.src = animationUrl;
      loading.current = image.decode().then(() => image).catch(error => {
        loading.current = null;
        throw error;
      });
    }
    return loading.current;
  }, [animationUrl]);

  useEffect(() => {
    mounted.current = true;
    const layer = sprite.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || !matchMedia("(any-hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
      observer.disconnect();
      void loadSprite().catch(() => { /* Retry on interaction. */ });
    }, { rootMargin: "160px" });

    if (layer) observer.observe(layer);
    return () => {
      mounted.current = false;
      observer.disconnect();
      cancelAnimationFrame(animation.current);
    };
  }, [loadSprite]);

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

    let start: number | undefined;
    const fullTurn = fullTurnIcons.has(icon);
    layer.style.backgroundImage = `url("${animationUrl}")`;
    layer.style.backgroundSize = `${columns * 100}% ${rows * 100}%`;
    layer.style.backgroundPosition = "0% 0%";
    layer.parentElement?.setAttribute("data-spinning", "true");

    const tick = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / duration, 1);
      if (progress >= 1 || reducedMotion.matches) {
        layer.parentElement?.removeAttribute("data-spinning");
        playing.current = false;
        return;
      }
      const position = fullTurn ? (1 - Math.cos(Math.PI * progress)) / 2 : easedProgress(progress);
      const frame = Math.min(Math.floor(position * frameCount), frameCount - 1);
      layer.style.backgroundPosition = `${(frame % columns) / (columns - 1) * 100}% ${Math.floor(frame / columns) / (rows - 1) * 100}%`;
      animation.current = requestAnimationFrame(tick);
    };
    animation.current = requestAnimationFrame(tick);
  }

  return (
    <a href={href} className={`${s.card} ${styles.industryCard}${description ? ` ${styles.ctaCard}` : ""}`}
      onPointerEnter={event => { if (event.pointerType !== "touch") void spin(event.currentTarget); }}
      onFocus={event => { if (event.currentTarget.matches(":focus-visible")) void spin(event.currentTarget); }}>
      <span className={`${s.cardMedia} ${styles.media}`} aria-hidden="true">
        <img src={stillUrl} width={224} height={224} alt="" loading="lazy" />
        <span ref={sprite} className={styles.sprite} />
      </span>
      <span className={s.cardBody}>
        <span className={s.cardHead}>
          {description ? (
            <span className={styles.ctaBody}>
              <span className={styles.ctaTitle}>{label}</span>
              <span className={styles.ctaSub}>{description}</span>
            </span>
          ) : (
            <span className={s.cardTitle}>{label}</span>
          )}
          <span className={description ? styles.ctaArrow : s.cardArrow} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </span>
    </a>
  );
}
