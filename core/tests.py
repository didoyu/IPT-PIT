from unittest.mock import patch

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class RegistrationFlowTests(APITestCase):
	def _valid_payload(self, **overrides):
		payload = {
			'username': 'student_one',
			'password': 'StrongPass123!',
			're_password': 'StrongPass123!',
			'email': 'student_one@example.com',
			'first_name': 'Student',
			'middle_name': '',
			'last_name': 'One',
			'section': 'IT3R1',
			'school_year': '2025-2026',
			'address': 'Sample Address',
			'age': '20',
			'birthday': '2005-01-01',
		}
		payload.update(overrides)
		return payload

	@patch('core.views.CustomActivationEmail.send', return_value=None)
	def test_register_rejects_duplicate_username(self, _mock_send):
		User.objects.create_user(username='taken_name', password='pass', email='old@example.com')
		response = self.client.post('/api/register/', self._valid_payload(username='taken_name'), format='multipart')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data.get('field'), 'username')
		self.assertEqual(response.data.get('error_code'), 'USERNAME_TAKEN')

	@patch('core.views.CustomActivationEmail.send', return_value=None)
	def test_register_rejects_duplicate_email(self, _mock_send):
		User.objects.create_user(username='existing_user', password='pass', email='dup@example.com', is_active=True)
		response = self.client.post('/api/register/', self._valid_payload(email='dup@example.com'), format='multipart')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(response.data.get('field'), 'email')
		self.assertEqual(response.data.get('error_code'), 'EMAIL_TAKEN')

	@patch('core.views.CustomActivationEmail.send', return_value=None)
	def test_register_resends_for_duplicate_inactive_email(self, mock_send):
		User.objects.create_user(username='inactive_email_user', password='pass', email='inactive-dup@example.com', is_active=False)
		response = self.client.post('/api/register/', self._valid_payload(email='inactive-dup@example.com'), format='multipart')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data.get('registration_status'), 'already_exists_inactive')
		self.assertEqual(response.data.get('email_status'), 'resent')
		mock_send.assert_called_once()

	@patch('core.views.CustomActivationEmail.send', side_effect=Exception('smtp down'))
	def test_register_returns_partial_success_when_email_send_fails(self, _mock_send):
		response = self.client.post('/api/register/', self._valid_payload(), format='multipart')

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data.get('email_status'), 'failed')
		self.assertEqual(response.data.get('error_code'), 'EMAIL_SEND_FAILED')

		user = User.objects.get(username='student_one')
		self.assertFalse(user.is_active)

	@patch('core.views.CustomActivationEmail.send', return_value=None)
	def test_resend_activation_email_for_inactive_user(self, mock_send):
		user = User.objects.create_user(
			username='inactive_user',
			password='pass',
			email='inactive@example.com',
			is_active=False,
		)
		response = self.client.post('/api/resend-activation-email/', {'email': user.email}, format='json')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('Activation email sent', response.data.get('message', ''))
		mock_send.assert_called_once()

	def test_resend_activation_email_non_enumerating_response(self):
		response = self.client.post('/api/resend-activation-email/', {'email': 'missing@example.com'}, format='json')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertIn('If the account exists', response.data.get('message', ''))
