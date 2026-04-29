from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import HttpResponse
from rest_framework.authtoken.models import Token
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes


from .models import Exam, Question, Option, ExamResult, Profile, PendingEmailChange, LoginApproval, PasswordResetCode
import random
from django.conf import settings

from .serializers import ExamSerializer, ExamSubmissionSerializer, QuestionSerializer

# --- AUTHENTICATION ---

from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

# --- AUTHENTICATION ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    data = request.data
    
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    section = data.get('section', '').strip()
    school_year = data.get('school_year', '').strip()

    address=data.get('address')
    age=data.get('age')
    birthday=data.get('birthday')
    
    # ✅ GET PROFILE PICTURE
    profile_picture = request.FILES.get('profile_picture')

    # ✅ BLOCK INVALID INPUT
    if not section or section.lower() == 'n/a':
        return Response({'error': 'Invalid section'}, status=400)

    if not school_year or school_year.lower() == 'n/a':
        return Response({'error': 'Invalid school year'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)

    # ✅ Create user but inactive
    user = User.objects.create_user(username=username, password=password, email=email)
    user.is_active = False
    user.save()

    Profile.objects.create(
        user=user,
        first_name=data.get('first_name'),
        middle_name=data.get('middle_name', ''),
        last_name=data.get('last_name'),
        email=email,
        section=section,
        school_year=school_year,
        address=address,
        age=age,
        birthday=birthday,
        profile_picture=profile_picture
    )

    # ✅ SEND ACTIVATION EMAIL
    try:
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Determine activation link (Point to React frontend)
        # In production, change localhost:5173 to your actual frontend domain
        activation_link = f"http://localhost:5173/activate/{uid}/{token}"
        
        context = {
            'username': user.username,
            'activation_link': activation_link,
        }
        
        html_content = render_to_string('emails/activation_email.html', context)
        text_content = strip_tags(html_content)
        
        email_msg = EmailMultiAlternatives(
            subject="Activate your Account",
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[email]
        )
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()
        
    except Exception as e:
        print(f"Error sending email: {e}")
        # Even if email fails, user is created. But ideally we handle this.

    return Response({'message': 'Registration successful! Please check your email to activate your account.'}, status=201)

@api_view(['GET'])
@permission_classes([AllowAny])
def activate_account(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({'message': 'Account activated successfully! You can now login.'}, status=200)
    else:
        return Response({'error': 'Activation link is invalid or expired.'}, status=400)

from django.core.mail import send_mail

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user:
        profile = getattr(user, 'profile', None)
        full_name = f"{profile.first_name} {profile.last_name}" if profile else user.username
        
        # ✅ Check if 2FA is enabled
        if profile and profile.is_2fa_enabled:
            # Generate 6-digit code
            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            approval = LoginApproval.objects.create(user=user, code=code)
            
            # Send Email
            try:
                send_mail(
                    "Your Login Verification Code",
                    f"Hi {full_name},\n\nYour 2FA verification code is: {code}\n\nPlease enter this code in the application to complete your login.\n\nIf you did not attempt to log in, please ignore this email.",
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending 2FA email: {e}")
                
            return Response({
                'requires_2fa': True,
                'approval_token': approval.token,
                'email': user.email
            })

        # ✅ Standard Login
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username,
            'full_name': full_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa_code(request):
    token = request.data.get('token')
    code = request.data.get('code')
    
    try:
        approval = LoginApproval.objects.get(token=token, code=code)
        # Login is correct, generate the real token
        user = approval.user
        auth_token, _ = Token.objects.get_or_create(user=user)
        profile = getattr(user, 'profile', None)
        full_name = f"{profile.first_name} {profile.last_name}" if profile else user.username
        
        # Delete the approval object
        approval.delete()
        
        return Response({
            'status': 'approved',
            'token': auth_token.key,
            'username': user.username,
            'full_name': full_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })
    except LoginApproval.DoesNotExist:
        return Response({'error': 'Invalid verification code'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_2fa_code(request):
    token = request.data.get('token')
    
    try:
        approval = LoginApproval.objects.get(token=token)
        user = approval.user
        profile = getattr(user, 'profile', None)
        full_name = f"{profile.first_name} {profile.last_name}" if profile else user.username
        
        # Generate new code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        approval.code = code
        approval.save()
        
        # Send Email
        try:
            send_mail(
                "Your New Login Verification Code",
                f"Hi {full_name},\n\nYour new 2FA verification code is: {code}\n\nPlease enter this code in the application to complete your login.",
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
            return Response({'message': 'New code sent!'})
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=500)
            
    except LoginApproval.DoesNotExist:
        return Response({'error': 'Invalid session'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    username = request.data.get('username')
    email = request.data.get('email')
    
    try:
        user = User.objects.get(username=username)
        profile = getattr(user, 'profile', None)
        
        if not profile or profile.email != email:
            return Response({'error': 'Username and email do not match our records.'}, status=400)
            
        # Generate 6-digit code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        PasswordResetCode.objects.filter(user=user).delete() # Clear old codes
        PasswordResetCode.objects.create(user=user, code=code)
        
        # Send Email
        try:
            send_mail(
                "Password Reset Code",
                f"Hi {user.username},\n\nYou requested to reset your password. Your 6-digit reset code is: {code}\n\nPlease enter this code in the application to set a new password.",
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'Reset code sent to your email.'})
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=500)
            
    except User.DoesNotExist:
        return Response({'error': 'Username and email do not match our records.'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_with_code(request):
    username = request.data.get('username')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    try:
        user = User.objects.get(username=username)
        reset_entry = PasswordResetCode.objects.get(user=user, code=code)
        
        # Code matches! Update password
        user.set_password(new_password)
        user.save()
        
        # Delete the code
        reset_entry.delete()
        
        return Response({'message': 'Password reset successful! You can now log in.'})
        
    except (User.DoesNotExist, PasswordResetCode.DoesNotExist):
        return Response({'error': 'Invalid username or code.'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_password_reset_code(request):
    username = request.data.get('username')
    email = request.data.get('email')
    
    try:
        user = User.objects.get(username=username)
        profile = getattr(user, 'profile', None)
        
        if not profile or profile.email != email:
            return Response({'error': 'Invalid request.'}, status=400)
            
        # Generate new 6-digit code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        PasswordResetCode.objects.filter(user=user).delete()
        PasswordResetCode.objects.create(user=user, code=code)
        
        # Send Email
        try:
            send_mail(
                "New Password Reset Code",
                f"Hi {user.username},\n\nYour new 6-digit password reset code is: {code}\n\nPlease enter this code in the application to set a new password.",
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'A new reset code has been sent!'})
        except Exception as e:
            return Response({'error': f'Failed to send email: {str(e)}'}, status=500)
            
    except User.DoesNotExist:
        return Response({'error': 'Invalid request.'}, status=400)


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

        data.append({
            "id": r.id,
            "student_name": f"{profile.first_name} {profile.last_name}" if profile else r.user.username,
            "exam_title": r.exam.title if r.exam else "N/A",
            "score": r.score,
            "total_questions": total_questions,
            "date": r.completed_at.strftime("%b %d, %Y %H:%M"),

            # cleaned values (no None / N/A)
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
    profile = getattr(user, 'profile', None)

    return Response({
        "username": user.username,
        "email": user.email,

        "first_name": profile.first_name if profile else "",
        "middle_name": profile.middle_name if profile else "",
        "last_name": profile.last_name if profile else "",

        "section": profile.section if profile else "",
        "school_year": profile.school_year if profile else "",

        # ✅ ADD THESE
        "address": profile.address if profile else "",
        "age": profile.age if profile else None,
        "birthday": profile.birthday if profile else None,
        "is_2fa_enabled": profile.is_2fa_enabled if profile else False,
        "profile_picture": request.build_absolute_uri(profile.profile_picture.url) if profile and profile.profile_picture else None,
    })

# --- PROFILE UPDATES ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])

def update_profile(request):
    user = request.user
    profile = user.profile
    data = request.data

    # Update User model (only first/last name, email is separate)
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.save()

    # Update Profile model
    profile.first_name = data.get('first_name', profile.first_name)
    profile.middle_name = data.get('middle_name', profile.middle_name)
    profile.last_name = data.get('last_name', profile.last_name)
    profile.section = data.get('section', profile.section)
    profile.school_year = data.get('school_year', profile.school_year)
    profile.address = data.get('address', profile.address)
    profile.age = data.get('age', profile.age)
    profile.birthday = data.get('birthday', profile.birthday)
    
    if 'is_2fa_enabled' in data:
        # data might be QueryDict, meaning boolean comes as a string 'true'/'false'
        val = data.get('is_2fa_enabled')
        if str(val).lower() in ['true', '1', 't', 'y', 'yes']:
            profile.is_2fa_enabled = True
        else:
            profile.is_2fa_enabled = False
    
    if 'profile_picture' in request.FILES:
        profile.profile_picture = request.FILES['profile_picture']
        
    profile.save()

    return Response({'message': 'Profile updated successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_email_change(request):
    new_email = request.data.get('new_email')
    
    if not new_email:
        return Response({'error': 'New email is required'}, status=400)
        
    if User.objects.filter(email=new_email).exists():
        return Response({'error': 'Email already in use'}, status=400)

    # Generate 6-digit code
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Store pending change
    PendingEmailChange.objects.filter(user=request.user).delete() # Remove old requests
    PendingEmailChange.objects.create(user=request.user, new_email=new_email, code=code)

    # Send Email
    try:
        email_msg = EmailMultiAlternatives(
            subject="Email Change Verification",
            body=f"Your verification code is: {code}",
            from_email=settings.EMAIL_HOST_USER,
            to=[new_email]
        )
        email_msg.send()
    except Exception as e:
        return Response({'error': f'Failed to send email: {str(e)}'}, status=500)

    return Response({'message': 'Verification code sent to your new email'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_email_change(request):
    code = request.data.get('code')
    
    try:
        pending = PendingEmailChange.objects.get(user=request.user, code=code)
    except PendingEmailChange.DoesNotExist:
        return Response({'error': 'Invalid verification code'}, status=400)

    # Update User and Profile
    user = request.user
    user.email = pending.new_email
    user.save()

    profile = user.profile
    profile.email = pending.new_email
    profile.save()

    pending.delete()

    return Response({'message': 'Email updated successfully'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({'error': 'Incorrect current password'}, status=400)
        
    user.set_password(new_password)
    user.save()
    
    # Optional: If using Token auth, we don't need to re-authenticate the session,
    # but the user will need to use their new password next time they log in.
    return Response({'message': 'Password changed successfully'})

