from django.conf import settings
from djoser import email
import resend


class CustomActivationEmail(email.ActivationEmail):
    template_name = "emails/activation.html"

    def get_context_data(self):
        context = super().get_context_data()
        frontend_url = (settings.FRONTEND_URL or '').rstrip('/')
        if frontend_url:
            context['url'] = f"{frontend_url}/activate/{context['uid']}/{context['token']}"
        return context

    def send(self, to, *args, **kwargs):
        # Get the context with uid/token/url already built
        context = self.get_context_data()
        activation_url = context.get('url', '')

        # Set Resend API key from env
        resend.api_key = settings.RESEND_API_KEY

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px;">
            <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px;">
                <span style="font-size: 10px; font-weight: 900; color: #7e22ce; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px;">
                    Account Verification
                </span>
                <h2 style="font-size: 24px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0 0 16px 0;">
                    Welcome to the Student Exam Portal
                </h2>
                <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
                    Your account has been created. Please confirm your email address to activate your account.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{activation_url}" style="background-color: #faf5ff; color: #7e22ce; border: 1px solid #f3e8ff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-size: 12px; font-weight: 900; text-transform: uppercase;">
                        Activate Account
                    </a>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
                    If the button does not work, copy and paste this link:
                </p>
                <p style="word-break: break-all; font-size: 11px; font-weight: 700; color: #7e22ce; background-color: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    {activation_url}
                </p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;">
                <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin: 0;">
                    &copy; 2026 Student Exam Portal
                </p>
            </div>
        </body>
        </html>
        """

        try:
            resend.Emails.send({
                "from": "Student Exam Portal <onboarding@resend.dev>",
                "to": to,                                    
                "subject": "Activate your Student Exam Portal account",
                "html": html_content,
            })
            print(f"✅ Activation email sent via Resend API to {to}")
        except Exception as e:
            print(f"❌ Resend API error: {e}")
            raise