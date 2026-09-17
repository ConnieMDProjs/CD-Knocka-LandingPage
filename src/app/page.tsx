import { DNAAnimation } from "@/components/animation/DNAAnimation";
import { SiteHeader } from "@/components/navigation";
import { BackToTop } from "@/components/navigation/BackToTop";
import { Arrival } from "@/components/sections/Arrival";
import { Expression } from "@/components/sections/Expression";
import { Film } from "@/components/sections/Film";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Footer } from "@/components/sections/Footer";
import { Newsletter } from "@/components/sections/Newsletter";
import { Range } from "@/components/sections/Range";
import { Rooms } from "@/components/sections/Rooms";

export default function Home() {
  // overflow-x is `clip`, not `hidden`: clip contains the hero and rooms bleed
  // without creating a scroll container, so the sticky stages in S2 and S4 keep
  // working. Do not swap it for overflow-hidden.
  return (
    <main className="relative min-h-screen overflow-x-clip bg-void text-text-primary">
      <DNAAnimation />
      <SiteHeader />
      <Range />
      <Arrival />
      <Film />
      <HowItWorks />
      <Rooms />
      <Expression />
      <Newsletter />
      <Footer />
      <BackToTop />
    </main>
  );
}
