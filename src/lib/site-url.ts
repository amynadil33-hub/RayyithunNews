const PRODUCTION_SITE_URL = "https://www.rayyithunn.com";

function getSiteBaseUrl() {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  return PRODUCTION_SITE_URL;
}

export function getCanonicalPageUrl() {
  const baseUrl = getSiteBaseUrl();
  if (!baseUrl || typeof window === "undefined") return baseUrl;
  return new URL(window.location.pathname, `${baseUrl}/`).toString();
}

export function getAbsoluteSiteUrl(value?: string | null) {
  if (!value) return "";
  try {
    return new URL(value, `${getSiteBaseUrl()}/`).toString();
  } catch {
    return value;
  }
}
