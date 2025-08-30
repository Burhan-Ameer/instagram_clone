

import { useState } from "react"

interface PostCardProps {
  id: string
  author: {
    name: string
    username: string
    avatar: string
  }
  content: string
  image?: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  isLiked?: boolean
}

export default function PostCard({
  id,
  author,
  content,
  image,
  timestamp,
  likes,
  comments,
  shares,
  isLiked = false,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 md:p-4 mb-3 md:mb-4 mx-3 md:mx-0 hover:shadow-sm transition-shadow">
      {/* Author Info */}
      <div className="flex items-center gap-2 md:gap-3 mb-3">
        <img
          src={author.avatar || "/placeholder.svg"}
          alt={author.name}
          className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            <h3 className="font-semibold text-card-foreground text-sm md:text-base truncate">{author.name}</h3>
            <span className="text-muted-foreground text-xs md:text-sm">@{author.username}</span>
            <span className="text-muted-foreground text-xs md:text-sm hidden sm:inline">·</span>
            <span className="text-muted-foreground text-xs md:text-sm">{timestamp}</span>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-card-foreground leading-relaxed text-sm md:text-base">{content}</p>
        {image && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img src={image || "/placeholder.svg"} alt="Post image" className="w-full h-auto object-cover" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full hover:bg-muted transition-colors min-h-[44px] ${
            liked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-xs md:text-sm">{likeCount}</span>
        </button>

        <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-xs md:text-sm">{comments}</span>
        </button>

        <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
          <span className="text-xs md:text-sm">{shares}</span>
        </button>

        <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px]">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
