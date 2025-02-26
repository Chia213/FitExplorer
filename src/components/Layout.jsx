import { useTheme } from "../hooks/useTheme";

function Layout({ children }) {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${
      theme === "dark" 
        ? "bg-gray-900 text-white" 
        : "bg-gray-100 text-gray-900"
    }`}>
      {children}
    </div>
  );
}

export default Layout;