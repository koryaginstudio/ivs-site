"use client";

import { Reveal } from "./Reveal";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import { Note } from "./Note";
import s from "../app/home.module.css";
import styles from "./Services.module.css";

const services = nav.find((item) => item.kind === "mega");

const previews = [
  { video: "/services/complex-projects-v2.webm", poster: "/services/complex-projects-v2.jpg", project: "Стройплощадка и инженеры" },
  { video: "/services/software-v2.webm", poster: "/services/software-v2.jpg", project: "Команда разработки" },
  { video: "/services/infrastructure-v2.webm", poster: "/services/infrastructure-v2.jpg", project: "Серверный узел" },
  { video: "/services/security-v2.webm", poster: "/services/security-v2.jpg", project: "Центр мониторинга ИБ" },
  { video: "/services/telecom-v2.webm", poster: "/services/telecom-v2.jpg", project: "Сетевое оборудование" },
  { video: "/services/engineering-v2.webm", poster: "/services/engineering-v2.jpg", project: "Инженерные системы" },
  { video: "/services/support-v2.webm", poster: "/services/support-v2.jpg", project: "Служба поддержки" },
  { video: "/services/supply-v2.webm", poster: "/services/supply-v2.jpg", project: "Склад и логистика" },
];

function subserviceLabel(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} подуслуг`;
  if (last === 1) return `${count} подуслуга`;
  if (last >= 2 && last <= 4) return `${count} подуслуги`;
  return `${count} подуслуг`;
}

export function Services() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(-1); // по умолчанию все направления закрыты
  // hover/focus раскрывает панель и переключает видео, клик ведёт на страницу направления
  const enter = (index: number) => {
    setActive(index);
    setOpen(index);
  };
  // До чтения системной настройки движение запрещено, чтобы reduced-motion не запускался даже на кадр.
  const [reducedMotion, setReducedMotion] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      video.currentTime = 0;
    } else {
      video.play().catch(() => {
        // Poster остаётся видимым, если браузер запретил автовоспроизведение.
      });
    }
  }, [active, reducedMotion]);

  if (services?.kind !== "mega") return null;

  const current = services.groups[active] ?? services.groups[0];
  const preview = previews[active] ?? previews[0];

  return (
    <Reveal as="section" id="services" className={`${s.section} ${s.sectionMuted}`} ariaLabel="Услуги">
      <SectionHead
        title="Услуги"
        linkHref={services.href}
        linkLabel="Все услуги"
        aside={
          <Note id="note-services" label="Пометка к блоку услуг">
            Структура и подуслуги взяты из официального меню ИВС. Для preview использованы стоковые видео
            (лицензия Pexels, свободное использование). Их можно заменить на съёмку заказчика без
            изменения механики блока.
          </Note>
        }
      />
      <div className={styles.layout} onMouseLeave={() => setOpen(-1)}>
        <ol className={styles.list}>
          {services.groups.map((group, index) => {
            const isActive = active === index;
            const isOpen = open === index;
            const panelId = `service-panel-${index}`;
            const triggerId = `service-trigger-${index}`;

            return (
              <li
                className={styles.item}
                key={group.href}
                data-active={isActive}
                data-open={isOpen}
                onMouseEnter={() => enter(index)}
              >
                <a
                  id={triggerId}
                  href={group.href}
                  className={styles.trigger}
                  onFocus={() => enter(index)}
                >
                  <span className={styles.index} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.label}>{group.label}</span>
                  <span className={styles.toggle} aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
                <div
                  id={panelId}
                  className={styles.panel}
                  data-open={isOpen}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!isOpen}
                >
                  <div className={styles.panelClip}>
                    <div className={styles.panelInner}>
                      <ul className={styles.sublist}>
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <a href={item.href} tabIndex={isOpen ? 0 : -1}>
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                      <a className={styles.directionLink} href={group.href} tabIndex={isOpen ? 0 : -1}>
                        Открыть направление
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <figure className={styles.preview}>
          <div className={styles.media} style={{ backgroundImage: `url(${preview.poster})` }}>
            <video
              key={active}
              ref={videoRef}
              className={styles.video}
              src={preview.video}
              poster={preview.poster}
              muted
              loop
              playsInline
              autoPlay={!reducedMotion}
              preload="metadata"
              aria-label={`${current.label}. ${preview.project}`}
            />
            <span className={styles.mediaIndex} aria-hidden="true">
              {String(active + 1).padStart(2, "0")} / {String(services.groups.length).padStart(2, "0")}
            </span>
          </div>
          <figcaption className={styles.caption} aria-live="polite">
            <span className={styles.captionTitle}>{current.label}</span>
            <span className={styles.captionMeta}>
              {subserviceLabel(current.items.length)} · {preview.project}
            </span>
          </figcaption>
        </figure>
      </div>
    </Reveal>
  );
}
