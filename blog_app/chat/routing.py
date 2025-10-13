from django.urls import re_path
from .consumers import ChatConsumer

# Accept room names like "1_2"
websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<chat_room_name>[0-9_]+)/$', ChatConsumer.as_asgi()),
]
