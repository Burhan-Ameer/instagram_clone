import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { getUsers } from "@/services/services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  username: string;
  email: string;
  profile_pic?: string;
  bio?: string;
  is_following?: boolean; // Add this to track follow status
}

export default function ProfilesPage() {
  const [currentPage, setCurrentPage] = useState("profiles");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers(); // Fetch all users
        // Handle paginated response: if data.results exists, use it; otherwise, assume data is the array
        setUsers(data.results || data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast.error("Could not load users.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (username: string) => {
    navigate(`/user/${username}`);
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
          onCreatePost={() => {}} // No create post on profiles
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
            <div>
              <h1 className="text-2xl font-bold">Profiles</h1>
              <p className="text-neutral-400">Discover and connect with other users</p>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-neutral-800 rounded-xl p-6 hover:bg-neutral-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={user.profile_pic || "/generic-person-avatar.png"}
                      alt={user.username}
                      className="w-20 h-20 rounded-full object-cover border-4 border-neutral-700 mb-4"
                    />
                    <h3 className="font-bold text-lg text-white mb-1">{user.username}</h3>
                    <p className="text-sm text-neutral-400 mb-2">{user.email}</p>
                    {user.bio && (
                      <p className="text-sm text-neutral-300 mb-4 line-clamp-2">{user.bio}</p>
                    )}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUserClick(user.username);
                        }}
                        className="flex-1 bg-neutral-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-neutral-600 transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          user.is_following
                            ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                            : "bg-sky-600 text-white hover:bg-sky-500"
                        }`}
                      >
                        {user.is_following ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
