// src/pages/Home.js
import React from "react";
import styled from "styled-components";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LogoImage from "../assets/logo.png"; // Ensure you have a logo image in assets folder

const HomeContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 60px); /* Subtract navbar height */
  background-color: #fff7eb;

  @media screen and (max-width: 768px) {
    flex-direction: column;
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
  background-color: #fff7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CreateButton = styled.button`
  background-color: #ff5757;
  color: #fff7eb;
  border-radius: 50px;
  padding: 20px 40px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
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
  width: 150px;
  height: auto;
  margin-bottom: 20px;

  @media screen and (max-width: 768px) {
    width: 100px;
  }
`;

const Home = () => {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate("/create-project"); // Ensure this route is defined in your app
  };

  return (
    <HomeContainer>
      <LeftSection>
        <Logo src={LogoImage} alt="Bena Logo" />
      </LeftSection>
      <RightSection>
        <CreateButton onClick={handleCreateProject}>
          <PlusIcon />
          Create a Project
        </CreateButton>
      </RightSection>
    </HomeContainer>
  );
};

export default Home;
