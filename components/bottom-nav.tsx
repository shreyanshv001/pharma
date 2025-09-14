"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";

export default function ResponsiveNav() {
  const pathname = usePathname();
  const { user } = useUser();

  if (pathname.startsWith("/admin")) return null;

  const navItems = [
    { href: "/", icon: "ri-home-5-line", label: "Home" },
    { href: "/experiment", icon: "ri-flask-line", label: "Experiments" },
    { href: "/qa", icon: "ri-question-answer-line", label: "Q&A" },
    { href: "/profile", icon: "ri-user-line", label: "Profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/instrument");
    if (href === "/experiment") return pathname === "/experiment" || pathname.startsWith("/experiment/");
    if (href === "/profile") return pathname === "/profile" || pathname.startsWith("/profile/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Desktop Top Nav - Fixed */}
      <header className="hidden lg:flex mb-40 fixed top-0 left-0 w-full justify-between items-center px-8 py-4 bg-[#213040] border-b border-[#6286a930] shadow-md z-50">
        <div className="flex gap-8">
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 transition-colors duration-200 text-sm font-medium
                          ${isActive(item.href) ? "text-[#E7EDF4]" : "text-[#6286A9] hover:text-blue-400"}`}
            >
              <i className={`${item.icon} text-lg`}></i>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          {user ? (
            <Link href="/profile" className="flex items-center gap-2">
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-9 h-9 rounded-full border-2 border-[#38BBF6]"
              />
              <span className="text-sm font-medium text-[#E7EDF4]">
                {user.firstName || user.username}
              </span>
            </Link>
          ) : (
            <Link
              href="/profile"
              className={`flex items-center gap-2 transition-colors duration-200 text-sm font-medium
                          ${isActive("/profile") ? "text-[#E7EDF4]" : "text-[#6286A9] hover:text-blue-400"}`}
            >
              <i className="ri-user-line text-lg"></i>
              Profile
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="fixed lg:hidden bottom-0 border-t border-[#6286a930] left-0 w-full bg-[#101A23] text-[#6286A9] flex justify-around items-center py-4 shadow-lg z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center transition-colors duration-200
                        ${isActive(item.href) ? "text-[#E7EDF4]" : "hover:text-blue-400"}`}
          >
            {item.label === "Profile" && user ? (
              <>
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className={`w-8 h-8 rounded-full mb-1 border-2
                    ${isActive(item.href) ? "border-[#38BBF6]" : "border-transparent"}`}
                />
                <span className={`text-xs font-bold ${isActive(item.href) ? "text-[#E7EDF4]" : "text-[#6286A9]"}`}>
                  {user.firstName || user.username || "Profile"}
                </span>
              </>
            ) : (
              <>
                <i
                  className={`${item.icon} text-xl
                    ${isActive(item.href) ? "text-[#E7EDF4]" : ""}`}
                ></i>
                <span className={`text-xs ${isActive(item.href) ? "text-[#E7EDF4]" : ""}`}>
                  {item.label}
                </span>
              </>
            )}
          </Link>
        ))}
      </div>

    </>
  );
}
