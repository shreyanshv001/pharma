"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  // Hide bottom navigation on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      icon: "ri-home-5-line",
      label: "Home",
    },
    {
      href: "/experiment",
      icon: "ri-flask-line",
      label: "Experiments",
    },
    {
      href: "/q&a",
      icon: "ri-question-answer-line",
      label: "Q&A",
    },
    {
      href: "/profile",
      icon: "ri-user-line",
      label: "Profile",
    },
  ];

  return (
    <footer className="fixed  bottom-0 border-t-2 border-t-[#6286a915] left-0 w-full bg-[#101A23] text-[#6286A9] flex justify-around items-center py-6 shadow-lg">
      {navItems.map((item) => {
        // For home tab, check if pathname is "/" or if it's an instrument detail page (single segment path that's not another nav item)
        const isHomeActive = item.href === "/" && (
          pathname === "/" || 
          (pathname.split('/').length === 2 && pathname.split('/')[1] !== "" && 
           !navItems.some(nav => nav.href !== "/" && pathname.startsWith(nav.href)))
        );
        
        // For other tabs, use exact match
        const isOtherActive = item.href !== "/" && pathname === item.href;
        
        const isActive = isHomeActive || isOtherActive;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center transition-colors duration-200 ${
              isActive
                ? "text-[#E7EDF4]"
                : "hover:text-blue-400"
            }`}
          >
            <span>
              <i className={`${item.icon} font- text-xl ${isActive ? "text-[#E7EDF4] font-bold " : ""}`}></i>
            </span>
            <span className={`text-xs ${isActive ? "text-[#E7EDF4] font-bold " : ""}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </footer>
  );
}
