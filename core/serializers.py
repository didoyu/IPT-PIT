from rest_framework import serializers
from .models import Exam, Question, Option, ExamResult

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, required=False)

    class Meta:
        model = Question
        fields = ['id', 'exam', 'text', 'options', 'question_type', 'required_keywords']

    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
        return question

class ExamSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Exam
        fields = ['id', 'title', 'description', 'pass_mark', 'questions']

from rest_framework import serializers
from .models import Exam, Question, Option, ExamResult

class ExamSubmissionSerializer(serializers.Serializer):
    exam_id = serializers.IntegerField()
    answers = serializers.DictField()

    def save(self):
        user = self.context['request'].user
        exam = Exam.objects.get(id=self.validated_data['exam_id'])

        # 🚫 BLOCK MULTIPLE ATTEMPTS
        if ExamResult.objects.filter(user=user, exam=exam).exists():
            raise serializers.ValidationError("You have already taken this exam.")

        submitted_answers = self.validated_data['answers']
        
        score = 0
        questions = exam.questions.all()
        
        if not questions.exists():
            return ExamResult.objects.create(user=user, exam=exam, score=0, is_passed=False)

        for q in questions:
            ans = submitted_answers.get(str(q.id))
            if not ans:
                continue

            if q.question_type == 'MCQ':
                correct_ids = list(q.options.filter(is_correct=True).values_list('id', flat=True))
                correct_ids_str = set(map(str, correct_ids))
                
                student_ans_set = set(map(str, ans)) if isinstance(ans, list) else {str(ans)}
                
                if student_ans_set == correct_ids_str:
                    score += 1
            
            elif q.question_type == 'ESSAY' and q.required_keywords:
                keywords = [k.strip().lower() for k in q.required_keywords.split(',')]
                found = sum(1 for k in keywords if k in ans.lower())
                if len(keywords) > 0 and (found / len(keywords)) >= 0.7:
                    score += 1 

        percentage = (score / questions.count()) * 100
        passed = percentage >= exam.pass_mark
        
        return ExamResult.objects.create(
            user=user,
            exam=exam,
            score=score,
            is_passed=passed
        )