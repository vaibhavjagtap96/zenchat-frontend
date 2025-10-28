import { useRef } from "react";
import { BsWhatsapp } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const userIdRef = useRef();
  const passwordRef = useRef();
  const { login, authError } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const user = {
      userId: userIdRef.current.value,
      password: passwordRef.current.value,
    };
    await login(user);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#0b141a]">
      <div className="w-[380px] bg-[#202c33] p-8 rounded-2xl shadow-lg flex flex-col items-center gap-6">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <BsWhatsapp className="text-[#25D366] text-4xl" />
          <h1 className="text-2xl font-semibold text-[#e9edef]">ZenChat</h1>
        </div>

        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-[#e9edef]">Sign In</h3>
          <p className="text-sm text-[#8696a0] mt-1">
            Continue to your account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-3 w-full"
        >
          {authError && (
            <p className="text-red-500 text-center text-sm">{authError}</p>
          )}

          <input
            type="text"
            ref={userIdRef}
            required
            placeholder="Email or Username"
            className="bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
          />

          <input
            type="password"
            ref={passwordRef}
            required
            placeholder="Password"
            className="bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
          />

          <button
            type="submit"
            className="bg-[#25D366] text-[#111b21] font-semibold py-2 rounded-lg hover:bg-[#20ba5b] hover:scale-[1.02] transition-transform"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="text-sm text-[#8696a0] text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-[#25D366] hover:underline font-medium"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
