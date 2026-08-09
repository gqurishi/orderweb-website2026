import { DEFAULT_PAGES } from "./defaults";
import type {
  AboutContent,
  DpaContent,
  FaqContent,
  HomeContent,
  LegalPageContent,
  PageContentMap,
  PageKey,
  PricingContent,
  RestaurantPosContent,
  SoftwareContent,
  WebsiteContent,
} from "./types";

/** Deep-merge saved content onto defaults so new fields appear after schema updates. */
export function mergePageContent<K extends PageKey>(
  key: K,
  saved: Partial<PageContentMap[K]> | undefined,
): PageContentMap[K] {
  const base = structuredClone(DEFAULT_PAGES[key]);
  if (!saved) return base;

  if (key === "about") {
    return mergeAbout(base as AboutContent, saved as Partial<AboutContent>) as PageContentMap[K];
  }
  if (key === "home") {
    return mergeHome(base as HomeContent, saved as Partial<HomeContent>) as PageContentMap[K];
  }
  if (key === "restaurant-pos") {
    return mergeRestaurantPos(
      base as RestaurantPosContent,
      saved as Partial<RestaurantPosContent>,
    ) as PageContentMap[K];
  }
  if (key === "website") {
    return mergeWebsite(
      base as WebsiteContent,
      saved as Partial<WebsiteContent>,
    ) as PageContentMap[K];
  }
  if (key === "software") {
    return mergeSoftware(
      base as SoftwareContent,
      saved as Partial<SoftwareContent>,
    ) as PageContentMap[K];
  }
  if (key === "pricing") {
    return mergePricing(
      base as PricingContent,
      saved as Partial<PricingContent>,
    ) as PageContentMap[K];
  }
  if (key === "privacy" || key === "terms" || key === "cookies") {
    return mergeLegalPage(
      base as LegalPageContent,
      saved as Partial<LegalPageContent>,
    ) as PageContentMap[K];
  }
  if (key === "faq") {
    return mergeFaq(base as FaqContent, saved as Partial<FaqContent>) as PageContentMap[K];
  }
  if (key === "dpa") {
    return mergeDpa(base as DpaContent, saved as Partial<DpaContent>) as PageContentMap[K];
  }

  return {
    ...base,
    ...saved,
    ...(typeof saved === "object" ? deepSectionMerge(base, saved) : {}),
  } as PageContentMap[K];
}

