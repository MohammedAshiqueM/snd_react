import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import loginImage from '../../assets/Images/admin_login.jpg'
import { auth, loginUser } from "../../api";
import { useNavigate } from 'react-router-dom';
import GoogleAuth from "../../components/GoogleAuth";
import useAuthStore from "../../store/useAuthStore";

export default function LoginAdmin() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();
  const { isAuthenticated,user } = useAuthStore();

  
  useEffect(() => {
        if (isAuthenticated) {
          navigate('/home');
        }
      
      setLoading(false);
  
  }, [navigate]);

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
        if (response.role === 'admin') {
            console.log("Admin login successful, tokens received:", response);
            navigate('/admin/dashboard'); // Redirect to admin-specific page
          } else {
            setError('Not authorized to access admin login.');
          }
      }else {
        setError('Tokens missing in response');
      }
    } catch (err) {
        if (err.status == 400){
            navigate('/otp')
        }
      console.log('Error during login:', err);
  
      if (err.detail === 'Invalid credentials') {
        setError('Invalid admin code or password (fields are case sensitive');
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
    <div className="min-h-screen bg-[#06315f] text-white flex items-center justify-center">
      <div className="grid w-full max-w-[750px] grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-2xl bg-[#112640] shadow-xl">
        {/* Left Image Section */}
        <div className="hidden lg:block">
          <img
            src={loginImage}
            alt="Login"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Form Section */}
        <div className="p-8 pt-20">
          <div className="mx-auto max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Admin window</h1>
            </div>
            {/* Error message */}
            {error && <p className="text-red-500 text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <input
                //   type="email"
                  name="username"
                  placeholder="Admin secret name"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-0 bg-[#1F4970] p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin access code"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border-0 bg-[#1F4970] p-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]"
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
                className={`w-full rounded-md bg-[#f28799] p-2 text-white hover:bg-[#f06e85]  ${
                  loading ? "cursor-not-allowed opacity-75" : ""
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
