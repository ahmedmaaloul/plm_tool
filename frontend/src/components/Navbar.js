// src/components/Navbar.js
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
// ICONS
import { FaHome, FaTasks, FaSignOutAlt, FaUser, FaBoxOpen, FaCubes, FaUsers, FaProjectDiagram, FaList, FaWarehouse, FaClipboardList, FaLock, FaSignInAlt } from "react-icons/fa";

// Navbar styling
const NavbarContainer = styled.nav`
  background-color: #4267B2;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  z-index: 100;
`;

const NavbarList = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
`;

const NavbarItem = styled.li`
  display: flex;
  align-items: center;
  margin-right: 8px;

  &:last-child {
    margin-right: 0;
  }
`;

const NavbarSpacer = styled.div`
  flex: 1;
`;

const IconButton = styled(Link)`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.25rem;
  padding: 7px 8px;
  margin: 0 2px;
  border-radius: 50%;
  transition: background 0.15s, color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    background: #3758a5;
    color: #e4eefd;
  }
`;

const Tooltip = styled.span`
  visibility: hidden;
  width: max-content;
  background-color: #222b;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 2px 10px;
  position: absolute;
  z-index: 111;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.82rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.18s;

  ${IconButton}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

const LogoutButton = styled.button`
  background: #fff;
  color: #4267B2;
  border: none;
  padding: 7px 10px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.22rem;
  margin-left: 2px;
  margin-right: 4px;
  display: flex;
  align-items: center;
  transition: background 0.18s, color 0.18s;

  &:hover {
    background: #e4eefd;
    color: #3758a5;
  }
`;

const Navbar = () => {
  const { user, userRoles, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const hasAccess = (accessRight) => {
    if (user && user.fullAccess) return true;
    return userRoles.some((role) => role.accessRights.includes(accessRight));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <NavbarContainer>
      <NavbarList>
        <NavbarItem>
          <IconButton to="/"><FaHome /><Tooltip>Home</Tooltip></IconButton>
        </NavbarItem>

        {user ? (
          <>
            {user.fullAccess && (
              <NavbarItem>
                <IconButton to="/admin-dashboard"><FaLock /><Tooltip>Admin</Tooltip></IconButton>
              </NavbarItem>
            )}
            <NavbarItem>
              <IconButton to="/my_tasks"><FaTasks /><Tooltip>My Tasks</Tooltip></IconButton>
            </NavbarItem>
            {hasAccess("Product") && (
              <NavbarItem>
                <IconButton to="/products"><FaBoxOpen /><Tooltip>Products</Tooltip></IconButton>
              </NavbarItem>
            )}
            {hasAccess("Reference") && (
              <NavbarItem>
                <IconButton to="/references"><FaClipboardList /><Tooltip>References</Tooltip></IconButton>
              </NavbarItem>
            )}
            {hasAccess("CustomersAndRequirements") && (
              <NavbarItem>
                <IconButton to="/customers"><FaUsers /><Tooltip>Customers</Tooltip></IconButton>
              </NavbarItem>
            )}
            {hasAccess("BOMAndSuppliers") && (
              <>
                <NavbarItem>
                  <IconButton to="/boms"><FaList /><Tooltip>BOMs</Tooltip></IconButton>
                </NavbarItem>
                <NavbarItem>
                  <IconButton to="/suppliers"><FaWarehouse /><Tooltip>Suppliers</Tooltip></IconButton>
                </NavbarItem>
                <NavbarItem>
                  <IconButton to="/resources"><FaCubes /><Tooltip>Resources</Tooltip></IconButton>
                </NavbarItem>
              </>
            )}
            {user.fullAccess && (
              <NavbarItem>
                <IconButton to="/projects"><FaProjectDiagram /><Tooltip>Projects</Tooltip></IconButton>
              </NavbarItem>
            )}
            <NavbarSpacer />
            <NavbarItem>
              <LogoutButton onClick={handleLogout} title="Logout">
                <FaSignOutAlt />
              </LogoutButton>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarSpacer />
            <NavbarItem>
              <IconButton to="/login"><FaSignInAlt /><Tooltip>Login</Tooltip></IconButton>
            </NavbarItem>
          </>
        )}
      </NavbarList>
    </NavbarContainer>
  );
};

export default Navbar;