function deepSectionMerge<T extends Record<string, unknown>>(base: T, saved: Partial<T>): T {
  const out = { ...base };
  for (const [k, v] of Object.entries(saved)) {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof base[k] === "object") {
      (out as Record<string, unknown>)[k] = {
        ...(base[k] as object),
        ...(v as object),
      };
    } else if (v !== undefined) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

function mergeHome(base: HomeContent, saved: Partial<HomeContent>): HomeContent {
  const hero = { ...base.hero, ...saved.hero };
  const why = { ...base.why, ...saved.why };
  // migrate old title-only points
  if ((!why.pointBodies || why.pointBodies.length === 0) && why.points?.length) {
    why.pointBodies = why.points.map((_, i) => base.why.pointBodies[i] ?? "");
  }
  return {
    hero,
    why,
    services: { ...base.services, ...saved.services },
    reviews: { ...base.reviews, ...saved.reviews },
    cta: { ...base.cta, ...saved.cta },
  };
}

function mergeAbout(base: AboutContent, saved: Partial<AboutContent>): AboutContent {
  const legacy = saved as Partial<AboutContent> & {
    problem?: AboutContent["problem"] & { cardTitles?: string[] };
    difference?: AboutContent["difference"] & { cardTitles?: string[] };
  };

  const problemCards =
    legacy.problem?.cards ??
    legacy.problem?.cardTitles?.map((title, i) => ({
      hit: base.problem.cards[i]?.hit ?? "",
      title,
      body: base.problem.cards[i]?.body ?? "",
    })) ??
    base.problem.cards;

  const differenceCards =
    legacy.difference?.cards ??
    legacy.difference?.cardTitles?.map((title, i) => ({
      title,
      body: base.difference.cards[i]?.body ?? "",
    })) ??
    base.difference.cards;

  return {
    hero: { ...base.hero, ...saved.hero },
    problem: {
      ...base.problem,
      ...legacy.problem,
      cards: problemCards,
    },
    difference: {
      ...base.difference,
      ...legacy.difference,
      cards: differenceCards,
    },
    studio: {
      ...base.studio,
      ...saved.studio,
      cards: saved.studio?.cards?.length ? saved.studio.cards : base.studio.cards,
    },
    mission: { ...base.mission, ...saved.mission },
  };
}

function mergeRestaurantPos(
  base: RestaurantPosContent,
  saved: Partial<RestaurantPosContent>,
): RestaurantPosContent {
  return {
    hero: { ...base.hero, ...saved.hero },
    productTour: { ...base.productTour, ...saved.productTour },
    whyChoose: {
      ...base.whyChoose,
      ...saved.whyChoose,
      points: saved.whyChoose?.points?.length
        ? saved.whyChoose.points
        : base.whyChoose.points,
    },
    payments: {
      ...base.payments,
      ...saved.payments,
      points: saved.payments?.points?.length ? saved.payments.points : base.payments.points,
    },
    featureMap: {
      ...base.featureMap,
      ...saved.featureMap,
      groups: saved.featureMap?.groups?.length
        ? saved.featureMap.groups
        : base.featureMap.groups,
    },
    cta: { ...base.cta, ...saved.cta },
  };
}

function mergeWebsite(base: WebsiteContent, saved: Partial<WebsiteContent>): WebsiteContent {
  const demos =
    saved.demoShowcase?.demos?.length
      ? saved.demoShowcase.demos.map((demo, i) => {
          const fallback = base.demoShowcase.demos[i] ?? base.demoShowcase.demos[0]!;
          return {
            ...fallback,
            ...demo,
            tiles: demo.tiles?.length ? demo.tiles : fallback.tiles,
          };
        })
      : base.demoShowcase.demos;

  return {
    hero: {
      ...base.hero,
      ...saved.hero,
      audiences: saved.hero?.audiences?.length ? saved.hero.audiences : base.hero.audiences,
    },
    promiseStrip: { ...base.promiseStrip, ...saved.promiseStrip },
    demoShowcase: {
      ...base.demoShowcase,
      ...saved.demoShowcase,
      bullets: saved.demoShowcase?.bullets?.length
        ? saved.demoShowcase.bullets
        : base.demoShowcase.bullets,
      demos,
    },
    roadmap: {
      ...base.roadmap,
      ...saved.roadmap,
      steps: saved.roadmap?.steps?.length ? saved.roadmap.steps : base.roadmap.steps,
    },
    cta: { ...base.cta, ...saved.cta },
  };
}

function mergeSoftware(base: SoftwareContent, saved: Partial<SoftwareContent>): SoftwareContent {
  return {
    hero: {
      ...base.hero,
      ...saved.hero,
      chips: saved.hero?.chips?.length ? saved.hero.chips : base.hero.chips,
    },
    products: {
      web: {
        ...base.products.web,
        ...saved.products?.web,
        points: saved.products?.web?.points?.length
          ? saved.products.web.points
          : base.products.web.points,
        stack: saved.products?.web?.stack?.length
          ? saved.products.web.stack
          : base.products.web.stack,
      },
      mobile: {
        ...base.products.mobile,
        ...saved.products?.mobile,
        points: saved.products?.mobile?.points?.length
          ? saved.products.mobile.points
          : base.products.mobile.points,
        stack: saved.products?.mobile?.stack?.length
          ? saved.products.mobile.stack
          : base.products.mobile.stack,
      },
    },
    process: {
      ...base.process,
      ...saved.process,
      steps: saved.process?.steps?.length ? saved.process.steps : base.process.steps,
    },
    cta: { ...base.cta, ...saved.cta },
  };
}

function mergePricing(base: PricingContent, saved: Partial<PricingContent>): PricingContent {
  return {
    hero: { ...base.hero, ...saved.hero },
    highlights: {
      ...base.highlights,
      ...saved.highlights,
      cards: saved.highlights?.cards?.length
        ? saved.highlights.cards.map((card, i) => ({
            ...base.highlights.cards[i],
            ...card,
          }))
        : base.highlights.cards,
    },
    compare: { ...base.compare, ...saved.compare },
    plan: {
      ...base.plan,
      ...saved.plan,
      features: saved.plan?.features?.length ? saved.plan.features : base.plan.features,
    },
    sideStats: { ...base.sideStats, ...saved.sideStats },
    calculator: { ...base.calculator, ...saved.calculator },
    addOns: { ...base.addOns, ...saved.addOns },
    notes: saved.notes ?? base.notes,
  };
}

function mergeLegalPage(
  base: LegalPageContent,
  saved: Partial<LegalPageContent>,
): LegalPageContent {
  return {
    eyebrow: saved.eyebrow ?? base.eyebrow,
    title: saved.title ?? base.title,
    intro: saved.intro ?? base.intro,
    updated: saved.updated ?? base.updated,
    sections: Array.isArray(saved.sections)
      ? saved.sections.map((section, i) => ({
          title: section?.title ?? base.sections[i]?.title ?? "",
          body: section?.body ?? base.sections[i]?.body ?? "",
        }))
      : base.sections,
  };
}

function mergeFaq(base: FaqContent, saved: Partial<FaqContent>): FaqContent {
  return {
    eyebrow: saved.eyebrow ?? base.eyebrow,
    headline: saved.headline ?? base.headline,
    intro: saved.intro ?? base.intro,
    items: Array.isArray(saved.items)
      ? saved.items.map((item, i) => ({
          question: item?.question ?? base.items[i]?.question ?? "",
          answer: item?.answer ?? base.items[i]?.answer ?? "",
        }))
      : base.items,
    ctaHeadline: saved.ctaHeadline ?? base.ctaHeadline,
    ctaBody: saved.ctaBody ?? base.ctaBody,
    ctaButtonLabel: saved.ctaButtonLabel ?? base.ctaButtonLabel,
  };
}

function mergeDpa(base: DpaContent, saved: Partial<DpaContent>): DpaContent {
  return {
    eyebrow: saved.eyebrow ?? base.eyebrow,
    title: saved.title ?? base.title,
    intro: saved.intro ?? base.intro,
    updated: saved.updated ?? base.updated,
    callout: saved.callout ?? base.callout,
    sections: Array.isArray(saved.sections)
      ? saved.sections.map((section, i) => ({
          title: section?.title ?? base.sections[i]?.title ?? "",
          body: section?.body ?? base.sections[i]?.body ?? "",
        }))
      : base.sections,
    scheduleTitle: saved.scheduleTitle ?? base.scheduleTitle,
    scheduleIntro: saved.scheduleIntro ?? base.scheduleIntro,
    subProcessors: Array.isArray(saved.subProcessors)
      ? saved.subProcessors.map((row, i) => ({
          entity: row?.entity ?? base.subProcessors[i]?.entity ?? "",
          activity: row?.activity ?? base.subProcessors[i]?.activity ?? "",
          region: row?.region ?? base.subProcessors[i]?.region ?? "",
        }))
      : base.subProcessors,
    executionTitle: saved.executionTitle ?? base.executionTitle,
    executionIntro: saved.executionIntro ?? base.executionIntro,
    processorLabel: saved.processorLabel ?? base.processorLabel,
    processorName: saved.processorName ?? base.processorName,
    controllerLabel: saved.controllerLabel ?? base.controllerLabel,
    controllerName: saved.controllerName ?? base.controllerName,
    relatedNote: saved.relatedNote ?? base.relatedNote,
  };
}

export function maskApiKey(key: string | undefined | null) {
  if (!key) return null;
  if (key.length < 8) return "••••••••";
  return `${key.slice(0, 3)}••••${key.slice(-4)}`;
}
