import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import contactLondonHero from "@/assets/contact-london-hero.png";
import { getPublicPageFn, sendContactMessageFn } from "@/lib/cms/cms.functions";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { ContactContent } from "@/lib/cms/types";
import {
  contactPageJsonLd,
  pageBreadcrumbJsonLd,
  withJsonLd,
} from "@/lib/site/jsonLd";

const TITLE = "Contact OrderWeb — POS Demos & Project Quotes";
const DESC =
  "Get in touch with the OrderWeb team in Brockley, London. Book a demo, ask about our POS platform, or discuss a bespoke software project.";

const BRAND_GRADIENT =
  "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)";

const MAX_HELP_WORDS = 200;

function limitToWords(text: string, max: number) {
  const matches = [...text.matchAll(/\S+/g)];
  if (matches.length <= max) return text;
  const last = matches[max - 1];
  if (!last) return text;
  return text.slice(0, last.index + last[0].length);
}

type ContactSearch = {
  topic?: string;
  business?: string;
  style?: string;
  theme?: string;
  layout?: string;
  brand?: string;
  tone?: string;
};

function parseContactSearch(search: Record<string, unknown>): ContactSearch {
  const result: ContactSearch = {};
  for (const key of [
    "topic",
    "business",
    "style",
    "theme",
    "layout",
    "brand",
    "tone",
  ] as const) {
    const value = search[key];
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>) => parseContactSearch(search),
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "contact", preview } });
    return page as {
      content: ContactContent;
      seo: import("@/lib/cms/types").PageSeo;
      preview: boolean;
    };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, { title: TITLE, description: DESC, path: "/contact" }),
      pageBreadcrumbJsonLd("contact"),
      contactPageJsonLd(),
    ),
  component: ContactPage,
});

