import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { SearchIcon, MenuIcon, XIcon } from "lucide-react";
import { formatDhivehiDate } from "../../lib/dhivehi-date.ts";

// Dhivehi navigation links (RTL)
const NAV_LINKS = [
  { label: "ހަބަރު", href: "/news" },
  { label: "ދުނިޔެ", href: "/world" },
  { label: "ވިޔަފާރި", href: "/business" },
  { label: "ފަތުރުވެރިކަން", href: "/travel-tourism" },
  { label: "ތައުލީމު", href: "/education" },
  { label: "ބާޒާރު", href: "/market" },
  { label: "ރައްޔިތުން", href: "/citizen" },
  { label: "ތެދުމަގު", href: "/religion" },
  { label: "ލުއިހަބަރު", href: "/quick-news" },
  { label: "ޕޮޑްކާސްޓް", href: "/podcast" },
];

const UTILITY_LINKS = [
  { label: "ލިޔުން ހުށައެޅުން", href: "/submit-article" },
  { label: "އިޢުލާން", href: "/advertise" },
];

export default function DhivehiHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const today = formatDhivehiDate(new Date());

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/en/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header className="bg-white border-b border-[#E5E7E2]" dir="rtl">
      {/* Top bar */}
      <div className="border-b border-[#E5E7E2] px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#6B756E] font-thaana">
          <span>ދިވެހީންގެ އަޑު</span>
          <span>{today}</span>
        </div>
      </div>

      {/* Logo + actions */}
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="isolate flex items-center overflow-hidden">
            <img
              src="/rayyithun-logo-transparent-v2.png"
              alt="ރައްޔިތުން"
              className="h-20 w-48 object-contain object-center"
            />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 md:flex">
              {UTILITY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-thaana text-xs font-medium text-[#526159] hover:text-[#103820]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {/* Portal switch */}
            <Link
              to="/en"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#103820] border border-[#103820] px-3 py-1 rounded-sm hover:bg-[#103820] hover:text-white transition-colors"
            >
              English
            </Link>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#142820] hover:text-[#103820] transition-colors"
              aria-label="ހޯދާ"
            >
              <SearchIcon size={20} />
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-[#142820]"
              aria-label="މެނޫ"
            >
              {menuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="max-w-7xl mx-auto mt-3">
            <form
              onSubmit={handleSearch}
              className="flex gap-2 flex-row-reverse"
            >
              <button
                type="submit"
                className="bg-[#103820] text-white px-4 py-2 text-sm rounded-sm hover:bg-[#183028] transition-colors font-thaana"
              >
                ހޯދާ
              </button>
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ލިޔުން ހޯދާ..."
                className="flex-1 border border-[#E5E7E2] rounded-sm px-4 py-2 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820] text-right font-thaana"
              />
            </form>
          </div>
        )}
      </div>

      {/* Desktop navigation */}
      <nav className="hidden md:block border-t border-[#E5E7E2]">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-start gap-0" dir="rtl">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="block px-4 py-3 text-sm font-bold text-black hover:text-[#103820] hover:bg-[#F8F8F8] border-b-2 border-transparent hover:border-[#103820] transition-all font-thaana thaana-body"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="md:hidden border-t border-[#E5E7E2] bg-white">
          <ul className="divide-y divide-[#E5E7E2]">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-bold text-black text-right font-thaana"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {UTILITY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block bg-[#F8FAF8] px-4 py-3 text-right text-sm font-medium text-[#103820] font-thaana"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/en"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm text-[#103820] font-medium"
              >
                ENGLISH EDITION
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
