import {
  getArticleImageHeight,
  getArticleImageUrl,
} from "../../lib/article-images.ts";
import { sanitizeArticleHtml } from "../../lib/sanitizeHtml.ts";

interface ArticleBodyProps {
  content?: string | null;
  imageUrl?: string | null;
  imageCredit?: string | null;
  title: string;
  isDhivehi?: boolean;
}

function splitArticleHtml(html: string): [string, string] {
  if (!html || typeof document === "undefined") return [html, ""];

  const template = document.createElement("template");
  template.innerHTML = html;
  const nodes = Array.from(template.content.childNodes);
  if (nodes.length < 2) return [html, ""];

  const splitAt = Math.ceil(nodes.length / 2);
  const before = document.createElement("div");
  const after = document.createElement("div");
  nodes.slice(0, splitAt).forEach((node) => before.append(node.cloneNode(true)));
  nodes.slice(splitAt).forEach((node) => after.append(node.cloneNode(true)));
  return [before.innerHTML, after.innerHTML];
}

export default function ArticleBody({
  content,
  imageUrl,
  imageCredit,
  title,
  isDhivehi = false,
}: ArticleBodyProps) {
  const [firstHalf, secondHalf] = splitArticleHtml(
    sanitizeArticleHtml(content),
  );
  const contentClass = `article-content ${
    isDhivehi ? "article-content-dhivehi" : "article-content-english"
  }`;

  return (
    <>
      <div
        className={contentClass}
        lang={isDhivehi ? "dv" : "en"}
        dir={isDhivehi ? "rtl" : "ltr"}
        dangerouslySetInnerHTML={{ __html: firstHalf }}
      />
      {imageUrl && (
        <figure className="my-8 overflow-hidden rounded-sm bg-[#E5E7E2]">
          <img
            src={getArticleImageUrl(imageUrl)}
            alt={`${title} — article image`}
            className="w-full object-cover"
            style={{
              height: getArticleImageHeight(imageUrl),
              maxHeight: "70vh",
            }}
            loading="lazy"
          />
          {imageCredit && (
            <figcaption className="bg-white px-1 pt-2 text-xs leading-relaxed text-[#6B756E]">
              {imageCredit}
            </figcaption>
          )}
        </figure>
      )}
      {secondHalf && (
        <div
          className={contentClass}
          lang={isDhivehi ? "dv" : "en"}
          dir={isDhivehi ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{ __html: secondHalf }}
        />
      )}
    </>
  );
}
