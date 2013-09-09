from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
import json

from models import Location


@login_required
def new_location(request):
    return render(request, 'location_new.html')


@login_required
def edit_location(request, uid):
    return render(request, 'location_edit.html', {'location': Location.objects.get(pk=int(uid)) })



@login_required
def my_locations(request):
    if request.method == 'POST':
        data = json.loads(request.raw_post_data)
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

    if request.method == 'GET':
        def deserialize(l):
            d = json.loads(l.data)
            d['user'] = l.user.email
            return d

        items = [deserialize(l) for l in request.user.location_set.all()]
        return HttpResponse(json.dumps(items), content_type="application/json")

    return HttpResponse(json.dumps({'error': 'must be get or post request'}), content_type="application/json")

