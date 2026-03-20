import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../services/garminAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');

        if (errorParam) {
          setError(`Authentication failed: ${errorParam}`);
          setLoading(false);
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setLoading(false);
          return;
        }

        // Exchange code for token
        await exchangeCodeForToken(code);

        // Redirect to home
        navigate('/');
      } catch (err) {
        console.error('Error handling callback:', err);
        setError(err.message || 'Failed to authenticate with Garmin');
        setLoading(false);
      }
    }

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-zinc-600">Authenticating with Garmin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg p-6 border border-zinc-200">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-zinc-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
