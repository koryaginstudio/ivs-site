"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type RevealProps = {
  as?: "section" | "div";
  className?: string;
  id?: string;
  ariaLabel?: string;
  delay?: number;
  children: ReactNode;
};

// Появление содержимого при входе в зону видимости: заголовок и контент раскрываются последовательно.
// Срабатывает один раз, при prefers-reduced-motion блок виден сразу без анимации.
export function Reveal({ as: Tag = "div", className, id, ariaLabel, delay = 0, children }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      // запускаем до входа в viewport: к моменту появления первой строки анимация уже идёт
      { threshold: 0.04, rootMargin: "0px 0px 14% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={className ? `revealOn ${className}` : "revealOn"}
      id={id}
      aria-label={ariaLabel}
      data-show={show || undefined}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
