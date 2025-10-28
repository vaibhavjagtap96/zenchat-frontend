import { useRef } from "react";
import { BsWhatsapp } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const emailRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const { register, authError } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const user = {
      email: emailRef.current.value,
      username: usernameRef.current.value,
      password: passwordRef.current.value,
    };
    await register(user);
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
          <h3 className="text-lg font-medium text-[#e9edef]">Sign Up</h3>
          <p className="text-sm text-[#8696a0] mt-1">
            Create your ZenChat account
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
            type="email"
            ref={emailRef}
            required
            placeholder="Email"
            className="bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition-all"
          />

          <input
            type="text"
            ref={usernameRef}
            required
            placeholder="Username"
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
            Sign Up
          </button>
        </form>

        {/* Footer */}
        <div className="text-sm text-[#8696a0] text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#25D366] hover:underline font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
