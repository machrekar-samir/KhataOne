import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { useTheme } from "../context/ThemeContext.jsx";
import LaptopMobileImg from "../assets/laptop-mobail-img.png";

import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  CircleDollarSign,
  Menu,
  Moon,
  Play,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react";

const features = [
  [Users, "Track Customers", "Keep all customer details in one place"],
  [Bell, "Automated Reminders", "Never miss a follow-up"],
  [BarChart3, "Easy Collection Tracking", "See what's pending and collected"],
  [Zap, "Grow Your Business", "More time for what matters"],
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#7b2633] text-white">
        <BookOpen size={20} strokeWidth={2} />
      </div>

      <span className="text-[21px] font-black tracking-[-.045em] text-[#151827]">
        KhataOne
      </span>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto flex w-full items-center justify-center lg:justify-end">
      <div className="absolute right-[7%] top-[-5px] h-[155px] w-[155px] rounded-full bg-[#f4ddd5] sm:h-[190px] sm:w-[190px]" />

      <div className="absolute left-[25%] top-[45px] h-[90px] w-[90px] rounded-full bg-[#f7e7e1]" />

      <div className="absolute right-[2%] top-[-15px] z-20 rotate-[6deg] font-serif text-[17px] italic leading-[1.05] text-[#722331] sm:text-[21px]">
        Your Business
        <br />
        Our Support <span>♥</span>
      </div>

      <img
        src={LaptopMobileImg}
        alt="KhataOne dashboard preview"
        className="relative z-10 block h-auto w-full max-w-[680px] object-contain"
      />
    </div>
  );
}

