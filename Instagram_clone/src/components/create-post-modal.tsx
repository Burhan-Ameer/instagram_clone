// import { API } from "@/services/services";
import React, { useState, useEffect } from "react";

// 1. UPDATE THE INTERFACE: Add the optional 'video' parameter to the onPost function.
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (content: string, image?: File, video?: File) => void;
  // Add new props for update mode
  mode?: 'create' | 'update';
  initialData?: {
    content?: string;
    image?: string;
    video?: string;
  };
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onPost,
  mode = 'create',
  initialData,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Load initial data when in update mode
  useEffect(() => {
    if (mode === 'update' && initialData) {
      setContent(initialData.content || '');
      setImagePreview(initialData.image || null);
      setVideoPreview(initialData.video || null);
    } else if (mode === 'create') {
      // Reset form for create mode
      setContent('');
      setImage(null);
      setImagePreview(null);
      setVideo(null);
      setVideoPreview(null);
    }
  }, [mode, initialData, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear any existing video to allow only one media type
      setVideo(null);
      setVideoPreview(null);

      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. ADD A HANDLER FOR VIDEO: This function handles video file selection.
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear any existing image
      setImage(null);
      setImagePreview(null);

      setVideo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (content.trim()) {
      // 4. UPDATE ONPOST CALL: Pass the image or video file to the callback.
      onPost(content, image || undefined, video || undefined);
      // Only reset if creating, not updating
      if (mode === 'create') {
        setContent("");
        setImage(null);
        setImagePreview(null);
        setVideo(null);
        setVideoPreview(null);
      }
      onClose();
    }
  };

  const removeMedia = () => {
    setImage(null);
    setImagePreview(null);
    setVideo(null);
    setVideoPreview(null);
  };

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    const icons = {
      close: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ),
      image: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      ),
      // 5. ADD VIDEO ICON: A new icon for the video upload button.
      video: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      ),
    };
    return icons[iconName as keyof typeof icons];
  };

  const MAX_CHARACTERS = 280;

  return (
    <div className="fixed inset-0 bg-neutral-950/80 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-neutral-800 text-neutral-50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? 'Create Post' : 'Edit Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-50 p-1 rounded-full hover:bg-neutral-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {getIcon("close")}
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/diverse-user-avatars.png"
              alt="Your avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-neutral-700"
            />
            <div>
              <p className="font-semibold text-white">Your Name</p>
              <p className="text-sm text-neutral-400">@yourusername</p>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full min-h-[100px] max-h-[300px] p-4 bg-neutral-900 text-white placeholder-neutral-500 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-600 transition-all text-base"
          />
          {/* 6. ADD MEDIA PREVIEW: Conditionally render image or video preview. */}
          {(imagePreview || videoPreview) && (
            <div className="mt-4 relative rounded-xl overflow-hidden bg-neutral-900">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-80 object-contain"
                />
              )}
              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-auto max-h-80"
                />
              )}
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-neutral-900/50 text-white rounded-full p-2 hover:bg-neutral-900/70 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {getIcon("close")}
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            {/* Image Upload Button */}
            <label
              className={`cursor-pointer text-sky-500 hover:text-sky-400 p-2 rounded-full hover:bg-neutral-700 transition-colors ${
                video ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {getIcon("image")}
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={!!video}
              />
            </label>

            {/* 7. ADD VIDEO UPLOAD BUTTON */}
            <label
              className={`cursor-pointer text-sky-500 hover:text-sky-400 p-2 rounded-full hover:bg-neutral-700 transition-colors ${
                image ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {getIcon("video")}
              </svg>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                disabled={!!image}
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm ${
                content.length > MAX_CHARACTERS
                  ? "text-red-500"
                  : "text-neutral-400"
              }`}
            >
              {content.length}/{MAX_CHARACTERS}
            </span>
            <button
              onClick={handlePost}
              disabled={!content.trim() || content.length > MAX_CHARACTERS}
              className="bg-sky-600 text-white px-6 py-2 rounded-full font-bold text-base shadow-lg hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'create' ? 'Post' : 'Update'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
