from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chat_message, Message
from api.models import CustomUser
from django.utils import timezone

class StartChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Start a chat with another user"""
        other_user_id = request.data.get('user_id')
        
        if not other_user_id:
            return Response(
                {"error": "user_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if int(other_user_id) == request.user.id:
            return Response(
                {"error": "Cannot start chat with yourself"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = CustomUser.objects.get(id=other_user_id)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get or create chat room
        chat_room = Chat_message.get_or_create_chat(
            user_a=request.user, 
            user_b=other_user
        )
        
        return Response({
            "chat_room_name": chat_room.name,
            "other_user": {
                "id": other_user.id,
                "username": other_user.username,
                "profile_pic": str(other_user.profile_pic) if other_user.profile_pic else None
            },
            "created": True
        }, status=status.HTTP_200_OK)

class ChatListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get list of user's chats"""
        user_id = str(request.user.id)
        
        # Get chats where user is part of the conversation
        chats = Chat_message.objects.filter(
            name__contains=user_id
        ).prefetch_related('messages__user')
        
        chat_list = []
        for chat in chats:
            # Get the other user in the conversation
            user_ids = chat.name.split('_')
            other_user_id = user_ids[0] if user_ids[1] == user_id else user_ids[1]
            
            try:
                other_user = CustomUser.objects.get(id=other_user_id)
                last_message = chat.messages.last()
                
                chat_list.append({
                    "chat_room_name": chat.name,
                    "other_user": {
                        "id": other_user.id,
                        "username": other_user.username,
                        "profile_pic": str(other_user.profile_pic) if other_user.profile_pic else None
                    },
                    "last_message": {
                        "content": last_message.content if last_message else None,
                        "timestamp": last_message.timestamp if last_message else None,
                        "sender": last_message.user.username if last_message else None
                    },
                    "created_at": chat.created_at
                })
            except CustomUser.DoesNotExist:
                continue
        
        return Response(chat_list, status=status.HTTP_200_OK)

class ChatMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, chat_room_name):
        """Get messages for a specific chat room"""
        user_id = str(request.user.id)
        
        # Verify user is part of this chat
        if user_id not in chat_room_name.split('_'):
            return Response(
                {"error": "Access denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            chat_room = Chat_message.objects.get(name=chat_room_name)
            messages = chat_room.messages.select_related('user').all()
            
            message_list = []
            for message in messages:
                message_list.append({
                    "id": message.id,
                    "content": message.content,
                    "timestamp": message.timestamp,
                    "user": {
                        "id": message.user.id,
                        "username": message.user.username,
                        "profile_pic": str(message.user.profile_pic) if message.user.profile_pic else None
                    },
                    "is_own": message.user.id == request.user.id
                })
            
            return Response(message_list, status=status.HTTP_200_OK)
            
        except Chat_message.DoesNotExist:
            return Response(
                {"error": "Chat room not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
