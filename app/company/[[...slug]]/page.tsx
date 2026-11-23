import { getReviews, getVacancies } from "@/lib/company-content";
import { Vacancies } from "@/components/Vacancies";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactsBlock } from "@/components/ContactsBlock";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Partners } from "@/components/Partners";
import { Reviews } from "@/components/Reviews";
import { about, nav } from "@/components/ivs-content";
import s from "../../projects/projects.module.css";

export const revalidate = 300;

type Props = { params: Promise<{ slug?: string[] }> };
const company = nav.find((item) => item.label === "Компания");
const pages = company?.kind === "menu" ? company.items : [];

function findPage(slug?: string[]) {
  const path = slug?.length ? "/company/" + slug.join("/") + "/" : "/company/";
  return pages.find((page) => page.href === path);
}

export function generateStaticParams() {
  return pages.map(({ href }) => ({ slug: href.split("/").filter(Boolean).slice(1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = findPage((await params).slug);
  return page ? { title: page.label + " — ИВС-СЕТИ" } : {};
}

export default async function CompanyPage({ params }: Props) {
  const route = (await params).slug;
  const page = findPage(route);
  if (!page) notFound();
  const slug = route?.[0];
  const isAbout = !slug;
  const reviews = slug === "reviews" ? await getReviews() : [];
  const vacancies = slug === "vacancy" ? await getVacancies() : [];

  return (
    <>
      <Header />
      <main>
        <article className={s.page}>
          <nav className={s.breadcrumbs} aria-label="Хлебные крошки">
            <Link href="/">Главная</Link><span aria-hidden="true">/</span>
            {slug && <><Link href="/company/">Компания</Link><span aria-hidden="true">/</span></>}
            <span aria-current="page">{page.label}</span>
          </nav>
          <header className={s.head}><h1>{page.label}</h1></header>
          {slug !== "reviews" && slug !== "vacancy" && <img className={s.detailImage} src="/about/about-ivs.jpg" alt="" />}
          {isAbout && <p className={s.detailText}>{about.text}</p>}
          {slug !== "partners" && slug !== "reviews" && slug !== "vacancy" &&
            <a href={"https://ivs-corp.ru" + page.href}>Подробнее на сайте ИВС-СЕТИ</a>}
        </article>
        {slug === "partners" && <Partners standalone />}
        {slug === "reviews" && <Reviews standalone reviews={reviews} />}
        {slug === "vacancy" && <Vacancies vacancies={vacancies} />}
        <ContactsBlock />
      </main>
      <Footer />
    </>
  );
}
