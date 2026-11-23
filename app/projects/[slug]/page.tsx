import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactsBlock } from "@/components/ContactsBlock";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Projects } from "@/components/Projects";
import { getProjects } from "@/lib/projects";
import s from "../projects.module.css";

type Props = { params: Promise<{ slug: string }> };

async function findProject(params: Props["params"]) {
  const [{ slug }, projects] = await Promise.all([params, getProjects()]);
  return projects.find((project) => project.slug === slug);
}

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProjects()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await findProject(params);
  return project ? { title: project.title + " — ИВС-СЕТИ" } : {};
}

export default async function ProjectPage({ params }: Props) {
  const project = await findProject(params);
  if (!project) notFound();

  return (
    <>
      <Header />
      <main>
        <article className={s.page}>
          <nav className={s.breadcrumbs} aria-label="Хлебные крошки">
            <Link href="/">Главная</Link><span aria-hidden="true">/</span>
            <Link href="/projects/">Проекты</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{project.title}</span>
          </nav>
          <header className={s.head}>
            <h1>{project.title}</h1>
            {(project.industry || project.year > 0) && <p>{[project.industry, project.year || null].filter(Boolean).join(" · ")}</p>}
          </header>
          {project.image && <img className={s.detailImage} src={project.image} alt="" />}
          {project.description && <p className={s.detailText}>{project.description}</p>}
          <a href={project.sourceUrl}>Подробнее о проекте на сайте ИВС-СЕТИ</a>
        </article>
        <Projects title="Актуальные проекты" />
        <ContactsBlock title="Наши специалисты ответят на ваши вопросы" />
      </main>
      <Footer />
    </>
  );
}
