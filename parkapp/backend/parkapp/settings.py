import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Seguranca
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'fallback-dev-key')
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost').split(',')

# Permite que qualquer URL acesse o Django
ALLOWED_HOSTS = ['*'] 

# Permite requisições de outros domínios (evita o erro de CORS)
CORS_ALLOW_ALL_ORIGINS = True
AUTH_USER_MODEL = 'users.CustomUser'

# Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    # Third-party
    'rest_framework',
    'corsheaders',
    'django_filters',
    # Apps do ParkApp
    'apps.users',
    'apps.parking',
    'apps.reservations',
    #'apps.payments',
    'apps.reviews',
    'apps.reports',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'parkapp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'parkapp.wsgi.application'

# Banco de dados - PostgreSQL + PostGIS
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('POSTGRES_DB', 'parkapp_db'),
        'USER': os.environ.get('POSTGRES_USER', 'parkapp_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'parkapp_secret_123'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# Cache - Redis
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://redis:6379/0'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Celery
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = CELERY_BROKER_URL

# Validacao de senhas
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internacionalizacao
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Cuiaba'
USE_I18N = True
USE_TZ = True

# Arquivos estaticos
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS - permite o frontend React acessar a API
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}


from celery.schedules import crontab

# Configuração do Celery Beat (Agendador de Tarefas)
CELERY_BEAT_SCHEDULE = {
    # 'update-parking-data-every-5-minutes': {
    #     'task': 'apps.parking.tasks.sync_parking_availability',
    #     'schedule': crontab(minute='*/3'), # Roda a cada 3 minutos
    # },

    'cancel-abandoned-bookings': {
        'task': 'apps.parking.tasks.cancel_abandoned_bookings',
        'schedule': crontab(minute='*/5'), # Roda a cada 5 minutos
    },
}

CELERY_TIMEZONE = 'America/Cuiaba' # Ou o mesmo timezone que estiver no seu TIME_ZONE principal
CELERY_ENABLE_UTC = False

CELERY_BROKER_URL = 'redis://redis:6379/0'
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60), # O token dura 1 hora
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),    # O token de renovação dura 1 dia
    'AUTH_HEADER_TYPES': ('Bearer',),
}