import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Clock, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIMES = ["09:30", "11:00", "13:30", "15:00", "16:30"];

function nextWeekdays(count: number) {
  const out: { key: string; label: string; sub: string }[] = [];
  const d = new Date();
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    out.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-GB", { weekday: "short" }),
      sub: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    });
  }
  return out;
}

/** Live-feeling demo booking: real date logic, live availability, submit + confirmation. */
export function DemoBooking() {
  const days = useMemo(() => nextWeekdays(5), []);
  const [day, setDay] = useState(days[0]?.key ?? "");
  const [time, setTime] = useState<string>("11:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [venue, setVenue] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [watching, setWatching] = useState(9);

  // live "others viewing" ticker for a sense of activity
  useEffect(() => {
    const t = setInterval(() => {
      setWatching((w) => Math.max(4, Math.min(23, w + Math.round((Math.random() - 0.45) * 5))));
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const taken = useMemo(() => {
    // deterministic per-day "booked" slots so availability feels real
    const seed = day.split("-").reduce((a, p) => a + Number(p), 0);
    return TIMES.filter((_, i) => (seed + i * 7) % 5 === 0);
  }, [day]);

  useEffect(() => {
    if (taken.includes(time)) {
      setTime(TIMES.find((t) => !taken.includes(t)) ?? TIMES[0]!);
    }
  }, [taken, time]);

  const dayLabel = days.find((d) => d.key === day);
  const valid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || state !== "idle") return;
    setState("sending");
    setTimeout(() => setState("done"), 1100);
  }

  return (
    <section id="demo" className="surface-panel mt-24 overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1fr_1.1fr]">
        <div className="border-b border-border p-10 md:border-b-0 md:border-r">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary">Live availability</p>
          <h2 className="mt-4 text-3xl sm:text-4xl">Book a product demo</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Pick a slot and we'll load your real menu into a sandbox before the call. Demos run
            Monday to Friday, UK time, and take about 30 minutes.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Your menu, your prices, your service flow",
              "Counter, online shop and admin panel shown end to end",
              "Straight answers on pricing and migration",
            ].map((l) => (
              <li key={l} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {l}
              </li>
            ))}
          </ul>

          <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <Users className="size-3.5" />
            {watching} operators viewing this week's slots
          </p>
        </div>

        <div className="p-10">
          {state === "done" ? (
            <div className="animate-scale-in flex h-full flex-col items-start justify-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Check className="size-6" />
              </span>
              <h3 className="mt-5 text-2xl">Slot held for {name.split(" ")[0]}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {dayLabel?.label} {dayLabel?.sub} at {time} · confirmation on its way to {email}.
              </p>
              <Button variant="outline" className="mt-8" onClick={() => setState("idle")}>
                Pick another slot
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div>
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  <CalendarDays className="size-3.5" /> Choose a day
                </p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {days.map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDay(d.key)}
                      className={cn(
                        "rounded-lg border px-1 py-3 text-center text-xs transition-all duration-200 hover:-translate-y-0.5",
                        d.key === day
                          ? "border-primary bg-primary/10 text-primary shadow-[0_8px_20px_-12px_var(--primary)]"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <span className="block font-medium">{d.label}</span>
                      <span className="block text-[10px] opacity-70">{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  <Clock className="size-3.5" /> Choose a time
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TIMES.map((t) => {
                    const gone = taken.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={gone}
                        onClick={() => setTime(t)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-xs transition-all duration-200",
                          gone
                            ? "cursor-not-allowed border-border text-muted-foreground/40 line-through"
                            : t === time
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40",
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                />
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Restaurant (optional)"
                  className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Work email"
                  className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none transition focus:border-primary sm:col-span-2"
                />
              </div>

              <Button type="submit" disabled={!valid || state === "sending"} className="w-full">
                {state === "sending" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Holding your slot…
                  </>
                ) : (
                  <>
                    Confirm {dayLabel?.label} {time}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
