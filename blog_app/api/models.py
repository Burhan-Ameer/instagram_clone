from django.db import models
from django.contrib.auth.models import User
# Create your models here.
from django.contrib.auth.models import AbstractUser



class CustomUser(AbstractUser):
    email=models.EmailField(unique=True)
    USERNAME_FIELD="email"
    REQUIRED_FIELDS=["username"]
    def __str__(self):
        return self.email

class Post(models.Model):
    title=models.CharField(max_length=400)
    content=models.TextField()
    author= models.ForeignKey(CustomUser, related_name='posts', on_delete=models.CASCADE)
    create_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    def __str__(self):
       return self.title
    
    
    
class comments(models.Model):
    user=models.ForeignKey(CustomUser,related_name="user_comments" ,on_delete=models.CASCADE)
    message=models.TextField()
    post=models.ForeignKey(Post,related_name="comments",on_delete=models.CASCADE)
    
    def __str__(self):
        return f"comments by {self.user} on {self.post}"
class Likes(models.Model):
    post=models.ForeignKey(Post,on_delete=models.CASCADE,related_name="likes")
    user=models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name="user_likes")
    class Meta:
        unique_together=("user","post")
    def __str__(self):
        return f"{self.post}liked by {self.user}"
    