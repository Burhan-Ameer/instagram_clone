from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.StartChatView.as_view(), name='start_chat'),
    path('list/', views.ChatListView.as_view(), name='chat_list'),
    path('<str:chat_room_name>/messages/', views.ChatMessagesView.as_view(), name='chat_messages'),
]
