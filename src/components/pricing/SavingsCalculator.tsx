import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const DEFAULT_ORDERWEB_MONTHLY = 59.99;

export function parsePlanPrice(price: string | undefined) {
  const n = Number((price ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_ORDERWEB_MONTHLY;
}

function formatGbp(value: number, compact = false) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: compact || value >= 100 ? 0 : 2,
  }).format(value);
}

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function useCountUp(target: number, duration = 520) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef(0);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const start = performance.now();
    cancelAnimationFrame(frameRef.current);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const next = from + (target - from) * eased;
      setDisplay(next);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
}

function FriendlyNumberField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  sliderMax,
  prefix,
  suffix,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Cap the slider separately so large typed values stay easy. */
  sliderMax?: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);
  const trackMax = sliderMax ?? max;

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  const commit = (raw: string) => {
    const parsed = Number(raw.replace(/,/g, ""));
    const next = clampNumber(Number.isNaN(parsed) ? value : parsed, min, max);
    onChange(next);
    setDraft(String(next));
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    // Allow empty / in-progress typing without fighting the user.
    if (next === "" || /^\d*\.?\d*$/.test(next)) {
      setDraft(next);
      if (next === "" || next === ".") return;
      const parsed = Number(next);
      if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
        onChange(parsed);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <Label htmlFor={id} className="text-[15px]">
          {label}
        </Label>
        <div className="flex items-center gap-1.5">
          {prefix ? (
            <span className="text-sm font-medium text-muted-foreground">
              {prefix}
            </span>
          ) : null}
          <Input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            value={focused ? draft : String(value)}
            onFocus={() => {
              setFocused(true);
              setDraft(String(value));
            }}
            onChange={onInputChange}
            onBlur={() => {
              setFocused(false);
              commit(draft);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            className="h-11 w-full rounded-xl border-border/80 bg-background text-right text-base font-semibold tabular-nums shadow-none focus-visible:ring-primary/40 sm:w-[7.25rem]"
          />
          {suffix ? (
            <span className="min-w-4 text-sm font-medium text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
      <Slider
        value={[Math.min(trackMax, Math.max(min, value))]}
        min={min}
        max={trackMax}
        step={step}
        onValueChange={([v]) => onChange(v)}
        aria-label={label}
      />
    </div>
  );
}

function buildInsight({
  monthlySave,
  commissionPct,
  thirdPartyCost,
  monthlyFee,
}: {
  monthlySave: number;
  commissionPct: number;
  thirdPartyCost: number;
  monthlyFee: number;
}) {
  if (monthlySave <= 0) {
    return "At this volume your marketplace fees are already near our flat plan. OrderWeb still takes 0% of every order.";
  }

  return `That's ${formatGbp(thirdPartyCost, true)} a month going to apps at ${commissionPct}%. With OrderWeb's flat ${formatGbp(monthlyFee)}, you keep about ${formatGbp(monthlySave, true)} more in the till.`;
}

export function SavingsCalculator({
  headline,
  body,
  monthlyFee = DEFAULT_ORDERWEB_MONTHLY,
}: {
  headline?: string;
  body?: string;
  monthlyFee?: number;
}) {
  const headingId = useId();
  const [orders, setOrders] = useState(500);
  const [avgOrder, setAvgOrder] = useState(20);
  const [commissionPct, setCommissionPct] = useState(30);
  const [pulse, setPulse] = useState(0);
  const fee = monthlyFee > 0 ? monthlyFee : DEFAULT_ORDERWEB_MONTHLY;

  const gmv = orders * avgOrder;
  const thirdPartyCost = gmv * (commissionPct / 100);
  const monthlySave = Math.max(0, thirdPartyCost - fee);
  const yearlySave = monthlySave * 12;
  const animatedSave = useCountUp(monthlySave);
  const animatedYear = useCountUp(yearlySave, 620);
  const insight = buildInsight({
    monthlySave,
    commissionPct,
    thirdPartyCost,
    monthlyFee: fee,
  });

  useEffect(() => {
    setPulse((p) => p + 1);
  }, [monthlySave]);

  return (
    <section
      id="savings-calculator"
      className="surface-panel relative overflow-hidden"
      aria-labelledby={headingId}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 8% 0%, color-mix(in oklab, var(--primary-glow) 28%, transparent), transparent 58%), radial-gradient(ellipse 55% 45% at 100% 90%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
        {/* Inputs */}
        <div className="border-b border-border p-5 sm:p-7 md:p-9 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-4 animate-icon-float" />
            </span>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
              AI savings calculator
            </p>
          </div>

          <h2
            id={headingId}
            className="mt-4 text-3xl leading-tight sm:text-4xl"
          >
            {headline || "How much could your restaurant save?"}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-[15px]">
            {body ||
              `Type your numbers or drag the sliders. We compare what apps take today with OrderWeb’s flat ${formatGbp(fee)} — 0% commission.`}
          </p>

          <div className="mt-8 space-y-8">
            <FriendlyNumberField
              id="calc-orders"
              label="Monthly online orders"
              value={orders}
              min={50}
              max={10000}
              sliderMax={5000}
              step={10}
              onChange={setOrders}
            />
            <FriendlyNumberField
              id="calc-aov"
              label="Average order value"
              value={avgOrder}
              min={5}
              max={120}
              sliderMax={80}
              step={1}
              prefix="£"
              onChange={setAvgOrder}
            />
            <FriendlyNumberField
              id="calc-commission"
              label="3rd-party commission you pay"
              value={commissionPct}
              min={5}
              max={45}
              step={1}
              suffix="%"
              onChange={setCommissionPct}
            />
            <p className="text-xs text-muted-foreground">
              Tip: most food apps take 30–35%. OrderWeb takes 0%.
            </p>
          </div>
        </div>

        {/* Savings focus */}
        <div className="flex flex-col justify-between gap-8 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary-glow/10 p-5 sm:p-7 md:p-9">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary shadow-sm">
              <TrendingUp className="size-3.5" />
              You could save
            </div>

            <div key={pulse} className={cn("mt-5 origin-left animate-calc-pop")}>
              <p className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-7xl">
                {formatGbp(animatedSave, true)}
              </p>
              <p className="mt-2 text-lg font-medium text-foreground/80 sm:text-xl">
                every month
              </p>
            </div>

            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              That&apos;s about{" "}
              <span className="font-semibold text-foreground">
                {formatGbp(animatedYear, true)} a year
              </span>{" "}
              staying in your restaurant — not going to marketplace apps.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-background/75 p-4 transition-transform duration-500 hover:-translate-y-0.5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Apps take today
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground/70">
                  {formatGbp(thirdPartyCost, true)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {commissionPct}% of {formatGbp(gmv, true)} orders
                </p>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 transition-transform duration-500 hover:-translate-y-0.5">
                <p className="text-xs uppercase tracking-wider text-primary">
                  OrderWeb plan
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-primary">
                  {formatGbp(fee)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Flat fee · 0% commission
                </p>
              </div>
            </div>

            <div
              className="mt-6 rounded-2xl border border-primary/15 bg-background/70 p-4 shadow-sm"
              aria-live="polite"
            >
              <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground/85">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                {insight}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="animate-cta-bounce">
              <Link to="/contact" search={{}}>Book a demo — no pay now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#orderweb-pos">See the flat plan</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
