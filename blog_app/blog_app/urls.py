# importing the views from the view.py file
from api.views import *
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi



schema_view = get_schema_view(
    openapi.Info(
        title="My API",
        default_version='v1',
        description="API documentation for my project",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("posts/",PostApiView.as_view()),
    path("posts/search/",PostSearchView.as_view()),
    path("post/<int:pk>/",PostDetailApi.as_view()),
    path("comments/",CommentsApiView.as_view()),
    path("comment/<int:pk>",CommentUpdateDestroyApiView.as_view()),
    path("postlikes/<int:pk>/",PostLikeListView.as_view()),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("register/",RegisterView.as_view()),
    path("users/", UserListView.as_view()),
    path("user/", CurrentUserView.as_view()),
    path("follow/",FollowToggleView.as_view()),
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
