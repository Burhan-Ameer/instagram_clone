import { API } from './services';

export interface ChatUser {
  id: number;
  username: string;
  profile_pic: string | null;
  email?: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  timestamp: string;
  user: ChatUser;
  is_own: boolean;
}

export interface Chat {
  chat_room_name: string;
  other_user: ChatUser;
  last_message: {
    content: string | null;
    timestamp: string | null;
    sender: string | null;
  };
  created_at: string;
}

export interface CreateChatResponse {
  chat_room_name: string;
  other_user: ChatUser;
  created: boolean;
}

// Start a chat with another user
export const startChat = async (userId: number): Promise<CreateChatResponse> => {
  try {
    const { data } = await API.post('/chat/start/', { user_id: userId });
    return data;
  } catch (error) {
    console.error('Failed to start chat:', error);
    throw error;
  }
};

// Get list of user's chats
export const getChatList = async (): Promise<Chat[]> => {
  try {
    const { data } = await API.get('/chat/list/');
    return data;
  } catch (error) {
    console.error('Failed to get chat list:', error);
    throw error;
  }
};

// Get messages for a specific chat room
export const getChatMessages = async (chatRoomName: string): Promise<ChatMessage[]> => {
  try {
    const { data } = await API.get(`/chat/${chatRoomName}/messages/`);
    return data;
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    throw error;
  }
};

// WebSocket connection helper
export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private chatRoomName: string;
  private onMessage: (message: any) => void;
  private onConnect: () => void;
  private onDisconnect: () => void;

  constructor(
    chatRoomName: string,
    onMessage: (message: any) => void,
    onConnect: () => void = () => {},
    onDisconnect: () => void = () => {}
  ) {
    this.chatRoomName = chatRoomName;
    this.onMessage = onMessage;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
  }

  connect() {
    const token = localStorage.getItem('access_token');
    const wsUrl = `ws://localhost:8000/ws/chat/${this.chatRoomName}/?token=${token}`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.onConnect();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.onDisconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ message }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
