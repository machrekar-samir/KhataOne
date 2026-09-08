import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

export default function Login() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // EMAIL LOGIN
  const login = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      navigate("/overview");
    } catch (err) {
      console.error("Login Error:", err.code);

      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/user-not-found") {
        setError("User not found. Please create an account.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const googleLogin = async () => {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);

      navigate("/overview");
    } catch (err) {
      console.error("Google Login Error:", err.code);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Google login popup was closed.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This website domain is not authorized.");
      } else {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);

      setSuccess(
        "Password reset link sent! Please check your email inbox."
      );
    } catch (err) {
      console.error("Password Reset Error:", err.code);

      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Unable to send reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f0ec] p-3 md:p-5 lg:p-8">
      <div className="grid min-h-[calc(100vh-40px)] w-full max-w-[1530px] overflow-hidden rounded-[22px] bg-white shadow-[0_20px_60px_rgba(50,25,20,.15)] lg:grid-cols-[48%_52%]">

        {/* LEFT SIDE */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#7b1725] via-[#65101c] to-[#4b0911] px-[6%] py-[5%] text-white lg:block">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-[#f8f6f2] font-serif text-[23px] font-bold text-[#681421]">
              K1
            </div>

            <div>
              <h1 className="text-[27px] font-bold">
                KhataOne
              </h1>

              <p className="text-[14px] text-white/80">
                Recover it smarter
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="mt-[7vh]">
            <h2 className="max-w-[400px] font-serif text-[35px] font-bold leading-[1.2]">
              Simple.
              <br />
              Powerful.
              <br />
              For Your Business.
            </h2>

            <p className="mt-4 max-w-[390px] text-[16px] leading-7 text-white/80">
              Manage customers, track payments and never miss a collection
              again.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Track dues effortlessly",
                "Stay organized",
                "Grow your business",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-[16px]"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-bold text-[#741421]">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-10 left-0 w-full text-center">
            <p className="font-serif text-lg italic text-white/80">
              KhataOne
            </p>

            <p className="text-xs text-white/60">
              A smarter way to grow ✦
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="flex min-h-[calc(100vh-24px)] flex-col bg-[#fbfaf8] px-6 py-7 sm:px-12 lg:min-h-0 lg:px-[9%]">

          {/* Signup Link */}
          <div className="text-center text-[14px] text-[#667085]">
            Don't have an account?

            <Link
              to="/signup"
              className="ml-2 font-bold text-[#741421]"
            >
              Sign Up
            </Link>
          </div>

          {/* Form Area */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[500px]">

              {/* Heading */}
              <div className="mb-6">
                <h2 className="font-serif text-[38px] font-bold text-[#202938]">
                  Welcome Back 👋
                </h2>

                <p className="mt-2 text-[16px] text-[#697586]">
                  Login to your KhataOne account
                </p>
              </div>

              <form onSubmit={login} className="space-y-3">

                {/* ERROR MESSAGE */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* SUCCESS MESSAGE */}
                {success && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {success}
                  </div>
                )}

                {/* EMAIL */}
                <div className="flex h-[56px] items-center rounded-xl border border-[#ddd8d2] bg-white px-5 shadow-sm">
                  <span className="mr-3 text-[#697586]">
                    ✉
                  </span>

                  <input
                    required
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    className="h-full w-full bg-transparent text-[15px] outline-none"
                  />
                </div>

                {/* PASSWORD */}
                <div className="flex h-[56px] items-center rounded-xl border border-[#ddd8d2] bg-white px-5 shadow-sm">
                  <span className="mr-3">
                    🔒
                  </span>

                  <input
                    required
                    type={show ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-full w-full bg-transparent text-[15px] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="text-[#697586]"
                  >
                    {show ? "👁" : "◉"}
                  </button>
                </div>

                {/* REMEMBER + FORGOT */}
                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 text-[14px] text-[#596473]">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 accent-[#7b1825]"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={forgotPassword}
                    disabled={resetLoading}
                    className="text-[14px] font-medium text-[#741421] hover:underline disabled:opacity-50"
                  >
                    {resetLoading
                      ? "Sending..."
                      : "Forgot password?"}
                  </button>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-[58px] w-full rounded-xl bg-gradient-to-r from-[#941f2d] to-[#76101e] text-[16px] font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Login →"}
                </button>

                {/* DIVIDER */}
                <div className="flex items-center gap-4 py-3">
                  <div className="h-px flex-1 bg-[#e5e1dc]" />

                  <span className="text-xs text-[#697586]">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-[#e5e1dc]" />
                </div>

                {/* GOOGLE LOGIN */}
                <button
                  type="button"
                  onClick={googleLogin}
                  disabled={googleLoading}
                  className="h-[56px] w-full rounded-xl border border-[#ddd8d2] bg-white text-[16px] font-medium text-[#344054] shadow-sm transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="mr-3 text-xl font-bold text-[#4285f4]">
                    G
                  </span>

                  {googleLoading
                    ? "Connecting..."
                    : "Continue with Google"}
                </button>
              </form>
            </div>
          </div>

          {/* SECURITY */}
          <div className="flex justify-center pt-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f2efeb] text-[#741421]">
                ♢
              </div>

              <div>
                <p className="text-[14px] font-medium text-[#596473]">
                  Your data is safe with us
                </p>

                <p className="text-xs text-[#8b929d]">
                  Secure · Private · Always yours
                </p>
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}