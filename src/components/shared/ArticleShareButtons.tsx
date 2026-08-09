import { useState } from "react";
import { CheckIcon, LinkIcon, Share2Icon } from "lucide-react";

type SharePlatform = "Facebook" | "WhatsApp" | "X" | "LinkedIn";

const brandPaths: Record<SharePlatform, string> = {
  Facebook:
    "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.973h-1.513c-1.49 0-1.956.931-1.956 1.887v2.261h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z",
  WhatsApp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.84 9.84 0 01-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.83 9.83 0 01-1.51-5.26c.002-5.45 4.437-9.884 9.887-9.884a9.82 9.82 0 017.004 2.903 9.825 9.825 0 012.895 7.006c-.002 5.45-4.437 9.884-9.902 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.893c0 2.096.547 4.142 1.588 5.945L.057 24l6.3-1.652a11.87 11.87 0 005.688 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.415Z",
  X: "M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.598-9.826L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.292 19.492h2.039L6.486 3.24H4.298l13.311 17.405Z",
  LinkedIn:
    "M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5ZM8 19H5V8h3v11ZM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764ZM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765C14.397 7.179 20 6.988 20 12.241V19Z",
};

function BrandIcon({ name }: { name: SharePlatform }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d={brandPaths[name]} />
    </svg>
  );
}

interface ArticleShareButtonsProps {
  title: string;
  url: string;
  compact?: boolean;
}

export default function ArticleShareButtons({
  title,
  url,
  compact = false,
}: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const nativeShare =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { share?: Navigator["share"] }).share
      : undefined;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      iconClass: "text-[#1877F2]",
      hoverClass: "hover:border-[#1877F2] hover:text-[#1877F2]",
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
      iconClass: "text-[#25D366]",
      hoverClass: "hover:border-[#25D366] hover:text-[#128C4A]",
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      iconClass: "text-black",
      hoverClass: "hover:border-black hover:text-black",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      iconClass: "text-[#0A66C2]",
      hoverClass: "hover:border-[#0A66C2] hover:text-[#0A66C2]",
    },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function shareArticle() {
    if (nativeShare) await navigator.share({ title, url });
  }

  const buttonClass = compact
    ? "inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-[#C8D1CA] px-2 text-[11px] font-bold text-[#526159] transition-colors"
    : "inline-flex h-9 items-center justify-center gap-1.5 rounded-sm border border-[#C8D1CA] px-3 text-xs font-semibold text-[#526159] transition-colors";

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-y border-[#E5E7E2] py-4"
      aria-label="Share this article"
    >
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#142820]">
        <Share2Icon size={14} /> Share
      </span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} ${link.hoverClass}`}
          aria-label={`Share on ${link.label}`}
        >
          <span className={link.iconClass}>
            <BrandIcon name={link.label as SharePlatform} />
          </span>
          {!compact && link.label}
        </a>
      ))}
      {nativeShare && (
        <button
          type="button"
          onClick={() => void shareArticle()}
          className={`${buttonClass} hover:border-[#103820] hover:text-[#103820]`}
        >
          <Share2Icon size={13} /> {!compact && "More"}
        </button>
      )}
      <button
        type="button"
        onClick={() => void copyLink()}
        className={`${buttonClass} hover:border-[#103820] hover:text-[#103820]`}
        aria-label="Copy article link"
      >
        {copied ? <CheckIcon size={13} /> : <LinkIcon size={13} />}
        {!compact && (copied ? "Copied" : "Copy link")}
      </button>
    </div>
  );
}
