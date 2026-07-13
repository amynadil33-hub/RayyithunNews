import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { getMediaAssets, uploadMediaAsset, deleteMediaAsset } from "../../services/media.ts";
import { useAdminAuth } from "../../hooks/use-admin-auth.tsx";
import type { MediaAsset } from "../../lib/database.types.ts";

const BUCKET = "site-assets";

export default function Media() {
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: assets, isLoading } = useQuery({
    queryKey: ["media-assets"],
    queryFn: () => getMediaAssets(100),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Not authenticated");
      return uploadMediaAsset(file, BUCKET, user.id, "site");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["media-assets"] }); toast.success("Uploaded"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (asset: MediaAsset) => deleteMediaAsset(asset.id, asset.file_path, BUCKET),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["media-assets"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(f => upload.mutate(f));
  }

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Media Library</h1>
        <div className="flex gap-3 items-center">
          {upload.isPending && <span className="text-sm text-gray-500">Uploading…</span>}
          <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          <button onClick={() => fileRef.current?.click()} className="bg-[#103820] text-white px-4 py-1.5 rounded text-sm hover:bg-[#1a5230]">Upload Files</button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
        </div>
      ) : assets?.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No media yet</p>
          <p className="text-sm">Upload images, videos, or PDFs to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets?.map((a: MediaAsset) => (
            <div key={a.id} className="group relative bg-white border border-[#E5E7E2] rounded-lg overflow-hidden">
              {a.file_type.startsWith("image/") ? (
                <img src={a.file_url} alt={a.alt_text ?? ""} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-[#F8F8F8] text-gray-400">
                  <span className="text-xs text-center px-2">{a.file_type}</span>
                </div>
              )}
              <div className="p-2">
                <p className="text-xs text-gray-500 truncate">{a.file_type}</p>
                <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => del.mutate(a)}
                disabled={del.isPending}
                className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
