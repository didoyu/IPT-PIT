import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = os.getenv(
    'SECRET_KEY',
    'django-insecure-change-this-key-for-production'
)

DEBUG = True

ALLOWED_HOSTS = [
    '.onrender.com',
    'localhost',
    '127.0.0.1',
    '192.168.18.38',
    '0.0.0.0',
    'ipt-pit.vercel.app',
]

# APPLICATIONS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'djoser',
    'cloudinary',
    'cloudinary_storage',
    'core',
]

# MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# DATABASE
DATABASES = {
    'default': dj_database_url.parse(
        os.getenv(
            'DATABASE_URL',
            'postgresql://didoy:Cppos6m8WVObPqMgNI92yLY3mdJv4dDh@dpg-d8beg3b7uimc73aslctg-a.oregon-postgres.render.com/ipt_pit_qjrr'
        )
    )
}

# PASSWORD VALIDATION
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# INTERNATIONALIZATION
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# STATIC FILES
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# MEDIA FILES
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CLOUDINARY
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME', 'dxlxxicpn'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY', '135765745472285'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET', '0O9abkisaKCTJyNknPnaPxzyljU'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
CORS_ALLOWED_ORIGINS = [
    "https://ipt-pit.vercel.app",
    "https://ipt-pitbackend.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8000"
]
CORS_ALLOW_CREDENTIALS = True

# REST FRAMEWORK
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}

# DJOSER
DJOSER = {
    'LOGIN_FIELD': 'username',
    'USER_CREATE_PASSWORD_RETYPE': True,
    'SEND_ACTIVATION_EMAIL': True,
    'ACTIVATION_URL': 'activate/{uid}/{token}',
    'SERIALIZERS': {
        'user_create': 'core.serializers.UserCreateSerializer',
        'user': 'core.serializers.UserSerializer',
        'current_user': 'core.serializers.UserSerializer',
    },
    'EMAIL': {
        'activation': 'core.emails.CustomActivationEmail',
    },
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'django.core.mail': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}

# EMAIL — Gmail with SSL on port 465
#EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
#EMAIL_HOST = 'smtp.gmail.com'
#EMAIL_PORT = 465
#EMAIL_USE_SSL = True
#EMAIL_USE_TLS = False                                         # Must be False when using SSL
#EMAIL_HOST_USER = 'cailing.christiandave123@gmail.com'
#EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')        # Put app password in Render env vars
#EMAIL_TIMEOUT = 30
#DEFAULT_FROM_EMAIL = 'cailing.christiandave123@gmail.com'               # ← Free test address, no domain needed
RESEND_API_KEY = os.getenv('RESEND_API_KEY')
DEFAULT_FROM_EMAIL = 'onboarding@resend.dev'
# SITE SETTINGS
SITE_NAME = 'Student Exam Portal'
DOMAIN = 'ipt-pit.vercel.app'
PROTOCOL = 'https'
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://ipt-pit.vercel.app')