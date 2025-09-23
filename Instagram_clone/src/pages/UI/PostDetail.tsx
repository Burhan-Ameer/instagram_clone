import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, ArrowLeft, Send, MoreHorizontal, Edit3, Trash2, Share, Bookmark } from "lucide-react";
import { 
  getPostById, 
  getCommentsForPost, 
  createComment,
  createLikedPosts,
  getLikedPosts,
  // updateComment,
  // deleteComment,
} from "@/services/services";
import { toast } from "react-toastify";

interface Author {
  username: string;
  avatar?: string;
}

interface Post {
  author_username: string;
  profile_pic: string;
  id: string;
  author: Author;
  content: string;
  image?: string;
  video?: string;
  created_at: string;
}

interface Comment {
  id: string;
  user: string;
  message: string;
  created_at: string;
}

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<string>("");

  useEffect(() => {
    const username = localStorage.getItem("user_username") || localStorage.getItem("user_email") || "";
    setCurrentUser(username);

    if (postId) {
      fetchPostData();
      fetchComments();
      fetchLikes();
    }
  }, [postId]);

  const fetchPostData = async () => {
    try {
      const res = await getPostById(postId!);
      setPost(res.data);
    } catch (error) {
      console.error("Failed to fetch post:", error);
      toast.error("Failed to load post");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await getCommentsForPost(postId!);
      setComments(res.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const fetchLikes = async () => {
    try {
      const res = await getLikedPosts(postId!);
      if (res.data && Array.isArray(res.data)) {
        setLikeCount(res.data.length);
        setLiked(res.data.some((like: any) => like.user === currentUser));
      }
    } catch (error) {
      console.error("Failed to fetch likes:", error);
    }
  };

  const handleToggleLike = async () => {
    const wasLiked = liked;
    setLiked(!liked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      await createLikedPosts(postId!);
      await fetchLikes();
    } catch (error) {
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      toast.error("Failed to update like");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postId) return;

    setSubmitting(true);
    try {
      await createComment({ message: newComment, post: postId });
      setNewComment("");
      await fetchComments();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.message);
    setIsEditModalOpen(true);
  };

  const handleUpdateComment = async () => {
    if (!editCommentText.trim() || !editingCommentId) return;
    try {
      // await updateComment(editingCommentId, { message: editCommentText });
      await fetchComments();
      toast.success("Comment updated successfully");
      setIsEditModalOpen(false);
      setEditingCommentId(null);
      setEditCommentText("");
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setDeletingCommentId(commentId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!deletingCommentId) return;
    try {
      // await deleteComment(deletingCommentId);
      await fetchComments();
      toast.success("Comment deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingCommentId(null);
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-neutral-300">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-xl mb-6 text-white">Post not found</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-sky-600 text-white px-8 py-3 rounded-full font-bold hover:bg-sky-500 transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-neutral-900/80 border-b border-neutral-800">
          <div className="flex items-center gap-4 p-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Post</h1>
          </div>
        </div>

        {/* Post */}
        <div className="border-b border-neutral-800 p-4">
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700">
              {post.profile_pic ? (
                <img
                  src={post.profile_pic}
                  alt={post.author.username}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-sky-600 text-white font-medium text-lg">
                  {post.author_username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{post.author_username}</span>
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-neutral-400 text-sm">
                @{post.author.username} • {formatTimeAgo(post.created_at)}
              </div>
            </div>
            <button className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-lg leading-relaxed whitespace-pre-wrap text-white">
              {post.content}
            </p>
          </div>

          {/* Post Media */}
          {post.image && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={post.image} 
                alt="Post" 
                className="w-full max-h-[500px] object-cover" 
              />
            </div>
          )}
          {post.video && (
            <div className="mb-4 rounded-lg overflow-hidden bg-black">
              <video 
                src={post.video} 
                controls 
                className="w-full h-auto max-h-[500px]" 
                preload="metadata"
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-6 pt-4 border-t border-neutral-800">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
                liked 
                  ? "text-red-500 hover:bg-red-900/20" 
                  : "text-neutral-400 hover:bg-red-900/20 hover:text-red-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>

            <div className="flex items-center gap-2 text-neutral-400">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{comments.length}</span>
            </div>

            <button className="p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-full transition-colors">
              <Share className="w-5 h-5" />
            </button>

            <button className="p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-full transition-colors ml-auto">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 text-white">
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {currentUser ? currentUser.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-neutral-800 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 border border-neutral-700"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-neutral-400">
                    {newComment.length}/280
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="bg-sky-600 text-white px-4 py-2 rounded-full font-medium hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-neutral-800 pb-4 last:border-b-0">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">
                        {comment.user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">{comment.user}</span>
                        <span className="text-neutral-400 text-xs">
                          {formatTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-neutral-200 text-sm leading-relaxed">
                        {comment.message}
                      </p>
                    </div>
                    
                    {comment.user === currentUser && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditComment(comment)} 
                          className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)} 
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Comment Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4 text-white">Edit Comment</h3>
              <textarea
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                className="w-full bg-neutral-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 border border-neutral-600"
                rows={4}
                placeholder="Edit your comment..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCommentId(null);
                    setEditCommentText("");
                  }}
                  className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateComment}
                  className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Comment Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-lg max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Delete Comment</h3>
                <p className="text-neutral-300 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeletingCommentId(null);
                    }}
                    className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteComment}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
