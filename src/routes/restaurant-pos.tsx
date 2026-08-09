import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Clock3,
  CreditCard,
  Database,
  Gift,
  Headphones,
  KeyRound,
  LayoutGrid,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Printer,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
  Users,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { FeatureMap } from "@/components/pos/FeatureMap";
import { MacBookShowcase } from "@/components/pos/MacBookShowcase";
import { PaymentsSection } from "@/components/home/PaymentsSection";
import hardwareHero from "@/assets/pos-hardware-hero.png";
import { getPublicPageFn } from "@/lib/cms/cms.functions";
import { pageHeadFromSeo } from "@/lib/cms/pageHead";
import type { RestaurantPosContent } from "@/lib/cms/types";
import { pageBreadcrumbJsonLd, withJsonLd } from "@/lib/site/jsonLd";

const TITLE = "Restaurant POS for UK Restaurants — 0% Commission | OrderWeb";
const DESC =
  "Commission-free restaurant POS for UK venues. Orders, staff, payments and reports in one system — book a demo with OrderWeb.";

export const Route = createFileRoute("/restaurant-pos")({
  loader: async ({ location }) => {
    const preview = location.href.includes("cmsPreview=1");
    const page = await getPublicPageFn({ data: { key: "restaurant-pos", preview } });
    return page as {
      content: RestaurantPosContent;
      seo: import("@/lib/cms/types").PageSeo;
      preview: boolean;
    };
  },
  head: ({ loaderData }) =>
    withJsonLd(
      pageHeadFromSeo(loaderData?.seo, {
        title: TITLE,
        description: DESC,
        path: "/restaurant-pos",
      }),
      pageBreadcrumbJsonLd("restaurant-pos"),
    ),
  component: PosPage,
});

