import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import { getAdminUsers, updateUserRole } from "../../services/settings.ts";
import type { Profile, UserRole } from "../../lib/database.types.ts";

const ROLES: UserRole[] = ["super_admin", "admin", "editor", "author"];

const ROLE_STYLES: Record<UserRole, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  editor: "bg-emerald-100 text-emerald-700",
  author: "bg-gray-100 text-gray-600",
};

export default function Users() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: getAdminUsers });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateUserRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Admin Users</h1>
        <span className="text-sm text-gray-500">{users?.length ?? 0} users</span>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>
              {["Name", "Email", "Role", "Status", "Joined", "Change Role"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-[#103820]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                ))
              : users?.map((u: Profile) => (
                  <tr key={u.id} className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]">
                    <td className="px-4 py-3 font-medium">{u.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={e => changeRole.mutate({ id: u.id, role: e.target.value as UserRole })}
                        disabled={changeRole.isPending}
                        className="border border-[#E5E7E2] rounded px-2 py-1 text-xs bg-white cursor-pointer disabled:opacity-50"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
            {!isLoading && users?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
