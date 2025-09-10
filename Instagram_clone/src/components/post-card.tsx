import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  EllipsisVertical,
  Edit3,
  Trash2,
  Bookmark,
} from "lucide-react";
import { deletePost } from "@/services/services";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { removePost } from "@/features/posts/postSlice";
interface Author {
  username: string;
  avatar?: string;
}

interface PostCardProps {
  id: string;
  author: Author;
  content: string;
  image?: string;
  video?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  currentUserEmail?: string;
}
// start of the component
export default function PostCard({
  id,
  author,
  content,
  image,
  video,
  likes,
  comments,
  shares,
  timestamp,
  isLiked = false,
  currentUserEmail,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [videoError, setVideoError] = useState(false);
  const [error, setError] = useState<unknown>();
  const handleVideoError = () => setVideoError(true);
  const handleVideoLoad = () => setVideoError(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };
const dispatch =useDispatch()
  const isOwner = (() => {
    if (!currentUserEmail || !author?.username) {
      return false;
    }
    return (
      currentUserEmail.trim().toLowerCase() ===
      author.username.trim().toLowerCase()
    );
  })();
  const handleDelete = async (id: any) => {
    console.log("Deleting post with ID:", id);
    try {
      const res = await deletePost(id);
      console.log("Delete response:", res);
      
      if (res.status === 204) {
        console.log("Dispatching removePost for ID:", id);
        dispatch(removePost(id));
        toast.success("Content deleted successfully");
        
        const modal = document.getElementById(`my_modal_${id}`) as HTMLDialogElement;
        modal?.close();
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err);
      toast.error("Failed to delete post");
    }
  };

  return (
    <>
      <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600 max-w-2xl mx-auto mb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={author.avatar || ""}
                alt={`${author.username}'s avatar`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // If image fails, show first letter of name
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-medium">
                    ${author.username.charAt(0).toUpperCase()}
                  </div>
                `;
                }}
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {author.username}
                </span>
                {author && author.username && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                <span>@{author.username}</span>
                <span>•</span>
                <span>{new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <details className="dropdown dropdown-end">
            <summary className="btn bg-white shadow-none border-0 btn-circle">
              <EllipsisVertical className="h-5 " />
            </summary>
            <ul className="menu dropdown-content bg-white dark:bg-gray-800hover: text-zinc-950 dark:text-gray-200 rounded-box w-32 shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              {isOwner && (
                <>
                  <li>
                    <a
                      onClick={() => {
                        const modal = document.getElementById(
                          `my_modal_${id}`
                        ) as HTMLDialogElement;
                        modal?.showModal();
                      }}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 flex justify-between"
                    >
                      Delete <Trash2 className="h-4" />
                    </a>
                  </li>
                  <li>
                    <a className="hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between">
                      Edit <Edit3 className="h-4" />
                    </a>
                  </li>
                </>
              )}

              <li>
                <a className="hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between">
                  Save <Bookmark className="h-4" />
                </a>
              </li>
            </ul>
          </details>
        </div>
        {/* delete modal is here the dialogue box  */}
        <dialog
          id={`my_modal_${id}`}
          className="modal text-zinc-950 dark:text-gray-200"
        >
          <div className="modal-box bg-white dark:bg-gray-800">
            <h3 className="font-bold text-lg">Warning!</h3>
            <p className="py-4">Are you sure you want to delete this post?</p>
            <div className="modal-action">
              <button
                type="button" // Add this to prevent form submission
                onClick={() => handleDelete(id)}
                className="btn btn-error text-white"
              >
                Confirm Delete
              </button>
              <form method="dialog">
                <button type="submit" className="btn ml-2">Close</button>
              </form>
            </div>
          </div>
        </dialog>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Media */}
        <div className="mb-4">
          {image && (
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
              <img
                src={image}
                alt="Post media"
                className="w-full max-h-[520px] object-cover"
                onError={() => console.warn("Image failed to load", image)}
              />
            </div>
          )}

          {video && !videoError && (
            <div className="rounded-lg overflow-hidden bg-black">
              <video
                src={video}
                controls
                className="w-full h-auto max-h-[520px]"
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                preload="metadata"
              />
            </div>
          )}

          {video && videoError && (
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm flex items-center justify-between">
              <div className="text-gray-700 dark:text-gray-300">
                Video could not be loaded.
              </div>
              <a
                href={video}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline ml-3"
              >
                Open video
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button
            onClick={toggleLike}
            className={`h-8 px-2 gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md flex items-center ${
              liked ? "text-red-500" : ""
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>

          <button className="h-8 px-2 gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md flex items-center">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">{comments}</span>
          </button>

          <button className="h-8 px-2 gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-md flex items-center">
            <Repeat2 className="w-4 h-4" />
            <span className="text-xs font-medium">{shares}</span>
          </button>

          <button className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-md flex items-center">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </article>
    </>
  );
}
