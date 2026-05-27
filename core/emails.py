from django.conf import settings
from djoser import email


class CustomActivationEmail(email.ActivationEmail):
    template_name = "emails/activation.html"

    def get_context_data(self):
        context = super().get_context_data()

        frontend_url = (settings.FRONTEND_URL or '').rstrip('/')
        if frontend_url:
            context['url'] = f"{frontend_url}/activate/{context['uid']}/{context['token']}"

        return context
