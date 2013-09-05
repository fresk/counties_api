from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

from django.contrib import admin
admin.autodiscover()


from views import *

urlpatterns = patterns(
    "",
    url(r'^$', index, name='index'),
    url(r'^home/$', home, name='home'),

    #url(r'^locations/create/$', locations.views.LocationCreateView.as_view(), name="create_location"),
    #url(r'^locations/create/$', locations.views.CreateLocationView.as_view(), name="create_location"),


    url(r'^login/$', login, name='login'),
    url(r'^login/error/$', login_error, name='login_error'),
    url(r'^logout/$', logout, name='logout'),
    url(r'^close_login_popup/$', close_login_popup, name='login_popup_close'),

    url(r'', include('social_auth.urls')),
    url(r'^admin/', include(admin.site.urls)),
    #url(r'api/', include('api.urls')),
)

if settings.DEBUG:
    urlpatterns += static('/css/', document_root='static/css/')
    urlpatterns += static('/js/', document_root='static/js/')
    urlpatterns += static('/ico/', document_root='static/ico/')
    urlpatterns += static('/font/', document_root='static/font/')
    urlpatterns += static('/img/', document_root='static/img/')
