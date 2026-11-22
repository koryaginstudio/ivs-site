import { SectionHead } from "./SectionHead";
import home from "../app/home.module.css";
import styles from "./Reviews.module.css";

const reviewsUrl = "https://ivs-corp.ru/company/reviews/";

// Краткие пересказы отзывов. Каждая карточка ведёт к опубликованному оригиналу.
const reviews = [
  {
    organization: "Пермская ГРЭС",
    summary: "Главный инженер станции поблагодарил ИВС за модернизацию холодильных машин системы кондиционирования БЩУ-1.",
    document: "https://ivs-corp.ru/upload/iblock/ded/deda84bfda1cd0822b66025a388f0cde.jpg",
  },
  {
    organization: "ГУ Банка России по Пермскому краю",
    summary: "В отзыве отметили оперативное обслуживание принтеров и МФУ, а также качество поставляемых расходных материалов и запчастей.",
    document: "https://ivs-corp.ru/upload/iblock/36b/36b5f65130d58de5c0a1d5b9057f1f37.jpg",
  },
  {
    organization: "Газпром бытовые системы",
    summary: "Чайковский филиал отметил, что ИВС полностью поставила оборудование для учёта продукции по штрихкодам и учла пожелания по его характеристикам.",
    document: "https://ivs-corp.ru/upload/iblock/416/416c1e1a03fd93ea220612e233b31117.jpg",
  },
];

export function Reviews() {
  return (
    <section className={`${home.section} ${home.sectionMuted}`} aria-label="Отзывы клиентов">
      <SectionHead title="Отзывы клиентов" linkHref={reviewsUrl} linkLabel="Все отзывы" />
      <ul className={styles.grid}>
        {reviews.map(({ organization, summary, document }) => (
          <li key={organization} className={styles.card}>
            <h3>{organization}</h3>
            <p>{summary}</p>
            <a href={document} aria-label={`Оригинал отзыва · ${organization}`}>
              Оригинал отзыва
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
