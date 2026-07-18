import { Link } from "react-router-dom";
// Social brand icons are not available in lucide-react; using text fallbacks


const SECTIONS = [
  { label: "ހަބަރު", href: "/news" },
  { label: "ތަޢުލީމް", href: "/education" },
  { label: "ވިޔަފާރި", href: "/business" },
  { label: "ތެދުމަގު", href: "/religion" },
  { label: "އުފެއްދުންތެރިކަން", href: "/innovation" },
  { label: "ދުނިޔެ", href: "/world" },
  { label: "ޕޮޑްކާސްޓް", href: "/podcast" },
  { label: "ރައްޔިތުން", href: "/citizen" },
  { label: "ބާޒާރު", href: "/market" },
];

const ABOUT_LINKS = [
  { label: "ރައްޔިތުންއާ ބެހޭ", href: "/en/page/about" },
  { label: "ގުޅުއްވުމަށް", href: "/contact" },
  { label: "އިޢުލާން", href: "/advertise" },
  { label: "ޕްރައިވެސީ ޕޮލިސީ", href: "/en/page/privacy" },
  { label: "ޚިދުމަތުގެ ޝަރުތުތައް", href: "/en/page/terms" },
];

export default function DhivehiFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#183028] text-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img
                src="/rayyithun-logo.png"
                alt="ރައްޔިތުން"
                className="h-20 w-48 object-cover object-center rounded-sm"
              />
            </Link>
            <p className="text-sm text-[#95D5B2] leading-relaxed mb-5 font-thaana thaana-body">
              ދިވެހިރާއްޖޭގެ ޑިޖިޓަލް ހަބަރު ހިދުމަތް. ހިއްސާ ނުކުރާ ނޫސްވެރިކަން، ތ ތ ތ.
            </p>
            <div className="flex gap-3 justify-end">
              {[
                { label: "Facebook", short: "f" },
                { label: "Twitter", short: "𝕏" },
                { label: "Instagram", short: "ig" },
                { label: "YouTube", short: "yt" },
              ].map(({ label, short }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-7 h-7 rounded-sm border border-[#52B788]/40 flex items-center justify-center text-[#95D5B2] hover:text-white hover:border-white transition-colors text-xs font-bold">
                  {short}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#52B788] mb-4 font-thaana">ބައިތައް</h4>
            <ul className="space-y-2">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <Link to={s.href} className="text-sm text-[#95D5B2] hover:text-white transition-colors font-thaana thaana-body">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#52B788] mb-4 font-thaana">ލިންކްތައް</h4>
            <ul className="space-y-2">
              {ABOUT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-[#95D5B2] hover:text-white transition-colors font-thaana thaana-body">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* English switch */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#52B788] mb-4">Other Edition</h4>
            <Link to="/en"
              className="inline-flex items-center gap-2 border border-[#52B788] text-[#52B788] hover:bg-[#52B788] hover:text-[#103820] transition-colors px-4 py-2 text-sm font-medium rounded-sm">
              English Portal
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40 font-thaana">
            © {year} ރައްޔިތުން. ހުރިހާ ހައްޤެއް ލ.
          </p>
        </div>
      </div>
    </footer>
  );
}
