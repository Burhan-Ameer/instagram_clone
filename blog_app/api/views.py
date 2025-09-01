from rest_framework.response import Response
from .serializers import PostSerializer,CommentSerializer,LikesSerializer,UserSerializers,PostCreateSerializer
from rest_framework.views import  APIView
from rest_framework.viewsets import ModelViewSet
from .models import Post,Comment,Likes,CustomUser
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import (AllowAny,IsAdminUser,IsAuthenticated)

class PostApiView(APIView):
    def get(self, request):
        posts = Post.objects.all().order_by('-created_at')  # Order by newest first
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        # Debug: Print what we're receiving from frontend
        
        # Use PostCreateSerializer for creation
        serializer = PostCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
   
            new_post = serializer.save()
         
            # Use PostSerializer for response
            response_serializer = PostSerializer(new_post, context={'request': request})
           
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_permissions(self):
        self.permission_classes = [AllowAny]
        if self.request.method == "POST":
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()


class CommentsApiView(APIView):
    def get(self,request):
        data=Comment.objects.all().order_by("-created_at")
        serializer=CommentSerializer(data,many=True)
        return Response(serializer.data)
    def post(self,request):
        serializer=CommentSerializer(data=request.data,context={"request":request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       
       
       
class PostLikeListView(APIView):
    def get(self,request,pk):
        post=get_object_or_404(Post,pk=pk)
        likes=post.likes.all()
        serializer=LikesSerializer(likes,many=True,context={"request":request})
        return Response(serializer.data)
    def post(self, request, pk):
        """Toggle like for a post"""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        post = get_object_or_404(Post, pk=pk)
        like, created = Likes.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            # Unlike if already liked
            like.delete()
            return Response({"message": "Post unliked"}, status=status.HTTP_200_OK)
        
        return Response({"message": "Post liked"}, status=status.HTTP_201_CREATED)
        
        
        
class RegisterView(generics.CreateAPIView):
    queryset=CustomUser.objects.all()
    serializer_class =UserSerializers
    permission_classes=[AllowAny]