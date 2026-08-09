import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import dashboardImage from "@/assets/pos-screen-dashboard.png";
import storeOpsImage from "@/assets/pos-screen-store-ops.png";
import businessAdminImage from "@/assets/pos-screen-business-admin.png";
import staffCustomersImage from "@/assets/pos-screen-staff-customers.png";

export type PosScreen = {
  src: string;
  alt: string;
  label: string;
};

/** Drop new screenshots in here when ready. */
export const POS_MACBOOK_SCREENS: PosScreen[] = [
  {
    src: dashboardImage,
    alt: "OrderWeb dashboard with sales, orders and menu management",
    label: "Dashboard",
  },
  {
    src: staffCustomersImage,
    alt: "OrderWeb staff hours and customer loyalty management",
    label: "Staff & customers",
  },
  {
    src: storeOpsImage,
    alt: "OrderWeb store operations — vouchers, gift cards, delivery and reservations",
    label: "Store operations",
  },
  {
    src: businessAdminImage,
    alt: "OrderWeb business and admin — branches, licences, API and team",
    label: "Business & admin",
  },
];

export function MacBookShowcase({
  screens = POS_MACBOOK_SCREENS,
  className,
}: {
  screens?: PosScreen[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const total = screens.length;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (total < 2 || reduced) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % total);
    }, 4200);
    return () => window.clearInterval(id);
  }, [total, reduced]);

  if (total === 0) {
    return (
      <div className={cn("relative mx-auto w-full max-w-4xl", className)}>
        <MacBookFrame>
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-primary/70">
              Product screens
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Screenshots coming soon.
            </p>
          </div>
        </MacBookFrame>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[min(100%,36rem)] overflow-x-clip sm:max-w-3xl lg:max-w-4xl",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute bottom-6 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-[100%] bg-foreground/[0.08] blur-2xl sm:bottom-8 sm:h-10"
        aria-hidden
      />

      <MacBookFrame>
        <div className="relative h-full w-full overflow-hidden">
          <div
            className={cn(
              "flex h-full will-change-transform",
              reduced
                ? ""
                : "transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            )}
            style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
          >
            {screens.map((s, i) => (
              <div
                key={s.label}
                className="relative h-full w-full shrink-0 grow-0 basis-full"
              >
                <img
                  src={s.src}
                  alt={s.alt}
                  width={1600}
                  height={1000}
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain p-0.5 sm:p-2",
                    reduced
                      ? ""
                      : "transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    i === active
                      ? "scale-100 opacity-100"
                      : "scale-[0.985] opacity-55",
                  )}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </MacBookFrame>

      {total > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
          {screens.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-label={`Show ${s.label} screen`}
              aria-current={i === active ? "true" : undefined}
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
      ) : null}
    </div>
  );
}

function MacBookFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        className="relative rounded-[12px] p-[6px] sm:rounded-[18px] sm:p-[10px]"
        style={{
          background:
            "linear-gradient(165deg, #e8ebf0 0%, #c5ccd8 22%, #9aa3b3 58%, #7a8494 100%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.65) inset, 0 28px 56px -28px rgba(15, 30, 60, 0.4)",
        }}
      >
        <div
          className="rounded-[8px] p-[5px] sm:rounded-[12px] sm:p-[8px]"
          style={{
            background: "linear-gradient(180deg, #262b36 0%, #12151c 100%)",
          }}
        >
          <div className="mb-1 flex justify-center sm:mb-1.5">
            <span className="size-[4px] rounded-full bg-black/80 ring-1 ring-white/10 sm:size-[6px]" />
          </div>

          <div className="relative overflow-hidden rounded-[4px] bg-[#f7f9fc] sm:rounded-[7px]">
            <div className="relative aspect-[16/10] w-full">{children}</div>
          </div>
        </div>
      </div>

      <div
        className="relative mx-auto h-[5px] w-[101%] -translate-x-[0.5%] sm:h-[6px] sm:w-[101.5%] sm:-translate-x-[0.75%]"
        style={{
          background:
            "linear-gradient(180deg, #b8c0cd 0%, #8e97a7 50%, #6d7686 100%)",
          borderRadius: "0 0 3px 3px",
        }}
      />

      <div
        className="relative mx-auto h-[8px] w-[102%] -translate-x-[1%] sm:h-[11px] sm:w-[106%] sm:-translate-x-[2.8%]"
        style={{
          background:
            "linear-gradient(180deg, #e4e8ef 0%, #c8cfda 42%, #a0a9b8 100%)",
          borderRadius: "0 0 10px 10px",
          boxShadow: "0 12px 28px -16px rgba(15, 30, 60, 0.32)",
        }}
      >
        <div className="absolute left-1/2 top-0 h-[2px] w-10 -translate-x-1/2 rounded-b-sm bg-[#808897]/50 sm:w-16" />
      </div>
    </>
  );
}
