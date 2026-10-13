import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { APP_ICON } from "../lib/assets";

const NAV = [
  { to: "/", label: "홈", icon: HomeIcon },
  { to: "/cases", label: "정책사례", icon: CasesIcon },
  { to: "/simulate", label: "시뮬레이션", icon: SimIcon },
  { to: "/my-policy", label: "나의 정책", icon: UserIcon },
  { to: "/learn", label: "정책학습", icon: BookIcon },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <NavLink to="/" className="flex items-center gap-2.5">
            <img
              src={APP_ICON}
              alt="정책의사결정자"
              className="h-9 w-9 object-contain drop-shadow-sm"
            />
            <div className="leading-tight">
              <p className="text-[11px] font-medium tracking-wide text-sky">
                POLICY DECISION MAKER
              </p>
              <h1 className="text-[15px] font-semibold text-navy">정책의사결정자</h1>
            </div>
          </NavLink>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-navy text-white"
                      : "text-muted hover:bg-slate-100 hover:text-navy"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-12">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-2 text-[11px] ${
                    isActive ? "text-navy" : "text-muted"
                  }`
                }
              >
                <Icon />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function CasesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function SimIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 19V9M12 19V5M19 19v-7" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2c1.5-3.2 4-4.7 7-4.7s5.5 1.5 7 4.7" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H20v16H8.5A2.5 2.5 0 0 0 6 21.5z" />
      <path d="M6 5.5v16" />
    </svg>
  );
}
