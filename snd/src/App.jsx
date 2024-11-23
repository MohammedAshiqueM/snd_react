import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login'
import SignUp from './components/Signup';
import Otp from './components/Otp';

function App() {
  
  return (
    <>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/otp" element={<Otp />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
