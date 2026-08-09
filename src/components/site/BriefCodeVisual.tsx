import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChartColumn,
  Lock,
  ShoppingBag,
  Smartphone,
  WifiOff,
} from "lucide-react";

type Line =
  | { kind: "blank" }
  | { kind: "code"; tokens: { t: string; c?: "kw" | "str" | "fn" | "num" | "cmt" | "muted" }[] };

const SNIPPETS: Record<"webapps" | "mobile", { file: string; previewLabel: string; lines: Line[] }> = {
  webapps: {
    file: "scope.webapp.ts",
    previewLabel: "Live preview",
    lines: [
      {
        kind: "code",
        tokens: [
          { t: "const ", c: "kw" },
          { t: "brief", c: "fn" },
          { t: " = {" },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "  modules", c: "muted" },
          { t: ": [" },
          { t: '"auth"', c: "str" },
          { t: ", " },
          { t: '"orders"', c: "str" },
          { t: "," },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "           " },
          { t: '"reports"', c: "str" },
          { t: "]," },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "  roles", c: "muted" },
          { t: ": " },
          { t: '"admin"', c: "str" },
          { t: " | " },
          { t: '"staff"', c: "str" },
          { t: "," },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "  api", c: "muted" },
          { t: ": " },
          { t: "connect", c: "fn" },
          { t: "(" },
          { t: '"POS"', c: "str" },
          { t: ")," },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "  sla", c: "muted" },
          { t: ": " },
          { t: "99.9", c: "num" },
          { t: "," },
        ],
      },
      { kind: "code", tokens: [{ t: "};" }] },
    ],
  },
  mobile: {
    file: "scope.mobile.swift",
    previewLabel: "App preview",
    lines: [
      {
        kind: "code",
        tokens: [
          { t: "struct ", c: "kw" },
          { t: "AppBrief", c: "fn" },
          { t: " {" },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "  platforms", c: "muted" },
          { t: ": [" },
          { t: '"iOS"', c: "str" },
          { t: ", " },
          { t: '"Android"', c: "str" },
          { t: "]," },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "  push", c: "muted" },
          { t: ": " },
          { t: "true", c: "kw" },
          { t: "," },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "  offline", c: "muted" },
          { t: ": " },
          { t: "Queue", c: "fn" },
          { t: ".flush()," },
        ],
      },
      {
        kind: "code",
        tokens: [
          { t: "  stores", c: "muted" },
          { t: ": " },
          { t: '"App Store"', c: "str" },
          { t: " + Play," },
        ],
      },
      {
        kind: "code",
        tokens: [{ t: "  // scoped to your flows", c: "cmt" }],
      },
      { kind: "code", tokens: [{ t: "}" }] },
    ],
  },
};

const BAR_TARGETS = [42, 68, 55, 88, 72, 96];

function tokenClass(c?: string) {
  switch (c) {
    case "kw":
      return "text-[#2f6fb8]";
    case "str":
      return "text-[#0a7a6a]";
    case "fn":
      return "text-[#0a1a4a]";
    case "num":
      return "text-[#c45c26]";
    case "cmt":
      return "text-muted-foreground/70 italic";
    case "muted":
      return "text-foreground/70";
    default:
      return "text-foreground/85";
  }
}

