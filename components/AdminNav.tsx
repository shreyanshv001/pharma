"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminBottomNav() {
  const pathname = usePathname();
  const [active, setActive] = useState("instruments");

  // hide on /admin/login
  if (pathname === "/admin/login") return null;

  const navItems = [
    { id: "instruments", label: "Instruments", href: "/admin/dashboard" },
    { id: "experiments", label: "Experiments", href: "/admin/experiments" },
    { id: "link", label: "Link", href: "/admin/link" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#101A23] shadow-md border-t z-50">
      <div className="flex justify-around items-center py-3">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setActive(item.id)}
            className={`text-sm font-medium transition-colors ${
              active === item.id
                ? "text-white"
                : "text-gray-500 hover:text-blue-400"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
