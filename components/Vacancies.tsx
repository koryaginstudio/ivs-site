"use client";
import { useState } from "react";
import type { Vacancy } from "@/lib/company-content";
import styles from "./Vacancies.module.css";
export function Vacancies({vacancies}: {vacancies: Vacancy[]}) {
  const [opened, setOpened] = useState<string[]>([]);
  const cities = [...new Set(vacancies.map(v => v.city))];
  return <section className={styles.section} aria-label="Открытые вакансии">
    {cities.map(city => {
      const jobs = vacancies.filter(v => v.city === city);
      return <div key={city}>
        <h2>г. {city}</h2>
        <p className={styles.contact}>По всем вопросам обращайтесь по тел. <a href={`tel:${jobs[0].phone.replace(/[^+\d]/g, "")}`}>{jobs[0].phone}</a> или по адресу <a href={`mailto:${jobs[0].email}`}>{jobs[0].email}</a></p>
        <div className={styles.jobs}>{jobs.map(job => <article key={job.id} className={styles.job} data-open={opened.includes(job.id)}>
          <h3 className={styles.title}><button type="button" id={`${job.id}-trigger`} aria-expanded={opened.includes(job.id)} aria-controls={`${job.id}-panel`} onClick={() => setOpened(previous => previous.includes(job.id) ? previous.filter(id => id !== job.id) : [...previous,job.id])}>{job.title}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></h3>
          <div className={styles.collapse} data-open={opened.includes(job.id)} inert={!opened.includes(job.id)} id={`${job.id}-panel`} role="region" aria-labelledby={`${job.id}-trigger`} aria-hidden={!opened.includes(job.id)}><div className={styles.clip}><div className={styles.body}>
            {job.summary.map(line => <p key={line}>{line}</p>)}
            {job.sections.map(section => <section key={section.title}><h3>{section.title}</h3><ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul></section>)}
            <a className={styles.apply} href={`mailto:${job.email}?subject=${encodeURIComponent("Отклик на вакансию «" + job.title + "»")}`}>Отправить резюме ↗</a>
          </div></div></div>
        </article>)}</div>
      </div>;
    })}
    {!vacancies.length && <p>Сейчас открытых вакансий нет.</p>}
  </section>;
}
