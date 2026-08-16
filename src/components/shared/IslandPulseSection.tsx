import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MapPinIcon } from "lucide-react";
import type { IslandPulseItem } from "../../lib/database.types.ts";
import { getIslandPulseItems } from "../../services/islandPulse.ts";
import { Skeleton } from "../ui/skeleton.tsx";

type IslandPulseLanguage = "english" | "dhivehi";

function getItemDestination(
  item: IslandPulseItem,
  language: IslandPulseLanguage,
) {
  const linkUrl = item.link_url?.trim();
  if (linkUrl?.startsWith("/")) {
    return { href: linkUrl, external: false };
  }
  if (linkUrl) {
    try {
      const url = new URL(linkUrl);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return { href: url.toString(), external: true };
      }
    } catch {
      // Invalid URLs remain static rather than becoming unsafe links.
    }
  }

  const expectedPortal = language === "dhivehi" ? "dhivehi" : "english";
  if (
    item.article_id &&
    item.article?.slug &&
    item.article.portal?.slug === expectedPortal
  ) {
    return {
      href:
        language === "dhivehi"
          ? `/article/${item.article.slug}`
          : `/en/article/${item.article.slug}`,
      external: false,
    };
  }

  return null;
}

function IslandPulseItemContent({
  item,
  language,
  compact = false,
}: {
  item: IslandPulseItem;
  language: IslandPulseLanguage;
  compact?: boolean;
}) {
  const isDhivehi = language === "dhivehi";
  const name = isDhivehi ? item.name_dv : item.name_en;
  const atoll = isDhivehi ? item.atoll_dv : item.atoll_en;
  const description = isDhivehi ? item.description_dv : item.description_en;

  return (
    <>
      {item.image_url ? (
        <img
          src={item.image_url}
          alt=""
          className={`${compact ? "h-12 w-12" : "h-14 w-14"} shrink-0 rounded-full object-cover ring-1 ring-[#D8DED9]`}
          loading="lazy"
        />
      ) : (
        <span
          className={`flex ${compact ? "h-12 w-12" : "h-14 w-14"} shrink-0 items-center justify-center rounded-full bg-[#D8E8D8] text-[#103820] ring-1 ring-[#C8D8CB]`}
        >
          <MapPinIcon size={21} aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#142820] transition-colors group-hover:text-[#103820]">
          {name}
        </span>
        {atoll && (
          <span className="mt-0.5 block truncate text-[11px] font-medium text-[#6B756E]">
            {atoll}
          </span>
        )}
        {description && (
          <span className="mt-1 block text-xs leading-relaxed text-[#526159] line-clamp-2">
            {description}
          </span>
        )}
      </span>
    </>
  );
}

function IslandPulseCard({
  item,
  language,
  compact = false,
}: {
  item: IslandPulseItem;
  language: IslandPulseLanguage;
  compact?: boolean;
}) {
  const destination = getItemDestination(item, language);
  const className = compact
    ? "group flex min-w-0 items-start gap-3 py-3 transition-colors"
    : "group flex min-w-0 items-start gap-3 rounded-sm border border-[#E5E7E2] bg-white p-3.5 transition-colors hover:border-[#B9C9BC]";
  const content = (
    <IslandPulseItemContent item={item} language={language} compact={compact} />
  );

  if (!destination) return <div className={className}>{content}</div>;
  if (destination.external) {
    return (
      <a
        href={destination.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }
  return (
    <Link to={destination.href} className={className}>
      {content}
    </Link>
  );
}

export default function IslandPulseSection({
  language,
  variant = "section",
}: {
  language: IslandPulseLanguage;
  variant?: "section" | "sidebar";
}) {
  const isDhivehi = language === "dhivehi";
  const isSidebar = variant === "sidebar";
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["island-pulse-items", 5],
    queryFn: () => getIslandPulseItems(5),
  });

  return (
    <section
      className={`${
        isSidebar
          ? "self-start rounded-sm border border-[#E5E7E2] bg-white p-5 shadow-sm"
          : "mx-auto max-w-7xl border-t border-[#E5E7E2] px-4 py-9"
      } ${isDhivehi ? "font-thaana text-right" : ""}`}
      dir={isDhivehi ? "rtl" : "ltr"}
      aria-labelledby={`island-pulse-heading-${language}`}
    >
      <div className={isSidebar ? "border-b border-[#D8E8D8] pb-3" : "mb-5"}>
        <h2
          id={`island-pulse-heading-${language}`}
          className={`${isDhivehi ? `thaana-headline ${isSidebar ? "text-xl" : "text-2xl"}` : `font-serif ${isSidebar ? "text-lg" : "text-xl"} tracking-wide`} font-bold text-[#142820]`}
        >
          {isDhivehi ? "ރަށް ތަކުގެ ވިންދު" : "ISLAND PULSE"}
        </h2>
        <p className="mt-1 text-sm text-[#6B756E]">
          {isDhivehi
            ? "ރަށްތަކާއި މުޖުތަމަޢުތަކުގެ ހަބަރުތައް"
            : "Updates from islands and communities"}
        </p>
      </div>

      {isLoading ? (
        <div
          className={
            isSidebar
              ? "divide-y divide-[#E5E7E2]"
              : "grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          }
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={isSidebar ? "py-3" : ""}>
              <Skeleton className={isSidebar ? "h-16" : "h-24 rounded-sm"} />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div
          className={
            isSidebar
              ? "divide-y divide-[#E5E7E2]"
              : "grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          }
        >
          {items.slice(0, 5).map((item) => (
            <IslandPulseCard
              key={item.id}
              item={item}
              language={language}
              compact={isSidebar}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-sm border border-[#E5E7E2] bg-white px-4 py-5 text-sm text-[#6B756E]">
          {isDhivehi
            ? "ރަށްތަކުގެ އަޕްޑޭޓްތަކެއް މިހާރު ނެތް."
            : "No island updates are available yet."}
        </p>
      )}
    </section>
  );
}
