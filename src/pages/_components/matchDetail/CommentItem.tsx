"use client";

import { useState, useCallback, memo } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCommentTime } from "@/lib/utils";
import { UserT } from "@/types/user.type";
import {
  addCommentReaction,
  createReply,
  getCommentReplies,
} from "@/apiConfig/comment.api";
import { EmojiPicker } from "@/components/EmojiPicker";
import { toast } from "sonner";
import { CommentT } from "@/types/comment.type";
import UserAvatar from "@/components/shared/UserAvatar";

const REPLIES_PAGE_SIZE = 1;
const MAX_COMMENT_LENGTH = 1000;

interface CommentItemProps {
  comment: CommentT;
  matchId: number;
  /** The user ID currently selected at the top-level (shared across comments & replies) */
  selectedUserId: number | null;
  /** Full user list passed down from CommentsSection */
  users: UserT[];
  onReplySuccess?: () => void;
  depth?: number;
}

interface ReactionState {
  likes: number;
  dislikes: number;
  hasLiked: boolean;
  hasDisliked: boolean;
}

const ReplySkeletons = memo(() => (
  <div className="space-y-4">
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="flex gap-3 py-3">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    ))}
  </div>
));
ReplySkeletons.displayName = "ReplySkeletons";

function transformReply(reply: any, parentId: number): CommentT {
  return {
    id: reply.id,
    match_id: reply.match_id,
    user_id: reply.user_id,
    user: reply.user,
    text: reply.text,
    timestamp: reply.timestamp,
    likes: reply.likes || 0,
    dis_likes: reply.dis_likes || 0,
    reply_count: reply.reply_count || 0,
    is_replay: true,
    parent_id: parentId,
    has_user_liked: false,
  };
}

