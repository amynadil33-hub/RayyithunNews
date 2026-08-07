import { useState } from "react";
import { CheckIcon, LinkIcon, Share2Icon } from "lucide-react";

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
      shortLabel: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverClass: "hover:border-[#1877F2] hover:text-[#1877F2]",
    },
    {
      label: "WhatsApp",
      shortLabel: "WA",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
      hoverClass: "hover:border-[#25D366] hover:text-[#128C4A]",
    },
    {
      label: "X",
      shortLabel: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      hoverClass: "hover:border-black hover:text-black",
    },
    {
      label: "LinkedIn",
      shortLabel: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
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
          {compact ? link.shortLabel : link.label}
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
