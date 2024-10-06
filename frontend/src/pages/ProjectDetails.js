// src/pages/ProjectDetails.js
import React, { useEffect, useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const ProjectDetails = () => {
  const { projectDetails, fetchProjectById, deleteProject } = useContext(ProjectContext);
  const { projectId } = useParams();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getProject = async () => {
      try {
        await fetchProjectById(projectId);
      } catch (err) {
        setError('Error fetching project details.');
      }
    };

    getProject();
  }, [fetchProjectById, projectId]);

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      navigate('/projects');
    } catch (err) {
      setError('Error deleting project.');
    }
  };

  if (!projectDetails) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <h2>Project Details</h2>
      {error && <p>{error}</p>}
      <h3>{projectDetails.title}</h3>
      <p>Reference: {projectDetails.reference}</p>
      {/* Display other project details as needed */}
      <Link to={`/projects/edit/${projectId}`}>
        <button>Edit Project</button>
      </Link>
      <button onClick={handleDelete}>Delete Project</button>
    </Container>
  );
};

export default ProjectDetails;