function FeatureCard({ Icon, title, text }) {
  return (
    <article className="text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[15px] bg-[#f9e8e5] text-[#7b2633]">
        <Icon size={25} strokeWidth={1.8} />
      </div>

      <h3 className="mt-3 text-[12px] font-black sm:text-[14px]">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-[170px] text-[9px] leading-4 text-[#6e6668] sm:text-[10px] sm:leading-5">
        {text}
      </p>
    </article>
  );
}

export default function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState(null);

  const getStarted = () => {
    setMenu(false);
    navigate(user ? "/overview" : "/signup");
  };

  const login = () => {
    setMenu(false);
    navigate(user ? "/overview" : "/login");
  };

  const faqs = [
    [
      "Is KhataOne free to start?",
      "Yes. You can create your account and start managing your business without a credit card.",
    ],
    [
      "Can I use KhataOne on mobile?",
      "Yes. KhataOne is responsive and works smoothly on mobile, tablet and desktop.",
    ],
    [
      "Is my business data safe?",
      "Your business data is stored securely and is available only to your authenticated account.",
    ],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fffaf5] text-[#151827]">
      {/* HEADER */}
      <header className="sticky top-0 z-[100] border-b border-[#eadfd8] bg-[#fffaf5]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1200px] items-center justify-between px-5 sm:h-[74px] sm:px-6 lg:px-0">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <a
              href="#features"
              className="text-[12px] font-medium text-[#50494b] hover:text-[#7b2633]"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-[12px] font-medium text-[#50494b] hover:text-[#7b2633]"
            >
              How It Works
            </a>

            <a
              href="#testimonials"
              className="text-[12px] font-medium text-[#50494b] hover:text-[#7b2633]"
            >
              Testimonials
            </a>

            <a
              href="#faq"
              className="text-[12px] font-medium text-[#50494b] hover:text-[#7b2633]"
            >
              FAQ
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full text-[#40393b] hover:bg-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={login}
              className="rounded-[13px] border border-[#7b2633] px-6 py-2.5 text-[12px] font-bold text-[#7b2633] hover:bg-[#faecea]"
            >
              {user ? "Dashboard" : "Login"}
            </button>

            <button
              onClick={getStarted}
              className="rounded-[13px] bg-[#7b2633] px-7 py-3 text-[12px] font-bold text-white shadow-[0_8px_22px_rgba(123,38,51,.18)] hover:bg-[#641d29]"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setMenu((v) => !v)}
            className="grid h-10 w-10 place-items-center text-[#7b2633] lg:hidden"
            aria-label="Open menu"
          >
            {menu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        {menu && (
          <div className="border-t border-[#eadfd8] bg-[#fffaf5] px-5 pb-5 pt-3 lg:hidden">
            {[
              ["Features", "#features"],
              ["How It Works", "#how-it-works"],
              ["Testimonials", "#testimonials"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="block rounded-xl px-3 py-3 text-[13px] font-medium"
              >
                {label}
              </a>
            ))}

            <div className="mt-3 flex gap-2">
              <button
                onClick={login}
                className="flex-1 rounded-xl border border-[#7b2633] py-3 text-xs font-bold text-[#7b2633]"
              >
                {user ? "Dashboard" : "Login"}
              </button>

              <button
                onClick={getStarted}
                className="flex-1 rounded-xl bg-[#7b2633] py-3 text-xs font-bold text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute left-[-120px] top-[190px] h-[220px] w-[220px] rounded-full bg-[#f7e3da]" />

        <div className="mx-auto grid max-w-[1200px] items-center px-5 pb-8 pt-9 sm:px-6 sm:pb-10 sm:pt-12 lg:min-h-[515px] lg:grid-cols-[.88fr_1.12fr] lg:px-0 lg:py-5">
          <div className="relative z-10 text-center lg:text-left">
            <div className="inline-flex rounded-full bg-[#fde9e7] px-4 py-2 text-[9px] font-bold text-[#7b2633] sm:text-[10px]">
              Simpler • Smarter • Faster
            </div>

            <h1 className="mx-auto mt-5 max-w-[570px] font-serif text-[30px] font-bold leading-[1.03] tracking-[-.035em] sm:text-[47px] lg:mx-0 lg:text-[58px]">
              Manage Collections
              <br />
              the{" "}
              <span className="text-[#7b2633]">
                Smarter Way
              </span>
            </h1>

            <div className="mx-auto mt-2 h-[3px] w-[95px] rotate-[-3deg] rounded-full bg-[#7b2633] lg:mx-0" />

            <p className="mx-auto mt-5 max-w-[500px] text-[13px] leading-6 text-[#5e585b] sm:text-[14px] lg:mx-0 lg:text-[15px] lg:leading-7">
              KhataOne helps you track customers, manage payments,
              send reminders and grow your business — all in one place.
            </p>

            <div className="mx-auto mt-6 flex w-full max-w-[390px] gap-2.5 sm:max-w-[450px] sm:gap-3 lg:mx-0 lg:max-w-none">
              <button
                onClick={getStarted}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[13px] bg-[#7b2633] px-3 py-3.5 text-[10px] font-bold text-white shadow-[0_10px_24px_rgba(123,38,51,.2)] hover:bg-[#641d29] sm:px-6 sm:text-[12px] lg:flex-none lg:px-7 lg:text-[13px]"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight size={14} />
              </button>

              <a
                href="#features"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-[13px] border border-[#7b2633] px-3 py-3.5 text-[10px] font-bold text-[#7b2633] hover:bg-[#faecea] sm:px-6 sm:text-[12px] lg:flex-none lg:px-7 lg:text-[13px]"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#7b2633] text-white">
                  <Play size={8} fill="currentColor" />
                </span>
                Watch Demo
              </a>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[8px] text-[#655e60] sm:gap-x-5 sm:text-[9px] lg:justify-start lg:text-[10px]">
              {[
                "No credit card required",
                "Easy to use",
                "Loved by businesses",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#7b2633] text-white">
                    <Check size={8} />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* SINGLE IMAGE */}
          <div className="relative z-10 mt-8 w-full lg:mt-0">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="border-y border-[#eadfd8] bg-white py-9 sm:py-11"
      >
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-x-3 gap-y-9 px-5 sm:grid-cols-4 sm:gap-5 lg:px-0">
          {features.map(([Icon, title, text]) => (
            <FeatureCard
              key={title}
              Icon={Icon}
              title={title}
              text={text}
            />
          ))}
        </div>
      </section>

     
      {/* TRUST */}
      <section
        id="testimonials"
        className="bg-[#fffaf7] px-5 py-12 sm:py-14"
      >
        <div className="mx-auto max-w-[950px] text-center">
          <div className="inline-flex rounded-full bg-[#fde9e7] px-4 py-2 text-[8px] font-bold uppercase tracking-[.18em] text-[#7b2633]">
            Trusted by Small Businesses
          </div>

          <h2 className="mt-4 font-serif text-[28px] font-bold leading-8 sm:text-[35px]">
            Built for Business Owners Like You
          </h2>

          <p className="mx-auto mt-3 max-w-[590px] text-[11px] leading-5 text-[#756c6f] sm:text-[13px]">
            From shopkeepers to wholesalers, KhataOne is helping
            businesses across India stay organized and get paid on time.
          </p>

          <div className="mx-auto mt-9 grid max-w-[800px] grid-cols-3">
            {[
              ["10,000+", "Happy Businesses", Users],
              ["95%", "Faster Collections", BarChart3],
              ["4.8/5", "User Satisfaction", CircleDollarSign],
            ].map(([value, label, Icon]) => (
              <div
                key={label}
                className="border-r border-[#ded5d0] px-2 last:border-r-0"
              >
                <Icon
                  size={15}
                  className="mx-auto mb-2 text-[#7b2633]"
                />

                <strong className="block font-serif text-[20px] font-bold text-[#7b2633] sm:text-[26px]">
                  {value}
                </strong>

                <span className="mt-1 block text-[7px] text-[#62595c] sm:text-[10px]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      {/* FOOTER */}
      <footer className="border-t border-[#eadfd8] bg-[#fffaf7] px-5 py-8">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-5 sm:flex-row">
          <Link to="/">
            <Logo />
          </Link>

          <div className="flex flex-wrap justify-center gap-5 text-[9px] text-[#62595c] sm:text-[10px]">
            <a href="#features" className="hover:text-[#7b2633]">
                Features
            </a>

           
            <a href="#faq" className="hover:text-[#7b2633]">
              FAQ
            </a>

            <button onClick={login} className="hover:text-[#7b2633]">
              {user ? "Dashboard" : "Login"}
            </button>

            <button onClick={getStarted} className="hover:text-[#7b2633]">
              Get Started
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-[#8a8183]">
          © {new Date().getFullYear()} KhataOne. Your Business. Our Smart Khata. Designed Machrekar Samir Sajan. All rights reserved.
        </p>
        
      </footer>
    </div>
  );
}