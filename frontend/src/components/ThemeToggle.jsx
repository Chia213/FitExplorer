import { useState } from "react";
import { FaMoon, FaSun, FaPalette, FaChevronDown } from "react-icons/fa";
import { useTheme } from "../hooks/useTheme";

function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, premiumTheme, changePremiumTheme, premiumThemes, unlockedThemes, isAdmin } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Get fitness-focused themes
  const fitnessThemes = [
    'gymDark', 'powerLifter', 'cardio', 'zen', 'neonGym', 
    'steel', 'protein', 'midnightGym', 'energy', 'recovery'
  ];

  const handleThemeChange = async (themeKey) => {
    const success = await changePremiumTheme(themeKey);
    if (success) {
      setIsOpen(false);
    }
  };

  const canAccessTheme = (themeKey) => {
    return isAdmin || unlockedThemes.includes(themeKey) || themeKey === 'default';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main toggle button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-md transition-colors ${
            theme === "dark"
              ? "bg-slate-700 text-yellow-300 hover:bg-slate-600"
              : "bg-slate-100 text-slate-800 hover:bg-slate-200"
          }`}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>

        {/* Premium theme selector */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1 p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Select premium theme"
          >
            <FaPalette size={16} />
            <FaChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Fitness Themes
                </h3>
                
                {/* Fitness themes grid */}
                <div className="grid grid-cols-2 gap-2">
                  {fitnessThemes.map((themeKey) => {
                    const themeData = premiumThemes[themeKey];
                    const isUnlocked = canAccessTheme(themeKey);
                    const isActive = premiumTheme === themeKey;
                    
                    return (
                      <button
                        key={themeKey}
                        onClick={() => isUnlocked && handleThemeChange(themeKey)}
                        disabled={!isUnlocked}
                        className={`p-3 rounded-lg text-left transition-all ${
                          isActive 
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                        } ${
                          !isUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: themeData.primary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: themeData.secondary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: themeData.accent }}
                          />
                        </div>
                        <div className="text-xs font-medium text-slate-900 dark:text-white">
                          {themeData.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {themeData.description}
                        </div>
                        {!isUnlocked && (
                          <div className="text-xs text-red-500 mt-1">
                            🔒 Premium
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Default theme option */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleThemeChange('default')}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      premiumTheme === 'default' 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: premiumThemes.default.primary }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: premiumThemes.default.secondary }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: premiumThemes.default.accent }}
                      />
                    </div>
                    <div className="text-xs font-medium text-slate-900 dark:text-white">
                      {premiumThemes.default.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {premiumThemes.default.description}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default ThemeToggle;
