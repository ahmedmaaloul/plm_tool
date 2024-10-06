// src/pages/CreateProject.js
import React, { useState, useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background-color: #fff7eb;
  min-height: calc(100vh - 60px); /* Adjust if you have a fixed header */
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormWrapper = styled.div`
  background-color: #ff5757;
  padding: 40px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  color: #fff7eb;
  text-align: center;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  color: #fff7eb;
  margin-bottom: 5px;
  font-weight: bold;
  display: block;
`;

const Input = styled.input`
  padding: 10px;
  border: none;
  border-radius: 5px;
  width: 100%;
`;

const SubmitButton = styled.button`
  background-color: #fff7eb;
  color: #ff5757;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;

  &:hover {
    background-color: #ffe6d1;
  }
`;

const ErrorMessage = styled.p`
  color: #ffd6d6;
  background-color: #ff5757;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
`;

const CreateProject = () => {
  const { createProject } = useContext(ProjectContext);
  const [projectData, setProjectData] = useState({
    title: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setProjectData({
      ...projectData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProject = await createProject(projectData);
      navigate(`/projects/edit/${newProject._id}`);
    } catch (err) {
      setError('Error creating project.');
    }
  };

  return (
    <Container>
      <FormWrapper>
        <FormTitle>Create New Project</FormTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={projectData.title}
              onChange={handleChange}
              required
            />
          </FormGroup>
          {/* Include other fields as necessary */}
          <SubmitButton type="submit">Create Project</SubmitButton>
        </Form>
      </FormWrapper>
    </Container>
  );
};

export default CreateProject;
