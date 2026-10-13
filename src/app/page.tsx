import { Hero } from "@/components/landing/hero";
import { PageBackground } from "@/components/landing/page-background";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { LeadWorkspace } from "@/components/leads/lead-workspace";
import { animationDelay } from "@/lib/animation";

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <PageBackground />
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Hero />
        <div className="fade-up" style={animationDelay(320)}>
          <LeadWorkspace />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
