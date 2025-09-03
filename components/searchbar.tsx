"use client"

import { Input } from "./ui/input";
import { useState, useEffect } from "react";

interface SearchbarProps {
  onSearch: (searchTerm: string) => void;
}

export default function Searchbar({ onSearch }: SearchbarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  return (
    <div className="relative bg-[#E7EDF4] text-[#6286A9] py-1 rounded-lg">
      <i className="ri-search-line absolute text-xl left-3 top-1/2 transform -translate-y-1/2"></i>
      <Input
        placeholder="Search instruments"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 text-[#6286A9] placeholder:text-[#6286A9] border-0 outline-none focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none focus:shadow-none focus-visible:shadow-none"
      />
    </div>
  );
}