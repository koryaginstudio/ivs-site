"use client";

import { Reveal } from "./Reveal";
import { useEffect, useRef, useState } from "react";
import { about } from "@/components/ivs-content";
import s from "../app/home.module.css";

// О компании коротко: формулировка из раздела «О компании» ivs-corp.ru, цифры — с главной старого сайта.
// Контрастная красная плашка: слева текст и цифры, справа фирменный видеоролик ИВС без вступления.
export function About() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // До чтения системной настройки движение запрещено, чтобы reduced-motion не запускался даже на кадр.
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [reducedMotion]);

  return (
    <Reveal as="section" className={s.section} ariaLabel="О компании">
      <div className={s.aboutPanel}>
        <div className={s.aboutMain}>
          <h2 className={s.aboutTitle}>{about.title}</h2>
          <p className={s.aboutText}>{about.text}</p>
          <ul className={s.aboutNums}>
            {about.numbers.map((n) => (
              <li key={n.label} className={s.aboutNum}>
                <span className={s.aboutNumValue}>{n.value}</span>
                <span className={s.aboutNumLabel}>{n.label}</span>
              </li>
            ))}
          </ul>
          <a href={about.href} className={`${s.btn} ${s.btnSecondary} ${s.aboutBtn}`}>
            <span className={s.btnChip}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Подробнее о компании
          </a>
        </div>
        <div className={s.aboutMedia}>
          <video
            ref={videoRef}
            className={s.aboutVideo}
            src="/about/about-ivs.mp4"
            poster="/about/about-ivs.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Видео ИВС: участники и события компании"
          />
        </div>
      </div>
    </Reveal>
  );
}
