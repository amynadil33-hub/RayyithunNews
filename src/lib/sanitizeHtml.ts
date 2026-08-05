import DOMPurify from "dompurify";

const ARTICLE_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const ARTICLE_ATTRIBUTES = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "title",
  "class",
];

const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function plainTextToParagraphs(content: string) {
  return content
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`,
    )
    .join("");
}

export function sanitizeArticleHtml(content?: string | null) {
  if (!content?.trim()) return "";

  const html = HTML_TAG_PATTERN.test(content)
    ? content
    : plainTextToParagraphs(content);

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ARTICLE_TAGS,
    ALLOWED_ATTR: ARTICLE_ATTRIBUTES,
  });

  const template = document.createElement("template");
  template.innerHTML = sanitized;
  template.content
    .querySelectorAll<HTMLAnchorElement>("a[target='_blank']")
    .forEach((link) => {
      link.rel = "noopener noreferrer";
    });

  return template.innerHTML;
}
