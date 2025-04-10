import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const WelcomeContext = createContext();

export const useWelcome = () => useContext(WelcomeContext);

export const WelcomeProvider = ({ children }) => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to check JWT token and extract user data
  const getUserDataFromToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
      // Split the token and get the payload (second part)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      return { username: payload.sub };
    } catch (error) {
      return null;
    }
  };

  // Check login status on component mount and token changes
  useEffect(() => {
    const checkLoginStatus = () => {
      // Check for token
      const token = localStorage.getItem("access_token");
      if (!token) {
        setShowWelcomeModal(false);
        setUserData(null);
        setIsInitialized(true);
        return;
      }

      // Get user data from token
      const userData = getUserDataFromToken();
      if (!userData) {
        setShowWelcomeModal(false);
        setUserData(null);
        setIsInitialized(true);
        return;
      }

      setUserData(userData);

      // Check for "just logged in" flag
      const justLoggedIn = localStorage.getItem("justLoggedIn");

      if (justLoggedIn === "true") {
        // Clear the flag
        localStorage.removeItem("justLoggedIn");

        // Check if we should hide the welcome back modal
        const hideWelcomeBack =
          localStorage.getItem("hideWelcomeBack") === "true";

        if (!hideWelcomeBack) {
          // Check if this is the first login
          const isFirst = localStorage.getItem("isFirstLogin") === "true";
          if (isFirst) {
            localStorage.removeItem("isFirstLogin");
            setIsFirstLogin(true);
          } else {
            setIsFirstLogin(false);
          }

          setShowWelcomeModal(true);
        }
      }

      setIsInitialized(true);
    };

    // Run check when component mounts
    checkLoginStatus();

    // Setup listener for token changes
    window.addEventListener("storage", (e) => {
      if (e.key === "token") {
        checkLoginStatus();
      }
    });

    // Clean up storage event listener
    return () => {
      window.removeEventListener("storage", (e) => {
        if (e.key === "token") {
          checkLoginStatus();
        }
      });
    };
  }, []);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  // Manual trigger for the welcome modal (used from login handler)
  const triggerWelcomeModal = (isFirst = false) => {
    setIsFirstLogin(isFirst);
    setShowWelcomeModal(true);

    // Set user data if not already set
    if (!userData) {
      setUserData(getUserDataFromToken());
    }
  };

  return (
    <WelcomeContext.Provider
      value={{
        showWelcomeModal,
        closeWelcomeModal,
        triggerWelcomeModal,
        userData,
        isFirstLogin,
        isInitialized,
      }}
    >
      {children}
    </WelcomeContext.Provider>
  );
};

export default WelcomeContext;
