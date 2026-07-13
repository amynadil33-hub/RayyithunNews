import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { getContactMessages, updateMessageStatus } from "../../services/contact.ts";
import type { ContactMessage, MessageStatus } from "../../lib/database.types.ts";

const STATUS_STYLES: Record<MessageStatus, string> = {
  unread: "bg-yellow-100 text-yellow-700",
  read: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

function StatusBadge({ status }: { status: MessageStatus }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>{status}</span>;
}

export default function ContactMessages() {
  const qc = useQueryClient();
  const { data: messages, isLoading } = useQuery({ queryKey: ["contact-messages"], queryFn: getContactMessages });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MessageStatus }) => updateMessageStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contact-messages"] }); toast.success("Status updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Contact Messages</h1>
        <span className="text-sm text-gray-500">{messages?.length ?? 0} messages</span>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>{["Name","Email","Phone","Message","Status","Date","Actions"].map(h => <th key={h} className="text-left px-4 py-3 font-semibold text-[#103820]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
            )) : messages?.map((m: ContactMessage) => (
              <tr key={m.id} className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]">
                <td className="px-4 py-3 font-medium whitespace-nowrap">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.email}</td>
                <td className="px-4 py-3 text-gray-500">{m.phone ?? "—"}</td>
                <td className="px-4 py-3 max-w-xs truncate text-gray-600" title={m.message}>{m.message}</td>
                <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(m.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {m.status !== "read" && (
                      <button onClick={() => update.mutate({ id: m.id, status: "read" })} disabled={update.isPending} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded hover:bg-green-100 disabled:opacity-50">Mark Read</button>
                    )}
                    {m.status !== "archived" && (
                      <button onClick={() => update.mutate({ id: m.id, status: "archived" })} disabled={update.isPending} className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50">Archive</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && messages?.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No messages yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
