import { useEffect, useState } from "react";
import { Bike, CreditCard, Gift, Utensils, Wifi } from "lucide-react";
import logo from "@/assets/orderweb-logo.png";

type Order = {
  id: string;
  channel: "Web" | "App" | "Phone" | "Counter";
  items: number;
  total: number;
  status: "New" | "Cooking" | "On route";
};

const SEED: Order[] = [
  { id: "#1043", channel: "Web", items: 3, total: 28.4, status: "New" },
  { id: "#1042", channel: "App", items: 5, total: 51.2, status: "Cooking" },
  { id: "#1041", channel: "Phone", items: 2, total: 16.9, status: "Cooking" },
  { id: "#1040", channel: "Counter", items: 4, total: 39.5, status: "On route" },
];

const CHANNELS: Order["channel"][] = ["Web", "App", "Phone", "Counter"];

/** Live-feeling POS mock. Purely presentational simulated data. */
export function PosInterface({ live = true }: { live?: boolean }) {
  const [orders, setOrders] = useState<Order[]>(SEED);
  const [revenue, setRevenue] = useState(4218.6);
  const [loyalty, setLoyalty] = useState(12840);
  const [driver, setDriver] = useState(18);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setOrders((prev) => {
        const nextId = 1044 + Math.floor(Math.random() * 900);
        const order: Order = {
          id: `#${nextId}`,
          channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)] ?? "Web",
          items: 1 + Math.floor(Math.random() * 6),
          total: Math.round((12 + Math.random() * 60) * 10) / 10,
          status: "New",
        };
        const shifted = prev.map((o) => ({
          ...o,
          status:
            o.status === "New" ? "Cooking" : o.status === "Cooking" ? "On route" : o.status,
        })) as Order[];
        return [order, ...shifted].slice(0, 4);
      });
      setRevenue((r) => Math.round((r + 8 + Math.random() * 55) * 100) / 100);
      setLoyalty((l) => l + Math.floor(20 + Math.random() * 120));
      setDriver((d) => (d > 3 ? d - 2 : 22));
    }, 2600);
    return () => clearInterval(t);
  }, [live]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-surface text-left">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <img src={logo} alt="" aria-hidden width={28} height={20} className="h-5 w-auto object-contain" />
          OrderWeb POS · Hilltop Kitchen
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 text-accent">
            <span className="size-1.5 rounded-full bg-accent" /> Live
          </span>
          <Wifi className="size-3.5" />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 p-3 md:grid-cols-3">
        {/* orders */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Today" value={`£${revenue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`} icon={<CreditCard className="size-3.5" />} />
            <Stat label="Loyalty pts" value={loyalty.toLocaleString("en-GB")} icon={<Gift className="size-3.5" />} />
            <Stat label="Covers" value="86" icon={<Utensils className="size-3.5" />} />
          </div>

          <div className="flex-1 rounded-lg border border-border bg-surface-2/60 p-3">
            <p className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              Incoming orders
            </p>
            <ul className="space-y-2">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex animate-fade-in items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-xs"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-medium">{o.id}</span>
                    <span className="text-muted-foreground">{o.channel}</span>
                    <span className="text-muted-foreground">{o.items} items</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span>£{o.total.toFixed(2)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        o.status === "New"
                          ? "bg-primary/15 text-primary"
                          : o.status === "Cooking"
                            ? "bg-accent/15 text-accent"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {o.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* driver map */}
        <div className="flex flex-col gap-3">
          <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-surface-2/60">
            <svg viewBox="0 0 200 200" className="size-full opacity-60">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                </pattern>
              </defs>
              <rect width="200" height="200" fill="url(#grid)" />
              <path
                d="M20 170 C60 150, 70 90, 120 70 S170 40, 180 25"
                fill="none"
                strokeDasharray="4 4"
                strokeWidth="1.5"
                className="stroke-primary"
              />
            </svg>
            <span className="absolute left-3 top-3 text-[11px] uppercase tracking-widest text-muted-foreground">
              Driver dispatch
            </span>
            <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px]">
              <Bike className="size-3.5 text-primary" /> ETA {driver} min
            </span>
          </div>
          <div className="rounded-lg border border-border bg-surface-2/60 p-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Table status
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-6 rounded ${
                    i % 4 === 0 ? "bg-primary/40" : i % 3 === 0 ? "bg-accent/30" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm tabular-nums">{value}</p>
    </div>
  );
}
