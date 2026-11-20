import { Hero } from "@/components/Hero";
import { Cards } from "@/components/Cards";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Partners } from "@/components/Partners";
import { News } from "@/components/News";
import { ContactsBlock } from "@/components/ContactsBlock";
import { Footer } from "@/components/Footer";

// Новости приходят из БД - перевалидируем страницу раз в 5 минут, чтобы свежие материалы
// появлялись без пересборки (при работе на локальном снапшоте ничего не меняет).
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Cards />
      <About />
      <Projects />
      <Partners />
      <News />
      <ContactsBlock />
      <Footer />
    </>
  );
}
