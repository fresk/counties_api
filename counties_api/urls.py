from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

from views import *

#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns(
    "",
    #PUBLIC ROUTES
    url(r'^$', about_view, name='index'),
    url(r'^contact/$', contact_view, name='contact'),
    url(r'^help$', help_view, name='help'),

    #LOGIN ROUTES
    url(r'^login/$', login, name='login'),
    url(r'^login/error/$', login_error, name='login_error'),
    url(r'^logout/$', logout, name='logout'),
    url(r'^close_login_popup/$', close_login_popup, name='login_popup_close'),
    url(r'', include('social_auth.urls')),

    #APP ROUTES
    url(r'^manage/$', home, name='manage'),
    url(r'^home/$', home, name='home'),
    url(r'^admin/$', location_admin, name='location_admin'),
    url(r'^locations_admin/', location_list, name='my_locations'),
    url(r'^location/new$', new_location, name='new_location'),
    url(r'^location/([0-9a-f]{24})$$', edit_location, name='edit_location'),
    url(r"^locations/delete/([0-9a-f]{24})$$", delete_record, name='delete_record'),

    # API ROUTES
    url(r'^api/locations/([0-9a-f]{24})$$', location_single),
    url(r'^api/locations/$', location_list),
    url(r'^api/recent/$', recent_locations),
    url(r'^api/popular/$', popular_locations),
    url(r'^api/nearby/$', nearby_locations),
    url(r'^api/categories/$', category_groups),
    url(r'^api/cities/$', city_groups),
    #url(r'^api/category/([^/]+)$', locations_by_category)


    # render routes
    url(r'^render/location/([0-9a-f]{24})$$', render_location),
    #DJANGO ROUTES
    #url(r'^django-admin/', include(admin.site.urls)),
    #url(r'api/', include('rest_api.urls')),
)

if settings.DEBUG:
    urlpatterns += static('/css/', document_root='static/css/')
    urlpatterns += static('/js/', document_root='static/js/')
    urlpatterns += static('/ico/', document_root='static/ico/')
    urlpatterns += static('/font/', document_root='static/font/')
    urlpatterns += static('/img/', document_root='static/img/')

