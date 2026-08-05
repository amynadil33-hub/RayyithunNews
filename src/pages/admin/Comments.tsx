import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  approveComment,
  adminGetComments,
  deleteComment,
  markCommentSpam,
  rejectComment,
} from "../../services/comments.ts";
import type { CommentStatus } from "../../lib/database.types.ts";
import { useState } from "react";

export default function AdminComments() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<CommentStatus | "">("pending");
  const { data: comments, isLoading } = useQuery({
    queryKey: ["admin-comments", status],
    queryFn: () => adminGetComments(status || undefined),
  });
  const mutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "approve" | "reject" | "spam" | "delete";
    }) => {
      if (action === "approve") return approveComment(id);
      if (action === "reject") return rejectComment(id);
      if (action === "spam") return markCommentSpam(id);
      return deleteComment(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success("Comment updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-6 text-[#142820]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#103820]">Comments</h1>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as CommentStatus | "")
          }
          className="border border-[#E5E7E2] bg-white px-3 py-2 text-sm"
        >
          <option value="">All comments</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="spam">Spam</option>
        </select>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-[#6B756E]">Loading comments…</p>
        ) : comments?.length ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-sm border border-[#E5E7E2] bg-white p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>{comment.name}</strong>
                  <span className="ml-2 text-xs text-[#6B756E]">
                    {comment.email}
                  </span>
                </div>
                <span className="rounded-full bg-[#F0F4F0] px-2 py-1 text-xs capitalize">
                  {comment.status}
                </span>
              </div>
              {comment.article && (
                <p className="mb-2 text-xs text-[#6B756E]">
                  On: {comment.article.title}
                </p>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {comment.comment}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() =>
                    mutation.mutate({ id: comment.id, action: "approve" })
                  }
                  className="bg-[#103820] px-3 py-1.5 text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    mutation.mutate({ id: comment.id, action: "reject" })
                  }
                  className="border border-orange-300 px-3 py-1.5 text-orange-800"
                >
                  Reject
                </button>
                <button
                  onClick={() =>
                    mutation.mutate({ id: comment.id, action: "spam" })
                  }
                  className="border border-gray-300 px-3 py-1.5"
                >
                  Spam
                </button>
                <button
                  onClick={() =>
                    mutation.mutate({ id: comment.id, action: "delete" })
                  }
                  className="ml-auto text-red-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-sm border border-[#E5E7E2] bg-white p-8 text-center text-sm text-[#6B756E]">
            No comments in this queue.
          </p>
        )}
      </div>
    </div>
  );
}
