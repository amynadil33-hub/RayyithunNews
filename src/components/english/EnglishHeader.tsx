import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { SearchIcon, MenuIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import SocialIcon from "../shared/SocialIcon.tsx";

const NAV_LINKS = [
  { label: "News", href: "/en/news" },
  { label: "Education", href: "/en/education" },
  { label: "Business", href: "/en/business" },
  { label: "Religion", href: "/en/religion" },
  { label: "Innovation", href: "/en/innovation" },
  { label: "World", href: "/en/world" },
  { label: "Podcast", href: "/en/podcast" },
  { label: "Citizen", href: "/en/citizen" },
  { label: "Market", href: "/en/market" },
  { label: "Travel and tourism", href: "/en/travel-tourism" },
];

const SOCIAL_LINKS = ["Facebook", "Twitter", "Instagram", "YouTube"] as const;

const UTILITY_LINKS = [
  { label: "News Tip", href: "/en/contact" },
  { label: "Advertise", href: "/en/advertise" },
];

export default function EnglishHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const today = format(new Date(), "EEEE d MMMM yyyy");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/en/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header className="bg-white border-b border-[#E5E7E2]" dir="ltr">
      {/* Top bar */}
      <div className="border-b border-[#E5E7E2] px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#6B756E]">
          <span>{today}</span>
          <div className="flex items-center gap-3" aria-label="Social media">
            {SOCIAL_LINKS.map((label) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="text-[#6B756E] transition-colors hover:text-[#103820]"
              >
                <SocialIcon name={label} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Logo + actions */}
      <div className="px-4 py-3">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="min-w-0">
            <div className="hidden items-center gap-4 md:flex">
              {UTILITY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-xs font-medium text-[#526159] transition-colors hover:text-[#103820]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/en"
            className="isolate flex min-w-0 flex-col items-center justify-center overflow-hidden text-center"
          >
            <img
              src="/rayyithun-logo-english-transparent.png"
              alt="RAYYITHUN"
              className="h-14 w-44 object-contain object-center sm:h-16 sm:w-52"
            />
            <span className="mt-0.5 text-[10px] font-medium tracking-[0.08em] text-[#526159] sm:text-xs">
              The Voice of the Maldives
            </span>
          </Link>

          <div className="flex items-center justify-end gap-3 sm:gap-4">
            {/* Portal switch */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#103820] border border-[#103820] px-3 py-1 rounded-sm hover:bg-[#103820] hover:text-white transition-colors font-thaana"
            >
              ދިވެހި
            </Link>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#142820] hover:text-[#103820] transition-colors"
              aria-label="Search"
            >
              <SearchIcon size={20} />
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-[#142820]"
              aria-label="Menu"
            >
              {menuOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="max-w-7xl mx-auto mt-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 border border-[#E5E7E2] rounded-sm px-4 py-2 text-sm bg-[#F8F8F8] focus:outline-none focus:border-[#103820]"
              />
              <button
                type="submit"
                className="bg-[#103820] text-white px-4 py-2 text-sm rounded-sm hover:bg-[#183028] transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Desktop navigation */}
      <nav className="hidden md:block border-t border-[#E5E7E2]">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center justify-start gap-0">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="block px-4 py-3 text-sm font-medium text-[#142820] hover:text-[#103820] hover:bg-[#F8F8F8] border-b-2 border-transparent hover:border-[#103820] transition-all"
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
                  className="block px-4 py-3 text-sm font-medium text-[#142820]"
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
                  className="block bg-[#F8FAF8] px-4 py-3 text-sm font-medium text-[#103820]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm text-[#103820] font-thaana font-medium"
              >
                ދިވެހި ޕޯޓަލް
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
