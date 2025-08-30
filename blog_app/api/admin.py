from django.contrib import admin
from .models import Post,comments,Likes,CustomUser
# Register your models here.
admin.site.register(Post)
admin.site.register(comments)
admin.site.register(Likes)
admin.site.register(CustomUser)
