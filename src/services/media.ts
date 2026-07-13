import { supabase } from "../lib/supabaseClient.ts";
import type { MediaAsset } from "../lib/database.types.ts";

export async function getMediaAssets(limit = 50) {
  const { data, error } = await supabase
    .from("media_assets")
    .select("*, uploader:profiles(id, full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as MediaAsset[];
}

export async function uploadMediaAsset(
  file: File,
  bucket: string,
  uploaderId?: string,
  folder = "site"
): Promise<MediaAsset> {
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const filePath = `${folder}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      uploaded_by: uploaderId ?? null,
      file_url: urlData.publicUrl,
      file_path: filePath,
      file_type: file.type,
    } as never)
    .select()
    .single();

  if (error) throw error;
  return data as MediaAsset;
}

async function uploadTo(file: File, bucket: string, folder: string) {
  const { data: { user } } = await supabase.auth.getUser();
  return uploadMediaAsset(file, bucket, user?.id, folder);
}
export const uploadArticleImage = (file: File) => uploadTo(file, "article-images", "articles");
export const uploadAdBanner = (file: File) => uploadTo(file, "ad-banners", "ads");
export const uploadPodcastCover = (file: File) => uploadTo(file, "podcast-covers", "podcasts");
export const uploadSiteAsset = (file: File) => uploadTo(file, "site-assets", "site");
export function getPublicUrl(bucket: string, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function deleteMediaAsset(id: string, filePath: string, bucket: string) {
  await supabase.storage.from(bucket).remove([filePath]);
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) throw error;
}

export async function updateMediaAltText(id: string, altText: string, caption?: string) {
  const { error } = await supabase
    .from("media_assets")
    .update({ alt_text: altText, caption } as never)
    .eq("id", id);
  if (error) throw error;
}