function extractReplies(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

const CommentItemComponent = ({
  comment,
  matchId,
  selectedUserId,
  users,
  onReplySuccess,
  depth = 0,
}: CommentItemProps) => {
  const [reaction, setReaction] = useState<ReactionState>({
    likes: comment.likes || 0,
    dislikes: comment.dis_likes || 0,
    hasLiked: false,
    hasDisliked: false,
  });

  const [replies, setReplies] = useState<CommentT[]>([]);
  const [replyCount, setReplyCount] = useState(comment.reply_count || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [repliesPage, setRepliesPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Each reply form can override the selected user if desired,
  // but defaults to the parent selectedUserId.
  const [replyUserId, setReplyUserId] = useState<number | null>(null);
  const effectiveReplyUserId = replyUserId ?? selectedUserId;

  const handleReaction = useCallback(
    async (type: "like" | "dislike") => {
      if (!selectedUserId) return;

      const isLike = type === "like";
      setReaction((prev) => ({
        likes: isLike
          ? prev.hasLiked
            ? Math.max(0, prev.likes - 1)
            : prev.likes + 1
          : prev.hasLiked
          ? Math.max(0, prev.likes - 1)
          : prev.likes,
        dislikes: !isLike
          ? prev.hasDisliked
            ? Math.max(0, prev.dislikes - 1)
            : prev.dislikes + 1
          : prev.hasDisliked
          ? Math.max(0, prev.dislikes - 1)
          : prev.dislikes,
        hasLiked: isLike ? !prev.hasLiked : false,
        hasDisliked: !isLike ? !prev.hasDisliked : false,
      }));

      try {
        const res = await addCommentReaction(comment.id, selectedUserId, type);
        if (res.success && res.data) {
          setReaction((prev) => ({
            ...prev,
            [isLike ? "likes" : "dislikes"]: res.data.reaction_count,
          }));
        }
      } catch {
        // revert optimistic update
        setReaction((prev) => ({
          likes: isLike
            ? prev.hasLiked
              ? prev.likes - 1
              : prev.likes + 1
            : prev.likes,
          dislikes: !isLike
            ? prev.hasDisliked
              ? prev.dislikes - 1
              : prev.dislikes + 1
            : prev.dislikes,
          hasLiked: isLike ? !prev.hasLiked : prev.hasLiked,
          hasDisliked: !isLike ? !prev.hasDisliked : prev.hasDisliked,
        }));
      }
    },
    [selectedUserId, comment.id]
  );

  const loadReplies = useCallback(async () => {
    if (loadingReplies) return;
    setLoadingReplies(true);
    try {
      const res = await getCommentReplies(comment.id, 1, REPLIES_PAGE_SIZE);
      if (res.success && res.data) {
        const raw = extractReplies(res.data);
        setReplies(raw.map((r) => transformReply(r, comment.id)));
        setRepliesPage(1);
        setHasMoreReplies(raw.length === REPLIES_PAGE_SIZE);
      }
    } catch (err) {
      console.error("Error loading replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.id, loadingReplies]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    const nextPage = repliesPage + 1;
    setLoadingMore(true);
    try {
      const res = await getCommentReplies(
        comment.id,
        nextPage,
        REPLIES_PAGE_SIZE
      );
      if (res.success && res.data) {
        const raw = extractReplies(res.data);
        setReplies((prev) => [
          ...prev,
          ...raw.map((r) => transformReply(r, comment.id)),
        ]);
        setRepliesPage(nextPage);
        setHasMoreReplies(raw.length === REPLIES_PAGE_SIZE);
      }
    } catch (err) {
      console.error("Error loading more replies:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [comment.id, repliesPage, loadingMore]);

  const handleToggleReplies = useCallback(async () => {
    if (!showReplies && replyCount > 0 && replies.length === 0) {
      await loadReplies();
    }
    setShowReplies((prev) => !prev);
  }, [showReplies, replyCount, replies.length, loadReplies]);

  const handleReplySubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!effectiveReplyUserId) {
        toast.error("Please select a user first");
        return;
      }
      if (!replyContent.trim()) return;

      setIsSubmitting(true);
      try {
        const res = await createReply(
          Number(matchId),
          replyContent,
          effectiveReplyUserId,
          comment.id
        );

        if (res.success && res.data) {
          const newReply: CommentT = {
            id: res.data.id,
            match_id: res.data.match_id.toString(),
            user_id: res.data.user_id.toString(),
            user: res.data.user,
            text: res.data.text,
            timestamp: res.data.created_at,
            likes: 0,
            dis_likes: 0,
            reply_count: 0,
            is_replay: true,
            parent_id: comment.id,
            has_user_liked: false,
          };

          setReplies((prev) => [newReply, ...prev]);
          setReplyCount((prev) => prev + 1);
          setReplyContent("");
          setShowReplyForm(false);
          setReplyUserId(null);
          if (!showReplies) setShowReplies(true);
          onReplySuccess?.();
        }
      } catch (err) {
        console.error("Error submitting reply:", err);
        toast.error("Failed to post reply");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      effectiveReplyUserId,
      replyContent,
      matchId,
      comment.id,
      showReplies,
      onReplySuccess,
    ]
  );

  const isDeep = depth > 0;

  return (
    <div
      className={cn(
        "flex gap-3 py-4 transition-all duration-200",
        isDeep && "rounded-lg"
      )}
    >
      <UserAvatar user={comment.user as UserT} size={"sm"} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="font-semibold text-sm text-foreground">
            {comment.user?.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatCommentTime(comment.timestamp)}
          </span>
        </div>

        {/* Body */}
        <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed mb-2">
          {comment.text}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => handleReaction("like")}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-all duration-200",
              reaction.hasLiked
                ? "text-green-600"
                : "text-muted-foreground hover:text-green-600"
            )}
            aria-label="Like comment"
          >
            <ThumbsUp
              className={cn("w-3.5 h-3.5", reaction.hasLiked && "fill-current")}
            />
            <span>{reaction.likes}</span>
          </button>

          <button
            onClick={() => handleReaction("dislike")}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium transition-all duration-200",
              reaction.hasDisliked
                ? "text-red-600"
                : "text-muted-foreground hover:text-red-600"
            )}
            aria-label="Dislike comment"
          >
            <ThumbsDown
              className={cn(
                "w-3.5 h-3.5",
                reaction.hasDisliked && "fill-current"
              )}
            />
            <span>{reaction.dislikes}</span>
          </button>

          <button
            onClick={() => setShowReplyForm((p) => !p)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {replyCount > 0 && (
            <button
              onClick={handleToggleReplies}
              className="flex items-center cursor-pointer gap-1.5 text-xs font-medium text-gray-500 transition-colors"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>
                    Hide {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>
                    Show {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <form
            onSubmit={handleReplySubmit}
            className="mt-3 pt-3 border-t border-muted/50 space-y-2"
          >
            {/* User selector for reply — pre-filled with parent selection */}
            <Select
              value={effectiveReplyUserId?.toString() ?? ""}
              onValueChange={(val) => setReplyUserId(Number(val))}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Select user for reply" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[72px] text-sm"
              maxLength={MAX_COMMENT_LENGTH}
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <EmojiPicker
                  onEmojiSelect={(emoji) =>
                    setReplyContent((prev) => prev + emoji)
                  }
                />
                <span
                  className={cn(
                    "text-xs",
                    replyContent.length > 900
                      ? "text-red-500"
                      : "text-muted-foreground"
                  )}
                >
                  {replyContent.length}/{MAX_COMMENT_LENGTH}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    isSubmitting ||
                    !replyContent.trim() ||
                    !effectiveReplyUserId
                  }
                  className="bg-primary cursor-pointer hover:bg-primary/90 h-8 text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Reply"
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                    setReplyUserId(null);
                  }}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Replies list */}
        {showReplies && (
          <div className="mt-3 pl-2 border-l-2 border-muted/30 space-y-1">
            {loadingReplies ? (
              <ReplySkeletons />
            ) : (
              <>
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    matchId={matchId}
                    selectedUserId={selectedUserId}
                    users={users}
                    onReplySuccess={onReplySuccess}
                    depth={depth + 1}
                  />
                ))}

                {hasMoreReplies && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors py-2 pl-1"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>
                          Show more replies
                          {replyCount > replies.length
                            ? ` (${replyCount - replies.length} remaining)`
                            : ""}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {replies.length === 0 && !loadingReplies && (
                  <p className="text-xs text-muted-foreground py-2 pl-1">
                    No replies yet.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const CommentItem = memo(CommentItemComponent);
