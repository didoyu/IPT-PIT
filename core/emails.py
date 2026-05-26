from djoser import email
from django.conf import settings

class CustomActivationEmail(email.ActivationEmail):
    template_name = "emails/activation.html"

    def get_context_data(self):
        context = super().get_context_data()
        uid = context.get('uid')
        token = context.get('token')
        
        # Pull dynamically from settings.py
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        
        # 🔑 FIX: Use a completely custom variable key name that Djoser can't overwrite
        context['frontend_activation_url'] = f"{frontend_url}/activate/{uid}/{token}"
        
        return context