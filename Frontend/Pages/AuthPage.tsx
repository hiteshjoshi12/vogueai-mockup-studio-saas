import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

// Make sure your backend URL is defined
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Added error state to show users
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      // 1. Determine if we are hitting /api/auth/login or /api/auth/signup
      const endpoint = isLogin ? 'login' : 'signup';
      
      // 2. Make the REAL call to your Node.js backend
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      // 3. Handle Backend Errors (e.g., "Invalid credentials" or "User already exists")
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // 4. Success! Save the REAL JWT and token balance from MongoDB into Redux
      dispatch(setCredentials({ 
        token: data.token,      // The secure JWT from Express
        email: data.email,      // The user's email
        tokens: data.tokens     // Their actual balance from the database
      }));

    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message);
    } finally {
      // Only set to false if it failed (if it succeeded, Redux instantly redirects us away)
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-xl mx-auto mb-4">
          <i className="fa-solid fa-layer-group text-xl"></i>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Vogue<span className="font-light text-gray-500">AI</span> Studio
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Professional fashion mockups in seconds.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {/* Show Errors from Backend here */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start">
               <i className="fa-solid fa-triangle-exclamation mr-2 mt-0.5"></i>
               {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Email address</label>
              <div className="mt-1">
                <input 
                  type="email" required 
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all" 
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <div className="mt-1">
                <input 
                  type="password" required 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-black hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-[0.98]"
            >
              {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null); // Clear errors when switching modes
                }} 
                className="ml-1 font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                type="button"
              >
                {isLogin ? 'Sign up for free' : 'Log in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;