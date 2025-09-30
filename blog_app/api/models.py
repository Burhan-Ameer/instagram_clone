from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from django.utils import timezone

class CustomUser(AbstractUser):
    profile_pic = CloudinaryField('profile_pic', blank=True, null=True)
    email = models.EmailField(unique=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    
    def __str__(self):
        return self.email

class Post(models.Model):
    content = models.TextField()
    author = models.ForeignKey(CustomUser, related_name='posts', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = CloudinaryField('image', blank=True, null=True)
    video = CloudinaryField('video', blank=True, null=True, resource_type='video')  # Added resource_type
    def __str__(self):
        return f"Post by {self.author.username}: {self.content[:20]}..."  # Trimmed to 20 characters

class Comment(models.Model):
    user = models.ForeignKey(CustomUser, related_name="user_comments", on_delete=models.CASCADE)
    message = models.TextField()
    post = models.ForeignKey(Post, related_name="comments", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comment by {self.user} on {self.post}"

class Likes(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="user_likes")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("user", "post")
    
    def __str__(self):
        return f"{self.post} liked by {self.user}"

# creating follow functionality by creating follow table 
class Follow(models.Model):
     # The user initiating the follow (User A follows User B)
    # The related_name 'following' allows User A.following.all() to see who User A follows.
    follower=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name="following")
    followed =models.ForeignKey(CustomUser,related_name="followers",on_delete=models.CASCADE)
    
    created_at=models.DateField(auto_now_add=True)
    class Meta:
        unique_together=("follower","followed")
    def __str__(self):
        """String for representing the Follow object."""
        return f"{self.follower.username} follows {self.followed.username} "