import { useEffect, useState } from "react";
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
import {
  createLikedPosts,
  deletePost,
  getCommentsForPost,
  getLikedPosts,
  updatePost,
} from "@/services/services";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  removePost,
  updatePost as updatePostAction,
} from "@/features/posts/postSlice";
import CreatePostModal from "./create-post-modal";
import { useNavigate } from "react-router-dom";

interface Author {
  username: string;
  avatar?: string;
  profile_picture?: string;
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
  author_username: string;
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
  author_username,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [videoError, setVideoError] = useState(false);
  const [error, setError] = useState<unknown>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(comments);
  const handleVideoError = () => setVideoError(true);
  const handleVideoLoad = () => setVideoError(false);

  // Helper function to get profile picture URL
  const getProfilePictureUrl = (author: Author) => {
    // Priority: profile_picture > avatar > fallback to placeholder
    if (author.profile_picture) {
      // If it's a relative URL, make it absolute
      if (
        author.profile_picture.startsWith("/media/") ||
        author.profile_picture.startsWith("media/")
      ) {
        return `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
        }${author.profile_picture.startsWith("/") ? "" : "/"}${
          author.profile_picture
        }`;
      }
      return author.profile_picture;
    }

    if (author.avatar && author.avatar !== "/generic-person-avatar.png") {
      return author.avatar;
    }

    return null; // Will show fallback
  };

  // Get user initials for fallback
  const getUserInitials = (author_username: string) => {
    if (author_username && typeof author_username === "string") {
      return author_username.charAt(0).toUpperCase();
    }
    return "?"; // Safe fallback for undefined/null
  };

  const profilePictureUrl = getProfilePictureUrl(author);

  // FETCHING THE LIKES OF POST
  useEffect(() => {
    // fetching the length of comments
    const fetchComments = async () => {
      try {
        const res = await getCommentsForPost(id);
        if (res.data && Array.isArray(res.data)) {  
          setCommentCount(res.data.length);
        }
      } catch (err) {
        console.error("failed to fetch comments:", err);
      }
    };
    fetchComments();

    // fetching the likes from the api
    const fetchLikes = async () => {
      try {
        const res = await getLikedPosts(id);
        if (res.data && Array.isArray(res.data)) {
          setLikeCount(res.data.length);
        }
      } catch (err) {
        console.error("failed to fetch likes:", err);
      }
    };
    fetchLikes();
  }, [id]);

  // like toggel handler
  const toggleLike = async (id: any) => {
    try {
      const wasLiked = liked;
      setLiked(!liked);
      setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

      // Make API call to toggle like
      await createLikedPosts(id);

      // Refresh likes count
      const res = await getLikedPosts(id);
      if (res.data && Array.isArray(res.data)) {
        setLikeCount(res.data.length);
      }
    } catch (err) {
      // Revert on error
      setLiked(liked);
      setLikeCount(likeCount);
      console.error("Toggle like error:", err);
      toast.error("Failed to update like");
    }
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // author check function (fyi this is immediate call function read the w3school for further information )
  const isOwner = (() => {
    const me =
      (currentUserEmail ||
        localStorage.getItem("user_email") ||
        localStorage.getItem("user_username") ||
        ""
      ).trim().toLowerCase();
    const authorEmail = (author?.username || "").trim().toLowerCase(); // author is email from API
    if (!me || !authorEmail) return false;
    return me === authorEmail;
  })();

  // DELETE  FUNCTION HANDLER
  const handleDelete = async (id: any) => {
    console.log("Deleting post with ID:", id);
    try {
      const res = await deletePost(id);
      console.log("Delete response:", res);

      if (res.status === 204) {
        console.log("Dispatching removePost for ID:", id);
        dispatch(removePost(id));
        toast.success("Content deleted successfully");

        const modal = document.getElementById(
          `my_modal_${id}`
        ) as HTMLDialogElement;
        modal?.close();
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err);
      toast.error("Failed to delete post");
    }
  };

  const handleUpdatePost = async (
    newContent: string,
    newImage?: File,
    newVideo?: File
  ) => {
    try {
      const formData = new FormData();
      formData.append("content", newContent);
      if (newImage) {
        formData.append("image", newImage);
      }
      if (newVideo) {
        formData.append("video", newVideo);
      }

      const res = await updatePost(id, formData);
      if (res.status === 200) {
        toast.success("Post updated successfully");

        // Update the Redux store with the new data
        dispatch(
          updatePostAction({
            id,
            content: newContent,
            image: newImage ? URL.createObjectURL(newImage) : image,
            video: newVideo ? URL.createObjectURL(newVideo) : video,
            // Keep other existing properties
          })
        );

        // Close the modal
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update post");
    }
  };

  return (
    <>
      <article className=" bg-neutral-900  text-white rounded-xl p-2 max-w-2xl mx-auto mb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={`${author.username}'s profile picture`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, hide it and show fallback
                    e.currentTarget.style.display = "none";
                    const fallbackDiv = e.currentTarget
                      .nextElementSibling as HTMLDivElement;
                    if (fallbackDiv) {
                      fallbackDiv.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              {/* Fallback avatar with initials */}
              <div
                className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm ${
                  profilePictureUrl ? "hidden" : "flex"
                }`}
                style={{ display: profilePictureUrl ? "none" : "flex" }}
              >
                {getUserInitials(author_username)}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{author_username}</span>
                {author && author_username && (
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
              <div className="flex items-center gap-2 text-xs">
                <span>@{author.username}</span>
                <span>•</span>
                <span>{new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <details className="dropdown dropdown-end">
            <summary className="btn bg-neutral-900 text-white shadow-none border-0 btn-circle">
              <EllipsisVertical className="h-5 " />
            </summary>
            <ul className="menu dropdown-content bg-white dark:bg-gray-800hover: text-zinc-950 dark:text-gray-200 rounded-box w-32 shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              {isOwner && (
                <>
                  <li>
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        // Close the dropdown
                        const dropdown = e.currentTarget.closest(
                          "details"
                        ) as HTMLDetailsElement;
                        if (dropdown) dropdown.open = false;

                        // Open the modal
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
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        // Close the dropdown
                        const dropdown = e.currentTarget.closest(
                          "details"
                        ) as HTMLDetailsElement;
                        if (dropdown) dropdown.open = false;

                        // Open edit modal
                        setIsEditModalOpen(true);
                      }}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between"
                    >
                      Edit <Edit3 className="h-4" />
                    </a>
                  </li>
                </>
              )}

              <li>
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    // Close the dropdown
                    const dropdown = e.currentTarget.closest(
                      "details"
                    ) as HTMLDetailsElement;
                    if (dropdown) dropdown.open = false;

                    // Add your save logic here
                    console.log("Save clicked");
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between"
                >
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
                <button type="submit" className="btn ml-2">
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>

        {/* Content */}
        <div className="mb-4">
          <p className=" text-sm leading-relaxed whitespace-pre-wrap">
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
            onClick={() => toggleLike(id)}
            className={`h-8  gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500   rounded-md flex items-center ${
              liked ? "text-red-500" : ""
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span className="text-xs font-medium">{likeCount}</span>
          </button>

          <button
            onClick={() => navigate(`/post/${id}`)}
            className="h-8 px-2 gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500  rounded-md flex items-center"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">{commentCount}</span>
          </button>

          <button className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-purple-500  rounded-md flex items-center">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </article>

      {/* Add the edit modal */}
      <CreatePostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onPost={handleUpdatePost}
        mode="update"
        initialData={{
          content,
          image,
          video,
        }}
      />
    </>
  );
}
