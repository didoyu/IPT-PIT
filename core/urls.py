from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExamViewSet, QuestionViewSet, SubmitExamView, 
    login_view, register_view, admin_results_list, 
    student_results_list, has_taken_exam, user_profile,
    update_avatar,
    activate_account,
)# yow niggaz for this to work you need to install "python -m pip install Pillow" but only do that if you know what your doing
#most of the stuff can be sold by just npm install or something

router = DefaultRouter()
router.register(r'exams', ExamViewSet)
router.register(r'questions', QuestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('submit-exam/', SubmitExamView.as_view(), name='submit-exam'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('activate/<str:uidb64>/<str:token>/', activate_account, name='activate'),
    path('admin-results/', admin_results_list, name='admin-results'),
    path('student-results/', student_results_list, name='student-results'),
    path('exams/<int:exam_id>/taken/', has_taken_exam),
    path('profile/', user_profile, name='profile'),
    path('profile/avatar/', update_avatar, name='avatar'),
]