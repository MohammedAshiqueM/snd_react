import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { resetPassword } from "../api";
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const token = searchParams.get("token"); // Extract token from URL

    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const data = {token,password}
      const response = await resetPassword(data);
      console.log(response)
      setMessage(response.data.message);
      setError("");
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <h2 className="text-2xl mb-4">Reset Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-md">
        <label htmlFor="password" className="mb-2">
          New Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 p-2 rounded bg-gray-700 text-white"
        />

        <label htmlFor="confirm-password" className="mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4 p-2 rounded bg-gray-700 text-white"
        />

        <button type="submit" className="p-2 bg-blue-600 rounded hover:bg-blue-700">
          Reset Password
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {message && <p className="text-green-500 mt-4">{message}</p>}
    </div>
  );
};

export default ResetPassword;
