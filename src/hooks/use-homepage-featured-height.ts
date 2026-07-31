import { useQuery } from "@tanstack/react-query";
import type { PortalSlug } from "../lib/database.types.ts";
import { getPortalBySlug, getSiteSetting } from "../services/settings.ts";

const DEFAULT_HEIGHT = 480;
const MIN_HEIGHT = 400;
const MAX_HEIGHT = 600;

export function clampHomepageFeaturedHeight(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) return DEFAULT_HEIGHT;
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(parsed)));
}

export function useHomepageFeaturedHeight(portalSlug: PortalSlug) {
  const { data: portal } = useQuery({
    queryKey: ["portal", portalSlug],
    queryFn: () => getPortalBySlug(portalSlug),
  });

  const { data: setting } = useQuery({
    queryKey: ["setting", "homepage_featured_height", portal?.id],
    queryFn: () => getSiteSetting("homepage_featured_height", portal!.id),
    enabled: Boolean(portal?.id),
  });

  return clampHomepageFeaturedHeight(setting?.value);
}
