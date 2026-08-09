import { getArticleImageUrl } from "../../lib/article-images.ts";
import { sanitizeArticleHtml } from "../../lib/sanitizeHtml.ts";

interface ArticleBodyProps {
  content?: string | null;
  imageUrl?: string | null;
  imageCredit?: string | null;
  secondImageUrl?: string | null;
  secondImageCredit?: string | null;
  title: string;
  isDhivehi?: boolean;
}

function splitArticleHtml(html: string, partCount: number): string[] {
  if (!html || typeof document === "undefined" || partCount <= 1) return [html];

  const template = document.createElement("template");
  template.innerHTML = html;
  const nodes = Array.from(template.content.childNodes);
  if (nodes.length < 2) return [html];

  const chunkSize = Math.ceil(nodes.length / partCount);
  return Array.from({ length: partCount }, (_, index) => {
    const container = document.createElement("div");
    nodes
      .slice(index * chunkSize, (index + 1) * chunkSize)
      .forEach((node) => container.append(node.cloneNode(true)));
    return container.innerHTML;
  }).filter(Boolean);
}

export default function ArticleBody({
  content,
  imageUrl,
  imageCredit,
  secondImageUrl,
  secondImageCredit,
  title,
  isDhivehi = false,
}: ArticleBodyProps) {
  const images = [
    { url: imageUrl, credit: imageCredit },
    { url: secondImageUrl, credit: secondImageCredit },
  ].filter(
    (image): image is { url: string; credit: string | null | undefined } =>
      Boolean(image.url),
  );
  const sections = splitArticleHtml(
    sanitizeArticleHtml(content),
    images.length + 1,
  );
  const contentClass = `article-content ${
    isDhivehi ? "article-content-dhivehi" : "article-content-english"
  }`;

  return (
    <div className="min-w-0 overflow-x-hidden">
      {sections.map((section, index) => {
        const image = images[index];
        return (
          <div key={index}>
            {section && (
              <div
                className={contentClass}
                lang={isDhivehi ? "dv" : "en"}
                dir={isDhivehi ? "rtl" : "ltr"}
                dangerouslySetInnerHTML={{ __html: section }}
              />
            )}
            {image && (
              <figure className="my-6 sm:my-10 overflow-hidden rounded-sm bg-[#E5E7E2]">
                <img
                  src={getArticleImageUrl(image.url)}
                  alt={`${title} — article image ${index + 1}`}
                  className="block h-auto w-full object-contain"
                  loading="lazy"
                />
                {image.credit && (
                  <figcaption className="bg-white px-1 pt-2 text-xs leading-relaxed text-[#6B756E]">
                    {image.credit}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        );
      })}
    </div>
  );
}
