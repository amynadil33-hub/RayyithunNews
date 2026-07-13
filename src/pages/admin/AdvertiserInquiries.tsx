import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { getAdvertiserInquiries, updateInquiryStatus } from "../../services/contact.ts";
import type { AdvertiserInquiry, InquiryStatus } from "../../lib/database.types.ts";

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

const NEXT_STATUS: Record<InquiryStatus, { label: string; status: InquiryStatus }[]> = {
  new: [{ label: "Start", status: "in_progress" }, { label: "Resolve", status: "resolved" }],
  in_progress: [{ label: "Resolve", status: "resolved" }],
  resolved: [],
};

function StatusBadge({ status }: { status: InquiryStatus }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>{status.replace("_", " ")}</span>;
}

export default function AdvertiserInquiries() {
  const qc = useQueryClient();
  const { data: inquiries, isLoading } = useQuery({ queryKey: ["advertiser-inquiries"], queryFn: getAdvertiserInquiries });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) => updateInquiryStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["advertiser-inquiries"] }); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Advertiser Inquiries</h1>
        <span className="text-sm text-gray-500">{inquiries?.length ?? 0} inquiries</span>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>{["Name","Company","Email","Preferred Placement","Status","Date","Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-[#103820]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
            )) : inquiries?.map((inq: AdvertiserInquiry) => (
              <tr key={inq.id} className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]">
                <td className="px-4 py-3 font-medium whitespace-nowrap">{inq.name}</td>
                <td className="px-4 py-3 text-gray-500">{inq.company ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{inq.email}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{inq.preferred_placement ? inq.preferred_placement.replace(/_/g, " ") : "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={inq.status} /></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(inq.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {NEXT_STATUS[inq.status].map(({ label, status }) => (
                      <button key={status} onClick={() => update.mutate({ id: inq.id, status })} disabled={update.isPending} className="text-xs bg-[#103820] text-white px-2 py-1 rounded hover:bg-[#1a5230] disabled:opacity-50">{label}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && inquiries?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No inquiries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
