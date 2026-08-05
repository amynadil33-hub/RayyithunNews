import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { label: "ގުޅުއްވުމަށް", href: "/contact" },
  { label: "އިޢުލާން", href: "/advertise" },
  { label: "ޕްރައިވެސީ ޕޮލިސީ", href: "/en/page/privacy" },
  { label: "ޚިދުމަތުގެ ޝަރުތުތައް", href: "/en/page/terms" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", short: "f" },
  { label: "Twitter", short: "𝕏" },
  { label: "Instagram", short: "ig" },
  { label: "YouTube", short: "yt" },
];

export default function DhivehiFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#183028] text-white font-thaana" dir="rtl" lang="dv">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <Link
              to="/"
              className="isolate mb-3 inline-flex items-center overflow-hidden"
            >
              <img
                src="/rayyithun-logo-dhivehi-transparent.png"
                alt="ރައްޔިތުން"
                className="h-16 w-44 object-contain object-right brightness-0 invert"
              />
            </Link>
            <p className="max-w-xl text-sm leading-[2] text-[#95D5B2]">
              ދިވެހިރާއްޖޭގެ ޑިޖިޓަލް ހަބަރު ޚިދުމަތް. މުސްތަޤިއްލު، ތެދުވެރި
              އަދި އިތުބާރުހުރި ނޫސްވެރިކަން.
            </p>
            <div className="mt-5 flex justify-start gap-3">
              {SOCIAL_LINKS.map(({ label, short }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#52B788]/40 text-xs font-bold text-[#95D5B2] transition-colors hover:border-white hover:text-white"
                >
                  {short}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-5 lg:items-end">
            <Link
              to="/en"
              className="inline-flex items-center rounded-sm border border-[#52B788] px-4 py-2 text-sm font-medium text-[#52B788] transition-colors hover:bg-[#52B788] hover:text-[#103820] font-sans"
            >
              English Portal
            </Link>
            <nav
              aria-label="ފުޓަރ ލިންކްތައް"
              className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end"
            >
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm leading-[2] text-[#95D5B2] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-9 border-t border-white/10 pt-5">
          <p className="text-xs text-white/40">
            © {year} ރައްޔިތުން. ހުރިހާ ހައްޤެއް މަހްފޫޒު.
          </p>
        </div>
      </div>
    </footer>
  );
}
