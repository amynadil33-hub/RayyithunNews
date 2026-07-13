import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { adminGetPages, adminCreatePage, adminUpdatePage } from "../../services/pages.ts";
import type { StaticPage, PageStatus, PortalSlug } from "../../lib/database.types.ts";

const PORTALS: PortalSlug[] = ["english", "dhivehi"];
const STATUSES: PageStatus[] = ["draft", "published"];

type FormState = { title: string; slug: string; content: string; portal_id: string; status: PageStatus };
const blank: FormState = { title: "", slug: "", content: "", portal_id: "", status: "draft" };

function toSlug(s: string) { return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); }

export default function Pages() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(blank);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: pages, isLoading } = useQuery({ queryKey: ["static-pages"], queryFn: () => adminGetPages() });

  const save = useMutation({
    mutationFn: () => editId ? adminUpdatePage(editId, form) : adminCreatePage(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["static-pages"] }); toast.success("Saved"); reset(); },
    onError: (e: Error) => toast.error(e.message),
  });

  function reset() { setForm(blank); setEditId(null); setShowForm(false); }
  function edit(p: StaticPage) {
    setForm({ title: p.title, slug: p.slug, content: p.content ?? "", portal_id: p.portal_id ?? "", status: p.status });
    setEditId(p.id); setShowForm(true);
  }
  function field<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v, ...(k === "title" && !editId ? { slug: toSlug(String(v)) } : {}) }));
  }

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Static Pages</h1>
        <button onClick={() => { reset(); setShowForm(true); }} className="bg-[#103820] text-white px-4 py-1.5 rounded text-sm hover:bg-[#1a5230]">+ New Page</button>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>{["Title", "Slug", "Portal", "Status", "Updated", ""].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-[#103820]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
            )) : pages?.map((p: StaticPage) => (
              <tr key={p.id} className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">{p.slug}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{p.portal_id ?? "All"}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => edit(p)} className="text-[#103820] hover:underline text-xs">Edit</button></td>
              </tr>
            ))}
            {!isLoading && pages?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No pages yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E5E7E2] rounded-lg p-6 max-w-2xl">
          <h2 className="font-semibold text-[#103820] mb-4">{editId ? "Edit" : "New"} Page</h2>
          <div className="space-y-3">
            {(["title", "slug"] as const).map(k => (
              <div key={k}><label className="block text-xs font-medium mb-1 capitalize">{k}</label>
                <input value={form[k]} onChange={e => field(k, e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" /></div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium mb-1">Portal</label>
                <select value={form.portal_id} onChange={e => field("portal_id", e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm bg-white">
                  <option value="">All Portals</option>
                  {PORTALS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select></div>
              <div><label className="block text-xs font-medium mb-1">Status</label>
                <select value={form.status} onChange={e => field("status", e.target.value as PageStatus)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm bg-white">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select></div>
            </div>
            <div><label className="block text-xs font-medium mb-1">Content</label>
              <textarea rows={8} value={form.content} onChange={e => field("content", e.target.value)} className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm font-mono" /></div>
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
