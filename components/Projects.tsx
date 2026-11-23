import { Reveal } from "./Reveal";
import { getProjects } from "@/lib/projects";
import { projectsCatalogHref } from "@/components/ivs-content";
import { SectionHead } from "./SectionHead";
import { ProjectsBrowser } from "./ProjectsBrowser";
import s from "../app/home.module.css";

// Проекты: карточки с фото 1:1 + доработанная календарная механика (лента лет).
// Данные - из слоя lib/projects (Supabase, пока - локальный снапшот каталога ivs-corp.ru).
export async function Projects({ title = "Проекты" }: { title?: string }) {
  const projects = await getProjects();

  return (
    <Reveal as="section" className={s.section} ariaLabel="Проекты">
      <SectionHead title={title} linkHref={projectsCatalogHref} linkLabel="Все проекты" />
      <ProjectsBrowser projects={projects} />
    </Reveal>
  );
}
