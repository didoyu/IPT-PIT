from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

from .models import Exam, Question, Option, ExamResult, Profile
from .serializers import ExamSerializer, ExamSubmissionSerializer, QuestionSerializer

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

    # ✅ BLOCK INVALID INPUT
    if not section or section.lower() == 'n/a':
        return Response({'error': 'Invalid section'}, status=400)

    if not school_year or school_year.lower() == 'n/a':
        return Response({'error': 'Invalid school year'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email)

    Profile.objects.create(
        user=user,
        first_name=data.get('first_name'),
        middle_name=data.get('middle_name', ''),
        last_name=data.get('last_name'),
        section=section,
        school_year=school_year
    )

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
    if not request.user.is_staff:
        return Response(status=403)
    
    results = ExamResult.objects.select_related('user__profile', 'exam')

    sections = set()
    years = set()
    exams = set()

    for r in results:
        prof = getattr(r.user, 'profile', None)

        if prof:
            if prof.section and prof.section.strip():
                sections.add(prof.section.strip())

            if prof.school_year and prof.school_year.strip():
                years.add(prof.school_year.strip())

        if r.exam and r.exam.title:
            exams.add(r.exam.title.strip())

    return Response({
        "sections": sorted(list(sections)),
        "years": sorted(list(years)),
        "exams": sorted(list(exams)),
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
        serializer = ExamSubmissionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            result = serializer.save()
            return Response({
                "score": result.score, 
                "total": result.exam.questions.count(),
                "is_passed": result.is_passed
            }, status=status.HTTP_201_CREATED)
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