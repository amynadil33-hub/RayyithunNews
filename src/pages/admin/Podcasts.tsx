import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { getAllPodcasts, createPodcast, updatePodcast, deletePodcast } from "../../services/podcasts.ts";
import type { Podcast, PodcastStatus, PortalSlug } from "../../lib/database.types.ts";

const PORTALS: PortalSlug[] = ["english", "dhivehi"];
const STATUSES: PodcastStatus[] = ["draft", "published"];

type FormState = {
  title: string; slug: string; description: string; host: string;
  audio_url: string; cover_image_url: string; duration: string;
  status: PodcastStatus; portal_id: string;
};

const blank: FormState = { title: "", slug: "", description: "", host: "", audio_url: "", cover_image_url: "", duration: "", status: "draft", portal_id: "" };

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }

export default function Podcasts() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: pods, isLoading } = useQuery({ queryKey: ["podcasts-all"], queryFn: getAllPodcasts });

  const save = useMutation({
    mutationFn: async () => {
      if (editId) return updatePodcast(editId, form);
      return createPodcast(form);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["podcasts-all"] }); toast.success("Saved"); reset(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: deletePodcast,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["podcasts-all"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  function reset() { setForm(blank); setEditId(null); setShowForm(false); }
  function edit(p: Podcast) {
    setForm({ title: p.title, slug: p.slug, description: p.description ?? "", host: p.host ?? "", audio_url: p.audio_url ?? "", cover_image_url: p.cover_image_url ?? "", duration: p.duration ?? "", status: p.status, portal_id: p.portal_id });
    setEditId(p.id); setShowForm(true);
  }
  function field<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v, ...(k === "title" && !editId ? { slug: toSlug(String(v)) } : {}) }));
  }

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Podcasts</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="bg-[#103820] text-white px-4 py-1.5 rounded text-sm hover:bg-[#1a5230]">+ New Podcast</button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>{["Title","Host","Duration","Portal","Status",""].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-[#103820]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
            )) : pods?.map(p => (
              <tr key={p.id} className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">{p.host ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.duration ?? "—"}</td>
                <td className="px-4 py-3 text-xs">{p.portal?.name ?? p.portal_id}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => edit(p)} className="text-[#103820] hover:underline text-xs">Edit</button>
                  <button onClick={() => del.mutate(p.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E5E7E2] rounded-lg p-6 max-w-2xl">
          <h2 className="font-semibold text-[#103820] mb-4">{editId ? "Edit" : "New"} Podcast</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["title","slug","host","duration","audio_url","cover_image_url"] as const).map(k => (
              <div key={k} className={k === "audio_url" || k === "cover_image_url" ? "col-span-2" : ""}>
                <label className="block text-xs font-medium mb-1 capitalize">{k.replace(/_/g," ")}</label>
                <input value={form[k]} onChange={e => field(k, e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="col-span-2"><label className="block text-xs font-medium mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => field("description", e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => field("status", e.target.value as PodcastStatus)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm bg-white">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium mb-1">Portal</label>
              <select value={form.portal_id} onChange={e => field("portal_id", e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm bg-white">
                <option value="">Select portal</option>
                {PORTALS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select></div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => save.mutate()} disabled={save.isPending} className="bg-[#103820] text-white px-5 py-2 rounded text-sm hover:bg-[#1a5230] disabled:opacity-50">Save</button>
            <button onClick={reset} className="border border-[#E5E7E2] px-5 py-2 rounded text-sm hover:bg-[#F8F8F8]">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
