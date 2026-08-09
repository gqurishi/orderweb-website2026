import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, X } from "lucide-react";
import logo from "@/assets/orderweb-logo.png";
import { openCookieSettings } from "@/lib/site/cookieConsent";
import {
  resolveFooterBadges,
  type FooterBadgePublic,
} from "@/lib/site/footerBadge";
import { resolveSocialLinks, type SocialLink } from "@/lib/site/organization";

const SOCIAL_ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  x: X,
} as const;

export function SiteFooter({
  socialLinks,
  footerBadges,
}: {
  socialLinks?: SocialLink[];
  footerBadges?: FooterBadgePublic[];
}) {
  const links = socialLinks ?? resolveSocialLinks({});
  const badges = footerBadges ?? resolveFooterBadges();

  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(3,0.75fr)] lg:gap-8">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2">
              <img
                src={logo}
                alt="OrderWeb"
                className="h-8 w-auto object-contain sm:h-9"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Commission-free restaurant POS and custom software — built in the UK for operators who
              want control.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <a
                href="mailto:mail@orderweb.co.uk"
                className="font-medium text-primary transition-colors hover:text-[#1d4f8c]"
              >
                mail@orderweb.co.uk
              </a>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Brockley, London, UK</p>

            {links.length > 0 ? (
              <div className="mt-5 flex items-center gap-2.5">
                {links.map((social, i) => {
                  const Icon = SOCIAL_ICONS[social.id];
                  return (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="footer-social-btn animate-footer-social"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    >
                      <Icon className="size-4" aria-hidden strokeWidth={2.25} />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              Company
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  search={{}}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground transition-colors hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              Solutions
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  to="/restaurant-pos"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Restaurant POS
                </Link>
              </li>
              <li>
                <Link
                  to="/website"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Website
                </Link>
              </li>
              <li>
                <Link
                  to="/software"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Software
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">Legal</p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/dpa" className="text-muted-foreground transition-colors hover:text-primary">
                  DPA
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="text-left text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => openCookieSettings()}
                >
                  Cookie settings
                </button>
              </li>
            </ul>
            {badges.length > 0 ? (
              <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4">
                {badges.map((badge) => (
                  <FooterTrustBadge key={badge.id} badge={badge} />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-1.5">
            <span>© {new Date().getFullYear()} OrderWeb Ltd.</span>
            <span className="hidden sm:inline">·</span>
            <span>All rights reserved</span>
            <span className="hidden sm:inline">·</span>
            <span>Company no. 12760826</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
            <Link to="/dpa" className="transition-colors hover:text-primary">
              DPA
            </Link>
            <Link to="/cookies" className="transition-colors hover:text-primary">
              Cookies
            </Link>
            <button
              type="button"
              className="transition-colors hover:text-primary"
              onClick={() => openCookieSettings()}
            >
              Cookie settings
            </button>
            <Link to="/faq" className="transition-colors hover:text-primary">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterTrustBadge({ badge }: { badge: FooterBadgePublic }) {
  const isRound = badge.id === "ico";
  const img = (
    <img
      src={badge.imageUrl}
      alt={badge.alt}
      width={isRound ? 40 : 112}
      height={isRound ? 40 : 40}
      className={`footer-trust-badge-img w-auto object-contain object-left ${
        isRound ? "h-8 sm:h-9" : "h-7 sm:h-8"
      }`}
      loading="lazy"
      decoding="async"
    />
  );

  if (!badge.href) {
    return <div className="footer-trust-badge inline-flex">{img}</div>;
  }

  const external = /^https?:\/\//i.test(badge.href);
  return (
    <a
      href={badge.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="footer-trust-badge inline-flex transition hover:opacity-90"
      aria-label={badge.alt}
    >
      {img}
    </a>
  );
}
