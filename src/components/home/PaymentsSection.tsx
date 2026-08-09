import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CreditCard, Globe2, Plug, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import type { RestaurantPosContent } from "@/lib/cms/types";

const PROVIDERS: { name: string; slug?: string | undefined }[] = [
  { name: "Stripe", slug: "stripe" },
  { name: "Adyen", slug: "adyen" },
  { name: "Worldpay", slug: "worldpay" },
  { name: "Global Payments" },
  { name: "Teya" },
  { name: "SumUp", slug: "sumup" },
  { name: "Dojo" },
  { name: "PayPal", slug: "paypal" },
  { name: "Apple Pay", slug: "applepay" },
  { name: "Google Pay", slug: "googlepay" },
  { name: "Klarna", slug: "klarna" },
  { name: "Visa", slug: "visa" },
  { name: "Mastercard", slug: "mastercard" },
  { name: "American Express", slug: "americanexpress" },
  { name: "Your gateway" },
];

const POINTS = [
  {
    icon: Plug,
    title: "Bring your own gateway",
    body: "Already on a rate you like? Keep it. We integrate your provider into the POS and storefront.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "PCI-compliant flows, tokenised cards and 3-D Secure handled by the gateway — never on your terminal.",
  },
  {
    icon: Globe2,
    title: "In-person and online",
    body: "One reconciliation for counter, web ordering, app and delivery payments.",
  },
  {
    icon: CreditCard,
    title: "No payment lock-in",
    body: "Switch acquirer whenever you want. Your menu, orders and customers stay exactly where they are.",
  },
];

function ProviderLogo({ name, slug }: { name: string; slug?: string | undefined }) {
  return (
    <div className="surface-panel flex h-16 w-40 shrink-0 items-center justify-center px-5 grayscale opacity-70 transition duration-500 ease-out hover:grayscale-0 hover:opacity-100 hover:-translate-y-0.5">
      {slug ? (
        <img
          src={`https://cdn.simpleicons.org/${slug}/0f172a`}
          alt={`${name} logo`}
          loading="lazy"
          className="h-6 w-auto max-w-full object-contain"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            el.parentElement?.querySelector("span")?.classList.remove("hidden");
          }}
        />
      ) : null}
      <span className={`text-sm tracking-tight ${slug ? "hidden" : ""}`}>{name}</span>
    </div>
  );
}

export function PaymentsSection({
  content,
}: {
  content?: RestaurantPosContent["payments"] | undefined;
}) {
  const pointsRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState(0);
  const [entered, setEntered] = useState(false);
  const pointRows = (
    content?.points?.length
      ? content.points
      : POINTS.map(({ title, body }) => ({ title, body }))
  ).map((point, i) => ({
    ...point,
    icon: POINTS[i % POINTS.length]!.icon,
  }));

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !pointsRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const points = gsap.utils.toArray<HTMLElement>(".pay-point");
        const icons = gsap.utils.toArray<HTMLElement>(".pay-point-icon");
        const actions = gsap.utils.toArray<HTMLElement>(".pay-actions > *");

        if (reduced) {
          gsap.set([...points, ...icons, ...actions], { clearProps: "all", opacity: 1 });
          setEntered(true);
          return;
        }

        gsap.set(points, { opacity: 0, y: 24 });
        gsap.set(icons, { opacity: 0, scale: 0.7 });
        gsap.set(actions, { opacity: 0, y: 14 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pointsRef.current,
            start: "top 82%",
            once: true,
          },
          onComplete: () => setEntered(true),
        });

        tl.to(icons, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.55)",
          stagger: 0.1,
        })
          .to(
            points,
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: "power3.out",
              stagger: 0.1,
            },
            0.06,
          )
          .to(
            actions,
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              ease: "power2.out",
            },
            "-=0.12",
          );
      }, pointsRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    if (!entered) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setSpotlight((i) => (i + 1) % Math.max(pointRows.length, 1));
    }, 2800);
    return () => window.clearInterval(id);
  }, [entered, pointRows.length]);

  return (
    <section className="overflow-x-hidden bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-5">
        <Reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
            {content?.eyebrow || "Payments"}
          </p>
          <h2 className="mt-3 max-w-2xl text-[1.85rem] leading-[1.12] text-[#0a1a4a] sm:text-4xl lg:text-5xl">
            {content?.headline || "We support your payment provider — or add a new one"}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#243447] sm:text-lg">
            {content?.body ||
              "OrderWeb is gateway-agnostic. Take payments through the provider you already trust, and we will connect it across your terminals, website and app."}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="marquee-mask relative mt-8 -mx-4 overflow-hidden sm:-mx-5">
            <div className="flex w-max gap-3 animate-marquee-x hover:[animation-play-state:paused]">
              {[...PROVIDERS, ...PROVIDERS].map((p, i) => (
                <ProviderLogo key={`${p.name}-${i}`} name={p.name} slug={p.slug} />
              ))}
            </div>
          </div>
        </Reveal>

        <div ref={pointsRef} className="mt-8">
          <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {pointRows.map((f, i) => {
              const on = entered && i === spotlight;
              return (
                <button
                  key={`${f.title}-${i}`}
                  type="button"
                  onMouseEnter={() => setSpotlight(i)}
                  onFocus={() => setSpotlight(i)}
                  className={cn(
                    "pay-point group relative flex gap-4 border-t border-border pt-5 text-left transition-all duration-500",
                    on ? "translate-y-[-2px]" : "",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-primary/50 transition-transform duration-700 ease-out",
                      on && "scale-x-100",
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "pay-point-icon feature-icon-gradient mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-500 ease-out",
                      on
                        ? "animate-icon-float scale-110"
                        : "group-hover:scale-110",
                    )}
                    style={{
                      backgroundImage:
                        "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)",
                      animationDelay: `${i * 0.22}s`,
                    }}
                  >
                    <f.icon className="size-4 drop-shadow-sm" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3
                      className={cn(
                        "text-base text-[#0a1a4a] transition-colors duration-300 sm:text-lg",
                        on ? "text-[#2f6fb8]" : "group-hover:text-[#2f6fb8]",
                      )}
                    >
                      {f.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#243447]/85 sm:text-[15px]">
                      {f.body}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pay-actions mt-8 flex flex-wrap justify-center gap-3 sm:mt-10">
            <Button asChild className="animate-cta-bounce w-full sm:w-auto">
              <Link to="/contact" search={{}}>
                {content?.ctaLabel || "Ask about your gateway"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
