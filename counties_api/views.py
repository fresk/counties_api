from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.shortcuts import render
from django.contrib.messages.api import get_messages
import json
import pymongo
import bson


class ObjectIDFieldRenamer(pymongo.son_manipulator.SONManipulator):

    def transform_incoming(self, son, collection):
        if not "id" in son:
            son["_id"] = pymongo.ObjectId(son['id'])
        return son

    def transform_outgoing(self, son, collection):
        son['id'] = str(son['_id'])
        if self.will_copy():
            return bson.son.SON(son)
        return son


mongo_client = pymongo.MongoClient()
db = mongo_client.find_your_iowa
manipulator = ObjectIDFieldRenamer()
pymongo.database.Database.add_son_manipulator(db, manipulator)



"""
Main Views
"""
def index(request):
    return HttpResponseRedirect(reverse('home'))


def contact_view(request):
    messages = get_messages(request)
    return render(request, 'contact.html', {'messages': messages})

def about_view(request):
    messages = get_messages(request)
    return render(request, 'about.html', {'messages': messages})

def help_view(request):
    messages = get_messages(request)
    return render(request, 'help.html', {'messages': messages})


@login_required
def home(request):
    """User's home view after being logged in"""
    messages = get_messages(request)
    locations = db.locations.find({'user': request.user.email})
    return render(request, 'home.html', {
        'messages': get_messages(request),
        'locations': locations
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
