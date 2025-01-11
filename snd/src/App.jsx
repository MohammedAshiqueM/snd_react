import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/userSide/Login'
import SignUp from './pages/userSide/Signup';
import Otp from './pages/userSide/Otp';
import Home from './pages/userSide/Home';
import {AdminRoute, ProtectedRoute, UserRoute} from './protectedRoute';
import Launch from './pages/userSide/Launch';
import ProfileHeader from './pages/userSide/Profile';
// import { initializeApp } from './auth';
import React, { useEffect } from 'react';
import ForgotPassword from './pages/userSide/ForgetPassword';
import ResetPassword from './pages/userSide/ResetPassword';
import BlogRead from './pages/userSide/BlogRead';
import {useAuthStore} from './store/useAuthStore';
// import { AuthCall } from './AuthCall';
import Questions from './pages/userSide/Question';
// import { SearchContextProvider } from './context/searchContext';
import QuestionRead from './pages/userSide/QuestionRead';
import UsersList from './pages/userSide/UsersList';
import Dashboard from './pages/adminSide/dashboard';
import LoginAdmin from './pages/adminSide/LoginAdmin';
import UserDetails from './pages/userSide/UserDetails';
import UsersAdmin from './pages/adminSide/usersAdmin';
import { AdminProtectedRoute } from './adminProtectedRoute';
import Reports from './pages/adminSide/Reports';
import ReportsDetails from './pages/adminSide/ReportDetails';
import TagsAdmin from './pages/adminSide/TagsAdmin';
import UserDetailsAdmin from './pages/adminSide/UserDetalisAdmin';
import Tags from './pages/userSide/Tags';
import Shimmer from './pages/userSide/Shimmer';
import Chat from './pages/userSide/Chat';
import { NotificationProvider } from './components/NotificationContext';
import { WebSocketProvider } from './components/WebSocketContext';

function App() {
    const { setAuthStatus,isAuthenticated } = useAuthStore();
    const rehydrated = useAuthStore.persist.hasHydrated();

    // useEffect(() => {
    //     if (rehydrated) {
    //         const initializeAuth = async () => {
    //             const isAuthenticated = await AuthCall();
    //             console.log('Auth status from API or localStorage:', isAuthenticated);
    //             setAuthStatus(isAuthenticated);
    //         };
    //         initializeAuth();
    //     }
    // }, [rehydrated, setAuthStatus]);

    useEffect(() => {
        console.log('Rehydration state:', rehydrated);
        console.log('Authenticated state:', isAuthenticated);
    }, [rehydrated, isAuthenticated]);

    if (!rehydrated) {
        return <p>Loading...</p>; // Prevent flickering during hydration
    }
  return (
      <>
    <NotificationProvider>
      <Router>
        <div>
            {/* <SearchContextProvider> */}
          <Routes>
            {/* User */}
            <Route path="/" element={<Launch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/home" element={<UserRoute><Home /></UserRoute>} />
            <Route path="/profile" element={<ProfileHeader />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            <Route path="/read" element={<BlogRead/>} />
            <Route path="/blogs/:slug" element={<BlogRead />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/question/:pk" element={<QuestionRead />} />
            <Route path="/users" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
            <Route path="/users/details/:pk" element={<UserDetails />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/chat" element={<Chat />} />
            {/* <Route path="/shimmer" element={<Shimmer />} /> */}
            {/* admin */}

            <Route path="/admin" element={<LoginAdmin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<UsersAdmin />} />
            <Route path="/admin/user/details/:pk" element={<UserDetailsAdmin />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/report/details/:pk" element={<ReportsDetails />} />
            <Route path="/admin/tags" element={<TagsAdmin />} />

          </Routes>
          {/* </SearchContextProvider> */}
        </div>
      </Router>
    </NotificationProvider>
    </>
  )
}

export default App
