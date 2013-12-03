import json
import logging


from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render
from django.contrib.messages.api import get_messages
from django.template.defaultfilters import slugify

from counties_api.mongo_db import db, ObjectId
from bson import json_util
from bson.son import SON


def to_json(obj):
    return json_util.dumps(obj, indent=4, sort_keys=True)

# LOGIN VIEWS #####################################

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




# PUBLIC VIEWS #####################################

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





# APP VIEWS #####################################

@login_required
def home(request):
    """User's home view after being logged in"""
    messages = get_messages(request)
    locations = db.locations.find({'user': request.user.email})
    return render(request, 'home.html', {
        'messages': get_messages(request),
        'locations': locations
    })


@login_required
def location_admin(request):
    """admin view of all locations"""
    locations = db.locations.find()
    return render(request, 'admin.html', {
        'messages': get_messages(request),
        'locations': locations
    })


@login_required
def new_location(request):
    return render(request, 'location_new.html')


@login_required
def edit_location(request, uid):
    #location = Location.objects.get(pk=int(uid))
    location = db.locations.find_one({'_id': ObjectId(uid)})
    logging.debug(location)
    return render(request, 'location_edit.html', {'location': json_util.dumps(location)})


@login_required
def post_location_list(request):
    s = request.body
    data = json_util.loads(s)
    logging.error(data)
    data['user'] = request.user.email
    data['images'] = data.pop('image_list').split(',')
    data['location']['coordinates'][0] = float(data['location']['coordinates'][0])
    data['location']['coordinates'][1] = float(data['location']['coordinates'][1])
    logging.debug(data)
    logging.error(data)
    _id = db.locations.save(data)
    saved = db.locations.find_one(_id)
    return HttpResponse(json_util.dumps(saved), content_type="application/json")


@login_required
def delete_record(request, uid):
    _uid = {'_id': ObjectId(uid)}
    location = db.locations.find_one(_uid)
    db.locations_trash.save(location)
    db.locations.remove({'_id': ObjectId(uid)})
    return HttpResponse("OK")


def render_location(request, uid):
    #location = Location.objects.get(pk=int(uid))
    location = db.locations.find_one({'_id': ObjectId(uid)})
    logging.debug(location)
    return render(request, 'render.html', {'location': location})


# API VIEWS #####################################
def get_location_list(request):

    result = None

    category = request.GET.get('category', None)
    if not category is None:
        result = {"result": [l for l in db.locations.find({'category': category})]}

    city = request.GET.get('city', None)
    if not city is None:
        result = {"result": [l for l in db.locations.find({'address.city': city})]}

    county = request.GET.get('county', None)
    if not county is None:
        result = {"result": [l for l in db.locations.find({'county': county})]}

    if result is None:
        result = {"result": [l for l in db.locations.find().limit(225)]}

    result["ok"] = 1
    return HttpResponse(to_json(result), content_type="application/json")


def location_single(request, uid):
    result = {"result": db.locations.find_one({'_id': ObjectId(uid)}) }
    return HttpResponse(to_json(result), content_type="application/json")


def location_list(request):
    if request.method == 'GET':
        return get_location_list(request)
    if request.method == 'POST':
        return post_location_list(request)
    return HttpResponse(to_json({'error': 'must be get or post request'}), content_type="application/json")


def recent_locations(request):
    locations = db.locations.find().sort('_id', -1).limit(5)
    result = {"ok": 1, "result": [l for l in locations]}
    return HttpResponse(to_json(result), content_type="application/json")


def popular_locations(request):
    locations = db.locations.find().sort('_id', 1).limit(10)
    result = {"ok": 1, "result": [l for l in locations]}
    return HttpResponse(to_json(result), content_type="application/json")


def locations_by_category(request, category):
    locations = db.locations.find().sort({'category': category}).limit()
    result = {"ok": 1, "result": [l for l in locations]}
    return HttpResponse(to_json(result), content_type="application/json")


def nearby_locations(request):
    lat = float(request.GET.get("lat"))
    lng = float(request.GET.get("lng"))
    dist = request.GET.get("distance", 100 * 1000)

    point = SON([
        ("type", "Point"),
        ("coordinates", [lng, lat])
    ])
    geoNear = SON([
        ('$near', {'$geometry': point}),
        ('$maxDistance', dist)
     ])
    locations = db.locations.find({'location': geoNear})
    result = {"ok": 1, "result": [l for l in locations]}
    return HttpResponse(to_json(result), content_type="application/json")


def category_groups(request):
    q = db.locations.aggregate([
        {"$unwind": "$category"},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$project": {"id": "$_id", "_id":0, "num_entries": "$count"}},
    ])
    return HttpResponse(to_json(q), content_type="application/json")


def city_groups(request):
    q = db.locations.aggregate([
        {"$project": {"city": "$address.city"}},
        {"$group": {"_id": "$city", "count": {"$sum": 1}}},
        {"$project": {"name": "$_id", "_id":0, "num_entries":"$count"}},
    ])

    for c in q["result"]:
        c['id'] = slugify(c["name"])

    return HttpResponse(to_json(q), content_type="application/json")
