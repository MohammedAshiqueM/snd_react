import { useState } from "react";
import { forgetPassword } from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); 
      setMessage(""); 
      setError("");


      if (!email.trim()) {
        setError("Please enter your email");
        setLoading(false);
        return;
      }
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        setError("Please enter a valid email");
        setLoading(false);
        return;
      }

      const response = await forgetPassword(email);
      console.log(response.data.message)
      setMessage(response.data.message); 
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Request failed! Please enter a proper email.");
      setMessage("");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1f1f1f] text-white font-sans">
      <h2 className="text-2xl mb-8">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-[300px]">
        <label htmlFor="email" className="text-base mb-2">
          Enter your email:
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`w-full p-2 mb-4 border rounded-md bg-[#2d2d2d] text-white text-base ${
            error ? "border-red-500" : "border-[#333]"
          }`}
        />
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <button
          type="submit"
          className={`w-full p-2 text-white text-base rounded-md cursor-pointer transition-colors ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-[#7166ff] hover:bg-[#5c4eff]"
          }`}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-green-500">{message}</p>}
    </div>
  );
};

export default ForgotPassword;
