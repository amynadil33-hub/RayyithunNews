import { useState } from "react";
import { CheckIcon, LinkIcon, Share2Icon } from "lucide-react";
import SocialIcon from "./SocialIcon.tsx";
import type { SocialIconName } from "./SocialIcon.tsx";

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

  const links: Array<{ label: SocialIconName; href: string }> = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
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

  const socialButtonClass = compact
    ? "flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E5E3] bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
    : "flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E5E3] bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md";
  const utilityButtonClass = `${socialButtonClass} text-[#2D6A4F]`;

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-y border-[#E5E7E2] py-3"
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
          className={socialButtonClass}
          aria-label={`Share on ${link.label}`}
        >
          <SocialIcon name={link.label} />
        </a>
      ))}
      {nativeShare && (
        <button
          type="button"
          onClick={() => void shareArticle()}
          className={utilityButtonClass}
          aria-label="More sharing options"
        >
          <Share2Icon size={17} />
        </button>
      )}
      <button
        type="button"
        onClick={() => void copyLink()}
        className={utilityButtonClass}
        aria-label="Copy article link"
      >
        {copied ? <CheckIcon size={17} /> : <LinkIcon size={17} />}
      </button>
    </div>
  );
}
