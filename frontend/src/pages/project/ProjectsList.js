// src/pages/ProjectsList.js
import React, { useEffect, useContext, useState } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 40px;
  background-color: #fff7eb;
  min-height: calc(100vh - 60px); /* Adjust if you have a fixed header */
`;

const Title = styled.h2`
  color: #ff5757;
  text-align: center;
  margin-bottom: 30px;
`;

const SearchBar = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 10px;
  margin: 0 auto 30px;
  display: block;
  border: 1px solid #ff5757;
  border-radius: 5px;
`;

const CreateButton = styled(Link)`
  display: inline-block;
  background-color: #ff5757;
  color: #fff7eb;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  margin-bottom: 30px;

  &:hover {
    background-color: #e04e4e;
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ProjectCard = styled.div`
  background-color: #fff;
  border: 1px solid #ff5757;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
`;

const ProjectTitle = styled.h3`
  color: #ff5757;
  margin-bottom: 10px;
`;

const ProjectReference = styled.p`
  color: #333;
  margin-bottom: 20px;
`;

const DetailsButton = styled(Link)`
  background-color: #ff5757;
  color: #fff7eb;
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    background-color: #e04e4e;
  }
`;

const NoProjects = styled.div`
  text-align: center;
  color: #ff5757;
  font-size: 1.2rem;
  margin-top: 50px;
`;

const ProjectsList = () => {
  const { projects, fetchProjects } = useContext(ProjectContext);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getProjects = async () => {
      try {
        await fetchProjects();
      } catch (err) {
        setError('Error fetching projects.');
      }
    };

    getProjects();
  }, [fetchProjects]);

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Title>Your Projects</Title>
      {error && <p>{error}</p>}

      <SearchBar
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div style={{ textAlign: 'center' }}>
        <CreateButton to="/projects/create">Create New Project</CreateButton>
      </div>

      {filteredProjects.length === 0 ? (
        <NoProjects>
          <p>No projects found.</p>
        </NoProjects>
      ) : (
        <ProjectsGrid>
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id}>
              <ProjectTitle>{project.title}</ProjectTitle>
              <ProjectReference>Reference: {project.reference?.code}</ProjectReference>
              <DetailsButton to={`/projects/${project._id}`}>
                View Details
              </DetailsButton>
            </ProjectCard>
          ))}
        </ProjectsGrid>
      )}
    </Container>
  );
};

export default ProjectsList;
