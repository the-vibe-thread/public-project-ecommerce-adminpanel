import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate, NavLink } from "react-router-dom";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaTags,
  FaImages,
  FaCog,
  FaSignOutAlt,
  FaTruck,
  FaUndoAlt,
  FaMapMarkerAlt,
} from "react-icons/fa"; // Added `FaImages`
import { api } from "../api";

const AdminNavbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Optional: Call backend to clear session/cookie
      await api.post("/api/admin/logout", {}, { withCredentials: true });

      // ✅ Remove ALL tokens/client-side auth data
      localStorage.removeItem("adminToken");
      sessionStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("lastPath");

      if (onLogout) onLogout(); // Update app state
    } catch (error) {
      console.error(
        "Logout failed:",
        error.response?.data?.message || "Unknown error"
      );
    }
  };

  const handleNavLinkClick = (path) => {
    sessionStorage.setItem("lastPath", path);
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="fixed-top shadow py-2"
    >
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          Admin Panel
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="ms-auto d-flex align-items-center">
            <Nav.Link
              as={NavLink}
              to="/products"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/products")}
            >
              <FaBoxOpen /> Products
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/orders"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/orders")}
            >
              <FaShoppingCart /> Orders
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/users"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/users")}
            >
              <FaUsers /> Users
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/discounts"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/discounts")}
            >
              <FaTags /> Discounts
            </Nav.Link>

            {/* ✅ New Carousel Management Link */}
            <Nav.Link
              as={NavLink}
              to="/carousel-management"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/carousel-management")}
            >
              <FaImages /> Carousel Management
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/shipping"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/shipping")}
            >
              <FaTruck />
              Shippingcost management
            </Nav.Link>

            <Nav.Link
              as={NavLink}
              to="/return"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/return")}
            >
              <FaUndoAlt />
              return/refund approvel
            </Nav.Link>
           {/* <Nav.Link
              as={NavLink}
              to="/pincode"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/pincode")}
            >
              <FaMapMarkerAlt /> Pincode Management
            </Nav.Link>*/}
            <Nav.Link
              as={NavLink}
              to="/feedback"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/feedback")}
            >
              User Feedback
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/blog"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/blog")}
            >
              blog
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/gallery"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/gallery")}
            >
              <FaImages /> Gallery {/* Added Gallery link */}
            </Nav.Link>
            <NavLink
              as={NavLink}
              to="/invoices"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/invoices")}
            >
              Invoice
            </NavLink>

            <Nav.Link
              as={NavLink}
              to="/settings"
              activeClassName="active"
              onClick={() => handleNavLinkClick("/settings")}
            >
              <FaCog /> Settings
            </Nav.Link>

            {/* Logout Button */}
            <Button
              variant="danger"
              className="ms-3 btn-sm"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <FaSignOutAlt /> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
