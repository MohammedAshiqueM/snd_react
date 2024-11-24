import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login'
import SignUp from './components/Signup';
import Otp from './components/Otp';
import Home from './components/Home';
import {ProtectedRoute} from './protectedRoute';
import Launch from './components/Launch';

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
            
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
