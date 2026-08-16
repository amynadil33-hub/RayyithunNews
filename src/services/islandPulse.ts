import { supabase } from "../lib/supabaseClient.ts";
import type { IslandPulseItem } from "../lib/database.types.ts";

const ISLAND_PULSE_SELECT = `
  id,
  name_en,
  atoll_en,
  description_en,
  name_dv,
  atoll_dv,
  description_dv,
  slug,
  image_url,
  link_url,
  article_id,
  sort_order,
  is_active,
  article:articles(slug, portal:portals(slug))
`;

export async function getIslandPulseItems(limit = 5) {
  const { data, error } = await supabase
    .from("island_pulse_items")
    .select(ISLAND_PULSE_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as IslandPulseItem[];
}
