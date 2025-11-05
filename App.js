import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Dashboard from "./components/dashboard.jsx";
import Products from "./components/product.jsx";
import Orders from "./components/order.jsx";
import Discounts from "./components/discount.jsx";
import User from "./components/user.jsx";
import Setting from "./components/setting.jsx";
import Login from "./components/login.jsx";
import CreateProduct from "./components/createProduct.jsx";
import Sidebar from "./components/sidebar.jsx";
import EditProduct from "./components/editProduct.jsx";
import CarouselManagement from "./components/CarouselManagement.jsx";
import Shipping from "./components/shipping.jsx";
import ReturnRequests from "./components/Return.jsx";
import StockUpload from "./components/stockUpdate.jsx";
//import Pincode from "./components/pincode.jsx";
import Feedback from "./components/feedback.jsx";
import ScrollToTop from "./components/scrolltotop.js";
import Blog from "./components/blog.jsx";
import Gallary from "./components/Gallary.jsx";
import Invoice from "./components/Invoicebulk.jsx";

import { api } from "../src/api.js";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem("isAuthenticated") === "true"
  );
  const [loading, setLoading] = useState(!isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      const checkAuth = async () => {
        try {
          const { data } = await api.get("/api/admin/check-auth");
          setIsAuthenticated(data.isAuthenticated);

          if (data.isAuthenticated) {
            sessionStorage.setItem("isAuthenticated", "true");
          }
        } catch {
          setIsAuthenticated(false);
          sessionStorage.removeItem("isAuthenticated");
        } finally {
          setLoading(false);
        }
      };
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // This is the logout logic you should use everywhere
  const handleLogout = async () => {
    // Remove tokens
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    // Optionally: tell backend to clear cookies/session
    try {
      await api.post("/api/admin/logout");
    } catch (e) {}
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        Checking authentication...
      </div>
    );
  }

  return (
    <Router>
      {isAuthenticated ? (
        <ProtectedRoutes onLogout={handleLogout} />
      ) : (
        <PublicRoutes setIsAuthenticated={setIsAuthenticated} />
      )}
    </Router>
  );
}

function ProtectedRoutes({ onLogout }) {
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem("lastPath", location.pathname);
  }, [location.pathname]);

  const lastPath = sessionStorage.getItem("lastPath") || "/dashboard";

  return (
    <div className="d-flex">
      {/* Sidebar gets the onLogout prop */}
      <Sidebar onLogout={onLogout} />
      <div className="main-content w-100">
        <ScrollToTop />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/users" element={<User />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/create-product" element={<CreateProduct />} />
          <Route path="*" element={<Navigate to={lastPath} replace />} />
          <Route path="/edit-product/:slug" element={<EditProduct />} />
          <Route path="/carousel-management" element={<CarouselManagement />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/return" element={<ReturnRequests />} />
          <Route path="/upload-stock" element={<StockUpload />} />
          {/*<Route path="/pincode" element={<Pincode />} />*/}
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/gallery" element={<Gallary />} />
          <Route path="/invoices" element={<Invoice />} />
        </Routes>
      </div>
    </div>
  );
}

function PublicRoutes({ setIsAuthenticated }) {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login setIsAuthenticated={setIsAuthenticated} />}
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
