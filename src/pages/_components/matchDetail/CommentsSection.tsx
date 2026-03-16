import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Loader2 } from "lucide-react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createComment, getMatchComments } from "@/apiConfig/comment.api";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { CommentT } from "@/types/comment.type";
import { CommentListSkeleton } from "@/components/skeletons/comment-skeleton";
import { UserT } from "@/types/user.type";

interface CommentPageT {
  comments: CommentT[];
  nextPage: number | null;
  total: number;
}

interface Props {
  matchId: number;
  match: {
    home_team: { name: string };
    away_team: { name: string };
    leagues?: { name: string };
    match_date: string;
  };
  users: UserT[];
}

const CommentsSection = ({ matchId, match, users }: Props) => {
  // selectedUserId is lifted here so it can be shared with CommentItem for replies
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data: commentsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<CommentPageT>({
    queryKey: ["matchComments", matchId],
    initialPageParam: 1,
    queryFn: async ({ pageParam }: any) => {
      const response = await getMatchComments(matchId, pageParam, 10);
      if (!response.success || !response?.data?.data) {
        throw new Error(response.error || "Failed to fetch comments");
      }
      const current = response?.data?.pagination?.page ?? 1;
      const totalPages = response?.data?.pagination?.total_pages ?? 1;
      return {
        comments: response?.data?.data,
        nextPage: current < totalPages ? current + 1 : null,
        total: response?.data?.pagination?.total ?? 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  const comments = useMemo(
    () => commentsData?.pages.flatMap((p) => p.comments) ?? [],
    [commentsData]
  );

  const totalComments = commentsData?.pages?.[0]?.total ?? comments.length;

  const loadMoreComments = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedUserId) throw new Error("Please select a user");
      const response = await createComment(matchId, selectedUserId, text);
      if (!response.success) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matchComments", matchId] });
    },
  });

  const memoizedCommentItems = useMemo(
    () =>
      comments.map((comment) => (
        <div
          key={comment.id}
          className="transition-all duration-300 hover:scale-[1.01]"
        >
          <CommentItem
            comment={comment}
            matchId={matchId}
            selectedUserId={selectedUserId}
            users={users}
            onReplySuccess={() => {}}
          />
        </div>
      )),
    [comments, matchId, selectedUserId, users]
  );

  return (
    <Card className="bg-card border-border w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Discussion
          <span className="text-sm font-normal text-muted-foreground">
            ({totalComments} comments)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* CommentForm now receives user selector props */}
        <CommentForm
          onSubmit={(text) => addCommentMutation.mutate(text)}
          isSubmitting={addCommentMutation.isPending}
          users={users}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
          match={match}
        />

        <div className="space-y-4 mt-3">
          {isLoading ? (
            <CommentListSkeleton />
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No comments yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <>
              {memoizedCommentItems}

              {hasNextPage && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMoreComments}
                    disabled={isFetchingNextPage}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isFetchingNextPage && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {isFetchingNextPage
                      ? "Loading more..."
                      : "Load More Comments"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsSection;
