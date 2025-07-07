import { Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);

    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="bg-solai-dark text-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-solai-green rounded-full"></div>
              <div className="w-2 h-2 bg-solai-pink rounded-full"></div>
              <div className="w-2 h-2 bg-solai-blue rounded-full"></div>
            </div>
            <a href="/" className="text-lg font-bold">
              SOLAI AI Assistant Services
            </a>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4 md:space-x-8">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8"></div>

            {/* Dark Mode Toggle - Always Visible */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-1 text-white hover:text-solai-blue transition-colors"
            >
              {isDarkMode ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                &nbsp;{isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Search</span>
          </div>
        </div>
      </nav>
    </header>
  );
}
