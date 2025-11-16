"""
Unit Tests für PhilogicAI Flask Server
Führe aus mit: python test_server.py
"""

import unittest
import json
import os
import sys
from unittest.mock import patch, MagicMock, mock_open
import tempfile

# Import server (angepasster Pfad wenn nötig)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock environment before importing
os.environ['PHILOGIC_AUTH_TOKEN'] = 'test-token-123'
os.environ['PHILOGIC_TEST_MODE'] = 'true'

# Mock file existence checks
with patch('os.path.exists', return_value=True):
    from philogic_ai_server import app, call_llama_cpp


class TestPhilogicAIServer(unittest.TestCase):
    """Test Suite für PhilogicAI Flask Server"""
    
    def setUp(self):
        """Setup vor jedem Test"""
        self.app = app.test_client()
        self.app.testing = True
        os.environ['PHILOGIC_TEST_MODE'] = 'true'
        os.environ['PHILOGIC_AUTH_TOKEN'] = 'test-token-123'
    
    def tearDown(self):
        """Cleanup nach jedem Test"""
        pass


class TestHealthEndpoint(TestPhilogicAIServer):
    """Tests für /health Endpoint"""
    
    def test_health_check_returns_200(self):
        """Health Check sollte 200 zurückgeben"""
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
    
    def test_health_check_returns_json(self):
        """Health Check sollte JSON zurückgeben"""
        response = self.app.get('/health')
        self.assertEqual(response.content_type, 'application/json')
    
    def test_health_check_contains_required_fields(self):
        """Health Check sollte alle erforderlichen Felder enthalten"""
        response = self.app.get('/health')
        data = json.loads(response.data)
        
        self.assertIn('status', data)
        self.assertIn('model', data)
        self.assertIn('service', data)
        self.assertIn('timestamp', data)
    
    def test_health_check_status_is_ok(self):
        """Health Check Status sollte 'ok' sein"""
        response = self.app.get('/health')
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'ok')
    
    def test_health_check_service_name(self):
        """Service Name sollte 'PhilogicAI' sein"""
        response = self.app.get('/health')
        data = json.loads(response.data)
        self.assertEqual(data['service'], 'PhilogicAI')


class TestChatEndpointAuth(TestPhilogicAIServer):
    """Tests für Authentication am /api/chat Endpoint"""
    
    def test_chat_without_auth_returns_401(self):
        """Request ohne Auth Token sollte 401 zurückgeben"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test'},
                                headers={})
        self.assertEqual(response.status_code, 401)
    
    def test_chat_with_invalid_auth_returns_401(self):
        """Request mit falschem Token sollte 401 zurückgeben"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test'},
                                headers={'Authorization': 'Bearer wrong-token'})
        self.assertEqual(response.status_code, 401)
    
    def test_chat_with_valid_auth_returns_200(self):
        """Request mit korrektem Token sollte 200 zurückgeben"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test'},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)
    
    def test_chat_with_malformed_auth_header_returns_401(self):
        """Request mit falsch formatiertem Auth Header sollte 401 zurückgeben"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test'},
                                headers={'Authorization': 'InvalidFormat'})
        self.assertEqual(response.status_code, 401)


class TestChatEndpointValidation(TestPhilogicAIServer):
    """Tests für Input Validation am /api/chat Endpoint"""
    
    def test_chat_without_message_returns_400(self):
        """Request ohne Message sollte 400 zurückgeben"""
        response = self.app.post('/api/chat',
                                json={},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 400)
    
    def test_chat_with_empty_message_returns_400(self):
        """Request mit leerem Message String sollte 400 zurückgeben"""
        response = self.app.post('/api/chat',
                                json={'message': ''},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 400)
    
    def test_chat_with_whitespace_message_returns_400(self):
        """Request mit nur Whitespace sollte 400 zurückgeben"""
        response = self.app.post('/api/chat',
                                json={'message': '   '},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 400)
    
    def test_chat_with_non_string_message_returns_400(self):
        """Request mit non-string Message sollte 400 zurückgeben"""
        response = self.app.post('/api/chat',
                                json={'message': 123},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 400)
    
    def test_chat_accepts_valid_message(self):
        """Request mit gültiger Message sollte akzeptiert werden"""
        response = self.app.post('/api/chat',
                                json={'message': 'Hello AI'},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)


