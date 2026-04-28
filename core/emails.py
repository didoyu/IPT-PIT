from djoser import email

class CustomActivationEmail(email.ActivationEmail):
    # Djoser uses template_name for the HTML version 
    # and automatically looks for the .txt version with the same name
    template_name = "emails/activation.html"

    def get_context_data(self):
        context = super().get_context_data()
        # Ensure these are explicitly available in the context
        context['uid'] = context.get('uid')
        context['token'] = context.get('token')
        context['url'] = f"http://localhost:3000/activate/{context['uid']}/{context['token']}"
        return context