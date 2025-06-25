import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import EditorApp from './App';
import Home from './pages/Home';

const isLogged = () => !!localStorage.getItem('user');

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) =>
  isLogged() ? children : <Navigate to="/login" />;

const RoutesRoot = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
    {/* відкрити існуючу презентацію */}
  <Route
    path="/editor/:id"
    element={
      <ProtectedRoute>
        <EditorApp />
      </ProtectedRoute>
    }
  />

  {/* створити порожню (наприклад, якщо з /home натиснеш «Нова» і route ще не має id) */}
  <Route
    path="/editor"
    element={
      <ProtectedRoute>
        <EditorApp />
      </ProtectedRoute>
    }
  />
  /</Routes>
 );

export default RoutesRoot;
