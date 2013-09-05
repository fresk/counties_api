"""Common settings and globals."""
import sys
from os.path import abspath, basename, dirname, join, normpath

DEBUG = False

########## PATH CONFIGURATION
DJANGO_ROOT = dirname(abspath(__file__))
SITE_ROOT = dirname(DJANGO_ROOT)
SITE_NAME = basename(DJANGO_ROOT)
sys.path.append(DJANGO_ROOT)



########## API KEYS
FILEPICKER_API_KEY = "Py0NB_yvTwGdkp6cz2Ee"

FACEBOOK_APP_ID = '194175827422276'
FACEBOOK_API_SECRET = '04ffa6648d8866ef513c21e0928565db'
FACEBOOK_EXTENDED_PERMISSIONS = ['email']
FACEBOOK_AUTH_EXTRA_ARGUMENTS = {'display': 'popup'}

GOOGLE_OAUTH2_CLIENT_ID = '578726506126.apps.googleusercontent.com'
GOOGLE_OAUTH2_CLIENT_SECRET = 'BIZM7snqRfOvhYk70aw2ErMO'


########## GENERAL CONFIGURATION<D-t>
ROOT_URLCONF = '%s.urls' % SITE_NAME
WSGI_APPLICATION = '%s.wsgi.application' % SITE_NAME
INSTALLED_APPS =  (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    #'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'django.contrib.admin',
    #'django.contrib.gis',
    'south',
    'rest_framework',
    #'debug_toolbar',
    'crispy_forms',
    'social_auth',
    'json_field',
    'templatetags',
    #'api',
)

########## MIDDLEWARE CONFIGURATION
MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    #'debug_toolbar.middleware.DebugToolbarMiddleware',
)

########## SECURITY CONFIGURATION
SECRET_KEY = r"o>LvkhjTRgkyukJY,BsdASA,KHXYLCmP;AOU{)(^BYP(&*I\"OPBU:ADV(*^&%";
ALLOWED_HOSTS = []
INTERNAL_IPS = ['127.0.0.1']
ADMINS = (('Your Name', 'your_email@example.com'),)
MANAGERS = ADMINS

LOGIN_URL          = '/login/'
LOGIN_ERROR_URL    = '/login/error/'
LOGIN_REDIRECT_URL = '/home/'

AUTHENTICATION_BACKENDS = (
    'social_auth.backends.facebook.FacebookBackend',
    'social_auth.backends.google.GoogleOAuth2Backend',
    'social_auth.backends.browserid.BrowserIDBackend',
    'django.contrib.auth.backends.ModelBackend',
)
SOCIAL_AUTH_PIPELINE = (
    'social_auth.backends.pipeline.social.social_auth_user',
    'social_auth.backends.pipeline.associate.associate_by_email',
    'social_auth.backends.pipeline.user.get_username',
    'social_auth.backends.pipeline.user.create_user',
    'social_auth.backends.pipeline.social.associate_user',
    'social_auth.backends.pipeline.social.load_extra_data',
    'social_auth.backends.pipeline.user.update_user_details'
)
SOCIAL_AUTH_USERNAME_IS_FULL_EMAIL = True


########## DATABASE CONFIGURATION
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': join(SITE_ROOT, 'counties_api.db')
    }
}

########## REST API FRAMEWORK
REST_FRAMEWORK = {
    # Use hyperlinked styles by default.
    # Only used if the `serializer_class` attribute is not set on a view.
    'DEFAULT_MODEL_SERIALIZER_CLASS':
        'rest_framework.serializers.HyperlinkedModelSerializer',
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ]
}


########## EMAIL CONFIGURATION
#EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'thomas.hansen@gmail.com'
EMAIL_HOST_PASSWORD = 'qdzxlfwiojmxvvtn'

########## LOCALE CONFIGURATION
TIME_ZONE = 'America/Chicago'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = True
USE_L10N = True
USE_TZ = True

########## MEDIA & STATIC FILES CONFIGURATION
MEDIA_URL = '/media/'
MEDIA_ROOT = normpath(join(SITE_ROOT, 'media'))

STATIC_URL = '/static/'
STATIC_ROOT = normpath(join(SITE_ROOT, 'assets'))
STATICFILES_DIRS = (
    normpath(join(SITE_ROOT, 'static')),
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

########## TEMPLATE CONFIGURATION
TEMPLATE_DIRS = (
    normpath(join(SITE_ROOT, 'templates')),
)
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)
TEMPLATE_CONTEXT_PROCESSORS = (
    'social_auth.context_processors.social_auth_by_name_backends',
    'social_auth.context_processors.social_auth_backends',
    'social_auth.context_processors.social_auth_by_type_backends',
    'social_auth.context_processors.social_auth_login_redirect',
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.request',
)


CRISPY_TEMPLATE_PACK = "bootstrap"


########## DEBUG CONFIGURATION
TEMPLATE_DEBUG = DEBUG
DEBUG_TOOLBAR_PANELS = (
    'debug_toolbar.panels.version.VersionDebugPanel',
    'debug_toolbar.panels.timer.TimerDebugPanel',
    'debug_toolbar.panels.settings_vars.SettingsVarsDebugPanel',
    'debug_toolbar.panels.headers.HeaderDebugPanel',
    'debug_toolbar.panels.request_vars.RequestVarsDebugPanel',
    'debug_toolbar.panels.template.TemplateDebugPanel',
    'debug_toolbar.panels.sql.SQLDebugPanel',
    'debug_toolbar.panels.signals.SignalDebugPanel',
    'debug_toolbar.panels.logger.LoggingPanel',
)
DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TEMPLATE_CONTEXT': True,
    'INTERCEPT_REDIRECTS': False,
    'HIDE_DJANGO_SQL': True,
    'TAG': 'body',
    'ENABLE_STACKTRACES' : True,
}


########## LOGGING CONFIGURATION
# See: https://docs.djangoproject.com/en/dev/ref/settings/#logging
# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,

        },
    }
}



try:
   from local_settings import *
except ImportError, e:
   pass
