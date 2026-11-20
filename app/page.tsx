import { Hero } from "@/components/Hero";
import { Cards } from "@/components/Cards";
import { About } from "@/components/About";
import { Projects } from "@/components/Projects";
import { Partners } from "@/components/Partners";
import { News } from "@/components/News";
import { ContactsBlock } from "@/components/ContactsBlock";
import { Footer } from "@/components/Footer";

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
