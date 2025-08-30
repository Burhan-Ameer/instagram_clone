from rest_framework.response import Response
from .serializers import PostSerializer,CommentSerializer,LikesSerializer,UserSerializers
from rest_framework.views import  APIView
from rest_framework.viewsets import ModelViewSet
from .models import Post,comments,Likes,CustomUser
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import (AllowAny,IsAdminUser)
class PostApiView(APIView):
    def get(self,request):
        posts=Post.objects.all() 
        serializer= PostSerializer(posts,many=True)
        return Response(serializer.data)
    def post(self,request):
        data=request.data
        serializer = PostSerializer(data=data, context={'request': request})    
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Post Created Successfully !" ,"status":status.HTTP_201_CREATED})
        return Response({"message":"Error in Creating post!","status":status.HTTP_400_BAD_REQUEST})
    def get_permissions(self):
        self.permission_classes=[AllowAny]
        if self.request.method=="POST":
            self.permission_classes=[IsAdminUser]
        return super().get_permissions()


class CommentsApiView(APIView):
    def get(self,request):
        data=comments.objects.all()
        serializer=CommentSerializer(data=data)
        if serializer.is_valid():
           return Response(serializer.data)
        return Response({"message":"error getting comments"})
       
       
class PostLikeListView(APIView):
    def get(self,request,pk):
        post=get_object_or_404(Post,pk=pk)
        likes=post.likes.all()
        serializer=LikesSerializer(likes,many=True,context={"request":request})
        return Response(serializer.data)
        
        
class RegisterView(generics.CreateAPIView):
    queryset=CustomUser.objects.all()
    serializer_class =UserSerializers
    permission_classes=[AllowAny]