import { useEffect, useState } from "react";
import {
  Apple,
  BellRing,
  CalendarCheck,
  MessageSquare,
  Smartphone,
  Store,
  Utensils,
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";
import type { PricingContent } from "@/lib/cms/types";

const SMS_DEMOS = [
  {
    label: "Booking confirmation",
    sample: "Table for 2 confirmed · 7:30pm Fri",
    icon: CalendarCheck,
    tone: "from-sky-400/25 via-sky-300/10 to-transparent",
    chip: "bg-sky-500/15 text-sky-700",
    labelClass: "text-sky-700",
    bar: "bg-sky-500",
    bubble: "border-sky-300/50 bg-gradient-to-br from-sky-50 to-white",
  },
  {
    label: "Ready for collection",
    sample: "Your order is ready at the counter",
    icon: Utensils,
    tone: "from-emerald-400/25 via-emerald-300/10 to-transparent",
    chip: "bg-emerald-500/15 text-emerald-700",
    labelClass: "text-emerald-700",
    bar: "bg-emerald-500",
    bubble: "border-emerald-300/50 bg-gradient-to-br from-emerald-50 to-white",
  },
  {
    label: "Offer / reminder",
    sample: "Lunch deal today — order in the app",
    icon: BellRing,
    tone: "from-amber-400/30 via-orange-300/10 to-transparent",
    chip: "bg-amber-500/15 text-amber-800",
    labelClass: "text-amber-800",
    bar: "bg-amber-500",
    bubble: "border-amber-300/50 bg-gradient-to-br from-amber-50 to-white",
  },
] as const;

/** Guide prices checked Aug 2026 — Apple/Google set these; SMS follows UK network rates. */
const STORE_FEES = [
  {
    label: "Apple Developer Program",
    value: "≈ £79/year",
    note: "Apple: $99 USD / year",
  },
  {
    label: "Google Play Console",
    value: "≈ £19 one-time",
    note: "Google: $25 USD once",
  },
] as const;

const DEMO_APPS = [
  {
    name: "Harbour Kitchen",
    tag: "Seafood · Brighton",
    accent: "#2f6fb8",
    wash: "linear-gradient(160deg, #d9effc 0%, #f7fbfd 55%, #e8f2fb 100%)",
    header: "linear-gradient(145deg, #abeafd 0%, #61c3ec 40%, #2f6fb8 100%)",
    items: ["Oysters", "Catch of day", "Book a table"],
  },
  {
    name: "Spice Route",
    tag: "Indian · Manchester",
    accent: "#c45c26",
    wash: "linear-gradient(160deg, #fce8d9 0%, #fffaf7 55%, #f8ebe3 100%)",
    header: "linear-gradient(145deg, #f0c9a8 0%, #e0894a 45%, #8b3a2a 100%)",
    items: ["Thali", "Grill", "Order ahead"],
  },
  {
    name: "Nonna’s",
    tag: "Italian · London",
    accent: "#2f6b4a",
    wash: "linear-gradient(160deg, #d9f0e4 0%, #f7fcf9 55%, #e6f3ec 100%)",
    header: "linear-gradient(145deg, #b8e0d2 0%, #3d8f7a 50%, #1a3d35 100%)",
    items: ["Pasta", "Pizza", "Loyalty"],
  },
] as const;

function DemoPhone({
  app,
  active,
  offset,
}: {
  app: (typeof DEMO_APPS)[number];
  active: boolean;
  offset: "left" | "center" | "right";
}) {
  return (
    <div
      className={cn(
        "absolute top-1/2 w-[96px] -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[112px]",
        offset === "left" && "left-0 origin-bottom rotate-[-8deg] sm:-left-1",
        offset === "center" && "left-1/2 z-10 -translate-x-1/2 origin-bottom",
        offset === "right" && "right-0 origin-bottom rotate-[8deg] sm:-right-1",
        active ? "z-20 scale-110 opacity-100" : "scale-95 opacity-70",
      )}
      aria-hidden={!active}
    >
      <div
        className={cn(
          "overflow-hidden rounded-[1.35rem] border-[3px] border-[#0a1a4a]/88 bg-white shadow-[0_18px_40px_-16px_rgba(10,26,74,0.45)]",
          active &&
            "animate-addon-phone-float shadow-[0_22px_48px_-14px_rgba(10,26,74,0.5)]",
        )}
      >
        <div
          className="px-2 pb-2 pt-2 text-white"
          style={{ backgroundImage: app.header }}
        >
          <div className="mx-auto mb-1.5 h-1 w-7 rounded-full bg-white/35" />
          <p className="text-[7px] uppercase tracking-[0.16em] text-white/75">
            Your app
          </p>
          <p className="truncate text-[10px] font-semibold leading-tight">
            {app.name}
          </p>
        </div>
        <div
          className="space-y-1.5 px-2 py-2"
          style={{ backgroundImage: app.wash }}
        >
          <p className="text-[7px] text-foreground/55">{app.tag}</p>
          {app.items.map((item) => (
            <div
              key={item}
              className="rounded-md border border-white/70 bg-white/85 px-1.5 py-1 text-[8px] font-medium text-[#0a1a4a] shadow-sm"
            >
              {item}
            </div>
          ))}
          <div
            className="rounded-md px-1.5 py-1 text-center text-[8px] font-semibold text-white"
            style={{ backgroundColor: app.accent }}
          >
            Order now
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoAppStage() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % DEMO_APPS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  const app = DEMO_APPS[active];

  return (
    <div className="mt-6">
      <div className="relative mx-auto h-[210px] w-full max-w-[280px] overflow-hidden">
        {DEMO_APPS.map((demo, i) => {
          const offset =
            i === active
              ? "center"
              : i === (active + 1) % DEMO_APPS.length
                ? "right"
                : "left";
          return (
            <DemoPhone
              key={demo.name}
              app={demo}
              active={i === active}
              offset={offset}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground/85 transition-opacity duration-500">
          Demo: {app.name}
        </p>
        <div className="flex gap-0.5">
          {DEMO_APPS.map((demo, i) => (
            <button
              key={demo.name}
              type="button"
              aria-label={`Show ${demo.name} demo`}
              onClick={() => setActive(i)}
              className="flex size-11 items-center justify-center"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-5 bg-primary" : "w-1.5 bg-border",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SmsAddOnCard({ addOns }: { addOns: PricingContent["addOns"] }) {
  const [live, setLive] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setLive((i) => (i + 1) % SMS_DEMOS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="surface-panel group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] sm:p-7">
      {/* Colour washes — soft sky / mint / amber so the card feels like live messaging */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 0% 0%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 30%, rgba(52,211,153,0.18), transparent 50%), radial-gradient(ellipse 45% 40% at 70% 100%, rgba(251,191,36,0.2), transparent 55%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 top-8 size-28 rounded-full bg-sky-400/20 blur-2xl transition-transform duration-700 group-hover:scale-125"
        aria-hidden
      />

      <div className="relative flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-primary to-[#0a1a4a] text-white shadow-md">
          <MessageSquare className="size-5 animate-icon-float" />
        </div>
        <div>
          <h3 className="text-lg">{addOns.smsTitle}</h3>
          <p className="text-xs text-muted-foreground">{addOns.smsSubtitle}</p>
        </div>
      </div>

      <p className="relative mt-4 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
        {addOns.smsPrice}
        <span className="ml-2 text-lg font-medium text-foreground/70 sm:text-xl">
          {addOns.smsPriceSuffix}
        </span>
      </p>
      <p className="relative mt-3 text-sm text-muted-foreground">{addOns.smsBody}</p>

      <div className="relative mt-8 flex-1 space-y-3" aria-live="polite">
        {SMS_DEMOS.map((row, i) => {
          const on = i === live;
          const Icon = row.icon;
          return (
            <button
              key={row.label}
              type="button"
              onClick={() => setLive(i)}
              className={cn(
                "relative w-full overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-500",
                row.bubble,
                on
                  ? "z-[1] -translate-y-0.5 scale-[1.02] shadow-[0_16px_36px_-20px_rgba(15,60,140,0.45)]"
                  : "opacity-75 hover:opacity-95",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-2xl transition-opacity duration-500",
                  row.bar,
                  on ? "opacity-100" : "opacity-40",
                )}
                aria-hidden
              />
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500",
                  row.tone,
                  on && "opacity-100",
                )}
                aria-hidden
              />
              <div className="relative flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                    row.chip,
                    on && "animate-sms-ping",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.16em]",
                        row.labelClass,
                      )}
                    >
                      {row.label}
                    </p>
                    {on ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-foreground/70 shadow-sm">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Sending · 5p
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-sm leading-snug text-foreground/85 transition-all duration-500",
                      on && "animate-sms-slide",
                    )}
                    key={`${row.label}-${on ? "on" : "off"}`}
                  >
                    {row.sample}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="relative mt-6 text-xs text-muted-foreground">{addOns.smsFooter}</p>
    </div>
  );
}

export function PricingAddOns({ addOns }: { addOns: PricingContent["addOns"] }) {
  return (
    <section className="mt-24">
      <Reveal>
        <h2 className="text-2xl sm:text-3xl">{addOns.sectionTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{addOns.sectionBody}</p>
      </Reveal>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Reveal delay={60}>
          <div className="surface-panel group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] sm:p-7">
            <div
              className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden
            />
            <div className="relative flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="size-5 animate-icon-float text-primary" />
              </div>
              <h3 className="text-lg">{addOns.whiteLabelTitle}</h3>
            </div>
            <p className="relative mt-4 text-3xl font-semibold tracking-tight">
              {addOns.whiteLabelPrice}
            </p>
            <p className="relative mt-3 text-sm text-muted-foreground">
              {addOns.whiteLabelBody}
            </p>

            {addOns.whiteLabelImage.trim() ? (
              <img
                src={addOns.whiteLabelImage}
                alt={addOns.whiteLabelTitle}
                className="relative mt-6 w-full rounded-xl object-contain"
              />
            ) : (
              <DemoAppStage />
            )}

            <div className="relative mt-6 space-y-2 rounded-xl border border-border/70 bg-surface/60 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Paid to Apple / Google — not OrderWeb
              </p>
              {STORE_FEES.map((fee) => (
                <div
                  key={fee.label}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {fee.label.includes("Apple") ? (
                      <Apple className="size-3.5 shrink-0" />
                    ) : (
                      <Store className="size-3.5 shrink-0" />
                    )}
                    <span>
                      {fee.label}
                      <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
                        {fee.note}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {fee.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <SmsAddOnCard addOns={addOns} />
        </Reveal>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">{addOns.guideNote}</p>
    </section>
  );
}
