from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework import serializers

from apps.common.responses import success_response

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class UserListView(APIView):
    def get(self, request: Request):
        users = User.objects.order_by("id").values("id", "username")
        return success_response("Users fetched successfully", list(users))
