import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { getNewsletterSubscribers } from "../../services/contact.ts";
import type { NewsletterSubscriber } from "../../lib/database.types.ts";

export default function Newsletter() {
  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: getNewsletterSubscribers,
  });

  const active = subscribers?.filter(s => s.is_active).length ?? 0;

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#103820]">Newsletter Subscribers</h1>
          {!isLoading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {active} active of {subscribers?.length ?? 0} total
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>
              {["Email", "Portal", "Status", "Subscribed On"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-[#103820]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                  </tr>
                ))
              : subscribers?.map((s: NewsletterSubscriber) => (
                  <tr key={s.id} className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]">
                    <td className="px-4 py-3 font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{s.portal?.name ?? s.portal_id ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {s.is_active ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
            {!isLoading && subscribers?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No subscribers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
