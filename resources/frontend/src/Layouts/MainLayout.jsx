import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Learner/Header";
import Footer from "../components/Footer";

const MainLayout = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = () => {
    try {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      console.log("Checking auth - User data:", userData);
      console.log("Checking auth - Token:", token);
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        console.log("Setting current user:", parsedUser);
        setCurrentUser(parsedUser);
      } else {
        console.log("No user data or token found");
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") {
        console.log("Storage changed:", e.key);
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/");
  };

  const isPublicRoute = () => {
    const publicPaths = ["/", "/login", "/register", "/formations", "/contact"];
    return publicPaths.includes(location.pathname);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        school="FMDD SCHOOL"
        isAuthenticated={!!currentUser}
        user={currentUser}
        onLogout={handleLogout}
        isPublicRoute={isPublicRoute()}
      />
      <main className="flex-grow">
        <Outlet />
      </main>
     <Footer/>
    </div>
  );
};

export default MainLayout;