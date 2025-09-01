import { useState, useEffect } from "react";

interface PostCardProps {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  video?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
}

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
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    console.log("PostCard received:", { id, image, video, content: content.substring(0, 50) });
  }, [id, image, video, content]);

  const handleVideoError = () => setVideoError(true);
  const handleVideoLoad = () => setVideoError(false);

  return (
    <article className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
      <header className="flex items-center gap-3 p-4">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700"
        />
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{author.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">@{author.username}</p>
            </div>
            <time className="text-xs text-slate-400">{new Date(timestamp).toLocaleString()}</time>
          </div>
        </div>
      </header>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700">
        <p className="text-sm text-slate-800 dark:text-slate-200 mb-3">{content}</p>

        <div className="space-y-3">
          {image && (
            <img
              src={image}
              alt="Post media"
              className="w-full max-h-[520px] object-cover rounded-md border border-slate-100 dark:border-slate-700"
              onError={() => console.warn("Image failed to load", image)}
            />
          )}

          {video && !videoError && (
            <div className="w-full rounded-md overflow-hidden bg-black">
              <video
                src={video}
                controls
                className="w-full h-auto"
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                preload="metadata"
              />
            </div>
          )}

          {video && videoError && (
            <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-700 text-sm">
              <p className="text-slate-700 dark:text-slate-200 mb-2">Video could not be loaded.</p>
              <a
                href={video}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Open video in new tab
              </a>
            </div>
          )}
        </div>
      </div>

      <footer className="p-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <button
            onClick={() => {
              setLiked(!liked);
              setLikeCount((c) => (liked ? c - 1 : c + 1));
            }}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <span>{liked ? "❤️" : "🤍"}</span>
            <span>{likeCount}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <span>💬</span>
            <span>{comments}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <span>🔄</span>
            <span>{shares}</span>
          </div>
        </div>

        <div className="text-xs text-slate-400">{/* placeholder for more actions */}</div>
      </footer>
    </article>
  );
}
