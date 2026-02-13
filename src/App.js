import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import CallRoom from './pages/CallRoom';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/call-room"
            element={
              <ProtectedRoute>
                <CallRoom />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/call-room" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

