from rest_framework import serializers
from .models import Post, CustomUser, Comment, Likes
import cloudinary.utils

class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating posts"""
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 'image', 'video']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['author'] = request.user
        
        print(f"Creating post with validated_data: {validated_data}")
        post = Post.objects.create(**validated_data)
        print(f"Created post - Image: {post.image}, Video: {post.video}")
        return post

class PostSerializer(serializers.ModelSerializer):
    """Serializer for reading posts"""
    profile_pic=serializers.SerializerMethodField()
    author_username=serializers.SerializerMethodField()
    
    author = serializers.StringRelatedField(read_only=True)
    image = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'content', 'author', 'created_at', 'updated_at', 'image', 'video',"profile_pic","author_username"]

    def get_image(self, obj):
        if obj.image:
            return str(obj.image.url)
        return None
    def get_author_username(self,obj):
        return obj.author.username
    def get_video(self, obj):
        if obj.video:
            # Get the video URL and convert to mp4 for better browser compatibility
            video_url = str(obj.video.url)
            
            # If the video is not already mp4, transform it
            if not video_url.endswith('.mp4'):
                # Use Cloudinary's transformation to convert to mp4
                public_id = obj.video.public_id
                video_url = cloudinary.utils.cloudinary_url(
                    public_id,
                    resource_type='video',
                    format='mp4',
                    quality='auto'
                )[0]
            
            return video_url
        return None
    def get_profile_pic(self,obj):
        if obj.author.profile_pic:
            return str(obj.author.profile_pic.url)
        return None
        

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'message', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        current_user = self.context["request"].user
        return Comment.objects.create(user=current_user, **validated_data)
    
    # **validated data is just destructuring of pythons dictionary into orms attributes
    
class LikesSerializer(serializers.ModelSerializer):
    post=serializers.StringRelatedField(read_only=True)
    user=serializers.StringRelatedField(read_only=True)
    class Meta:
        model=Likes
        fields=["id","post","user"]
        
        
class UserSerializers(serializers.ModelSerializer):
    confirmPassword=serializers.CharField(style={"input_type":"password"},write_only=True)
    
    class Meta:
        model=CustomUser
        fields=("username","email","password","confirmPassword")
        extra_kwargs={
            
            "password":{"write_only":True}
        }
        
    def validate(self,data):
        password=data.get("password")
        confirm_password=data.get("confirmPassword")
        if password!=confirm_password:
            raise serializers.ValidationError({"password":"passwords does not match"})
        return data
    def create(self,validated_data):
            validated_data.pop("confirmPassword")
            user=CustomUser.objects.create_user(**validated_data)
            return user