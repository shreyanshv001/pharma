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
    { href: "/contact-us", icon: "ri-contacts-line", label: "Contact Us" },
    { href: "/about-us", icon: "ri-information-line", label: "About" }
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/instrument");
    if (href === "/experiment") return pathname === "/experiment" || pathname.startsWith("/experiment/");
    if (href === "/profile") return pathname === "/profile" || pathname.startsWith("/profile/");
    if (href === "/contact-us") return pathname === "/contact-us" || pathname.startsWith("/contact-us/");
    if (href === "/about-us") return pathname === "/about-us" || pathname.startsWith("/about-us/");
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Get active index for sliding animation
  const getActiveIndex = () => {
    const activeIndex = navItems.findIndex(item => isActive(item.href));
    return activeIndex !== -1 ? activeIndex : 0;
  };

  const activeIndex = getActiveIndex();
  const desktopActiveIndex = navItems.slice(0, 3).findIndex(item => isActive(item.href));
  const isProfileActiveDesktop = isActive("/profile");

  return (
    <>
      {/* Desktop Top Nav - Fixed */}
      <header className="hidden lg:flex mb-40 fixed top-0 left-0 w-full justify-between items-center px-8 py-5 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/30 shadow-2xl z-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>
        
        <div className="relative flex gap-8">
          {navItems.map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-500/20 scale-105"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 hover:scale-105"
              }`}
            >
              <i className={`${item.icon} text-lg transition-transform duration-300 ${
                isActive(item.href) ? "text-white" : "group-hover:scale-110"
              }`}></i>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="relative">
          {user ? (
            <Link 
              href="/profile" 
              className={`group flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive("/profile")
                  ? "bg-gradient-to-r from-slate-700 to-slate-600 shadow-lg shadow-slate-500/20 scale-105"
                  : "hover:bg-slate-800/60 hover:scale-105"
              }`}
            >
              <div className="relative">
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                    isActive("/profile") 
                      ? "border-blue-400 shadow-lg shadow-blue-500/25" 
                      : "border-slate-600 group-hover:border-blue-400"
                  }`}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isActive("/profile") ? "text-white" : "text-slate-300 group-hover:text-white"
              }`}>
                {user.firstName || user.username}
              </span>
            </Link>
          ) : (
            <Link
              href="/profile"
              className={`group flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${
                isActive("/profile")
                  ? "bg-gradient-to-r from-slate-700 to-slate-600 text-white shadow-lg shadow-slate-500/20 scale-105"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 hover:scale-105"
              }`}
            >
              <i className={`ri-user-line text-lg transition-transform duration-300 ${
                isActive("/profile") ? "text-white" : "group-hover:scale-110"
              }`}></i>
              <span className="font-medium">Profile</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="fixed lg:hidden bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/30 shadow-2xl z-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)] [background-size:16px_16px]"></div>
        
        <div className="relative flex justify-around items-center py-1 ">
          <div className="relative flex rounded-2xl p-2 w-full">
            {/* Sliding Background for Mobile */}
            <div 
              className="absolute top-2 bg-gradient-to-b from-slate-700 to-slate-600 rounded-xl shadow-lg transition-all duration-300 ease-in-out"
              style={{ 
                left: '8px',
                width: `calc(25% - 6px)`,
                height: '64px',
                transform: `translateX(calc(${activeIndex * 100}% + ${activeIndex * 4}px))`
              }}
            />
            
            {navItems.slice(0, 4).map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col items-center transition-all duration-300 px-2 py-2 rounded-xl flex-1 h-16 justify-center z-10"
              >
                {item.label === "Profile" && user ? (
                  <>
                    <div className="relative mb-1">
                      <img
                        src={user.imageUrl}
                        alt="Profile"
                        className={`w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                          isActive(item.href) 
                            ? "border-blue-400 shadow-lg shadow-blue-500/25" 
                            : "border-slate-600 group-hover:border-blue-400"
                        }`}
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Online status indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-slate-900 rounded-full"></div>
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isActive(item.href) ? "text-white" : "text-slate-300 group-hover:text-white"
                    }`}>
                      {user.firstName || user.username || "Profile"}
                    </span>
                  </>
                ) : (
                  <>
                    <i className={`${item.icon} text-xl mb-1 transition-all duration-300 ${
                      isActive(item.href) ? "text-white scale-110 " : "text-slate-300 group-hover:text-white group-hover:scale-110"
                    }`}></i>
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isActive(item.href) ? "text-white scale-105" : "text-slate-300 group-hover:text-white"
                    }`}>
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
