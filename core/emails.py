from django.conf import settings
from djoser import email

class CustomActivationEmail(email.ActivationEmail):
    # Djoser uses template_name for the HTML version 
    # and automatically looks for the .txt version with the same name
    template_name = "emails/activation.html"

    def get_context_data(self):
        context = super().get_context_data()
        uid = context.get('uid')
        token = context.get('token')
        if uid and token:
            base = f"{settings.PROTOCOL}://{settings.DOMAIN}"
            activation_path = settings.DJOSER.get('ACTIVATION_URL', 'activate/{uid}/{token}')
            context['url'] = f"{base}/{activation_path}".format(uid=uid, token=token)
        return context