import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = 'django-insecure-change-this-key-for-production'
DEBUG = True
ALLOWED_HOSTS = ['.onrender.com', 'localhost', '127.0.0.1', '192.168.18.38', '0.0.0.0']

# APPLICATIONS
INSTALLED_APPS = [
    # Django built-ins
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'djoser',
    'cloudinary',
    'cloudinary_storage',

    # Local
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

# TEMPLATES
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
# FIXED: Swapped Supabase out for Render PostgreSQL using built-in Python parsing
from urllib.parse import urlparse

db_url = os.environ.get('DATABASE_URL', 'postgresql://didoy:Cppos6m8WVObPqMgNI92yLY3mdJv4dDh@dpg-d8beg3b7uimc73aslctg-a.oregon-postgres.render.com/ipt_pit_qjrr')
parsed_url = urlparse(db_url)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ipt_pit_qjrr',
        'USER': 'didoy',
        'PASSWORD': 'Cppos6m8WVObPqMgNI92yLY3mdJv4dDh',
        'HOST': 'dpg-d8beg3b7uimc73aslctg-a.oregon-postgres.render.com',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        }       
    }
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

# STATIC & MEDIA FILES
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# ✅ Requirement 4: Cloudinary Media Config
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': 'dxlxxicpn', # Change to your actual Cloudinary name
    'API_KEY': '135765745472285',    # Change to your actual API Key
    'API_SECRET': '0O9abkisaKCTJyNknPnaPxzyljU', # Change to your actual API Secret
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# DEFAULT PRIMARY KEY
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
CORS_ALLOW_ALL_ORIGINS = True

# REST FRAMEWORK
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication', # ✅ For Djoser
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}

# ✅ Requirement 2 & 3: Djoser Setup
DJOSER = {
    'LOGIN_FIELD': 'username',
    'USER_CREATE_PASSWORD_RETYPE': True,
    'SEND_ACTIVATION_EMAIL': False,
    'ACTIVATION_URL': 'activate/{uid}/{token}',
    'SERIALIZERS': {
        # Use lowercase 'user_create' for the registration logic
        'user_create': 'core.serializers.UserCreateSerializer', 
        'user': 'core.serializers.UserSerializer',
        'current_user': 'core.serializers.UserSerializer',
    },
    'EMAIL': {
        'activation': 'core.emails.CustomActivationEmail',
    },
}

# ✅ Requirement 2: Email SMTP Setup
# Use 'django.core.mail.backends.console.EmailBackend' to test without sending real emails
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'cailing.christiandave123@gmail.com' # Your Gmail
EMAIL_HOST_PASSWORD = 'eznkpdisrfmlwfjy' # 16 digit Google App Password
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'cailing.christiandave123@gmail.com'

SITE_NAME = 'Student Exam Portal'  # This looks professional in the inbox
DOMAIN = 'localhost:3000'          # This ensures the link goes to React
PROTOCOL = 'http'
