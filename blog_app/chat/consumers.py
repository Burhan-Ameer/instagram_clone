import json
from urllib.parse import parse_qs
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from chat.models import Chat_message, Message
from api.models import CustomUser

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # Parse token from query string
        query_string = self.scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]
        if not token:
            self.close()
            return

        try:
            access_token = AccessToken(token)
            user_id = access_token.get("user_id")
            self.user = CustomUser.objects.get(id=user_id)
        except (InvalidToken, TokenError, CustomUser.DoesNotExist) as e:
            print(f"Auth error: {e}")
            self.close()
            return

        # Room name like "1_2"
        self.chat_room_name = self.scope["url_route"]["kwargs"]["chat_room_name"]
        self.room_group_name = f"chat_{self.chat_room_name}"

        # Validate participants and ensure room exists
        try:
            u1, u2 = self.chat_room_name.split("_")
            if str(self.user.id) not in (u1, u2):
                self.close()
                return
            other_id = int(u2) if str(self.user.id) == u1 else int(u1)
            other_user = CustomUser.objects.get(id=other_id)
            self.room = Chat_message.get_or_create_chat(self.user, other_user)
        except Exception as e:
            print(f"Room error: {e}")
            self.close()
            return

        self.accept()
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    def receive(self, text_data=None, bytes_data=None):
        try:
            payload = json.loads(text_data or "{}")
            content = (payload.get("message") or "").strip()
            if not content:
                return

            # Save first
            msg = Message.objects.create(user=self.user, room=self.room, content=content)

            # Broadcast
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message_id": msg.id,
                    "message": msg.content,
                    "timestamp": msg.timestamp.isoformat(),
                    "user": {
                        "id": self.user.id,
                        "username": self.user.username,
                        "profile_pic": str(self.user.profile_pic) if self.user.profile_pic else None,
                    },
                    "user_id": self.user.id,
                },
            )
        except Exception as e:
            print(f"Receive error: {e}")

    def chat_message(self, event):
        is_own = event["user_id"] == self.user.id
        self.send(text_data=json.dumps({
            "id": event.get("message_id"),
            "content": event["message"],
            "timestamp": event.get("timestamp"),
            "is_own": is_own,
            "user": event["user"],
        }))