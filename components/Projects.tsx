import { getProjects } from "@/lib/projects";
import { projectsCatalogHref } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import { Note } from "./Note";
import { ProjectsBrowser } from "./ProjectsBrowser";
import s from "../app/home.module.css";

// Проекты: карточки с фото 1:1 + доработанная календарная механика (лента лет).
// Данные - из слоя lib/projects (Supabase, пока - локальный снапшот каталога ivs-corp.ru).
export async function Projects() {
  const projects = await getProjects();

  return (
    <section className={`${s.section} ${s.sectionMuted}`} aria-label="Проекты">
      <SectionHead
        title="Проекты"
        linkHref={projectsCatalogHref}
        linkLabel="Все проекты"
        aside={
          <Note id="note-projects" label="Пометка к блоку проектов">
            20 реальных проектов из каталога ivs-corp.ru - с фото, отраслью, годом сдачи и описанием. Ссылки пока
            ведут на старый сайт. Лента лет - доработанная календарная механика оригинала: вместо выпадающего списка
            годы с живыми счётчиками. Данные уже идут через слой БД - после ключей Supabase в .env.local список
            будет редактироваться из админки без правок кода.
          </Note>
        }
      />
      <ProjectsBrowser projects={projects} />
    </section>
  );
}