class TestChatEndpointTestMode(TestPhilogicAIServer):
    """Tests für Test Mode Funktionalität"""
    
    def test_test_mode_returns_mock_response(self):
        """Im Test Mode sollte eine Mock-Antwort zurückgegeben werden"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test message'},
                                headers={'Authorization': 'Bearer test-token-123'})
        data = json.loads(response.data)
        
        self.assertIn('response', data)
        self.assertIn('Test-Antwort', data['response'])
        self.assertIn('Test message', data['response'])
    
    def test_test_mode_response_format(self):
        """Test Mode Response sollte alle erforderlichen Felder haben"""
        response = self.app.post('/api/chat',
                                json={'message': 'Hello'},
                                headers={'Authorization': 'Bearer test-token-123'})
        data = json.loads(response.data)
        
        self.assertIn('response', data)
        self.assertIn('model', data)
        self.assertIn('status', data)
        self.assertEqual(data['status'], 'success')
    
    def test_test_mode_includes_message_in_response(self):
        """Test Mode sollte User-Message in Antwort einbauen"""
        test_message = 'My custom test question'
        response = self.app.post('/api/chat',
                                json={'message': test_message},
                                headers={'Authorization': 'Bearer test-token-123'})
        data = json.loads(response.data)
        
        self.assertIn(test_message, data['response'])


class TestChatEndpointHistory(TestPhilogicAIServer):
    """Tests für Conversation History Handling"""
    
    def test_chat_accepts_empty_history(self):
        """Request mit leerer History sollte akzeptiert werden"""
        response = self.app.post('/api/chat',
                                json={
                                    'message': 'Test',
                                    'history': []
                                },
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)
    
    def test_chat_accepts_valid_history(self):
        """Request mit gültiger History sollte akzeptiert werden"""
        response = self.app.post('/api/chat',
                                json={
                                    'message': 'Follow-up',
                                    'history': [
                                        {'role': 'user', 'content': 'First message'},
                                        {'role': 'assistant', 'content': 'First response'}
                                    ]
                                },
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)
    
    def test_chat_works_without_history(self):
        """Request ohne History-Feld sollte funktionieren"""
        response = self.app.post('/api/chat',
                                json={'message': 'No history'},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)


class TestChatEndpointResponseFormat(TestPhilogicAIServer):
    """Tests für Response Format"""
    
    def test_response_is_json(self):
        """Response sollte JSON sein"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test'},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.content_type, 'application/json')
    
    def test_response_contains_required_fields(self):
        """Response sollte alle Pflichtfelder enthalten"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test'},
                                headers={'Authorization': 'Bearer test-token-123'})
        data = json.loads(response.data)
        
        self.assertIn('response', data)
        self.assertIn('model', data)
        self.assertIn('status', data)
    
    def test_response_field_types(self):
        """Response Felder sollten korrekte Typen haben"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test'},
                                headers={'Authorization': 'Bearer test-token-123'})
        data = json.loads(response.data)
        
        self.assertIsInstance(data['response'], str)
        self.assertIsInstance(data['model'], str)
        self.assertIsInstance(data['status'], str)


class TestEdgeCases(TestPhilogicAIServer):
    """Tests für Edge Cases"""
    
    def test_very_long_message(self):
        """Sehr lange Messages sollten verarbeitet werden können"""
        long_message = 'A' * 10000
        response = self.app.post('/api/chat',
                                json={'message': long_message},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)
    
    def test_special_characters_in_message(self):
        """Messages mit Sonderzeichen sollten funktionieren"""
        special_message = 'Test äöü ß €@#$%^&*()'
        response = self.app.post('/api/chat',
                                json={'message': special_message},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)
    
    def test_unicode_message(self):
        """Unicode-Messages sollten funktionieren"""
        unicode_message = 'Test 你好 мир 🚀'
        response = self.app.post('/api/chat',
                                json={'message': unicode_message},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)
    
    def test_multiline_message(self):
        """Mehrzeilige Messages sollten funktionieren"""
        multiline_message = 'Line 1\nLine 2\nLine 3'
        response = self.app.post('/api/chat',
                                json={'message': multiline_message},
                                headers={'Authorization': 'Bearer test-token-123'})
        self.assertEqual(response.status_code, 200)


class TestCORS(TestPhilogicAIServer):
    """Tests für CORS Headers"""
    
    def test_cors_headers_present(self):
        """CORS Headers sollten gesetzt sein"""
        response = self.app.get('/health')
        self.assertIn('Access-Control-Allow-Origin', response.headers)
    
    def test_options_request_returns_200(self):
        """OPTIONS Request sollte 200 zurückgeben"""
        response = self.app.options('/api/chat')
        self.assertEqual(response.status_code, 200)


class TestErrorMessages(TestPhilogicAIServer):
    """Tests für Error Messages"""
    
    def test_missing_auth_error_message(self):
        """Error Message bei fehlendem Auth sollte informativ sein"""
        response = self.app.post('/api/chat',
                                json={'message': 'Test'},
                                headers={})
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertIn('Authorization', data['error'])
    
    def test_invalid_message_error_message(self):
        """Error Message bei invalider Message sollte informativ sein"""
        response = self.app.post('/api/chat',
                                json={},
                                headers={'Authorization': 'Bearer test-token-123'})
        data = json.loads(response.data)
        self.assertIn('error', data)
        self.assertIn('message', data['error'].lower())


def run_tests():
    """Führe alle Tests aus"""
    # Test Suite erstellen
    suite = unittest.TestLoader().loadTestsFromModule(sys.modules[__name__])
    
    # Tests ausführen
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Statistik ausgeben
    print("\n" + "="*70)
    print(f"Tests gelaufen: {result.testsRun}")
    print(f"Erfolge: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Fehler: {len(result.failures)}")
    print(f"Exceptions: {len(result.errors)}")
    print("="*70)
    
    # Exit Code setzen
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    exit_code = run_tests()
    sys.exit(exit_code)
