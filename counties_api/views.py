from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.shortcuts import render
from django.contrib.messages.api import get_messages
import json

"""
Main Views
"""
def index(request):
    return HttpResponseRedirect(reverse('home'))

@login_required
def home(request):
    """User's home view after being logged in"""
    messages = get_messages(request)
    return render(request, 'home.html', {
        'messages': get_messages(request),
        'locations': request.user.location_set.all()
    })

from rest_api.models import Location

@login_required
def location_admin(request):
    """admin view of all locations"""
    messages = get_messages(request)
    query = Location.objects.all()

    def deserialize(l):
        d = json.loads(l.data)
        d['user'] = l.user.email
        return d
    locations = [deserialize(l) for l in Location.objects.all()]

    return render(request, 'admin.html', {
        'messages': get_messages(request),
        'locations': locations
    })


"""
Location Views
"""

'''
@login_required
def new_location(request):
    ctx = {
        'weekdays': ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        'messages': get_messages(request),
    }
    if request.method == 'POST':
        create_location_from_form(request)
        return HttpResponseRedirect(reverse('home'))
    return render(request, 'locations/new_location.html', ctx)
'''

"""
Login Views
"""
def login(request):
    """Login View"""
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse('home'))
    else:
        messages = get_messages(request)
        return render(request, 'login.html', {'messages': messages})


def login_error(request):
    """Login Error view"""
    messages = get_messages(request)
    return render(request, 'login_error.html', {'messages': messages})

def close_login_popup(request):
    """close login popup window from oauth providers"""
    return render(request, 'close_popup.html', {})

def logout(request):
    """Logs out user"""
    auth_logout(request)
    return HttpResponseRedirect(reverse('index'))
