import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProjectsCatalog } from "@/components/ProjectsCatalog";
import { getProjects } from "@/lib/projects";
import s from "./projects.module.css";

export const metadata: Metadata = {
  title: "Проекты — ИВС-СЕТИ",
  description: "Каталог реализованных проектов ИВС-СЕТИ: фильтры по отраслям, компетенциям и годам.",
};

export const revalidate = 300;

type SearchParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [projects, params] = await Promise.all([getProjects(), searchParams]);

  return (
    <>
      <Header />
      <main className={s.page}>
        <nav className={s.breadcrumbs} aria-label="Хлебные крошки">
          <Link href="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Проекты</span>
        </nav>

        <header className={s.head}>
          <h1>Проекты</h1>
          <p>Благодаря нашему опыту вы сократите бюджет на 10-30% по сравнению с разработчиками, которые будут разбираться на вашем проекте.</p>
        </header>

        <ProjectsCatalog
          projects={projects}
          initialFilters={{
            industries: first(params.industries) ?? "all",
            competencies: first(params.competencies) ?? "all",
            year: first(params.year) ?? "all",
            page: first(params.PAGEN_1) ?? "1",
          }}
        />
      </main>
      <Footer />
    </>
  );
}