const FEATURE_GROUPS = [
  {
    icon: LayoutGrid,
    title: "Core Operations",
    items: [
      { icon: LayoutGrid, label: "Dashboard" },
      { icon: ShoppingBag, label: "All Orders" },
      { icon: Clock3, label: "Advance Orders" },
      { icon: ClipboardList, label: "Menu Management" },
    ],
  },
  {
    icon: Users,
    title: "Staff & Customers",
    items: [
      { icon: Clock3, label: "Staff Hours" },
      { icon: Users, label: "Customers" },
      { icon: Gift, label: "Loyalty Points" },
      { icon: Star, label: "Loyalty Rewards" },
    ],
  },
  {
    icon: Tag,
    title: "Store Operations",
    items: [
      { icon: Tag, label: "Vouchers" },
      { icon: Gift, label: "Shop & Gift Cards" },
      { icon: MapPin, label: "Delivery Zones" },
      { icon: CalendarDays, label: "Reservations" },
      { icon: ClipboardList, label: "Order Configuration" },
    ],
  },
  {
    icon: Printer,
    title: "System & Reports",
    items: [
      { icon: Printer, label: "Printers" },
      { icon: CreditCard, label: "Payments" },
      { icon: Settings2, label: "Email Settings" },
      { icon: MessageSquare, label: "SMS & Messaging" },
      { icon: Mail, label: "Email Templates" },
      { icon: ChartColumn, label: "Reports" },
    ],
  },
  {
    icon: Building2,
    title: "Business & Admin",
    items: [
      { icon: Building2, label: "All Branches" },
      { icon: KeyRound, label: "License Management" },
      { icon: Database, label: "POS API Management" },
      { icon: UsersRound, label: "Team & Users" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Additional",
    items: [
      { icon: Megaphone, label: "Marketing" },
      { icon: Star, label: "Reviews" },
      { icon: Settings2, label: "Settings" },
      { icon: Headphones, label: "Support" },
    ],
  },
];

function PosPage() {
  const { content: cms, preview } = Route.useLoaderData();
  const previewBanner = preview ? (
    <div className="sticky top-0 z-[80] bg-[#0a1a4a] px-4 py-2 text-center text-xs font-semibold text-white">
      Draft preview — not live. Publish from Admin to go live.
    </div>
  ) : null;
  const heroImage = cms.hero.image || hardwareHero;
  const groups = (cms.featureMap.groups.length ? cms.featureMap.groups : FEATURE_GROUPS.map((g) => ({
    title: g.title,
    items: g.items.map((item) => item.label),
  }))).map((group, i) => {
    const base = FEATURE_GROUPS[i % FEATURE_GROUPS.length]!;
    return {
      icon: base.icon,
      title: group.title || base.title,
      items: group.items.map((label, j) => ({
        icon: base.items[j % base.items.length]!.icon,
        label,
      })),
    };
  });

  return (
    <>
      {previewBanner}
      <div className="overflow-x-hidden pb-16 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-24 sm:px-5 sm:pt-32">
        <Reveal>
          <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0 order-2 lg:order-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
                {cms.hero.eyebrow}
              </p>
              <h1 className="mt-3 max-w-xl text-[2.15rem] leading-[1.1] text-[#0a1a4a] sm:mt-4 sm:text-5xl lg:text-6xl">
                {cms.hero.headline}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#243447] sm:mt-5 sm:text-lg">
                {cms.hero.body}
              </p>
            </div>
            <figure className="order-1 mx-auto flex w-full max-w-md items-center justify-center sm:max-w-xl lg:order-2 lg:max-w-none">
              <img
                src={heroImage}
                alt="OrderWeb POS setup with touchscreen till, receipt printer, card terminal and customer display"
                width={1200}
                height={900}
                className="h-auto w-full object-contain"
                loading="eager"
              />
            </figure>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <section className="mt-14 sm:mt-20">
            <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
                {cms.productTour.eyebrow}
              </p>
              <h2 className="mt-3 text-[1.85rem] leading-[1.12] text-[#0a1a4a] sm:text-4xl">
                {cms.productTour.headline}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#243447] sm:text-lg">
                {cms.productTour.body}
              </p>
              {cms.hero.primaryCta?.trim() ? (
                <div className="mt-6">
                  <Button
                    asChild
                    size="lg"
                    className="btn-brand-gradient transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <Link to="/contact" search={{}}>
                      {cms.hero.primaryCta}
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
            <MacBookShowcase />
          </section>
        </Reveal>

        <Reveal delay={120}>
          <section className="mt-14 sm:mt-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
                {cms.whyChoose.eyebrow}
              </p>
              <h2 className="mt-3 text-[1.85rem] leading-[1.12] text-[#0a1a4a] sm:text-4xl">
                {cms.whyChoose.headline}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#243447] sm:text-lg">
                {cms.whyChoose.body}
              </p>
            </div>
            <div className="mt-8 grid gap-8 sm:mt-10 sm:grid-cols-3 sm:gap-10">
              {cms.whyChoose.points.map((point) => (
                <div key={point.title} className="text-left">
                  <h3 className="text-base font-semibold text-[#0a1a4a] sm:text-lg">
                    {point.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#243447] sm:text-[15px]">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      </div>

      <PaymentsSection content={cms.payments} />

      <div className="mx-auto max-w-6xl px-4 sm:px-5">
        <Reveal delay={140}>
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:text-xs sm:tracking-[0.28em]">
              {cms.featureMap.eyebrow}
            </p>
            <h2 className="mt-3 text-[1.85rem] leading-[1.12] text-[#0a1a4a] sm:text-4xl">
              {cms.featureMap.headline}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-[#243447] sm:text-lg">
              {cms.featureMap.body}
            </p>
          </div>
        </Reveal>

        <FeatureMap groups={groups} />

        <Reveal delay={80}>
          <section className="surface-panel mt-12 overflow-hidden bg-primary/5 p-6 transition-shadow duration-500 hover:shadow-[var(--shadow-glow)] sm:mt-16 sm:p-10">
            <div className="flex flex-col items-stretch justify-between gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f6fb8] sm:tracking-[0.28em]">
                  {cms.cta.eyebrow}
                </p>
                <h2 className="mt-3 max-w-xl text-[1.65rem] leading-[1.15] text-[#0a1a4a] sm:text-3xl">
                  {cms.cta.headline}
                </h2>
              </div>
              <Button
                asChild
                size="lg"
                className="btn-brand-gradient w-full shrink-0 transition-transform duration-300 hover:scale-[1.02] sm:w-auto"
              >
                <Link to="/contact" search={{}}>
                  {cms.cta.buttonLabel}
                </Link>
              </Button>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
    </>
  );
}
