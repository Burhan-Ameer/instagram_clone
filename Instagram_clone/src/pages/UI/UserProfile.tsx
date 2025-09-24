import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/post-card";
import { getPosts, getUsers } from "@/services/services";
import { toast } from "react-toastify";

interface Post {
  id: string;
  author_username: string;
  profile_pic: string;
  content: string;
  image?: string;
  video?: string;
  created_at: string;
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [currentPage, setCurrentPage] = useState("profiles");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      try {
        const users = await getUsers();
        const foundUser = users.find((u: any) => u.username === username);
        if (!foundUser) {
          toast.error("User not found");
          return;
        }
        setUser(foundUser);

        // Fetch posts by this user
        const allPosts = await getPosts(1, { author: username });
        setUserPosts(allPosts);
      } catch (error) {
        console.error("Failed to fetch user data", error);
        toast.error("Could not load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

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
          onCreatePost={() => {}}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto border-x border-neutral-800">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-20 border-b border-neutral-800 p-4">
          <div className="flex items-center gap-4">
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
            <h1 className="text-2xl font-bold">{user?.username || 'User Profile'}</h1>
          </div>
        </div>

        {/* Profile Header */}
        <div className="border-b border-neutral-800 p-6">
          <div className="flex items-center gap-6">
            <img
              src={user?.profile_pic || "/generic-person-avatar.png"}
              alt={user?.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-neutral-700"
            />
            <div>
              <h1 className="text-2xl font-bold">{user?.username}</h1>
              <p className="text-neutral-400">{user?.email}</p>
              {user?.bio && <p className="mt-2">{user?.bio}</p>}
              <div className="mt-4 flex gap-4 text-sm">
                <span><strong>{userPosts.length}</strong> Posts</span>
                <span><strong>0</strong> Followers</span>
                <span><strong>0</strong> Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="w-full">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
          ) : userPosts.length > 0 ? (
            userPosts.map((post) => (
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
                  currentUserEmail={user?.email}
                />
              </div>
            ))
          ) : (
            <div className="text-center p-6">
              <p className="text-neutral-400">No posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
