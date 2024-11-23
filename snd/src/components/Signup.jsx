import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import SignupImage from '../assets/Images/sign_up.jpg'
import { signupUser } from '../api'
import { useNavigate } from 'react-router-dom';
import { saveToSession } from '../util';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
        const response = await signupUser(formData);
        saveToSession('email',formData.email)
        setSuccess('User registered successfully!');
        console.log(response);
        navigate('/otp');

    } catch (err) {
        setError(err.detail || 'An error occurred during registration.');
        console.log(error)
    } finally {
        setLoading(false);
    }
    console.log('Form submitted:', formData)
  }

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
                <a href="/" className="text-[#8B5CF6] hover:underline">
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
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg bg-[#2D2A37] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                      required
                    />
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
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-[#2D2A37] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-[#2D2A37] p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 bg-[#2D2A37] text-[#8B5CF6] focus:ring-[#8B5CF6]"
                    required
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-400">
                    I agree to the{' '}
                    <a href="/terms" className="text-[#8B5CF6] hover:underline">
                      Terms & Conditions
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#8B5CF6] p-3 font-semibold text-white hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2"
                >
                  Create an account
                </button>
              </form>

              <div className="mt-4 text-center">
                <a href="/forgot-password" className="text-sm text-[#8B5CF6] hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Image Section */}
            <div className="hidden md:block">
              <img
                src={SignupImage}
                alt="Decorative signup illustration"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}