import { apiConfig } from "./apiConfig";

export const getMatchComments = async (
  matchId: number,
  page = 1,
  limit = 10
): Promise<any> => {
  try {
    const res = await apiConfig.get(
      `/comments/${matchId}?page=${page}&limit=${limit}`
    );
    return res?.data || [];
  } catch (e: any) {
    return {
      success: false,
      message: "Failed to fetch match comments",
      error: e.response?.data?.message || e.message,
    };
  }
};

export const createComment = async (
  matchId: number,
  userId: number,
  commentText: string
): Promise<any> => {
  try {
    const res = await apiConfig.post(`/comments/${matchId}/key`, {
      userId: userId,
      text: commentText,
    });
    return res.data;
  } catch (e: any) {
    return {
      success: false,
      message: "Failed to create comment",
      error: e.response?.data?.message || e.message,
    };
  }
};

export const updateComment = async (
  commentId: number,
  commentText: string
): Promise<any> => {
  try {
    const res = await apiConfig.put(`/comments/${commentId}/key`, {
      comment_text: commentText,
    });
    return res.data;
  } catch (e: any) {
    return {
      success: false,
      message: "Failed to update comment",
      error: e.response?.data?.message || e.message,
    };
  }
};

export const deleteComment = async (
  commentId: number
): Promise<any> => {
  try {
    const res = await apiConfig.delete(`/comments/${commentId}/key`);
    return res.data;
  } catch (e: any) {
    return {
      success: false,
      message: "Failed to delete comment",
      error: e.response?.data?.message || e.message,
    };
  }
};

export const getCommentReplies = async (
  commentId: number,
  page = 1,
  limit = 5
): Promise<any> => {
  try {
    const res = await apiConfig.get(
      `/comments/${commentId}/replies/?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (e: any) {
    return {
      success: false,
      message: "Failed to fetch replies",
      error: e.response?.data?.message || e.message,
    };
  }
};

export const createReply = async (
  matchId: number,
  commentText: string,
  userId: number,
  parentCommentId: number
): Promise<any> => {
  try {
    const res = await apiConfig.post(`/comments/${parentCommentId}/replies/key`, {
      match_id: matchId,
      userId: userId,
      text: commentText,
    });
    return res.data;
  } catch (e: any) {
    return {
      success: false,
      message: "Failed to create reply",
      error: e.response?.data?.message || e.message,
    };
  }
};

export const addCommentReaction = async (
  commentId: number,
  userId: number,
  reactionType: "like" | "dislike"
): Promise<any> => {
  try {
    const response = await apiConfig.post(
      `/comments/${commentId}/reactions/key`,
      { user_id: userId, reaction_type: reactionType }
    );

    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to add comment reaction",
      error: error.response?.data?.message || error.message,
    };
  }
};
