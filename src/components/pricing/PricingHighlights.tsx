import { useEffect, useState } from "react";
import { ArrowRight, Percent, Store, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import type { PricingContent } from "@/lib/cms/types";

const ICONS = [Percent, Wallet, Store] as const;

export function PricingHighlights({
  highlights,
  compare,
}: {
  highlights: PricingContent["highlights"];
  compare: PricingContent["compare"];
}) {
  const cards = highlights.cards.length ? highlights.cards : [];
  const [spotlight, setSpotlight] = useState(0);

  useEffect(() => {
    if (cards.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setSpotlight((i) => (i + 1) % cards.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [cards.length]);

  return (
    <>
      <Reveal delay={80}>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {cards.map((pillar, i) => {
            const on = i === spotlight;
            const Icon = ICONS[i % ICONS.length]!;
            return (
              <button
                key={`${pillar.title}-${i}`}
                type="button"
                onClick={() => setSpotlight(i)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border bg-background p-5 text-left transition-colors duration-300",
                  on ? "border-border" : "hover:border-border",
                )}
              >
                <span className="relative flex size-9 items-center justify-center rounded-full bg-muted text-foreground/70">
                  <Icon className="size-4" />
                </span>
                <h2 className="relative mt-3 text-lg">{pillar.title}</h2>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.body}
                </p>
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-4 bottom-0 h-[2px] rounded-full transition-opacity duration-300",
                    on
                      ? "animate-pricing-line-move opacity-100"
                      : "opacity-0 group-hover:opacity-40 group-hover:bg-primary/40",
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <aside className="relative mt-8 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background to-primary/[0.03] p-6 sm:p-8">
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
                {compare.eyebrow}
              </p>
              <p className="mt-3 text-2xl leading-snug sm:text-3xl">{compare.headline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{compare.body}</p>
              <div className="mt-6">
                <Button asChild variant="outline" className="gap-2">
                  <a href="#savings-calculator">
                    {compare.ctaLabel}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative grid w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:min-w-[300px] sm:gap-3">
              <div className="animate-pricing-tilt-left rounded-xl border border-border bg-background/90 p-3 text-center sm:p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">
                  {compare.appsLabel}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-foreground/70 sm:text-4xl lg:text-5xl">
                  {compare.appsValue}
                </p>
              </div>

              <span className="animate-pricing-vs flex size-7 items-center justify-center rounded-full border border-border bg-background text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:size-8">
                vs
              </span>

              <div className="animate-pricing-tilt-right rounded-xl border border-primary/25 bg-primary/[0.06] p-3 text-center sm:p-4">
                <p className="text-[10px] uppercase tracking-wider text-primary sm:text-[11px]">
                  {compare.orderwebLabel}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
                  {compare.orderwebValue}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </Reveal>
    </>
  );
}
