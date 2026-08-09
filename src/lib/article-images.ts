const DEFAULT_ARTICLE_IMAGE_HEIGHT = 600;
const MIN_ARTICLE_IMAGE_HEIGHT = 400;
const MAX_ARTICLE_IMAGE_HEIGHT = 760;

export function clampArticleImageHeight(height: number) {
  return Math.min(MAX_ARTICLE_IMAGE_HEIGHT, Math.max(MIN_ARTICLE_IMAGE_HEIGHT, Math.round(height)));
}

export function getArticleImageUrl(value?: string | null) {
  return value?.split("#", 1)[0] ?? "";
}

export function getArticleImageHeight(value?: string | null) {
  const match = value?.match(/#height=(\d+)$/);
  return match ? clampArticleImageHeight(Number(match[1])) : DEFAULT_ARTICLE_IMAGE_HEIGHT;
}

export function setArticleImageHeight(value: string, height: number) {
  const url = getArticleImageUrl(value);
  return url ? `${url}#height=${clampArticleImageHeight(height)}` : "";
}

export { DEFAULT_ARTICLE_IMAGE_HEIGHT, MIN_ARTICLE_IMAGE_HEIGHT, MAX_ARTICLE_IMAGE_HEIGHT };
