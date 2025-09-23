import { useEffect, useState } from "react";
import PostCard from "@/components/post-card";
import CreatePostModal from "@/components/create-post-modal";
import Sidebar from "@/components/Sidebar";
import { getPosts, createPost } from "@/services/services";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addPost, setPosts } from "@/features/posts/postSlice";

// Mock data for posts

// interface Post {
//   id: string;
//   author: string;
//   content: string;
//   image?: string;
//   video?: string;
//   created_at: string;
// }

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(
    undefined
  );
  // check if there is content available
  const [hasMore, setHasMore] = useState(true);
  // flag to check if the content is loading or not for the first time 
  // const [isLoading, setIsLoading] = useState(false);
  // flag to check if there is content still available need to be loaded for each time when we click on loadmore button
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // keep track of the page numbers
  const [page, setPage] = useState(1);
  

  const dispatch = useDispatch();
  const posts = useSelector((state: any) => state.posts.items);

  useEffect(() => {
    const userEmail =
      localStorage.getItem("user_email") ||
      localStorage.getItem("user_username") ||
      undefined;
    if (userEmail) {
      setCurrentUserEmail(userEmail);
    }

    const fetchposts = async () => {
      try {
        const data = await getPosts(1);
        dispatch(setPosts(data));
        console.log(data);
        if (data.length < 10) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("failed to fetch the posts", error);
        toast.error("Could not load Posts.");
      } finally {
        // setIsLoading(false);
      }
    };

    fetchposts();
  }, []); // <-- The dependency array is now the second argument

  const handleCreatePost = async (
    content: string,
    image?: File,
    video?: File
  ) => {
    try {
      const newPost = await createPost(content, image, video);
      dispatch(addPost(newPost));
    } catch (error) {
      console.error("Failed to create Post", error);
      toast.error("Failed to create Post. please try again.");
    }
  };

  // Helper function to get an icon
  const getIcon = (iconName: string) => {
    const icons = {
      menu: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      ),
      search: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      ),
    };
    return icons[iconName as keyof typeof icons];
  };

  // handling load more functionality means fetching next page
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;  
      const newPosts = await getPosts(nextPage);
      if (newPosts.length === 0) {
        setHasMore(false);
        toast.info("No more posts to load");
      } else {
        dispatch(setPosts([...posts, ...newPosts]));
        setPage(nextPage);
      }
      if (newPosts.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to Load more posts", error);
      toast.error("failed to load more posts please try again.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-50 relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral-950/80 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:block`}
      >
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setIsMobileSidebarOpen(false);
          }}
          onCreatePost={() => {
            setIsCreatePostOpen(true);
            setIsMobileSidebarOpen(false);
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto border-x border-neutral-800">
        {/* Mobile Header and "What's Happening" Section */}
        <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-20 border-b border-neutral-800">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-full hover:bg-neutral-800 transition-colors"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {getIcon("menu")}
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Home</h1>
          </div>

          <div className="flex items-start gap-4 p-4 border-t border-neutral-800">
            <img
              src="/my-profile.png"
              alt="Your profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700 flex-shrink-0"
            />
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="flex-1 text-left px-4 py-3 bg-neutral-800 rounded-full text-neutral-400 hover:bg-neutral-700 transition-colors text-base"
            >
              What's happening?
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="w-full">
          {posts.map((post: any) => (
            <div key={post.id} className="border-b border-neutral-800">
              <PostCard
                id={post.id}
                author={{
                  username: post.author_username,
                  avatar: "/generic-person-avatar.png",
                  profile_picture:post.profile_pic,
                }}
                author_username={post.author_username}
                content={post.content}
                image={post.image}
                video={post.video}
                timestamp={post.created_at}
                likes={0}
                comments={0}
                shares={0}
                currentUserEmail={currentUserEmail}
              />
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center p-6 border-b border-neutral-800">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-3 px-6 py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors duration-200"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Posts</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block w-80 p-6 border-l border-neutral-800">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {getIcon("search")}
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 bg-neutral-800 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600 text-white placeholder-neutral-400"
            />
          </div>
        </div>

        {/* What's Happening */}
        <div className="bg-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">What's happening</h2>
          <div className="space-y-4">
            <div className="cursor-pointer hover:bg-neutral-700/50 p-2 rounded-lg transition-colors">
              <p className="text-sm text-neutral-400">Trending in Technology</p>
              <p className="font-bold text-lg text-white">#AI</p>
              <p className="text-sm text-neutral-400">42.1K posts</p>
            </div>
            <div className="cursor-pointer hover:bg-neutral-700/50 p-2 rounded-lg transition-colors">
              <p className="text-sm text-neutral-400">Trending</p>
              <p className="font-bold text-lg text-white">#WebDevelopment</p>
              <p className="text-sm text-neutral-400">28.5K posts</p>
            </div>
            <div className="cursor-pointer hover:bg-neutral-700/50 p-2 rounded-lg transition-colors">
              <p className="text-sm text-neutral-400">Trending in Design</p>
              <p className="font-bold text-lg text-white">#UI</p>
              <p className="text-sm text-neutral-400">15.2K posts</p>
            </div>
          </div>
        </div>

        {/* Who to Follow */}
        <div className="bg-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Who to follow</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/suggested-user-1.png"
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
                />
                <div>
                  <p className="font-semibold text-white">Alex Chen</p>
                  <p className="text-xs text-neutral-400">@alexchen</p>
                </div>
              </div>
              <button className="bg-sky-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-sky-500 transition-colors">
                Follow
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/suggested-user-2.png"
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
                />
                <div>
                  <p className="font-semibold text-white">Maria Garcia</p>
                  <p className="text-xs text-neutral-400">@mariagarcia</p>
                </div>
              </div>
              <button className="bg-sky-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-sky-500 transition-colors">
                Follow
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPost={handleCreatePost}
      />
    </div>
  );
}
