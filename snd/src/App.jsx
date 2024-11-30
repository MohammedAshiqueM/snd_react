import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login'
import SignUp from './components/Signup';
import Otp from './components/Otp';
import Home from './components/Home';
import {ProtectedRoute} from './protectedRoute';
import Launch from './components/Launch';
import ProfileHeader from './components/profile';
// import { initializeApp } from './auth';
import React, { useEffect } from 'react';
import ForgotPassword from './components/ForgetPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Launch />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/otp" element={<Otp />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProfileHeader />} />
            <Route path="/forget-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
