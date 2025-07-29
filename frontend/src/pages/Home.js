// src/pages/Home.js
import React from "react";
import styled, { keyframes } from "styled-components";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/nobg-PLM.png"; // Make sure this file exists

// Animation
const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
`;

// Styled Components
const HomeContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  height: calc(100vh - 60px);
  background-color: #f0f4ff;
  overflow: hidden;

  @media screen and (max-width: 768px) {
    flex-direction: column;
  }
`;

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
  flex-direction: column;
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
  color: #4267B2;
  text-align: center;
  margin-bottom: 20px;

  @media screen and (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SubText = styled.p`
  font-size: 1.5rem;
  color: #4267B2;
  text-align: center;
  max-width: 400px;
  line-height: 1.5;

  @media screen and (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const CreateButton = styled.button`
  background-color: #4267B2;
  color: #f0f4ff;
  border-radius: 50px;
  padding: 20px 40px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3758a5;
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
  const navigate = useNavigate();

  return (
    <HomeContainer>
      {/* Bubbles with updated gradient */}
      <Bubble
        size="400px"
        top="10%"
        left="5%"
        gradient="linear-gradient(135deg, #4267B2, #d0dbf7)"
      />
      <Bubble
        size="300px"
        top="50%"
        left="30%"
        gradient="linear-gradient(135deg, #d0dbf7, #4267B2)"
      />

      <LeftSection />

      <RightSection>
        <Logo src={LogoImage} alt="Logo" />
        <WelcomeText>Welcome to Bena!</WelcomeText>
        <SubText>Immerse yourself in seamless product life management.</SubText>
        <CreateButton onClick={() => navigate("/projects/create")}>
          <PlusIcon /> Get Started
        </CreateButton>
      </RightSection>
    </HomeContainer>
  );
};

export default Home;
