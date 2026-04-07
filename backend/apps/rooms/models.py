from django.db import models


class Room(models.Model):
    name = models.CharField(max_length=120, unique=True)
    capacity = models.PositiveIntegerField()
    location = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
