import json
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.filter(name='json')
def json_filter(data):
    return mark_safe(json.dumps(data))

@register.filter(name='pk')
def mongo_id(value):
    # Retrieve _id value
    if type(value) == type({}):
        if value.has_key('_id'):
            value = value['_id']

    # Return value
    return unicode(value)