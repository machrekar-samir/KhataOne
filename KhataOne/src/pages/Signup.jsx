import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";
export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const signup = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await updateProfile(userCredential.user, {
        displayName: form.name,
      });

      navigate("/overview");
    } catch (error) {
      console.error(error);

      const messages = {
        "auth/email-already-in-use": "This email is already registered",
        "auth/invalid-email": "Please enter a valid email address",
        "auth/weak-password": "Password is too weak",
      };

      setError(messages[error.code] || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f0ec] p-3 md:p-5 lg:p-8">
      <div className="grid min-h-[calc(100vh-40px)] w-full max-w-[1530px] overflow-hidden rounded-[22px] bg-white shadow-[0_20px_60px_rgba(50,25,20,.15)] lg:mx-auto lg:grid-cols-[48%_52%]">
        
        {/* LEFT SECTION */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#7b1725] via-[#65101c] to-[#4b0911] px-[6%] py-[5%] text-white lg:block">
          <div className="flex items-center gap-4">
            <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-[#f8f6f2] font-serif text-[23px] font-bold text-[#681421]">
              K1
            </div>

            <div>
              <h1 className="text-[27px] font-bold">KhataOne</h1>
              <p className="text-[14px] text-white/80">
                Recover it smarter
              </p>
            </div>
          </div>

          <div className="mt-[7vh]">
            <h2 className="max-w-[410px] font-serif text-[42px] font-bold leading-[1.2] xl:text-[48px]">
              Start Your
              <br />
              Business Journey
              <br />
              today!
            </h2>

            <p className="mt-4 max-w-[390px] text-[16px] leading-7 text-white/80">
              Create your account and manage your customers, payments and growth
              - all in one place.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Quick & easy setup",
                "No credit card required",
                "Trusted by small businesses",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[16px]">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-bold text-[#741421]">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-20 left-0 w-full text-center">
            <p className="font-serif text-lg italic text-white/80">
              Small Steps
            </p>
            <p className="text-xs text-white/60">
              Bigger Tomorrow - KhataOne
            </p>
          </div>
        </section>

        {/* RIGHT SECTION */}
        <section className="flex min-h-[calc(100vh-24px)] flex-col bg-[#fbfaf8] px-6 py-7 sm:px-12 lg:min-h-0 lg:px-[9%]">
          <div className="flex justify-center text-[14px] text-[#667085]">
            Already have an account?
            <Link to="/login" className="ml-2 font-bold text-[#741421]">
              Login
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-8">
            <div className="w-full max-w-[500px]">
              
              <div className="mb-6">
                <h2 className="font-serif text-[34px] font-bold text-[#202938] xl:text-[40px]">
                  Create Your Account
                </h2>
                <p className="mt-2 text-[16px] text-[#697586]">
                  Get started with KhataOne in seconds
                </p>
              </div>

              <form onSubmit={signup} className="space-y-3">

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* NAME */}
                <div className="flex h-[56px] items-center rounded-xl border border-[#ddd8d2] bg-white px-5 shadow-sm">
                  <UserRound
                    size={18}
                    strokeWidth={1.8}
                    className="mr-3 text-[#697586]"
                  />

                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Full Name"
                    className="h-full w-full bg-transparent text-[15px] outline-none"
                  />
                </div>

                {/* EMAIL */}
                <div className="flex h-[56px] items-center rounded-xl border border-[#ddd8d2] bg-white px-5 shadow-sm">
                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    className="mr-3 text-[#697586]"
                  />

                  <input
                    required
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email address"
                    className="h-full w-full bg-transparent text-[15px] outline-none"
                  />
                </div>

                {/* PASSWORD */}
                <div className="flex h-[56px] items-center rounded-xl border border-[#ddd8d2] bg-white px-5 shadow-sm">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    className="mr-3 text-[#697586]"
                  />

                  <input
                    required
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="h-full w-full bg-transparent text-[15px] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#697586]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="flex h-[56px] items-center rounded-xl border border-[#ddd8d2] bg-white px-5 shadow-sm">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    className="mr-3 text-[#697586]"
                  />

                  <input
                    required
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    className="h-full w-full bg-transparent text-[15px] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="text-[#697586]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {/* SUBMIT */}
                <button
                  disabled={loading}
                  type="submit"
                  className="h-[58px] w-full rounded-xl bg-gradient-to-r from-[#941f2d] to-[#76101e] text-[16px] font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account  →"}
                </button>

                <div className="flex items-center gap-4 py-3">
                  <div className="h-px flex-1 bg-[#e5e1dc]" />
                  <span className="text-xs text-[#697586]">OR</span>
                  <div className="h-px flex-1 bg-[#e5e1dc]" />
                </div>

                <button
                  type="button"
                  className="h-[56px] w-full rounded-xl border border-[#ddd8d2] bg-white text-[16px] font-medium text-[#344054] shadow-sm"
                >
                  <span className="mr-3 text-xl font-bold text-[#4285f4]">
                    G
                  </span>
                  Sign up with Google
                </button>

                <label className="flex items-center gap-2 pt-2 text-[12px] text-[#596473]">
                  <input
                    required
                    type="checkbox"
                    className="h-4 w-4 accent-[#7b1825]"
                  />

                  I agree to the{" "}
                  <button
                    type="button"
                    className="font-bold text-[#741421]"
                  >
                    Terms of Service
                  </button>
                  and{" "}
                  <button
                    type="button"
                    className="font-bold text-[#741421]"
                  >
                    Privacy Policy
                  </button>
                </label>
              </form>
            </div>
          </div>

          <div className="flex justify-center pt-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f2efeb] text-[#741421]">
                <ShieldCheck size={20} />
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