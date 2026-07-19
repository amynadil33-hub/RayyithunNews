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
    heading: "އަޑުތަކުގެ މަތީގައި. ތެދާއި ކައިރީގައި.",
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
  ["ލިޔުން ހުށަހަޅާ", "/submit-article"],
  ["ބާޒާރު", "/market"],
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
      className="relative isolate h-[420px] overflow-hidden bg-[#103820] text-white sm:h-[360px] md:h-[300px]"
      dir={isDhivehi ? "rtl" : "ltr"}
      lang={language}
      aria-labelledby={`brand-hero-heading-${language}`}
    >
      <img
        src="/frigatebird-editorial-hero.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-y-0 left-0 h-full w-full object-contain object-center opacity-90 mix-blend-luminosity md:w-[68%] md:object-left"
        style={{
          WebkitMaskImage: "linear-gradient(to right, black 0%, black 72%, transparent 100%)",
          maskImage: "linear-gradient(to right, black 0%, black 72%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[#103820]/42" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#103820]/20 via-[#103820]/48 to-[#081F12]/95"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#081F12]/95 to-transparent"
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
                className={`border border-white/50 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-[#103820] ${
                  isDhivehi ? "" : "font-thaana"
                }`}
              >
                {isDhivehi ? "English" : "ދިވެހި"}
              </Link>
            </div>

            {searchOpen && (
              <form
                onSubmit={handleSearch}
                className="absolute left-0 top-full z-30 mt-2 flex w-[min(19rem,80vw)] border border-white/30 bg-[#103820]/95 p-2 shadow-xl backdrop-blur"
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

          <Link
            to={isDhivehi ? "/" : "/en"}
            aria-label="Rayyithun home"
            className="isolate overflow-hidden rounded-sm border border-[#E6D8B8]/60 bg-[url('/newspaper-logo-texture.png')] bg-cover bg-center shadow-lg"
          >
            <img
              src="/rayyithun-logo.png"
              alt="RAYYITHUN"
              className="h-14 w-36 object-cover object-center mix-blend-multiply sm:h-16 sm:w-44"
            />
          </Link>
        </div>

        <nav
          className="no-scrollbar overflow-x-auto border-b border-white/25"
          aria-label={isDhivehi ? "މައި މެނޫ" : "Main navigation"}
          dir={isDhivehi ? "rtl" : "ltr"}
        >
          <ul className="flex min-w-max items-center">
            {navLinks.map(([label, href]) => (
              <li key={href}>
                <Link
                  to={href}
                  className={`block border-x border-white/5 px-4 py-2.5 text-xs font-bold text-white/90 transition-colors hover:border-white/15 hover:bg-white/15 hover:text-white sm:px-5 sm:text-sm ${
                    isDhivehi ? "font-thaana" : "uppercase tracking-[0.08em]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-h-0 flex-1 items-center py-3 sm:py-4">
          <div className={`ml-auto w-full max-w-[34rem] ${isDhivehi ? "text-right" : "text-left"}`}>
            <div className="mb-3 flex items-center justify-start gap-2" aria-hidden="true">
              <span className="h-px w-10 bg-[#C12835]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#C12835]" />
            </div>
            <h1
              id={`brand-hero-heading-${language}`}
              className={
                isDhivehi
                  ? "font-thaana thaana-headline text-[1.75rem] font-bold leading-[1.4] text-balance sm:text-[2rem] md:text-[2.15rem]"
                  : "font-serif text-[1.95rem] font-bold leading-[1.02] tracking-[-0.025em] text-balance sm:text-[2.25rem] md:text-[2.4rem]"
              }
            >
              {copy.heading}
            </h1>
            <p
              className={`mt-2 max-w-[31rem] text-[0.8rem] text-white/80 sm:text-sm ${
                isDhivehi
                  ? "mr-0 border-r border-white/35 pr-4 font-thaana leading-[1.75] thaana-body"
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
