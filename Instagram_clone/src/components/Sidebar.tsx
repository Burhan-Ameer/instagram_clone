// import React from "react"

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  onCreatePost: () => void
}

export default function Sidebar({
  currentPage,
  onNavigate,
  onCreatePost,
}: SidebarProps) {
  const menuItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "explore", label: "Explore", icon: "search" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "messages", label: "Messages", icon: "mail" },
    { id: "profile", label: "Profile", icon: "user" },
  ]

  const getIcon = (iconName: string) => {
    const icons = {
      home: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
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
      bell: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      ),
      mail: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      ),
      user: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
      // Adding a new icon for the 'More' button
      more: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
        />
      ),
      plus: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      ),
    }
    return icons[iconName as keyof typeof icons]
  }

  return (
    <div className="w-64 sm:w-72 h-screen bg-neutral-900 text-neutral-50 flex flex-col p-4 md:p-6 shadow-2xl rounded-tr-3xl rounded-br-3xl">
      {/* Logo Section */}
      <div className="flex items-center gap-2 mb-8 pl-1">
        <span className="text-3xl font-extrabold tracking-tight">Social</span>
        <span className="text-sky-500 text-3xl font-extrabold tracking-tight">.</span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-sky-600 text-white shadow-lg"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${
                  isActive ? "scale-110" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {getIcon(item.icon)}
              </svg>
              <span className="font-semibold text-lg">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Action Button */}
      <button
        onClick={onCreatePost}
        className="w-full flex items-center justify-center gap-2 mt-auto bg-sky-600 text-white py-3 rounded-full font-bold text-lg shadow-lg hover:bg-sky-500 transition-colors duration-200 mb-6"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {getIcon("plus")}
        </svg>
        <span className="hidden md:inline">Create Post</span>
      </button>

      {/* User Profile Footer */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-full hover:bg-neutral-800 transition-colors duration-200 cursor-pointer">
        <img
          src="/user-profile-illustration.png"
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-neutral-700"
        />
        <div className="flex-1 min-w-0 hidden md:block">
          <p className="font-semibold text-white truncate">Your Name</p>
          <p className="text-sm text-neutral-400 truncate">@yourusername</p>
        </div>
        <svg
          className="w-6 h-6 text-neutral-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {getIcon("more")}
        </svg>
      </div>
    </div>
  )
} 