from rest_framework.response import Response
from .serializers import FollowSerializer, PostSerializer,CommentSerializer,LikesSerializer,UserSerializers,PostCreateSerializer
from rest_framework.views import  APIView
from rest_framework.viewsets import ModelViewSet
from .models import Post,Comment,Likes,CustomUser,Follow
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import (AllowAny,IsAdminUser,IsAuthenticated)
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework import viewsets

class PostApiView(APIView):
    def get(self, request):
        posts = Post.objects.all().order_by('-created_at')
        author = request.query_params.get('author')
        if author:
            posts = posts.filter(author__username=author)
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(result_page, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        # Debug: Print what we're receiving from frontend
        
        # Use PostCreateSerializer for creation
        serializer = PostCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
   
            new_post = serializer.save()
         
            # Use PostSerializer     for response
            response_serializer = PostSerializer(new_post, context={'request': request})
           
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_permissions(self):
        self.permission_classes = [AllowAny]
        if self.request.method == "POST":
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

class PostDetailApi(APIView):
    def get(self,request,pk):
        post=get_object_or_404(Post,pk=pk)
        serializers=PostSerializer(post,context={"request":request})
        return Response(serializers.data,status=status.HTTP_200_OK)
    def put(self,request,pk):
        post = get_object_or_404(Post,pk=pk)
        if post.author!=request.user:
            return Response({"error":"You don't have permissions to edit this post"},
                            status=status.HTTP_403_FORBIDDEN)
        serializer=PostSerializer(post,data=request.data,partial=True,context={"request":request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,pk):
        post=get_object_or_404(Post,pk=pk)
        if post.author!=request.user:
           return Response({"error":"You don't have permissions to delete  this post"},
                            status=status.HTTP_403_FORBIDDEN)            
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)        



class PostSearchView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return Post.objects.filter(
                Q(content__icontains=query) | 
                Q(author__username__icontains=query)
            ).order_by('-created_at')
        return Post.objects.none()


class CommentsApiView(APIView):
    def get_permissions(self):
        self.permission_classes=[AllowAny]
        if self.request.method=="POST":
            self.permission_classes=[IsAuthenticated]
        return super().get_permissions()
    def get(self,request):
        data=Comment.objects.all().order_by("-created_at")
        # getting the post id from the url 
        post_id=request.query_params.get("post")
        if post_id:
            data=data.filter(post_id=post_id)
        data=data.order_by("-created_at")
        paginator=PageNumberPagination()
        result_page=paginator.paginate_queryset(data,request)
        serializer=CommentSerializer(result_page,many=True)
        return Response(serializer.data)
    def post(self,request):
        serializer=CommentSerializer(data=request.data,context={"request":request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
       

class CommentUpdateDestroyApiView(APIView):
    def put(self,request,pk):
        data=get_object_or_404(Comment,pk=pk)
        serializer=CommentSerializer(instance=data,data=request.data,partial=True,context={"request":request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        comment=get_object_or_404(Comment,pk=pk)
        if comment.user!=request.user:
            return Response({"error":"You dont have permissions to delete this comment "})
        else:
            comment.delete()
            return Response({"message":"comment deleted successfully"},status=status.HTTP_200_OK)

       
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


class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializers
    permission_classes = [AllowAny]


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializers(request.user)
        return Response(serializer.data)
    
class FollowToggleView(APIView):
    def post(self,request):
        follower=request.user
        followed_id=request.data.get("following")
        
        
        if not followed_id:
            return Response({"error": "following field is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            followed_id=int(followed_id)
        except(ValueError,TypeError):
            return Response({"error":"following field is required"},status=status.HTTP_400_BAD_REQUEST)
        if follower.id == int(followed_id):
            return Response({"error": "you cant follow yourself"}, status=status.HTTP_400_BAD_REQUEST)

        follow=Follow.objects.filter(follower=follower,followed_id=followed_id).first()
        if follow:
            follow.delete()
            return Response({"message":"Unfollowed Successfully"},status=status.HTTP_200_OK)
        
        follow = Follow.objects.create(follower=follower, followed_id=followed_id)
        return Response(FollowSerializer(follow).data, status=201)
