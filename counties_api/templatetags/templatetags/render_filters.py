from django import template

register = template.Library()


@register.filter
def get(mapping, key):
    return mapping.get(key, '')


@register.filter
def get_raw(mapping, key):

    if mapping.get('__raw'):
        return mapping['__raw'].get(key, '')
    else:
        return ''


