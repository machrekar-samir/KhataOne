import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const login = (e) => {
    e.preventDefault();
    navigate("/overview");
  };

  return (
    <main className="min-h-screen bg-[#f3f0ec] p-3 md:p-5 lg:p-8 flex items-center justify-center">
      <div className="grid w-full max-w-[1530px] min-h-[calc(100vh-40px)] lg:grid-cols-[48%_52%] overflow-hidden rounded-[22px] bg-white shadow-[0_20px_60px_rgba(50,25,20,.15)]">

        {/* LEFT */}
        <section className="relative hidden lg:block overflow-hidden bg-gradient-to-br from-[#7b1725] via-[#65101c] to-[#4b0911] px-[6%] py-[5%] text-white">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="grid h-[62px] w-[62px] place-items-center rounded-full bg-[#f8f6f2] font-serif text-[23px] font-bold text-[#681421]">
              K1
            </div>
            <div>
              <h1 className="text-[27px] font-bold">KhataOne</h1>
              <p className="text-[14px] text-white/80">Recover it smarter</p>
            </div>
          </div>

          {/* Main text */}
          <div className="mt-[7vh]">
            <h2 className="max-w-[400px] font-serif text-[35px] xl:text-[35px] font-bold leading-[1.2]">
              Simple.
              <br />
              Powerful.
              <br />
              For Your Business.
            </h2>

            <p className="mt-4 max-w-[390px] text-[16px] leading-7 text-white/80">
              Manage customers, track payments and never miss a collection again.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Track dues effortlessly",
                "Stay organized",
                "Grow your business",
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

       
          <div className="absolute bottom-10 left-0 w-full text-center">
            <p className="font-serif text-lg italic text-white/80">KhataOne</p>
            <p className="text-xs text-white/60">A smarter way to grow ✦</p>
          </div>
        </section>

        {/* RIGHT */}
        <section className="flex min-h-[calc(100vh-24px)] flex-col bg-[#fbfaf8] px-6 py-7 sm:px-12 lg:min-h-0 lg:px-[9%]">

          {/* Top */}
          <div className="text-center text-[14px] text-[#667085]">
            Don't have an account?
            <Link to="/signup" className="ml-2 font-bold text-[#741421]">
              Sign Up
            </Link>
          </div>

          {/* Form */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[500px]">

              <div className="mb-6">
                <h2 className="font-serif text-[38px] xl:text-[42px] font-bold text-[#202938]">
                  Welcome Back 👋
                </h2>
                <p className="mt-2 text-[16px] text-[#697586]">
                  Login to your KhataOne account
                </p>
              </div>

              <form onSubmit={login} className="space-y-3">

                <div className="flex h-[56px] items-center rounded-xl border border-[#ddd8d2] bg-white px-5 shadow-sm">
                  <span className="mr-3 text-[#697586]">✉</span>
                  <input
                    required
                    type="email"
                    placeholder="Email address"
                    className="h-full w-full bg-transparent text-[15px] outline-none"
                  />
                </div>

                <div className="flex h-[56px] items-center rounded-xl border border-[#ddd8d2] bg-white px-5 shadow-sm">
                  <span className="mr-3 text-[#697586]">♧</span>
                  <input
                    required
                    type={show ? "text" : "password"}
                    placeholder="Password"
                    className="h-full w-full bg-transparent text-[15px] outline-none"
                  />
                  <button type="button" onClick={() => setShow(!show)}>
                    {show ? "◉" : "◌"}
                  </button>
                </div>

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 text-[14px] text-[#596473]">
                    <input type="checkbox" defaultChecked className="h-5 w-5 accent-[#7b1825]" />
                    Remember me
                  </label>

                  <button type="button" className="text-[14px] font-medium text-[#741421]">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="h-[58px] w-full rounded-xl bg-gradient-to-r from-[#941f2d] to-[#76101e] text-[16px] font-semibold text-white shadow-lg"
                >
                  Login&nbsp;&nbsp; →
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
                  <span className="mr-3 text-xl font-bold text-[#4285f4]">G</span>
                  Continue with Google
                </button>
              </form>
            </div>
          </div>

          {/* Security */}
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