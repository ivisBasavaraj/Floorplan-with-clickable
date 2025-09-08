import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FontAwesomeIcon } from '../components/icons/FontAwesomeIcon';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const { login, register, isLoading, error, checkBackendConnection } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const connected = await checkBackendConnection();
    setBackendConnected(connected);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      // Error handling is done in the store
    }
  };

  const handleLoginSuccess = (user: any) => {
    navigate('/dashboard');
  };

  const handleRegisterSuccess = (user: any) => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <FontAwesomeIcon icon="fas fa-th-large" size={32} className="text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">IMTMA Flooring</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to manage event floor plans
          </p>
        </div>

        {/* Backend Connection Status */}
        <div className={`p-3 rounded-md text-sm ${
          backendConnected 
            ? 'bg-green-50 text-green-700' 
            : 'bg-yellow-50 text-yellow-700'
        }`}>
          {backendConnected ? (
            <>✅ Backend server connected</>
          ) : (
            <>⚠️ Backend server not available. Please start the backend server.</>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username or email"
                disabled={!backendConnected}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                disabled={!backendConnected}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={!backendConnected}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            
            <button
              type="button"
              onClick={checkConnection}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Refresh Connection
            </button>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading || !backendConnected}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              disabled={!backendConnected}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
            >
              Don't have an account? Register here
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-gray-600">
              Backend API Endpoints:
            </p>
            <p className="text-gray-800 mt-1 font-mono text-xs">
              Dashboard: http://localhost:5000/dashboard
            </p>
            <p className="text-gray-800 font-mono text-xs">
              API: http://localhost:5000/api
            </p>
          </div>
        </form>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Register Modal */}
      {showRegister && (
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onClose={() => setShowRegister(false)}
        />
      )}
    </div>
  );
};