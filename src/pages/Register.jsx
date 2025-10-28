import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BsWhatsapp } from "react-icons/bs";

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
    <div className="w-full h-screen flex items-center justify-center bg-[#e5ddd5] dark:bg-[#111b21]">
      <div className="w-[400px] bg-white dark:bg-[#202c33] rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="text-[#25D366] text-3xl">
            <BsWhatsapp />
          </div>
          <h1 className="text-2xl font-semibold text-[#25D366]">ZenChat</h1>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-xl font-medium text-[#111b21] dark:text-white">
            Create Account
          </h3>
          <p className="text-gray-500 dark:text-gray-300">
            Join ZenChat and start connecting instantly
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleFormSubmit}
          className="w-full flex flex-col gap-3"
        >
          {authError && (
            <p className="text-red-500 text-center text-sm">{authError}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            ref={emailRef}
            required
            className="p-3 rounded-lg bg-[#f0f2f5] dark:bg-[#2a3942] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          />

          <input
            type="text"
            placeholder="Username"
            ref={usernameRef}
            required
            className="p-3 rounded-lg bg-[#f0f2f5] dark:bg-[#2a3942] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          />

          <input
            type="password"
            placeholder="Password"
            ref={passwordRef}
            required
            className="p-3 rounded-lg bg-[#f0f2f5] dark:bg-[#2a3942] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]"
          />

          <button
            type="submit"
            className="p-3 rounded-lg bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Sign Up
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#25D366] hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
