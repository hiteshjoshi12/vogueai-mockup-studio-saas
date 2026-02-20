import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/index'; // Make sure your Redux store is configured
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashboard';

const App: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route: If logged in, push to dashboard */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
        />
        
        {/* Protected Route: If NOT logged in, kick back to auth page */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;