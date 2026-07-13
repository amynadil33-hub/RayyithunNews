import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { getAllAds, createAd, updateAd, deleteAd } from "../../services/advertisements.ts";
import type { Advertisement, AdPlacement } from "../../lib/database.types.ts";

const PLACEMENTS: AdPlacement[] = ["homepage_top_banner","category_top_banner","article_sidebar","article_inline","homepage_mid_banner","footer_banner","mobile_banner"];
const PORTALS = ["english", "dhivehi", "both"];

type FormState = Pick<Advertisement, "title" | "placement" | "priority" | "is_active" | "alt_text"> & {
  client_name: string; image_url: string; target_url: string;
  portal: string; start_date: string; end_date: string;
};

const blank: FormState = { title: "", client_name: "", image_url: "", target_url: "", portal: "both", placement: "homepage_top_banner", start_date: "", end_date: "", is_active: true, priority: 1, alt_text: "" };

export default function Advertisements() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: ads, isLoading } = useQuery({ queryKey: ["ads"], queryFn: getAllAds });

  const save = useMutation({
    mutationFn: async () => {
      const payload: Partial<Advertisement> = { ...form, portal_id: form.portal === "both" ? null : form.portal };
      if (editId) return updateAd(editId, payload);
      return createAd(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ads"] }); toast.success("Saved"); reset(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: deleteAd,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ads"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  function reset() { setForm(blank); setEditId(null); setShowForm(false); }
  function edit(a: Advertisement) {
    setForm({ title: a.title, client_name: a.client_name ?? "", image_url: a.image_url ?? "", target_url: a.target_url ?? "", portal: a.portal_id ?? "both", placement: a.placement, start_date: a.start_date ?? "", end_date: a.end_date ?? "", is_active: a.is_active, priority: a.priority, alt_text: a.alt_text ?? "" });
    setEditId(a.id); setShowForm(true);
  }
  function field<K extends keyof FormState>(k: K, v: FormState[K]) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Advertisements</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="bg-[#103820] text-white px-4 py-1.5 rounded text-sm hover:bg-[#1a5230]">+ New Ad</button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>{["Title","Client","Placement","Portal","Status","Priority",""].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-[#103820]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
            )) : ads?.map(a => (
              <tr key={a.id} className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]">
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3 text-gray-500">{a.client_name ?? "—"}</td>
                <td className="px-4 py-3 text-xs">{a.placement.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-xs">{a.portal_id ?? "Both"}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${a.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{a.is_active ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3">{a.priority}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => edit(a)} className="text-[#103820] hover:underline text-xs">Edit</button>
                  <button onClick={() => del.mutate(a.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E5E7E2] rounded-lg p-6 max-w-2xl">
          <h2 className="font-semibold text-[#103820] mb-4">{editId ? "Edit" : "New"} Advertisement</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["title","client_name","image_url","target_url","alt_text"] as const).map(k => (
              <div key={k} className={k === "target_url" || k === "image_url" ? "col-span-2" : ""}>
                <label className="block text-xs font-medium mb-1 capitalize">{k.replace(/_/g," ")}</label>
                <input value={form[k] as string} onChange={e => field(k, e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" />
              </div>
            ))}
            <div><label className="block text-xs font-medium mb-1">Portal</label>
              <select value={form.portal} onChange={e => field("portal", e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm bg-white">
                {PORTALS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium mb-1">Placement</label>
              <select value={form.placement} onChange={e => field("placement", e.target.value as AdPlacement)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm bg-white">
                {PLACEMENTS.map(p => <option key={p} value={p}>{p.replace(/_/g," ")}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium mb-1">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => field("start_date", e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium mb-1">End Date</label>
              <input type="date" value={form.end_date} onChange={e => field("end_date", e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium mb-1">Priority</label>
              <input type="number" value={form.priority} onChange={e => field("priority", Number(e.target.value))} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" /></div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" checked={form.is_active} onChange={e => field("is_active", e.target.checked)} id="ad_active" />
              <label htmlFor="ad_active" className="text-sm cursor-pointer">Active</label>
            </div>
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
