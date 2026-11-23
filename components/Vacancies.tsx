import type { Vacancy } from "@/lib/company-content";
import styles from "./Vacancies.module.css";
export function Vacancies({vacancies}: {vacancies: Vacancy[]}) {
  const cities = [...new Set(vacancies.map(v => v.city))];
  return <section className={styles.section} aria-label="Открытые вакансии">
    {cities.map(city => {
      const jobs = vacancies.filter(v => v.city === city);
      return <div key={city}>
        <h2>г. {city}</h2>
        <p className={styles.contact}>По всем вопросам обращайтесь по тел. <a href={`tel:${jobs[0].phone.replace(/[^+\d]/g, "")}`}>{jobs[0].phone}</a> или по адресу <a href={`mailto:${jobs[0].email}`}>{jobs[0].email}</a></p>
        <div className={styles.jobs}>{jobs.map(job => <details key={job.id} className={styles.job}>
          <summary>{job.title}<span aria-hidden="true">⌄</span></summary>
          <div className={styles.body}>
            {job.summary.map(line => <p key={line}>{line}</p>)}
            {job.sections.map(section => <section key={section.title}><h3>{section.title}</h3><ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}
            <a className={styles.apply} href={`mailto:${job.email}?subject=${encodeURIComponent("Отклик на вакансию «" + job.title + "»")}`}>Отправить резюме ↗</a>
          </div>
        </details>)}</div>
      </div>;
    })}
    {!vacancies.length && <p>Сейчас открытых вакансий нет.</p>}
  </section>;
}
