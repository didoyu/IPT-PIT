from django.contrib import admin
from .models import Exam, Question, Option, ExamResult

class OptionInline(admin.TabularInline):
    model = Option
    extra = 4 # Shows 4 option slots by default

class QuestionAdmin(admin.ModelAdmin):
    inlines = [OptionInline]

admin.site.register(Exam)
admin.site.register(Question, QuestionAdmin)
admin.site.register(ExamResult)