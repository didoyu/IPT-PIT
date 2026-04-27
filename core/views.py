from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes


from .models import Exam, Question, Option, ExamResult, Profile
from .serializers import ExamSerializer, ExamSubmissionSerializer, QuestionSerializer

# --- AUTHENTICATION ---

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    data = request.data
    files = request.FILES 

    username = data.get('username')
    password = data.get('password')
    re_password = data.get('re_password')
    email = data.get('email')

    if password != re_password:
        return Response({'error': 'Passwords do not match'}, status=400)

    section = data.get('section', '').strip()
    school_year = data.get('school_year', '').strip()

    if not section or section.lower() == 'n/a':
        return Response({'error': 'Invalid section'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)

    # 1. Create User
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email
    )

    # 2. Update Profile
    # The signal creates the profile, we just need to update the fields
    profile = user.profile
    profile.first_name = data.get('first_name')
    profile.middle_name = data.get('middle_name', '')
    profile.last_name = data.get('last_name')
    profile.email = email
    profile.section = section
    profile.school_year = school_year
    profile.address = data.get('address')
    
    age = data.get('age')
    profile.age = int(age) if age and str(age).isdigit() else None
    
    birthday = data.get('birthday')
    if birthday:
        profile.birthday = birthday

    # ✅ Handling the file specifically for Cloudinary storage
    if 'profile_picture' in files:
        profile.profile_picture = files['profile_picture']

    profile.save() # Crucial: This triggers the upload to Cloudinary
    
    return Response({'message': 'Registration successful'}, status=201)
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