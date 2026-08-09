import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/orderweb-logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/pricing", label: "Pricing" },
];

const solutionLinks = [
  { to: "/restaurant-pos", label: "Restaurant POS", desc: "All-in-one POS & online ordering" },
  { to: "/website", label: "Website", desc: "Fast, brand-led marketing sites" },
  { to: "/software", label: "Software", desc: "Web applications & mobile apps" },
];

function NavLink({
  to,
  label,
  onClick,
  delay = 0,
}: {
  to: string;
  label: string;
  onClick?: () => void;
  delay?: number;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      activeProps={{
        className: "nav-link-active bg-primary/15 text-primary shadow-sm shadow-primary/10 ring-1 ring-primary/25",
      }}
      inactiveProps={{
        className: "text-foreground/75 hover:bg-primary/10 hover:text-primary",
      }}
      activeOptions={{ exact: true }}
      className="nav-item group relative rounded-full px-4 py-2 text-[15px] font-semibold tracking-[-0.01em] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="relative z-10">{label}</span>
      <span
        aria-hidden
        className="nav-link-underline pointer-events-none absolute inset-x-3 bottom-1.5 h-[2px] rounded-full bg-primary/70 transition-transform duration-300 ease-out"
      />
    </Link>
  );
}

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const alwaysShowMenu = pathname === "/contact";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuVisible = alwaysShowMenu || scrolled;

  useEffect(() => {
    if (alwaysShowMenu) {
      setScrolled(true);
      return;
    }

    let ticking = false;
    // Show the full menu only after the user scrolls down; hysteresis avoids flicker on the hero pin
    const update = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > 80) return true;
        if (prev && y < 28) return false;
        return prev;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [alwaysShowMenu]);

  useEffect(() => {
    if (!menuVisible) setSolutionsOpen(false);
  }, [menuVisible]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openSolutions = () => {
    if (solutionsTimer.current) clearTimeout(solutionsTimer.current);
    setSolutionsOpen(true);
  };

  const closeSolutions = () => {
    solutionsTimer.current = setTimeout(() => setSolutionsOpen(false), 120);
  };

  const toggleSolutions = () => {
    if (solutionsTimer.current) clearTimeout(solutionsTimer.current);
    setSolutionsOpen((v) => !v);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuVisible ? "translate-y-0 py-2" : "translate-y-0 py-4"
        }`}
      >
        <nav
          className={`mx-auto flex h-12 max-w-6xl items-center justify-between px-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-14 sm:px-5 ${
            menuVisible
              ? "mx-2 rounded-full border border-primary/15 bg-background/80 shadow-[0_18px_40px_-24px_rgba(15,60,140,0.35)] backdrop-blur-xl sm:mx-auto"
              : "rounded-full border border-transparent bg-transparent shadow-none"
          }`}
        >
          <Link
            to="/"
            className="group flex items-center gap-2.5 transition-transform duration-300 ease-out hover:scale-[1.02]"
          >
            <img
              src={logo}
              alt="OrderWeb logo"
              width={52}
              height={36}
              className="h-9 w-auto object-contain transition-transform duration-500 ease-out group-hover:rotate-[-4deg] group-hover:scale-105"
            />
            <span
              className={`overflow-hidden whitespace-nowrap text-base font-semibold tracking-tight transition-all duration-500 ease-out ${
                menuVisible
                  ? "max-w-32 translate-x-0 opacity-100"
                  : "max-w-0 -translate-x-2 opacity-0"
              }`}
            >
              OrderWeb
            </span>
          </Link>

          {/* Desktop menu — after scroll, or always on /contact */}
          <div
            className={`hidden items-center gap-0.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${
              menuVisible
                ? "nav-menu-ready pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-95 opacity-0"
            }`}
            aria-hidden={!menuVisible}
          >
            {navLinks.map((link, i) => (
              <NavLink key={link.to} to={link.to} label={link.label} delay={i * 55} />
            ))}

            <div
              className="nav-item relative"
              style={{ animationDelay: `${navLinks.length * 55}ms` }}
              onMouseEnter={openSolutions}
              onMouseLeave={closeSolutions}
            >
              <button
                type="button"
                tabIndex={menuVisible ? 0 : -1}
                aria-expanded={solutionsOpen}
                aria-haspopup="menu"
                onClick={toggleSolutions}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSolutions();
                  }
                }}
                className={`group relative rounded-full px-4 py-2 text-[15px] font-semibold tracking-[-0.01em] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-primary/10 hover:text-primary ${
                  solutionsOpen
                    ? "bg-primary/15 text-primary shadow-sm shadow-primary/10 ring-1 ring-primary/25"
                    : "text-foreground/75"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1">
                  Solutions
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`transition-transform duration-300 ${solutionsOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <div
                className={`absolute left-1/2 top-full -translate-x-1/2 pt-2 transition-all duration-300 ease-out ${
                  solutionsOpen
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <div className="min-w-[280px] overflow-hidden rounded-2xl border border-primary/15 bg-card/95 p-2 shadow-[0_24px_50px_-28px_rgba(15,60,140,0.45)] backdrop-blur-xl">
                  {solutionLinks.map((item, i) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      tabIndex={solutionsOpen ? 0 : -1}
                      className="group/item flex flex-col gap-0.5 rounded-xl px-4 py-3 transition-all duration-300 hover:translate-x-0.5 hover:bg-primary/10"
                      style={{ transitionDelay: solutionsOpen ? `${i * 40}ms` : "0ms" }}
                    >
                      <span className="text-sm font-semibold text-foreground transition-colors duration-300 group-hover/item:text-primary">
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:block ${
                menuVisible
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-1 opacity-0"
              }`}
            >
              <Button
                asChild
                size="sm"
                className="btn-brand-gradient animate-nav-contact h-10 rounded-full px-6 text-sm font-semibold tracking-tight transition-all duration-300"
              >
                <Link to="/contact" search={{}} tabIndex={menuVisible ? 0 : -1}>
                  Contact
                </Link>
              </Button>
            </div>

            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-primary/10 hover:text-primary md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <div className="relative size-5">
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? "top-2 rotate-45" : "top-0.5"
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    mobileOpen ? "top-2 -rotate-45" : "top-3.5"
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-[min(320px,85vw)] bg-card shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="text-sm font-medium">Menu</span>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-primary/10 hover:text-primary"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-current">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1 px-3 py-4">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              activeProps={{ className: "bg-primary/12 text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:bg-primary/10 hover:text-primary" }}
              activeOptions={{ exact: true }}
              className="rounded-xl px-4 py-3 text-base font-medium transition-all duration-300"
              style={{ transitionDelay: mobileOpen ? `${i * 40}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              onClick={() => setSolutionsOpen((v) => !v)}
            >
              Solutions
              <svg
                width="14"
                height="14"
                viewBox="0 0 12 12"
                fill="none"
                className={`transition-transform duration-300 ${solutionsOpen ? "rotate-180" : ""}`}
              >
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              className={`grid transition-all duration-300 ${
                solutionsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-1 px-3 py-2">
                  {solutionLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-col gap-0.5 rounded-xl px-4 py-3 transition-colors hover:bg-primary/10"
                    >
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 px-3">
            <Button asChild className="btn-brand-gradient w-full rounded-full">
              <Link to="/contact" search={{}} onClick={() => setMobileOpen(false)}>
                Contact
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
