import { useState, useEffect, useRef } from "react";
import {
  Plus,
  MessageCircle,
  ArrowLeft,
  Send,
  Search,
  MoreHorizontal,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-toastify";
import { getChatList, getChatMessages, ChatWebSocket } from "@/services/chatServices";
import type { Chat, ChatMessage, ChatUser } from "@/services/chatServices";
import "@/styles/chat.css";

// Chat Room Component
interface ChatRoomProps {
  chat: Chat;
  currentUser: {
    id: number;
    username: string;
  };
  onBack: () => void;
}

function ChatRoom({ chat, currentUser, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOnline] = useState(true);
  const [ws, setWs] = useState<ChatWebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat messages when component mounts
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const chatMessages = await getChatMessages(chat.chat_room_name);
        setMessages(chatMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Setup WebSocket connection
    const websocket = new ChatWebSocket(
      chat.chat_room_name,
      (message) => {
        setMessages(prev => [...prev, message]);
      },
      () => console.log('Connected to chat'),
      () => console.log('Disconnected from chat')
    );
    
    websocket.connect();
    setWs(websocket);

    // Cleanup on unmount
    return () => {
      websocket.disconnect();
    };
  }, [chat.chat_room_name]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;

    ws.sendMessage(newMessage);
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      {/* Chat Header */}
      <div className="bg-neutral-800 border-b border-neutral-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-neutral-700 rounded-full transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-400" />
            </button>

            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-700">
                {chat.other_user.profile_pic ? (
                  <img
                    src={chat.other_user.profile_pic}
                    alt={chat.other_user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-sky-600 text-white font-medium">
                          ${chat.other_user.username.charAt(0).toUpperCase()}
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sky-600 text-white font-medium">
                    {chat.other_user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="font-bold text-white">
                {chat.other_user.username}
              </h2>
              <p className="text-sm text-neutral-400">
                {isOnline ? "Active now" : "Last seen recently"}
              </p>
            </div>
          </div>

          <button className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">No messages yet</h3>
            <p className="text-neutral-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.is_own ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-2 max-w-xs lg:max-w-md ${
                  message.is_own ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!message.is_own && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0">
                    {message.user.profile_pic ? (
                      <img
                        src={message.user.profile_pic}
                        alt={message.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sky-600 text-white font-medium text-sm">
                        {message.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.is_own
                      ? "bg-sky-600 text-white"
                      : "bg-neutral-700 text-white"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-neutral-800 border-t border-neutral-700 p-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 border border-neutral-600"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-sky-600 text-white p-2 rounded-full hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

// Main Messages Component
export default function MessagesPage() {
  const [currentPage] = useState("messages");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser] = useState({
    id: parseInt(localStorage.getItem("user_id") || "1"),
    username: localStorage.getItem("user_username") || "john_doe",
  });

  // Load chats on component mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const chatList = await getChatList();
        setChats(chatList);
        setFilteredChats(chatList);
      } catch (error) {
        console.error('Failed to load chats:', error);
        toast.error('Failed to load chats');
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  useEffect(() => {
    // Filter chats based on search query
    const filtered = chats.filter(
      (chat) =>
        chat.other_user.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        chat.last_message.content
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  const formatMessageTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - messageDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return messageDate.toLocaleDateString();
  };

  // If a chat is selected, show the chat room
  if (selectedChat) {
    return (
      <ChatRoom
        chat={selectedChat}
        currentUser={currentUser}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  // Chat list view
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
          onNavigate={() => {}}
          onCreatePost={() => {}}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto border-x border-neutral-800">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-20 border-b border-neutral-800">
          <div className="p-4">
            <div className="flex items-center justify-between">
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
                  <h1 className="text-2xl font-bold">Messages</h1>
                  <p className="text-neutral-400 text-sm">
                    {filteredChats.length} conversation
                    {filteredChats.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                <Plus className="w-6 h-6 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-neutral-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-neutral-800 text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 border border-neutral-700"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-neutral-600" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">
                {searchQuery ? "No conversations found" : "No messages yet"}
              </h2>
              <p className="text-neutral-400 mb-6">
                {searchQuery
                  ? "Try searching for something else"
                  : "Start a conversation with someone!"}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => window.location.href = '/profiles'}
                  className="bg-sky-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-sky-500 transition-colors"
                >
                  Find people to chat with
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {filteredChats.map((chat) => (
                <div
                  key={chat.chat_room_name}
                  onClick={() => setSelectedChat(chat)}
                  className="p-4 hover:bg-neutral-800 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-700">
                        {chat.other_user.profile_pic ? (
                          <img
                            src={chat.other_user.profile_pic}
                            alt={chat.other_user.username}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-sky-600 text-white font-medium">
                                  ${chat.other_user.username
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-sky-600 text-white font-medium">
                            {chat.other_user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white truncate group-hover:text-sky-300 transition-colors">
                          {chat.other_user.username}
                        </h3>
                        <span className="text-xs text-neutral-500 flex-shrink-0">
                          {formatMessageTime(chat.last_message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 truncate">
                        {chat.last_message.content || "No messages yet"}
                      </p>
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
