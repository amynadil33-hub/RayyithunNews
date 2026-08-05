import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminAddLiveUpdate,
  adminDeleteLiveUpdate,
  getLiveUpdates,
} from "../../services/live-updates.ts";

export default function ArticleLiveUpdates({
  articleId,
}: {
  articleId: string;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { data: updates } = useQuery({
    queryKey: ["live-updates", articleId],
    queryFn: () => getLiveUpdates(articleId),
  });
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["live-updates", articleId] });
  const addMutation = useMutation({
    mutationFn: () =>
      adminAddLiveUpdate(articleId, {
        update_title: title.trim() || null,
        update_body: body.trim(),
      }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      void refresh();
      toast.success("Live update added");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteMutation = useMutation({
    mutationFn: adminDeleteLiveUpdate,
    onSuccess: () => {
      void refresh();
      toast.success("Live update deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="rounded-sm border border-red-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-red-800">Live Updates</h3>
      <div className="space-y-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Optional update title"
          className="w-full border border-[#E5E7E2] px-3 py-2 text-sm"
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder="What has changed?"
          className="w-full resize-y border border-[#E5E7E2] px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => addMutation.mutate()}
          disabled={!body.trim() || addMutation.isPending}
          className="bg-red-700 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          Add Update
        </button>
      </div>
      {updates?.length ? (
        <ol className="mt-5 space-y-3 border-l-2 border-red-200 pl-4">
          {updates.map((update) => (
            <li key={update.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {update.update_title && (
                    <p className="text-sm font-semibold">
                      {update.update_title}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-[#526159]">
                    {update.update_body}
                  </p>
                  <time className="text-[10px] text-[#6B756E]">
                    {new Date(update.created_at).toLocaleString()}
                  </time>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(update.id)}
                  className="text-xs text-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
