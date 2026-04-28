from djoser import email
from django.conf import settings

class CustomActivationEmail(email.ActivationEmail):
    template_name = "emails/activation.html"

    def get_context_data(self):
        context = super().get_context_data()
        # Djoser provides 'uid' and 'token' in the context by default
        uid = context.get('uid')
        token = context.get('token')
        
        # We manually build the URL to point to your React Frontend
        # We use http://localhost:3000/ because that's where your React app is
        context['url'] = f"http://localhost:5173/activate/{uid}/{token}"
        
        return context