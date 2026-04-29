from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    ExamViewSet, QuestionViewSet, SubmitExamView, 
    login_view, register_view, activate_account, admin_results_list, student_results_list, has_taken_exam, user_profile,
    update_profile, request_email_change, verify_email_change, change_password,
    verify_2fa_code, resend_2fa_code,
    forgot_password, reset_password_with_code, resend_password_reset_code
)


import rest_framework.routers
router = rest_framework.routers.SimpleRouter()
router.register(r'exams', ExamViewSet)
router.register(r'questions', QuestionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('submit-exam/', SubmitExamView.as_view(), name='submit-exam'),
    path('login/', login_view, name='login'),
    path('verify-2fa/', verify_2fa_code, name='verify-2fa'),
    path('resend-2fa/', resend_2fa_code, name='resend-2fa'),
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/', reset_password_with_code, name='reset-password'),
    path('resend-password-reset/', resend_password_reset_code, name='resend-password-reset'),
    path('register/', register_view, name='register'),



    path('activate/<str:uidb64>/<str:token>/', activate_account, name='activate'),
    path('admin-results/', admin_results_list, name='admin-results'),

    path('student-results/', student_results_list, name='student-results'),
    path('exams/<int:exam_id>/taken/', has_taken_exam),
    path('profile/', user_profile, name='profile'),
    path('profile/update/', update_profile, name='profile-update'),
    path('profile/request-email-change/', request_email_change, name='request-email-change'),
    path('profile/verify-email-change/', verify_email_change, name='verify-email-change'),
    path('profile/change-password/', change_password, name='change-password'),
]

