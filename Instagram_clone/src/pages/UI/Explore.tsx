import { useEffect, useState } from "react";
import PostCard from "@/components/post-card";
import Sidebar from "@/components/Sidebar";
import { getPosts, searchPosts } from "@/services/services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface Post {
  id: string;
  author_username: string;
  profile_pic: string;
  content: string;
  image?: string;
  video?: string;
  created_at: string;
}

export default function ExplorePage() {
  const [currentPage, setCurrentPage] = useState("explore");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]); // Mock or fetch from API

  const navigate = useNavigate();

  useEffect(() => {
    const userEmail =
      localStorage.getItem("user_email") ||
      localStorage.getItem("user_username") ||
      undefined;
    if (userEmail) {
      setCurrentUserEmail(userEmail);
    }

    // Fetch trending posts (e.g., recent or popular posts)
    const fetchTrending = async () => {
      try {
        const data = await getPosts(1); // Reuse getPosts; in backend, add sorting for trending
        setTrendingPosts(data.slice(0, 10)); // Limit to top 10
      } catch (error) {
        console.error("Failed to fetch trending posts", error);
        toast.error("Could not load trending posts.");
      }
    };

    // Mock suggested users (replace with API call if available)
    setSuggestedUsers([
      { username: "alexchen", avatar: "/suggested-user-1.png", bio: "Tech enthusiast" },
      { username: "mariagarcia", avatar: "/suggested-user-2.png", bio: "Designer" },
    ]);

    fetchTrending();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchPosts(query); // New service function for searching posts/hashtags/users
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const getIcon = (iconName: string) => {
    const icons = {
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

  return (
    <div className="flex min-h-screen bg-neutral-900 text-white relative">
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
          onCreatePost={() => {}} // No create post on explore
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto border-x border-neutral-800">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-20 border-b border-neutral-800 p-4">
          <div className="flex items-center gap-4 mb-4">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">Explore</h1>
          </div>
          <form onSubmit={handleSearchSubmit} className="relative">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, hashtags, or users"
              className="w-full pl-12 pr-4 py-3 bg-neutral-800 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600 text-white placeholder-neutral-400"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sky-500 hover:text-sky-400"
            >
              Search
            </button>
          </form>
        </div>

        {/* Search Results or Trending */}
        <div className="w-full">
          {isSearching ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <h2 className="p-4 text-xl font-bold">Search Results</h2>
              {searchResults.map((post) => (
                <div key={post.id} className="border-b border-neutral-800">
                  <PostCard
                    id={post.id}
                    author={{
                      username: post.author_username,
                      avatar: "/generic-person-avatar.png",
                      profile_picture: post.profile_pic,
                    }}
                    author_username={post.author_username}
                    content={post.content}
                    image={post.image}
                    video={post.video}
                    timestamp={post.created_at}
                    likes={0}
                    comments={0}
                    currentUserEmail={currentUserEmail}
                  />
                </div>
              ))}
            </>
          ) : (
            <>
              <h2 className="p-4 text-xl font-bold">Trending Posts</h2>
              {trendingPosts.map((post) => (
                <div key={post.id} className="border-b border-neutral-800">
                  <PostCard
                    id={post.id}
                    author={{
                      username: post.author_username,
                      avatar: "/generic-person-avatar.png",
                      profile_picture: post.profile_pic,
                    }}
                    author_username={post.author_username}
                    content={post.content}
                    image={post.image}
                    video={post.video}
                    timestamp={post.created_at}
                    likes={0}
                    comments={0}
                    currentUserEmail={currentUserEmail}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden xl:block w-80 p-6 border-l border-neutral-800">
        {/* Trending Hashtags */}
        <div className="bg-neutral-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Trending Hashtags</h2>
          <div className="space-y-4">
            <div className="cursor-pointer hover:bg-neutral-700/50 p-2 rounded-lg transition-colors">
              <p className="font-bold text-lg text-white">#AI</p>
              <p className="text-sm text-neutral-400">42.1K posts</p>
            </div>
            <div className="cursor-pointer hover:bg-neutral-700/50 p-2 rounded-lg transition-colors">
              <p className="font-bold text-lg text-white">#WebDevelopment</p>
              <p className="text-sm text-neutral-400">28.5K posts</p>
            </div>
            <div className="cursor-pointer hover:bg-neutral-700/50 p-2 rounded-lg transition-colors">
              <p className="font-bold text-lg text-white">#UI</p>
              <p className="text-sm text-neutral-400">15.2K posts</p>
            </div>
          </div>
        </div>

        {/* Suggested Users */}
        <div className="bg-neutral-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Suggested for You</h2>
          <div className="space-y-4">
            {suggestedUsers.map((user) => (
              <div key={user.username} className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${user.username}`)}>
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
                  />
                  <div>
                    <p className="font-semibold text-white">{user.username}</p>
                    <p className="text-xs text-neutral-400">{user.bio}</p>
                  </div>
                </div>
                <button className="bg-sky-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-sky-500 transition-colors">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}