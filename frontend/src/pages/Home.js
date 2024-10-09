// src/pages/Home.js
import React from "react";
import styled, { keyframes } from "styled-components";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/logo.png"; // Ensure you have a logo image in assets folder

// Keyframes for bubble animation
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
`;

// Styled components
const HomeContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  height: calc(100vh - 60px); /* Subtract navbar height */
  background-color: #fff7eb;
  overflow: hidden;

  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
`;

// Large gradient bubble elements
const Bubble = styled.div`
  position: absolute;
  border-radius: 50%;
  opacity: 0.7;
  animation: ${float} 6s ease-in-out infinite;

  ${({ size, top, left, gradient }) => `
    width: ${size};
    height: ${size};
    top: ${top};
    left: ${left};
    background: ${gradient};
  `}

  @media screen and (max-width: 768px) {
    width: calc(${({ size }) => size} / 1.5);
    height: calc(${({ size }) => size} / 1.5);
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const WelcomeText = styled.h1`
  font-size: 3rem;
  color: #e30202;
  text-align: center;
  margin-bottom: 20px;

  @media screen and (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SubText = styled.p`
  font-size: 1.5rem;
  color: #e30202;
  text-align: center;
  max-width: 400px;
  line-height: 1.5;

  @media screen and (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const CreateButton = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  border-radius: 50px;
  padding: 20px 40px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e04e4e;
  }

  @media screen and (max-width: 768px) {
    padding: 15px 30px;
    font-size: 1rem;
  }
`;

const PlusIcon = styled(FaPlus)`
  margin-right: 10px;
  font-size: 1.5rem;
`;

const Logo = styled.img`
  width: 200px;
  height: auto;
  margin-bottom: 20px;

  @media screen and (max-width: 768px) {
    width: 150px;
  }
`;

const Home = () => {

  return (
    <HomeContainer>
      {/* Gradient bubbles */}
      <Bubble size="400px" top="10%" left="5%" gradient="linear-gradient(135deg, #ff5757, #ffd1d1)" />
      <Bubble size="300px" top="50%" left="30%" gradient="linear-gradient(135deg, #ffd1d1, #ff5757)" />

      <LeftSection>
      </LeftSection>

      <RightSection>
        <WelcomeText>Welcome to Bena!</WelcomeText>
        <SubText>Immerse yourself in seamless product life management.</SubText>

      </RightSection>
    </HomeContainer>
  );
};

export default Home;
