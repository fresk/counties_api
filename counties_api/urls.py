from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

from django.contrib import admin
admin.autodiscover()


from views import *
from rest_api.views import location_list, new_location, edit_location


urlpatterns = patterns(
    "",
    url(r'^$', about_view, name='index'),

    url(r'^contact/$', contact_view, name='contact'),
    #url(r'^about/$', about_view, name='about'),
    url(r'^help$', help_view, name='help'),


    url(r'^manage/$', home, name='manage'),
    url(r'^home/$', home, name='home'),
    url(r'^admin/$', location_admin, name='location_admin'),
    url(r'^locations_admin/', location_list, name='my_locations'),
    url(r'^location/new$', new_location, name='new_location'),
    url(r'^location/(\d+)$$', edit_location, name='edit_location'),
    url(r'^api/locations/', location_list, name='my_locations'),
    #url(r'^locations/create/$', locations.views.LocationCreateView.as_view(), name="create_location"),
    #url(r'^locations/create/$', locations.views.CreateLocationView.as_view(), name="create_location"),


    url(r'^login/$', login, name='login'),
    url(r'^login/error/$', login_error, name='login_error'),
    url(r'^logout/$', logout, name='logout'),
    url(r'^close_login_popup/$', close_login_popup, name='login_popup_close'),

    url(r'', include('social_auth.urls')),
    #url(r'^django-admin/', include(admin.site.urls)),
    #url(r'api/', include('rest_api.urls')),
)

if settings.DEBUG:
    urlpatterns += static('/css/', document_root='static/css/')
    urlpatterns += static('/js/', document_root='static/js/')
    urlpatterns += static('/ico/', document_root='static/ico/')
    urlpatterns += static('/font/', document_root='static/font/')
    urlpatterns += static('/img/', document_root='static/img/')

