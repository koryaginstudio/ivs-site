"use client";

import type { MouseEvent } from "react";
import styles from "../app/home.module.css";

export function BackToTop() {
  function returnToTop(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

    const top = document.getElementById("page-top");
    if (!top) return;

    event.preventDefault();
    top.focus({ preventScroll: true });
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <a href="#page-top" className={styles.backToTop} onClick={returnToTop} aria-label="Вернуться наверх">
      Наверх
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5m-6 6 6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
