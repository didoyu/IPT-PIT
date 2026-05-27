import logging
import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import IntegrityError, transaction
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import serializers
from djoser.utils import encode_uid
from django.contrib.auth.tokens import default_token_generator
from datetime import date, datetime

from .models import Exam, Question, Option, ExamResult, Profile
from .serializers import ExamSerializer, ExamSubmissionSerializer, QuestionSerializer
from .emails import CustomActivationEmail

logger = logging.getLogger(__name__)


def _send_activation_email(request, user):
    required_email_settings = {
        'EMAIL_HOST_USER': settings.EMAIL_HOST_USER,
        'EMAIL_HOST_PASSWORD': settings.EMAIL_HOST_PASSWORD,
        'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
    }
    missing_settings = [
        name for name, value in required_email_settings.items() if not value
    ]
    if missing_settings:
        raise ImproperlyConfigured(
            f"Missing email settings: {', '.join(missing_settings)}"
        )

    context = {
        'user': user,
        'uid': encode_uid(user.pk),
        'token': default_token_generator.make_token(user),
    }
    CustomActivationEmail(request, context).send(
        [user.email],
        from_email=settings.DEFAULT_FROM_EMAIL,
    )

# --- AUTHENTICATION ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    data = request.data
    files = request.FILES

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    re_password = data.get('re_password') or ''
    email_address = (data.get('email') or '').strip().lower()

    if not username:
        return Response({'error': 'Username is required', 'field': 'username', 'error_code': 'USERNAME_REQUIRED'}, status=400)

    if not email_address:
        return Response({'error': 'Email is required', 'field': 'email', 'error_code': 'EMAIL_REQUIRED'}, status=400)

    if password != re_password:
        return Response({'error': 'Passwords do not match', 'field': 're_password', 'error_code': 'PASSWORD_MISMATCH'}, status=400)

    section = data.get('section', '').strip()
    school_year = data.get('school_year', '').strip()

    if not section or section.lower() == 'n/a':
        return Response({'error': 'Invalid section', 'field': 'section', 'error_code': 'INVALID_SECTION'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken', 'field': 'username', 'error_code': 'USERNAME_TAKEN'}, status=400)

    existing_email_user = User.objects.filter(email__iexact=email_address).first()
    if existing_email_user:
        if existing_email_user.is_active:
            return Response({'error': 'Email already registered', 'field': 'email', 'error_code': 'EMAIL_TAKEN'}, status=400)

        try:
            _send_activation_email(request, existing_email_user)
            return Response({
                'message': 'This email is already registered but not activated. A new activation email has been sent.',
                'email_status': 'resent',
                'registration_status': 'already_exists_inactive',
            }, status=200)
        except Exception:
            logger.exception('Activation resend failed for existing inactive user_id=%s email=%s', existing_email_user.id, email_address)
            return Response({
                'message': 'This account already exists but activation email could not be resent right now. Please try again.',
                'error': 'EMAIL_SEND_FAILED',
                'error_code': 'EMAIL_SEND_FAILED',
                'email_status': 'failed',
                'registration_status': 'already_exists_inactive',
                'can_resend_activation': True,
            }, status=200)

    age = data.get('age')
    birthday = data.get('birthday')
    birthday_date = None
    if birthday:
        try:
            birthday_date = datetime.fromisoformat(birthday).date()
            if not age or not str(age).isdigit():
                today = date.today()
                age = today.year - birthday_date.year - ((today.month, today.day) < (birthday_date.month, birthday_date.day))
        except ValueError:
            return Response({'error': 'Invalid birthday format', 'field': 'birthday', 'error_code': 'INVALID_BIRTHDAY'}, status=400)

    try:
        # 1. Create User (is_active=False is mandatory for activation flow)
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email_address,
                is_active=False
            )

            # Keep Django's User fields in sync for admin display
            user.first_name = data.get('first_name', '')
            user.last_name = data.get('last_name', '')
            user.save()

            # 2. Update Profile (The signal usually creates the blank profile first)
            profile = user.profile
            profile.first_name = data.get('first_name')
            profile.middle_name = data.get('middle_name', '')
            profile.last_name = data.get('last_name')
            profile.email = email_address
            profile.section = section
            profile.school_year = school_year
            profile.address = data.get('address')
            profile.birthday = birthday_date
            profile.age = int(age) if age and str(age).isdigit() else None

            if 'profile_picture' in files:
                profile.profile_picture = files['profile_picture']

            profile.save()
    except IntegrityError:
        logger.warning('Registration conflict for username=%s email=%s', username, email_address)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken', 'field': 'username', 'error_code': 'USERNAME_TAKEN'}, status=400)
        return Response({'error': 'Email already registered', 'field': 'email', 'error_code': 'EMAIL_TAKEN'}, status=400)

    # 3. Trigger activation email
    try:
        _send_activation_email(request, user)

    except Exception as e:
        logger.exception('Activation email failed for user_id=%s username=%s email=%s', user.id, username, email_address)
        return Response({
            'message': 'Account created, but verification email could not be sent. Use resend activation.',
            'error': 'EMAIL_SEND_FAILED',
            'error_code': 'EMAIL_SEND_FAILED',
            'email_status': 'failed',
            'can_resend_activation': True,
        }, status=201)

    return Response({
        'message': 'Registration successful. Please check your email to activate your account.',
        'email_status': 'sent',
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_activation_email(request):
    email_address = (request.data.get('email') or '').strip().lower()
    if not email_address:
        return Response({'error': 'Email is required', 'field': 'email', 'error_code': 'EMAIL_REQUIRED'}, status=400)

    user = User.objects.filter(email__iexact=email_address, is_active=False).first()

    if not user:
        return Response({
            'message': 'If the account exists and is not active, an activation email has been sent.'
        }, status=200)

    try:
        _send_activation_email(request, user)
    except Exception:
        logger.exception('Resend activation email failed for user_id=%s email=%s', user.id, email_address)
        return Response({'error': 'Email service temporarily unavailable', 'error_code': 'EMAIL_SERVICE_UNAVAILABLE'}, status=503)

    return Response({'message': 'Activation email sent. Please check your inbox.'}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        profile = getattr(user, 'profile', None)
        full_name = f"{profile.first_name} {profile.last_name}" if profile else user.username
            
        return Response({
            'token': token.key,
            'username': user.username,
            'full_name': full_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)


# --- DROPDOWN FILTERS ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_filter_options(request):

    # 🔐 Admin-only access
    if not request.user.is_staff:
        return Response({"detail": "Forbidden"}, status=403)

    # 📊 Get all exam results
    results = ExamResult.objects.select_related('user__profile', 'exam')

    sections = set()
    years = set()
    exams = set()

    # 🔄 Extract unique values
    for result in results:
        profile = getattr(result.user, 'profile', None)

        # ---- Sections ----
        if profile and profile.section:
            section = profile.section.strip()
            if section:
                sections.add(section)

        # ---- School Years ----
        if profile and profile.school_year:
            year = profile.school_year.strip()
            if year:
                years.add(year)

        # ---- Exams ----
        if result.exam and result.exam.title:
            exam_title = result.exam.title.strip()
            if exam_title:
                exams.add(exam_title)

    # 📤 Return sorted response
    return Response({
        "sections": sorted(sections),
        "years": sorted(years),
        "exams": sorted(exams),
    })

# --- VIEWSETS (CRUD) ---

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]


# --- EXAM LOGIC ---

class SubmitExamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ExamSubmissionSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            try:
                result = serializer.save()
                return Response({
                    "score": result.score,
                    "total": result.exam.questions.count(),
                    "is_passed": result.is_passed
                }, status=status.HTTP_201_CREATED)

            # 🚫 HANDLE "ALREADY TAKEN" ERROR
            except serializers.ValidationError as e:
                return Response({
                    "error": str(e.detail[0])
                }, status=400)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- RESULTS & REPORTING ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_results_list(request):
    if not request.user.is_staff:
        return Response(status=403)

    results = ExamResult.objects.select_related('user__profile', 'exam')
    data = []

    for r in results:
        profile = getattr(r.user, 'profile', None)
        total_questions = r.exam.questions.count() if r.exam else 0
        
        # 🎯 Dynamic data evaluations
        pass_mark = r.exam.pass_mark if r.exam else 50
        percentage = (r.score / total_questions * 100) if total_questions > 0 else 0
        
        # Using model property or running the comparison inline
        is_passed = getattr(r, 'is_passed', percentage >= pass_mark)

        data.append({
            "id": r.id,
            "student_name": f"{profile.first_name} {profile.last_name}" if profile else r.user.username,
            "exam_title": r.exam.title if r.exam else "N/A",
            "score": r.score,
            "total_questions": total_questions,
            "percentage": round(percentage, 2),
            "pass_mark": pass_mark,
            "passed": is_passed,  # Sent to map to mobile 'item.passed'
            "date": r.completed_at.strftime("%b %d, %Y %H:%M"),
            "section": profile.section.strip() if profile and profile.section else "",
            "school_year": profile.school_year.strip() if profile and profile.school_year else "",
        })

    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_results_list(request):
    """The personalized list of results for the Student Dashboard."""
    results = ExamResult.objects.filter(user=request.user).select_related('exam').order_by('-completed_at')
    data = [
        {
            "id": r.id, 
            "exam_title": r.exam.title, 
            "score": r.score, 
            "total_questions": r.exam.questions.count(),
            "pass_mark": r.exam.pass_mark,
            "is_passed": r.is_passed,
            "date": r.completed_at.strftime("%b %d, %Y %H:%M")
        } for r in results
    ]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def has_taken_exam(request, exam_id):
    taken = ExamResult.objects.filter(user=request.user, exam_id=exam_id).exists()
    return Response({"taken": taken})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    # Fetch profile safely
    try:
        profile = user.profile
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)

    # Safely handle the Cloudinary URL
    pic_url = None
    if profile.profile_picture:
        try:
            pic_url = profile.profile_picture.url
            # Sometimes local storage prepends /media/, Cloudinary should be absolute
            if pic_url and not pic_url.startswith('http'):
                # Force absolute path if necessary, but Cloudinary usually handles this
                pass 
        except ValueError:
            pic_url = None

    return Response({
        "username": user.username,
        "email": user.email,
        "first_name": profile.first_name or "",
        "middle_name": profile.middle_name or "",
        "last_name": profile.last_name or "",
        "section": profile.section or "",
        "school_year": profile.school_year or "",
        "address": profile.address or "",
        "age": profile.age,
        "birthday": profile.birthday,
        "profile_picture": pic_url,
    })

@api_view(['POST'])
@permission_classes([AllowAny]) # Changing to AllowAny for testing, change to IsAuthenticated later if needed
def chat_with_ollama(request):
    """Bridge view that sends prompt payload over to local Ollama runtime server instance."""
    user_message = request.data.get('message', '')
    
    if not user_message:
        return Response({'error': 'Message details cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
    
    ollama_url = "http://127.0.0.1:11434/api/generate"
    payload = {
        "model": "qwen2.5:0.5b",
        "prompt": user_message,
        "stream": False  
    }
    
    try:
        response = requests.post(ollama_url, json=payload, timeout=30)
        
        if response.status_code == 200:
            ollama_reply = response.json().get('response', '')
            return Response({'reply': ollama_reply}, status=status.HTTP_200_OK)
        else:
            return Response({'reply': 'Ollama runtime engine responded with an error.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except requests.exceptions.ConnectionError:
        return Response({'reply': 'Could not communicate with background Ollama service engine.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
