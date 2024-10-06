// src/pages/EditProject.js
import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  padding: 20px;
  background-color: #fff7eb;
  min-height: calc(100vh - 60px); /* Adjust if you have a fixed header */
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const FormWrapper = styled.div`
  background-color: #ff5757;
  padding: 40px;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  color: #fff7eb;
  text-align: center;
  margin-bottom: 20px;
`;

const FormSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #fff7eb;
  margin-bottom: 15px;
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

const MultiSelect = styled.select`
  padding: 10px;
  border: none;
  border-radius: 5px;
  width: 100%;
  height: 100px;
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
  margin-right: 10px;

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

const EditProject = () => {
  const { projectDetails, fetchProjectById, updateProject } = useContext(ProjectContext);
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState({
    title: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [requiredRoles, setRequiredRoles] = useState({});
  const [availableRoles, setAvailableRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');

  useEffect(() => {
    const getProject = async () => {
      try {
        await fetchProjectById(projectId);

        // Set project data
        setProjectData({
          title: projectDetails.title || '',
        });

        // Fetch available roles for the project
        const rolesResponse = await axios.get(
          `http://localhost:5000/api/projects/${projectId}/roles`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setAvailableRoles(rolesResponse.data.roles.map((role) => role.name));

        // Fetch required roles for actions
        const requiredRolesResponse = await axios.get(
          `http://localhost:5000/api/projects/${projectId}/required-roles`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setRequiredRoles(requiredRolesResponse.data.requiredRoles || {});
      } catch (err) {
        setError('Error fetching project details.');
      }
    };

    getProject();
  }, [fetchProjectById, projectId, projectDetails.title]);

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
      await updateProject(projectId, projectData);
      // Optionally, show a success message
      // navigate(`/projects/${projectId}`);
    } catch (err) {
      setError('Error updating project.');
    }
  };

  const handleRequiredRolesChange = (action, selectedRoles) => {
    setRequiredRoles((prevRoles) => ({
      ...prevRoles,
      [action]: selectedRoles,
    }));
  };

  const updateRequiredRolesAPI = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/required-roles`,
        { requiredRoles },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Success message or further actions
    } catch (err) {
      setError('Error updating required roles.');
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName) return;
    try {
      // Send request to backend to add role
      const response = await axios.post(
        `http://localhost:5000/api/projects/${projectId}/roles`,
        { name: newRoleName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Update available roles
      setAvailableRoles((prevRoles) => [...prevRoles, response.data.role.name]);
      // Clear input
      setNewRoleName('');
    } catch (err) {
      setError('Error adding role.');
    }
  };

  if (!projectDetails) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <FormWrapper>
        <FormTitle>Edit Project</FormTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {/* Project Details Section */}
        <FormSection>
          <SectionTitle>Project Details</SectionTitle>
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
            <SubmitButton type="submit">Save Changes</SubmitButton>
          </Form>
        </FormSection>

        {/* Roles Management Section */}
        <FormSection>
          <SectionTitle>Roles Management</SectionTitle>
          <FormGroup>
            <Label>Add New Role</Label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Role name"
                style={{ marginRight: '10px' }}
              />
              <SubmitButton type="button" onClick={handleAddRole}>
                Add Role
              </SubmitButton>
            </div>
          </FormGroup>
        </FormSection>

        {/* Required Roles Section */}
        <FormSection>
          <SectionTitle>Required Roles for Actions</SectionTitle>
          {['viewProject', 'editProject', 'deleteProject'].map((action) => (
            <FormGroup key={action}>
              <Label>{action}</Label>
              <MultiSelect
                multiple
                value={requiredRoles[action] || []}
                onChange={(e) => {
                  const options = e.target.options;
                  const selectedRoles = [];
                  for (let i = 0; i < options.length; i++) {
                    if (options[i].selected) {
                      selectedRoles.push(options[i].value);
                    }
                  }
                  handleRequiredRolesChange(action, selectedRoles);
                }}
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </MultiSelect>
            </FormGroup>
          ))}
          <SubmitButton type="button" onClick={updateRequiredRolesAPI}>
            Update Required Roles
          </SubmitButton>
        </FormSection>
      </FormWrapper>
    </Container>
  );
};

export default EditProject;
