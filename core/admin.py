from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Exam, Question, Option, ExamResult

class OptionInline(admin.TabularInline):
    model = Option
    extra = 4 # Shows 4 option slots by default

class QuestionAdmin(admin.ModelAdmin):
    inlines = [OptionInline]

# Customize the User admin list view to show email activation and names
admin.site.unregister(User)
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'is_staff',
        'is_active',
        'is_superuser'
    )
    list_filter = ('is_staff', 'is_superuser', 'is_active')

admin.site.register(Exam)
admin.site.register(Question, QuestionAdmin)
admin.site.register(ExamResult)