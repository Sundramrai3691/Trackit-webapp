// BoltPatch: Email verification page
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';
import routeMap from '../services/routeMap';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Token is missing.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/auth/login');
    }
  }, [status, countdown, navigate]);

  const verifyEmail = async (token) => {
    try {
      const response = await api.post(routeMap.auth.verify, { token });
      
      if (response.data.success) {
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
        
        // BoltPatch: Auto-login if tokens are returned
        if (response.data.data?.accessToken || response.data.accessToken) {
          const accessToken = response.data.data?.accessToken || response.data.accessToken;
          const refreshToken = response.data.data?.refreshToken || response.data.refreshToken;
          
          localStorage.setItem('token', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Redirect to profile instead of login
          setTimeout(() => navigate('/me'), 2000);
          return;
        }
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || error.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TrackIt
            </span>
          </Link>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card text-center space-y-6"
        >
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verifying Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting in {countdown} seconds...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-red-600">{message}</p>
              <div className="space-y-3">
                <Link
                  to="/auth/register"
                  className="btn-primary w-full"
                >
                  Try Registering Again
                </Link>
                <Link
                  to="/auth/login"
                  className="block text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}