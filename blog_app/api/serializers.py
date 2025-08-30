from rest_framework import serializers
from .models import Post,comments,Likes,CustomUser
 
 
class PostSerializer(serializers.Serializer):
    id =serializers.IntegerField(read_only=True)
    title=serializers.CharField()
    content=serializers.CharField()
    author=serializers.StringRelatedField(read_only=True)
    # create_at=serializers.DateTimeField()
    # update_at=serializers.DateTimeField()
    def create(self, validated_data):
        current_user=self.context["request"].user
        return Post.objects.create(author=current_user,**validated_data)
    
class CommentSerializer(serializers.Serializer):
    user=serializers.StringRelatedField(read_only=True)
    message=serializers.CharField()
    post=serializers.CharField()
    extra_kwargs={
        "post":{"write_only":True}
    }
    def create(self, validated_data):
        return comments.objects.create(**validated_data)
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