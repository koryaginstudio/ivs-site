import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import s from "../home.module.css";

export const metadata: Metadata = { title: "Использование cookie — ИВС-СЕТИ" };

// Текст и категории - из cookie-уведомления на ivs-corp.ru (отдельного документа у ИВС нет).
const categories = [
  {
    title: "Необходимые",
    text: "Нужны для безопасности, авторизации, корзины и базовой работы сайта. Их нельзя отключить.",
    required: true,
  },
  {
    title: "Предпочтения",
    text: "Запоминают язык, регион и другие выбранные вами параметры интерфейса.",
  },
  {
    title: "Аналитика",
    text: "Помогает понять, как посетители используют сайт, и улучшать его на основе статистики посещений.",
  },
  {
    title: "Маркетинг",
    text: "Используется для оценки рекламы и показа более релевантных предложений на других площадках.",
  },
];

export default function CookiePage() {
  return (
    <>
      <Header />
      <main className={s.staticPage}>
        <div className={s.staticWrap}>
          <h1 className={s.staticTitle}>Использование cookie</h1>
          <p className={s.staticLead}>Файлы cookie - только с вашего согласия.</p>
          <p>
            Сайт использует необходимые cookie для работы сайта. Аналитические, функциональные и рекламные cookie
            включатся только после вашего выбора.
          </p>
          <p>Выберите, какие категории можно использовать. Необходимые cookie всегда активны.</p>

          <ul className={s.cookieCats}>
            {categories.map((c) => (
              <li key={c.title} className={s.cookieCat}>
                <span className={s.cookieCatTitle}>
                  {c.title}
                  {c.required ? <span className={s.cookieCatBadge}>Всегда включены</span> : null}
                </span>
                <span className={s.cookieCatText}>{c.text}</span>
              </li>
            ))}
          </ul>

          <p>Ваш выбор сохраняется на 180 дней, после чего уведомление появится снова.</p>
          <p>
            Подробнее об обработке данных:{" "}
            <a href="https://ivs-corp.ru/include/licenses_detail.php" className={s.staticLink}>
              Политика обработки персональных данных
            </a>{" "}
            и{" "}
            <a href="https://ivs-corp.ru/include/agreement_detail.php" className={s.staticLink}>
              Согласие на обработку персональных данных
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
