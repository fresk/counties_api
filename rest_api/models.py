from django.db import models
from django.contrib.auth.models import User

class UserData(models.Model):
    user = models.ForeignKey(User, editable=False)
    class Meta:
        abstract = True

class Location(UserData):
    name = models.CharField(max_length=128)
    data =  models.TextField(null=True, blank=True)

