import { Link } from "react-router-dom";
// Social brand icons are not available in lucide-react; using text fallbacks


const SECTIONS = [
  { label: "News", href: "/en/news" },
  { label: "Education", href: "/en/education" },
  { label: "Business", href: "/en/business" },
  { label: "Religion", href: "/en/religion" },
  { label: "Innovation", href: "/en/innovation" },
  { label: "World", href: "/en/world" },
  { label: "Podcast", href: "/en/podcast" },
  { label: "Citizen", href: "/en/citizen" },
  { label: "Market", href: "/en/market" },
];

const ABOUT_LINKS = [
  { label: "About Us", href: "/en/page/about" },
  { label: "Contact", href: "/en/contact" },
  { label: "Advertise", href: "/en/advertise" },
  { label: "Privacy Policy", href: "/en/page/privacy" },
  { label: "Terms of Service", href: "/en/page/terms" },
];

export default function EnglishFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#183028] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/en" className="inline-flex items-center gap-2 mb-4">
              <span className="font-serif text-2xl font-bold text-white tracking-tight">RAYYITHUN</span>
            </Link>
            <p className="text-sm text-[#95D5B2] leading-relaxed mb-5">
              The digital voice of the Maldives. Independent journalism, community stories, and practical services for everyday life.
            </p>
            <div className="flex gap-3">
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
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#52B788] mb-4">Sections</h4>
            <ul className="space-y-2">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <Link to={s.href} className="text-sm text-[#95D5B2] hover:text-white transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#52B788] mb-4">About</h4>
            <ul className="space-y-2">
              {ABOUT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-[#95D5B2] hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal switch */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-[#52B788] mb-4">Other Edition</h4>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-[#52B788] text-[#52B788] hover:bg-[#52B788] hover:text-[#103820] transition-colors px-4 py-2 text-sm font-medium rounded-sm font-thaana"
            >
              ދިވެހި ޕޯޓަލް
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40">
            © {year} RAYYITHUN. All rights reserved. Made in the Maldives.
          </p>
        </div>
      </div>
    </footer>
  );
}
