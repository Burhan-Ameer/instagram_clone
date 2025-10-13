from django.db import models
from api.models import CustomUser
from django.utils import timezone

class Chat_message(models.Model):
    name = models.CharField(max_length=255, unique=True)  # Format: "user1_id_user2_id"
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Chat: {self.name}"
    
    @classmethod
    def get_or_create_chat(cls, user_a, user_b):
        """Create or get a private chat between two users"""
        # Always order user IDs to ensure consistent chat room names
        user_ids = sorted([user_a.id, user_b.id])
        chat_name = f"{user_ids[0]}_{user_ids[1]}"
        
        chat_room, created = cls.objects.get_or_create(
            name=chat_name,
            defaults={'created_by': user_a}
        )
        return chat_room

class Message(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey(Chat_message, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"