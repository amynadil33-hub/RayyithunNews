import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { adminGetCategories, createCategory, updateCategory, deleteCategory } from "../../services/categories.ts";
import { getPortalBySlug } from "../../services/settings.ts";
import type { Category, PortalSlug } from "../../lib/database.types.ts";

const PORTALS: PortalSlug[] = ["english", "dhivehi"];

type FormState = {
  name: string; slug: string; description: string;
  sort_order: number; is_active: boolean; portal_id: string;
};

const blank: FormState = { name: "", slug: "", description: "", sort_order: 0, is_active: true, portal_id: "" };

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }

export default function Categories() {
  const qc = useQueryClient();
  const [portal, setPortal] = useState<PortalSlug>("english");
  const [form, setForm] = useState<FormState>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: portalData } = useQuery({ queryKey: ["portal", portal], queryFn: () => getPortalBySlug(portal) });
  const { data: cats, isLoading } = useQuery({ queryKey: ["categories", portal], queryFn: async () => {
    const selected = await getPortalBySlug(portal);
    return adminGetCategories(selected?.id);
  } });

  const save = useMutation({
    mutationFn: async () => {
      const payload = { ...form, portal_id: portalData?.id ?? form.portal_id };
      if (editId) return updateCategory(editId, payload);
      return createCategory(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Saved"); reset(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  function reset() { setForm(blank); setEditId(null); setShowForm(false); }
  function edit(c: Category) { setForm({ name: c.name, slug: c.slug, description: c.description ?? "", sort_order: c.sort_order, is_active: c.is_active, portal_id: c.portal_id }); setEditId(c.id); setShowForm(true); }
  function field<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v, ...(k === "name" && !editId ? { slug: toSlug(String(v)) } : {}) }));
  }

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Categories</h1>
        <div className="flex gap-3">
          <select value={portal} onChange={e => setPortal(e.target.value as PortalSlug)} className="border border-[#E5E7E2] rounded px-3 py-1.5 text-sm bg-white">
            {PORTALS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <button onClick={() => { reset(); setShowForm(true); }} className="bg-[#103820] text-white px-4 py-1.5 rounded text-sm hover:bg-[#1a5230]">+ New</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>{["Name","Slug","Order","Active",""].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-[#103820]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
            )) : cats?.map(c => (
              <tr key={c.id} className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                <td className="px-4 py-3">{c.sort_order}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => edit(c)} className="text-[#103820] hover:underline text-xs">Edit</button>
                  <button onClick={() => del.mutate(c.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E5E7E2] rounded-lg p-6 max-w-lg">
          <h2 className="font-semibold text-[#103820] mb-4">{editId ? "Edit" : "New"} Category</h2>
          <div className="space-y-3">
            {(["name","slug","description"] as const).map(k => (
              <div key={k}><label className="block text-xs font-medium mb-1 capitalize">{k}</label>
                <input value={form[k]} onChange={e => field(k, e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" /></div>
            ))}
            <div><label className="block text-xs font-medium mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => field("sort_order", Number(e.target.value))} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" /></div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => field("is_active", e.target.checked)} /> Active
            </label>
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
