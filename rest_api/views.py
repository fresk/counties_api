import json
import logging

from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from models import Location
from counties_api.mongo_db import db, ObjectId
from bson.json_util import dumps


@login_required
def new_location(request):
    return render(request, 'location_new.html')


@login_required
def edit_location(request, uid):
    #location = Location.objects.get(pk=int(uid))
    location = db.locations.find_one({'_id': ObjectId(uid)})
    logging.debug(location)
    return render(request, 'location_edit.html', {'location': dumps(location)})



def _deserialize(l):
    d = json.loads(l.data)
    d['user'] = l.user.email
    return d


def get_location_list():
    items = [l for l in db.locations.find()]
    return HttpResponse(dumps(items), content_type="application/json")




def location_list(request):
    if request.method == 'GET':
        return get_location_list()

    if request.method == 'POST':
        if not request.user.is_authenticated(request):
            return HttpResponse('Unauthorized', status=401)
        
        data = json.loads(request.body)
        l = None
        if not data.get('id'):
            l = Location(user=request.user, data=json.dumps(data), name=data['name'])
            l.save()
            data["id"] = l.id
            l.data = json.dumps(data)
            l.save()
        else:
            l = Location.objects.get(pk=int(data['id']))
            if (request.user.is_staff == False):
                if (l.user.pk != request.user.pk):
                    return HttpResponse(json.dumps({'error': 'not authorized'}), content_type="application/json")
            l.data = json.dumps(data)
            l.name = data['name']
            l.save()
        return HttpResponse(json.dumps(l.data), content_type="application/json")



    return HttpResponse(json.dumps({'error': 'must be get or post request'}), content_type="application/json")




