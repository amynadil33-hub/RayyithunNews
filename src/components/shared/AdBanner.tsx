import { useEffect } from "react";
import { useActiveAds } from "../../hooks/use-portal-data.ts";
import { trackAdImpression, trackAdClick } from "../../services/advertisements.ts";
import type { AdPlacement } from "../../lib/database.types.ts";
import { useLocation } from "react-router-dom";

interface AdBannerProps {
  placement: AdPlacement;
  portalSlug?: "dhivehi" | "english";
  label?: string; // "Advertisement" or "އިޢުލާން"
  className?: string;
}

// Responsive size hints per placement
const PLACEMENT_SIZES: Record<AdPlacement, { desktop: string; label: string }> = {
  homepage_top_banner: { desktop: "970×90 / 970×250", label: "Leaderboard" },
  category_top_banner: { desktop: "728×90", label: "Banner" },
  article_sidebar: { desktop: "300×250", label: "Rectangle" },
  article_inline: { desktop: "728×90", label: "Banner" },
  homepage_mid_banner: { desktop: "970×250", label: "Billboard" },
  footer_banner: { desktop: "970×90", label: "Footer Banner" },
  mobile_banner: { desktop: "320×100", label: "Mobile Banner" },
};

export default function AdBanner({ placement, portalSlug, label = "Advertisement", className = "" }: AdBannerProps) {
  const location = useLocation();
  const activePortal = portalSlug ?? (location.pathname.startsWith("/en") ? "english" : "dhivehi");
  const { data: ads } = useActiveAds(placement, activePortal);
  const ad = ads?.[0];
  const sizeInfo = PLACEMENT_SIZES[placement];

  useEffect(() => {
    if (ad?.id) {
      trackAdImpression(ad.id).catch(() => {});
    }
  }, [ad?.id]);

  const handleClick = () => {
    if (ad?.id) {
      trackAdClick(ad.id).catch(() => {});
    }
  };

  const isTopBanner = placement === "homepage_top_banner" || placement === "homepage_mid_banner";
  const isSidebar = placement === "article_sidebar";

  const containerHeight = isSidebar ? "h-64" : isTopBanner ? "h-20 md:h-24" : "h-16 md:h-20";

  return (
    <div className={`w-full ${className}`}>
      <p className="text-[10px] text-[#6B756E] text-center mb-1 uppercase tracking-wider font-medium">
        {label}
      </p>
      {ad?.image_url ? (
        <a
          href={ad.target_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={`block w-full ${containerHeight} overflow-hidden rounded-sm`}
        >
          <img
            src={ad.image_url}
            alt={ad.alt_text ?? ad.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </a>
      ) : (
        <div className={`ad-placeholder w-full ${containerHeight} rounded-sm`}>
          <span className="text-[11px] font-medium text-[#6B756E]">{sizeInfo.label}</span>
          <span className="text-[10px] text-[#6B756E]/60 mt-0.5">{sizeInfo.desktop}</span>
          <span className="text-[10px] text-[#103820]/40 mt-1">Your Ad Here</span>
        </div>
      )}
    </div>
  );
}
