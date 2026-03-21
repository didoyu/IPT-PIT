from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExamViewSet, QuestionViewSet, SubmitExamView, 
    login_view, register_view, admin_results_list, student_results_list
)

router = DefaultRouter()
router.register(r'exams', ExamViewSet)
router.register(r'questions', QuestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('submit-exam/', SubmitExamView.as_view(), name='submit-exam'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('admin-results/', admin_results_list, name='admin-results'),
    path('student-results/', student_results_list, name='student-results'),
]