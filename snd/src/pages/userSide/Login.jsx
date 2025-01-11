import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import loginImage from '../../assets/Images/login_image.jpg'
import { auth, loginUser } from "../../api";
import { useNavigate } from 'react-router-dom';
import GoogleAuth from "../../components/GoogleAuth";
import {useAuthStore} from "../../store/useAuthStore";
import { useNotifications } from "../../components/NotificationContext";
import { notificationHandshake } from "../../wsApi";
import { WebSocketManager, wsManager } from "../../websocketManager";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();
  const { isAuthenticated,setAuthStatus  } = useAuthStore();
  const { connectNotificationSocket } = useNotifications();
  
  useEffect(() => {
        if (isAuthenticated) {
          navigate('/home');
        }
      
      setLoading(false);
  
  }, [isAuthenticated,navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await loginUser(formData);
      console.log("data is...",response.data)
      if (response.access_token && response.refresh_token) {
        // Initialize notification handler first
        const notificationHandler = {
          addNotification: (notification) => {
            // Add notification to UI state
            setError(`New message from ${notification.sender}: ${notification.message}`);
          },
          removeNotification: (notificationId) => {
            // Remove notification from UI state
          },
          markAsRead: async (senderId) => {
            try {
              await markMessagesAsRead(senderId);
            } catch (error) {
              console.error('Error marking as read:', error);
            }
          }
        };

        // Initialize WebSocket manager with handler
        const wsManager = new WebSocketManager(notificationHandler);
        
        // Now connect WebSocket
        try {
          const res = await notificationHandshake(response.user.id);
          await wsManager.connect(res);
        } catch (error) {
          console.error("Failed to initialize notifications:", error);
        }
        
        setAuthStatus(true, response.user);
        navigate('/home');
      } else if (response.redirect === '/otp') {
        console.log("User inactive, redirecting to OTP page.");
        navigate('/otp');
      } else {
        setError('Tokens missing in response');
      }
    } catch (err) {
        if (err.status == 400){
            navigate('/otp')
        }
      console.log('Error during login:', err);
  
      if (err.detail === 'Invalid credentials') {
        setError('Invalid email or password');
      }else if (err.detail === 'User is blocked') {
        setError('User is blocked');
      }else if (err.detail === 'User is inactive. OTP has been resent.') {
        setError('User inactive. Check your email for the OTP.');
        navigate('/otp');
      } else {
        setError('An error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-[#2D2A37] text-white flex items-center justify-center">
      <div className="grid w-full max-w-[1100px] grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-2xl bg-[#1F1D24] shadow-xl">
        {/* Left Image Section */}
        <div className="hidden lg:block">
          <img
            src={loginImage}
            alt="Login"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Form Section */}
        <div className="p-8 lg:p-12">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Login</h1>
            </div>
            {/* Error message */}
            {error && <p className="text-red-500 text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="username"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-0 bg-[#2D2A37] p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-0 bg-[#2D2A37] p-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-md bg-[#6C5DD3] p-2 text-white hover:bg-[#5B4EC2] ${
                  loading ? "cursor-not-allowed opacity-75" : ""
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1F1D24] px-2 text-gray-400">or</span>
              </div>
            </div>

            {/* Google Login Button */}
            {/* <button className="w-full flex items-center justify-center rounded-md border border-gray-700 bg-transparent p-2 text-white hover:bg-[#2D2A37]">
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button> */}
                <GoogleAuth></GoogleAuth>
            {/* Sign-up Link */}
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="signup" className="text-[#6C5DD3] hover:underline">
                Sign up
              </a>
            </div>
            <div className="text-center text-sm">
              {" "}
              <a href="forget-password" className="text-[#6C5DD3] hover:underline">
                forget password
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
