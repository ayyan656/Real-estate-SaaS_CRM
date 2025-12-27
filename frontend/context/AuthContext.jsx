// import React, { createContext, useContext, useState, useEffect } from "react";
// import {
//   loginUser,
//   registerUser,
//   logoutUser as logoutUserService,
// } from "../services/userService";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("estateflow_user");
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }

//     // Check for Google OAuth callback
//     const params = new URLSearchParams(window.location.hash.split("?")[1]);
//     const token = params.get("token");
//     const userData = params.get("user");

//     if (token && userData) {
//       try {
//         const user = JSON.parse(decodeURIComponent(userData));
//         console.log("Google OAuth User Data:", user);
//         console.log("Avatar URL:", user.avatar);
//         setUser(user);
//         localStorage.setItem("estateflow_user", JSON.stringify(user));
//         localStorage.setItem("authToken", token);
//         // Clean up URL
//         window.history.replaceState(
//           {},
//           document.title,
//           window.location.pathname
//         );
//       } catch (err) {
//         console.error("Error parsing OAuth callback:", err);
//       }
//     }

//     setIsLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     try {
//       setError(null);
//       const response = await loginUser({ email, password });
//       setUser(response.user);
//       localStorage.setItem("estateflow_user", JSON.stringify(response.user));
//       localStorage.setItem("authToken", response.token);
//       return response;
//     } catch (err) {
//       const errorMsg = err.message || "Login failed";
//       setError(errorMsg);
//       throw err;
//     }
//   };

//   const register = async (name, email, password, phone = "") => {
//     try {
//       setError(null);
//       const response = await registerUser({ name, email, password, phone });
//       setUser(response.user);
//       localStorage.setItem("estateflow_user", JSON.stringify(response.user));
//       localStorage.setItem("authToken", response.token);
//       return response;
//     } catch (err) {
//       const errorMsg = err.message || "Registration failed";
//       setError(errorMsg);
//       throw err;
//     }
//   };

//   const googleLogin = async () => {
//     //redirect to Google OAuth endpoint
//     window.location.href = `${
//       import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
//     }/auth/google`;
//   };

//   const logout = () => {
//     logoutUserService();
//     setUser(null);
//     localStorage.removeItem("estateflow_user");
//   };

//   return (
//     <AuthContext.Provider
//       value={{ user, isLoading, error, login, register, googleLogin, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // You must install this: npm install jwt-decode
import {
  loginUser,
  registerUser,
  logoutUser as logoutUserService,
} from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      // 1. Try to get token from Local Storage first
      let token = localStorage.getItem("authToken");
      let storedUser = localStorage.getItem("estateflow_user");

      // 2. Check if we are coming from Google Redirect
      // Your backend sends: /#/dashboard?token=xyz
      // window.location.hash looks like: "#/dashboard?token=xyz"
      if (!token && window.location.hash.includes("token=")) {
        try {
          // Extract the query string part from the hash
          const hashString = window.location.hash; 
          // Split at '?' to get "token=xyz..."
          const queryString = hashString.split("?")[1]; 
          const urlParams = new URLSearchParams(queryString);
          const urlToken = urlParams.get("token");

          if (urlToken) {
            token = urlToken;
            
            // Decode the user data FROM the token (since backend put it there)
            const decoded = jwtDecode(token);
            
            // Construct the user object based on your JWT payload structure
            const userObj = {
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role,
              avatar: decoded.avatar
            };

            // Save to storage immediately
            localStorage.setItem("authToken", token);
            localStorage.setItem("estateflow_user", JSON.stringify(userObj));
            storedUser = JSON.stringify(userObj);

            // Clean the URL so the token doesn't stay in the browser bar
            // Keeps "#/dashboard" but removes "?token=..."
            const cleanHash = hashString.split("?")[0];
            window.history.replaceState(null, "", window.location.pathname + cleanHash);
          }
        } catch (err) {
          console.error("Error parsing token from URL:", err);
        }
      }

      // 3. Set State
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Validation failed or no token
        localStorage.removeItem("authToken");
        localStorage.removeItem("estateflow_user");
        setUser(null);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await loginUser({ email, password });
      
      // Ensure we save the user and token EXACTLY how the useEffect expects it
      setUser(response.user);
      localStorage.setItem("estateflow_user", JSON.stringify(response.user));
      // Ensure your backend response uses 'token' or 'access_token'
      localStorage.setItem("authToken", response.token); 
      
      return response;
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const register = async (name, email, password, phone = "") => {
    try {
      setError(null);
      const response = await registerUser({ name, email, password, phone });
      
      setUser(response.user);
      localStorage.setItem("estateflow_user", JSON.stringify(response.user));
      localStorage.setItem("authToken", response.token);
      
      return response;
    } catch (err) {
      const errorMsg = err.message || "Registration failed";
      setError(errorMsg);
      throw err;
    }
  };

  const googleLogin = () => {
    // Use the ENV variable, fallback to localhost for safety
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    logoutUserService();
    setUser(null);
    localStorage.removeItem("estateflow_user");
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, register, googleLogin, logout }}
    >
      {/* Important: Do not render children until we are done checking auth */}
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
