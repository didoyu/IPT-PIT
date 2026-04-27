from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model): #btw you gotta "python -m pip install Pillow" so you can install the custom user profile with avatar
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

# --- SUBJECT MODEL ---
class Subject(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# --- STUDENT PROFILE ---
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)

    email = models.EmailField(blank=True, null=True)  # ✅ ADD THIS

    section = models.CharField(max_length=50)
    school_year = models.CharField(max_length=20)

    address = models.CharField(max_length=255, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    birthday = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.last_name}, {self.first_name} ({self.section})"


# --- EXAM ---
class Exam(models.Model):
    # ⚠️ TEMPORARY NULLABLE (IMPORTANT FOR MIGRATION)
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='exams',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    pass_mark = models.IntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        subject_name = self.subject.name if self.subject else "No Subject"
        return f"{subject_name} - {self.title}"


# --- QUESTION ---
class Question(models.Model):
    TYPES = (
        ('MCQ', 'Multiple Choice'),
        ('ESSAY', 'Essay')
    )

    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    question_type = models.CharField(max_length=10, choices=TYPES, default='MCQ')
    required_keywords = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.text


# --- OPTION ---
class Option(models.Model):
    question = models.ForeignKey(Question, related_name='options', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text


# --- EXAM RESULT ---
class ExamResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    score = models.IntegerField()
    is_passed = models.BooleanField(default=False)
    section_at_time = models.CharField(max_length=50, null=True, blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'exam')

    def __str__(self):
        return f"{self.user.username} - {self.exam.title}"