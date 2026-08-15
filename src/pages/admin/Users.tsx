import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon, XIcon } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton.tsx";
import {
  createAdminUser,
  getAdminUsers,
  updateUserAvatar,
  updateUserDhivehiName,
  updateUserRole,
} from "../../services/settings.ts";
import { uploadWriterAvatar } from "../../services/media.ts";
import type { Profile, UserRole } from "../../lib/database.types.ts";
import { useAdminAuth } from "../../hooks/use-admin-auth.tsx";

const ROLES: UserRole[] = ["super_admin", "admin", "editor", "author"];

const ROLE_STYLES: Record<UserRole, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  editor: "bg-emerald-100 text-emerald-700",
  author: "bg-gray-100 text-gray-600",
};

export default function Users() {
  const qc = useQueryClient();
  const { profile } = useAdminAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    fullNameDv: "",
    email: "",
    password: "",
    role: "author" as UserRole,
  });
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeAvatar = useMutation({
    mutationFn: async ({ id, file }: { id: string; file?: File }) => {
      if (!file) return updateUserAvatar(id, null);
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        throw new Error("Choose a PNG, JPG, JPEG, or WebP image.");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Writer photos must be smaller than 5 MB.");
      }
      const asset = await uploadWriterAvatar(file);
      return updateUserAvatar(id, asset.file_url);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Writer photo updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const changeDhivehiName = useMutation({
    mutationFn: ({ id, fullNameDv }: { id: string; fullNameDv: string }) =>
      updateUserDhivehiName(id, fullNameDv),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Dhivehi writer name updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const createUser = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setCreateForm({
        fullName: "",
        fullNameDv: "",
        email: "",
        password: "",
        role: "author",
      });
      setShowCreateForm(false);
      toast.success("User created");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="p-6 bg-[#F8F8F8] min-h-screen text-[#142820]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#103820]">Admin Users</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {users?.length ?? 0} users
          </span>
          {profile?.role === "super_admin" && (
            <button
              type="button"
              onClick={() => setShowCreateForm((open) => !open)}
              className="inline-flex items-center gap-2 rounded-sm bg-[#103820] px-4 py-2 text-sm font-semibold text-white hover:bg-[#183028]"
            >
              {showCreateForm ? <XIcon size={15} /> : <PlusIcon size={15} />}
              {showCreateForm ? "Cancel" : "Create user"}
            </button>
          )}
        </div>
      </div>

      {profile?.role === "super_admin" && showCreateForm && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createUser.mutate(createForm);
          }}
          className="mb-6 rounded-lg border border-[#D8DED9] bg-white p-5 shadow-sm"
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#103820]">
              Create admin user
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              The user can sign in immediately with the temporary password.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="text-xs font-semibold text-[#526159]">
              Full name
              <input
                required
                minLength={2}
                value={createForm.fullName}
                onChange={(event) =>
                  setCreateForm({ ...createForm, fullName: event.target.value })
                }
                className="mt-1.5 w-full rounded-sm border border-[#D8DED9] px-3 py-2.5 text-sm font-normal text-[#142820] outline-none focus:border-[#103820]"
                placeholder="Writer's public name"
              />
            </label>
            <label className="text-xs font-semibold text-[#526159]">
              Dhivehi full name
              <input
                value={createForm.fullNameDv}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    fullNameDv: event.target.value,
                  })
                }
                className="mt-1.5 w-full rounded-sm border border-[#D8DED9] px-3 py-2.5 text-right text-sm font-normal text-[#142820] outline-none focus:border-[#103820] font-thaana"
                placeholder="ދިވެހި ނަން"
                dir="rtl"
              />
            </label>
            <label className="text-xs font-semibold text-[#526159]">
              Email
              <input
                required
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm({ ...createForm, email: event.target.value })
                }
                className="mt-1.5 w-full rounded-sm border border-[#D8DED9] px-3 py-2.5 text-sm font-normal text-[#142820] outline-none focus:border-[#103820]"
                placeholder="name@example.com"
              />
            </label>
            <label className="text-xs font-semibold text-[#526159]">
              Temporary password
              <input
                required
                type="password"
                minLength={8}
                value={createForm.password}
                onChange={(event) =>
                  setCreateForm({ ...createForm, password: event.target.value })
                }
                className="mt-1.5 w-full rounded-sm border border-[#D8DED9] px-3 py-2.5 text-sm font-normal text-[#142820] outline-none focus:border-[#103820]"
                placeholder="At least 8 characters"
              />
            </label>
            <label className="text-xs font-semibold text-[#526159]">
              Role
              <select
                value={createForm.role}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    role: event.target.value as UserRole,
                  })
                }
                className="mt-1.5 w-full rounded-sm border border-[#D8DED9] bg-white px-3 py-2.5 text-sm font-normal text-[#142820] outline-none focus:border-[#103820]"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={createUser.isPending}
              className="rounded-sm bg-[#103820] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#183028] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createUser.isPending ? "Creating…" : "Create user"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-[#E5E7E2] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] border-b border-[#E5E7E2]">
            <tr>
              {["Name", "Email", "Role", "Status", "Joined", "Change Role"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-semibold text-[#103820]"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              : users?.map((u: Profile) => (
                  <tr
                    key={u.id}
                    className="border-t border-[#E5E7E2] hover:bg-[#F8F8F8]"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D8E8D8] text-xs font-bold text-[#103820]">
                            {u.full_name?.charAt(0).toUpperCase() ?? "?"}
                          </span>
                        )}
                        <div>
                          <span>{u.full_name ?? "—"}</span>
                          <input
                            key={u.full_name_dv ?? ""}
                            defaultValue={u.full_name_dv ?? ""}
                            placeholder="Dhivehi name"
                            dir="rtl"
                            className="mt-1 block w-44 rounded-sm border border-[#D8DED9] px-2 py-1 text-right text-xs font-normal font-thaana"
                            onBlur={(event) => {
                              const fullNameDv =
                                event.currentTarget.value.trim();
                              if (fullNameDv !== (u.full_name_dv ?? "")) {
                                changeDhivehiName.mutate({
                                  id: u.id,
                                  fullNameDv,
                                });
                              }
                            }}
                          />
                          <div className="mt-1 flex items-center gap-2 text-[11px] font-normal">
                            <label className="cursor-pointer text-[#103820] hover:underline">
                              {u.avatar_url
                                ? "Replace photo"
                                : "Add photo (optional)"}
                              <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.webp"
                                className="sr-only"
                                disabled={changeAvatar.isPending}
                                onChange={(event) => {
                                  const file = event.currentTarget.files?.[0];
                                  if (file)
                                    changeAvatar.mutate({ id: u.id, file });
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                            {u.avatar_url && (
                              <button
                                type="button"
                                onClick={() =>
                                  changeAvatar.mutate({ id: u.id })
                                }
                                disabled={changeAvatar.isPending}
                                className="text-red-700 hover:underline disabled:opacity-50"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_STYLES[u.role]}`}
                      >
                        {u.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${u.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          changeRole.mutate({
                            id: u.id,
                            role: e.target.value as UserRole,
                          })
                        }
                        disabled={changeRole.isPending}
                        className="border border-[#E5E7E2] rounded px-2 py-1 text-xs bg-white cursor-pointer disabled:opacity-50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            {!isLoading && users?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
