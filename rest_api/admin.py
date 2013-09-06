import django.forms as forms
from django.contrib import admin
from models import Location

from django_filepicker.widgets import FPFileWidget


class LocationAdmin(admin.ModelAdmin):
    pass

admin.site.register(Location, LocationAdmin)

