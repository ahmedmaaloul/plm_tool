// src/components/Navbar.js
import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaTimes,
  FaUser,
  FaTasks,
  FaProjectDiagram,
  FaUsers,
  FaSignOutAlt,
  FaBoxOpen, // Added FaBoxOpen icon for Products
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Nav = styled.nav`
  background: #ff5757;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const NavLogo = styled(Link)`
  color: #fff7eb;
  font-size: 1.5rem;
  font-weight: bold;
`;

const MobileIcon = styled.div`
  display: none;
  color: #fff7eb;

  @media screen and (max-width: 768px) {
    display: block;
    font-size: 1.8rem;
    cursor: pointer;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    background: #ff5757;
    width: 100%;
    height: calc(100vh - 60px);
    position: absolute;
    top: 60px;
    left: ${({ click }) => (click ? 0 : '-100%')};
    opacity: 1;
    transition: all 0.5s ease;
  }
`;

const NavItem = styled.li`
  height: 60px;

  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;

const NavLinks = styled(Link)`
  color: #fff7eb;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  height: 100%;

  &:hover {
    background: #fff7eb;
    color: #ff5757;
    transition: all 0.2s ease-in-out;
  }

  @media screen and (max-width: 768px) {
    justify-content: center;
    padding: 2rem;
    width: 100%;
    display: table;

    &:hover {
      background: #fff7eb;
      color: #ff5757;
      transition: all 0.2s ease-in-out;
    }
  }
`;

const LogoutButton = styled.button`
  background: none;
  color: #fff7eb;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  height: 100%;
  font-size: 1rem;

  &:hover {
    background: #fff7eb;
    color: #ff5757;
    transition: all 0.2s ease-in-out;
  }

  border: none;
  cursor: pointer;

  @media screen and (max-width: 768px) {
    justify-content: center;
    padding: 2rem;
    width: 100%;

    &:hover {
      background: #fff7eb;
      color: #ff5757;
      transition: all 0.2s ease-in-out;
    }
  }
`;

const Navbar = () => {
  const [click, setClick] = useState(false);
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Nav>
      <NavLogo to="/">Bena</NavLogo>
      <MobileIcon onClick={handleClick}>
        {click ? <FaTimes /> : <FaBars />}
      </MobileIcon>
      <NavMenu click={click}>
        <NavItem>
          <NavLinks to="/profile" onClick={closeMobileMenu}>
            <FaUser style={{ marginRight: '8px' }} />
            Profile
          </NavLinks>
        </NavItem>
        <NavItem>
          <NavLinks to="/tasks" onClick={closeMobileMenu}>
            <FaTasks style={{ marginRight: '8px' }} />
            Tasks
          </NavLinks>
        </NavItem>
        <NavItem>
          <NavLinks to="/projects" onClick={closeMobileMenu}>
            <FaProjectDiagram style={{ marginRight: '8px' }} />
            Projects
          </NavLinks>
        </NavItem>
        <NavItem>
          <NavLinks to="/customers" onClick={closeMobileMenu}>
            <FaUsers style={{ marginRight: '8px' }} />
            Customers
          </NavLinks>
        </NavItem>
        <NavItem>
          <NavLinks to="/products" onClick={closeMobileMenu}>
            <FaBoxOpen style={{ marginRight: '8px' }} />
            Products
          </NavLinks>
        </NavItem>
        {isAuthenticated && (
          <NavItem>
            <LogoutButton onClick={handleLogout}>
              <FaSignOutAlt style={{ marginRight: '8px' }} />
              Logout
            </LogoutButton>
          </NavItem>
        )}
      </NavMenu>
    </Nav>
  );
};

export default Navbar;
