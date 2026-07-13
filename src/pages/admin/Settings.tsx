import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { getSiteSetting, upsertSiteSetting } from "../../services/settings.ts";
import type { PortalSlug } from "../../lib/database.types.ts";

const PORTALS: { label: string; value: PortalSlug }[] = [
  { label: "English", value: "english" },
  { label: "Dhivehi", value: "dhivehi" },
];

type SettingsForm = {
  site_title: string;
  site_description: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
};

const blank: SettingsForm = { site_title: "", site_description: "", facebook: "", twitter: "", instagram: "", youtube: "" };

const SOCIAL_KEYS = ["facebook", "twitter", "instagram", "youtube"] as const;
type SocialKey = typeof SOCIAL_KEYS[number];

export default function Settings() {
  const [portal, setPortal] = useState<PortalSlug>("english");
  const [form, setForm] = useState<SettingsForm>(blank);

  const { data: titleSetting, isLoading } = useQuery({ queryKey: ["setting", "site_title", portal], queryFn: () => getSiteSetting("site_title", portal) });
  const { data: descSetting } = useQuery({ queryKey: ["setting", "site_description", portal], queryFn: () => getSiteSetting("site_description", portal) });
  const { data: socialSetting } = useQuery({ queryKey: ["setting", "social_links", portal], queryFn: () => getSiteSetting("social_links", portal) });

  useEffect(() => {
    const social = (socialSetting?.value ?? {}) as Record<SocialKey, string>;
    setForm({
      site_title: typeof titleSetting?.value === "string" ? titleSetting.value : "",
      site_description: typeof descSetting?.value === "string" ? descSetting.value : "",
      facebook: social.facebook ?? "",
      twitter: social.twitter ?? "",
      instagram: social.instagram ?? "",
      youtube: social.youtube ?? "",
    });
  }, [titleSetting, descSetting, socialSetting, portal]);

  const save = useMutation({
    mutationFn: async () => {
      await upsertSiteSetting("site_title", form.site_title, portal);
      await upsertSiteSetting("site_description", form.site_description, portal);
      await upsertSiteSetting("social_links", {
        facebook: form.facebook,
        twitter: form.twitter,
        instagram: form.instagram,
        youtube: form.youtube,
      }, portal);
    },
    onSuccess: () => toast.success("Settings saved"),
    onError: (e: Error) => toast.error(e.message),
  });

  function field<K extends keyof SettingsForm>(k: K, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Site Settings</h1>
        <select value={portal} onChange={e => setPortal(e.target.value as PortalSlug)} className="border border-[#E5E7E2] rounded px-3 py-1.5 text-sm bg-white">
          {PORTALS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[#E5E7E2] rounded-lg p-6 max-w-xl">
        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#103820] mb-1.5">Site Title</label>
              <input value={form.site_title} onChange={e => field("site_title", e.target.value)} placeholder="RAYYITHUN English" className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#103820] mb-1.5">Site Description</label>
              <textarea rows={3} value={form.site_description} onChange={e => field("site_description", e.target.value)} placeholder="Your portal description…" className="w-full border border-[#E5E7E2] rounded px-3 py-2 text-sm" />
            </div>

            <div className="pt-2 border-t border-[#E5E7E2]">
              <p className="text-xs font-semibold text-[#103820] mb-3">Social Media Links</p>
              <div className="space-y-3">
                {SOCIAL_KEYS.map(k => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium capitalize text-gray-500">{k}</span>
                    <input value={form[k]} onChange={e => field(k, e.target.value)} placeholder={`https://${k}.com/…`} className="flex-1 border border-[#E5E7E2] rounded px-3 py-2 text-sm" />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => save.mutate()} disabled={save.isPending} className="mt-2 bg-[#103820] text-white px-6 py-2 rounded text-sm hover:bg-[#1a5230] disabled:opacity-50 w-full">
              {save.isPending ? "Saving…" : "Save Settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
