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
import Reports from './pages/adminSide/Reports';
import ReportsDetails from './pages/adminSide/ReportDetails';
import TagsAdmin from './pages/adminSide/TagsAdmin';
import UserDetailsAdmin from './pages/adminSide/UserDetalisAdmin';
import Tags from './pages/userSide/Tags';
import Chat from './pages/userSide/Chat';
import { NotificationProvider } from './components/NotificationContext';
import { WebSocketProvider } from './components/WebSocketContext';
import SessionRequest from './pages/userSide/SessionRequest';
import SessionDetails from './pages/userSide/SessionDetails';
import ProposedRequests from './pages/userSide/ProposedRequests';
import Sessions from './pages/userSide/Sessions';
import VideoMeet from './pages/userSide/VideoMeet';
import TimeAccountPage from './pages/userSide/Account';
import TimePlans from './pages/userSide/TimePlans';
import PurchaseHistoryPage from './pages/userSide/PurchaseHistory';
import RatingModal from './components/RatingModal';
import TimePlansAdmin from './pages/adminSide/TimePlansAdmin';
import TransactionHistory from './pages/adminSide/TransactionHistory';

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
    <WebSocketProvider>
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
                        {/* <Route path="/read" element={<BlogRead/>} /> */}
                        <Route path="/blogs/:slug" element={<UserRoute><BlogRead /></UserRoute>} />
                        <Route path="/questions" element={<UserRoute><Questions /></UserRoute>} />
                        <Route path="/question/:pk" element={<UserRoute><QuestionRead /></UserRoute>} />
                        <Route path="/users" element={<UserRoute><UsersList /></UserRoute>} />
                        <Route path="/users/details/:pk" element={<UserRoute><UserDetails /></UserRoute>} />
                        <Route path="/tags" element={<UserRoute><Tags /></UserRoute>} />
                        <Route path="/chat" element={<UserRoute><Chat /></UserRoute>} />
                        <Route path="/requests" element={<UserRoute><SessionRequest /></UserRoute>} />
                        <Route path="/requests/:pk" element={<UserRoute><SessionDetails /></UserRoute>} />
                        <Route path="/schedules" element={<UserRoute><ProposedRequests /></UserRoute>} />
                        <Route path="/sessions" element={<UserRoute><Sessions /></UserRoute>} />
                        <Route path="/meeting-room/:meeting_id" element={<UserRoute><VideoMeet /></UserRoute>} />
                        <Route path="/account" element={<UserRoute><TimeAccountPage /></UserRoute>} />
                        <Route path="/time-plans" element={<UserRoute><TimePlans /></UserRoute>} />
                        <Route path="/purchase-history" element={<UserRoute><PurchaseHistoryPage /></UserRoute>} />
                        <Route path="/rate" element={<UserRoute><RatingModal /></UserRoute>} />

                        {/* <Route path="/shimmer" element={<Shimmer />} /> */}
                        {/* admin */}

                        <Route path="/admin" element={<LoginAdmin />} />
                        <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                        <Route path="/admin/users" element={<AdminRoute><UsersAdmin /></AdminRoute>} />
                        <Route path="/admin/user/details/:pk" element={<AdminRoute><UserDetailsAdmin /></AdminRoute>} />
                        <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
                        <Route path="/admin/report/details/:pk" element={<AdminRoute><ReportsDetails /></AdminRoute>} />
                        <Route path="/admin/tags" element={<AdminRoute><TagsAdmin /></AdminRoute>} />
                        <Route path="/admin/time-plans" element={<AdminRoute><TimePlansAdmin /></AdminRoute>} />
                        <Route path="/admin/transaction-history" element={<AdminRoute><TransactionHistory /></AdminRoute>} />

                    </Routes>
                    {/* </SearchContextProvider> */}
                </div>
            </Router>
        </NotificationProvider>
    </WebSocketProvider>
    </>
  )
}

export default App
