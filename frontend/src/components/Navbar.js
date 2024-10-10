// src/components/Navbar.js
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";

// Styled Components
const NavbarContainer = styled.nav`
  background-color: #ff5757;
  padding: 15px;
`;

const NavbarList = styled.ul`
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const NavbarItem = styled.li`
  margin: 0 15px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #fff7eb;
  font-size: 16px;
  font-weight: bold;
  &:hover {
    color: #ffd1d1;
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: #fff7eb;
  border: 2px solid #fff7eb;
  padding: 5px 15px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  &:hover {
    background-color: #ffd1d1;
    border-color: #ffd1d1;
    color: #ff5757;
  }
`;

// Navbar Component
const Navbar = () => {
  const { user, userRoles, logout } = useContext(AuthContext);
  const navigate = useNavigate(); // useNavigate for redirection after logout

  const hasAccess = (accessRight) => {
    if (user && user.fullAccess) return true; // Admins have full access
    return userRoles.some((role) => role.accessRights.includes(accessRight));
  };

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login after logout
  };

  return (
    <NavbarContainer>
      <NavbarList>
        <NavbarItem>
          <StyledLink to="/">Home</StyledLink>
        </NavbarItem>

        {user ? (
          <>
            {user.fullAccess && (
              <>
                <NavbarItem>
                  <StyledLink to="/admin-dashboard">Admin Dashboard</StyledLink>
                </NavbarItem>
                {/* Add other admin links */}
              </>
            )}
            <NavbarItem>
              <StyledLink to="/my_tasks">My Tasks</StyledLink>
            </NavbarItem>

            {hasAccess("Product") && (
              <NavbarItem>
                <StyledLink to="/products">Products</StyledLink>
              </NavbarItem>
            )}

            {hasAccess("CustomersAndRequirements") && (
              <NavbarItem>
                <StyledLink to="/customers">Customers</StyledLink>
              </NavbarItem>
            )}

            {hasAccess("BOMAndSuppliers") && (
              <NavbarItem>
                <StyledLink to="/boms">BOMs</StyledLink>
              </NavbarItem>
            )}
            {hasAccess("BOMAndSuppliers") && (
              <NavbarItem>
                <StyledLink to="/suppliers">Suppliers</StyledLink>
              </NavbarItem>
            )}
            {hasAccess("BOMAndSuppliers") && (
              <NavbarItem>
                <StyledLink to="/resources">Resources</StyledLink>
              </NavbarItem>
            )}


            {user.fullAccess && (
              <>
                <NavbarItem>
                  <StyledLink to="/projects">Projects</StyledLink>
                </NavbarItem>
                {/* Add other admin links */}
              </>
            )}

            <NavbarItem>
              <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem>
              <StyledLink to="/login">Login</StyledLink>
            </NavbarItem>
            {/* Add other public links if necessary */}
          </>
        )}
      </NavbarList>
    </NavbarContainer>
  );
};

export default Navbar;
