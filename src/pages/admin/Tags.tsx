import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getPortals } from "../../services/settings.ts";
import {
  createTag,
  deleteTag,
  getTags,
  tagSlug,
  updateTag,
} from "../../services/tags.ts";
import type { Tag } from "../../lib/database.types.ts";

export default function AdminTags() {
  const queryClient = useQueryClient();
  const [portalId, setPortalId] = useState("");
  const [name, setName] = useState("");
  const { data: portals } = useQuery({
    queryKey: ["portals"],
    queryFn: getPortals,
  });

  useEffect(() => {
    if (!portalId && portals?.[0]) setPortalId(portals[0].id);
  }, [portalId, portals]);

  const { data: tags, isLoading } = useQuery({
    queryKey: ["admin-tags", portalId],
    queryFn: () => getTags(portalId),
    enabled: Boolean(portalId),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-tags", portalId] });
  const createMutation = useMutation({
    mutationFn: () =>
      createTag({
        portal_id: portalId,
        name: name.trim(),
        slug: tagSlug(name),
      }),
    onSuccess: () => {
      setName("");
      void refresh();
      toast.success("Tag created");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, nextName }: { id: string; nextName: string }) =>
      updateTag(id, { name: nextName.trim(), slug: tagSlug(nextName) }),
    onSuccess: () => {
      void refresh();
      toast.success("Tag updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      void refresh();
      toast.success("Tag deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function editTag(tag: Tag) {
    const nextName = window.prompt("Tag name", tag.name)?.trim();
    if (nextName && nextName !== tag.name)
      updateMutation.mutate({ id: tag.id, nextName });
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-6 text-[#142820]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#103820]">Tags</h1>
        <select
          value={portalId}
          onChange={(event) => setPortalId(event.target.value)}
          className="border border-[#E5E7E2] bg-white px-3 py-2 text-sm"
        >
          {portals?.map((portal) => (
            <option key={portal.id} value={portal.id}>
              {portal.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6 flex max-w-xl gap-2 rounded-sm border border-[#E5E7E2] bg-white p-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New tag name"
          className="min-w-0 flex-1 border border-[#E5E7E2] px-3 py-2 text-sm"
        />
        <button
          onClick={() => createMutation.mutate()}
          disabled={!portalId || !name.trim() || createMutation.isPending}
          className="bg-[#103820] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Add Tag
        </button>
      </div>
      <div className="overflow-hidden rounded-sm border border-[#E5E7E2] bg-white">
        {isLoading ? (
          <p className="p-5 text-sm text-[#6B756E]">Loading tags…</p>
        ) : tags?.length ? (
          <ul className="divide-y divide-[#E5E7E2]">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{tag.name}</p>
                  <p className="text-xs text-[#6B756E]">{tag.slug}</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => editTag(tag)}
                    className="text-[#103820] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete “${tag.name}”?`))
                        deleteMutation.mutate(tag.id);
                    }}
                    className="text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-8 text-center text-sm text-[#6B756E]">
            No tags for this portal yet.
          </p>
        )}
      </div>
    </div>
  );
}
