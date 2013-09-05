import json
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.filter(name='json')
def json_filter(data):
    return mark_safe(json.dumps(data))
