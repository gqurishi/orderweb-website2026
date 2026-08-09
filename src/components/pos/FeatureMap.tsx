import { useEffect, useRef, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type FeatureItem = {
  icon: ComponentType<LucideProps>;
  label: string;
};

type FeatureGroup = {
  icon: ComponentType<LucideProps>;
  title: string;
  items: FeatureItem[];
};

/** Matches OrderWeb logo: bright cyan → deep navy */
const ICON_GRADIENTS = [
  "linear-gradient(145deg, #abeafd 0%, #61c3ec 28%, #2f6fb8 62%, #0a1a4a 100%)",
  "linear-gradient(145deg, #9fe4fb 0%, #4eb4e8 30%, #285ea8 65%, #08153f 100%)",
  "linear-gradient(150deg, #b7effd 0%, #5fbfeb 26%, #356fba 60%, #0c204f 100%)",
  "linear-gradient(140deg, #a6e8fc 0%, #58b8e6 32%, #1f5aa3 68%, #061234 100%)",
  "linear-gradient(145deg, #98dff9 0%, #4aade4 28%, #2a68b2 64%, #0a1844 100%)",
  "linear-gradient(148deg, #b0ecfd 0%, #66c6ee 30%, #326db6 66%, #0d1f4d 100%)",
];

export function FeatureMap({ groups }: { groups: FeatureGroup[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const cards = gsap.utils.toArray<HTMLElement>(".feature-card");
        const icons = gsap.utils.toArray<HTMLElement>(".feature-icon");

        if (reduced) {
          gsap.set(cards, { opacity: 1, y: 0, clearProps: "all" });
          gsap.set(".feature-item", { opacity: 1, x: 0 });
          gsap.set(icons, { opacity: 1, scale: 1 });
          return;
        }

        gsap.set(cards, { opacity: 0, y: 36, scale: 0.97 });
        gsap.set(".feature-item", { opacity: 0, x: -10 });
        gsap.set(icons, { opacity: 0, scale: 0.5, rotate: -12 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 78%",
            once: true,
          },
        });

        tl.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
        })
          .to(
            icons,
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 0.55,
              ease: "back.out(1.7)",
              stagger: 0.1,
            },
            0.08,
          )
          .to(
            ".feature-item",
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: "power2.out",
              stagger: 0.035,
            },
            "-=0.35",
          );
      }, rootRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
    >
      {groups.map((group, index) => (
        <article
          key={group.title}
          className="feature-card surface-panel group flex h-full flex-col p-5 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[var(--shadow-glow)] sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span
              className="feature-icon feature-icon-gradient animate-icon-float flex size-10 items-center justify-center rounded-full text-white transition-transform duration-500 ease-out group-hover:scale-110 group-hover:[animation-play-state:paused] sm:size-11"
              style={{
                backgroundImage: ICON_GRADIENTS[index % ICON_GRADIENTS.length],
                animationDelay: `${index * 0.18}s`,
              }}
            >
              <group.icon className="size-4 drop-shadow-sm sm:size-5" strokeWidth={2.25} />
            </span>
            <h3 className="text-base text-[#0a1a4a] sm:text-lg">{group.title}</h3>
          </div>
          <ul className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
            {group.items.map((item) => (
              <li
                key={item.label}
                className="feature-item flex items-center gap-2.5 text-sm text-[#243447] transition-colors duration-300 hover:text-[#0a1a4a]"
              >
                <item.icon
                  className="size-3.5 shrink-0 text-[#2f6fb8]/70"
                  strokeWidth={1.75}
                />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
