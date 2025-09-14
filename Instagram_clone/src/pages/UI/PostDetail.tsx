import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, ArrowLeft, Send } from "lucide-react";
import { 
  getPostById, 
  getCommentsForPost, 
  createComment,
  createLikedPosts,
  getLikedPosts 
} from "@/services/services";
import { toast } from "react-toastify";

interface Author {
  username: string;
  avatar?: string;
}

interface Post {
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

  useEffect(() => {
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
      navigate('/');
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
      }
    } catch (error) {
      console.error("Failed to fetch likes:", error);
    }
  };

  const handleToggleLike = async () => {
    const wasLiked = liked;
    setLiked(!liked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      await createLikedPosts(postId!);
      await fetchLikes(); // Refresh likes count
    } catch (error) {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error("Toggle like error:", error);
      toast.error("Failed to update like");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      if (!postId) {
        toast.error("Post ID is missing");
        return;
      }

      const commentData = {
        message: newComment,
        post: postId
      };

      await createComment(commentData);
      setNewComment("");
      await fetchComments(); // Refresh comments
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Post not found</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-sky-600 text-white px-6 py-2 rounded-full hover:bg-sky-500"
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
        <div className="flex items-center gap-4 p-4 border-b border-neutral-800">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>

        {/* Post */}
        <div className="border-b border-neutral-800 p-4">
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
              <img
                src={post.author.avatar || ""}
                alt={`${post.author.username}'s avatar`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-medium text-lg">
                      ${post.author.username.charAt(0).toUpperCase()}
                    </div>
                  `;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.author.username}</span>
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-neutral-400 text-sm">
                @{post.author.username} • {new Date(post.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Post Media */}
          {(post.image || post.video) && (
            <div className="mb-4">
              {post.image && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={post.image}
                    alt="Post media"
                    className="w-full max-h-[600px] object-cover"
                  />
                </div>
              )}
              {post.video && (
                <div className="rounded-lg overflow-hidden bg-black">
                  <video
                    src={post.video}
                    controls
                    className="w-full h-auto max-h-[600px]"
                    preload="metadata"
                  />
                </div>
              )}
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
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Comments ({comments.length})</h2>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white font-medium">You</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-neutral-800 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="bg-sky-600 text-white px-4 py-2 rounded-full font-medium hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <div key={comment.id} className="flex gap-3 p-3 bg-neutral-800 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {comment.user.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.user}</span>
                      <span className="text-neutral-400 text-xs">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-neutral-200 text-sm leading-relaxed">{comment.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}