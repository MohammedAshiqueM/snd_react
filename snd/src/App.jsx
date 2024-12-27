import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/userSide/Login'
import SignUp from './pages/userSide/Signup';
import Otp from './pages/userSide/Otp';
import Home from './pages/userSide/Home';
import {ProtectedRoute} from './protectedRoute';
import Launch from './pages/userSide/Launch';
import ProfileHeader from './pages/userSide/Profile';
// import { initializeApp } from './auth';
import React, { useEffect } from 'react';
import ForgotPassword from './pages/userSide/ForgetPassword';
import ResetPassword from './pages/userSide/ResetPassword';
import BlogRead from './pages/userSide/BlogRead';
import useAuthStore from './store/useAuthStore';
import { AuthCall } from './AuthCall';
import Questions from './pages/userSide/Question';
// import { SearchContextProvider } from './context/searchContext';
import QuestionRead from './pages/userSide/QuestionRead';
import UsersList from './pages/userSide/UsersList';
import Dashboard from './pages/adminSide/dashboard';
import LoginAdmin from './pages/adminSide/LoginAdmin';
import UserDetails from './pages/userSide/UserDetails';
import UsersAdmin from './pages/adminSide/usersAdmin';
import { AdminProtectedRoute } from './adminProtectedRoute';

function App() {
    const { setAuthStatus } = useAuthStore();

    useEffect(() => {
        const initializeAuth = async () => {
        const isAuthenticated = await AuthCall();
        setAuthStatus(isAuthenticated);
        };

        initializeAuth();
    }, []);
  return (
    <>
      <Router>
        <div>
            {/* <SearchContextProvider> */}
          <Routes>
            {/* User */}
            <Route path="/" element={<Launch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProfileHeader />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            <Route path="/read" element={<BlogRead/>} />
            <Route path="/blogs/:slug" element={<BlogRead />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/question/:pk" element={<QuestionRead />} />
            <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
            <Route path="/users/details/:pk" element={<UserDetails />} />
            {/* admin */}
            <Route path="/admin" element={<LoginAdmin />} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><Dashboard /></AdminProtectedRoute>} />
            <Route path="/admin/users" element={<UsersAdmin />} />
          </Routes>
          {/* </SearchContextProvider> */}
        </div>
      </Router>
    </>
  )
}

export default App