function WebPreview({ stage }: { stage: number }) {
  const modules = [
    { icon: Lock, label: "Auth", show: stage >= 2 },
    { icon: ShoppingBag, label: "Orders", show: stage >= 2 },
    { icon: ChartColumn, label: "Reports", show: stage >= 3 },
  ];

  return (
    <div className="flex h-full flex-col gap-2.5 p-3">
      <div
        className={`rounded-lg border border-border/80 bg-background px-2.5 py-2 transition-all duration-500 ${
          stage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-foreground/80">Ops dashboard</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wider transition-all duration-500 ${
              stage >= 4
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {stage >= 4 ? "admin · staff" : "roles…"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {modules.map((m) => (
          <div
            key={m.label}
            className={`flex flex-col items-center gap-1 rounded-lg border border-border/70 bg-background px-1 py-2 transition-all duration-500 ${
              m.show ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <span
              className="flex size-6 items-center justify-center rounded-full text-white"
              style={{
                backgroundImage:
                  "linear-gradient(145deg, #abeafd 0%, #61c3ec 40%, #2f6fb8 100%)",
              }}
            >
              <m.icon className="size-3" strokeWidth={2.25} />
            </span>
            <span className="text-[9px] text-foreground/75">{m.label}</span>
          </div>
        ))}
      </div>

      <div
        className={`mt-auto rounded-lg border border-border/80 bg-background p-2.5 transition-all duration-500 ${
          stage >= 5 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="mb-1.5 flex items-center justify-between text-[9px]">
          <span className="text-muted-foreground">API · POS</span>
          <span className="font-medium text-[#0a7a6a]">connected</span>
        </div>
        <div className="flex h-8 items-end gap-1">
          {[35, 55, 40, 70, 48, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-[2px] transition-[height] duration-700"
              style={{
                height: stage >= 6 ? `${h}%` : "12%",
                transitionDelay: `${i * 60}ms`,
                backgroundImage:
                  "linear-gradient(180deg, #abeafd 0%, #2f6fb8 100%)",
              }}
            />
          ))}
        </div>
      </div>

      <div
        className={`flex items-center justify-between text-[9px] transition-opacity duration-500 ${
          stage >= 7 ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-muted-foreground">Uptime SLA</span>
        <span className="font-semibold tabular-nums text-primary">99.9%</span>
      </div>
    </div>
  );
}

function MobilePreview({ stage }: { stage: number }) {
  const cats = [
    { label: "Food", tone: "from-[#61c3ec] to-[#2f6fb8]" },
    { label: "Shop", tone: "from-[#abeafd] to-[#61c3ec]" },
    { label: "Book", tone: "from-[#2f6fb8] to-[#0a1a4a]" },
  ];

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden p-3">
      {/* Soft color wash behind phone */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(171,234,253,0.85) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(47,111,184,0.22) 0%, transparent 50%), linear-gradient(160deg, #e8f6fc 0%, #f7fbfd 55%, #eef4fb 100%)",
        }}
      />

      <div
        className={`relative w-[128px] overflow-hidden rounded-[1.4rem] border-[3px] border-[#0a1a4a]/90 bg-white shadow-[0_16px_36px_-14px_rgba(10,26,74,0.5)] transition-all duration-500 ${
          stage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        {/* App header */}
        <div
          className="px-2.5 pb-2 pt-2.5 text-white"
          style={{
            backgroundImage:
              "linear-gradient(145deg, #abeafd 0%, #61c3ec 35%, #2f6fb8 75%, #0a1a4a 100%)",
          }}
        >
          <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-white/35" />
          <p className="text-[8px] uppercase tracking-[0.18em] text-white/75">Discover</p>
          <p className="text-[11px] font-semibold leading-tight">Your branded app</p>
        </div>

        <div className="space-y-2 px-2 pb-2.5 pt-2">
          <div
            className={`transition-all duration-500 ${
              stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}
          >
            <div className="flex gap-1">
              {cats.map((c) => (
                <div key={c.label} className="flex-1 text-center">
                  <div
                    className={`mx-auto mb-0.5 flex size-6 items-center justify-center rounded-full bg-gradient-to-br text-[8px] font-semibold text-white ${c.tone}`}
                  >
                    {c.label[0]}
                  </div>
                  <span className="text-[7px] text-foreground/65">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`relative overflow-hidden rounded-md border border-[#61c3ec]/40 bg-[#f3faff] px-1.5 py-1 transition-all duration-500 ${
              stage >= 3 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="relative flex size-4 items-center justify-center rounded-full bg-primary/15">
                <Bell className="size-2.5 text-primary" />
                <span className="absolute -right-0.5 -top-0.5 size-1.5 animate-pulse rounded-full bg-[#e85d4c]" />
              </span>
              <span className="truncate text-[8px] font-medium text-[#0a1a4a]">
                Order on the way
              </span>
            </div>
          </div>

          <div
            className={`grid grid-cols-2 gap-1 transition-all duration-500 ${
              stage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="rounded-md bg-gradient-to-br from-[#abeafd]/80 to-[#61c3ec]/50 p-1.5">
              <WifiOff className="size-2.5 text-[#0a1a4a]/70" />
              <p className="mt-1 text-[7px] font-medium text-[#0a1a4a]">Offline OK</p>
            </div>
            <div className="rounded-md bg-gradient-to-br from-[#2f6fb8]/15 to-[#0a1a4a]/10 p-1.5">
              <Smartphone className="size-2.5 text-[#2f6fb8]" />
              <p className="mt-1 text-[7px] font-medium text-[#0a1a4a]">Native UX</p>
            </div>
          </div>

          <div
            className={`rounded-md px-1.5 py-1.5 text-center transition-all duration-500 ${
              stage >= 5 ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{
              backgroundImage:
                "linear-gradient(145deg, #abeafd 0%, #61c3ec 40%, #2f6fb8 100%)",
            }}
          >
            <p className="text-[8px] font-semibold text-white">App Store · Play</p>
          </div>

          <div
            className={`text-center text-[7px] text-[#2f6fb8] transition-opacity duration-500 ${
              stage >= 6 ? "opacity-100" : "opacity-0"
            }`}
          >
            Built to your brief
          </div>
        </div>
      </div>
    </div>
  );
}

export function BriefCodeVisual({
  variant,
  compact = false,
}: {
  variant: "webapps" | "mobile";
  compact?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [visibleLines, setVisibleLines] = useState(0);
  const [bars, setBars] = useState(BAR_TARGETS.map(() => 8));
  const [cursorOn, setCursorOn] = useState(true);
  const [status, setStatus] = useState("Waiting…");
  const started = useRef(false);
  const timers = useRef<number[]>([]);

  const snippet = SNIPPETS[variant];
  const total = snippet.lines.length;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const clearTimers = () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisibleLines(total);
      setBars(BAR_TARGETS);
      setCursorOn(false);
      setStatus("Preview live");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        setStatus("Writing code…");

        let line = 0;
        const tick = () => {
          line += 1;
          setVisibleLines(line);
          if (line === 2) setStatus("Building modules…");
          if (line === 5) setStatus("Wiring preview…");
          if (line < total) {
            timers.current.push(window.setTimeout(tick, 340));
          } else {
            setStatus("Preview live");
            setBars(BAR_TARGETS);
          }
        };
        timers.current.push(window.setTimeout(tick, 220));
      },
      { threshold: 0.3 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      clearTimers();
    };
  }, [total]);

  useEffect(() => {
    if (visibleLines >= total && visibleLines > 0) {
      const id = window.setInterval(() => setCursorOn((v) => !v), 530);
      return () => clearInterval(id);
    }
    setCursorOn(true);
  }, [visibleLines, total]);

  const progress = Math.round((visibleLines / total) * 100);

  return (
    <div
      ref={rootRef}
      className={`overflow-hidden rounded-xl border border-border bg-surface/80 ${compact ? "mt-3" : "mt-5"}`}
    >
      <div className={`flex items-center gap-2 border-b border-border px-3 ${compact ? "py-1.5" : "py-2"}`}>
        <span className="size-2 rounded-full bg-[#e8a598]" />
        <span className="size-2 rounded-full bg-[#e8d49a]" />
        <span className="size-2 rounded-full bg-[#a8d4b8]" />
        <span className="ml-2 font-mono text-[10px] tracking-wide text-muted-foreground">
          {snippet.file}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-primary">
          {status}
        </span>
      </div>

      <div className={`grid sm:grid-cols-2 ${compact ? "min-h-[148px]" : "min-h-[188px]"}`}>
        {/* Code pane */}
        <div
          className={`border-b border-border font-mono sm:border-b-0 sm:border-r ${
            compact
              ? "px-2.5 py-2 text-[9px] leading-4 sm:text-[10px] sm:leading-[1.35rem]"
              : "px-3 py-3 text-[10px] leading-5 sm:text-[11px] sm:leading-5"
          }`}
        >
          <p className="mb-1.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Code
          </p>
          {snippet.lines.map((line, i) => {
            const show = i < visibleLines;
            const isActive = i === visibleLines - 1;
            return (
              <div
                key={i}
                className={`flex gap-2.5 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
                aria-hidden={!show}
              >
                <span className="w-4 shrink-0 select-none text-right text-muted-foreground/45">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 whitespace-pre">
                  {line.kind === "blank" ? (
                    "\u00a0"
                  ) : (
                    <>
                      {line.tokens.map((tok, ti) => (
                        <span key={ti} className={tokenClass(tok.c)}>
                          {tok.t}
                        </span>
                      ))}
                      {isActive && visibleLines < total ? (
                        <span
                          className={`ml-0.5 inline-block h-[1em] w-[0.4em] translate-y-[0.12em] bg-primary align-middle ${
                            cursorOn ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      ) : null}
                    </>
                  )}
                </span>
              </div>
            );
          })}
          {visibleLines >= total ? (
            <div className="mt-0.5 flex gap-2.5">
              <span className="w-4 shrink-0" />
              <span
                className={`inline-block h-[1em] w-[0.4em] bg-primary ${cursorOn ? "opacity-100" : "opacity-0"}`}
              />
            </div>
          ) : null}
        </div>

        {/* Visual preview pane */}
        <div className="relative bg-gradient-to-b from-[#f3f9fc] to-background">
          <p className="absolute left-3 top-3 z-[1] text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            {snippet.previewLabel}
          </p>
          <div className="pt-5">
            {variant === "webapps" ? (
              <WebPreview stage={visibleLines} />
            ) : (
              <MobilePreview stage={visibleLines} />
            )}
          </div>
        </div>
      </div>

      <div className={`border-t border-border px-3 ${compact ? "py-2" : "py-3"}`}>
        <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Build progress</span>
          <span className="tabular-nums text-primary">{progress}%</span>
        </div>
        <div className={`mb-1.5 overflow-hidden rounded-full bg-border/80 ${compact ? "h-0.5" : "h-1"}`}>
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${progress}%`,
              backgroundImage:
                "linear-gradient(90deg, #abeafd 0%, #61c3ec 45%, #2f6fb8 100%)",
            }}
          />
        </div>
        <div className={`flex items-end gap-1.5 ${compact ? "h-7" : "h-10"}`}>
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-[height] duration-700 ease-out"
              style={{
                height: `${h}%`,
                backgroundImage:
                  "linear-gradient(180deg, #abeafd 0%, #61c3ec 40%, #2f6fb8 100%)",
                transitionDelay: `${i * 70}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
