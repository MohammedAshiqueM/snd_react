import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailVerification, resentOtp } from '../api';
import { getFromSession } from '../util';

const Otp = () => {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [showLoader, setShowLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Verifing to OTP Page');
  const [error, setError] = useState(null);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTime = localStorage.getItem('timeLeft');
    if (savedTime) {
      setTimeLeft(parseInt(savedTime));
    }

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timerRef.current);
          localStorage.removeItem('timeLeft');
          alert("OTP has expired. Please request a new one.");
          return 0;
        }
        localStorage.setItem('timeLeft', prev - 1);
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      // Move to next input if value is entered
      if (value && index < 4) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setShowLoader(true);
//     // Add your submit logic here
//     localStorage.removeItem('timeLeft');
//   };

  const handleResendOTP = async (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to resend OTP?')) {
      clearInterval(timerRef.current);
      setTimeLeft(300);
      localStorage.setItem('timeLeft', 300);
      startTimer();
      alert('OTP has been resent.');
    }
    setShowLoader(true);
    setLoaderMessage("resending otp")
    const email = getFromSession('email');
    const otp = otpValues.join('');
    const payload = { email, otp };

    try {
        const response = await resentOtp(payload);
        // setSuccess('User registered successfully!');
        // navigate('/home');
        console.log(response);
    } catch (err) {
        setError(err.detail || 'An error occurred during registration.');
        console.error(err);
        navigate('/login');
    } finally {
        setShowLoader(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowLoader(true);

    const email = getFromSession('email');
    const otp = otpValues.join('');
    const payload = { email, otp };

    try {
        console.log("paylod",payload)

        const response = await emailVerification(payload);
        // setSuccess('User registered successfully!');
        console.log(response);
        navigate('/home');
    } catch (err) {
        setError(err.detail || 'An error occurred during registration.');
        console.error(err);
    } finally {
        setShowLoader(false);
    }
};


  return (
    <div className="min-h-screen bg-gradient-to-r from-neutral-700 to-neutral-900 flex items-center justify-center">
      {showLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-36 h-36 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white bg-opacity-20 text-white text-sm font-bold px-3 py-1 rounded-full">
                {formatTime(timeLeft)}
              </div>
            </div>
            <p className="text-2xl text-white mt-8">{loaderMessage}</p>
            <p className="text-sm text-white opacity-80 mt-2">Please don't press back button</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md p-8">
        <div className="relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
            Time left: {formatTime(timeLeft)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-16 space-y-6">
          <h1 className="text-3xl text-white text-center font-bold">ENTER OTP</h1>
          
          <div className="flex justify-center gap-4">
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-12 text-center text-xl bg-gray-100 border-none rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              className="w-40 h-10 bg-gradient-to-r from-teal-400 to-gray-600 text-white rounded-md font-medium tracking-wider hover:opacity-90 transition-opacity"
            >
              CONFIRM
            </button>
            
            <button
              onClick={handleResendOTP}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Otp;