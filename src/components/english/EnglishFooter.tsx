import { Link } from "react-router-dom";
import SocialIcon from "../shared/SocialIcon.tsx";

const FOOTER_LINKS = [
  { label: "Contact", href: "/en/contact" },
  { label: "Advertise", href: "/en/advertise" },
  { label: "Privacy Policy", href: "/en/page/privacy" },
  { label: "Terms of Service", href: "/en/page/terms" },
];

const SOCIAL_LINKS = ["Facebook", "Twitter", "Instagram", "YouTube"] as const;

export default function EnglishFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#183028] text-white" dir="ltr" lang="en">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <Link
              to="/en"
              className="isolate mb-3 inline-flex items-center overflow-hidden"
            >
              <img
                src="/rayyithun-logo-english-transparent.png"
                alt="Rayyithun News Network"
                className="h-16 w-44 object-contain object-left brightness-0 invert"
              />
            </Link>
            <p className="max-w-xl text-sm leading-relaxed text-[#95D5B2]">
              The digital voice of the Maldives. Independent journalism,
              community stories, and practical services for everyday life.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIAL_LINKS.map((label) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#52B788]/40 text-xs font-bold text-[#95D5B2] transition-colors hover:border-white hover:text-white"
                >
                  <SocialIcon name={label} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-5 lg:items-end">
            <Link
              to="/"
              className="inline-flex items-center rounded-sm border border-[#52B788] px-4 py-2 text-sm font-medium text-[#52B788] transition-colors hover:bg-[#52B788] hover:text-[#103820] font-thaana"
            >
              ދިވެހި ޕޯޓަލް
            </Link>
            <nav
              aria-label="Footer"
              className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end"
            >
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-[#95D5B2] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-9 border-t border-white/10 pt-5">
          <p className="text-xs text-white/40">
            © {year} RAYYITHUN. All rights reserved. Made in the Maldives.
          </p>
        </div>
      </div>
    </footer>
  );
}
