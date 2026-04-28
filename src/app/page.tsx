import { Navbar }   from "@/components/ui/Navbar";
import { Footer }   from "@/components/ui/Footer";
import { Hero }     from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { Systems }  from "@/components/home/Systems";
import { About }    from "@/components/home/About";
import { Cta }      from "@/components/home/Cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Systems />
        <About />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
