import { nav } from "@/components/ivs-content";
import { IndustryCard } from "./IndustryCard";
import { SectionHead } from "./SectionHead";
import s from "../app/home.module.css";
import styles from "./IndustryCards.module.css";

const projects = "https://ivs-corp.ru/projects/";
const industries = [
  { icon: "government", label: "Госсектор", filter: 95 },
  { icon: "oil-gas", label: "Нефть и газ", filter: 96 },
  { icon: "education", label: "Образование" },
  { icon: "logistics", label: "Логистика и транспорт", filter: 98 },
  { icon: "engineering", label: "Машиностроение" },
  { icon: "medicine", label: "Медицина" },
  { icon: "commercial", label: "Коммерческий сектор", filter: 101 },
  { icon: "energy", label: "Энергетика", filter: 102 },
  { icon: "metallurgy", label: "Металлургия", filter: 103 },
  { icon: "forestry", label: "Лесная и целлюлозно-бумажная промышленность" },
  { icon: "chemistry", label: "Химическая промышленность" },
];

export function Cards() {
  const services = nav.find(item => item.kind === "mega");
  return (
    <section className={s.cards} aria-label="Направления деятельности">
      <header className={styles.intro}>
        <SectionHead title={"> 10\u00a0направлений деятельности"} linkHref={projects} linkLabel="Все проекты" />
        <p>
          Информационные технологии повсюду. За 30 лет мы реализовали более 1400 крупных ИТ проектов и знаем решение многих задач.
          <br />
          <strong>мы можем</strong>&nbsp;применить этот опыт к вашему проекту.
        </p>
      </header>
      <ul className={s.cardGrid}>
        {industries.map(({ icon, label, filter }) => (
          <li key={icon}>
            <IndustryCard icon={icon} label={label} href={filter ? `${projects}?industries=${filter}` : projects} />
          </li>
        ))}
      </ul>
      {services?.kind === "mega" && (
        <div className={styles.services}>
          <SectionHead title="Услуги" linkHref={services.href} linkLabel="Все услуги" />
          <ul className={styles.serviceList}>
            {services.groups.map(group => (
              <li key={group.href}><a href={group.href}>{group.label}</a></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
