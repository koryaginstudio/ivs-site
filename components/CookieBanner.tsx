"use client";

import { useEffect, useState } from "react";
import s from "../app/home.module.css";

const KEY = "ivs-cookie-consent";

// Классическая плашка согласия на cookie: выбор хранится локально (как у ИВС - 180 дней).
// Подключение аналитики по согласию - когда добавим Яндекс.Метрику.
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        // срок действия выбора - 180 дней, как в уведомлении на ivs-corp.ru
        if (saved?.at && Date.now() - saved.at < 180 * 24 * 60 * 60 * 1000) return;
      }
    } catch {
      // приватный режим и т.п. - просто покажем плашку
    }
    setVisible(true);
  }, []);

  const choose = (value: "all" | "necessary") => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={s.cookieBar} role="dialog" aria-live="polite" aria-label="Уведомление об использовании cookie">
      <div className={s.cookieText}>
        <strong>Файлы cookie - только с вашего согласия</strong>
        <p>
          Сайт использует необходимые cookie для работы сайта. Аналитические, функциональные и рекламные cookie
          включатся только после вашего выбора. <a href="/cookie/">Подробнее об использовании cookie</a>
        </p>
      </div>
      <div className={s.cookieActions}>
        <button type="button" className={`${s.btn} ${s.btnSecondary} ${s.cookieBtn}`} onClick={() => choose("necessary")}>
          Только необходимые
        </button>
        <button type="button" className={`${s.btn} ${s.btnPrimary} ${s.cookieBtn}`} onClick={() => choose("all")}>
          Принять все
        </button>
      </div>
    </div>
  );
}
