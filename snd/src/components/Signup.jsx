import { useState,useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import SignupImage from '../assets/Images/sign_up.jpg';
import { signupUser, resentOtp, auth } from '../api';
import { useNavigate } from 'react-router-dom';
import { saveToSession } from '../util';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticate = async () => {
      try {
        const res = await auth();
        console.log("Authentication result:", res);
        // setIsAuthenticated(res);
        if (res) {
          navigate('/home');
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
      setLoading(false);
    };
  
    authenticate();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) { 
    newErrors.firstName = 'First name is required.'; 
    } else if (formData.firstName.trim().length < 3) {
     newErrors.firstName = 'First name must be at least 3 letters.'; 
    } 
    if (!formData.lastName.trim()) {
     newErrors.lastName = 'Last name is required.'; 
    } else if (formData.lastName.trim().length < 3) {
     newErrors.lastName = 'Last name must be at least 3 letters.'; 
    }
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Valid email is required.';
    if (formData.password.length < 7)
      newErrors.password = 'Password must be at least 7 characters long.';
    if (!/[A-Z]/.test(formData.password))
      newErrors.password = 'Password must include at least one uppercase letter.';
    if (!/[a-z]/.test(formData.password))
      newErrors.password = 'Password must include at least one lowercase letter.';
    if (!/\d/.test(formData.password))
      newErrors.password = 'Password must include at least one number.';
    if (!/[!@#$%^&*]/.test(formData.password))
      newErrors.password = 'Password must include at least one special character.';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms.';
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await signupUser(formData);
      saveToSession('email', formData.email);
      setSuccess('User registered successfully!');
      navigate('/otp');
    } catch (err) {
      if (err.status === 409) {
        
          setErrors({ email: 'User with this email already exists.' });

      } else {
        setErrors({ form: err.detail });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2D2A37] p-4 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Logo */}
        <div className="mb-8">
          <span className="text-2xl font-bold">
            <span className="font-mono">&lt;/&gt;</span>Snd
          </span>
        </div>

        {/* Main Container */}
        <div className="overflow-hidden rounded-2xl bg-[#1F1D24] shadow-xl">
          <div className="grid md:grid-cols-2">
            {/* Form Section */}
            <div className="p-8">
              <h1 className="mb-6 text-center text-3xl font-bold">Sign Up</h1>
              <p className="mb-8 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="text-[#8B5CF6] hover:underline">
                  Log in
                </a>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg bg-[#2D2A37] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg bg-[#2D2A37] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-[#2D2A37] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-[#2D2A37] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-[#2D2A37] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 bg-[#2D2A37] text-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-400">
                    I agree to the{' '}
                    <a href="/terms" className="text-[#8B5CF6] hover:underline">
                      Terms & Conditions
                    </a>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-red-500">{errors.agreeToTerms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#8B5CF6] p-3 font-semibold text-white hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  disabled={loading}
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>

                {errors.form && <p className="mt-3 text-center text-red-500">{errors.form}</p>}
                {success && <p className="mt-3 text-center text-green-500">{success}</p>}
              </form>
            </div>

            {/* Image Section */}
            <div className="hidden md:block">
              <img
                src={SignupImage}
                alt="Sign up"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