function ContactPage() {
  const { content: cms, preview } = Route.useLoaderData();
  const previewBanner = preview ? (
    <div className="sticky top-0 z-[80] bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white">
      Draft preview — not live. Publish from Admin to go live.
    </div>
  ) : null;
  const pageRef = useRef<HTMLDivElement>(null);
  const search = Route.useSearch();
  const sendMessage = useServerFn(sendContactMessageFn);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const designPrefill =
    search.topic === "website-design"
      ? `I'd like a custom website build.\n\nDesign direction from the studio:\n• Brand: ${search.brand ?? "—"}\n• Business: ${search.business ?? "—"}\n• Style: ${search.style ?? "—"}\n• Colour: ${search.theme ?? "—"}\n• Layout: ${search.layout ?? "—"}\n• Tone: ${search.tone ?? "—"}\n\nHappy to refine this with you.`
      : undefined;
  const [message, setMessage] = useState(() =>
    limitToWords(designPrefill ?? "", MAX_HELP_WORDS),
  );
  const heroImage = cms.hero.image || contactLondonHero;

  useEffect(() => {
    setMessage(limitToWords(designPrefill ?? "", MAX_HELP_WORDS));
  }, [designPrefill]);
  const telHref = `tel:${cms.display.phone.replace(/[^\d+]/g, "")}`;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !pageRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const hero = pageRef.current!.querySelectorAll(".contact-hero-copy > *");
        const visual = pageRef.current!.querySelector(".contact-hero-visual");
        const form = pageRef.current!.querySelector(".contact-form");
        const cards = pageRef.current!.querySelectorAll(".contact-card");
        const rows = pageRef.current!.querySelectorAll(".contact-row");
        const icons = pageRef.current!.querySelectorAll(".contact-icon");
        const fields = pageRef.current!.querySelectorAll(".contact-field");

        if (reduce) {
          gsap.set([hero, visual, form, cards, rows, icons, fields], {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
          });
          return;
        }

        gsap.fromTo(
          hero,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 },
        );

        if (visual) {
          gsap.fromTo(
            visual,
            { opacity: 0, x: 48, scale: 0.86, rotate: 4 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              rotate: 0,
              duration: 1.15,
              ease: "back.out(1.2)",
              delay: 0.1,
            },
          );
          const sparks = visual.querySelectorAll(".contact-hero-spark");
          if (sparks.length) {
            gsap.fromTo(
              sparks,
              { opacity: 0, scale: 0 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.55,
                ease: "back.out(2)",
                stagger: 0.12,
                delay: 0.55,
              },
            );
          }
        }

        gsap.fromTo(
          form,
          { opacity: 0, y: 28, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            delay: 0.15,
            clearProps: "transform",
          },
        );

        gsap.fromTo(
          fields,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.06,
            delay: 0.35,
          },
        );

        gsap.fromTo(
          cards,
          { opacity: 0, y: 26, x: 16 },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            delay: 0.28,
            clearProps: "transform",
          },
        );

        gsap.fromTo(
          rows,
          { opacity: 0, x: 28, y: 10 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.14,
            delay: 0.45,
            scrollTrigger: {
              trigger: rows[0] ?? cards[1],
              start: "top 88%",
              once: true,
            },
            clearProps: "transform",
          },
        );

        gsap.fromTo(
          icons,
          { opacity: 0, scale: 0.35, rotate: -18 },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.65,
            ease: "back.out(2)",
            stagger: 0.14,
            delay: 0.55,
            scrollTrigger: {
              trigger: rows[0] ?? cards[1],
              start: "top 88%",
              once: true,
            },
            clearProps: "transform",
          },
        );
      }, pageRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <>
      {previewBanner}
      <div ref={pageRef} className="overflow-x-hidden pb-16 pt-24 sm:pb-24 sm:pt-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="contact-hero-copy min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.3em]">
              {cms.hero.eyebrow}
            </p>
            <h1 className="mt-3 max-w-xl text-[2.15rem] leading-[1.1] text-[#0a1a4a] sm:mt-4 sm:text-5xl lg:text-6xl">
              {cms.hero.headline}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#243447] sm:mt-5 sm:text-lg">
              {cms.hero.body}
            </p>
          </div>

          <div className="contact-hero-visual relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden
              className="contact-hero-glow absolute left-1/2 top-[58%] size-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(97,195,236,0.34) 0%, rgba(47,111,184,0.12) 45%, transparent 70%)",
              }}
            />
            <div
              aria-hidden
              className="contact-hero-orbit pointer-events-none absolute left-1/2 top-[52%] hidden h-[78%] w-[84%] rounded-[50%] border border-dashed border-[#61c3ec]/35 sm:block"
            />
            <div
              aria-hidden
              className="contact-hero-orbit-slow pointer-events-none absolute left-1/2 top-[52%] hidden h-[62%] w-[68%] rounded-[50%] border border-dotted border-[#2f6fb8]/25 sm:block"
            />
            {(
              [
                { className: "left-[12%] top-[22%] size-2", delay: "0s" },
                { className: "right-[14%] top-[28%] size-1.5", delay: "0.5s" },
                { className: "left-[18%] bottom-[24%] size-1.5", delay: "1s" },
                { className: "right-[16%] bottom-[30%] size-2", delay: "1.4s" },
              ] as const
            ).map((spark) => (
              <span
                key={spark.className}
                aria-hidden
                className={`contact-hero-spark pointer-events-none absolute z-[2] hidden rounded-full bg-[#61c3ec] shadow-[0_0_12px_rgba(97,195,236,0.75)] sm:block ${spark.className}`}
                style={{ animationDelay: spark.delay }}
              />
            ))}
            <div className="relative z-[1] overflow-hidden">
              <img
                src={heroImage}
                alt="Contact OrderWeb in London — email, phone and support across the UK"
                className="animate-contact-hero mx-auto w-full object-contain drop-shadow-[0_18px_36px_rgba(10,26,74,0.12)]"
              />
              <div aria-hidden className="contact-hero-shine pointer-events-none absolute inset-0 hidden sm:block" />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-16 sm:gap-10 lg:grid-cols-[1.3fr_1fr]">
          {submitted ? (
            <div
              className="contact-form flex min-h-[280px] flex-col items-start justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-[0_16px_40px_-28px_rgba(47,111,184,0.35)] sm:min-h-[340px] sm:p-8 md:p-10"
              role="status"
              aria-live="polite"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                <CheckCircle2 className="size-6" aria-hidden />
              </div>
              <p className="mt-4 text-lg font-semibold text-emerald-950 sm:text-xl">
                Message Sent Successfully
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-emerald-900 sm:text-[15px]">
                {cms.form.successMessage}
              </p>
              <p className="mt-4 text-xs text-emerald-800/80">
                Refresh the page if you want to send another message.
              </p>
            </div>
          ) : (
            <form
              className="contact-form space-y-5 rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(47,111,184,0.35)] sm:space-y-6 sm:p-8 md:p-10"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fd = new FormData(form);
                setFormError(null);
                setSending(true);
                try {
                  const res = await sendMessage({
                    data: {
                      name: String(fd.get("name") ?? ""),
                      email: String(fd.get("email") ?? ""),
                      company: String(fd.get("company") ?? ""),
                      phone: String(fd.get("phone") ?? ""),
                      message: limitToWords(message, MAX_HELP_WORDS),
                    },
                  });
                  if (!res.ok) {
                    setFormError(res.error || "Could not send your message. Please try again.");
                    return;
                  }
                  setSubmitted(true);
                } catch {
                  setFormError("Could not send your message. Please try again.");
                } finally {
                  setSending(false);
                }
              }}
            >
              {formError ? (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
                  role="alert"
                >
                  {formError}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="contact-field">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required className="mt-2" autoComplete="name" />
                </div>
                <div className="contact-field">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-2"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
                <div className="contact-field">
                  <Label htmlFor="company">Company / restaurant</Label>
                  <Input id="company" name="company" className="mt-2" autoComplete="organization" />
                </div>
                <div className="contact-field">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="mt-2"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
              </div>

              <div className="contact-field">
                <Label htmlFor="message">How can we help?</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={message}
                  onChange={(e) =>
                    setMessage(limitToWords(e.target.value, MAX_HELP_WORDS))
                  }
                  placeholder={cms.form.messagePlaceholder}
                  className="mt-2 min-h-[140px]"
                />
              </div>

              <div className="contact-field">
                <Button
                  type="submit"
                  size="lg"
                  disabled={sending}
                  className="btn-brand-gradient w-full gap-2 sm:w-auto"
                >
                  <Send className="size-4" />
                  {sending ? "Sending…" : cms.form.submitLabel}
                </Button>
              </div>
            </form>
          )}

          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="contact-card rounded-2xl border border-[#61c3ec]/25 bg-white p-5 sm:p-6">
              <h2 className="text-xl text-[#0a1a4a]">{cms.display.companyName}</h2>
              <p className="mt-1 text-[15px] leading-relaxed text-[#243447]">
                {cms.display.companyBlurb}
              </p>
            </div>

            <div className="contact-card divide-y divide-[#61c3ec]/20 overflow-hidden rounded-2xl border border-[#61c3ec]/25 bg-white">
              <a
                href={`mailto:${cms.display.email}`}
                className="contact-row contact-row-live group flex items-center gap-3 p-4 sm:gap-4 sm:p-5"
              >
                <div
                  className="contact-icon contact-icon-mail flex size-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundImage: BRAND_GRADIENT }}
                >
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#2f6fb8]">
                    Email
                  </p>
                  <p className="mt-0.5 break-all font-medium text-[#0a1a4a] transition-colors group-hover:text-[#2f6fb8]">
                    {cms.display.email}
                  </p>
                </div>
              </a>
              <a
                href={telHref}
                className="contact-row contact-row-live group flex items-center gap-3 p-4 sm:gap-4 sm:p-5"
              >
                <div
                  className="contact-icon contact-icon-phone flex size-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundImage: BRAND_GRADIENT }}
                >
                  <Phone className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#2f6fb8]">
                    Phone
                  </p>
                  <p className="mt-0.5 font-medium text-[#0a1a4a] transition-colors group-hover:text-[#2f6fb8]">
                    {cms.display.phone}
                  </p>
                </div>
              </a>
              <div className="contact-row contact-row-live flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
                <div
                  className="contact-icon contact-icon-pin flex size-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundImage: BRAND_GRADIENT }}
                >
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#2f6fb8]">
                    Address
                  </p>
                  <p className="mt-0.5 font-medium text-[#0a1a4a]">{cms.display.address}</p>
                </div>
              </div>
            </div>

            <div className="contact-card rounded-2xl border border-[#61c3ec]/25 bg-white p-5 sm:p-6">
              <p className="text-[15px] leading-relaxed text-[#243447]">{cms.display.demoNote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
