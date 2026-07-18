import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import { format } from "date-fns";

interface FrigatebirdHeroProps {
  language: "en" | "dv";
}

const COPY = {
  en: {
    heading: "Above the Noise. Closer to the Truth.",
    supporting:
      "Like the frigatebird soaring above the Maldivian seas, Rayyithun watches from above—sharp-eyed, fearless, and always searching for the truth.",
  },
  dv: {
    heading: "ަޑުތަކުގެ މަތީގައި. ތެދާއި ކައިރީގައި.",
    supporting:
      "ދިވެހި ކަނޑުމަތިން ދުވާ މާހޯރަ ފަދައިން، ރައްޔިތުން އަކީ ހުށިޔާރުކަމާއެކު، ބިރެއްނެތި ތެދު މައުލޫމާތާއި އިލްމް ހޯދަމުން ދާ ރައްޔިތުންގެ އަޑެކެވެ.",
  },
} as const;

const ENGLISH_NAV = [
  ["News", "/en/news"],
  ["Education", "/en/education"],
  ["Business", "/en/business"],
  ["Religion", "/en/religion"],
  ["Innovation", "/en/innovation"],
  ["World", "/en/world"],
  ["Podcast", "/en/podcast"],
  ["Citizen", "/en/citizen"],
  ["Market", "/en/market"],
  ["Contact", "/en/contact"],
  ["Advertise", "/en/advertise"],
] as const;

const DHIVEHI_NAV = [
  ["ހަބަރު", "/news"],
  ["ތަޢުލީމް", "/education"],
  ["ވިޔަފާރި", "/business"],
  ["ތެދުމަގު", "/religion"],
  ["އުފެއްދުންތެރިކަން", "/innovation"],
  ["ދުނިޔެ", "/world"],
  ["ޕޮޑްކާސްޓް", "/podcast"],
  ["ރައްޔިތުން", "/citizen"],
  ["ބާޒާރު", "/market"],
  ["ގުޅުއްވުމަށް", "/contact"],
  ["އިޢުލާން", "/advertise"],
] as const;

export default function FrigatebirdHero({ language }: FrigatebirdHeroProps) {
  const isDhivehi = language === "dv";
  const copy = COPY[language];
  const navLinks = isDhivehi ? DHIVEHI_NAV : ENGLISH_NAV;
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const today = format(new Date(), "EEEE d MMMM yyyy");

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/en/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <section
      className="relative isolate h-[500px] overflow-hidden bg-[#071521] text-white md:h-[420px]"
      dir={isDhivehi ? "rtl" : "ltr"}
      lang={language}
      aria-labelledby={`brand-hero-heading-${language}`}
    >
      <img
        src="/frigatebird-editorial-hero.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#071521]/45" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#071521]/25 via-[#071521]/45 to-[#071521]/95"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#071521]/95 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between border-b border-white/20 py-3" dir="ltr">
          <div className="relative text-left">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/65 sm:text-xs">
              {today}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
                aria-label={isDhivehi ? "ހޯދާ" : "Search"}
                aria-expanded={searchOpen}
                className="flex h-8 w-8 items-center justify-center border border-white/35 text-white transition-colors hover:border-white hover:bg-white/10"
              >
                <SearchIcon size={16} />
              </button>
              <Link
                to={isDhivehi ? "/en" : "/"}
                className={`border border-white/50 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-[#071521] ${
                  isDhivehi ? "" : "font-thaana"
                }`}
              >
                {isDhivehi ? "English" : "ދިވެހި"}
              </Link>
            </div>

            {searchOpen && (
              <form
                onSubmit={handleSearch}
                className="absolute left-0 top-full z-30 mt-2 flex w-[min(19rem,80vw)] border border-white/30 bg-[#071521]/95 p-2 shadow-xl backdrop-blur"
              >
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={isDhivehi ? "ހޯދާ..." : "Search articles..."}
                  className={`min-w-0 flex-1 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/45 ${
                    isDhivehi ? "text-right font-thaana" : "text-left"
                  }`}
                  dir={isDhivehi ? "rtl" : "ltr"}
                />
                <button type="submit" className="bg-[#A61E2A] px-3 text-white" aria-label="Submit search">
                  <SearchIcon size={15} />
                </button>
              </form>
            )}
          </div>

          <Link to={isDhivehi ? "/" : "/en"} aria-label="Rayyithun home">
            <img
              src="/rayyithun-logo.png"
              alt="RAYYITHUN"
              className="h-14 w-36 rounded-sm bg-white object-cover object-center sm:h-16 sm:w-44"
            />
          </Link>
        </div>

        <nav
          className="no-scrollbar overflow-x-auto border-b border-white/15"
          aria-label={isDhivehi ? "މައި މެނޫ" : "Main navigation"}
          dir={isDhivehi ? "rtl" : "ltr"}
        >
          <ul className="flex min-w-max items-center">
            {navLinks.map(([label, href]) => (
              <li key={href}>
                <Link
                  to={href}
                  className={`block px-3 py-2 text-[11px] font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white sm:px-4 sm:text-xs ${
                    isDhivehi ? "font-thaana" : "uppercase tracking-[0.08em]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-h-0 flex-1 items-center py-4 sm:py-5">
          <div className={`ml-auto w-full max-w-[34rem] ${isDhivehi ? "text-right" : "text-left"}`}>
            <div className="mb-3 flex items-center justify-start gap-2" aria-hidden="true">
              <span className="h-px w-10 bg-[#C12835]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#C12835]" />
            </div>
            <h1
              id={`brand-hero-heading-${language}`}
              className={
                isDhivehi
                  ? "font-thaana thaana-headline text-[1.85rem] font-bold leading-[1.45] text-balance sm:text-[2.2rem] md:text-[2.45rem]"
                  : "font-serif text-[2.05rem] font-bold leading-[1.02] tracking-[-0.025em] text-balance sm:text-[2.5rem] md:text-[2.8rem]"
              }
            >
              {copy.heading}
            </h1>
            <p
              className={`mt-3 max-w-[31rem] text-sm text-white/80 sm:text-[0.95rem] ${
                isDhivehi
                  ? "mr-0 border-r border-white/35 pr-4 font-thaana leading-[1.9] thaana-body"
                  : "ml-0 border-l border-white/35 pl-4 leading-relaxed"
              }`}
            >
              {copy.supporting}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
