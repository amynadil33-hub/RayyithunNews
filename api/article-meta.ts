interface ApiRequest {
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  send(body: string): void;
}

interface ArticleMetadata {
  title: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  featured_image_url: string | null;
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function requestOrigin(request: ApiRequest) {
  const configuredUrl = process.env.VITE_SITE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  const forwardedHost = firstQueryValue(request.headers["x-forwarded-host"]);
  const host = forwardedHost ?? firstQueryValue(request.headers.host);
  const forwardedProto = firstQueryValue(request.headers["x-forwarded-proto"]);
  return host ? `${forwardedProto ?? "https"}://${host}` : "";
}

function absoluteUrl(value: string | null, origin: string) {
  if (!value) return `${origin}/rayyithun-logo-dhivehi-transparent.png`;
  try {
    return new URL(value, `${origin}/`).toString();
  } catch {
    return value;
  }
}

function renderMetadataHtml(
  article: ArticleMetadata,
  canonicalUrl: string,
  origin: string,
) {
  const title = article.seo_title?.trim() || article.title;
  const description =
    article.seo_description?.trim() || article.excerpt?.trim() || "";
  const image = absoluteUrl(
    article.og_image_url || article.featured_image_url,
    origin,
  );

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(canonicalUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeTitle} — RAYYITHUN</title>
    <meta name="description" content="${safeDescription}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="RAYYITHUN">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${safeUrl}">
    <meta property="og:image" content="${safeImage}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${safeImage}">
    <link rel="canonical" href="${safeUrl}">
  </head>
  <body><a href="${safeUrl}">${safeTitle}</a></body>
</html>`;
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  const slug = firstQueryValue(request.query.slug)?.trim();
  const portal = firstQueryValue(request.query.portal) === "english"
    ? "english"
    : "dhivehi";
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/+$/, "");
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const origin = requestOrigin(request);

  if (!slug || !supabaseUrl || !supabaseKey || !origin) {
    response.status(400).send("Article metadata is not configured.");
    return;
  }

  const query = new URLSearchParams({
    select:
      "title,excerpt,seo_title,seo_description,og_image_url,featured_image_url,portal:portals!inner(slug)",
    slug: `eq.${slug}`,
    status: "eq.published",
    "portal.slug": `eq.${portal}`,
    limit: "1",
  });

  try {
    const articleResponse = await fetch(
      `${supabaseUrl}/rest/v1/articles?${query.toString()}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: "application/json",
        },
      },
    );

    if (!articleResponse.ok) {
      response.status(502).send("Article metadata could not be loaded.");
      return;
    }

    const articles = (await articleResponse.json()) as ArticleMetadata[];
    const article = articles[0];
    if (!article) {
      response.status(404).send("Article not found.");
      return;
    }

    const articlePath =
      portal === "english" ? `/en/article/${slug}` : `/article/${slug}`;
    const canonicalUrl = new URL(articlePath, `${origin}/`).toString();

    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600",
    );
    response.status(200).send(renderMetadataHtml(article, canonicalUrl, origin));
  } catch {
    response.status(502).send("Article metadata could not be loaded.");
  }
}
